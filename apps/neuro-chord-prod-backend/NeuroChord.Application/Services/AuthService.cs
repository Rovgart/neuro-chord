using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using NeuroChord.Application.DTOs;
using NeuroChord.Application.Exceptions;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Application.Services;

public class AuthService : IAuthService
{
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly IDistributedCache _cache;
    private readonly IJwtService _jwtService;
    private readonly INeuroChordEmailService _neuroChordEmailService;
    private readonly ISecurityService _securityService;
    private readonly ISessionService _sessionService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserService _userService;

    public AuthService(
        ISessionService sessionService,
        IUserService userService,
        IJwtService jwtService,
        IUnitOfWork unitOfWork,
        IDistributedCache cache,
        INeuroChordEmailService neuroChordEmailService,
        IBackgroundJobService backgroundJobService,
        ISecurityService securityService)
    {
        _sessionService = sessionService;
        _userService = userService;
        _jwtService = jwtService;
        _unitOfWork = unitOfWork;
        _securityService = securityService;
        _neuroChordEmailService = neuroChordEmailService;
        _backgroundJobService = backgroundJobService;
        _cache = cache;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string ipAddress, string userAgent)
    {
        var userInternal = await _userService.GetUserForAuthByEmail(request.Email);

        if (!_securityService.VerifyPassword(request.Password, userInternal.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials");

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            await _sessionService.ArchiveRevokedSessionsAsync(userInternal.Id);
            var session = await _sessionService.CreateSessionAsync(userInternal.Id, ipAddress, userAgent);

            var payload = new AccessTokenPayload(userInternal.Id, userInternal.Email, userInternal.Role, session.Id);
            var accessToken = _jwtService.GenerateAccessToken(payload);
            var refreshToken = _jwtService.GenerateRefreshToken();

            session.RefreshToken = refreshToken;


            await _unitOfWork.CommitAsync();

            var userPublic = new UserDto
            {
                Id = userInternal.Id,
                Email = userInternal.Email,
                Role = userInternal.Role,
                IsVerified = userInternal.IsVerified
            };

            return new AuthResponseDto(accessToken, refreshToken, userPublic);
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> RegisterAsync(RegisterRequestDto request)
    {
        var user = await _userService.CreateUser(new CreateUserRequest
        {
            Email = request.Email,
            Password = request.Password
        });
        await GenerateVerificationTokenAsync(user.Email);
        return user != null;
    }

    public async Task<bool> VerifyEmailAsync(string token, string ipAddress, string userAgent)
    {
        var email = await _cache.GetStringAsync(token);

        if (string.IsNullOrEmpty(email))
            return false;

        var isSuccess = await _userService.MarkEmailAsVerifiedAsync(email);

        if (isSuccess)
            await _cache.RemoveAsync(token);

        return isSuccess;
    }

    public async Task<string> InitResetPasswordAsync(string email)
    {
        var exists = await _userService.GetUserForAuthByEmail(email);
        if (exists == null) throw new NotFoundException("User not found");


        var pin = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var resetToken = Guid.NewGuid().ToString();

        var resetData = new
        {
            Pin = pin,
            Token = resetToken
        };

        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
        };

        var redisKey = $"reset-password:{email}";

        await _cache.SetStringAsync(
            redisKey,
            JsonSerializer.Serialize(resetData),
            cacheOptions
        );

        _backgroundJobService.Enqueue(() =>
            _neuroChordEmailService.SendPasswordRecoveryPinAsync(email, pin));

        return resetToken;
    }

    public async Task<bool> VerifyPinAsync(string token, string pin, string email)
    {
        if (token == null || pin == null) throw new NotFoundException("Token or PIN wasn't provided found");


        var key = $"reset-password:{email}";
        var resetToken = await _cache.GetStringAsync(key);
        if (resetToken == null) throw new BadHttpRequestException("PIN Code expired or is invalid. Try again");

        if (string.IsNullOrEmpty(resetToken))
            throw new BadHttpRequestException("Token expired or hasn't been generated");
        var storedData = JsonSerializer.Deserialize<ResetPasswordData>(resetToken);
        if (storedData.Pin != pin) throw new BadHttpRequestException("Invalid PIN code");

        if (storedData.Token != token) throw new BadHttpRequestException("Invalid reset session");

        await _cache.RemoveAsync(key);
        return true;
    }

    public async Task CompletePasswordResetAsync(string email, string pin, string token, string newPassword)
    {
        await VerifyPinAsync(token, pin, email);

        var hashedPassword = _securityService.HashPassword(newPassword);
        await _userService.UpdateUserPasswordAsync(email, hashedPassword);

        await _cache.RemoveAsync($"reset-password:{email}");
    }

    public async Task LogoutAsync(string userId)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            await _sessionService.ArchiveRevokedSessionsAsync(userId);
            await _unitOfWork.CommitAsync();
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, string accessToken)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Check if session exists and if expires
            var session = await _sessionService.GetSessionByTokenAsync(refreshToken);
            if (session == null || !await _sessionService.IsSessionValidAsync(refreshToken))
                throw new UnauthorizedAccessException("Session expired or invalid");
            // Verify accessToken and refreshToken
            var principal = await _jwtService.VerifyAccessToken(accessToken);
            var payload = new AccessTokenPayload(
                principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value, // Próba obu
                principal.FindFirst(ClaimTypes.Email)?.Value
                ?? principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value,
                principal.FindFirst(ClaimTypes.Role)?.Value,
                principal.FindFirst(ClaimTypes.Sid)?.Value
            );
            if (string.IsNullOrEmpty(payload.UserId) || string.IsNullOrEmpty(payload.SessionId))
                throw new UnauthorizedAccessException("Incomplete token claims.");
            // Generate new pair of accessToken and refreshToken
            var newAccessToken = _jwtService.GenerateAccessToken(payload);
            var newRefreshToken = _jwtService.GenerateRefreshToken();
            // Blacklist old refresh token

            var cacheOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
            };
            await _cache.SetStringAsync($"blacklist:{refreshToken}", session.RefreshToken, cacheOptions);

            // Update session with new refreshToken
            session.RefreshToken = newRefreshToken;
            session.UpdatedAt = DateTime.UtcNow;


            await _unitOfWork.CommitAsync();

            return new AuthResponseDto(
                newAccessToken,
                newRefreshToken,
                new UserDto { Id = payload.UserId, Email = payload.Email, Role = payload.Role }
            );
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task ForgotPasswordAsync(string email)
    {
        var user = await _userService.GetUserForAuthByEmail(email);
        if (user == null) return;

        throw new NotImplementedException();
    }


    public async Task GenerateVerificationTokenAsync(string email)
    {
        var token = Guid.NewGuid().ToString();

        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
        };

        await _cache.SetStringAsync(token, email, cacheOptions);

        var activationLink = $"https://neurochord.com/verify?token={token}";
        _backgroundJobService.Enqueue(() => _neuroChordEmailService.SendWelcomeEmailAsync(email, activationLink));
    }

    public class ResetPasswordData
    {
        public string Pin { get; set; }
        public string Token { get; set; }
    }
}
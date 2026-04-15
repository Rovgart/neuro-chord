using Microsoft.Extensions.Caching.Distributed;
using NeuroChord.Application.DTOs;
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
        Console.WriteLine(userInternal.PasswordHash);

        if (!_securityService.VerifyPassword(request.Password, userInternal.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials");

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var session = await _sessionService.CreateSessionAsync(userInternal.Id, ipAddress, userAgent);

            var accessToken = _jwtService.GenerateAccessToken(userInternal, session);
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

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var session = await _sessionService.GetSessionByTokenAsync(refreshToken);
            if (session == null || !await _sessionService.IsSessionValidAsync(refreshToken))
                throw new UnauthorizedAccessException("Session expired or invalid");

            var user = await _userService.GetUserForAuthByEmail(session.UserId);
            if (user == null) throw new UnauthorizedAccessException();

            var newRefreshToken = _jwtService.GenerateRefreshToken();
            session.RefreshToken = newRefreshToken;
            session.UpdatedAt = DateTime.UtcNow;

            var accessToken = _jwtService.GenerateAccessToken(user, session);

            await _unitOfWork.CommitAsync();

            return new AuthResponseDto(
                accessToken,
                newRefreshToken,
                new UserDto { Id = user.Id, Email = user.Email, Role = user.Role }
            );
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task LogoutAsync(string accessToken, string refreshToken)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            await _sessionService.RevokeSessionAsync(refreshToken);
            await _unitOfWork.CommitAsync();
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

    public async Task ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        throw new NotImplementedException();
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
}
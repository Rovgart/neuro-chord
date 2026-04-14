using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Application.Services;

public class AuthService : IAuthService
{
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
        INeuroChordEmailService neuroChordEmailService,
        ISecurityService securityService)
    {
        _sessionService = sessionService;
        _userService = userService;
        _jwtService = jwtService;
        _unitOfWork = unitOfWork;
        _securityService = securityService;
        _neuroChordEmailService = neuroChordEmailService;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string ipAddress, string userAgent)
    {
        var userInternal = await _userService.GetUserForAuthByEmail(request.Email);

        if (userInternal == null || !_securityService.VerifyPassword(request.Password, userInternal.PasswordHash))
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
                Role = userInternal.Role
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
        await _neuroChordEmailService.SendWelcomeEmailAsync(user.Email);
        return user != null;
    }

    public async Task<AuthResponseDto> VerifyEmailAsync(string token, string ipAddress, string userAgent)
    {
        throw new NotImplementedException("Wymaga serwisu do obsługi tokenów mailowych");
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // 1. Sprawdzamy czy token jest ważny
            var session = await _sessionService.GetSessionByTokenAsync(refreshToken);
            if (session == null || !await _sessionService.IsSessionValidAsync(refreshToken))
                throw new UnauthorizedAccessException("Session expired or invalid");

            // 2. Pobieramy dane usera do nowych tokenów
            var user = await _userService.GetUserForAuthByEmail(session.UserId);
            if (user == null) throw new UnauthorizedAccessException();

            // 3. Rotacja tokenów (Opcjonalnie: unieważniamy stary, tworzymy nowy w ramach tej samej sesji)
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
}
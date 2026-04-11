using NeuroChord.Application.DTOs;

namespace NeuroChord.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string ipAddress, string userAgent);

    Task<bool> RegisterAsync(RegisterRequestDto request);

    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);

    Task<AuthResponseDto> VerifyEmailAsync(string token, string ipAddress, string userAgent);

    Task LogoutAsync(string accessToken, string refreshToken);

    Task ForgotPasswordAsync(string email);
    Task ResetPasswordAsync(ResetPasswordRequestDto request);
}
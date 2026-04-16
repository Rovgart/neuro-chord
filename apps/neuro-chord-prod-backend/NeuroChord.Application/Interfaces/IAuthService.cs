using NeuroChord.Application.DTOs;

namespace NeuroChord.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string ipAddress, string userAgent);

    Task<bool> RegisterAsync(RegisterRequestDto request);

    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, string accessToken);

    Task<bool> VerifyEmailAsync(string token, string ipAddress, string userAgent);
    Task<string> InitResetPasswordAsync(string email);

    Task LogoutAsync(string userId);

    Task<bool> VerifyPinAsync(string token, string pin, string email);

    Task CompletePasswordResetAsync(string email, string pin, string token, string newPassword);
}
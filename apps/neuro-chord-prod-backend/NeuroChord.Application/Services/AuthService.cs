using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Application.Services;

public class AuthService : IAuthService
{
    public Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string ipAddress, string userAgent)
    {
        throw new NotImplementedException();
    }

    public Task<bool> RegisterAsync(RegisterRequestDto request)
    {
        throw new NotImplementedException();
    }

    public Task LogoutAsync(string accessToken, string refreshToken)
    {
        throw new NotImplementedException();
    }

    public Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        throw new NotImplementedException();
    }

    public Task ForgotPasswordAsync(string email)
    {
        throw new NotImplementedException();
    }


    public Task<AuthResponseDto> VerifyEmailAsync(string token, string ipAddress, string userAgent)
    {
        throw new NotImplementedException();
    }

    public Task ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        throw new NotImplementedException();
    }
}
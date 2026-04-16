using System.Security.Claims;
using NeuroChord.Application.DTOs;

namespace NeuroChord.Application.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(AccessTokenPayload payload);
    string GenerateRefreshToken();

    public Task<ClaimsPrincipal> VerifyAccessToken(string accessToken);
}
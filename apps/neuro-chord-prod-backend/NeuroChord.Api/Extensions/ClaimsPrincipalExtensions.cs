using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;

namespace NeuroChord.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var userId = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                     ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return ParseGuid(userId, "sub");
    }

    public static Guid GetSessionId(this ClaimsPrincipal user)
    {
        var sessionId = user.FindFirst(JwtRegisteredClaimNames.Sid)?.Value
                        ?? user.FindFirst(ClaimTypes.Sid)?.Value;

        return ParseGuid(sessionId, "sid");
    }

    public static Guid GetProfileId(this ClaimsPrincipal user)
    {
        var profileId = user.FindFirst("profile_id")?.Value;
        return ParseGuid(profileId, "profile_id");
    }

    private static Guid ParseGuid(string? value, string claimType)
    {
        if (string.IsNullOrEmpty(value) || !Guid.TryParse(value, out var guid))
            throw new UnauthorizedAccessException($"Invalid claim: {claimType} in token (Value: {value ?? "null"})");

        return guid;
    }
}
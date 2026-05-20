using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NeuroChord.Application.Common.Security;
using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Application.Services;

public class JwtService : IJwtService
{
    private readonly JwtOptions _options;

    public JwtService(IOptions<JwtOptions> options)
    {
        _options = options.Value;

        if (string.IsNullOrEmpty(_options.SecretKey) || _options.SecretKey.Length < 32)
            throw new InvalidOperationException("SecretKey must be at least 32 characters long.");
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }


    public string GenerateAccessToken(AccessTokenPayload payload)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, payload.UserId),
            new(JwtRegisteredClaimNames.Email, payload.Email),
            new(JwtRegisteredClaimNames.Sid, payload.SessionId),
            new("role", payload.Role),
            new("profile_id", payload.ProfileId),
            new("subscription_plan", payload.SubscriptionPlan), // Dodany claim
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            _options.Issuer,
            _options.Audience,
            claims,
            DateTime.UtcNow,
            DateTime.UtcNow.AddMinutes(_options.ExpiryMinutes),
            creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<ClaimsPrincipal> VerifyAccessToken(string accessToken)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_options.SecretKey);

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = _options.Issuer,
            ValidateAudience = true,
            ValidAudience = _options.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            var principal = tokenHandler.ValidateToken(accessToken, validationParameters, out var validatedToken);

            if (validatedToken is JwtSecurityToken jwtToken &&
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token algorithm");

            return principal;
        }
        catch (SecurityTokenExpiredException)
        {
            throw new UnauthorizedAccessException("Token has expired.");
        }
        catch (Exception)
        {
            throw new UnauthorizedAccessException("Invalid access token.");
        }
    }
}
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NeuroChord.Application.Common.Security;
using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Services;

public class JwtService : IJwtService
{
    private readonly JwtOptions _options;

    public JwtService(IOptions<JwtOptions> options)
    {
        _options = options.Value;

        // Inżynierski "fail-fast" – sprawdź klucz przy starcie
        if (string.IsNullOrEmpty(_options.SecretKey) || _options.SecretKey.Length < 32)
            throw new InvalidOperationException("SecretKey must be at least 32 characters long.");
    }

    public string GenerateRefreshToken()
    {
        // 64 bajty to bardzo silny token. Base64 zamieni to na ok. 88 znaków.
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public string GenerateAccessToken(UserInternalAuthDto user, Session session)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new(ClaimTypes.Sid, session.Id),
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
}
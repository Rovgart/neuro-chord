using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Infrastructure.Services;

public class SecurityService : ISecurityService
{
    public string HashPassword(string password)
    {
        var passwordBytes = Encoding.UTF8.GetBytes(password);
        var salt = new byte[16];
        RandomNumberGenerator.Fill(salt);
        var argon2 = new Argon2id(passwordBytes)
        {
            Salt = salt,
            MemorySize = 65536,
            DegreeOfParallelism = 8,
            Iterations = 4
        };
        var hash = argon2.GetBytes(32);
        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public bool VerifyPassword(string password, string hashedPasswordFromDb)
    {
        var parts = hashedPasswordFromDb.Split('.');
        if (parts.Length != 2) return false;

        var salt = Convert.FromBase64String(parts[0]);
        var expectedHash = Convert.FromBase64String(parts[1]);

        var passwordBytes = Encoding.UTF8.GetBytes(password);

        using (var argon2 = new Argon2id(passwordBytes))
        {
            argon2.Salt = salt;
            argon2.DegreeOfParallelism = 8;
            argon2.Iterations = 4;
            argon2.MemorySize = 65536;

            var actualHash = argon2.GetBytes(32);

            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }
    }
}
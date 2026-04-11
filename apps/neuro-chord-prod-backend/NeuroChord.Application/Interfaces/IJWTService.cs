using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user, Session session);
    string GenerateRefreshToken();
}
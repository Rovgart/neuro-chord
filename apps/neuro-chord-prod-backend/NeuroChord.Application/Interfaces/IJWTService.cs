using NeuroChord.Application.DTOs;
using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(UserInternalAuthDto user, Session session);
    string GenerateRefreshToken();
}
using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface ISessionService
{
    Task<Session> CreateSessionAsync(string userId, string ipAddress, string userAgent);
    Task<bool> IsSessionValidAsync(string refreshToken);
    Task RevokeSessionAsync(string refreshToken);
    Task RevokeAllUserSessionsAsync(string userId);
    Task<Session?> GetSessionByTokenAsync(string refreshToken);
    Task ArchiveRevokedSessionsAsync(string userId);
    Task<Session> VerifyRefreshToken(string userId, string refreshToken);
}
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Interfaces;

public interface ISessionService
{
    Task<Session> CreateSessionAsync(Guid userId, string ipAddress, string userAgent);
    Task<bool> IsSessionValidAsync(string refreshToken);
    Task RevokeAllUserSessionsAsync(Guid userId);
    Task<Session?> GetSessionByTokenAsync(string refreshToken);
    Task ArchiveRevokedSessionsAsync(Guid userId);

    Task RevokeSessionAsync(Guid sessionId, Reason reason);

    Task<Session> VerifyRefreshToken(Guid userId, string refreshToken);
}
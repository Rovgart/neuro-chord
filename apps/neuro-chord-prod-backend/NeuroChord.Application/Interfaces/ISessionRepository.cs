using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface ISessionRepository
{
    Task AddAsync(Session session);
    Task<Session?> GetByIdAsync(Guid sessionId);
    Task<Session?> GetByRefreshTokenAsync(string refreshToken);
    Task DeleteAsync(Guid sessionId);
    Task RevokeAllUserSessionsAsync(Guid userId);
    Task SaveChangesAsync();
    Task<List<Session>> GetActiveSessionsAsync(Guid userId);

    Task InsertRevokedSessionAsync(List<SessionArchive> archivedSessions);
    Task RemoveRevokedSessionsAsync(List<Session> revokedSessions);

    Task AddArchiveAsync(SessionArchive archive);
    void Remove(Session session);
}
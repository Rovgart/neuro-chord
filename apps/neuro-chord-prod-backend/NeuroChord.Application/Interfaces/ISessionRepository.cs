using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface ISessionRepository
{
    Task AddAsync(Session session);
    Task<Session?> GetByIdAsync(string sessionId);
    Task<Session?> GetByRefreshTokenAsync(string refreshToken);
    Task DeleteAsync(string sessionId);
    Task RevokeAllUserSessionsAsync(string userId);
    Task SaveChangesAsync();
}
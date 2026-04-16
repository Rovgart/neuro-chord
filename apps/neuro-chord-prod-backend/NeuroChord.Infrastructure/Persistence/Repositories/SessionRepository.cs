using Microsoft.EntityFrameworkCore;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Persistence.Repositories;

public class SessionRepository : ISessionRepository
{
    private readonly AppDbContext _dbContext;

    public SessionRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Session?> GetByIdAsync(string sessionId)
    {
        return await _dbContext.Sessions
            .FirstOrDefaultAsync(s => s.Id == sessionId);
    }

    public async Task<Session?> GetByRefreshTokenAsync(string refreshToken)
    {
        return await _dbContext.Sessions
            .FirstOrDefaultAsync(s => s.RefreshToken == refreshToken && !s.IsRevoked && s.ExpiresAt > DateTime.UtcNow);
    }

    public async Task AddAsync(Session session)
    {
        await _dbContext.Sessions.AddAsync(session);
    }

    public async Task DeleteAsync(string sessionId)
    {
        var session = await GetByIdAsync(sessionId);
        if (session != null) _dbContext.Sessions.Remove(session);
    }

    public async Task RevokeAllUserSessionsAsync(string userId)
    {
        await _dbContext.Sessions
            .Where(s => s.UserId == userId && !s.IsRevoked)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(s => s.IsRevoked, true)
                .SetProperty(s => s.RevokedAt, DateTime.UtcNow)
                .SetProperty(s => s.ExpiresAt, DateTime.UtcNow));
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }

    public async Task InsertRevokedSessionAsync(List<SessionArchive> archivedSessions)
    {
        await _dbContext.SessionArchives.AddRangeAsync(archivedSessions);
    }

    public async Task RemoveRevokedSessionsAsync(List<Session> revokedSessions)
    {
        _dbContext.Sessions.RemoveRange(revokedSessions);
    }


    public async Task<List<Session>> GetActiveSessionsAsync(string userId)
    {
        return await _dbContext.Sessions.Where(s => s.UserId == userId && !s.IsRevoked).ToListAsync();
    }
}
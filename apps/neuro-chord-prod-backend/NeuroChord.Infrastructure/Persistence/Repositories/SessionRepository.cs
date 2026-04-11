using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Persistence.Repositories;

public class SessionRepository : ISessionRepository
{
    public Task AddAsync(Session session)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(string sessionId)
    {
        throw new NotImplementedException();
    }

    public Task<Session?> GetByIdAsync(string sessionId)
    {
        throw new NotImplementedException();
    }

    public Task SaveChangesAsync()
    {
        throw new NotImplementedException();
    }

    public Task<Session?> GetByRefreshTokenAsync(string refreshToken)
    {
        throw new NotImplementedException();
    }

    public Task RevokeAllUserSessionsAsync(string userId)
    {
        throw new NotImplementedException();
    }
}
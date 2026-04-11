using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using Visus.Cuid;

namespace NeuroChord.Application.Services;

public class SessionService : ISessionService
{
    private readonly ISessionRepository _sessionRepository;

    public SessionService(ISessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<Session> CreateSessionAsync(string userId, string ipAddress, string userAgent)
    {
        var session = new Session
        {
            Id = new Cuid2().ToString(),
            UserId = userId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            RefreshToken = Guid.NewGuid().ToString(),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            User = null!
        };

        await _sessionRepository.AddAsync(session);

        return session;
    }

    public async Task InvalidateSessionAsync(string sessionId)
    {
        await _sessionRepository.DeleteAsync(sessionId);
        await _sessionRepository.SaveChangesAsync();
    }

    public async Task<bool> IsSessionValidAsync(string sessionId)
    {
        var session = await _sessionRepository.GetByIdAsync(sessionId);
        return session != null && !session.IsRevoked && session.ExpiresAt > DateTime.UtcNow;
    }
}
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;

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
            UserId = userId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            RefreshToken = Guid.NewGuid().ToString(),
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        await _sessionRepository.AddAsync(session);

        return session;
    }

    public async Task<bool> IsSessionValidAsync(string refreshToken)
    {
        var session = await _sessionRepository.GetByRefreshTokenAsync(refreshToken);

        return session != null &&
               !session.IsRevoked &&
               session.ExpiresAt > DateTime.UtcNow;
    }

    public async Task RevokeSessionAsync(string refreshToken)
    {
        var session = await _sessionRepository.GetByRefreshTokenAsync(refreshToken);

        if (session != null)
        {
            session.IsRevoked = true;
            session.RevokedAt = DateTime.UtcNow;
            session.UpdatedAt = DateTime.UtcNow;
        }
    }

    public async Task RevokeAllUserSessionsAsync(string userId)
    {
        await _sessionRepository.RevokeAllUserSessionsAsync(userId);
    }

    public async Task<Session?> GetSessionByTokenAsync(string refreshToken)
    {
        return await _sessionRepository.GetByRefreshTokenAsync(refreshToken);
    }
}
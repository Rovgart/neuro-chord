using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Services;

public class SessionService : ISessionService
{
    private readonly ISessionRepository _sessionRepository;

    public SessionService(ISessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<bool> IsSessionValidAsync(string refreshToken)
    {
        var session = await _sessionRepository.GetByRefreshTokenAsync(refreshToken);

        return session != null &&
               !session.IsRevoked &&
               session.ExpiresAt > DateTime.UtcNow;
    }

    public async Task RevokeAllUserSessionsAsync(Guid userId)
    {
        await _sessionRepository.RevokeAllUserSessionsAsync(userId);
    }

    public async Task<Session?> GetSessionByTokenAsync(string refreshToken)
    {
        return await _sessionRepository.GetByRefreshTokenAsync(refreshToken);
    }

    public async Task ArchiveRevokedSessionsAsync(Guid userId)
    {
        var revokedSessions = await _sessionRepository.GetActiveSessionsAsync(userId);
        var archives = revokedSessions.Select(s => new SessionArchive
        {
            UserId = s.UserId,
            RefreshToken = s.RefreshToken,
            IpAddress = s.IpAddress,
            UserAgent = s.UserAgent,
            CreatedAt = s.CreatedAt,
            ArchivedAt = DateTime.UtcNow,
            RevokedAt = DateTime.UtcNow,
            Reason = Reason.NewLogin
        }).ToList();
        await _sessionRepository.InsertRevokedSessionAsync(archives);
        await _sessionRepository.RemoveRevokedSessionsAsync(revokedSessions);
    }

    public async Task<Session> CreateSessionAsync(Guid userId, string ipAddress, string userAgent)
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


    public async Task<Session> VerifyRefreshToken(Guid userId, string refreshToken)
    {
        // 1. Pobierz sesję z bazy na podstawie UserId i Tokena
        var session = await _sessionRepository.GetByIdAsync(userId);

        if (session == null) throw new UnauthorizedAccessException("Refresh token is invalid.");

        if (session.IsRevoked) throw new UnauthorizedAccessException("Refresh token has been revoked.");

        if (session.ExpiresAt < DateTime.UtcNow) throw new UnauthorizedAccessException("Refresh token has expired.");

        return session;
    }


    public async Task RevokeSessionAsync(Guid sessionId, Reason reason)
    {
        var session = await _sessionRepository.GetByIdAsync(sessionId);
        if (session == null) return;

        var archive = new SessionArchive
        {
            UserId = session.UserId,
            RefreshToken = session.RefreshToken,
            IpAddress = session.IpAddress,
            UserAgent = session.UserAgent,
            CreatedAt = session.CreatedAt,
            ArchivedAt = DateTime.UtcNow,
            RevokedAt = DateTime.UtcNow,
            Reason = reason
        };

        await _sessionRepository.AddArchiveAsync(archive);
        _sessionRepository.Remove(session);
        await _sessionRepository.SaveChangesAsync();
    }
}
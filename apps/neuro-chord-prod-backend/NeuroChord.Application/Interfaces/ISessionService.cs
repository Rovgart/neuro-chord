using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface ISessionService
{
    Task<Session> CreateSessionAsync(string userId, string ipAddress, string userAgent);
    Task<bool> IsSessionValidAsync(string sessionId);
    Task InvalidateSessionAsync(string sessionId);
}
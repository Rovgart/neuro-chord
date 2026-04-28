using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(string action, string entityName, Guid? targetId, AuditLogType type, string details);
}
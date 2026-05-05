using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface IAuditLogsRepository
{
    Task AddAsync(AuditLog auditLog);
}
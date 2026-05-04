using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Persistence.Repositories;

public class AuditLogsRepository(AppDbContext context) : IAuditLogsRepository
{
    public async Task AddAsync(AuditLog auditLog)
    {
        await context.AuditLogs.AddAsync(auditLog);
    }
}
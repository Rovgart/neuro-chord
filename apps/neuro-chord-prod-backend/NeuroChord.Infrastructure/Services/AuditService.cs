using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using NeuroChord.Application.Interfaces;
using NeuroChord.Infrastructure.Persistence;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.Infrastructure.Services;

public class AuditService(AppDbContext context, IHttpContextAccessor httpContextAccessor) : IAuditService
{
    public async Task LogAsync(string action, string entityName, Guid? targetId, AuditLogType type, string details)
    {
        var actorIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(actorIdClaim)) return;
        var log = new AuditLog
        {
            ActorId = Guid.Parse(actorIdClaim),
            TargetId = targetId,
            Action = action,
            EntityName = entityName,
            Type = type,
            Details = JsonSerializer.Serialize(details),
            CreatedAt = DateTime.UtcNow
        };
        await context.AuditLogs.AddAsync(log);
    }
}
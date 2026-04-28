using NeuroChordDomain.Enums;

namespace NeuroChordDomain.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ActorId { get; set; }
    public User Actor { get; set; } = null!;

    public Guid? TargetId { get; set; }
    public User? Target { get; set; }

    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public AuditLogType Type { get; set; }

    public string Details { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
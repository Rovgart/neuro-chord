using NeuroChordDomain.Enums;

namespace NeuroChordDomain.Entities;

public class SessionArchive
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string UserAgent { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;

    public DateTime RevokedAt { get; set; } = DateTime.UtcNow;
    public virtual User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime ArchivedAt { get; set; } = DateTime.UtcNow;

    public Reason Reason { get; set; } = Reason.Logout;
}
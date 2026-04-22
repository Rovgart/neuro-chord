namespace NeuroChordDomain.Entities;

public class Session
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserAgent { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
    public DateTime? RevokedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public required Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;
}
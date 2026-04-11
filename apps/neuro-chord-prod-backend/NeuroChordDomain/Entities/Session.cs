using Visus.Cuid;

namespace NeuroChordDomain.Entities;

public class Session
{
    public string Id { get; set; } = new Cuid2(maxLength: 24).ToString();
    public string UserAgent { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; }
    public virtual User User { get; set; }
}
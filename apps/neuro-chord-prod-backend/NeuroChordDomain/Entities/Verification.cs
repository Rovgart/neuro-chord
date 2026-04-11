using Visus.Cuid;

namespace NeuroChordDomain.Entities;

public class Verification
{
    public string Id { get; set; } = new Cuid2(maxLength: 24).ToString();
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public bool IsUsed { get; set; } = false;
    public virtual User User { get; set; } = null!;
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
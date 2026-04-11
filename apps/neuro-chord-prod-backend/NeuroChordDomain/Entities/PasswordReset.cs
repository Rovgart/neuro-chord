using Visus.Cuid;

namespace NeuroChordDomain.Entities;

public class PasswordReset
{
    public string Id { get; set; } = new Cuid2(maxLength: 24).ToString();
    public string UserId { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;
    public bool IsUsed { get; set; } = false;
    public string? IpAddress { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

}
using Visus.Cuid;

namespace NeuroChordDomain.Entities;

public class TeacherProfile
{
    public string Id { get; set; } = new Cuid2(maxLength: 24).ToString();
    public string ProfileId { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string? Education { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; }
    public virtual Profile Profile { get; set; } = null!;
}
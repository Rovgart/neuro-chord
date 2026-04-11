using Visus.Cuid;

namespace NeuroChordDomain.Entities;

public class StudentProfile
{
    public string Id { get; set; } = new Cuid2(maxLength: 24).ToString();
    public string ProfileId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public int ExperienceLevel { get; set; } = 0;
    public virtual Profile Profile { get; set; } = null!;
}
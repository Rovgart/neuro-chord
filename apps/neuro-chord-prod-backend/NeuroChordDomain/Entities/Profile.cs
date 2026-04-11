using Visus.Cuid;

namespace NeuroChordDomain.Entities;

public class Profile
{
    public string Id { get; set; } = new Cuid2(maxLength: 24).ToString();
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImgUrl { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;
    public virtual StudentProfile? StudentProfile { get; set; }
    public virtual TeacherProfile? TeacherProfile { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

}
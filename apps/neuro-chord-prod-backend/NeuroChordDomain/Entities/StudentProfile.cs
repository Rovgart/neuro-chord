namespace NeuroChordDomain.Entities;

public class StudentProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProfileId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int ExperienceLevel { get; set; } = 0;
    public virtual Profile Profile { get; set; } = null!;
}
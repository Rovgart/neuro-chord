namespace NeuroChordDomain.Entities;

public class TeacherProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProfileId { get; set; }
    public string Specialization { get; set; } = string.Empty;
    public string? Education { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; }
    public virtual Profile Profile { get; set; } = null!;
    public virtual ICollection<TeacherInstrument> TeacherInstruments { get; set; } = new List<TeacherInstrument>();
}
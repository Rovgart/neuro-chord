using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NeuroChordDomain.Entities;

public class TeacherProfile
{
    [Key] public Guid UserId { get; set; }

    [ForeignKey("UserId")] public virtual User User { get; set; } = null!;

    public string Specialization { get; set; } = string.Empty;
    public string? Education { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public virtual ICollection<TeacherInstrument> TeacherInstruments { get; set; } = new List<TeacherInstrument>();

    public void UpdateProfessionalInfo(string? specialization, string? education)
    {
        if (specialization != null) Specialization = specialization;
        if (education != null) Education = education;
        UpdatedAt = DateTime.UtcNow;
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NeuroChordDomain.Entities;

public class StudentProfile
{
    [Key] public Guid UserId { get; set; }

    [ForeignKey("UserId")] public virtual User User { get; set; } = null!;

    public string Username { get; set; } = string.Empty;
    public int ExperienceLevel { get; set; }

    public void UpdateProfile(string? username)
    {
        if (!string.IsNullOrWhiteSpace(username)) Username = username;
    }

    public void AddExperience(int amount)
    {
        if (amount > 0) ExperienceLevel += amount;
    }
}
namespace NeuroChordDomain.Entities;

public class TeacherApplication
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public Guid UserId { get; init; }
    public User User { get; init; } = null!;

    public string Specialization { get; init; } = string.Empty;
    public string Bio { get; init; } = string.Empty;
    public string? QualificationsUrl { get; init; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public string? AdminComment { get; set; }

    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public Guid? ProcessedById { get; set; }
}
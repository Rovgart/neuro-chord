using NeuroChordDomain.Enums;

namespace NeuroChordDomain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? CampaignId { get; set; } = null;

    public virtual Campaign? Campaign { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.Unassigned;
    public bool OnboardingComplete { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsVerified { get; set; } = false;
    public RegistrationStep RegistrationStep { get; set; } = RegistrationStep.AccountCreated;
    public virtual ICollection<Verification> Verifications { get; set; } = new List<Verification>();
    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
    public virtual ICollection<SessionArchive> SessionArchives { get; set; } = new List<SessionArchive>();
    public virtual ICollection<PasswordReset> PasswordResets { get; set; } = new List<PasswordReset>();
    public virtual ICollection<Material> Materials { get; set; } = new List<Material>();
    public virtual ICollection<TeacherApplication> TeacherApplications { get; set; } = new List<TeacherApplication>();
    public ICollection<AuditLog> PerformedActions { get; set; } = new List<AuditLog>();
    public ICollection<AuditLog> ReceivedActions { get; set; } = new List<AuditLog>();


    public virtual Profile? Profile { get; set; }
    public virtual TeacherProfile? TeacherProfile { get; set; }
    public virtual StudentProfile? StudentProfile { get; set; }
}
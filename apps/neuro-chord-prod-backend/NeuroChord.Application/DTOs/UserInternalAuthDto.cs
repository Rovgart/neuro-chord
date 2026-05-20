using NeuroChordDomain.Enums;

namespace NeuroChord.Application.DTOs;

public class UserInternalAuthDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Role Role { get; set; }
    public bool IsVerified { get; set; }
    public Guid? ProfileId { get; set; }
    public bool HasSelectedPlan { get; set; }
    public string SubscriptionPlanName { get; set; } = "None"; // Nowe pole
}
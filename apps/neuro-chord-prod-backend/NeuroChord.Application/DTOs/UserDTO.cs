namespace NeuroChord.Application.DTOs;

public class UserDto
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
    public bool IsVerified { get; set; }
    public string ProfileId { get; set; }

    public string SubscriptionPlanName { get; set; } = "None";
}
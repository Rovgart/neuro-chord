namespace NeuroChord.Application.DTOs;

public class CreateUserRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
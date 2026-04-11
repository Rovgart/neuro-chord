namespace NeuroChord.Application.DTOs;

public record UserDto
{
    public required string Id { get; set; }
    public required string Email { get; set; }
}
namespace NeuroChord.Application.DTOs;

public record ResetPasswordDto
{
    public string Email { get; set; }
    public string Pin { get; set; }
    public string NewPassword { get; set; }
}
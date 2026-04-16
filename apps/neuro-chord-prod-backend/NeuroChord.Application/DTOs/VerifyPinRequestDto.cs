namespace NeuroChord.Application.DTOs;

public class VerifyPinRequestDto
{
    public string Email { get; set; }
    public string Pin { get; set; }
    public string NewPassword { get; set; }
}
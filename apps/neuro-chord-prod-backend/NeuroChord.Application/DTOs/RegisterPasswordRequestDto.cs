namespace NeuroChord.Application.DTOs;

public record ResetPasswordRequestDto(
    string Email,
    string Token,
    string NewPassword,
    string ConfirmNewPassword
);
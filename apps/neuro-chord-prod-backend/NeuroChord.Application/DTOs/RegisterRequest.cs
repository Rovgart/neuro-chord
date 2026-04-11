namespace NeuroChord.Application.DTOs;

public record RegisterRequestDto(
    string Email,
    string Password
);
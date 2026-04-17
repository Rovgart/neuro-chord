namespace NeuroChord.Application.Dtos.Profile;

public record CreateProfileDto(
    string DisplayName,
    string Description,
    string? ImgUrl,
    string Role,
    string? Username,
    string? Specialization
);
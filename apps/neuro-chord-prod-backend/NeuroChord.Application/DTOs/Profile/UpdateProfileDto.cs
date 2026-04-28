namespace NeuroChord.Application.Dtos.Profile;

public record UpdateProfileDto(
    string? DisplayName,
    string? Description,
    string? ImgUrl,
    string? Specialization,
    string? Education,
    string? Username
);
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Dtos.Profile;

public record CreateProfileDto(
    string DisplayName,
    string Description,
    string? ImgUrl,
    Role Role,
    string? Username,
    string? Specialization
);
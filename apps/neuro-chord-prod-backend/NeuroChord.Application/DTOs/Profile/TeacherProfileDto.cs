namespace NeuroChord.Application.DTOs.Profile;

public record TeacherProfileDto(
    string Specialization,
    string? Education,
    DateTime CreatedAt
);
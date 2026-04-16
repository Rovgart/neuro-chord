namespace NeuroChord.Application.DTOs.Profile;

public record ProfileResponseDto(
    string Id,
    string DisplayName,
    string Description,
    string ImgUrl,
    string Role, // Tu trafi np. nameof(Role.Teacher)
    StudentProfileDto? StudentData,
    TeacherProfileDto? TeacherData,
    DateTime CreatedAt
);
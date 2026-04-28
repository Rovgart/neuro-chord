namespace NeuroChord.Application.DTOs.Profile;

public record ProfileResponseDto(
    string Id,
    string DisplayName,
    string Description,
    string ImgUrl,
    string Role,
    StudentProfileDto? StudentData,
    TeacherProfileDto? TeacherData,
    DateTime CreatedAt
);
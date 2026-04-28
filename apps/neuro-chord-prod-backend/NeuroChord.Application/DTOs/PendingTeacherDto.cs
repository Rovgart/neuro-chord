namespace NeuroChord.Application.DTOs;

public record PendingTeacherDto(
    Guid ApplicationId,
    Guid UserId,
    string DisplayName,
    string Email,
    string? ImgUrl,
    string Specialization,
    string Bio,
    string? QualificationsUrl,
    DateTime AppliedAt
);
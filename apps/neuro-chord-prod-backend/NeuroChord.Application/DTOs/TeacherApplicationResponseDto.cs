namespace NeuroChord.Application.DTOs;

public record TeacherApplicationResponseDto(IEnumerable<PendingTeacherDto> Applications);
namespace NeuroChord.Application.DTOs;

public enum QuestionType
{
    SingleChoice,
    MultipleChoice,
    OpenAnswer
}

public enum DifficultyLevel
{
    Easy,
    Medium,
    Hard
}

public record GeneratedTestDto(
    string Title,
    string Description,
    string Category,
    DifficultyLevel OverallDifficulty,
    string TargetAudience,
    int EstimatedDurationMinutes,
    List<string> Tags,
    List<QuestionDto> Questions
);

public record QuestionDto(
    QuestionType QuestionType,
    string QuestionText,
    int Points,
    DifficultyLevel Difficulty,
    string Explanation,
    List<string> Tags,
    List<string> Options,
    List<int> CorrectOptionIndices,
    string ModelAnswer
);
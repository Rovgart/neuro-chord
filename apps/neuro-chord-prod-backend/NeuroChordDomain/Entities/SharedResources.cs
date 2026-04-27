using NeuroChordDomain.Enums;

namespace NeuroChordDomain.Entities;

public class SharedResources
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid? MaterialId { get; init; }
    public Guid? TargetId { get; init; }
    public TargetType TargetType { get; init; }
    public Guid? QuizId { get; init; }
    public Guid? FolderId { get; init; }
    public Material Material { get; init; }
    public Folder Folder { get; init; }
    public AccessLevel AccessLevel { get; init; } = AccessLevel.Viewer;
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
using NeuroChordDomain.Enums;

namespace NeuroChordDomain.Entities;

public class SharedResources
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? MaterialId { get; set; }
    public Guid? TargetId { get; set; }
    public TargetType TargetType { get; set; }
    public Guid? QuizId { get; set; }
    public Guid? FolderId { get; set; }
    public Material Material { get; set; }
    public Folder Folder { get; set; }
    public string AccessLevel { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
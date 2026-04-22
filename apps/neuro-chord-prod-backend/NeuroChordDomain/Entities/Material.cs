using NeuroChordDomain.Enums;

namespace NeuroChordDomain.Entities;

public class Material
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Topic { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public MaterialType Type { get; set; }
    public Guid OwnerId { get; set; }
    public bool IsPublic { get; set; }
    public Guid? FolderId { get; set; }
    public bool RequiresSubscription { get; set; }
    public Folder Folder { get; set; }
    public User Owner { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
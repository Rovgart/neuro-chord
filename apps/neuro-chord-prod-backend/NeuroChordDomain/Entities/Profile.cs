using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NeuroChordDomain.Entities;

public class Profile
{
    [Key] public Guid UserId { get; set; }

    [ForeignKey("UserId")] public virtual User User { get; set; } = null!;

    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImgUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public void UpdateGeneralInfo(string? displayName, string? description, string? imgUrl)
    {
        if (displayName != null) DisplayName = displayName;
        if (description != null) Description = description;
        if (imgUrl != null) ImgUrl = imgUrl;
        UpdatedAt = DateTime.UtcNow;
    }
}
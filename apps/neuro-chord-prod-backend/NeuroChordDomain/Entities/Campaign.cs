using Visus.Cuid;

namespace NeuroChordDomain.Entities;

public class Campaign
{
    public string Id { get; set; } = new Cuid2(maxLength: 24).ToString();
    public string Source { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CampaignName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
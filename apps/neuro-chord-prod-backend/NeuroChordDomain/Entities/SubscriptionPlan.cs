using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NeuroChordDomain.Entities;

public class SubscriptionPlan
{
    [Key] public Guid Id { get; set; }

    [Required][MaxLength(100)] public string PlanName { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [MaxLength(500)] public string? Description { get; set; }

    [Required] public string StripePriceId { get; set; } = string.Empty;


    [Required][MaxLength(3)] public string Currency { get; set; } = "PLN";

    [Required] public PlanPeriod Period { get; set; }

    public bool IsActive { get; set; } = true;

    [MaxLength(255)] public string? Tagline { get; set; }

    [MaxLength(50)] public string? Badge { get; set; }

    [MaxLength(100)] public string? StudentLimit { get; set; }

    [MaxLength(50)] public string? Cta { get; set; }

    public bool Highlight { get; set; } = false;
    public List<PlanFeature> Features { get; set; } = new();

    public ICollection<Subscriptions> Subscriptions { get; set; } = new List<Subscriptions>();
}

public enum PlanPeriod
{
    Monthly,
    Yearly
}
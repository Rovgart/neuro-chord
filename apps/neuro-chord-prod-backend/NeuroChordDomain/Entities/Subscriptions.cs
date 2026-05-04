using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NeuroChordDomain.Enums;

namespace NeuroChordDomain.Entities;

public class Subscriptions
{
    [Key] public Guid UserId { get; init; }
    public string StripeCustomerId { get; init; } = null!;
    public string? StripeSubscriptionId { get; set; }
    public string? PriceId { get; init; }
    public string? LastInvoiceId { get; set; }
    [Required] public Guid PlanId { get; set; }

    [ForeignKey("PlanId")] public SubscriptionPlan Plan { get; set; } = null!;

    public SubscriptionStatus Status { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<IncomingWebhooks> IncomingWebhooks { get; set; }
}
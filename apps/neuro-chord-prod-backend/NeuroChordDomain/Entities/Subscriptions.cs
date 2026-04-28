using System.ComponentModel.DataAnnotations;
using NeuroChordDomain.Enums;

namespace NeuroChordDomain.Entities;

public class Subscriptions
{
    [Key] public Guid UserId { get; init; }
    public string StripeCustomerId { get; init; } = null!;
    public string? StripeSubscriptionId { get; init; }
    public string? PriceId { get; init; }
    public string? LastInvoiceId { get; set; }
    public SubscriptionStatus Status { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; set; }
}
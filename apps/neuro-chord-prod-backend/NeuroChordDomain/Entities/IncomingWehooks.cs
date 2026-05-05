namespace NeuroChordDomain.Entities;

public class IncomingWebhooks
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string ExternalEventId { get; init; } = null!;
    public Subscriptions? Subscriptions { get; init; }
    public Guid? SubscriptionId { get; set; }
    public string? Payload { get; init; }
    public DateTime CreatedAt { get; init; }
}
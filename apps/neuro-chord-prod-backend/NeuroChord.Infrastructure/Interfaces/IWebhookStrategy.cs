using Stripe;

namespace NeuroChord.Infrastructure.Interfaces;

public interface IWebhookStrategy
{
    public string EventType { get; }
    Task HandleAsync(Event stripeEvent);
}
using Stripe;

namespace NeuroChord.Infrastructure.Interfaces;

public interface IWebhookProcessor
{
    Task ProcessAsync(Event stripeEvent);
}
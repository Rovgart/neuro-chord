using Microsoft.Extensions.Logging;
using NeuroChord.Application.Interfaces;
using NeuroChord.Infrastructure.Interfaces;
using Stripe;

namespace NeuroChord.Infrastructure.Services;

public class WebhookProcessor(
    IEnumerable<IWebhookStrategy> strategies,
    ILogger<WebhookProcessor> logger,
    IBackgroundJobService backgroundJobService)
    : IWebhookProcessor
{
    public async Task ProcessAsync(Event stripeEvent)
    {
        var strategy = strategies.FirstOrDefault(s => s.EventType == stripeEvent.Type);
        if (strategy == null) return;

        backgroundJobService.Enqueue<IWebhookJob>(j => j.ExecuteAsync(stripeEvent.Id));
    }
}
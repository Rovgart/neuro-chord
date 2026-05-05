using Microsoft.Extensions.Logging;
using NeuroChord.Application.Interfaces;
using NeuroChord.Infrastructure.Interfaces;
using NeuroChordDomain.Entities;
using Stripe;

namespace NeuroChord.Infrastructure.Services;

public class WebhookJob(
    IUnitOfWork uow,
    IEnumerable<IWebhookStrategy> strategies,
    EventService eventService,
    ILogger<WebhookJob> logger) : IWebhookJob
{
    public async Task ExecuteAsync(string stripeEventId)
    {
        var alreadyProcessed = await uow.IncomingWebhooks.FindAsync(stripeEventId);
        if (alreadyProcessed) return;

        var stripeEvent = await eventService.GetAsync(stripeEventId);
        var strategy = strategies.FirstOrDefault(s => s.EventType == stripeEvent.Type);
        if (strategy == null) return;
        try
        {
            var webhookLog = new IncomingWebhooks
            {
                ExternalEventId = stripeEventId,
                Payload = stripeEvent.RawJsonElement.ToString(),
                CreatedAt = DateTime.UtcNow
            };
            await uow.IncomingWebhooks.AddAsync(webhookLog);
            await strategy.HandleAsync(stripeEvent);
            await uow.CommitAsync();
        }
        catch (Exception ex)
        {
            var message =
                $"Failed to process Stripe webhook event {stripeEventId} using strategy {strategy.GetType().Name}";

            logger.LogError(ex, message);

            throw new InvalidOperationException(message, ex);
        }
    }
}
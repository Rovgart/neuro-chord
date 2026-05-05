namespace NeuroChord.Infrastructure.Interfaces;

public interface IWebhookJob
{
    Task ExecuteAsync(string stripeEventId);
}
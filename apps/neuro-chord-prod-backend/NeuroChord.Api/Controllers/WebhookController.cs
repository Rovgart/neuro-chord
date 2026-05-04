using Microsoft.AspNetCore.Mvc;
using NeuroChord.Application.Interfaces;
using NeuroChord.Infrastructure.Interfaces;
using Stripe;

namespace NeuroChord.Api.Controllers;

[Route("api/webhook")]
[ApiController]
public class WebhookController : ControllerBase
{
    private readonly IWebhookProcessor _webhookProcessor;
    private readonly string _webhookSecret;

    public WebhookController(IConfiguration config, IWebhookProcessor webhookProcessor,
        ISubscriptionService subscriptionService)
    {
        _webhookProcessor = webhookProcessor;
        _webhookSecret = config["Stripe:WebhookSecret"];
    }

    [HttpPost]
    public async Task<IActionResult> Handle([FromHeader(Name = "Stripe-Signature")] string? signature)
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        if (string.IsNullOrEmpty(signature)) return BadRequest("Missing signature");

        var stripeEvent = EventUtility.ConstructEvent(
            json,
            signature,
            _webhookSecret
        );
        await _webhookProcessor.ProcessAsync(stripeEvent);
        return Ok();
    }
}
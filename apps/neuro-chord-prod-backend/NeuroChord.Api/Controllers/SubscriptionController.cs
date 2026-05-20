using Microsoft.AspNetCore.Mvc;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Api.Controllers;

[ApiController]
[Route("api/subscriptions")]
public class SubscriptionController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSubscriptions()
    {
        var subscriptionPlans = await _subscriptionService.GetSubscriptions();
        return Ok(subscriptionPlans);
    }
}
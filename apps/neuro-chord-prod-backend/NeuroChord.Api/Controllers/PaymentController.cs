using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeuroChord.Api.Extensions;
using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Api.Controllers;

[Route("api/payments/")]
[ApiController]
[Authorize]
public class PaymentController(
    ISubscriptionService subscriptionService,
    IConfiguration configuration,
    ILogger<PaymentController> logger) : ControllerBase
{
    [HttpPost("create-checkout")]
    public async Task<IActionResult> CreateCheckout([FromBody] CreateCheckoutSessionRequestDto request)
    {
        var userId = User.GetUserId();
        var result = await subscriptionService.CreateSubscriptionSessionAsync(userId, request.PriceId, request.PlanId);
        var dto = new CreateCheckoutSessionResponseDto(result);
        return Ok(dto);
    }

    [HttpPost("cancel")]
    public async Task<IActionResult> CancelSubscription()
    {
        var userId = User.GetUserId();
        await subscriptionService.CancelSubscriptionAsync(userId);
        return NoContent();
    }

    [HttpGet("subscription-status")]
    public async Task<IActionResult> Status()
    {
        var userId = User.GetUserId();
        var subscription = await subscriptionService.GetSubscriptionStatus(userId);
        return Ok(subscription);
    }

    [HttpGet("invoices")]
    public async Task<IActionResult> Invoices()
    {
        var userId = User.GetUserId();
        var invoices = await subscriptionService.GetUserInvoicesAsync(userId);
        return Ok(invoices);
    }

    [HttpPost("reactivate")]
    public async Task<IActionResult> Reactivate()
    {
        var userId = User.GetUserId();
        var invoices = await subscriptionService.ReactivateSubscriptionAsync(userId);
        return Ok(invoices);
    }

    [HttpPost("customer-portal")]
    public async Task<IActionResult> CustomerPortal()
    {
        var userId = User.GetUserId();
        var returnUrl = configuration["Stripe:ReturnUrl"];
        if (string.IsNullOrWhiteSpace(returnUrl))
        {
            logger.LogCritical("Stripe ReturnUrl is missing in configuration!");
            return StatusCode(500, "Server configuration error");
        }

        var url = await subscriptionService.CreateCustomerPortalSessionAsync(userId, returnUrl);
        return Ok(url);
    }
}
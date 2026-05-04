using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeuroChord.Api.Extensions;
using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Api.Controllers;

[Route("api/payments/create-checkout")]
[ApiController]
[Authorize]
public class PaymentController(ISubscriptionService subscriptionService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateCheckout([FromBody] CreateCheckoutSessionRequestDto request)
    {
        var userId = User.GetUserId();
        var result = await subscriptionService.CreateSubscriptionSessionAsync(userId, request.PriceId, request.PlanId);
        var dto = new CreateCheckoutSessionResponseDto(result);
        return Ok(dto);
    }
}
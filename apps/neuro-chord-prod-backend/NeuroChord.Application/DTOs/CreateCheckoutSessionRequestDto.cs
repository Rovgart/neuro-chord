namespace NeuroChord.Application.DTOs;

public record CreateCheckoutSessionRequestDto(
    string PriceId,
    Guid PlanId
);
namespace NeuroChord.Application.DTOs;

/// <summary>
///     DTO dla żądania wyboru planu subskrypcji podczas onboardingu nauczyciela.
/// </summary>
/// <param name="PlanId">Identyfikator planu: "freemium", "pro" lub "full"</param>
/// <param name="PriceId">Opcjonalny identyfikator ceny ze Stripe (wymagany dla planów Pro i Full)</param>
public record SelectPlanRequestDto(string PlanId, string? PriceId = null);
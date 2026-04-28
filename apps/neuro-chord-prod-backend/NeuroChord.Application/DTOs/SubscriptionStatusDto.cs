namespace NeuroChord.Application.DTOs;

public record SubscriptionStatusDto(
    bool IsActive,
    string StatusName, // np. "Aktywna", "Wygasła", "Wymaga płatności"
    DateTime? CurrentPeriodEnd,
    string? PlanName, // np. "Pro Teacher", "Basic"
    bool CancelAtPeriodEnd // Czy użytkownik kliknął "anuluj", ale ma jeszcze dostęp do końca miesiąca
);
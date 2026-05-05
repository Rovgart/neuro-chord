using NeuroChordDomain.Enums;

namespace NeuroChord.Application.DTOs;

public record GetSubscriptionStatusResponse(
    SubscriptionStatus status,
    bool IsCancellationRequested,
    DateTime currentPeriodEnd,
    string PlanName
);
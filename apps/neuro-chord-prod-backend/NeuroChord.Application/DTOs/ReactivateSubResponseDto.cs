using NeuroChordDomain.Enums;

namespace NeuroChord.Application.DTOs;

public record ReactivateSubResponseDto(
    string Message,
    bool IsCancellationRequested,
    SubscriptionStatus Status
);
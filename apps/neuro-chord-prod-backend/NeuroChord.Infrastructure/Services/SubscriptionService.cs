using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Enums;

namespace NeuroChord.Infrastructure.Services;

public class SubscriptionService(IUnitOfWork uow) : ISubscriptionService
{
    public async Task<SubscriptionStatusDto> GetUserSubscriptionStatusAsync(Guid userId)
    {
        var sub = await uow.Subscriptions.GetByUserIdAsync(userId);
        if (sub == null)
        {
            return new SubscriptionStatusDto(false, "No subscription", null, "Free", false);
        }

        bool isActive = sub.Status == SubscriptionStatus.Active && sub.CurrentPeriodEnd > DateTime.UtcNow;

        return new SubscriptionStatusDto(
            IsActive: isActive,
            StatusName: sub.Status.ToString(),
            CurrentPeriodEnd: sub.CurrentPeriodEnd,
            PlanName: "Pro Teacher",
            CancelAtPeriodEnd: sub.Status == SubscriptionStatus.Canceled
        );
    }

    public Task<string> CreateSubscriptionSessionAsync(Guid userId, string priceId)
    {

    }
}
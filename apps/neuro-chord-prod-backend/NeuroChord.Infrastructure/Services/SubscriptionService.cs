using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;
using Stripe;

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

    public async Task<string> CreateSubscriptionSessionAsync(Guid userId, string priceId)
    {
        var customerExists = uow.Subscriptions.GetByUserIdAsync(userId);
        if (customerExists == null) 
        {
            var customerService = new CustomerService();
            var customerOptions= new CustomerCreateOptions
            {
                Metadata = new Dictionary<string, string>
                {
                    { "AppUserId", userId.ToString() }
                }
            };
            Customer stripeCustomer = await customerService.CreateAsync(customerOptions);

            var newSubscription= new Subscriptions { UserId=userId, StripeCustomerId=stripeCustomer.Id, Status=SubscriptionStatus.Incomplete, CreatedAt=DateTime.UtcNow}
        }
    }
}
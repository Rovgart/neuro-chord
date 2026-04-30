using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;
using Stripe;
using Stripe.Checkout;

namespace NeuroChord.Infrastructure.Services;

public class SubscriptionService(IUnitOfWork uow) : ISubscriptionService
{
    public async Task<SubscriptionStatusDto> GetUserSubscriptionStatusAsync(Guid userId)
    {
        var sub = await uow.Subscriptions.GetByUserIdAsync(userId);
        if (sub == null) return new SubscriptionStatusDto(false, "No subscription", null, "Free", false);

        var isActive = sub.Status == SubscriptionStatus.Active && sub.CurrentPeriodEnd > DateTime.UtcNow;

        return new SubscriptionStatusDto(
            isActive,
            sub.Status.ToString(),
            sub.CurrentPeriodEnd,
            "Pro Teacher",
            sub.Status == SubscriptionStatus.Canceled
        );
    }

    public async Task<string> CreateSubscriptionSessionAsync(Guid userId, string priceId)
    {
        var subscription = await uow.Subscriptions.GetByUserIdAsync(userId);
        if (subscription == null)
        {
            var customerService = new CustomerService();
            var customerOptions = new CustomerCreateOptions
            {
                Metadata = new Dictionary<string, string>
                {
                    { "AppUserId", userId.ToString() }
                }
            };
            var stripeCustomer = await customerService.CreateAsync(customerOptions);

            var newSubscription = new Subscriptions
            {
                UserId = userId,
                StripeCustomerId = stripeCustomer.Id,
                Status = SubscriptionStatus.Incomplete,
                CreatedAt = DateTime.UtcNow
            };
            await uow.Subscriptions.AddAsync(newSubscription);
            await uow.CommitAsync();
        }

        var sessionService = new SessionService();
        var sessionOptions = new SessionCreateOptions
        {
            Customer = subscription.StripeCustomerId,
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new()
                {
                    Price = priceId,
                    Quantity = 1
                }
            },
            Mode = "subscription"
        };
        var session = await sessionService.CreateAsync(sessionOptions);
        return session.Url;
    }

    public Task<bool> HandleWebhookPaymentSucceededAsync(string stripeCustomerId, string invoiceId, DateTime periodEnd)
    {
        throw new NotImplementedException();
    }

    public Task<bool> CanTeacherInviteStudentAsync(Guid teacherId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> HandleWebhookSubscriptionDeletedAsync(string stripeSubscriptionId)
    {
        throw new NotImplementedException();
    }
}
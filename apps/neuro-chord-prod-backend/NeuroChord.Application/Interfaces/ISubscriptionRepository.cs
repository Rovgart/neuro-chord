using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface ISubscriptionRepository
{
    Task<Subscriptions?> GetByUserIdAsync(Guid userId);
    Task<Subscriptions?> GetByStripeCustomerId(string stripeCustomerId);
    Task<Subscriptions?> GetByStripeSubscriptionId(string stripeSubscriptionId);
    Task AddAsync(Subscriptions subscription);
    Task UpdateAsync(Subscriptions subscription);
    Task<bool> IsInvoiceProcessedAsync(string stripeInvoiceId);
}
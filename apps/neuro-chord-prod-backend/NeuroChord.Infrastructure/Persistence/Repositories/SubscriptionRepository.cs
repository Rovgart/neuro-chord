using Microsoft.EntityFrameworkCore;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Persistence.Repositories;

public class SubscriptionRepository(AppDbContext context) : ISubscriptionRepository
{
    public async Task<Subscriptions?> GetByUserIdAsync(Guid userId)
    {
        return await context.Subscriptions
            .Include(s => s.Plan)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<Subscriptions?> GetByStripeSubscriptionId(string stripeSubscriptionId)
    {
        return await context.Subscriptions.Where(s => s.StripeSubscriptionId == stripeSubscriptionId)
            .FirstOrDefaultAsync();
    }

    public async Task<Subscriptions?> GetByStripeCustomerId(string stripeCustomerId)
    {
        return await context.Subscriptions.AsNoTracking().Where(s => s.StripeCustomerId == stripeCustomerId)
            .SingleOrDefaultAsync();
    }

    public async Task AddAsync(Subscriptions subscription)
    {
        await context.Subscriptions.AddAsync(subscription);
    }

    public async Task UpdateAsync(Subscriptions subscription)
    {
        context.Subscriptions.Update(subscription);
        await Task.CompletedTask;
    }


    public async Task<bool> IsInvoiceProcessedAsync(string stripeInvoiceId)
    {
        return await context.Subscriptions.AnyAsync(s => s.LastInvoiceId == stripeInvoiceId);
    }

    public async Task<string?> GetPlanNameByUserIdAsync(Guid userId)
    {
        return await context.Subscriptions
            .Where(s => s.UserId == userId)
            .Select(s => s.Plan.PlanName)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<SubscriptionPlan>> GetSubscriptionPlans(CancellationToken cancellationToken = default)
    {
        return await context.SubscriptionPlans
            .AsNoTracking()
            .Where(p => p.IsActive)
            .ToListAsync();
    }
}
using Microsoft.Extensions.Logging;
using NeuroChord.Application.Interfaces;
using NeuroChord.Infrastructure.Interfaces;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;
using Stripe;
using Session = Stripe.Checkout.Session;

namespace NeuroChord.Infrastructure.Strategies;

public class CheckoutSessionCompletedStrategy(IUnitOfWork uow) : IWebhookStrategy
{
    public string EventType => "checkout.session.completed";

    public async Task HandleAsync(Event stripeEvent)
    {
        var session = stripeEvent.Data.Object as Session;
        if (session == null) return;

        var userIdString = session.Metadata.GetValueOrDefault("UserId");
        var planIdString = session.Metadata.GetValueOrDefault("PlanId");
        if (!Guid.TryParse(userIdString, out var userId) || !Guid.TryParse(planIdString, out var planId))
            return;
        var user = await uow.Users.GetByIdAsync(userId);
        var existingSub = await uow.Subscriptions.GetByUserIdAsync(userId);
        if (existingSub == null)
        {
            var newSubscription = new Subscriptions
            {
                UserId = userId,
                StripeCustomerId = session.CustomerId,
                StripeSubscriptionId = session.SubscriptionId,
                Status = SubscriptionStatus.Active,
                PlanId = planId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1)
            };
            await uow.Subscriptions.AddAsync(newSubscription);
        }
        else
        {
            existingSub.StripeSubscriptionId = session.SubscriptionId;
            existingSub.Status = SubscriptionStatus.Active;
            existingSub.PlanId = planId;
            existingSub.CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1);
            existingSub.UpdatedAt = DateTime.UtcNow;

            await uow.Subscriptions.UpdateAsync(existingSub);
        }

        user.Role = Role.Teacher;
        user.HasSelectedPlan = true;
        user.RegistrationStep = RegistrationStep.ProfileCompleted;

        await uow.Users.UpdateAsync(user);


        await uow.CommitAsync();
    }
}

public class CheckoutSessionExpiredStrategy(IUnitOfWork uow)
    : IWebhookStrategy
{
    public string EventType => "checkout.session_expired";

    public async Task HandleAsync(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Session session) return;
        var userIdString = session.Metadata.GetValueOrDefault("UserId");

        if (string.IsNullOrWhiteSpace(userIdString) || !Guid.TryParse(userIdString, out var userId)) return;
        var auditLog = new AuditLog
        {
            ActorId = userId,
            TargetId = userId,
            Type = AuditLogType.Security,
            EntityName = "Subscriptions",
            Details = "Checkout session failed ",
            CreatedAt = DateTime.UtcNow
        };
        await uow.AuditLogs.AddAsync(auditLog);
        await uow.CommitAsync();
    }
}

public class InvoicePaymentFailedStrategy(IUnitOfWork uow) : IWebhookStrategy
{
    public string EventType => "invoice.payment_failed";

    public async Task HandleAsync(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Invoice invoice) return;
        var userIdStr = invoice.Metadata.GetValueOrDefault("UserId");
        Subscriptions? existingSub;
        if (Guid.TryParse(userIdStr, out var userId))
        {
            existingSub = await uow.Subscriptions.GetByUserIdAsync(userId);
        }
        else
        {
            var stripeSubId = invoice.Parent?.SubscriptionDetails?.SubscriptionId;
            if (stripeSubId == null) return;
            existingSub = await uow.Subscriptions.GetByStripeSubscriptionId(stripeSubId);
        }


        if (existingSub == null) return;
        existingSub.Status = SubscriptionStatus.PastDue;
        existingSub.UpdatedAt = DateTime.UtcNow;
        var auditLog = new AuditLog
        {
            ActorId = existingSub.UserId,
            TargetId = existingSub.UserId,
            Type = AuditLogType.Security,
            EntityName = "Subscriptions",
            Details = "Invoice payment failed ",
            CreatedAt = DateTime.UtcNow
        };
        await uow.Subscriptions.UpdateAsync(existingSub);
        await uow.AuditLogs.AddAsync(auditLog);
        await uow.CommitAsync();
    }
}

public class InvoicePaymentSucceededStrategy(IUnitOfWork uow)
    : IWebhookStrategy
{
    public string EventType => "invoice.payment_succeeded";

    public async Task HandleAsync(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Invoice invoice) return;

        var userIdStr = invoice.Metadata.GetValueOrDefault("UserId");
        Subscriptions? existingSub;
        if (Guid.TryParse(userIdStr, out var userId))
        {
            existingSub = await uow.Subscriptions.GetByUserIdAsync(userId);
        }
        else
        {
            var stripeSubId = invoice.Parent?.SubscriptionDetails?.SubscriptionId;
            if (stripeSubId == null) return;
            existingSub = await uow.Subscriptions.GetByStripeSubscriptionId(stripeSubId);
        }

        if (existingSub == null) return;

        existingSub.CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1);
        existingSub.UpdatedAt = DateTime.UtcNow;
        var auditLogs = new AuditLog
        {
            ActorId = existingSub.UserId,
            TargetId = existingSub.UserId,
            Type = AuditLogType.Security,
            EntityName = "Subscriptions",
            Details = "Invoice payment succeeded ",
            CreatedAt = DateTime.UtcNow
        };
        await uow.Subscriptions.UpdateAsync(existingSub);
        await uow.AuditLogs.AddAsync(auditLogs);
        await uow.CommitAsync();
    }
}

public class CustomerSubscriptionDeletedStrategy(IUnitOfWork uow) : IWebhookStrategy
{
    public string EventType => "customer.subscription_deleted";

    public async Task HandleAsync(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Subscription stripeSub) return;
        var existingSub = await uow.Subscriptions.GetByStripeSubscriptionId(stripeSub.Id);
        if (existingSub == null) return;
        existingSub.Status = SubscriptionStatus.Canceled;
        existingSub.IsCancellationRequested = false;
        existingSub.UpdatedAt = DateTime.UtcNow;

        var auditLog = new AuditLog
        {
            ActorId = existingSub.UserId,
            TargetId = existingSub.UserId,
            Type = AuditLogType.Security,
            EntityName = "Subscriptions",
            Details = "Subscriptions deleted ",
            CreatedAt = DateTime.UtcNow
        };
        await uow.AuditLogs.AddAsync(auditLog);
        await uow.Subscriptions.UpdateAsync(existingSub);
        await uow.CommitAsync();
    }
}

public class CustomerSubscriptionUpdatedStrategy(IUnitOfWork uow, ILogger<CustomerSubscriptionUpdatedStrategy> logger)
    : IWebhookStrategy
{
    public string EventType => "customer.subscription.updated";

    public async Task HandleAsync(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is not Subscription stripeSub) return;
        var dbSub = await uow.Subscriptions.GetByStripeSubscriptionId(stripeSub.Id);
        if (dbSub == null) return;
        if (stripeSub.CancelAtPeriodEnd)
        {
            logger.LogInformation("Subscription {SubscriptionId} Cancelled", stripeSub.Id);
            dbSub.IsCancellationRequested = true;
        }
        else
        {
            dbSub.IsCancellationRequested = false;
        }

        dbSub.UpdatedAt = DateTime.UtcNow;

        await uow.Subscriptions.UpdateAsync(dbSub);
        await uow.CommitAsync();
    }
}
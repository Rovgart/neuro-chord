using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NeuroChord.Application.DTOs;
using NeuroChord.Application.Exceptions;
using NeuroChord.Application.Interfaces;
using NeuroChord.Infrastructure.Configuration;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;
using Stripe;
using Stripe.Checkout;

namespace NeuroChord.Infrastructure.Services;

public class SubscriptionService(
    IUnitOfWork uow,
    IOptions<StripeSettings> stripeOptions,
    ILogger<SubscriptionService> logger) : ISubscriptionService
{
    private readonly StripeSettings _settings = stripeOptions.Value;

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

    public async Task<string> CreateSubscriptionSessionAsync(Guid userId, string priceId, Guid planId)
    {
        var subscription = await uow.Subscriptions.GetByUserIdAsync(userId);

        if (subscription == null)
        {
            var customerService = new CustomerService();
            var customerOptions = new CustomerCreateOptions
            {
                Metadata = new Dictionary<string, string> { { "AppUserId", userId.ToString() } }
            };
            var stripeCustomer = await customerService.CreateAsync(customerOptions);

            subscription = new Subscriptions
            {
                UserId = userId,
                StripeCustomerId = stripeCustomer.Id,
                Status = SubscriptionStatus.Incomplete,
                PlanId = planId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await uow.Subscriptions.AddAsync(subscription);
            await uow.CommitAsync();
        }

        var sessionOptions = new SessionCreateOptions
        {
            Customer = subscription.StripeCustomerId,
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new() { Price = priceId, Quantity = 1 }
            },
            Mode = "subscription",
            CancelUrl = _settings.CancelUrl,
            SuccessUrl = _settings.SuccessUrl,

            Metadata = new Dictionary<string, string>
            {
                { "UserId", userId.ToString() },
                { "PlanId", planId.ToString() },
                { "PriceId", priceId }
            }
        };

        var sessionService = new SessionService();
        var session = await sessionService.CreateAsync(sessionOptions);
        return session.Url;
    }

    public async Task CancelSubscriptionAsync(Guid userId)
    {
        var sub = await uow.Subscriptions.GetByUserIdAsync(userId) ??
                  throw new NotFoundException($"Active subscription not found for user ID: {userId}");
        if (string.IsNullOrEmpty(sub.StripeSubscriptionId))
            throw new ConflictException("The subscription is not linked to the Stripe payment system.");
        var stripeService = new Stripe.SubscriptionService();
        var options = new SubscriptionUpdateOptions
        {
            CancelAtPeriodEnd = true
        };

        try
        {
            await stripeService.UpdateAsync(sub.StripeSubscriptionId, options);
            sub.IsCancellationRequested = true;
            sub.UpdatedAt = DateTime.UtcNow;

            await uow.Subscriptions.UpdateAsync(sub);
            await uow.CommitAsync();
        }
        catch (StripeException ex)
        {
            logger.LogError(ex, "Stripe error during cancellation for subscription: {SubId}", sub.StripeSubscriptionId);
            throw new ConflictException("Could not process the cancellation request with the payment provider.");
        }
    }

    public async Task<GetSubscriptionStatusResponse> GetSubscriptionStatus(Guid userId)
    {
        var sub = await uow.Subscriptions.GetByUserIdAsync(userId);
        if (sub == null)
            return new GetSubscriptionStatusResponse(
                SubscriptionStatus.Trailing,
                false,
                DateTime.MinValue,
                "Free"
            );

        return new GetSubscriptionStatusResponse(
            sub.Status,
            sub.IsCancellationRequested,
            sub.CurrentPeriodEnd,
            sub.Plan.PlanName
        );
    }

    public async Task<List<InvoiceDto>> GetUserInvoicesAsync(Guid userId)
    {
        var sub = await uow.Subscriptions.GetByUserIdAsync(userId);
        if (sub == null) return new List<InvoiceDto>();

        var invoiceService = new InvoiceService();
        var options = new InvoiceListOptions
        {
            Customer = sub.StripeCustomerId,
            Limit = 12
        };
        StripeList<Invoice> invoices = await invoiceService.ListAsync(options);
        return invoices.Select(inv => new InvoiceDto(
            inv.Id,
            inv.AmountPaid,
            inv.Currency.ToUpper(),
            inv.Status,
            inv.HostedInvoiceUrl,
            inv.InvoicePdf,
            inv.Created
        )).ToList();
    }

    public async Task<ReactivateSubResponseDto> ReactivateSubscriptionAsync(Guid userId)
    {
        var sub = await uow.Subscriptions.GetByUserIdAsync(userId) ??
                  throw new NotFoundException("Subscription not found for user ID: {UserId}");

        var service = new Stripe.SubscriptionService();
        var options = new SubscriptionUpdateOptions
        {
            CancelAtPeriodEnd = false
        };
        try
        {
            await service.UpdateAsync(sub.StripeSubscriptionId, options);
            sub.IsCancellationRequested = false;
            sub.UpdatedAt = DateTime.UtcNow;
            sub.Status = SubscriptionStatus.Active;
            await uow.Subscriptions.UpdateAsync(sub);
            await uow.CommitAsync();
            return new ReactivateSubResponseDto("Subscription reactivated successfully", false,
                SubscriptionStatus.Active);
        }
        catch (StripeException ex)
        {
            logger.LogError(ex, "Failed to reactivate Stripe sub: {SubId}", sub.StripeSubscriptionId);
            throw new ConflictException("Stripe rejected the reactivation request.");
        }
    }

    public Task<bool> CanTeacherInviteStudentAsync(Guid teacherId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> HandleWebhookSubscriptionDeletedAsync(string stripeSubscriptionId)
    {
        throw new NotImplementedException();
    }

    public async Task<CreateCustomerPortalSessionResponse> CreateCustomerPortalSessionAsync(Guid userId,
        string returnUrl)
    {
        var sub = await uow.Subscriptions.GetByUserIdAsync(userId) ??
                  throw new NotFoundException("Subscription not found for user ID: {UserId}");
        var service = new Stripe.BillingPortal.SessionService();
        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = sub.StripeCustomerId,
            ReturnUrl = returnUrl
        };

        try
        {
            var session = await service.CreateAsync(options);
            return new CreateCustomerPortalSessionResponse(session.Url);
        }
        catch (StripeException ex)
        {
            logger.LogError(ex, "Failed to generate Stripe Customer Portal for Customer: {CustomerId}",
                sub.StripeCustomerId);
            throw new ConflictException("Failed to connect with billing portal");
        }
    }
}
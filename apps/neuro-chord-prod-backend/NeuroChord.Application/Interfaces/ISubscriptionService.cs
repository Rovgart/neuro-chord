using NeuroChord.Application.DTOs;

namespace NeuroChord.Application.Interfaces;

public interface ISubscriptionService
{
    Task<string> CreateSubscriptionSessionAsync(Guid userId, string priceId, Guid planId);

    Task<bool> HandleWebhookPaymentSucceededAsync(string stripeCustomerId, string invoiceId, DateTime periodEnd);

    Task<bool> HandleWebhookSubscriptionDeletedAsync(string stripeSubscriptionId);

    Task<bool> CanTeacherInviteStudentAsync(Guid teacherId);

    Task<SubscriptionStatusDto> GetUserSubscriptionStatusAsync(Guid userId);
}
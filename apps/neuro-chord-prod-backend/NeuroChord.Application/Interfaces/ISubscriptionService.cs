using NeuroChord.Application.DTOs;

namespace NeuroChord.Application.Interfaces;

public interface ISubscriptionService
{
    Task<string> CreateSubscriptionSessionAsync(Guid userId, string priceId, Guid planId);

    Task CancelSubscriptionAsync(Guid userId);

    Task<List<InvoiceDto>> GetUserInvoicesAsync(Guid userId);

    Task<GetSubscriptionStatusResponse> GetSubscriptionStatus(Guid userId);

    Task<ReactivateSubResponseDto> ReactivateSubscriptionAsync(Guid userId);

    Task<CreateCustomerPortalSessionResponse> CreateCustomerPortalSessionAsync(Guid userId, string returnUrl);

    Task<bool> HandleWebhookSubscriptionDeletedAsync(string stripeSubscriptionId);

    Task<bool> CanTeacherInviteStudentAsync(Guid teacherId);

    Task<SubscriptionStatusDto> GetUserSubscriptionStatusAsync(Guid userId);
}
using NeuroChord.Application.DTOs;

namespace NeuroChord.Application.Interfaces;

public interface ISubscriptionService
{
    Task<string> CreateSubscriptionSessionAsync(Guid userId, string priceId);

    // 2. WEBHOOK: Główna logika procesowania płatności (Idempotentna!)
    Task<bool> HandleWebhookPaymentSucceededAsync(string stripeCustomerId, string invoiceId, DateTime periodEnd);

    // 3. WEBHOOK: Obsługa anulowania lub wygaśnięcia
    Task<bool> HandleWebhookSubscriptionDeletedAsync(string stripeSubscriptionId);

    // 4. LOGIKA BIZNESOWA: Czy nauczyciel może jeszcze kogoś zaprosić?
    Task<bool> CanTeacherInviteStudentAsync(Guid teacherId);

    // 5. STATUS: Pobranie szczegółów subskrypcji dla UI
    Task<SubscriptionStatusDto> GetUserSubscriptionStatusAsync(Guid userId);
}
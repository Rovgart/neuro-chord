namespace NeuroChord.Application.Interfaces;

public interface INeuroChordEmailService
{
    Task SendWelcomeEmailAsync(string email, string activationLink);
    Task SendVerificationLinkAsync(string email, string userName, string link);
    Task SendPasswordRecoveryPinAsync(string email, string pin);
}
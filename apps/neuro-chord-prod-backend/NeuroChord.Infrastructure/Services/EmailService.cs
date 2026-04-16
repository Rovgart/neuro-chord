using FluentEmail.Core;
using NeuroChord.Application.Emails;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Infrastructure.Services;

public class EmailService : INeuroChordEmailService
{
    private readonly IFluentEmail _fluentEmail;

    public EmailService(IFluentEmail fluentEmail)
    {
        _fluentEmail = fluentEmail;
    }


    public async Task SendPasswordRecoveryPinAsync(string email, string pin)
    {
        var cleanEmail = email?.Trim();
        var model = new ResetPasswordEmail { Email = cleanEmail, PIN = pin };

        var assembly = GetType().Assembly;
        var names = assembly.GetManifestResourceNames();

        var recoveryTemplateName = names.FirstOrDefault(n => n.EndsWith("ResetPassword.cshtml"));
        if (string.IsNullOrEmpty(recoveryTemplateName)) return;

        await _fluentEmail
            .To(cleanEmail)
            .Subject("NeuroChord - Password Recovery PIN 🛡️")
            .UsingTemplateFromEmbedded(recoveryTemplateName, model, assembly)
            .SendAsync();
    }

    public Task SendVerificationLinkAsync(string email, string userName, string link)
    {
        throw new NotImplementedException();
    }

    public async Task SendWelcomeEmailAsync(string email, string activationLink)
    {
        var cleanEmail = email?.Trim();
        var model = new { Email = cleanEmail, ActivationLink = activationLink };

        var assembly = GetType().Assembly;
        var names = assembly.GetManifestResourceNames();


        var welcomeTemplateName = names.FirstOrDefault(n => n.EndsWith("Welcome.cshtml"));


        await _fluentEmail
            .To(cleanEmail)
            .Subject("Welcome to NeuroChord!")
            .UsingTemplateFromEmbedded(welcomeTemplateName, model, assembly)
            .SendAsync();
    }
}
using FluentValidation;
using NeuroChord.Application.DTOs;

namespace NeuroChord.Api.Validators;

public class ResetPasswordValidator : AbstractValidator<ResetPasswordDto>
{
    public ResetPasswordValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email address is required.")
            .EmailAddress().WithMessage("The provided email format is invalid.")
            .MaximumLength(255).WithMessage("Email is too long.");

        RuleFor(x => x.Pin)
            .NotEmpty().WithMessage("PIN code is required.")
            .Length(6).WithMessage("PIN code must be exactly 6 characters long.")
            .Matches(@"^[0-9]+$").WithMessage("PIN code must contain digits only.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .MaximumLength(100).WithMessage("Password is too long.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one digit.")
            .Matches(@"[\!\?\*\.]").WithMessage("Password must contain at least one special character (!?*.).");
    }
}
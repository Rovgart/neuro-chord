using FluentValidation;
using NeuroChord.Application.DTOs;

namespace NeuroChord.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email nie może być pusty")
            .EmailAddress().WithMessage("To nie jest poprawny format email");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Hasło musi mieć minimum 8 znaków")
            .Matches("[A-Z]").WithMessage("Hasło musi mieć dużą literę");
    }
}
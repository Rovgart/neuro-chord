using FluentValidation;
using NeuroChord.Application.Dtos.Profile;
using NeuroChordDomain.Enums;

namespace NeuroChord.Api.Validators;

public class CreateProfileValidator : AbstractValidator<CreateProfileDto>
{
    public CreateProfileValidator()
    {
        RuleFor(x => x.DisplayName)
            .NotEmpty().WithMessage("Display name is required.")
            .MinimumLength(3).WithMessage("Display name must be at least 3 characters long.")
            .MaximumLength(50).WithMessage("Display name cannot exceed 50 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Role is required.")
            .Must(role => role == Role.Student || role == Role.Teacher)
            .WithMessage("Role must be either 'Student' or 'Teacher'.");

        RuleFor(x => x.Username)
            .MinimumLength(3).WithMessage("Username must be at least 3 characters long.")
            .Matches(@"^[a-zA-Z0-9._]+$")
            .WithMessage("Username can only contain letters, numbers, dots, and underscores.")
            .When(x => !string.IsNullOrEmpty(x.Username));


        RuleFor(x => x.Specialization)
            .MaximumLength(100).WithMessage("Specialization cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Specialization));


        RuleFor(x => x.ImgUrl)
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Invalid image URL format.")
            .When(x => !string.IsNullOrEmpty(x.ImgUrl));
    }
}
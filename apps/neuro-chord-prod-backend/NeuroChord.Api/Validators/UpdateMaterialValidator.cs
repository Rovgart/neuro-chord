using FluentValidation;
using NeuroChord.Application.DTOs.Materials;

namespace NeuroChord.Api.Validators;

public class UpdateMaterialValidator : AbstractValidator<UpdateMaterialDto>
{
    public UpdateMaterialValidator()
    {
        RuleFor(x => x.Topic)
            .NotEmpty().WithMessage("Topic cannot be empty.")
            .MaximumLength(200).WithMessage("Topic is too long.");

        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("URL cannot be empty.")
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Invalid URL format.");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid material type.");
    }
}
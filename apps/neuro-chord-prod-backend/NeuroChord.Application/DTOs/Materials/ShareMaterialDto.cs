using NeuroChordDomain.Enums;

namespace NeuroChord.Application.DTOs.Materials;

public record ShareMaterialDto
{
    public Guid MaterialId { get; init; }

    public Guid TargetId { get; init; }


    public AccessLevel AccessLevel { get; init; } = AccessLevel.Viewer;
}
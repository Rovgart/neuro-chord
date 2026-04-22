using NeuroChordDomain.Enums;

namespace NeuroChord.Application.DTOs.Materials;

public record UpdateMaterialDto(
    string Topic,
    string Url,
    MaterialType Type,
    bool IsPublic,
    Guid? FolderId,
    bool RequiresSubscription
);
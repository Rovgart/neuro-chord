using NeuroChordDomain.Enums;

namespace NeuroChord.Application.DTOs.Materials;

public record MaterialResponseDto(
    Guid Id,
    string Topic,
    string Url,
    MaterialType Type,
    bool IsPublic,
    Guid? FolderId,
    bool RequiresSubscription,
    DateTime CreatedAt
);
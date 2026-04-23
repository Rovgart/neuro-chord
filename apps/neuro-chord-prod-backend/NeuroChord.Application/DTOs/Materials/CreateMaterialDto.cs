using Microsoft.AspNetCore.Http;
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.DTOs.Materials;

public record CreateMaterialDto
{
    public string Topic { get; init; } = string.Empty;
    public MaterialType Type { get; init; }
    public string? Url { get; init; }
    public IFormFile? File { get; init; }
    public bool IsPublic { get; init; }
    public Guid? FolderId { get; init; }
    public bool RequiresSubscription { get; init; }
}
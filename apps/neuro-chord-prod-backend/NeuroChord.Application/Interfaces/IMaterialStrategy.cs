using NeuroChord.Application.DTOs.Materials;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Interfaces;

public interface IMaterialProcessingStrategy
{
    MaterialType type { get; }
    Task ProcessAsync(Material material, CreateMaterialDto dto);
}
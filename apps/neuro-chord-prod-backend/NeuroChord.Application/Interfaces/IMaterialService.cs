using NeuroChord.Application.DTOs.Materials;

namespace NeuroChord.Application.Interfaces;

public interface IMaterialService
{
    Task<MaterialResponseDto> GetMaterialByIdAsync(Guid id);
    Task<IEnumerable<MaterialResponseDto>> GetUserMaterialsAsync(Guid userId);

    Task<MaterialResponseDto> CreateMaterialAsync(CreateMaterialDto dto, Guid userId);
    Task<MaterialResponseDto> UpdateMaterialAsync(Guid materialId, UpdateMaterialDTO dto, Guid userId);

    Task<bool> DeleteMaterialAsync(Guid materialId, Guid userId);
    Task<bool> DeleteAllUserMaterialsAsync(Guid userId);
}
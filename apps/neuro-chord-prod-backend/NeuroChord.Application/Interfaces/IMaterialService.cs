using NeuroChord.Application.DTOs.Materials;

namespace NeuroChord.Application.Interfaces;

public interface IMaterialService
{
    Task<MaterialResponseDto> GetMaterialByIdAsync(Guid id, Guid currentUserId);
    Task<IEnumerable<MaterialResponseDto>> GetUsersMaterialsAsync(Guid currentUserId);
    Task<MaterialResponseDto> CreateMaterialAsync(CreateMaterialDto dto, Guid userId);
    Task<MaterialResponseDto> UpdateMaterialAsync(Guid materialId, UpdateMaterialDto dto, Guid userId);

    Task DeleteMaterialAsync(Guid materialId, Guid userId);
    Task<bool> DeleteAllUserMaterialsAsync(Guid userId);

    Task<IEnumerable<MaterialResponseDto>> GetSharedMaterialsWithMeAsync(Guid currentUserId);


    Task HandleSharingAsync(ShareMaterialDto dto, Guid currentUserId);
}
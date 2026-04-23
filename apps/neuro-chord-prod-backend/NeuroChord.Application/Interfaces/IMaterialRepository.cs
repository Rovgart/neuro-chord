using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface IMaterialRepository
{
    Material AddMaterial(Material material);
    Task<Material?> GetMaterial(Guid id, Guid currentUserId);
    Task<List<Material>> GetAllUserMaterials(Guid? userId, Guid currentUserId);
    Material UpdateMaterial(Material material);

    Task<bool> DeleteUserMaterial(Guid userId, Guid materialId);
    Task<bool> DeleteAllUserMaterials(Guid userId);
}
using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface IMaterialRepository
{
    Material AddMaterial(Material material);
    Task<Material?> GetByIdAsync(Guid id);
    Material UpdateMaterial(Material material);

    Task<bool> DeleteAllUserMaterials(Guid userId);
    public Task<List<Material>> GetUsersMaterials(Guid userId);
    public Task<Material?> GetByIdWithTrackingAsync(Guid id);

    public void Remove(Material material);
}
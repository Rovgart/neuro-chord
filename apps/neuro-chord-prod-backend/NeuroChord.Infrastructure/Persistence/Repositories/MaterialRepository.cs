using Microsoft.EntityFrameworkCore;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Persistence.Repositories;

public class MaterialRepository(AppDbContext context) : IMaterialRepository
{
    public Material AddMaterial(Material material)
    {
        context.Materials.Add(material);
        return material;
    }

    public async Task<Material?> GetMaterial(Guid id)
    {
        return await context.Materials.FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<bool> DeleteAllUserMaterials(Guid userId)
    {
        var deletedRows = await context.Materials.Where(m => m.OwnerId == userId).ExecuteDeleteAsync();
        return deletedRows > 0;
    }

    public async Task<bool> DeleteUserMaterial(Guid userId, Guid materialId)
    {
        var deletedMaterial = await context.Materials.Where(m => m.OwnerId == userId && m.Id == materialId)
            .ExecuteDeleteAsync();
        return deletedMaterial > 0;
    }

    public Material UpdateMaterial(Material material)
    {
        context.Materials.Update(material);
        return material;
    }

    public async Task<List<Material>> GetAllUserMaterials(Guid userId)
    {
        return await context.Materials.Where(u => u.OwnerId == userId).ToListAsync();
    }

    public async Task<List<Material>> GetAllMaterials(Guid userId)
    {
        return await context.Materials.Where(u => u.OwnerId == userId).ToListAsync();
    }
}
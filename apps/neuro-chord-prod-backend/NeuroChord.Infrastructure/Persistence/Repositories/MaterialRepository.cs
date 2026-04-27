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

    public async Task<bool> DeleteAllUserMaterials(Guid userId)
    {
        var deletedRows = await context.Materials.Where(m => m.OwnerId == userId).ExecuteDeleteAsync();
        return deletedRows > 0;
    }

    public Material UpdateMaterial(Material material)
    {
        context.Materials.Update(material);
        return material;
    }

    public async Task<Material?> GetByIdAsync(Guid id)
    {
        return await context.Materials
            .AsNoTracking()
            .Where(m => m.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<Material?> GetByIdWithTrackingAsync(Guid id)
    {
        return await context.Materials
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<List<Material>> GetOwned(Guid id)
    {
        return await context.Materials.AsNoTracking()
            .Where(m => m.OwnerId == id).ToListAsync();
    }

    public async Task<List<Material>> GetSharedWithMe(Guid targetUserId)
    {
        return await context.Materials
            .AsNoTracking()
            .Where(m => context.SharedResources.Any(sr =>
                sr.TargetId == targetUserId &&
                sr.MaterialId == m.Id))
            .ToListAsync();
    }

    public async Task<List<Material>> GetPublicUserMaterials(Guid userId)
    {
        return await context.Materials
            .AsNoTracking()
            .Where(m => m.IsPublic && m.OwnerId == userId)
            .ToListAsync();
    }

    public async Task<bool> DeleteMaterial(Guid materialId)
    {
        var material = await context.Materials.FindAsync(materialId);
        if (material == null) return false;
        context.Materials.Remove(material);
        return true;
    }

    public void Remove(Material material)
    {
        context.Materials.Remove(material);
    }

    public async Task<List<Material>> GetUsersMaterials(Guid userId)
    {
        return await context.Materials
            .AsNoTracking()
            .Where(m => m.OwnerId == userId)
            .ToListAsync();
    }

    public async Task<bool> DeleteUserMaterial(Guid userId, Guid materialId)
    {
        var deletedMaterial = await context.Materials.Where(m => m.OwnerId == userId && m.Id == materialId)
            .ExecuteDeleteAsync();
        return deletedMaterial > 0;
    }

    public async Task<List<Material>> GetOwnedMaterials(Guid ownerId)
    {
        return await context.Materials.AsNoTracking()
            .Where(m => m.OwnerId == ownerId)
            .ToListAsync();
    }
}
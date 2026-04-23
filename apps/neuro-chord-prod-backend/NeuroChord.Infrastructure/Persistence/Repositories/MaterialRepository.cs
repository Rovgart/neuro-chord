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

    public async Task<Material?> GetMaterial(Guid id, Guid currentUserId)
    {
        return await context.Materials
            .AsNoTracking()
            .Where(m => m.Id == id)
            .Where(m =>
                m.OwnerId == currentUserId ||
                m.IsPublic ||
                context.SharedResources.Any(sr =>
                    sr.TargetId == currentUserId &&
                    (sr.MaterialId == m.Id || (m.FolderId != null && sr.FolderId == m.FolderId))
                )
            )
            .FirstOrDefaultAsync();
    }

    public async Task<List<Material>> GetAllUserMaterials(Guid? userId, Guid currentUserId)
    {
        return await context.Materials
            .AsNoTracking()
            .Where(m => m.OwnerId == currentUserId)
            .Where(m =>
                m.IsPublic ||
                m.OwnerId == currentUserId ||
                context.SharedResources.Any(sr =>
                    sr.MaterialId == m.Id &&
                    sr.TargetId == currentUserId
                )
            )
            .ToListAsync();
    }
}
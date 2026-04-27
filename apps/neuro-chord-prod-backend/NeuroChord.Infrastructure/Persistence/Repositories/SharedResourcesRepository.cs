using Microsoft.EntityFrameworkCore;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Persistence.Repositories;

public class SharedResourcesRepository(AppDbContext context) : ISharedResourcesRepository
{
    public void ShareMaterial(SharedResources sharedResources)
    {
        context.SharedResources.AddAsync(sharedResources);
    }

    public async Task<bool> IsMaterialSharedWithUser(Guid materialId, Guid userId)
    {
        return await context.SharedResources.AnyAsync(sr => sr.MaterialId == materialId && sr.TargetId == userId);
    }

    public async Task<List<SharedResources>> GetSharedWithMe(Guid currentUserId)
    {
        return await context.SharedResources
            .AsNoTracking()
            .Where(sr => sr.TargetId == currentUserId)
            .Include(sr => sr.Material)
            .ToListAsync();
    }

    public void Add(SharedResources sharedResources)
    {
        context.SharedResources.Add(sharedResources);
    }
}
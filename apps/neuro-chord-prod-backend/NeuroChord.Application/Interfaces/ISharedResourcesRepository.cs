using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface ISharedResourcesRepository
{
    void ShareMaterial(SharedResources sharedResources);

    Task<bool> IsMaterialSharedWithUser(Guid materialId, Guid userId);

    Task<List<SharedResources>> GetSharedWithMe(Guid currentUserId);

    void Add(SharedResources sharedResources);
}
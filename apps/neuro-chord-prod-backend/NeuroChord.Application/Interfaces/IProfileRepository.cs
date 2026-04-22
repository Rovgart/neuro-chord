using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface IProfileRepository
{
    Task<Profile> GetByUserIdAsync(Guid userId);
    Task<Profile?> GetByIdAsync(Guid id);
    void Update(Profile profile);
    Task<bool> SaveChangesAsync();

    Task<bool> ProfileExistsAsync(Guid userId);

    Task CreateAsync(Profile profile);
}
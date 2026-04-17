using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface IProfileRepository
{
    Task<Profile> GetByUserIdAsync(string userId);
    Task<Profile?> GetByIdAsync(string id);
    void Update(Profile profile);
    Task<bool> SaveChangesAsync();

    Task<bool> ProfileExistsAsync(string userId);

    Task CreateAsync(Profile profile);
}
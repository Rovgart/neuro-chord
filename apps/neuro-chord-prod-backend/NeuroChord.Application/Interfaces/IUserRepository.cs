using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task AddUserAsync(User user);

    Task UpdateVerificationStatusAsync(string id, bool isVerified);
    Task UpdateRoleAsync(string id, Role role);
    Task<bool> SaveChangesAsync();
}
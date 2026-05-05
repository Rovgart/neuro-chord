using NeuroChord.Application.DTOs;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<UserInternalAuthDto?> GetByEmailAsync(string email);
    Task AddUserAsync(User user);

    Task UpdateVerificationStatusAsync(Guid id, bool isVerified);
    Task UpdateRoleAsync(Guid id, Role role);
    Task<bool> SaveChangesAsync();

    Task DeleteUserAsync(Guid id);
    Task<User?> GetUserEntityByEmailAsync(string email);
    Task<List<User>> GetUsersByRoleAsync(Role role);

    Task ChangeRoleAsync(User user, Role role);

    Task<bool> IsEmailAvailable(string email);
}
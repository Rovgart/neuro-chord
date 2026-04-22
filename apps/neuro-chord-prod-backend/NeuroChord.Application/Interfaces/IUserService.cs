using NeuroChord.Application.DTOs;
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Interfaces;

public interface IUserService
{
    Task<UserInternalAuthDto> GetUserForAuthByEmail(string email);
    Task<UserDto> GetUserById(Guid id);
    Task<UserDto> UpdateUserStatusAsync(Guid id, bool isVerified);
    Task<UserDto> UpdateUserRoleAsync(Guid id, Role role);
    Task<bool> MarkEmailAsVerifiedAsync(string email);

    Task<UserDto> CreateUser(CreateUserRequest request);

    Task<bool> UpdateUserPasswordAsync(string email, string newPassword);

    Task DeleteUserAsync(Guid id);
}
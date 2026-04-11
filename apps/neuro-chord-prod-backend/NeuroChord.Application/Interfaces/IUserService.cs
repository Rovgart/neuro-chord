using NeuroChord.Application.DTOs;
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Interfaces;

public interface IUserService
{
    Task<UserDto> GetUserByEmail(string email);
    Task<UserDto> GetUserById(string id);
    Task<UserDto> UpdateUserStatusAsync(string id, bool isVerified);
    Task<UserDto> UpdateUserRoleAsync(string id, Role role);
    Task<UserDto> CreateUser(CreateUserRequest request);

    Task DeleteUserAsync(string id);
}
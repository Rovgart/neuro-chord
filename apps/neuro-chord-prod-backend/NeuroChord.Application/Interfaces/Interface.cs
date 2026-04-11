using NeuroChord.Application.DTOs;

namespace NeuroChord.Application.Interfaces;

public interface IUserService
{
    Task<UserDto> GetUserByEmail(string email);
    Task<UserDto> GetUserById(string id);
    Task<UserDto> UpdateUser(string id);
    Task<bool> DeleteUser(string id);
    Task<UserDto> CreateUser(CreateUserRequest request);
}
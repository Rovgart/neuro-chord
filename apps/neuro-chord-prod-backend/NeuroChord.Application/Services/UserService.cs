using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Services;

public class UserService : IUserService
{
    private readonly ISecurityService _securityService;
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository, ISecurityService securityService)
    {
        _userRepository = userRepository;
        _securityService = securityService;
    }

    public Task<bool> DeleteUser(string id)
    {
        throw new NotImplementedException();
    }

    public async Task<UserDto> GetUserById(string id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) throw new KeyNotFoundException($"User with id {id} not found");

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email
        };
    }

    public async Task<UserDto> GetUserByEmail(string email)
    {
        var existingUser = await _userRepository.GetByEmailAsync(email);
        if (existingUser == null) throw new KeyNotFoundException($"User with email {email} not found");

        return new UserDto
        {
            Id = existingUser.Id,
            Email = existingUser.Email
        };
    }

    public async Task<UserDto> CreateUser(CreateUserRequest request)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null) throw new KeyNotFoundException("User with this email already exists");
        var hashedPassword = _securityService.HashPassword(request.Password);
        var newUser = new User
        {
            Email = request.Email,
            PasswordHash = hashedPassword,
            RegistrationStep = RegistrationStep.AccountCreated,
            IsVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _userRepository.AddUserAsync(newUser);
        var success = await _userRepository.SaveChangesAsync();
        if (!success) throw new KeyNotFoundException("User creation failed");

        return new UserDto
        {
            Id = newUser.Id,
            Email = newUser.Email
        };
    }

    public Task<UserDto> UpdateUser(string id)
    {
        throw new NotImplementedException();
    }
}
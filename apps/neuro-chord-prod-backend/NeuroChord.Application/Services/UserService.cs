using NeuroChord.Application.DTOs;
using NeuroChord.Application.Exceptions;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Services;

public class UserService : IUserService
{
    private readonly ISecurityService _securityService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository, ISecurityService securityService, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _securityService = securityService;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserDto> GetUserById(string id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) throw new NotFoundException($"User with id {id} not found");

        return MapToDto(user);
    }

    public async Task<UserInternalAuthDto> GetUserForAuthByEmail(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null) throw new NotFoundException("User with this email not found");

        return new UserInternalAuthDto
        {
            Id = user.Id,
            Email = user.Email,
            PasswordHash = user.PasswordHash,
            Role = user.Role.ToString(),
            IsVerified = user.IsVerified
        };
    }

    public async Task<UserDto> CreateUser(CreateUserRequest request)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null) throw new ConflictException("User with this email already exists");

        var newUser = new User
        {
            Email = request.Email,
            PasswordHash = _securityService.HashPassword(request.Password),
            RegistrationStep = RegistrationStep.AccountCreated,
            IsVerified = false,
            Role = Role.Unassigned,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddUserAsync(newUser);

        await _unitOfWork.SaveChangesAsync();

        return MapToDto(newUser);
    }

    public async Task<UserDto> UpdateUserRoleAsync(string id, Role role)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) throw new NotFoundException($"User with id {id} not found");

        await _userRepository.UpdateRoleAsync(id, role);

        return MapToDto(user);
    }

    public async Task<UserDto> UpdateUserStatusAsync(string id, bool isVerified)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) throw new NotFoundException($"User with id {id} not found");
        await _userRepository.UpdateVerificationStatusAsync(user.Id, isVerified);
        return MapToDto(user);
    }

    public async Task DeleteUserAsync(string id)
    {
        await _userRepository.DeleteUserAsync(id);
    }

    public async Task<bool> MarkEmailAsVerifiedAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null) return false;

        user.IsVerified = true;
        await _userRepository.SaveChangesAsync();
        return true;
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsVerified = user.IsVerified
        };
    }
}
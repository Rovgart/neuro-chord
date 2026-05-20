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

    public async Task<UserInternalAuthDto> GetUserForAuthByEmail(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null) throw new NotFoundException("User with this email not found");

        return user;
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

    public async Task<bool> MarkEmailAsVerifiedAsync(string email)
    {
        var user = await _userRepository.GetUserEntityByEmailAsync(email);
        if (user == null) return false;

        user.IsVerified = true;
        await _userRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateUserPasswordAsync(string email, string newPassword)
    {
        var user = await _userRepository.GetUserEntityByEmailAsync(email);
        if (user == null) return false;
        user.PasswordHash = newPassword;
        await _userRepository.SaveChangesAsync();
        return true;
    }

    public async Task<UserDto> UpdateUserStatusAsync(Guid id, bool isVerified)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) throw new NotFoundException($"User with id {id} not found");
        await _userRepository.UpdateVerificationStatusAsync(user.Id, isVerified);
        return MapToDto(user);
    }

    public async Task<UserDto> GetUserById(Guid id)
    {
        // 1. Pobieramy użytkownika z relacjami (Twój obecny kod)
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) throw new NotFoundException($"User with id {id} not found");

        // 2. Mapujemy encję na podstawowe DTO
        var dto = MapToDto(user);

        // 3. Jeśli to Nauczyciel, który przeszedł onboarding, wyciągamy jego plan ze Stripe
        if (user.Role == Role.Teacher && user.HasSelectedPlan)
        {
            var planName = await _unitOfWork.Subscriptions.GetPlanNameByUserIdAsync(id);

            dto.SubscriptionPlanName = planName ?? "None";
        }
        else
        {
            dto.SubscriptionPlanName = "None";
        }

        return dto;
    }

    public async Task<UserDto> UpdateUserRoleAsync(Guid id, Role role)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) throw new NotFoundException($"User with id {id} not found");

        await _userRepository.UpdateRoleAsync(id, role);

        return MapToDto(user);
    }

    public async Task DeleteUserAsync(Guid id)
    {
        await _userRepository.DeleteUserAsync(id);
    }


    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id.ToString(),
            Email = user.Email,
            Role = user.Role.ToString(),
            IsVerified = user.IsVerified,
            ProfileId = user.Id.ToString() ?? ""
        };
    }
}
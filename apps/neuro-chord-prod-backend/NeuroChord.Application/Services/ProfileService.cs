using NeuroChord.Application.DTOs;
using NeuroChord.Application.Dtos.Profile;
using NeuroChord.Application.DTOs.Profile;
using NeuroChord.Application.Exceptions;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;
using Org.BouncyCastle.Security;

namespace NeuroChord.Application.Services;

public class ProfileService : IProfileService
{
    private readonly IJwtService _jwtService;
    private readonly IProfileRepository _profileRepository;
    private readonly IFileStorageService _storageService;
    private readonly IUnitOfWork _uow;
    private readonly IUserRepository _userRepository;

    public ProfileService(IProfileRepository profileRepository, IUserRepository userRepository,
        IFileStorageService storageService, IUnitOfWork unitOfWork, IJwtService jwtService)
    {
        _profileRepository = profileRepository;
        _userRepository = userRepository;
        _storageService = storageService;
        _uow = unitOfWork;
        _jwtService = jwtService;
    }

    public async Task<ProfileResponseDto> GetByUserIdAsync(Guid userId)
    {
        // Przypominajka: Repozytorium musi dociągać Include(p => p.User).ThenInclude(...)
        var profile = await _profileRepository.GetByUserIdAsync(userId);

        if (profile == null) return null;

        return new ProfileResponseDto(
            profile.UserId.ToString(), // Zmienione z Id na UserId
            profile.DisplayName,
            profile.Description,
            profile.ImgUrl,
            profile.User.Role.ToString(),
            profile.User.StudentProfile != null
                ? new StudentProfileDto(
                    profile.User.StudentProfile.Username,
                    profile.User.StudentProfile.ExperienceLevel)
                : null,
            profile.User.TeacherProfile != null
                ? new TeacherProfileDto(
                    profile.User.TeacherProfile.Specialization,
                    profile.User.TeacherProfile.Education,
                    profile.User.TeacherProfile.CreatedAt)
                : null,
            profile.CreatedAt
        );
    }

    public async Task<AuthResponseDto> CreateProfileAsync(Guid userId, Guid sessionId, CreateProfileDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || user.OnboardingComplete) throw new ConflictException("Profile already exists");

        if (!Enum.TryParse<Role>(dto.Role.ToString(), out var assignedRole))
            throw new ConflictException("Invalid role");


        user.Profile = new Profile
        {
            UserId = userId,
            DisplayName = dto.DisplayName,
            Description = dto.Description,
            ImgUrl = dto.ImgUrl ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        if (assignedRole == Role.Student)
        {
            user.StudentProfile = new StudentProfile
            {
                User = user,
                Username = dto.Username ?? user.Email.Split('@')[0],
                ExperienceLevel = 1
            };
            user.Role = Role.Student;
        }
        else if (assignedRole == Role.Teacher)
        {
            user.TeacherProfile = new TeacherProfile
            {
                UserId = userId,
                Specialization = dto.Specialization ?? "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            var teacherApplication = new TeacherApplication
            {
                UserId = userId,
                Specialization = dto.Specialization ?? "General",
                Bio = dto.Description,
                Status = ApplicationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _uow.TeacherApplications.AddAsync(teacherApplication);

            user.Role = Role.TeacherPending;
        }

        user.OnboardingComplete = true;
        user.RegistrationStep = RegistrationStep.Onboarded;
        var success = await _uow.SaveChangesAsync() > 0;
        if (!success) throw new KeyException("Error during updating profile in db");
        var payload = new AccessTokenPayload(
            user.Id.ToString(),
            user.Email,
            user.Role.ToString(),
            sessionId.ToString(),
            user.Profile.UserId.ToString(),
            "None"
        );
        var accessToken = _jwtService.GenerateAccessToken(payload);

        var refreshToken = _jwtService.GenerateRefreshToken();

        return new AuthResponseDto(
            accessToken,
            refreshToken,
            new UserDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                Role = user.Role.ToString(),
                IsVerified = user.IsVerified,
                ProfileId = user.Profile.UserId.ToString()
            }
        );
    }

    public async Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var profile = await _profileRepository.GetByUserIdAsync(userId);
        if (profile == null) return false;

        profile.UpdateGeneralInfo(
            dto.DisplayName,
            dto.Description,
            dto.ImgUrl
        );

        profile.User.TeacherProfile?.UpdateProfessionalInfo(
            dto.Specialization,
            dto.Education
        );

        profile.User.StudentProfile?.UpdateProfile(
            dto.Username
        );


        _profileRepository.Update(profile);
        return await _profileRepository.SaveChangesAsync();
    }

    public async Task<string> UploadAvatarAsync(Guid userId, Stream file, string fileName)
    {
        var imageUrl = await _storageService.UploadFileAsync(file, fileName);

        var profile = await _profileRepository.GetByUserIdAsync(userId);
        if (profile == null) return null;
        profile.ImgUrl = imageUrl;
        profile.UpdatedAt = DateTime.UtcNow;

        _profileRepository.Update(profile);

        var success = await _profileRepository.SaveChangesAsync();
        if (!success) throw new KeyException("Error during updating profile in db");
        return imageUrl;
    }

    public Task<bool> DeleteProfileAsync(Guid userId)
    {
        throw new NotImplementedException();
    }
}
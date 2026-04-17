using NeuroChord.Application.Dtos.Profile;
using NeuroChord.Application.DTOs.Profile;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;
using Org.BouncyCastle.Security;

namespace NeuroChord.Application.Services;

public class ProfileService : IProfileService
{
    private readonly IProfileRepository _profileRepository;
    private readonly IFileStorageService _storageService;
    private readonly IUserRepository _userRepository;

    public ProfileService(IProfileRepository profileRepository, IUserRepository userRepository,
        IFileStorageService storageService)
    {
        _profileRepository = profileRepository;
        _userRepository = userRepository;
        _storageService = storageService;
    }

    public async Task<ProfileResponseDto> GetByUserIdAsync(string userId)
    {
        var profile = await _profileRepository.GetByUserIdAsync(userId);

        if (profile == null) return null;

        return new ProfileResponseDto(
            profile.Id,
            profile.DisplayName,
            profile.Description,
            profile.ImgUrl,
            profile.User.Role.ToString(), // Pobieramy rolę z powiązanego Usera
            profile.StudentProfile != null
                ? new StudentProfileDto(profile.StudentProfile.Username, profile.StudentProfile.ExperienceLevel)
                : null,
            profile.TeacherProfile != null
                ? new TeacherProfileDto(profile.TeacherProfile.Specialization, profile.TeacherProfile.Education,
                    profile.TeacherProfile.CreatedAt)
                : null,
            profile.CreatedAt
        );
    }

    public async Task<bool> UpdateProfileAsync(string userId, UpdateProfileDto dto)
    {
        var profile = await _profileRepository.GetByUserIdAsync(userId);
        if (profile == null) return false;

        if (dto.DisplayName != null) profile.DisplayName = dto.DisplayName;
        if (dto.Description != null) profile.Description = dto.Description;
        if (dto.ImgUrl != null) profile.ImgUrl = dto.ImgUrl;

        if (profile.TeacherProfile != null)
        {
            if (dto.Specialization != null) profile.TeacherProfile.Specialization = dto.Specialization;
            if (dto.Education != null) profile.TeacherProfile.Education = dto.Education;
        }

        profile.UpdatedAt = DateTime.UtcNow;

        _profileRepository.Update(profile);
        return await _profileRepository.SaveChangesAsync();
    }

    public async Task<bool> CreateProfileAsync(string userId, CreateProfileDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || user.OnboardingComplete) return false;

        if (!Enum.TryParse<Role>(dto.Role, out var assignedRole)) return false;


        var newProfile = new Profile
        {
            UserId = userId,
            DisplayName = dto.DisplayName,
            Description = dto.Description,
            ImgUrl = dto.ImgUrl ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };
        if (assignedRole == Role.Student)
            newProfile.StudentProfile = new StudentProfile
            {
                Username = dto.Username ?? user.Email.Split('@')[0],
                ExperienceLevel = 1
            };
        else if (assignedRole == Role.Teacher)
            newProfile.TeacherProfile = new TeacherProfile
            {
                Specialization = dto.Specialization ?? "General",
                CreatedAt = DateTime.UtcNow
            };

        user.Role = assignedRole;
        user.OnboardingComplete = true;
        user.RegistrationStep = RegistrationStep.Onboarded;

        await _profileRepository.CreateAsync(newProfile);
        return await _profileRepository.SaveChangesAsync();
    }

    public async Task<string> UploadAvatarAsync(string userId, Stream file, string fileName)
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

    public Task<bool> DeleteProfileAsync(string userId)
    {
        throw new NotImplementedException();
    }
}
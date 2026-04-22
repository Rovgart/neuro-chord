using NeuroChord.Application.Dtos.Profile;
using NeuroChord.Application.DTOs.Profile;

namespace NeuroChord.Application.Interfaces;

public interface IProfileService
{
    Task<ProfileResponseDto> GetByUserIdAsync(Guid userId);
    Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);

    Task<bool> CreateProfileAsync(Guid userId, CreateProfileDto dto);

    Task<string> UploadAvatarAsync(Guid userId, Stream file, string fileName);
    Task<bool> DeleteProfileAsync(Guid userId);
}
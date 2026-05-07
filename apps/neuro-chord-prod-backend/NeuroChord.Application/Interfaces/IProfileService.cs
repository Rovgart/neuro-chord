using NeuroChord.Application.DTOs;
using NeuroChord.Application.Dtos.Profile;
using NeuroChord.Application.DTOs.Profile;

namespace NeuroChord.Application.Interfaces;

public interface IProfileService
{
    Task<ProfileResponseDto> GetByUserIdAsync(Guid userId);
    Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);

    Task<AuthResponseDto> CreateProfileAsync(Guid userId, Guid sessionId, CreateProfileDto dto);

    Task<string> UploadAvatarAsync(Guid userId, Stream file, string fileName);
    Task<bool> DeleteProfileAsync(Guid userId);
}
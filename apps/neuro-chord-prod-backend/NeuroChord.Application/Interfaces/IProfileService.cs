using NeuroChord.Application.Dtos.Profile;
using NeuroChord.Application.DTOs.Profile;

namespace NeuroChord.Application.Interfaces;

public interface IProfileService
{
    Task<ProfileResponseDto> GetByUserIdAsync(string userId);
    Task<bool> UpdateProfileAsync(string userId, UpdateProfileDto dto);

    Task<bool> CreateProfileAsync(string userId, CreateProfileDto dto);
}
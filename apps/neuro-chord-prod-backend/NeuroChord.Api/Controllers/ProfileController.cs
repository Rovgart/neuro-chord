using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeuroChord.Application.Dtos.Profile;
using NeuroChord.Application.DTOs.Profile;
using NeuroChord.Application.Interfaces;
using Role = NeuroChordDomain.Enums.Role;

namespace NeuroChord.Api.Controllers;

[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;


    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<ProfileResponseDto>> GetMyProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return Unauthorized(new { message = "Given profile doesn't exist" });

        var profile = await _profileService.GetByUserIdAsync(userId);
        return Ok(profile);
    }

    [Authorize(Roles = nameof(Role.Admin))]
    [HttpGet("{id}")]
    public async Task<ActionResult<ProfileResponseDto>> GetUserProfile(string id)
    {
        var profile = await _profileService.GetByUserIdAsync(id);
        return Ok(profile);
    }

    [Authorize]
    [HttpPost("onboarding")]
    public async Task<IActionResult> CompleteOnboarding([FromBody] CreateProfileDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var result = await _profileService.CreateProfileAsync(userId, dto);

        if (!result) return BadRequest("Onboarding failed or already completed.");

        return Ok(new { message = "Onboarding successful. Welcome to NeuroChord!" });
    }
}
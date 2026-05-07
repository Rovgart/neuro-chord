using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeuroChord.Api.Extensions;
using NeuroChord.Application.Dtos.Profile;
using NeuroChord.Application.DTOs.Profile;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Api.Controllers;

[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly ILogger<ProfileController> _logger;
    private readonly IProfileService _profileService;


    public ProfileController(IProfileService profileService, ILogger<ProfileController> logger)
    {
        _profileService = profileService;
        _logger = logger;
    }

    [Authorize(Policy = "AtLeastStudent")]
    [HttpGet("me")]
    public async Task<ActionResult<ProfileResponseDto>> GetMyProfile()
    {
        var userId = User.GetUserId();

        var profile = await _profileService.GetByUserIdAsync(userId);
        return Ok(profile);
    }

    [Authorize(Policy = "AtLeastStudent")]
    [HttpGet("{id}")]
    public async Task<ActionResult<ProfileResponseDto>> GetUserProfile(string id)
    {
        if (string.IsNullOrEmpty(id)) return NotFound(new { message = "User not found " });
        var userId = Guid.Parse(id);
        var profile = await _profileService.GetByUserIdAsync(userId);
        return Ok(profile);
    }

    [HttpPost("onboarding")]
    public async Task<IActionResult> CompleteOnboarding([FromBody] CreateProfileDto dto,
        [FromServices] IValidator<CreateProfileDto> validator)
    {
        var validationResult = await validator.ValidateAsync(dto);
        var sessionId = User.GetSessionId();
        if (!validationResult.IsValid)
            return BadRequest(new
            {
                message = "Validation failed",
                errors = validationResult.Errors.Select(e => e.ErrorMessage)
            });
        var userId = User.GetUserId();
        _logger.LogDebug("User: {UserId}", userId);

        var result = await _profileService.CreateProfileAsync(userId, sessionId, dto);
        ClearAuthCookies();
        SetRefreshTokenCookie(result.RefreshToken);
        SetAccessTokenCookie(result.AccessToken);

        return Ok(result);
    }

    [Authorize(Policy = "AtLeastStudent")]
    [HttpPatch("avatar")]
    public async Task<IActionResult> UpdateAvatar(IFormFile file)
    {
        if (file.Length == 0 || file == null) return BadRequest("No file was sent to update.");

        if (file.Length > 15 * 1024 * 1024) return BadRequest("File is tool larger than 15MB.");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".heic" };
        var extension = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(extension)) return BadRequest("Invalid file format");
        var userId = User.GetUserId();
        try
        {
            using var stream = file.OpenReadStream();
            var resultUrl = await _profileService.UploadAvatarAsync(userId, stream, file.FileName);

            return Ok(new { url = resultUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during updating file for user: {UserId}. Plik: {FileName}", userId,
                file.FileName);
            return StatusCode(500, $"Error occured during updating: {ex.Message}");
        }
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    private void SetAccessTokenCookie(string accessToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddMinutes(15)
        };
        Response.Cookies.Append("accessToken", accessToken, cookieOptions);
    }

    private void ClearAuthCookies()
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(-1)
        };

        Response.Cookies.Delete("AccessToken", cookieOptions);
        Response.Cookies.Delete("RefreshToken", cookieOptions);
    }
}
using Microsoft.AspNetCore.Mvc;
using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;

namespace neuro_chord_prod_backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request,
        [FromHeader] string userAgent)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

        try
        {
            var response = await _authService.LoginAsync(request, ipAddress, userAgent);

            SetRefreshTokenCookie(response.RefreshToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result) return BadRequest(new { message = "Registration failed" });

        return Ok(new { message = "User registered successfully. Please verify your email." });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromQuery] string refreshToken)
    {
        await _authService.LogoutAsync(refreshToken, string.Empty);
        return NoContent();
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token, [FromHeader] string userAgent)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        if (string.IsNullOrEmpty(token)) return BadRequest("Token is required.");

        var result = await _authService.VerifyEmailAsync(token, ipAddress, userAgent);

        if (!result) return BadRequest("Invalid or expired verification token.");

        return Ok("Email verified successfully! You can now log in.");
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromQuery] string refreshToken)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(refreshToken);
            SetRefreshTokenCookie(response.RefreshToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
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
}
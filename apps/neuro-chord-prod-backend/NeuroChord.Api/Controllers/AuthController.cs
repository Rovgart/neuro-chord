using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using NeuroChord.Api.Extensions;
using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Api.Controllers;

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
        [FromHeader] string userAgent, [FromServices] IValidator<LoginRequestDto> validator)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(new { Errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        try
        {
            var response = await _authService.LoginAsync(request, ipAddress, userAgent);

            SetRefreshTokenCookie(response.RefreshToken);
            SetAccessTokenCookie(response.AccessToken);

            return Ok(new { message = "Login Successful", response });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request,
        [FromServices] IValidator<RegisterRequestDto> validator)
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(new { Errors = validationResult.Errors.Select(e => e.ErrorMessage) });

        var result = await _authService.RegisterAsync(request);
        if (!result) return BadRequest(new { message = "Registration failed" });

        return Ok(new { message = "User registered successfully. Please verify your email." });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.GetUserId();

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(-1)
        };

        Response.Cookies.Delete("accessToken", cookieOptions);
        Response.Cookies.Delete("refreshToken", cookieOptions);
        await _authService.LogoutAsync(userId);
        return Ok(new { message = "Logout Successful" });
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
    public async Task<ActionResult<AuthResponseDto>> RefreshToken()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var token) ||
            !Request.Cookies.TryGetValue("accessToken", out var access))
            return BadRequest("Tokens were not provided in cookies.");
        try
        {
            var response = await _authService.RefreshTokenAsync(token, access);
            SetRefreshTokenCookie(response.RefreshToken);
            SetAccessTokenCookie(response.AccessToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException)
        {
            Response.Cookies.Delete("refreshToken");
            Response.Cookies.Delete("accessToken");
            return Unauthorized();
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var resetToken = await _authService.InitResetPasswordAsync(request.Email);
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.Now.AddMinutes(15)
        };
        Response.Cookies.Append("X-Reset-Token", resetToken, cookieOptions);
        return Ok(new { message = "If account exists, we've send PIN on given e-mail" });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> VerifyPin([FromBody] VerifyPinRequestDto request, [FromHeader] string userAgent,
        [FromHeader] string ipAddress)
    {
        if (!Request.Cookies.TryGetValue("X-Reset-Token", out var token))
            return BadRequest(new { message = "Session expired or lack of security token" });

        await _authService.CompletePasswordResetAsync(request.Email, request.Pin, token, request.NewPassword);
        return Ok(new { message = "Password successfully reset" });
    }

    [HttpGet("check-email-availability")]
    [AllowAnonymous]
    public async Task<ActionResult<bool>> CheckEmailAvailability([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return BadRequest("Email cannot be empty.");

        var isAvailable = await _authService.CheckEmailAvailabilityAsync(email);

        return Ok(new { isAvailable });
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
}
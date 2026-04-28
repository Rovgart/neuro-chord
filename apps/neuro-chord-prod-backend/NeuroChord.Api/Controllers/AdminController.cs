using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Api.Controllers;

[ApiController]
[Route("api/admin/application")]
[Tags("Admin - Teachers management")]
public class AdminController(IAdminService adminService) : ControllerBase
{
    [HttpGet("pending-teachers")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetPendingApplications(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await adminService.GetPendingTeachers(pageNumber, pageSize);

        var dtos = result.Select(ta => new PendingTeacherDto(
            ta.Id,
            ta.UserId,
            ta.User.Profile.DisplayName,
            ta.User.Email,
            ta.User.Profile.ImgUrl,
            ta.Specialization,
            ta.Bio,
            ta.QualificationsUrl,
            ta.CreatedAt
        ));

        return Ok(new TeacherApplicationResponseDto(dtos));
    }

    [HttpPost("verify")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> VerifyApplication([FromBody] VerifyApplicationRequest request)
    {
        var success = await adminService.VerifyTeacherApplication(request);

        if (!success)
            return BadRequest("Failed to process application");

        return Ok(new
        { Message = request.IsApproved ? "Teacher has been confirmed" : "Application rejected" });
    }
}
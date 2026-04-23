using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeuroChord.Api.Extensions;
using NeuroChord.Application.DTOs.Materials;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Api.Controllers;

[ApiController]
[Route("api/materials")]
[Authorize]
public class MaterialController(IMaterialService materialService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaterialResponseDto>>> GetUserMaterialsAsync(
        [FromQuery] Guid? targetUserId)
    {
        var userId = User.GetUserId();
        var resp = await materialService.GetUserMaterialsAsync(targetUserId, userId);
        return Ok(resp);
    }

    [HttpGet("{id:guid}", Name = nameof(GetUserMaterialAsync))]
    public async Task<ActionResult<MaterialResponseDto>> GetUserMaterialAsync(Guid id)
    {
        var userId = User.GetUserId();
        var result = await materialService.GetMaterialByIdAsync(id, userId);
        return Ok(result);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<MaterialResponseDto>> CreateUserMaterialAsync([FromForm] CreateMaterialDto dto)
    {
        var userId = User.GetUserId();
        var result = await materialService.CreateMaterialAsync(dto, userId);
        return CreatedAtRoute(nameof(GetUserMaterialAsync), new { id = result.Id }, result);
    }
}
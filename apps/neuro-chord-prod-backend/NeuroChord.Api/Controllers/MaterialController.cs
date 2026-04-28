using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeuroChord.Api.Extensions;
using NeuroChord.Application.DTOs.Materials;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Api.Controllers;

[ApiController]
[Route("api/materials")]
[Authorize(Policy = "AtLeastStudent")]
public class MaterialController(IMaterialService materialService) : ControllerBase
{
    [HttpGet("owned")]
    public async Task<ActionResult<IEnumerable<MaterialResponseDto>>> GetMyMaterialsAsync()
    {
        var userId = User.GetUserId();
        var resp = await materialService.GetUsersMaterialsAsync(userId);
        return Ok(resp);
    }

    [HttpGet("shared")]
    public async Task<ActionResult<IEnumerable<MaterialResponseDto>>> GetSharedMaterialsAsync()
    {
        var userId = User.GetUserId();
        var resp = await materialService.GetSharedMaterialsWithMeAsync(userId);
        return Ok(resp);
    }

    [HttpGet("{id:guid}", Name = nameof(GetMaterialByIdAsync))]
    public async Task<ActionResult<MaterialResponseDto>> GetMaterialByIdAsync(Guid id)
    {
        var userId = User.GetUserId();
        var result = await materialService.GetMaterialByIdAsync(id, userId);
        return Ok(result);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [Authorize(Policy = "Teacher")]
    public async Task<ActionResult<MaterialResponseDto>> CreateMaterialAsync([FromForm] CreateMaterialDto dto)
    {
        var userId = User.GetUserId();
        var result = await materialService.CreateMaterialAsync(dto, userId);

        return CreatedAtRoute(nameof(GetMaterialByIdAsync), new { id = result.Id }, result);
    }

    [HttpPost("share")]
    [Authorize(Policy = "Teacher")]
    public async Task<IActionResult> ShareMaterialAsync([FromBody] ShareMaterialDto dto)
    {
        var userId = User.GetUserId();
        await materialService.HandleSharingAsync(dto, userId);
        return NoContent();
    }

    [HttpDelete("{materialId:guid}")]
    [Authorize(Policy = "Teacher")]
    public async Task<IActionResult> DeleteMaterialAsync([FromRoute] Guid materialId)
    {
        var userId = User.GetUserId();
        await materialService.DeleteMaterialAsync(materialId, userId);
        return NoContent();
    }
}
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeuroChord.Infrastructure.Persistence;

namespace NeuroChord.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class Test : ControllerBase
{
    private readonly AppDbContext _context;

    public Test(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("test-connection")]
    public async Task<IActionResult> TestConnection()
    {
        try
        {
            var isAlive = await _context.Database.CanConnectAsync();

            if (!isAlive) return BadRequest("DB is not responding.");

            return Ok(new
            {
                Status = (int)HttpStatusCode.Accepted,
                Message = "Is alive",
                DbName = _context.Database.GetDbConnection().Database
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Status = "Crashed", Error = ex.Message });
        }
    }
}
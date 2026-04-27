using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeuroChord.Infrastructure.Persistence;

namespace NeuroChord.Api.Controllers;

[ApiController]
[Route("api/test")]
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

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await _context.Users
                .Include(u => u.Profile)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.Role,
                    DisplayName = u.Profile != null ? u.Profile.DisplayName : "No Profile",
                    u.OnboardingComplete
                })
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Error fetching users", Details = ex.Message });
        }
    }
}
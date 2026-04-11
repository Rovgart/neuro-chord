using Microsoft.AspNetCore.Mvc;
using NeuroChord.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
namespace neuro_chord_prod_backend.Controllers;

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

            return isAlive
                ? Ok(new { Status = "Sukces", Message = "Postgres żyje i pije wodę!", DbName = _context.Database.GetDbConnection().Database })
                : BadRequest("Baza nie odpowiada. Sprawdź czy Postgres działa.");
        }
        catch (Exception ex)
        {

            return StatusCode(500, new { Status = "Katastrofa", Error = ex.Message });
        }
    }
}
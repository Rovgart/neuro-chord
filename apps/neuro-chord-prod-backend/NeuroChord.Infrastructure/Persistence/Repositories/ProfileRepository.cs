using Microsoft.EntityFrameworkCore;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Persistence.Repositories;

public class ProfileRepository : IProfileRepository
{
    private readonly AppDbContext _context;

    public ProfileRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Profile?> GetByUserIdAsync(string userId)
    {
        return await _context.Profiles
            .Include(p => p.User)
            .Include(p => p.StudentProfile)
            .Include(p => p.TeacherProfile)
            .FirstOrDefaultAsync(p => p.UserId == userId);
    }

    public async Task<Profile?> GetByIdAsync(string id)
    {
        return await _context.Profiles
            .Include(p => p.StudentProfile)
            .Include(p => p.TeacherProfile)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public void Update(Profile profile)
    {
        profile.UpdatedAt = DateTime.UtcNow;
        _context.Profiles.Update(profile);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> ProfileExistsAsync(string userId)
    {
        return await _context.Profiles.AnyAsync(p => p.UserId == userId);
    }

    public async Task CreateAsync(Profile profile)
    {
        await _context.Profiles.AddAsync(profile);
    }
}
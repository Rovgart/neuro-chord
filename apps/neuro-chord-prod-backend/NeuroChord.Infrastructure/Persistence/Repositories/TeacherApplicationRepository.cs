using Microsoft.EntityFrameworkCore;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Persistence.Repositories;

public class TeacherApplicationRepository(AppDbContext context) : ITeacherApplicationRepository
{
    public async Task<TeacherApplication?> GetLatestByUserIdAsync(Guid userId)
    {
        return await context.TeacherApplications
            .AsNoTracking()
            .Where(ta => ta.UserId == userId)
            .OrderByDescending(ta => ta.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> HasActiveApplicationAsync(Guid userId)
    {
        return await context.TeacherApplications.AsNoTracking()
            .Where(ta => ta.Status == ApplicationStatus.Pending && ta.UserId == userId).AnyAsync();
    }

    public async Task<IEnumerable<TeacherApplication>> GetPendingApplicationsAsync(int pageNumber, int pageSize)
    {
        return await context.TeacherApplications
            .AsNoTracking()
            .Include(ta => ta.User)
            .ThenInclude(ta => ta.Profile)
            .Where(ta => ta.Status == ApplicationStatus.Pending)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task AddAsync(TeacherApplication application)
    {
        await context.TeacherApplications.AddAsync(application);
    }

    public async Task<TeacherApplication?> GetByIdAsync(Guid applicationId)
    {
        return await context.TeacherApplications
            .Include(ta => ta.User)
            .ThenInclude(u => u.Profile)
            .Include(ta => ta.User)
            .ThenInclude(u => u.TeacherProfile)
            .FirstOrDefaultAsync(ta => ta.Id == applicationId);
    }
}
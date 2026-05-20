using Microsoft.EntityFrameworkCore;
using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .Include(u => u.Profile)
            .Include(u => u.StudentProfile)
            .Include(u => u.TeacherProfile)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task AddUserAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task UpdateRoleAsync(Guid id, Role role)
    {
        await _context.Users.Where(u => u.Id == id)
            .ExecuteUpdateAsync(setters => setters.SetProperty(u => u.Role, role));
    }

    public async Task UpdateVerificationStatusAsync(Guid id, bool isVerified)
    {
        await _context.Users.Where(u => u.Id == id)
            .ExecuteUpdateAsync(setters => setters.SetProperty(u => u.IsVerified, isVerified));
    }

    public async Task DeleteUserAsync(Guid id)
    {
        await _context.Users.Where(u => u.Id == id).ExecuteDeleteAsync();
    }

    public async Task<UserInternalAuthDto?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Where(u => u.Email == email)
            .Select(u => new UserInternalAuthDto
            {
                Id = u.Id,
                Email = u.Email,
                PasswordHash = u.PasswordHash,
                Role = u.Role,
                IsVerified = u.IsVerified,
                ProfileId = u.Profile != null ? u.Id : null,
                HasSelectedPlan = u.HasSelectedPlan,


                SubscriptionPlanName = u.HasSelectedPlan
                    ? _context.Subscriptions
                        .Where(s => s.UserId == u.Id)
                        .Select(s => s.Plan.PlanName)
                        .FirstOrDefault() ?? "None"
                    : "None"
            })
            .FirstOrDefaultAsync();
    }

    public async Task<User?> GetUserEntityByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<List<User>> GetUsersByRoleAsync(Role role)
    {
        return await _context.Users
            .AsNoTracking()
            .Where(u => u.Role == role)
            .ToListAsync();
    }

    public Task ChangeRoleAsync(User user, Role role)
    {
        user.Role = role;
        return Task.CompletedTask;
    }

    public async Task<bool> IsEmailAvailable(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower());
    }


    public Task UpdateAsync(User user)
    {
        _context.Users.Update(user);

        return Task.CompletedTask;
    }
}
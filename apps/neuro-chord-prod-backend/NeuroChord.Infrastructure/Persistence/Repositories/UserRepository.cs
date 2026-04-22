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
        return await _context.Users.FindAsync(id);
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
                Role = u.Role.ToString(),
                IsVerified = u.IsVerified,
                ProfileId = u.Profile != null ? u.Profile.Id : null
            })
            .FirstOrDefaultAsync();
    }

    public async Task<User?> GetUserEntityByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }
}
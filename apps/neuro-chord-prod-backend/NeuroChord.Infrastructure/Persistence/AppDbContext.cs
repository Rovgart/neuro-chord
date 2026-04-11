using Microsoft.EntityFrameworkCore;
using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<User> Users { get; set; }
    public DbSet<TeacherProfile> TeacherProfiles { get; set; }
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<StudentProfile> StudentsProfile { get; set; }
    public DbSet<Verification> Verification { get; set; }
    public DbSet<PasswordReset> PasswordResets { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<SessionArchive> SessionArchives { get; set; }
    public DbSet<Campaign> Campaigns { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>()
            .HasOne(u => u.Profile)
            .WithOne(p => p.User)
            .HasForeignKey<Profile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<User>()
            .HasOne<Campaign>(u => u.Campaign)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.CampaignId);
        modelBuilder.Entity<Profile>()
            .HasOne(p => p.StudentProfile)
            .WithOne(s => s.Profile)
            .HasForeignKey<StudentProfile>(s => s.ProfileId);
        modelBuilder.Entity<Profile>()
            .HasOne<TeacherProfile>(p => p.TeacherProfile)
            .WithOne(s => s.Profile)
            .HasForeignKey<TeacherProfile>(s => s.ProfileId);
        modelBuilder.Entity<Verification>()
            .HasOne<User>(v => v.User)
            .WithMany(u => u.Verifications)
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Session>()
            .HasOne<User>(s => s.User)
            .WithMany(s => s.Sessions)
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<SessionArchive>()
            .HasOne<User>(s => s.User)
            .WithMany(u => u.SessionArchives)
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<PasswordReset>()
            .HasOne<User>(s => s.User)
            .WithMany(u => u.PasswordResets)
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
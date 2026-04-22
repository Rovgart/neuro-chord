using Microsoft.EntityFrameworkCore;
using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<TeacherProfile> TeacherProfiles { get; set; }
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<StudentProfile> StudentsProfile { get; set; }
    public DbSet<Verification> Verification { get; set; }
    public DbSet<PasswordReset> PasswordResets { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<SessionArchive> SessionArchives { get; set; }
    public DbSet<Material> Materials { get; set; }
    public DbSet<SharedResources> SharedResources { get; set; }
    public DbSet<Folder> Folders { get; set; }
    public DbSet<Campaign> Campaigns { get; set; }
    public DbSet<TeacherInstrument> TeacherInstruments { get; set; }
    public DbSet<Instrument> Instruments { get; set; }


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
        modelBuilder.Entity<TeacherInstrument>()
            .HasKey(ti => new { ti.TeacherId, ti.InstrumentId });
        modelBuilder.Entity<TeacherInstrument>()
            .HasOne(ti => ti.TeacherProfile)
            .WithMany(tp => tp.TeacherInstruments)
            .HasForeignKey(ti => ti.TeacherId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<TeacherInstrument>()
            .HasOne(ti => ti.Instrument)
            .WithMany(i => i.TeacherInstruments)
            .HasForeignKey(ti => ti.InstrumentId)
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
        modelBuilder.Entity<Material>()
            .HasOne<User>(m => m.Owner)
            .WithMany(u => u.Materials)
            .HasForeignKey(m => m.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<SharedResources>()
            .HasOne<Material>(s => s.Material)
            .WithMany()
            .HasForeignKey(s => s.MaterialId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<SharedResources>()
            .HasOne<Folder>(s => s.Folder)
            .WithMany()
            .HasForeignKey(s => s.FolderId)
            .OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Material>()
            .HasOne<Folder>(s => s.Folder)
            .WithMany(f => f.Materials)
            .HasForeignKey(m => m.FolderId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
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
    public DbSet<TeacherApplication> TeacherApplications { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Subscriptions> Subscriptions { get; set; }
    public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
    public DbSet<IncomingWebhooks> IncomingWebhooks { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            foreach (var property in entityType.GetProperties())
                if (property.ClrType.IsEnum)
                {
                    var converterType = typeof(EnumToStringConverter<>).MakeGenericType(property.ClrType);
                    var converter = (ValueConverter)Activator.CreateInstance(converterType)!;
                    property.SetValueConverter(converter);
                }

        modelBuilder.Entity<User>()
            .HasOne<Campaign>(u => u.Campaign)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.CampaignId);
        modelBuilder.Entity<User>()
            .HasOne<Profile>(u => u.Profile)
            .WithOne(p => p.User)
            .HasForeignKey<Profile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<User>()
            .HasOne<TeacherProfile>(u => u.TeacherProfile)
            .WithOne(tp => tp.User)
            .HasForeignKey<TeacherProfile>(tp => tp.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<User>()
            .HasOne<StudentProfile>(u => u.StudentProfile)
            .WithOne(sp => sp.User)
            .HasForeignKey<StudentProfile>(sp => sp.UserId)
            .OnDelete(DeleteBehavior.Cascade);
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
        modelBuilder.Entity<TeacherApplication>()
            .HasOne<User>(ta => ta.User)
            .WithMany(u => u.TeacherApplications)
            .HasForeignKey(ta => ta.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<AuditLog>()
            .HasOne<User>(a => a.Actor)
            .WithMany(u => u.PerformedActions)
            .HasForeignKey(a => a.ActorId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<AuditLog>()
            .HasOne<User>(a => a.Target)
            .WithMany(u => u.ReceivedActions)
            .HasForeignKey(a => a.TargetId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Subscriptions>()
            .HasOne<User>()
            .WithOne()
            .HasForeignKey<Subscriptions>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Subscriptions>()
            .HasOne<SubscriptionPlan>(s => s.Plan)
            .WithMany(sp => sp.Subscriptions)
            .HasForeignKey(sp => sp.PlanId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<IncomingWebhooks>()
            .HasOne<Subscriptions>(iw => iw.Subscriptions)
            .WithMany(s => s.IncomingWebhooks)
            .HasForeignKey(iw => iw.SubscriptionId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<SubscriptionPlan>()
            .OwnsMany(p => p.Features, builder => { builder.ToJson(); });
    }
}
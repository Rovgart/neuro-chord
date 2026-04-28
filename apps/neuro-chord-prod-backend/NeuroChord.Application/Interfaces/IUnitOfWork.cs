namespace NeuroChord.Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IMaterialRepository Materials { get; }
    ISharedResourcesRepository SharedResources { get; }
    ISubscriptionRepository Subscriptions { get; }
    IUserRepository Users { get; }

    ITeacherApplicationRepository TeacherApplications { get; }
    Task BeginTransactionAsync();
    Task CommitAsync();
    Task RollbackAsync();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
using Microsoft.EntityFrameworkCore.Storage;
using NeuroChord.Application.Interfaces;
using NeuroChord.Infrastructure.Persistence;

namespace NeuroChord.Infrastructure.Services;

public class UnitOfWork(
    AppDbContext context,
    IUserRepository userRepository,
    ISubscriptionRepository subscriptionRepository,
    IMaterialRepository materialRepository,
    ITeacherApplicationRepository teacherApplicationRepository,
    ISharedResourcesRepository sharedResourcesRepository) : IUnitOfWork

{
    private IDbContextTransaction? _currentTransaction;
    private bool _disposed;
    public ISubscriptionRepository Subscriptions => subscriptionRepository;
    public IMaterialRepository Materials => materialRepository;
    public ISharedResourcesRepository SharedResources => sharedResourcesRepository;
    public IUserRepository Users => userRepository;

    public ITeacherApplicationRepository TeacherApplications => teacherApplicationRepository;

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync()
    {
        if (_currentTransaction != null) return;
        _currentTransaction = await context.Database.BeginTransactionAsync();
    }

    public async Task CommitAsync()
    {
        try
        {
            await context.SaveChangesAsync();
            if (_currentTransaction != null) await _currentTransaction.CommitAsync();
        }
        catch
        {
            await RollbackAsync();
            throw;
        }
        finally
        {
            DisposeTransaction();
        }
    }

    public async Task RollbackAsync()
    {
        if (_currentTransaction != null)
        {
            await _currentTransaction.RollbackAsync();
            DisposeTransaction();
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    private void DisposeTransaction()
    {
        _currentTransaction?.Dispose();
        _currentTransaction = null;
    }

    ~UnitOfWork()
    {
        Dispose(false);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            DisposeTransaction();
            context.Dispose();
        }

        _disposed = true;
    }
}
using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface ITeacherApplicationRepository
{
    Task<IEnumerable<TeacherApplication>> GetPendingApplicationsAsync(int pageNumber, int pageSize);

    Task<TeacherApplication?> GetLatestByUserIdAsync(Guid userId);

    Task<bool> HasActiveApplicationAsync(Guid userId);

    Task AddAsync(TeacherApplication application);

    Task<TeacherApplication?> GetByIdAsync(Guid applicationId);
}
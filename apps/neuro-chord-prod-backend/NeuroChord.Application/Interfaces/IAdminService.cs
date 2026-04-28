using NeuroChord.Application.DTOs;
using NeuroChordDomain.Entities;

namespace NeuroChord.Application.Interfaces;

public interface IAdminService
{
    Task<IEnumerable<TeacherApplication>> GetPendingTeachers(int pageNumber, int pageSize);
    Task<bool> VerifyTeacherApplication(VerifyApplicationRequest request);
}
using NeuroChord.Application.DTOs;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.Application.Services;

public class AdminService(IUnitOfWork uow, IAuditService auditService) : IAdminService
{
    public async Task<IEnumerable<TeacherApplication>> GetPendingTeachers(int pageNumber, int pageSize)
    {
        return await uow.TeacherApplications.GetPendingApplicationsAsync(pageNumber, pageSize);
    }

    public async Task<bool> VerifyTeacherApplication(VerifyApplicationRequest request)
    {
        // GetByIdAsync dociąga już User, Profile i TeacherProfile (zrobiliśmy to w repo)
        var application = await uow.TeacherApplications.GetByIdAsync(request.ApplicationId);

        if (application == null || application.Status != ApplicationStatus.Pending)
            return false;

        try
        {
            await uow.BeginTransactionAsync();

            if (request.IsApproved)
            {
                application.Status = ApplicationStatus.Approved;
                application.User.Role = Role.Teacher;

                // W modelu gwiazdy TeacherProfile powinien już istnieć (szkielet z onboardingu)
                // Ale na wszelki wypadek sprawdzamy:
                if (application.User.TeacherProfile != null)
                {
                    application.User.TeacherProfile.Specialization = application.Specialization;
                    application.User.TeacherProfile.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Jeśli jakimś cudem go nie ma, tworzymy go na tym samym UserId
                    application.User.TeacherProfile = new TeacherProfile
                    {
                        UserId = application.UserId, // Ten sam klucz co User i Application!
                        Specialization = application.Specialization,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                }
            }
            else
            {
                application.Status = ApplicationStatus.Rejected;
                application.User.Role = Role.Student; // Lub zostawiasz Unassigned zależnie od logiki
            }

            application.ProcessedAt = DateTime.UtcNow;

            await auditService.LogAsync(
                request.IsApproved ? "APPROVE_TEACHER" : "REJECT_TEACHER",
                "TeacherApplication",
                application.UserId,
                AuditLogType.ApplicationManagement,
                request.IsApproved ? "All documents valid" : "Application rejected by admin"
            );

            await uow.SaveChangesAsync();
            await uow.CommitAsync();
            return true;
        }
        catch
        {
            await uow.RollbackAsync();
            throw;
        }
    }
}
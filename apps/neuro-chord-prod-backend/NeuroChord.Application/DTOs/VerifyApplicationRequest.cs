namespace NeuroChord.Application.DTOs;

public record VerifyApplicationRequest(
    Guid ApplicationId,
    bool IsApproved,
    string? AdminComment = null
);
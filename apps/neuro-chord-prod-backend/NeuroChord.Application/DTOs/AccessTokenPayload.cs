namespace NeuroChord.Application.DTOs;

public record AccessTokenPayload(
    string UserId,
    string Email,
    string Role,
    string SessionId
);
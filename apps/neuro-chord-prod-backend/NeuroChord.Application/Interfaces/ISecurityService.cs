namespace NeuroChord.Application.Interfaces;

public interface ISecurityService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPasswordFromDb);
}
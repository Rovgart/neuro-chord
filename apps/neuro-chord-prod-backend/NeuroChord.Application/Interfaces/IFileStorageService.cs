namespace NeuroChord.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName);
    Task<bool> DeleteFileAsync(string fileUrl);
}
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using NeuroChord.Application.Exceptions;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Infrastructure.Services;

public class CloudinaryStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorageService(Cloudinary cloudinary)
    {
        _cloudinary = cloudinary ?? throw new ArgumentNullException(nameof(cloudinary));
    }

    public Task<bool> DeleteFileAsync(string fileUrl)
    {
        throw new NotImplementedException();
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName)
    {
        var uploadsParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = "neurochord_profile_pics"
        };
        var result = await _cloudinary.UploadAsync(uploadsParams);
        return result.SecureUrl.ToString();
    }

    public async Task<string> UploadVideoAsync(Stream fileStream, string fileName)
    {
        var uploadParams = new VideoUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = "neurochord_materials/videos",
            EagerTransforms = new List<Transformation>
            {
                new Transformation().Width(1280).Height(720).Crop("liimt").Quality("auto").FetchFormat("auto")
            },
            EagerAsync = true
        };
        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.Error != null) throw new ConflictException(result.Error.Message);
        return result.SecureUrl.ToString();
    }
}
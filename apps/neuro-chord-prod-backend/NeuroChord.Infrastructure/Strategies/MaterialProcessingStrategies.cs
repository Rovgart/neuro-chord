using Microsoft.AspNetCore.Http;
using NeuroChord.Application.DTOs.Materials;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.Infrastructure.Strategies;

public class VideoMaterialStrategy(IFileStorageService fileStorageService) : IMaterialProcessingStrategy
{
    public MaterialType type => MaterialType.Video;

    public async Task ProcessAsync(Material material, CreateMaterialDto dto)
    {
        using var stream = dto.File.OpenReadStream();
        if (dto.File == null || dto.File.Length == 0) throw new BadHttpRequestException("Video file is required");
        var uploadResult = await fileStorageService.UploadVideoAsync(stream, dto.File.FileName);

        material.Url = uploadResult;
    }
}

public class PdfMaterialStrategy(IFileStorageService fileStorageService) : IMaterialProcessingStrategy
{
    public MaterialType type => MaterialType.File;

    public async Task ProcessAsync(Material material, CreateMaterialDto dto)
    {
        if (dto.File == null || dto.File.Length == 0)
            throw new BadHttpRequestException("PDF file is required.");

        var extension = Path.GetExtension(dto.File.FileName).ToLower();
        if (extension != ".pdf" || dto.File.ContentType != "application/pdf")
            throw new BadHttpRequestException("Only PDF files are allowed for this material type.");

        if (dto.File.Length > 20 * 1024 * 1024)
            throw new BadHttpRequestException("File size exceeds the 20MB limit.");

        using var stream = dto.File.OpenReadStream();
        var pdfUrl = await fileStorageService.UploadFileAsync(stream, dto.File.FileName);

        material.Url = pdfUrl;
    }
}
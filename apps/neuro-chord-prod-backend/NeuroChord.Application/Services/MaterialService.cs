using Microsoft.Extensions.Caching.Distributed;
using NeuroChord.Application.DTOs.Materials;
using NeuroChord.Application.Exceptions;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace NeuroChord.Application.Services;

public class MaterialService(
    IUnitOfWork unitOfWork,
    IEnumerable<IMaterialProcessingStrategy> strategies,
    IDistributedCache cache,
    IMaterialRepository materialRepository) : IMaterialService
{
    public async Task<MaterialResponseDto> CreateMaterialAsync(CreateMaterialDto dto, Guid userId)
    {
        var newMaterial = new Material
        {
            Topic = dto.Topic,
            Url = dto.Url ?? "",
            Type = dto.Type,
            IsPublic = dto.IsPublic,
            OwnerId = userId,
            FolderId = dto.FolderId,
            RequiresSubscription = dto.RequiresSubscription,
            CreatedAt = DateTime.UtcNow
        };
        var strategy = strategies.FirstOrDefault(s => s.type == dto.Type)
                       ?? throw new NotSupportedException($"Type {dto.Type} is not supported.");
        await strategy.ProcessAsync(newMaterial, dto);
        materialRepository.AddMaterial(newMaterial);
        await unitOfWork.SaveChangesAsync();
        return MapToResponseDto(newMaterial);
    }

    public async Task<bool> DeleteMaterialAsync(Guid materialId, Guid userId)
    {
        var deletedMaterial = await materialRepository.DeleteUserMaterial(userId, materialId);
        return deletedMaterial;
    }

    public async Task<bool> DeleteAllUserMaterialsAsync(Guid userId)
    {
        return await materialRepository.DeleteAllUserMaterials(userId);
    }

    public async Task<MaterialResponseDto> UpdateMaterialAsync(Guid materialId, UpdateMaterialDto dto, Guid userId)
    {
        var material = await materialRepository.GetMaterial(materialId, userId);

        if (material == null)
            throw new NotFoundException($"Material with ID {materialId} not found.");

        if (material.OwnerId != userId)
            throw new ForbiddenException("You don't have permission to update this material.");

        material.Topic = dto.Topic;
        material.Url = dto.Url;
        material.Type = dto.Type;
        material.IsPublic = dto.IsPublic;
        material.FolderId = dto.FolderId;
        material.RequiresSubscription = dto.RequiresSubscription;
        material.UpdatedAt = DateTime.UtcNow;

        materialRepository.UpdateMaterial(material);
        await unitOfWork.SaveChangesAsync();


        return MapToResponseDto(material);
    }

    public async Task<MaterialResponseDto> GetMaterialByIdAsync(Guid id, Guid currentUserId)
    {
        var cacheKey = $"material_{id}";

        var cachedMaterial = await cache.GetStringAsync(cacheKey);
        if (!string.IsNullOrEmpty(cachedMaterial))
            return JsonSerializer.Deserialize<MaterialResponseDto>(cachedMaterial) ??
                   throw new NotFoundException($"Material with ID {id} not found.");

        var material = await materialRepository.GetMaterial(id, currentUserId);

        if (material == null) throw new NotFoundException($"Material with ID {id} not found.");

        var response = MapToResponseDto(material);
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        };
        await cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(response), cacheOptions);
        return response;
    }


    public async Task<IEnumerable<MaterialResponseDto>> GetUserMaterialsAsync(Guid? userId, Guid currentUserId)
    {
        var userMaterials = await materialRepository.GetAllUserMaterials(userId, currentUserId);
        return userMaterials.Select(MapToResponseDto).ToList();
    }

    private static MaterialResponseDto MapToResponseDto(Material m)
    {
        return new MaterialResponseDto(m.Id, m.Topic, m.Url, m.Type, m.IsPublic, m.FolderId, m.RequiresSubscription,
            m.CreatedAt);
    }
}
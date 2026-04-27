using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using NeuroChord.Application.DTOs.Materials;
using NeuroChord.Application.Exceptions;
using NeuroChord.Application.Interfaces;
using NeuroChordDomain.Entities;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace NeuroChord.Application.Services;

public class MaterialService(
    IUnitOfWork uow,
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
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var strategy = strategies.FirstOrDefault(s => s.type == dto.Type)
                       ?? throw new NotSupportedException($"Type {dto.Type} is not supported.");
        await strategy.ProcessAsync(newMaterial, dto);
        materialRepository.AddMaterial(newMaterial);
        await uow.SaveChangesAsync();
        return MapToResponseDto(newMaterial);
    }

    public async Task DeleteMaterialAsync(Guid materialId, Guid userId)
    {
        var material = await uow.Materials.GetByIdWithTrackingAsync(materialId);
        if (material == null) throw new NotFoundException("Material not found.");
        if (material.OwnerId != userId)
            throw new ForbiddenException("You don't have permission to delete this material.");

        uow.Materials.Remove(material);
        await uow.SaveChangesAsync();

        var cacheKey = $"material_{materialId}";
        await cache.RemoveAsync(cacheKey);
    }

    public async Task<bool> DeleteAllUserMaterialsAsync(Guid userId)
    {
        return await uow.Materials.DeleteAllUserMaterials(userId);
    }

    public async Task<MaterialResponseDto> UpdateMaterialAsync(Guid materialId, UpdateMaterialDto dto, Guid userId)
    {
        var material = await uow.Materials.GetByIdAsync(materialId);

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

        uow.Materials.UpdateMaterial(material);
        await uow.SaveChangesAsync();


        return MapToResponseDto(material);
    }

    public async Task<MaterialResponseDto> GetMaterialByIdAsync(Guid id, Guid currentUserId)
    {
        var cacheKey = $"material_{id}";
        MaterialResponseDto dto = null;

        var cachedData = await cache.GetStringAsync(cacheKey);
        if (!string.IsNullOrEmpty(cachedData))
        {
            dto = JsonSerializer.Deserialize<MaterialResponseDto>(cachedData);
        }
        else
        {
            var material = await uow.Materials.GetByIdAsync(id);
            if (material == null) throw new NotFoundException($"Material with ID {id} not found.");

            dto = MapToResponseDto(material);

            // Zapisujemy do cache, żeby następnym razem było szybciej
            var cacheOptions = new DistributedCacheEntryOptions
            { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) };
            await cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(dto), cacheOptions);
        }

        // 3. WSPÓLNA BRAMKA BEZPIECZEŃSTWA (Zawsze sprawdzana, nawet dla Cache!)
        var isOwner = dto.OwnerId == currentUserId;
        var isShared = await uow.SharedResources.IsMaterialSharedWithUser(id, currentUserId);

        if (!isOwner && !isShared && !dto.IsPublic)
            throw new ForbiddenException("You don't have permission to access this material");

        return dto;
    }

    public async Task<IEnumerable<MaterialResponseDto>> GetSharedMaterialsWithMeAsync(Guid currentUserId)
    {
        var sharedResources = await uow.SharedResources.GetSharedWithMe(currentUserId);
        if (sharedResources == null || !sharedResources.Any()) return Enumerable.Empty<MaterialResponseDto>();
        return sharedResources.Select(sr => MapToResponseDto(sr.Material))
            .ToList();
    }

    public async Task HandleSharingAsync(ShareMaterialDto dto, Guid currentUserId)
    {
        if (dto.MaterialId == Guid.Empty || dto.TargetId == Guid.Empty)
            throw new BadHttpRequestException("You have to give material ID");

        var material = await uow.Materials.GetByIdAsync(dto.MaterialId);
        if (material == null) throw new NotFoundException("Material not found.");

        var isOwner = material.OwnerId == currentUserId;
        if (!isOwner) throw new ForbiddenException("You don't have permission to sharing this material.");

        var isAlreadyShared =
            await uow.SharedResources.IsMaterialSharedWithUser(dto.MaterialId, dto.TargetId);
        if (isAlreadyShared) throw new ConflictException("You cannot share this material again.");

        var isSharingToThemself = dto.TargetId == material.OwnerId;
        if (isSharingToThemself) throw new ConflictException("You cannot share this material to yourself");
        var shareRecord = new SharedResources
        {
            MaterialId = dto.MaterialId,
            TargetId = dto.TargetId,
            AccessLevel = dto.AccessLevel
        };
        uow.SharedResources.Add(shareRecord);

        await uow.SaveChangesAsync();
    }

    public async Task<IEnumerable<MaterialResponseDto>> GetUsersMaterialsAsync(Guid currentUserId)
    {
        var userMaterials = await uow.Materials.GetUsersMaterials(currentUserId);
        if (userMaterials == null) return Enumerable.Empty<MaterialResponseDto>();

        return userMaterials.Select(MapToResponseDto).ToList();
    }

    public async Task<Material> GetMaterialForUserAsync(Guid materialId, Guid userId)
    {
        var material = await uow.Materials.GetByIdAsync(materialId);

        if (material == null) throw new NotFoundException($"Material with ID {materialId} not found.");
        var isOwner = material.OwnerId == userId;
        var isPublic = material.IsPublic;
        var isSharedWithMe = await uow.SharedResources.IsMaterialSharedWithUser(materialId, userId);
        if (isOwner || isPublic || isSharedWithMe) return material;
        throw new ForbiddenException("You don't have permission to retrieve this material.");
    }

    private static MaterialResponseDto MapToResponseDto(Material m)
    {
        return new MaterialResponseDto(m.Id, m.Topic, m.Url, m.Type, m.OwnerId, m.IsPublic, m.FolderId,
            m.RequiresSubscription,
            m.CreatedAt, m.UpdatedAt);
    }
}
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.Extensions.Caching.Distributed;
using Moq;
using NeuroChord.Application.DTOs.Materials;
using NeuroChord.Application.Exceptions;
using NeuroChord.Application.Interfaces;
using NeuroChord.Application.Services;
using NeuroChordDomain.Entities;
using NeuroChordDomain.Enums;

namespace NeuroChord.UnitTests;

public class MaterialServiceTests
{
    private readonly Mock<IDistributedCache> _cacheMock;
    private readonly Mock<IMaterialRepository> _materialRepoMock;
    private readonly Mock<ISharedResourcesRepository> _sharedRepoMock; // 
    private readonly IEnumerable<IMaterialProcessingStrategy> _strategies;
    private readonly Mock<IMaterialProcessingStrategy> _strategiesMock;
    private readonly MaterialService _sut;
    private readonly Mock<IUnitOfWork> _uowMock;

    public MaterialServiceTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        _cacheMock = new Mock<IDistributedCache>();
        _materialRepoMock = new Mock<IMaterialRepository>();
        _sharedRepoMock = new Mock<ISharedResourcesRepository>();
        _strategies = Array.Empty<IMaterialProcessingStrategy>();
        _uowMock.Setup(x => x.SharedResources).Returns(_sharedRepoMock.Object);
        _sut = new MaterialService(_uowMock.Object, _strategies, _cacheMock.Object, _materialRepoMock.Object);
    }

    [Fact]
    public async Task HandleSharingAsync_ShoudThrowConflict_WhenSharingToSelf()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var materialId = Guid.NewGuid();
        var material = new Material { Id = materialId, OwnerId = userId };

        _uowMock.Setup(x => x.Materials.GetByIdAsync(materialId))
            .ReturnsAsync(material);

        _sharedRepoMock.Setup(x => x.IsMaterialSharedWithUser(materialId, userId))
            .ReturnsAsync(false);
        var dto = new ShareMaterialDto { MaterialId = materialId, TargetId = userId };

        // Act
        var act = () => _sut.HandleSharingAsync(dto, userId);
        // Assert
        await act.Should().ThrowAsync<ConflictException>().WithMessage("You cannot share this material to yourself");
    }

    [Fact]
    public async Task GetMaterialByIdAsync_ShouldReturnMaterialAndCacheIt_WhenCacheIsEmpty()
    {
        var userId = Guid.NewGuid();
        var materialId = Guid.NewGuid();
        var material = new Material { Id = materialId, OwnerId = userId, Topic = "Test material", IsPublic = true };

        _uowMock.Setup(x => x.Materials).Returns(_materialRepoMock.Object);
        _uowMock.Setup(x => x.SharedResources).Returns(_sharedRepoMock.Object);

        _materialRepoMock.Setup(x => x.GetByIdAsync(materialId))
            .ReturnsAsync(material);

        _cacheMock.Setup(x => x.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync((byte[])null!);

        // Act
        var result = await _sut.GetMaterialByIdAsync(materialId, userId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(materialId);

        _cacheMock.Verify(x => x.SetAsync(
            $"material_{materialId}",
            It.IsAny<byte[]>(),
            It.IsAny<DistributedCacheEntryOptions>(),
            default), Times.Once);
    }

    [Fact]
    public async Task GetMaterialByIdAsync_ShouldReturnMaterialFromCache_WhenDataIsPresentInCache()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var materialId = Guid.NewGuid();
        var cachedDto = new MaterialResponseDto(
            materialId,
            "Zasób z Cache",
            "https://neurochord.pl/test",
            MaterialType.File,
            userId,
            false,
            null,
            false,
            DateTime.UtcNow,
            DateTime.UtcNow
        );
        var jsonProvider = JsonSerializer.Serialize(cachedDto);
        var bytes = Encoding.UTF8.GetBytes(jsonProvider);

        _cacheMock.Setup(x => x.GetAsync($"material_{materialId}", default)).ReturnsAsync(bytes);


        // Act
        var result = await _sut.GetMaterialByIdAsync(materialId, userId);

        //Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(materialId);
        result.Topic.Should().Be(cachedDto.Topic);

        _uowMock.Verify(x => x.Materials.GetByIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task GetMaterialByIdAsync_ShouldReturnNull_WhenDataInCacheButUserHasNoAccess()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var materialId = Guid.NewGuid();

        var cachedDto = new MaterialResponseDto(
            materialId,
            "Private resource",
            "https://neurochord.pl/secret",
            MaterialType.File,
            ownerId,
            false,
            null,
            false,
            DateTime.UtcNow,
            null
        );
        var json = JsonSerializer.Serialize(cachedDto);
        var bytes = Encoding.UTF8.GetBytes(json);

        _cacheMock.Setup(x => x.GetAsync($"material_{materialId}", default)).ReturnsAsync(bytes);

        _sharedRepoMock.Setup(x => x.IsMaterialSharedWithUser(materialId, userId)).ReturnsAsync(false);

        // act
        var act = () => _sut.GetMaterialByIdAsync(materialId, userId);

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("You don't have permission to access this material");
        _uowMock.Verify(x => x.Materials.GetByIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task DeleteMaterialAsync_ShouldRemoveFromDatabaseAndInvalidateCache_WhenUserIsOwner()
    {
        var userId = Guid.NewGuid();
        var materialId = Guid.NewGuid();
        var cacheKey = $"material_{materialId}";

        var material = new Material
        {
            Id = materialId,
            OwnerId = userId,
            Topic = "Materiał do usunięcia"
        };

        _uowMock.Setup(x => x.Materials.GetByIdWithTrackingAsync(materialId))
            .ReturnsAsync(material);

        // Act
        await _sut.DeleteMaterialAsync(materialId, userId);

        // Assert
        _uowMock.Verify(x => x.Materials.Remove(It.Is<Material>(m => m.Id == materialId)), Times.Once);

        _uowMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);

        _cacheMock.Verify(x => x.RemoveAsync(cacheKey, default), Times.Once);
    }

    [Fact]
    public async Task HandleSharingAsync_ShouldAddSharedResource_WhenRequestIsValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var targetId = Guid.NewGuid();
        var materialId = Guid.NewGuid();
        var dto = new ShareMaterialDto
        {
            MaterialId = materialId,
            TargetId = targetId,
            AccessLevel = AccessLevel.Viewer
        };

        var material = new Material { Id = materialId, OwnerId = userId };

        _uowMock.Setup(x => x.Materials.GetByIdAsync(materialId))
            .ReturnsAsync(material);

        _uowMock.Setup(x => x.SharedResources.IsMaterialSharedWithUser(materialId, targetId))
            .ReturnsAsync(false);

        // Act
        await _sut.HandleSharingAsync(dto, userId);

        // Assert
        _uowMock.Verify(x => x.SharedResources.Add(It.Is<SharedResources>(sr =>
            sr.MaterialId == materialId && sr.TargetId == targetId)), Times.Once);

        _uowMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleSharingAsync_ShouldThrowForbidden_WhenUserIsNotOwner()
    {
        // Arrange
        var currentUserId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var materialId = Guid.NewGuid();
        var dto = new ShareMaterialDto
        {
            MaterialId = materialId,
            TargetId = ownerId,
            AccessLevel = AccessLevel.Viewer
        };

        var material = new Material { Id = materialId, OwnerId = ownerId };

        _uowMock.Setup(x => x.Materials.GetByIdAsync(materialId))
            .ReturnsAsync(material);

        // Act
        var act = () => _sut.HandleSharingAsync(dto, currentUserId);

        // Assert
        await act.Should().ThrowAsync<ForbiddenException>();
        _uowMock.Verify(x => x.SharedResources.Add(It.IsAny<SharedResources>()), Times.Never);
    }

    [Fact]
    public async Task HandleSharingAsync_ShouldThrowConflict_WhenSharingToSelf()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var materialId = Guid.NewGuid();
        // TargetId jest taki sam jak userId (właściciel)
        var dto = new ShareMaterialDto
        {
            MaterialId = materialId,
            TargetId = userId,
            AccessLevel = AccessLevel.Viewer
        };

        var material = new Material { Id = materialId, OwnerId = userId };

        _uowMock.Setup(x => x.Materials.GetByIdAsync(materialId))
            .ReturnsAsync(material);

        // Act
        var act = () => _sut.HandleSharingAsync(dto, userId);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("You cannot share this material to yourself");
    }

    [Fact]
    public async Task CreateMaterialAsync_ShouldAddMaterialAndProcessStrategy_WhenDataIsValid()
    {
        var strategyMock = new Mock<IMaterialProcessingStrategy>();
        strategyMock.Setup(s => s.type).Returns(MaterialType.Video);

        var strategies = new List<IMaterialProcessingStrategy> { strategyMock.Object };

        var sut = new MaterialService(
            _uowMock.Object,
            strategies,
            _cacheMock.Object,
            _materialRepoMock.Object
        );

        var userId = Guid.NewGuid();
        var dto = new CreateMaterialDto
        {
            Topic = "Test Video",
            Type = MaterialType.Video,
            Url = "https://test.com"
        };

        // Act
        var result = await sut.CreateMaterialAsync(dto, userId);

        // Assert
        strategyMock.Verify(s => s.ProcessAsync(It.IsAny<Material>(), dto), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        result.Should().NotBeNull();
    }
}
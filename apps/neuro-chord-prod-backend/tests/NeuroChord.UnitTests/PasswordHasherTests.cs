using FluentAssertions;
using NeuroChord.Infrastructure.Services;

namespace NeuroChord.UnitTests;

public class SecurityServiceTests
{
    private readonly SecurityService _sut;

    public SecurityServiceTests()
    {
        _sut = new SecurityService();
    }

    [Fact]
    public void HashPassword_ShouldReturnFormattedString()
    {
        // Arrange
        var password = "TestPassword123!";

        // Act
        var result = _sut.HashPassword(password);

        // Assert
        result.Should().Contain(".");
        var parts = result.Split('.');
        parts.Length.Should().Be(2);

        Assert.NotNull(Convert.FromBase64String(parts[0]));
        Assert.NotNull(Convert.FromBase64String(parts[1]));
    }

    [Theory]
    [InlineData("SafePassword123")]
    [InlineData("!@#$%^&*()_+")]
    [InlineData("DłuższeHasłoZPolskimiZnakamiąęść")]
    public void VerifyPassword_ShouldReturnTrue_ForCorrectPassword(string password)
    {
        // Arrange
        var hashedPassword = _sut.HashPassword(password);

        // Act
        var result = _sut.VerifyPassword(password, hashedPassword);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_ShouldReturnFalse_ForIncorrectPassword()
    {
        var password = "MySecretPassword";
        var wrongPassword = "MySecretPassword1";
        var hashedPassword = _sut.HashPassword(password);

        var result = _sut.VerifyPassword(wrongPassword, hashedPassword);

        result.Should().BeFalse();
    }

    [Fact]
    public void HashPassword_ShouldGenerateUniqueHashes_ForSamePassword()
    {
        // Arrange
        var password = "SamePassword";

        // Act
        var hash1 = _sut.HashPassword(password);
        var hash2 = _sut.HashPassword(password);

        hash1.Should().NotBe(hash2);
    }
}
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.VisualStudio.TestPlatform.TestHost;

namespace NeuroChord.UnitTests;

public class AuthEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenCredentialsAreInvalid()
    {
        var invalidLogin = new
        {
            Email = "nonexistent@email.com",
            Password = "nonexistentpassword"
        };
        var response = await _client.PostAsJsonAsync("api/auth/login", invalidLogin);
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
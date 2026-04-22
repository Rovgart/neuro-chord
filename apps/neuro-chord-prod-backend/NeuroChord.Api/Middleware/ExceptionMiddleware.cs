using System.Net;
using System.Text.Json;
using FluentValidation;
using NeuroChord.Application.Common.Models;
using NeuroChord.Application.Exceptions;

namespace neuro_chord_prod_backend.Middleware;

public class ExceptionMiddleware
{
    private readonly IHostEnvironment _env;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly RequestDelegate _next;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            ValidationException valEx => (
                (int)HttpStatusCode.BadRequest,
                string.Join(";", valEx.Errors.Select(e => e.ErrorMessage))
            ),
            UnauthorizedAccessException => (
                (int)HttpStatusCode.Unauthorized,
                "No permission to perform this action"
            ),
            NotFoundException => (
                (int)HttpStatusCode.NotFound,
                exception.Message
            ),
            ForbiddenException => (
                (int)HttpStatusCode.Forbidden,
                "You are not authorized to perform this action"
            ),
            ConflictException => (
                (int)HttpStatusCode.Conflict,
                exception.Message
            ),
            _ => (
                (int)HttpStatusCode.InternalServerError,
                "Unexpected server error"
            )
        };

        var response = new ErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            Details = _env.IsDevelopment() ? exception.StackTrace : null
        };
        context.Response.StatusCode = statusCode;
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}
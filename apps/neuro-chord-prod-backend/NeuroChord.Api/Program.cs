using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using FluentValidation;
using Hangfire;
using Hangfire.Redis.StackExchange;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using neuro_chord_prod_backend.Middleware;
using NeuroChord.Application.Common.Security;
using NeuroChord.Application.Interfaces;
using NeuroChord.Application.Services;
using NeuroChord.Application.Validators;
using NeuroChord.Infrastructure.Persistence;
using NeuroChord.Infrastructure.Persistence.Repositories;
using NeuroChord.Infrastructure.Services;

var sender = new SmtpClient("127.0.0.1")
{
    Port = 1025
};
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IBackgroundJobService, BackgroundJobService>();
builder.Services.AddFluentEmail("noreply@neurochord.com", "Neuro Chord System")
    .AddRazorRenderer(typeof(EmailService))
    .AddSmtpSender(sender);
builder.Services.AddControllers();
builder.Services.AddStackExchangeRedisCache(options =>
{
    var redisPassword = builder.Configuration["REDIS_PASSWORD"]
                        ?? builder.Configuration["Redis:Password"];

    options.Configuration = $"127.0.0.1:6379,password={redisPassword},abortConnect=false";
    options.InstanceName = "NeuroChord_";
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey =
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!)),

            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],


            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateLifetime = true,

            ClockSkew = TimeSpan.Zero,

            RoleClaimType = ClaimTypes.Role,
            NameClaimType = JwtRegisteredClaimNames.Sub
        };
    });
var redisPassword = builder.Configuration["REDIS_PASSWORD"] ?? builder.Configuration["Redis:Password"];
var redisConnection = $"127.0.0.1:6379,password={redisPassword}";
builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseRedisStorage(redisConnection)
);
builder.Services.AddHangfireServer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "NeuroChord API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Wpisz: Bearer {twój_token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DevelopConnection")));

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<INeuroChordEmailService, EmailService>();
builder.Services.AddScoped<ISessionRepository, SessionRepository>();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<ISecurityService, SecurityService>();
builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
builder.Services.AddScoped<IProfileService, ProfileService>();


builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

var app = builder.Build();

// Pipeline HTTP
app.UseMiddleware<ExceptionMiddleware>();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHangfireDashboard();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await app.RunAsync();
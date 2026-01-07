using MessManagement.Data;
using MessManagement.Middleware;
using MessManagement.Routes;
using MessManagement.Utils;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", false);

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Cloudinary service
builder.Services.AddSingleton<CloudinaryService>();

// JSON options
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.WriteIndented = true;
});

// Session and cache
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(60);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// CORS - allow all origins for production (without credentials)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Check DB connection
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        if (dbContext.Database.CanConnect())
            logger.LogInformation("Neon PostgreSQL connection SUCCESSFUL");
        else
            logger.LogError("Neon PostgreSQL connection FAILED (CanConnect returned false)");
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Neon PostgreSQL connection ERROR");
    }
}

// Middleware
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("AllowAll");
app.UseSession();
app.UseMiddleware<JwtAuthenticationMiddleware>();

// API routes
app.MapApiRoutes();

// Basic test route
app.MapGet("/hello", () => Results.Ok(new { message = "Hello World from backend!" }));

// Run app
var port = Environment.GetEnvironmentVariable("PORT") ?? "5205";
var url = $"http://0.0.0.0:{port}";
app.Run(url);

using MessManagement.Data;
using MessManagement.Middleware;
using MessManagement.Routes;
using MessManagement.Utils;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Register Cloudinary service
builder.Services.AddSingleton<CloudinaryService>();

// Configure JSON serialization to use camelCase
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.WriteIndented = true;
});

builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(60);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .SetIsOriginAllowed(origin => true); // Allow any origin for development
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        if (dbContext.Database.CanConnect())
        {
            Console.WriteLine("Database connection successful!");
        }
        else
        {
            Console.WriteLine("Database connection failed!");
        }

        // Comment out auto-migration since tables already exist
        // dbContext.Database.Migrate();
        Console.WriteLine("Skipping auto-migration. Database ready.");
    }
    catch (Exception err)
    {
        Console.WriteLine("Unexpected error during database setup: " + err.Message);
    }
}

app.UseMiddleware<RequestLoggingMiddleware>();

app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseCors("AllowFrontend");

app.UseSession();

app.UseMiddleware<JwtAuthenticationMiddleware>();

app.MapApiRoutes();

app.Run();

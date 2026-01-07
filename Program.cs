using MessManagement.Data;
using MessManagement.Middleware;
using MessManagement.Routes;
using MessManagement.Utils;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", false);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddSingleton<CloudinaryService>();

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
    options.AddPolicy("FrontendOnly", policy =>
    {
        policy
            .WithOrigins("https://messmanagement-net-idc7.onrender.com")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        if (dbContext.Database.CanConnect())
            logger.LogInformation("Neon PostgreSQL connection SUCCESSFUL");
        else
            logger.LogError("Neon PostgreSQL connection FAILED");
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Neon PostgreSQL connection ERROR");
    }
}

app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("FrontendOnly");
app.UseSession();
app.UseMiddleware<JwtAuthenticationMiddleware>();

app.MapApiRoutes();

app.MapGet("/hello", () => Results.Ok(new { message = "Hello World from backend!" }));

var port = Environment.GetEnvironmentVariable("PORT") ?? "5205";
app.Run($"http://0.0.0.0:{port}");

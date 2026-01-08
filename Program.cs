using MessManagement.Data;
using MessManagement.Middleware;
using MessManagement.Routes;
using MessManagement.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", false);

var builder = WebApplication.CreateBuilder(args);

// PostgreSQL DbContext
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

// Session & Distributed cache
var isProd = !builder.Environment.IsDevelopment();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(60);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = isProd ? CookieSecurePolicy.Always : CookieSecurePolicy.None;
    options.Cookie.SameSite = isProd ? SameSiteMode.None : SameSiteMode.Lax;
    if (isProd)
    {
        var cookieDomain = builder.Configuration["CookieDomain"];
        if (!string.IsNullOrEmpty(cookieDomain))
            options.Cookie.Domain = cookieDomain;
    }
});

// CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new string[] { };
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendOnly", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Forwarded headers for reverse proxy (Render)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

// JWT middleware
builder.Services.AddScoped<JwtAuthenticationMiddleware>();

try
{
    var app = builder.Build();

    // Forwarded headers
    app.UseForwardedHeaders();

    // Logging DB connection
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

        foreach (var origin in allowedOrigins)
        {
            logger.LogInformation("Frontend allowed origin: {Origin}", origin);
        }
    }

    // Middlewares
    app.UseMiddleware<RequestLoggingMiddleware>();
    app.UseMiddleware<ErrorHandlingMiddleware>();
    app.UseCors("FrontendOnly");
    app.UseSession();

    // JWT Middleware conditional
    app.UseWhen(context =>
    {
        var path = context.Request.Path.Value?.ToLower();
        return !(path == "/" || path == "/hello" || path == "/api/user/login" || path == "/api/admin/login" || context.Request.Method == "OPTIONS");
    }, appBuilder =>
    {
        appBuilder.UseMiddleware<JwtAuthenticationMiddleware>();
    });

    // Map API routes
    app.MapApiRoutes();

    // Simple health check
    app.MapGet("/hello", () => Results.Ok(new { message = "Hello World from backend!" }));

    // Run server
    var port = Environment.GetEnvironmentVariable("PORT") ?? "5205";
    app.Run($"http://0.0.0.0:{port}");
}
catch (Exception ex)
{
    Console.WriteLine("Startup crash: " + ex);
}

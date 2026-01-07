using MessManagement.Data;
using MessManagement.Middleware;
using MessManagement.Routes;
using MessManagement.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;
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
    options.Cookie.SecurePolicy = Microsoft.AspNetCore.Http.CookieSecurePolicy.Always;
    options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.None;
    options.Cookie.Domain = ".onrender.com"; // dot prefix ensures subdomains match
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new string[] { };
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendOnly", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            foreach (var allowed in allowedOrigins)
            {
                if (origin.EndsWith(allowed, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            return false;
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

builder.Services.AddScoped<JwtAuthenticationMiddleware>();

try
{
    var app = builder.Build();

    app.UseForwardedHeaders();

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

    app.UseMiddleware<RequestLoggingMiddleware>();
    app.UseMiddleware<ErrorHandlingMiddleware>();
    app.UseCors("FrontendOnly");
    app.UseSession();

    app.UseWhen(context =>
    {
        var path = context.Request.Path.Value?.ToLower();
        return !(path == "/" || path == "/hello" || path == "/api/user/login" || path == "/api/admin/login" || context.Request.Method == "OPTIONS");
    }, appBuilder =>
    {
        appBuilder.UseMiddleware<JwtAuthenticationMiddleware>();
    });

    app.MapApiRoutes();

    app.MapGet("/hello", () => Results.Ok(new { message = "Hello World from backend!" }));

    var port = Environment.GetEnvironmentVariable("PORT") ?? "5205";
    app.Run($"http://0.0.0.0:{port}");
}
catch (Exception ex)
{
    Console.WriteLine("Startup crash: " + ex);
}

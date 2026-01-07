using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MessManagement.Data;
using MessManagement.Utils;

namespace MessManagement.Routes
{
    public class AdminLoginDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public static class AdminLoginRoutes
    {
        public static void MapAdminLoginRoutes(this RouteGroupBuilder admin)
        {
            admin.MapPost("/login", async (
                HttpContext httpContext,
                AppDbContext dbContext,
                IConfiguration configuration,
                AdminLoginDto dto
            ) =>
            {
                try
                {
                    Console.WriteLine("Admin login request received");

                    if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                    {
                        Console.WriteLine("Login failed: Missing email or password");
                        return Results.BadRequest(new { message = "Email and password are required" });
                    }

                    var trimmedEmail = dto.Email.Trim();
                    var trimmedPassword = dto.Password.Trim();
                    Console.WriteLine($"Trying to authenticate admin: {trimmedEmail}");

                    var adminUser = await dbContext.Users
                        .FirstOrDefaultAsync(u => u.Email == trimmedEmail && u.Password == trimmedPassword && u.Role == "Admin");

                    if (adminUser == null)
                    {
                        Console.WriteLine($"Login failed: Invalid credentials for {trimmedEmail}");
                        return Results.Json(new { message = "Invalid email or password" }, statusCode: 401);
                    }

                    if (!adminUser.IsActive)
                    {
                        Console.WriteLine($"Login failed: Admin {trimmedEmail} is inactive");
                        return Results.Json(new { message = "Account is inactive. Please contact admin." }, statusCode: 403);
                    }

                    var token = JwtUtils.GenerateJwtToken(adminUser, configuration);
                    Console.WriteLine($"JWT token generated for admin: {trimmedEmail}");

                    SessionUtils.SetUserSession(httpContext.Session, adminUser.Id, adminUser.Name, adminUser.Role, adminUser.Email);
                    Console.WriteLine($"Session created for admin: {trimmedEmail}");

                    var expiryInMinutes = int.Parse(configuration["JwtSettings:expiryInMinutes"] ?? "60");
                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true, // HTTPS required
                        SameSite = SameSiteMode.None, // cross-subdomain allowed
                        Domain = "messmanagement-net.onrender.com", // backend subdomain
                        Expires = DateTimeOffset.UtcNow.AddMinutes(expiryInMinutes),
                        Path = "/"
                    };

                    httpContext.Response.Cookies.Append("accessToken", token, cookieOptions);
                    Console.WriteLine($"JWT cookie set for admin: {trimmedEmail}");

                    return Results.Ok(new
                    {
                        token = token,
                        user = new
                        {
                            id = adminUser.Id,
                            name = adminUser.Name,
                            email = adminUser.Email,
                            role = adminUser.Role
                        }
                    });
                }
                catch (InvalidOperationException ex)
                {
                    Console.WriteLine("JWT configuration error: " + ex.Message);
                    return Results.Json(new { message = "Authentication configuration error" }, statusCode: 500);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Unexpected error during admin login: " + ex.Message);
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });

            admin.MapPost("/logout", async (HttpContext httpContext) =>
            {
                try
                {
                    httpContext.Session.Clear();

                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.None,
                        Domain = "messmanagement-net.onrender.com",
                        Expires = DateTimeOffset.UtcNow.AddDays(-1),
                        Path = "/"
                    };

                    httpContext.Response.Cookies.Append("accessToken", "", cookieOptions);

                    return Results.Ok(new { message = "Logged out successfully" });
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error during logout: " + ex.Message);
                    return Results.Json(new { message = "Logout failed" }, statusCode: 500);
                }
            });
        }
    }
}

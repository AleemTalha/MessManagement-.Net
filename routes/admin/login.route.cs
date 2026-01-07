using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MessManagement.Data;
using MessManagement.Routes;
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

                    var admin = await dbContext.Users
                        .FirstOrDefaultAsync(u => u.Email == trimmedEmail && u.Password == trimmedPassword && u.Role == "Admin");

                    if (admin == null)
                    {
                        Console.WriteLine($"Login failed: Invalid credentials for {trimmedEmail}");
                        return Results.Json(new { message = "Invalid email or password" }, statusCode: 401);
                    }

                    if (!admin.IsActive)
                    {
                        Console.WriteLine($"Login failed: Admin {trimmedEmail} is inactive");
                        return Results.Json(new { message = "Account is inactive. Please contact admin." }, statusCode: 403);
                    }

                    var token = JwtUtils.GenerateJwtToken(admin, configuration);
                    Console.WriteLine($"JWT token generated for admin: {trimmedEmail}");

                    SessionUtils.SetUserSession(httpContext.Session, admin.Id, admin.Name, admin.Role, admin.Email);
                    Console.WriteLine($"Session created for admin: {trimmedEmail}");

                    var expiryInMinutes = int.Parse(configuration["JwtSettings:expiryInMinutes"] ?? "60");
                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = false, // Set to false for localhost development
                        SameSite = SameSiteMode.Lax, // Use Lax instead of Strict for cross-origin
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
                            id = admin.Id,
                            name = admin.Name,
                            email = admin.Email,
                            role = admin.Role
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
                        Secure = false,
                        SameSite = SameSiteMode.Lax,
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

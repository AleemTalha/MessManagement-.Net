using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MessManagement.Data;
using MessManagement.Routes;
using MessManagement.Utils;

namespace MessManagement.Routes
{
    public class UserLoginDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public static class UserLoginRoutes
    {
        public static void MapUserLoginRoutes(this RouteGroupBuilder user)
        {
            user.MapPost("/login", async (
                HttpContext httpContext,
                AppDbContext dbContext,
                IConfiguration configuration,
                UserLoginDto dto
            ) =>
            {
                try
                {
                    Console.WriteLine("User login request received");

                    if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                    {
                        Console.WriteLine("Login failed: Missing email or password");
                        return Results.BadRequest(new { message = "Email and password are required" });
                    }

                    var trimmedEmail = dto.Email.Trim();
                    var trimmedPassword = dto.Password.Trim();
                    Console.WriteLine($"Trying to authenticate user: {trimmedEmail}");

                    var user = await dbContext.Users
                        .FirstOrDefaultAsync(u => u.Email == trimmedEmail && u.Password == trimmedPassword && u.Role == "User");

                    if (user == null)
                    {
                        Console.WriteLine($"Login failed: Invalid credentials for {trimmedEmail}");
                        return Results.Json(new { message = "Invalid email or password" }, statusCode: 401);
                    }

                    if (!user.IsActive)
                    {
                        Console.WriteLine($"Login failed: User {trimmedEmail} is inactive");
                        return Results.Json(new { message = "Account is inactive. Please contact admin." }, statusCode: 403);
                    }

                    var token = JwtUtils.GenerateJwtToken(user, configuration);
                    Console.WriteLine($"JWT token generated for user: {trimmedEmail}");

                    SessionUtils.SetUserSession(httpContext.Session, user.Id, user.Name, user.Role, user.Email);
                    Console.WriteLine($"Session created for user: {trimmedEmail}");

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
                    Console.WriteLine($"JWT cookie set for user: {trimmedEmail}");

                    return Results.Ok(new
                    {
                        token = token,
                        user = new
                        {
                            id = user.Id,
                            name = user.Name,
                            email = user.Email,
                            role = user.Role
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
                    Console.WriteLine("Unexpected error during user login: " + ex.Message);
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });

            user.MapPost("/logout", async (HttpContext httpContext) =>
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
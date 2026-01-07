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
                    if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                        return Results.BadRequest(new { message = "Email and password are required" });

                    var trimmedEmail = dto.Email.Trim();
                    var trimmedPassword = dto.Password.Trim();

                    var adminUser = await dbContext.Users
                        .FirstOrDefaultAsync(u => u.Email == trimmedEmail && u.Password == trimmedPassword && u.Role == "Admin");

                    if (adminUser == null)
                        return Results.Json(new { message = "Invalid email or password" }, statusCode: 401);

                    if (!adminUser.IsActive)
                        return Results.Json(new { message = "Account is inactive. Please contact admin." }, statusCode: 403);

                    var token = JwtUtils.GenerateJwtToken(adminUser, configuration);
                    SessionUtils.SetUserSession(httpContext.Session, adminUser.Id, adminUser.Name, adminUser.Role, adminUser.Email);

                    var expiryInMinutes = int.Parse(configuration["JwtSettings:expiryInMinutes"] ?? "60");
                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.None,
                        Domain = ".onrender.com",
                        Expires = DateTimeOffset.UtcNow.AddMinutes(expiryInMinutes),
                        Path = "/"
                    };

                    httpContext.Response.Cookies.Append("accessToken", token, cookieOptions);

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
                catch (Exception ex)
                {
                    Console.WriteLine("Error during admin login: " + ex.Message);
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });

            admin.MapPost("/logout", async (HttpContext httpContext) =>
            {
                httpContext.Session.Clear();

                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Domain = ".onrender.com",
                    Expires = DateTimeOffset.UtcNow.AddDays(-1),
                    Path = "/"
                };

                httpContext.Response.Cookies.Append("accessToken", "", cookieOptions);

                return Results.Ok(new { message = "Logged out successfully" });
            });
        }
    }
}

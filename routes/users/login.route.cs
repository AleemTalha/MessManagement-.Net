using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MessManagement.Data;
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
                    if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                        return Results.BadRequest(new { message = "Email and password are required" });

                    var trimmedEmail = dto.Email.Trim();
                    var trimmedPassword = dto.Password.Trim();

                    var userEntity = await dbContext.Users
                        .FirstOrDefaultAsync(u => u.Email == trimmedEmail && u.Password == trimmedPassword && u.Role == "User");

                    if (userEntity == null)
                        return Results.Json(new { message = "Invalid email or password" }, statusCode: 401);

                    if (!userEntity.IsActive)
                        return Results.Json(new { message = "Account is inactive. Please contact admin." }, statusCode: 403);

                    var token = JwtUtils.GenerateJwtToken(userEntity, configuration);
                    SessionUtils.SetUserSession(httpContext.Session, userEntity.Id, userEntity.Name, userEntity.Role, userEntity.Email);

                    var expiryInMinutes = int.Parse(configuration["JwtSettings:expiryInMinutes"] ?? "60");
                    var isProduction = httpContext.Request.Host.Host != "localhost" && httpContext.Request.Host.Host != "127.0.0.1";
                    
                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = isProduction,
                        SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
                        Expires = DateTimeOffset.UtcNow.AddMinutes(expiryInMinutes),
                        Path = "/"
                    };

                    httpContext.Response.Cookies.Append("accessToken", token, cookieOptions);
                    
                    Console.WriteLine($"User login successful - ID: {userEntity.Id}, Email: {userEntity.Email}");
                    Console.WriteLine($"Token: {token}");
                    Console.WriteLine($"Session ID: {httpContext.Session.Id}");
                    Console.WriteLine($"IsProduction: {isProduction}, Secure: {isProduction}");

                    return Results.Ok(new
                    {
                        token = token,
                        sessionId = httpContext.Session.Id,
                        expiresIn = expiryInMinutes * 60,
                        user = new
                        {
                            id = userEntity.Id,
                            name = userEntity.Name,
                            email = userEntity.Email,
                            role = userEntity.Role
                        }
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error during user login: " + ex.Message);
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });

            user.MapPost("/logout", async (HttpContext httpContext) =>
            {
                httpContext.Session.Clear();
                var isProduction = httpContext.Request.Host.Host != "localhost" && httpContext.Request.Host.Host != "127.0.0.1";

                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = isProduction,
                    SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddDays(-1),
                    Path = "/"
                };

                httpContext.Response.Cookies.Append("accessToken", "", cookieOptions);

                return Results.Ok(new { message = "Logged out successfully" });
            });
        }
    }
}

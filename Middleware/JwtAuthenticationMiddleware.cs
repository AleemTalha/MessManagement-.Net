using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using MessManagement.Utils;

namespace MessManagement.Middleware
{
    public class JwtAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<JwtAuthenticationMiddleware> _logger;
        private readonly IConfiguration _configuration;

        public JwtAuthenticationMiddleware(
            RequestDelegate next,
            ILogger<JwtAuthenticationMiddleware> logger,
            IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLower();

            if (path?.StartsWith("/api/admin/login") == true ||
                path?.StartsWith("/api/admin/register") == true ||
                path?.StartsWith("/api/user/login") == true)
            {
                await _next(context);
                return;
            }

            var token = GetTokenFromRequest(context);

            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("No JWT token found in request");
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { message = "Authentication required" });
                return;
            }

            try
            {
                var principal = JwtUtils.VerifyJwtToken(token, _configuration);

                if (principal == null)
                {
                    _logger.LogWarning("Invalid JWT token");
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "Invalid token" });
                    return;
                }

                // Try multiple claim types for user ID
                var userIdClaim = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                    ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? principal.FindFirst("sub")?.Value;
                    
                _logger.LogInformation("JWT Claims: {Claims}", string.Join(", ", principal.Claims.Select(c => $"{c.Type}={c.Value}")));
                
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    _logger.LogWarning("No user ID claim found in JWT token");
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "Invalid token claims - no user ID" });
                    return;
                }
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    _logger.LogWarning("Invalid user ID format in JWT token: {UserIdClaim}", userIdClaim);
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "Invalid token claims - user ID format" });
                    return;
                }

                var sessionUser = SessionUtils.GetUser(context.Session);
                
                if (sessionUser == null)
                {
                    _logger.LogWarning("No session found for JWT user {UserId}. Creating session from JWT.", userId);
                    
                    // Get user details from JWT claims
                    var userName = principal.FindFirst(JwtRegisteredClaimNames.Name)?.Value 
                        ?? principal.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
                    var userEmail = principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value 
                        ?? principal.FindFirst(ClaimTypes.Email)?.Value ?? "";
                    var userRole = principal.FindFirst(ClaimTypes.Role)?.Value 
                        ?? principal.FindFirst("role")?.Value ?? "User";
                    
                    sessionUser = new SessionUtils.SessionUser
                    {
                        UserId = userId,
                        UserName = userName,
                        UserRole = userRole,
                        UserEmail = userEmail
                    };
                    
                    // Set session for future requests
                    SessionUtils.SetUserSession(context.Session, userId, userName, userRole, userEmail);
                    _logger.LogInformation("Session created from JWT for user {UserId} with role {Role}", userId, userRole);
                }
                else if (sessionUser.UserId != userId)
                {
                    _logger.LogWarning("Session user ID {SessionUserId} does not match JWT user ID {JwtUserId}", 
                        sessionUser.UserId, userId);
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "Session mismatch" });
                    return;
                }
                else
                {
                    _logger.LogInformation("Session validated for user {UserId} with role {Role}", 
                        sessionUser.UserId, sessionUser.UserRole);
                }

                context.Items["User"] = sessionUser;
                context.Items["UserId"] = userId;
                context.Items["UserName"] = sessionUser.UserName;
                context.Items["UserRole"] = sessionUser.UserRole;
                context.Items["UserEmail"] = sessionUser.UserEmail;

                _logger.LogInformation("JWT authentication successful for user {UserId}", userId);
                await _next(context);
            }
            catch (SecurityTokenExpiredException)
            {
                _logger.LogWarning("JWT token expired");
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { message = "Token expired" });
                return;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during JWT authentication");
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                Console.WriteLine(ex);
                await context.Response.WriteAsJsonAsync(new { message = "Authentication error" });
                return;
            }
        }

        private static string? GetTokenFromRequest(HttpContext context)
        {
            var authorizationHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer "))
            {
                return authorizationHeader.Substring("Bearer ".Length).Trim();
            }

            return context.Request.Cookies["accessToken"];
        }
    }
}
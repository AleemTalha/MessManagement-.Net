using System;
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
            var providedSessionId = GetSessionIdFromRequest(context);

            if (string.IsNullOrEmpty(token))
            {
                var sessionUserOnly = SessionUtils.GetUser(context.Session);
                if (sessionUserOnly != null)
                {
                    // If client provided a session id header/cookie, ensure it matches the current server session id
                    if (!string.IsNullOrEmpty(providedSessionId) && providedSessionId != context.Session.Id)
                    {
                        _logger.LogWarning("Provided session id {Provided} does not match server session id {Server}.", providedSessionId, context.Session.Id);
                        ClearAuthenticationCookiesAndSession(context);
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        await context.Response.WriteAsJsonAsync(new { message = "Session mismatch" });
                        return;
                    }

                    _logger.LogInformation("No JWT token provided but session exists — using session-based auth for user {UserId}", sessionUserOnly.UserId);
                    context.Items["User"] = sessionUserOnly;
                    context.Items["UserId"] = sessionUserOnly.UserId;
                    context.Items["UserName"] = sessionUserOnly.UserName;
                    context.Items["UserRole"] = sessionUserOnly.UserRole;
                    context.Items["UserEmail"] = sessionUserOnly.UserEmail;
                    await _next(context);
                    return;
                }

                _logger.LogWarning("No JWT token found in request and no session present");
                ClearAuthenticationCookiesAndSession(context);
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
                    ClearAuthenticationCookiesAndSession(context);
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
                    ClearAuthenticationCookiesAndSession(context);
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "Invalid token claims - no user ID" });
                    return;
                }
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    _logger.LogWarning("Invalid user ID format in JWT token: {UserIdClaim}", userIdClaim);
                    ClearAuthenticationCookiesAndSession(context);
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "Invalid token claims - user ID format" });
                    return;
                }

                // Read session id candidate (already obtained above) and session user
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

                    // If client provided a session id that doesn't match the new server session id, inform client
                    if (!string.IsNullOrEmpty(providedSessionId) && providedSessionId != context.Session.Id)
                    {
                        var isProduction = context.Request.Host.Host != "localhost" && context.Request.Host.Host != "127.0.0.1";
                        var cookieOptions = new CookieOptions
                        {
                            HttpOnly = false,
                            Secure = isProduction,
                            SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
                            Expires = DateTimeOffset.UtcNow.AddHours(1),
                            Path = "/"
                        };
                        context.Response.Cookies.Append("sessionId", context.Session.Id, cookieOptions);
                        context.Response.Headers["X-Session-Id"] = context.Session.Id;
                        _logger.LogInformation("Provided session id did not match server session. Sent new session id {SessionId} to client.", context.Session.Id);
                    }
                }
                else if (!string.IsNullOrEmpty(providedSessionId) && providedSessionId != context.Session.Id)
                {
                    // Provided session id doesn't match the server session id -> possible tampering or stale client
                    _logger.LogWarning("Provided session id {Provided} does not match server session id {Server}.", providedSessionId, context.Session.Id);
                    ClearAuthenticationCookiesAndSession(context);
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "Session mismatch" });
                    return;
                }
                else if (sessionUser.UserId != userId)
                {
                    ClearAuthenticationCookiesAndSession(context);
                    
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
                ClearAuthenticationCookiesAndSession(context);
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { message = "Token expired" });
                return;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during JWT authentication");
                ClearAuthenticationCookiesAndSession(context);
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                Console.WriteLine(ex);
                await context.Response.WriteAsJsonAsync(new { message = "Authentication error" });
                return;
            }
        }

        private void ClearAuthenticationCookiesAndSession(HttpContext context)
        {
            // Clear session
            context.Session.Clear();
            
            // Clear access token and session cookies
            var isProduction = context.Request.Host.Host != "localhost" && context.Request.Host.Host != "127.0.0.1";
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = isProduction,
                SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(-1),
                Path = "/"
            };
            
            context.Response.Cookies.Append("accessToken", "", cookieOptions);
            context.Response.Cookies.Append("sessionId", "", cookieOptions);
            context.Response.Headers.Remove("X-Session-Id");
            _logger.LogInformation("Cleared authentication cookies and session");
            return;
        }

        private static string? GetTokenFromRequest(HttpContext context)
        {
            var authorizationHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(authorizationHeader))
            {
                // Accept: "Bearer <token>" (case-insensitive) or just a bare token
                var parts = authorizationHeader.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 2 && parts[0].Equals("Bearer", StringComparison.OrdinalIgnoreCase))
                    return parts[1].Trim();

                if (parts.Length == 1)
                    return parts[0].Trim();
            }

            // Fallback to common alternate header
            var xToken = context.Request.Headers["X-Access-Token"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(xToken))
                return xToken.Trim();

            // Then fallback to cookies
            if (context.Request.Cookies.TryGetValue("accessToken", out var cookieToken) && !string.IsNullOrWhiteSpace(cookieToken))
                return cookieToken.Trim();

            if (context.Request.Cookies.TryGetValue("token", out var cookieToken2) && !string.IsNullOrWhiteSpace(cookieToken2))
                return cookieToken2.Trim();

            return null;
        }

        private static string? GetSessionIdFromRequest(HttpContext context)
        {
            var header = context.Request.Headers["X-Session-Id"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(header))
                return header.Trim();

            if (context.Request.Cookies.TryGetValue("sessionId", out var cookieSession) && !string.IsNullOrWhiteSpace(cookieSession))
                return cookieSession.Trim();

            // Fallback to the current server session id if present
            if (!string.IsNullOrEmpty(context.Session.Id))
                return context.Session.Id;

            return null;
        }
    }
}
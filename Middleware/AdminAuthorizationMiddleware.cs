using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using MessManagement.Utils;

namespace MessManagement.Middleware
{
    public class AdminAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<AdminAuthorizationMiddleware> _logger;

        public AdminAuthorizationMiddleware(
            RequestDelegate next,
            ILogger<AdminAuthorizationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var user = context.Items["User"] as SessionUtils.SessionUser;

            if (user == null)
            {
                _logger.LogWarning("No user found in context for admin authorization");
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { message = "Authentication required" });
                return;
            }

            if (user.UserRole != "Admin")
            {
                _logger.LogWarning("User {UserId} attempted to access admin resource without admin role. Role: {Role}", 
                    user.UserId, user.UserRole);
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new { message = "Admin access required" });
                return;
            }

            _logger.LogInformation("Admin authorization successful for user {UserId}", user.UserId);
            await _next(context);
        }
    }
}

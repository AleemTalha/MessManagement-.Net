using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using MessManagement.Utils;

namespace MessManagement.Middleware
{
    public class UserAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<UserAuthorizationMiddleware> _logger;

        public UserAuthorizationMiddleware(
            RequestDelegate next,
            ILogger<UserAuthorizationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var user = context.Items["User"] as SessionUtils.SessionUser;

            if (user == null)
            {
                _logger.LogWarning("No user found in context for user authorization");
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { message = "Authentication required" });
                return;
            }

            if (user.UserRole != "User")
            {
                _logger.LogWarning("User {UserId} attempted to access user resource without user role. Role: {Role}",
                    user.UserId, user.UserRole);
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new { message = "User access required" });
                return;
            }

            _logger.LogInformation("User authorization successful for user {UserId}", user.UserId);
            await _next(context);
        }
    }
}
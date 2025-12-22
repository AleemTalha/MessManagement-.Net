using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.AspNetCore.Http;
using MessManagement.Data;
using MessManagement.Routes;
using MessManagement.Utils;

namespace MessManagement.Routes
{
    public static class AdminRoutes
    {
        public static void MapAdminRoutes(this RouteGroupBuilder app)
        {
            var admin = app.MapGroup("/admin");

            admin.MapAdminRegistrationRoutes();
            admin.MapAdminLoginRoutes();
            admin.MapMealRoutes();
            admin.MapScheduleRoutes();
            admin.MapUploadRoutes();
            admin.MapUserRoutes();

            admin.MapGet("/profile", (HttpContext context) =>
            {
                var user = context.Items["User"] as SessionUtils.SessionUser;
                if (user == null)
                {
                    return Results.Unauthorized();
                }

                return Results.Ok(new
                {
                    id = user.UserId,
                    name = user.UserName,
                    role = user.UserRole
                });
            });
        }
    }
}
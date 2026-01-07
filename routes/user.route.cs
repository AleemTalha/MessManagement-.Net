using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.AspNetCore.Http;
using MessManagement.Data;
using MessManagement.Routes;
using MessManagement.Utils;
using MessManagement.Models;

namespace MessManagement.Routes
{
    public static class UserRoutes
    {
        public static void MapUserRoutes(this RouteGroupBuilder app)
        {
            var user = app.MapGroup("/user");

            user.MapUserLoginRoutes();
            user.MapUserAttendanceRoutes();
            user.MapUserBillRoutes();
            user.MapAbsenceApplicationUserRoutes();
            user.MapUserTransactionRoutes();

            user.MapGet("/profile", (HttpContext context) =>
            {
                var sessionUser = context.Items["User"] as SessionUtils.SessionUser;
                if (sessionUser == null)
                {
                    return Results.Unauthorized();
                }

                if (sessionUser.UserRole != "User")
                {
                    return Results.Forbid();
                }

                return Results.Ok(new
                {
                    id = sessionUser.UserId,
                    name = sessionUser.UserName,
                    email = sessionUser.UserEmail
                });
            });
        }
    }
}
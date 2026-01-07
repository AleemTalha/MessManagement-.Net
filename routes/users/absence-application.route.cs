using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using MessManagement.Data;
using MessManagement.Utils;
using MessManagement.Models;

namespace MessManagement.Routes
{
    public class AbsenceApplicationRequest
    {
        public DateTime Date { get; set; }
    }

    public static class AbsenceApplicationUserRoutes
    {
        public static void MapAbsenceApplicationUserRoutes(this RouteGroupBuilder app)
        {
            // Get user's absence applications
            app.MapGet("/absence-applications", async (HttpContext context, AppDbContext dbContext) =>
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

                try
                {
                    var applications = await dbContext.AbsenceApplications
                        .Where(a => a.UserId == sessionUser.UserId)
                        .OrderByDescending(a => a.CreatedAt)
                        .Select(a => new
                        {
                            a.Id,
                            a.Date,
                            a.Status,
                            a.CreatedAt,
                            a.ReviewedAt,
                            a.ReviewedBy,
                            a.Notes
                        })
                        .ToListAsync();

                    return Results.Ok(applications);
                }
                catch (Exception ex)
                {
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });

            // Submit absence application
            app.MapPost("/absence-application", async (HttpContext context, AppDbContext dbContext, AbsenceApplicationRequest request) =>
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

                try
                {
                    // Convert incoming date to UTC
                    var dateUtc = DateTime.SpecifyKind(request.Date.Date, DateTimeKind.Utc);

                    // Check if application already exists for this date
                    var existingApplication = await dbContext.AbsenceApplications
                        .FirstOrDefaultAsync(a => a.UserId == sessionUser.UserId && a.Date.Date == dateUtc.Date);

                    if (existingApplication != null)
                    {
                        return Results.BadRequest(new { message = "Application already exists for this date" });
                    }

                    var application = new AbsenceApplication
                    {
                        UserId = sessionUser.UserId.Value,
                        UserName = sessionUser.UserName,
                        Date = dateUtc,
                        Status = "Pending",
                        CreatedAt = DateTime.UtcNow
                    };

                    dbContext.AbsenceApplications.Add(application);
                    await dbContext.SaveChangesAsync();

                    return Results.Ok(new
                    {
                        message = "Absence application submitted successfully",
                        applicationId = application.Id
                    });
                }
                catch (Exception ex)
                {
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });
        }
    }
}
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using MessManagement.Data;
using MessManagement.Utils;
using MessManagement.Models;

namespace MessManagement.Routes
{
    public class AbsenceApplicationReviewRequest
    {
        public string Status { get; set; } // Approved or Rejected
        public string? Notes { get; set; }
    }

    public static class AbsenceApplicationAdminRoutes
    {
        public static void MapAbsenceApplicationAdminRoutes(this RouteGroupBuilder app)
        {
            // Get all absence applications
            app.MapGet("/absence-applications", async (HttpContext context, AppDbContext dbContext, string? status) =>
            {
                var user = context.Items["User"] as SessionUtils.SessionUser;
                if (user == null || user.UserRole != "Admin")
                {
                    return Results.Unauthorized();
                }

                try
                {
                    var query = dbContext.AbsenceApplications.AsQueryable();
                    if (!string.IsNullOrEmpty(status))
                    {
                        query = query.Where(a => a.Status == status);
                    }

                    var applications = await query
                        .OrderByDescending(a => a.CreatedAt)
                        .Select(a => new
                        {
                            a.Id,
                            a.UserId,
                            a.UserName,
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

            // Approve or reject absence application
            app.MapPut("/absence-application/{id}", async (HttpContext context, AppDbContext dbContext, int id, AbsenceApplicationReviewRequest request) =>
            {
                var user = context.Items["User"] as SessionUtils.SessionUser;
                if (user == null || user.UserRole != "Admin")
                {
                    return Results.Unauthorized();
                }

                try
                {
                    var application = await dbContext.AbsenceApplications.FindAsync(id);
                    if (application == null)
                    {
                        return Results.NotFound(new { message = "Application not found" });
                    }

                    if (application.Status != "Pending")
                    {
                        return Results.BadRequest(new { message = "Application has already been reviewed" });
                    }

                    application.Status = request.Status;
                    application.ReviewedAt = DateTime.UtcNow;
                    application.ReviewedBy = user.UserName;
                    application.Notes = request.Notes;

                    if (request.Status == "Approved")
                    {
                        // Mark attendance as absent and deduct meal price
                        var applicationDateUtc = DateTime.SpecifyKind(application.Date.Date, DateTimeKind.Utc);
                        
                        var monthlyAttendance = await dbContext.MonthlyAttendances
                            .Include(m => m.DailyAttendances)
                            .FirstOrDefaultAsync(m => m.UserId == application.UserId && 
                                                     m.Month == applicationDateUtc.Month && 
                                                     m.Year == applicationDateUtc.Year);

                        if (monthlyAttendance != null)
                        {
                            var dailyAttendance = monthlyAttendance.DailyAttendances
                                .FirstOrDefault(d => d.Date.Date == applicationDateUtc.Date);

                            if (dailyAttendance != null)
                            {
                                // Mark as absent (not taken meals)
                                dailyAttendance.MorningMealTaken = false;
                                dailyAttendance.EveningMealTaken = false;
                                dailyAttendance.MorningChargedAmount = 0;
                                dailyAttendance.EveningChargedAmount = 0;
                                dailyAttendance.Notes = $"Marked absent due to approved absence application. {dailyAttendance.Notes}".Trim();
                                dailyAttendance.UpdatedAt = DateTime.UtcNow;

                                // Recalculate monthly totals
                                monthlyAttendance.CalculateMonthlyTotals();
                                await dbContext.SaveChangesAsync();

                                // Update the bill
                                var bill = await dbContext.Bills
                                    .FirstOrDefaultAsync(b => b.UserId == application.UserId && 
                                                             b.BillMonth.Month == application.Date.Month && 
                                                             b.BillMonth.Year == application.Date.Year);

                                if (bill != null)
                                {
                                    bill.TotalAmount = monthlyAttendance.TotalMonthlyBill;
                                    bill.CalculateDueAmount();
                                    bill.UpdateTimestamp();
                                }
                            }
                        }
                    }

                    await dbContext.SaveChangesAsync();

                    return Results.Ok(new { message = $"Application {request.Status.ToLower()} successfully" });
                }
                catch (Exception ex)
                {
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });
        }
    }
}
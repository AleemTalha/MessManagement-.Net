using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using MessManagement.Data;
using MessManagement.Models;

namespace MessManagement.Routes
{
    public static class ResetAttendanceRoutes
    {
        public static void MapResetAttendanceRoutes(this RouteGroupBuilder admin)
        {
            admin.MapPost("/reset-attendance", async (
                HttpContext context,
                AppDbContext db,
                int? month = null,
                int? year = null
            ) =>
            {
                try
                {
                    var now = DateTime.UtcNow;
                    var targetMonth = month ?? now.Month;
                    var targetYear = year ?? now.Year;

                    // Find all monthly attendance records for the specified month/year
                    var monthlyRecords = await db.MonthlyAttendances
                        .Include(ma => ma.DailyAttendances)
                        .Where(ma => ma.Month == targetMonth && ma.Year == targetYear)
                        .ToListAsync();

                    if (!monthlyRecords.Any())
                    {
                        return Results.Ok(new 
                        { 
                            message = $"No attendance records found for {targetMonth}/{targetYear}",
                            recordsReset = 0,
                            daysReset = 0
                        });
                    }

                    int totalDaysReset = 0;

                    foreach (var monthlyRecord in monthlyRecords)
                    {
                        foreach (var dailyRecord in monthlyRecord.DailyAttendances)
                        {
                            // Reset morning attendance
                            dailyRecord.MorningIsMarked = false;
                            dailyRecord.MorningMealTaken = false;
                            dailyRecord.MorningMealName = string.Empty;
                            dailyRecord.MorningMealPrice = 0;
                            dailyRecord.MorningChargedAmount = 0;

                            // Reset evening attendance
                            dailyRecord.EveningIsMarked = false;
                            dailyRecord.EveningMealTaken = false;
                            dailyRecord.EveningMealName = string.Empty;
                            dailyRecord.EveningMealPrice = 0;
                            dailyRecord.EveningChargedAmount = 0;

                            dailyRecord.Notes = string.Empty;
                            dailyRecord.UpdatedAt = DateTime.UtcNow;

                            totalDaysReset++;
                        }

                        // Recalculate monthly totals (should be 0 now)
                        monthlyRecord.CalculateMonthlyTotals();
                        monthlyRecord.UpdateTimestamp();
                    }

                    await db.SaveChangesAsync();

                    return Results.Ok(new 
                    { 
                        message = $"Successfully reset all attendance for {targetMonth}/{targetYear}",
                        recordsReset = monthlyRecords.Count,
                        daysReset = totalDaysReset
                    });
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(new 
                    { 
                        message = "Failed to reset attendance",
                        error = ex.Message
                    });
                }
            });

            admin.MapPost("/reset-all-attendance", async (
                HttpContext context,
                AppDbContext db
            ) =>
            {
                try
                {
                    // Find ALL monthly attendance records
                    var allMonthlyRecords = await db.MonthlyAttendances
                        .Include(ma => ma.DailyAttendances)
                        .ToListAsync();

                    if (!allMonthlyRecords.Any())
                    {
                        return Results.Ok(new 
                        { 
                            message = "No attendance records found in the database",
                            recordsReset = 0,
                            daysReset = 0
                        });
                    }

                    int totalDaysReset = 0;

                    foreach (var monthlyRecord in allMonthlyRecords)
                    {
                        foreach (var dailyRecord in monthlyRecord.DailyAttendances)
                        {
                            // Reset morning attendance
                            dailyRecord.MorningIsMarked = false;
                            dailyRecord.MorningMealTaken = false;
                            dailyRecord.MorningMealName = string.Empty;
                            dailyRecord.MorningMealPrice = 0;
                            dailyRecord.MorningChargedAmount = 0;

                            // Reset evening attendance
                            dailyRecord.EveningIsMarked = false;
                            dailyRecord.EveningMealTaken = false;
                            dailyRecord.EveningMealName = string.Empty;
                            dailyRecord.EveningMealPrice = 0;
                            dailyRecord.EveningChargedAmount = 0;

                            dailyRecord.Notes = string.Empty;
                            dailyRecord.UpdatedAt = DateTime.UtcNow;

                            totalDaysReset++;
                        }

                        // Recalculate monthly totals (should be 0 now)
                        monthlyRecord.CalculateMonthlyTotals();
                        monthlyRecord.UpdateTimestamp();
                    }

                    await db.SaveChangesAsync();

                    return Results.Ok(new 
                    { 
                        message = "Successfully reset ALL attendance records in the database",
                        recordsReset = allMonthlyRecords.Count,
                        daysReset = totalDaysReset
                    });
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(new 
                    { 
                        message = "Failed to reset all attendance",
                        error = ex.Message
                    });
                }
            });
        }
    }
}

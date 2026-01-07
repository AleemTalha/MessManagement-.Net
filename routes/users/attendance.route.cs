using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using MessManagement.Data;
using MessManagement.Routes;
using MessManagement.Utils;

namespace MessManagement.Routes
{
    public static class UserAttendanceRoutes
    {
        public static void MapUserAttendanceRoutes(this RouteGroupBuilder user)
        {
            user.MapGet("/attendance", async (HttpContext context, AppDbContext dbContext) =>
            {
                try
                {
                    var sessionUser = context.Items["User"] as SessionUtils.SessionUser;
                    if (sessionUser == null || sessionUser.UserRole != "User")
                    {
                        return Results.Unauthorized();
                    }

                    var userId = sessionUser.UserId;
                    if (userId == null)
                    {
                        return Results.Unauthorized();
                    }

                    var now = DateTime.UtcNow;
                    var currentMonth = now.Month;
                    var currentYear = now.Year;

                    var previousMonth = currentMonth == 1 ? 12 : currentMonth - 1;
                    var previousYear = currentMonth == 1 ? currentYear - 1 : currentYear;

                    // Fetch current month attendance
                    var currentAttendance = await dbContext.MonthlyAttendances
                        .Include(m => m.DailyAttendances)
                        .FirstOrDefaultAsync(m => m.UserId == userId && m.Month == currentMonth && m.Year == currentYear);

                    // Fetch previous month attendance
                    var previousAttendance = await dbContext.MonthlyAttendances
                        .Include(m => m.DailyAttendances)
                        .FirstOrDefaultAsync(m => m.UserId == userId && m.Month == previousMonth && m.Year == previousYear);

                    var result = new
                    {
                        currentMonth = currentAttendance != null ? new
                        {
                            id = currentAttendance.Id,
                            month = currentAttendance.Month,
                            year = currentAttendance.Year,
                            totalMonthlyBill = currentAttendance.TotalMonthlyBill,
                            totalMealsTaken = currentAttendance.TotalMealsTaken,
                            dailyAttendances = currentAttendance.DailyAttendances.Select(d => new
                            {
                                day = d.Day,
                                date = d.Date.ToString("yyyy-MM-dd"),
                                morningIsMarked = d.MorningIsMarked,
                                eveningIsMarked = d.EveningIsMarked,
                                morningMealTaken = d.MorningMealTaken,
                                morningMealName = d.MorningMealName,
                                morningMealPrice = d.MorningMealPrice,
                                morningChargedAmount = d.MorningChargedAmount,
                                eveningMealTaken = d.EveningMealTaken,
                                eveningMealName = d.EveningMealName,
                                eveningMealPrice = d.EveningMealPrice,
                                eveningChargedAmount = d.EveningChargedAmount,
                                notes = d.Notes,
                                dailyTotal = d.GetDailyTotal(),
                                mealsCount = d.GetMealsCount()
                            }).ToList()
                        } : null,
                        previousMonth = previousAttendance != null ? new
                        {
                            id = previousAttendance.Id,
                            month = previousAttendance.Month,
                            year = previousAttendance.Year,
                            totalMonthlyBill = previousAttendance.TotalMonthlyBill,
                            totalMealsTaken = previousAttendance.TotalMealsTaken,
                            dailyAttendances = previousAttendance.DailyAttendances.Select(d => new
                            {
                                day = d.Day,
                                date = d.Date.ToString("yyyy-MM-dd"),
                                morningIsMarked = d.MorningIsMarked,
                                eveningIsMarked = d.EveningIsMarked,
                                morningMealTaken = d.MorningMealTaken,
                                morningMealName = d.MorningMealName,
                                morningMealPrice = d.MorningMealPrice,
                                morningChargedAmount = d.MorningChargedAmount,
                                eveningMealTaken = d.EveningMealTaken,
                                eveningMealName = d.EveningMealName,
                                eveningMealPrice = d.EveningMealPrice,
                                eveningChargedAmount = d.EveningChargedAmount,
                                notes = d.Notes,
                                dailyTotal = d.GetDailyTotal(),
                                mealsCount = d.GetMealsCount()
                            }).ToList()
                        } : null
                    };

                    return Results.Ok(result);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error fetching user attendance: " + ex.Message);
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });
        }
    }
}
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MessManagement.Data;
using MessManagement.Models;
using MessManagement.Utils;

namespace MessManagement.Routes
{
    public static class AttendanceRoutes
    {
        public static void MapAttendanceRoutes(this RouteGroupBuilder admin)
        {
            var attendance = admin.MapGroup("/attendance");
            
            attendance.MapGet("/monthly", async (HttpContext context, AppDbContext db, int month, int year, int page = 1, int limit = 30) =>
            {
                try
                {
                    if (month < 1 || month > 12)
                    {
                        return Results.BadRequest(new { message = "Month must be between 1 and 12." });
                    }

                    if (year < 2000 || year > 2100)
                    {
                        return Results.BadRequest(new { message = "Year must be between 2000 and 2100." });
                    }

                    if (page < 1)
                    {
                        page = 1;
                    }

                    if (limit < 1 || limit > 100)
                    {
                        limit = 30;
                    }

                    var skip = (page - 1) * limit;

                    var daysInMonth = DateTime.DaysInMonth(year, month);

                    var totalUsers = await db.Users
                        .Where(u => u.Role == "User" && u.IsActive)
                        .CountAsync();

                    var users = await db.Users
                        .AsNoTracking()
                        .Where(u => u.Role == "User" && u.IsActive)
                        .OrderBy(u => u.Name)
                        .Skip(skip)
                        .Take(limit)
                        .Select(u => new
                        {
                            u.Id,
                            u.Name,
                            u.Email,
                            u.PhoneNumber,
                            u.Age,
                            u.Address
                        })
                        .ToListAsync();

                    var attendanceData = new List<object>();

                    foreach (var user in users)
                    {
                        var monthlyAttendance = await db.MonthlyAttendances
                            .AsNoTracking()
                            .Include(ma => ma.DailyAttendances)
                            .FirstOrDefaultAsync(ma => ma.UserId == user.Id && ma.Month == month && ma.Year == year);

                        var morningAttendance = new List<string?>();
                        var eveningAttendance = new List<string?>();
                        var dailyTotals = new List<decimal>();
                        var dailyMealCounts = new List<int>();
                        var mealDetails = new List<object>();

                        for (int day = 1; day <= daysInMonth; day++)
                        {
                            var dayDate = new DateTime(year, month, day);
                            var isPastOrToday = dayDate <= DateTime.UtcNow.Date;
                            var dailyRecord = monthlyAttendance?.DailyAttendances.FirstOrDefault(da => da.Day == day);

                            if (dailyRecord != null)
                            {
                                morningAttendance.Add(dailyRecord.MorningMealTaken ? "p" : (isPastOrToday ? "a" : null));
                                eveningAttendance.Add(dailyRecord.EveningMealTaken ? "p" : (isPastOrToday ? "a" : null));
                                dailyTotals.Add(dailyRecord.GetDailyTotal());
                                dailyMealCounts.Add(dailyRecord.GetMealsCount());
                                mealDetails.Add(new
                                {
                                    day = day,
                                    morning = dailyRecord.MorningMealTaken ? new
                                    {
                                        taken = true,
                                        mealName = dailyRecord.MorningMealName,
                                        mealPrice = dailyRecord.MorningMealPrice,
                                        chargedAmount = dailyRecord.MorningChargedAmount
                                    } : null,
                                    evening = dailyRecord.EveningMealTaken ? new
                                    {
                                        taken = true,
                                        mealName = dailyRecord.EveningMealName,
                                        mealPrice = dailyRecord.EveningMealPrice,
                                        chargedAmount = dailyRecord.EveningChargedAmount
                                    } : null
                                });
                            }
                            else
                            {
                                morningAttendance.Add(isPastOrToday ? "a" : null);
                                eveningAttendance.Add(isPastOrToday ? "a" : null);
                                dailyTotals.Add(0);
                                dailyMealCounts.Add(0);
                                mealDetails.Add(new
                                {
                                    day = day,
                                    morning = (object?)null,
                                    evening = (object?)null
                                });
                            }
                        }

                        var totalMorningMeals = morningAttendance.Count(a => a == "p");
                        var totalEveningMeals = eveningAttendance.Count(a => a == "p");
                        var totalMeals = totalMorningMeals + totalEveningMeals;
                        var totalAmount = dailyTotals.Sum();

                        attendanceData.Add(new
                        {
                            userId = user.Id,
                            userName = user.Name,
                            userEmail = user.Email,
                            userPhone = user.PhoneNumber,
                            userAge = user.Age,
                            userAddress = user.Address,
                            morningAttendance = morningAttendance,
                            eveningAttendance = eveningAttendance,
                            dailyTotals = dailyTotals,
                            dailyMealCounts = dailyMealCounts,
                            mealDetails = mealDetails,
                            summary = new
                            {
                                totalMorningMeals = totalMorningMeals,
                                totalEveningMeals = totalEveningMeals,
                                totalMeals = totalMeals,
                                totalAmount = totalAmount
                            }
                        });
                    }

                    Console.WriteLine($"Retrieved attendance for {users.Count} users for {month}/{year}");

                    return Results.Ok(new
                    {
                        month = month,
                        year = year,
                        daysInMonth = daysInMonth,
                        page = page,
                        limit = limit,
                        totalUsers = totalUsers,
                        totalPages = (int)Math.Ceiling((double)totalUsers / limit),
                        currentPageUsers = users.Count,
                        attendanceData = attendanceData
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error retrieving monthly attendance: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    return Results.Problem(new ProblemDetails
                    {
                        Status = 500,
                        Title = "Internal Server Error",
                        Detail = "An unexpected error occurred while retrieving attendance data."
                    });
                }
            });
        }
    }
}

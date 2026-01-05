using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MessManagement.Data;
using MessManagement.Models;

namespace MessManagement.Routes
{
    public static class AttendanceRoutes
    {
        public static void MapAttendanceRoutes(this RouteGroupBuilder admin)
        {
            var attendance = admin.MapGroup("/attendance");

            attendance.MapGet("/monthly", async (
                HttpContext context,
                AppDbContext db,
                int month,
                int year,
                int page = 1,
                int limit = 30
            ) =>
            {
                if (month < 1 || month > 12) return Results.BadRequest(new { message = "Month must be between 1 and 12." });
                if (year < 2000 || year > 2100) return Results.BadRequest(new { message = "Year must be between 2000 and 2100." });
                if (page < 1) page = 1;
                if (limit < 1 || limit > 100) limit = 30;

                int skip = (page - 1) * limit;
                int daysInMonth = DateTime.DaysInMonth(year, month);

                var schedule = await db.WeekSchedules
                    .Include(s => s.Monday)
                    .Include(s => s.Tuesday)
                    .Include(s => s.Wednesday)
                    .Include(s => s.Thursday)
                    .Include(s => s.Friday)
                    .Include(s => s.Saturday)
                    .Include(s => s.Sunday)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (schedule != null)
                {
                    var allMealIds = new List<int>();
                    if (schedule.Monday?.MorningMealId != null) allMealIds.Add(schedule.Monday.MorningMealId.Value);
                    if (schedule.Monday?.EveningMealId != null) allMealIds.Add(schedule.Monday.EveningMealId.Value);
                    if (schedule.Tuesday?.MorningMealId != null) allMealIds.Add(schedule.Tuesday.MorningMealId.Value);
                    if (schedule.Tuesday?.EveningMealId != null) allMealIds.Add(schedule.Tuesday.EveningMealId.Value);
                    if (schedule.Wednesday?.MorningMealId != null) allMealIds.Add(schedule.Wednesday.MorningMealId.Value);
                    if (schedule.Wednesday?.EveningMealId != null) allMealIds.Add(schedule.Wednesday.EveningMealId.Value);
                    if (schedule.Thursday?.MorningMealId != null) allMealIds.Add(schedule.Thursday.MorningMealId.Value);
                    if (schedule.Thursday?.EveningMealId != null) allMealIds.Add(schedule.Thursday.EveningMealId.Value);
                    if (schedule.Friday?.MorningMealId != null) allMealIds.Add(schedule.Friday.MorningMealId.Value);
                    if (schedule.Friday?.EveningMealId != null) allMealIds.Add(schedule.Friday.EveningMealId.Value);
                    if (schedule.Saturday?.MorningMealId != null) allMealIds.Add(schedule.Saturday.MorningMealId.Value);
                    if (schedule.Saturday?.EveningMealId != null) allMealIds.Add(schedule.Saturday.EveningMealId.Value);
                    if (schedule.Sunday?.MorningMealId != null) allMealIds.Add(schedule.Sunday.MorningMealId.Value);
                    if (schedule.Sunday?.EveningMealId != null) allMealIds.Add(schedule.Sunday.EveningMealId.Value);

                    var meals = await db.Meals
                        .Where(m => allMealIds.Contains(m.Id))
                        .ToListAsync();

                    if (schedule.Monday != null)
                    {
                        schedule.Monday.MorningMeal = schedule.Monday.MorningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Monday.MorningMealId.Value) : null;
                        schedule.Monday.EveningMeal = schedule.Monday.EveningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Monday.EveningMealId.Value) : null;
                    }
                    if (schedule.Tuesday != null)
                    {
                        schedule.Tuesday.MorningMeal = schedule.Tuesday.MorningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Tuesday.MorningMealId.Value) : null;
                        schedule.Tuesday.EveningMeal = schedule.Tuesday.EveningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Tuesday.EveningMealId.Value) : null;
                    }
                    if (schedule.Wednesday != null)
                    {
                        schedule.Wednesday.MorningMeal = schedule.Wednesday.MorningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Wednesday.MorningMealId.Value) : null;
                        schedule.Wednesday.EveningMeal = schedule.Wednesday.EveningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Wednesday.EveningMealId.Value) : null;
                    }
                    if (schedule.Thursday != null)
                    {
                        schedule.Thursday.MorningMeal = schedule.Thursday.MorningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Thursday.MorningMealId.Value) : null;
                        schedule.Thursday.EveningMeal = schedule.Thursday.EveningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Thursday.EveningMealId.Value) : null;
                    }
                    if (schedule.Friday != null)
                    {
                        schedule.Friday.MorningMeal = schedule.Friday.MorningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Friday.MorningMealId.Value) : null;
                        schedule.Friday.EveningMeal = schedule.Friday.EveningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Friday.EveningMealId.Value) : null;
                    }
                    if (schedule.Saturday != null)
                    {
                        schedule.Saturday.MorningMeal = schedule.Saturday.MorningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Saturday.MorningMealId.Value) : null;
                        schedule.Saturday.EveningMeal = schedule.Saturday.EveningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Saturday.EveningMealId.Value) : null;
                    }
                    if (schedule.Sunday != null)
                    {
                        schedule.Sunday.MorningMeal = schedule.Sunday.MorningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Sunday.MorningMealId.Value) : null;
                        schedule.Sunday.EveningMeal = schedule.Sunday.EveningMealId != null ? meals.FirstOrDefault(m => m.Id == schedule.Sunday.EveningMealId.Value) : null;
                    }
                }

                var totalUsers = await db.Users.Where(u => u.Role == "User" && u.IsActive).CountAsync();

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
                var now = DateTime.UtcNow;
                var currentDate = now.Date;
                var currentHour = now.Hour;
                
                // Morning time: 6:00 AM to 2:59 PM (6-14)
                // Evening time: 3:00 PM onwards (15+)
                var isMorningTime = currentHour >= 6 && currentHour < 15;
                var isEveningTime = currentHour >= 15;
                var isBeforeMorningTime = currentHour < 6;
                
                var isCurrentMonth = month == now.Month && year == now.Year;
                var isReadOnly = !isCurrentMonth;

                foreach (var user in users)
                {
                    var monthlyAttendance = await db.MonthlyAttendances
                        .Include(ma => ma.DailyAttendances)
                        .FirstOrDefaultAsync(ma => ma.UserId == user.Id && ma.Month == month && ma.Year == year);

                    if (monthlyAttendance == null)
                    {
                        monthlyAttendance = new MonthlyAttendance
                        {
                            UserId = user.Id,
                            Month = month,
                            Year = year
                        };
                        monthlyAttendance.InitializeMonth();
                        db.MonthlyAttendances.Add(monthlyAttendance);
                        await db.SaveChangesAsync();
                    }

                    var morningAttendance = new List<string?>();
                    var eveningAttendance = new List<string?>();
                    var dailyTotals = new List<decimal>();
                    var dailyMealCounts = new List<int>();
                    var mealDetails = new List<object>();
                    bool hasChanges = false;

                    for (int day = 1; day <= daysInMonth; day++)
                    {
                        var dayDate = new DateTime(year, month, day);
                        var isToday = isCurrentMonth && dayDate == currentDate;
                        var isPastDay = dayDate < currentDate;
                        var isFutureDay = dayDate > currentDate;
                        
                        var dailyRecord = monthlyAttendance.DailyAttendances.FirstOrDefault(da => da.Day == day);

                        if (dailyRecord == null)
                        {
                            dailyRecord = new DailyAttendance
                            {
                                Day = day,
                                Date = dayDate
                            };
                            monthlyAttendance.DailyAttendances.Add(dailyRecord);
                        }

                        string? morningValue = null;
                        string? eveningValue = null;

                        // Logic for determining attendance status
                        // Only auto-mark past days as absent, do NOT modify current day (handled in save route)
                        if (isPastDay)
                        {
                            // For past days, auto-mark unmarked attendance as absent
                            if (!dailyRecord.MorningIsMarked)
                            {
                                dailyRecord.MorningMealTaken = false;
                                dailyRecord.MorningIsMarked = true;
                                dailyRecord.UpdatedAt = DateTime.UtcNow;
                                hasChanges = true;
                            }
                            morningValue = dailyRecord.MorningMealTaken ? "p" : "a";

                            if (!dailyRecord.EveningIsMarked)
                            {
                                dailyRecord.EveningMealTaken = false;
                                dailyRecord.EveningIsMarked = true;
                                dailyRecord.UpdatedAt = DateTime.UtcNow;
                                hasChanges = true;
                            }
                            eveningValue = dailyRecord.EveningMealTaken ? "p" : "a";
                        }
                        else if (isToday)
                        {
                            if (isBeforeMorningTime)
                            {
                                // Before 6 AM, no attendance can be marked
                                morningValue = null;
                                eveningValue = null;
                            }
                            else if (isMorningTime)
                            {
                                // Morning time (6 AM - 2:59 PM): Show morning attendance if marked
                                morningValue = dailyRecord.MorningIsMarked 
                                    ? (dailyRecord.MorningMealTaken ? "p" : "a") 
                                    : null;
                                eveningValue = null; // Evening not available yet
                            }
                            else if (isEveningTime)
                            {
                                // Evening time (3 PM onwards): Auto-mark unmarked morning as absent
                                if (!dailyRecord.MorningIsMarked)
                                {
                                    dailyRecord.MorningMealTaken = false;
                                    dailyRecord.MorningIsMarked = true;
                                    dailyRecord.UpdatedAt = DateTime.UtcNow;
                                    hasChanges = true;
                                }
                                morningValue = dailyRecord.MorningMealTaken ? "p" : "a";
                                
                                // Show evening attendance if marked
                                eveningValue = dailyRecord.EveningIsMarked 
                                    ? (dailyRecord.EveningMealTaken ? "p" : "a") 
                                    : null;
                            }
                        }
                        else // isFutureDay
                        {
                            // Future days: Keep null (not accessible yet)
                            morningValue = null;
                            eveningValue = null;
                        }

                        morningAttendance.Add(morningValue);
                        eveningAttendance.Add(eveningValue);

                        dailyTotals.Add(dailyRecord.GetDailyTotal());
                        dailyMealCounts.Add(dailyRecord.GetMealsCount());
                        mealDetails.Add(new
                        {
                            day = day,
                            date = dayDate.ToString("yyyy-MM-dd"),
                            isToday,
                            isPast = isPastDay,
                            isFuture = isFutureDay,
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
                            } : null,
                            dailyTotal = dailyRecord.GetDailyTotal(),
                            notes = dailyRecord.Notes
                        });
                    }

                    if (hasChanges)
                    {
                        monthlyAttendance.CalculateMonthlyTotals();
                        await db.SaveChangesAsync();
                    }

                    var userBalance = await db.UserBalances.FirstOrDefaultAsync(ub => ub.UserId == user.Id);
                    if (userBalance == null)
                    {
                        userBalance = new UserBalance
                        {
                            UserId = user.Id,
                            Balance = 0,
                            TotalPaid = 0,
                            TotalBill = 0
                        };
                        db.UserBalances.Add(userBalance);
                        await db.SaveChangesAsync();
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
                        morningAttendance,
                        eveningAttendance,
                        dailyTotals,
                        dailyMealCounts,
                        mealDetails,
                        summary = new
                        {
                            totalMorningMeals,
                            totalEveningMeals,
                            totalMeals,
                            totalAmount,
                            monthlyBill = monthlyAttendance.TotalMonthlyBill,
                            totalMealsTaken = monthlyAttendance.TotalMealsTaken
                        },
                        balance = new
                        {
                            currentBalance = userBalance.Balance,
                            totalPaid = userBalance.TotalPaid,
                            totalBill = userBalance.TotalBill,
                            billRemaining = monthlyAttendance.TotalMonthlyBill
                        }
                    });
                }

                return Results.Ok(new
                {
                    month,
                    year,
                    daysInMonth,
                    page,
                    limit,
                    totalUsers,
                    totalPages = (int)Math.Ceiling((double)totalUsers / limit),
                    currentPageUsers = users.Count,
                    isReadOnly,
                    currentDay = now.Day,
                    currentHour,
                    isMorningTime,
                    isEveningTime,
                    timeContext = new 
                    {
                        currentTime = now.ToString("yyyy-MM-dd HH:mm:ss"),
                        period = isBeforeMorningTime ? "before_morning" : 
                                isMorningTime ? "morning" : "evening"
                    },
                    attendanceData
                });
            });

            attendance.MapPost("/save", async (
                HttpContext context,
                AppDbContext db,
                SaveAttendanceRequest request
            ) =>
            {
                var saveService = new AttendanceSaveService(db);
                var result = await saveService.SaveAttendanceAsync(request);

                if (result.IsSuccess)
                {
                    return Results.Ok(new { message = result.Message });
                }
                else
                {
                    return Results.BadRequest(new { message = result.Message });
                }
            });
        }
    }
}
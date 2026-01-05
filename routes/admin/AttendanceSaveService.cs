using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MessManagement.Data;
using MessManagement.Models;

namespace MessManagement.Routes
{
    /// <summary>
    /// Service to handle saving attendance records with proper validation and scheduling
    /// </summary>
    public class AttendanceSaveService
    {
        private readonly AppDbContext _db;

        public AttendanceSaveService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<AttendanceSaveResult> SaveAttendanceAsync(SaveAttendanceRequest request)
        {
            var now = DateTime.UtcNow;
            var isCurrentMonth = request.Month == now.Month && request.Year == now.Year;
            
            if (!isCurrentMonth)
            {
                return AttendanceSaveResult.Error("Cannot modify past month attendance records");
            }

            var dayDate = new DateTime(request.Year, request.Month, request.Day);
            var currentDate = now.Date;
            var currentHour = now.Hour;
            var isToday = dayDate == currentDate;
            var isPastDay = dayDate < currentDate;
            var isFutureDay = dayDate > currentDate;

            // Prevent modifications to future dates
            if (isFutureDay)
            {
                return AttendanceSaveResult.Error("Cannot modify future attendance records");
            }

            // Validate time-based restrictions for today
            if (isToday)
            {
                var isMorningTime = currentHour >= 6 && currentHour < 15;
                var isEveningTime = currentHour >= 15;
                var isBeforeMorningTime = currentHour < 6;

                if (isBeforeMorningTime)
                {
                    return AttendanceSaveResult.Error("Attendance cannot be marked before 6 AM");
                }

                // If it's morning time, prevent evening attendance modification
                if (isMorningTime)
                {
                    var hasEveningUpdates = request.Attendance.Any(a => a.EveningStatus != null);
                    if (hasEveningUpdates)
                    {
                        return AttendanceSaveResult.Error("Evening attendance cannot be marked during morning time");
                    }
                }
            }

            // Load schedule with meals
            var schedule = await LoadScheduleWithMealsAsync();
            var daySchedule = GetDaySchedule(schedule, dayDate.DayOfWeek);

            // Process each user's attendance
            foreach (var userAttendance in request.Attendance)
            {
                await UpdateUserAttendanceAsync(
                    userAttendance,
                    request.Month,
                    request.Year,
                    request.Day,
                    dayDate,
                    daySchedule
                );
            }

            // Recalculate and update all user balances after attendance changes
            await UpdateAllUserBalancesAsync(request);

            await _db.SaveChangesAsync();

            return AttendanceSaveResult.Success();
        }

        private async Task<WeekSchedule?> LoadScheduleWithMealsAsync()
        {
            var schedule = await _db.WeekSchedules
                .Include(s => s.Monday)
                .Include(s => s.Tuesday)
                .Include(s => s.Wednesday)
                .Include(s => s.Thursday)
                .Include(s => s.Friday)
                .Include(s => s.Saturday)
                .Include(s => s.Sunday)
                .FirstOrDefaultAsync();

            if (schedule == null) return null;

            // Collect all meal IDs
            var allMealIds = new List<int>();
            AddMealIds(allMealIds, schedule.Monday);
            AddMealIds(allMealIds, schedule.Tuesday);
            AddMealIds(allMealIds, schedule.Wednesday);
            AddMealIds(allMealIds, schedule.Thursday);
            AddMealIds(allMealIds, schedule.Friday);
            AddMealIds(allMealIds, schedule.Saturday);
            AddMealIds(allMealIds, schedule.Sunday);

            // Load all meals at once
            var meals = await _db.Meals
                .Where(m => allMealIds.Contains(m.Id))
                .ToListAsync();

            // Assign meals to schedule days
            AssignMealsToDay(schedule.Monday, meals);
            AssignMealsToDay(schedule.Tuesday, meals);
            AssignMealsToDay(schedule.Wednesday, meals);
            AssignMealsToDay(schedule.Thursday, meals);
            AssignMealsToDay(schedule.Friday, meals);
            AssignMealsToDay(schedule.Saturday, meals);
            AssignMealsToDay(schedule.Sunday, meals);

            return schedule;
        }

        private void AddMealIds(List<int> mealIds, DaySchedule? day)
        {
            if (day == null) return;
            if (day.MorningMealId.HasValue) mealIds.Add(day.MorningMealId.Value);
            if (day.EveningMealId.HasValue) mealIds.Add(day.EveningMealId.Value);
        }

        private void AssignMealsToDay(DaySchedule? day, List<Meal> meals)
        {
            if (day == null) return;
            
            day.MorningMeal = day.MorningMealId.HasValue
                ? meals.FirstOrDefault(m => m.Id == day.MorningMealId.Value)
                : null;
                
            day.EveningMeal = day.EveningMealId.HasValue
                ? meals.FirstOrDefault(m => m.Id == day.EveningMealId.Value)
                : null;
        }

        private DaySchedule? GetDaySchedule(WeekSchedule? schedule, DayOfWeek dayOfWeek)
        {
            if (schedule == null) return null;

            return dayOfWeek switch
            {
                DayOfWeek.Monday => schedule.Monday,
                DayOfWeek.Tuesday => schedule.Tuesday,
                DayOfWeek.Wednesday => schedule.Wednesday,
                DayOfWeek.Thursday => schedule.Thursday,
                DayOfWeek.Friday => schedule.Friday,
                DayOfWeek.Saturday => schedule.Saturday,
                DayOfWeek.Sunday => schedule.Sunday,
                _ => null
            };
        }

        private async Task UpdateUserAttendanceAsync(
            UserAttendanceUpdate userAttendance,
            int month,
            int year,
            int day,
            DateTime dayDate,
            DaySchedule? daySchedule)
        {
            var monthlyRecord = await _db.MonthlyAttendances
                .Include(ma => ma.DailyAttendances)
                .FirstOrDefaultAsync(ma => ma.UserId == userAttendance.UserId && 
                                           ma.Month == month && 
                                           ma.Year == year);

            if (monthlyRecord == null)
            {
                monthlyRecord = new MonthlyAttendance
                {
                    UserId = userAttendance.UserId,
                    Month = month,
                    Year = year
                };
                monthlyRecord.InitializeMonth();
                _db.MonthlyAttendances.Add(monthlyRecord);
            }

            var dailyRecord = monthlyRecord.DailyAttendances.FirstOrDefault(da => da.Day == day);
            if (dailyRecord == null)
            {
                dailyRecord = new DailyAttendance
                {
                    Day = day,
                    Date = dayDate
                };
                monthlyRecord.DailyAttendances.Add(dailyRecord);
            }

            // Update morning attendance
            if (userAttendance.MorningStatus != null)
            {
                dailyRecord.MorningIsMarked = true; // Mark as explicitly set
                dailyRecord.MorningMealTaken = userAttendance.MorningStatus == "p";
                
                if (dailyRecord.MorningMealTaken && daySchedule?.MorningMeal != null)
                {
                    dailyRecord.MorningMealName = daySchedule.MorningMeal.Name;
                    dailyRecord.MorningMealPrice = daySchedule.MorningMeal.Price;
                    dailyRecord.MorningChargedAmount = daySchedule.MorningMeal.Price;
                }
                else if (!dailyRecord.MorningMealTaken)
                {
                    dailyRecord.MorningMealName = string.Empty;
                    dailyRecord.MorningMealPrice = 0;
                    dailyRecord.MorningChargedAmount = 0;
                }
            }

            // Update evening attendance
            if (userAttendance.EveningStatus != null)
            {
                dailyRecord.EveningIsMarked = true; // Mark as explicitly set
                dailyRecord.EveningMealTaken = userAttendance.EveningStatus == "p";
                
                if (dailyRecord.EveningMealTaken && daySchedule?.EveningMeal != null)
                {
                    dailyRecord.EveningMealName = daySchedule.EveningMeal.Name;
                    dailyRecord.EveningMealPrice = daySchedule.EveningMeal.Price;
                    dailyRecord.EveningChargedAmount = daySchedule.EveningMeal.Price;
                }
                else if (!dailyRecord.EveningMealTaken)
                {
                    dailyRecord.EveningMealName = string.Empty;
                    dailyRecord.EveningMealPrice = 0;
                    dailyRecord.EveningChargedAmount = 0;
                }
            }

            dailyRecord.UpdatedAt = DateTime.UtcNow;
        }

        private async Task UpdateAllUserBalancesAsync(SaveAttendanceRequest request)
        {
            // Get all users that had attendance updated in this request
            var userIds = request.Attendance.Select(a => a.UserId).Distinct().ToList();

            foreach (var userId in userIds)
            {
                // Get all monthly attendance records for this user for the current month
                var monthlyRecord = await _db.MonthlyAttendances
                    .Include(ma => ma.DailyAttendances)
                    .FirstOrDefaultAsync(ma => ma.UserId == userId && 
                                             ma.Month == request.Month && 
                                             ma.Year == request.Year);

                if (monthlyRecord != null)
                {
                    // Recalculate monthly totals after all daily updates
                    monthlyRecord.CalculateMonthlyTotals();
                    monthlyRecord.UpdateTimestamp();

                    // Update user balance
                    var userBalance = await _db.UserBalances.FirstOrDefaultAsync(ub => ub.UserId == userId);
                    
                    if (userBalance == null)
                    {
                        userBalance = new UserBalance
                        {
                            UserId = userId,
                            Balance = 0,
                            TotalPaid = 0,
                            TotalBill = 0
                        };
                        _db.UserBalances.Add(userBalance);
                    }

                    // Set total bill to the monthly bill
                    userBalance.TotalBill = monthlyRecord.TotalMonthlyBill;
                    userBalance.CalculateBalance();
                    userBalance.UpdateTimestamp();
                }
            }
        }
    }

    public class AttendanceSaveResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;

        public static AttendanceSaveResult Success()
        {
            return new AttendanceSaveResult
            {
                IsSuccess = true,
                Message = "Attendance saved successfully"
            };
        }

        public static AttendanceSaveResult Error(string message)
        {
            return new AttendanceSaveResult
            {
                IsSuccess = false,
                Message = message
            };
        }
    }

    public class SaveAttendanceRequest
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public int Day { get; set; }
        public List<UserAttendanceUpdate> Attendance { get; set; } = new();
    }

    public class UserAttendanceUpdate
    {
        public int UserId { get; set; }
        public string? MorningStatus { get; set; }
        public string? EveningStatus { get; set; }
    }
}

using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MessManagement.Data;
using MessManagement.Models;
using MessManagement.Middleware;

namespace MessManagement.Routes
{
    public class CreateScheduleDto
    {
        public int MessId { get; set; }
        public DayScheduleDto? Monday { get; set; }
        public DayScheduleDto? Tuesday { get; set; }
        public DayScheduleDto? Wednesday { get; set; }
        public DayScheduleDto? Thursday { get; set; }
        public DayScheduleDto? Friday { get; set; }
        public DayScheduleDto? Saturday { get; set; }
        public DayScheduleDto? Sunday { get; set; }
    }

    public class DayScheduleDto
    {
        public int? MorningMealId { get; set; }
        public int? EveningMealId { get; set; }
    }

    public static class ScheduleRoutes
    {
        public static void MapScheduleRoutes(this RouteGroupBuilder admin)
        {
            var schedules = admin.MapGroup("/schedules");

            // Apply admin authorization middleware to all schedule routes
            schedules.AddEndpointFilter(async (context, next) =>
            {
                var httpContext = context.HttpContext;
                var middleware = new AdminAuthorizationMiddleware(
                    _ => Task.CompletedTask,
                    httpContext.RequestServices.GetRequiredService<ILogger<AdminAuthorizationMiddleware>>()
                );

                var canProceed = true;
                await middleware.InvokeAsync(httpContext);

                if (httpContext.Response.StatusCode == 401 || httpContext.Response.StatusCode == 403)
                {
                    canProceed = false;
                }

                return canProceed ? await next(context) : Results.StatusCode(httpContext.Response.StatusCode);
            });

            // GET: Get current week schedule
            schedules.MapGet("/", async (AppDbContext dbContext) =>
            {
                try
                {
                    // Owned types (DaySchedule) are automatically loaded with JSON conversion
                    var schedule = await dbContext.WeekSchedules
                        .FirstOrDefaultAsync();

                    if (schedule != null)
                    {
                        // Load meals for each day
                        await LoadMealsForSchedule(schedule, dbContext);
                    }

                    return Results.Ok(schedule);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error fetching schedule: " + ex.Message);
                    return Results.Json(new { message = "Failed to fetch schedule" }, statusCode: 500);
                }
            });

            // GET: Get schedule by ID
            schedules.MapGet("/{id}", async (int id, AppDbContext dbContext) =>
            {
                try
                {
                    // Owned types (DaySchedule) are automatically loaded with JSON conversion
                    var schedule = await dbContext.WeekSchedules
                        .FirstOrDefaultAsync(s => s.Id == id);

                    if (schedule == null)
                    {
                        return Results.NotFound(new { message = "Schedule not found" });
                    }

                    // Load meals for each day
                    await LoadMealsForSchedule(schedule, dbContext);

                    return Results.Ok(schedule);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error fetching schedule {id}: " + ex.Message);
                    return Results.Json(new { message = "Failed to fetch schedule" }, statusCode: 500);
                }
            });

            // POST: Create new schedule
            schedules.MapPost("/", async (CreateScheduleDto dto, AppDbContext dbContext) =>
            {
                try
                {
                    var schedule = new WeekSchedule
                    {
                        MessId = dto.MessId
                    };

                    // Load meals for each day
                    if (dto.Monday != null)
                    {
                        schedule.Monday = LoadDaySchedule(dto.Monday, dbContext);
                    }
                    if (dto.Tuesday != null)
                    {
                        schedule.Tuesday = LoadDaySchedule(dto.Tuesday, dbContext);
                    }
                    if (dto.Wednesday != null)
                    {
                        schedule.Wednesday = LoadDaySchedule(dto.Wednesday, dbContext);
                    }
                    if (dto.Thursday != null)
                    {
                        schedule.Thursday = LoadDaySchedule(dto.Thursday, dbContext);
                    }
                    if (dto.Friday != null)
                    {
                        schedule.Friday = LoadDaySchedule(dto.Friday, dbContext);
                    }
                    if (dto.Saturday != null)
                    {
                        schedule.Saturday = LoadDaySchedule(dto.Saturday, dbContext);
                    }
                    if (dto.Sunday != null)
                    {
                        schedule.Sunday = LoadDaySchedule(dto.Sunday, dbContext);
                    }

                    dbContext.WeekSchedules.Add(schedule);
                    await dbContext.SaveChangesAsync();

                    // Reload the schedule to ensure all data is properly serialized
                    var createdSchedule = await dbContext.WeekSchedules
                        .FirstOrDefaultAsync(s => s.Id == schedule.Id);

                    // Load meals for the created schedule
                    await LoadMealsForSchedule(createdSchedule, dbContext);

                    Console.WriteLine($"Schedule created successfully (ID: {schedule.Id})");

                    return Results.Created($"/api/admin/schedules/{schedule.Id}", createdSchedule);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error creating schedule: " + ex.Message);
                    return Results.Json(new { message = "Failed to create schedule" }, statusCode: 500);
                }
            });

            // PUT: Update entire schedule
            schedules.MapPut("/{id}", async (int id, CreateScheduleDto dto, AppDbContext dbContext) =>
            {
                try
                {
                    // Owned types (DaySchedule) are automatically loaded with JSON conversion
                    var schedule = await dbContext.WeekSchedules
                        .FirstOrDefaultAsync(s => s.Id == id);

                    if (schedule == null)
                    {
                        return Results.NotFound(new { message = "Schedule not found" });
                    }

                    // Update each day
                    if (dto.Monday != null)
                    {
                        schedule.Monday = LoadDaySchedule(dto.Monday, dbContext);
                    }
                    if (dto.Tuesday != null)
                    {
                        schedule.Tuesday = LoadDaySchedule(dto.Tuesday, dbContext);
                    }
                    if (dto.Wednesday != null)
                    {
                        schedule.Wednesday = LoadDaySchedule(dto.Wednesday, dbContext);
                    }
                    if (dto.Thursday != null)
                    {
                        schedule.Thursday = LoadDaySchedule(dto.Thursday, dbContext);
                    }
                    if (dto.Friday != null)
                    {
                        schedule.Friday = LoadDaySchedule(dto.Friday, dbContext);
                    }
                    if (dto.Saturday != null)
                    {
                        schedule.Saturday = LoadDaySchedule(dto.Saturday, dbContext);
                    }
                    if (dto.Sunday != null)
                    {
                        schedule.Sunday = LoadDaySchedule(dto.Sunday, dbContext);
                    }

                    schedule.UpdateTimestamp();

                    await dbContext.SaveChangesAsync();

                    // Reload the schedule to ensure all data is properly serialized
                    var updatedSchedule = await dbContext.WeekSchedules
                        .FirstOrDefaultAsync(s => s.Id == id);

                    // Load meals for the updated schedule
                    await LoadMealsForSchedule(updatedSchedule, dbContext);

                    Console.WriteLine($"Schedule updated successfully (ID: {id})");

                    return Results.Ok(updatedSchedule);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error updating schedule {id}: " + ex.Message);
                    return Results.Json(new { message = "Failed to update schedule" }, statusCode: 500);
                }
            });

            // DELETE: Delete schedule
            schedules.MapDelete("/{id}", async (int id, AppDbContext dbContext) =>
            {
                try
                {
                    var schedule = await dbContext.WeekSchedules.FindAsync(id);

                    if (schedule == null)
                    {
                        return Results.NotFound(new { message = "Schedule not found" });
                    }

                    dbContext.WeekSchedules.Remove(schedule);
                    await dbContext.SaveChangesAsync();

                    Console.WriteLine($"Schedule deleted successfully (ID: {id})");

                    return Results.Ok(new { message = "Schedule deleted successfully", id = id });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting schedule {id}: " + ex.Message);
                    return Results.Json(new { message = "Failed to delete schedule" }, statusCode: 500);
                }
            });
        }

        private static async Task LoadMealsForSchedule(WeekSchedule schedule, AppDbContext dbContext)
        {
            if (schedule.Monday != null && schedule.Monday.MorningMealId.HasValue)
            {
                schedule.Monday.MorningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Monday.MorningMealId.Value);
            }
            if (schedule.Monday != null && schedule.Monday.EveningMealId.HasValue)
            {
                schedule.Monday.EveningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Monday.EveningMealId.Value);
            }

            if (schedule.Tuesday != null && schedule.Tuesday.MorningMealId.HasValue)
            {
                schedule.Tuesday.MorningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Tuesday.MorningMealId.Value);
            }
            if (schedule.Tuesday != null && schedule.Tuesday.EveningMealId.HasValue)
            {
                schedule.Tuesday.EveningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Tuesday.EveningMealId.Value);
            }

            if (schedule.Wednesday != null && schedule.Wednesday.MorningMealId.HasValue)
            {
                schedule.Wednesday.MorningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Wednesday.MorningMealId.Value);
            }
            if (schedule.Wednesday != null && schedule.Wednesday.EveningMealId.HasValue)
            {
                schedule.Wednesday.EveningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Wednesday.EveningMealId.Value);
            }

            if (schedule.Thursday != null && schedule.Thursday.MorningMealId.HasValue)
            {
                schedule.Thursday.MorningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Thursday.MorningMealId.Value);
            }
            if (schedule.Thursday != null && schedule.Thursday.EveningMealId.HasValue)
            {
                schedule.Thursday.EveningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Thursday.EveningMealId.Value);
            }

            if (schedule.Friday != null && schedule.Friday.MorningMealId.HasValue)
            {
                schedule.Friday.MorningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Friday.MorningMealId.Value);
            }
            if (schedule.Friday != null && schedule.Friday.EveningMealId.HasValue)
            {
                schedule.Friday.EveningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Friday.EveningMealId.Value);
            }

            if (schedule.Saturday != null && schedule.Saturday.MorningMealId.HasValue)
            {
                schedule.Saturday.MorningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Saturday.MorningMealId.Value);
            }
            if (schedule.Saturday != null && schedule.Saturday.EveningMealId.HasValue)
            {
                schedule.Saturday.EveningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Saturday.EveningMealId.Value);
            }

            if (schedule.Sunday != null && schedule.Sunday.MorningMealId.HasValue)
            {
                schedule.Sunday.MorningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Sunday.MorningMealId.Value);
            }
            if (schedule.Sunday != null && schedule.Sunday.EveningMealId.HasValue)
            {
                schedule.Sunday.EveningMeal = await dbContext.Meals
                    .FirstOrDefaultAsync(m => m.Id == schedule.Sunday.EveningMealId.Value);
            }
        }

        private static DaySchedule LoadDaySchedule(DayScheduleDto dto, AppDbContext dbContext)
        {
            var daySchedule = new DaySchedule();

            if (dto.MorningMealId.HasValue)
            {
                daySchedule.MorningMealId = dto.MorningMealId.Value;
                daySchedule.MorningMeal = dbContext.Meals
                    .FirstOrDefault(m => m.Id == dto.MorningMealId.Value);
            }

            if (dto.EveningMealId.HasValue)
            {
                daySchedule.EveningMealId = dto.EveningMealId.Value;
                daySchedule.EveningMeal = dbContext.Meals
                    .FirstOrDefault(m => m.Id == dto.EveningMealId.Value);
            }

            return daySchedule;
        }
    }
}

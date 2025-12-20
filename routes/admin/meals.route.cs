using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MessManagement.Data;
using MessManagement.Models;
using MessManagement.Middleware;

namespace MessManagement.Routes
{
    public class CreateMealDto
    {
        public string? Name { get; set; }
        public double Weight { get; set; }
        public decimal Price { get; set; }
        public bool IsAvailable { get; set; } = true;
        public string? Description { get; set; }
        public MealImageDto? Image { get; set; }
    }

    public class MealImageDto
    {
        public string? Url { get; set; }
        public string? PublicId { get; set; }
    }

    public static class MealRoutes
    {
        public static void MapMealRoutes(this RouteGroupBuilder admin)
        {
            var meals = admin.MapGroup("/meals");

            // Apply admin authorization middleware to all meal routes
            meals.AddEndpointFilter(async (context, next) =>
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

            // GET: List all meals
            meals.MapGet("/", async (AppDbContext dbContext) =>
            {
                try
                {
                    var allMeals = await dbContext.Meals.ToListAsync();
                    return Results.Ok(allMeals);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error fetching meals: " + ex.Message);
                    return Results.Json(new { message = "Failed to fetch meals" }, statusCode: 500);
                }
            });

            // GET: Get meal by ID
            meals.MapGet("/{id}", async (int id, AppDbContext dbContext) =>
            {
                try
                {
                    var meal = await dbContext.Meals.FindAsync(id);

                    if (meal == null)
                    {
                        return Results.NotFound(new { message = "Meal not found" });
                    }

                    return Results.Ok(meal);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error fetching meal {id}: " + ex.Message);
                    return Results.Json(new { message = "Failed to fetch meal" }, statusCode: 500);
                }
            });

            // POST: Create new meal
            meals.MapPost("/", async (CreateMealDto dto, AppDbContext dbContext) =>
            {
                try
                {
                    if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
                    {
                        return Results.BadRequest(new { message = "Meal name is required" });
                    }

                    if (dto.Weight <= 0)
                    {
                        return Results.BadRequest(new { message = "Weight must be positive" });
                    }

                    if (dto.Price <= 0)
                    {
                        return Results.BadRequest(new { message = "Price must be positive" });
                    }

                    var meal = new Meal
                    {
                        Name = dto.Name.Trim(),
                        Weight = dto.Weight,
                        Price = dto.Price,
                        IsAvailable = dto.IsAvailable,
                        Description = dto.Description?.Trim() ?? string.Empty,
                        Image = dto.Image != null && !string.IsNullOrWhiteSpace(dto.Image.Url)
                        ? new MealImage 
                        { 
                            Url = dto.Image.Url, 
                            PublicId = dto.Image.PublicId ?? string.Empty 
                        } 
                        : new MealImage()
                    };

                    dbContext.Meals.Add(meal);
                    await dbContext.SaveChangesAsync();

                    Console.WriteLine($"Meal created successfully: {meal.Name} (ID: {meal.Id})");

                    return Results.Created($"/api/admin/meals/{meal.Id}", meal);
                }
                catch (ArgumentException ex)
                {
                    Console.WriteLine("Validation error creating meal: " + ex.Message);
                    return Results.BadRequest(new { message = ex.Message });
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error creating meal: " + ex.Message);
                    return Results.Json(new { message = "Failed to create meal" }, statusCode: 500);
                }
            });

            // PUT: Update entire meal (consolidated editing route)
            meals.MapPut("/{id}", async (int id, CreateMealDto dto, AppDbContext dbContext) =>
            {
                try
                {
                    var meal = await dbContext.Meals.FindAsync(id);

                    if (meal == null)
                    {
                        return Results.NotFound(new { message = "Meal not found" });
                    }

                    // Validate all required fields
                    if (string.IsNullOrWhiteSpace(dto.Name))
                    {
                        return Results.BadRequest(new { message = "Meal name is required" });
                    }

                    if (dto.Weight <= 0)
                    {
                        return Results.BadRequest(new { message = "Weight must be positive" });
                    }

                    if (dto.Price <= 0)
                    {
                        return Results.BadRequest(new { message = "Price must be positive" });
                    }

                    // Update all fields
                    meal.Name = dto.Name.Trim();
                    meal.Weight = dto.Weight;
                    meal.Price = dto.Price;
                    meal.IsAvailable = dto.IsAvailable;
                    meal.Description = dto.Description?.Trim() ?? string.Empty;
                    
                    // Update image if provided (only if URL exists)
                    if (dto.Image != null && !string.IsNullOrWhiteSpace(dto.Image.Url))
                    {
                        meal.Image = new MealImage 
                        { 
                            Url = dto.Image.Url, 
                            PublicId = dto.Image.PublicId ?? string.Empty 
                        };
                    }
                    else if (dto.Image == null)
                    {
                        // Clear image if explicitly set to null
                        meal.Image = new MealImage();
                    }
                    
                    meal.UpdateTimestamp();

                    await dbContext.SaveChangesAsync();

                    Console.WriteLine($"Meal updated successfully: {meal.Name} (ID: {meal.Id})");

                    return Results.Ok(meal);
                }
                catch (ArgumentException ex)
                {
                    Console.WriteLine("Validation error updating meal: " + ex.Message);
                    return Results.BadRequest(new { message = ex.Message });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error updating meal {id}: " + ex.Message);
                    return Results.Json(new { message = "Failed to update meal" }, statusCode: 500);
                }
            });

            // DELETE: Delete meal
            meals.MapDelete("/{id}", async (int id, AppDbContext dbContext) =>
            {
                try
                {
                    var meal = await dbContext.Meals.FindAsync(id);

                    if (meal == null)
                    {
                        return Results.NotFound(new { message = "Meal not found" });
                    }

                    dbContext.Meals.Remove(meal);
                    await dbContext.SaveChangesAsync();

                    Console.WriteLine($"Meal deleted successfully: {meal.Name} (ID: {meal.Id})");

                    return Results.Ok(new { message = "Meal deleted successfully", id = id });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting meal {id}: " + ex.Message);
                    return Results.Json(new { message = "Failed to delete meal" }, statusCode: 500);
                }
            });
        }
    }
}

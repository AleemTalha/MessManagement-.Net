using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MessManagement.Data;
using MessManagement.Models;
using MessManagement.Utils;

namespace MessManagement.Routes
{
    public static class UserRoutes
    {
        public static void MapUserRoutes(this RouteGroupBuilder admin)
        {
            var users = admin.MapGroup("/users");

            users.MapPost("/", async (HttpContext context, AppDbContext db, UserCreateRequest request) =>
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(request.Name) || 
                        string.IsNullOrWhiteSpace(request.Email) || 
                        string.IsNullOrWhiteSpace(request.Password) || 
                        string.IsNullOrWhiteSpace(request.PhoneNumber))
                    {
                        return Results.BadRequest(new { message = "All required fields must be provided." });
                    }

                    var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                    if (existingUser != null)
                    {
                        return Results.Conflict(new { message = "User with this email already exists." });
                    }
                    
                    var user = new User
                    {
                        Name = request.Name,
                        Email = request.Email,
                        Password = request.Password,
                        PhoneNumber = request.PhoneNumber,
                        Age = request.Age ?? 0,
                        Role = request.Role ?? "User",
                        Address = request.Address ?? string.Empty,
                        DOB = request.DOB,
                        MessId = request.MessId,
                        IsActive = true,
                        AttendanceStartDate = DateTime.UtcNow
                    };

                    db.Users.Add(user);
                    await db.SaveChangesAsync();

                    var currentMonth = DateTime.UtcNow.Month;
                    var currentYear = DateTime.UtcNow.Year;

                    var monthlyAttendance = new MonthlyAttendance
                    {
                        UserId = user.Id,
                        Month = currentMonth,
                        Year = currentYear
                    };
                    
                    monthlyAttendance.InitializeMonth();
                    
                    db.MonthlyAttendances.Add(monthlyAttendance);
                    await db.SaveChangesAsync();

                    user.CurrentMonthAttendanceId = monthlyAttendance.Id;
                    await db.SaveChangesAsync();

                    Console.WriteLine($"User created successfully: {user.Id}");

                    return Results.Created($"/api/admin/users/{user.Id}", new
                    {
                        id = user.Id,
                        name = user.Name,
                        email = user.Email,
                        phoneNumber = user.PhoneNumber,
                        age = user.Age,
                        role = user.Role,
                        address = user.Address,
                        dob = user.DOB,
                        messId = user.MessId,
                        isActive = user.IsActive,
                        attendanceStartDate = user.AttendanceStartDate,
                        currentMonthAttendanceId = user.CurrentMonthAttendanceId,
                        createdAt = user.CreatedAt
                    });
                }
                catch (ArgumentException ex)
                {
                    Console.WriteLine($"Validation error during user creation: {ex.Message}");
                    return Results.BadRequest(new { message = ex.Message });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Internal error during user creation: {ex.Message}");
                    return Results.Problem(new ProblemDetails
                    {
                        Status = 500,
                        Title = "Internal Server Error",
                        Detail = "An unexpected error occurred while creating the user."
                    });
                }
            });

            users.MapGet("/", async (HttpContext context, AppDbContext db, int skip = 0, int limit = 10) =>
            {
                try
                {
                    if (limit <= 0 || limit > 100)
                    {
                        limit = 10;
                    }

                    if (skip < 0)
                    {
                        skip = 0;
                    }

                    var totalUsers = await db.Users.CountAsync();
                    
                    var users = await db.Users
                        .AsNoTracking()
                        .OrderByDescending(u => u.CreatedAt)
                        .Skip(skip)
                        .Take(limit)
                        .Select(u => new
                        {
                            id = u.Id,
                            name = u.Name,
                            email = u.Email,
                            phoneNumber = u.PhoneNumber,
                            age = u.Age,
                            role = u.Role,
                            address = u.Address,
                            dob = u.DOB,
                            messId = u.MessId,
                            isActive = u.IsActive,
                            attendanceStartDate = u.AttendanceStartDate,
                            currentMonthAttendanceId = u.CurrentMonthAttendanceId,
                            profilePicture = new
                            {
                                publicId = u.ProfilePicture.PublicId,
                                url = u.ProfilePicture.Url
                            },
                            createdAt = u.CreatedAt,
                            updatedAt = u.UpdatedAt
                        })
                        .ToListAsync();

                    Console.WriteLine($"Retrieved {users.Count} users, total: {totalUsers}");

                    return Results.Ok(new
                    {
                        total = totalUsers,
                        skip = skip,
                        limit = limit,
                        users = users
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Internal error during user retrieval: {ex.Message}");
                    return Results.Problem(new ProblemDetails
                    {
                        Status = 500,
                        Title = "Internal Server Error",
                        Detail = "An unexpected error occurred while retrieving users."
                    });
                }
            });

            users.MapPut("/{id}", async (HttpContext context, AppDbContext db, int id, UserUpdateRequest request) =>
            {
                try
                {
                    var user = await db.Users.FindAsync(id);
                    if (user == null)
                    {
                        return Results.NotFound(new { message = "User not found." });
                    }

                    if (!string.IsNullOrWhiteSpace(request.Name))
                    {
                        user.Name = request.Name;
                    }

                    if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
                    {
                        user.PhoneNumber = request.PhoneNumber;
                    }

                    if (request.Age.HasValue)
                    {
                        user.Age = request.Age.Value;
                    }

                    if (!string.IsNullOrWhiteSpace(request.Role))
                    {
                        user.Role = request.Role;
                    }

                    if (request.Address != null)
                    {
                        user.Address = request.Address;
                    }

                    if (request.DOB.HasValue)
                    {
                        user.DOB = request.DOB;
                    }

                    if (!string.IsNullOrWhiteSpace(request.Password))
                    {
                        user.Password = request.Password;
                    }

                    if (request.IsActive.HasValue)
                    {
                        user.IsActive = request.IsActive.Value;
                    }

                    user.UpdateTimestamp();
                    await db.SaveChangesAsync();

                    Console.WriteLine($"User updated successfully: {user.Id}");

                    return Results.Ok(new
                    {
                        id = user.Id,
                        name = user.Name,
                        email = user.Email,
                        phoneNumber = user.PhoneNumber,
                        age = user.Age,
                        role = user.Role,
                        address = user.Address,
                        dob = user.DOB,
                        messId = user.MessId,
                        isActive = user.IsActive,
                        updatedAt = user.UpdatedAt
                    });
                }
                catch (ArgumentException ex)
                {
                    Console.WriteLine($"Validation error during user update for ID {id}: {ex.Message}");
                    return Results.BadRequest(new { message = ex.Message });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Internal error during user update for ID {id}: {ex.Message}");
                    return Results.Problem(new ProblemDetails
                    {
                        Status = 500,
                        Title = "Internal Server Error",
                        Detail = "An unexpected error occurred while updating the user."
                    });
                }
            });

            users.MapDelete("/{id}", async (HttpContext context, AppDbContext db, int id) =>
            {
                try
                {
                    var user = await db.Users.FindAsync(id);
                    if (user == null)
                    {
                        return Results.NotFound(new { message = "User not found." });
                    }

                    var attendances = await db.MonthlyAttendances
                        .Where(a => a.UserId == id)
                        .ToListAsync();
                    
                    db.MonthlyAttendances.RemoveRange(attendances);

                    db.Users.Remove(user);
                    await db.SaveChangesAsync();

                    Console.WriteLine($"User deleted successfully: {id}");

                    return Results.Ok(new { message = "User deleted successfully." });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Internal error during user deletion for ID {id}: {ex.Message}");
                    return Results.Problem(new ProblemDetails
                    {
                        Status = 500,
                        Title = "Internal Server Error",
                        Detail = "An unexpected error occurred while deleting the user."
                    });
                }
            });
        }
    }

    public class UserCreateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public int? Age { get; set; }
        public string? Role { get; set; }
        public string? Address { get; set; }
        public DateTime? DOB { get; set; }
        public int? MessId { get; set; }
    }

    public class UserUpdateRequest
    {
        public string? Name { get; set; }
        public string? Password { get; set; }
        public string? PhoneNumber { get; set; }
        public int? Age { get; set; }
        public string? Role { get; set; }
        public string? Address { get; set; }
        public DateTime? DOB { get; set; }
        public bool? IsActive { get; set; }
    }
}

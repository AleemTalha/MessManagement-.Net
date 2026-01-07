using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using MessManagement.Data;
using MessManagement.Models;

namespace MessManagement.Routes
{
    public class AdminRegistrationDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? PhoneNumber { get; set; }
        public int Age { get; set; }
        public DateTime? DOB { get; set; }
        public string? Address { get; set; }
    }

    public static class AdminRegisterRoutes
    {
        public static void MapAdminRegistrationRoutes(this RouteGroupBuilder admin)
        {
            admin.MapPost("/register", async (
                AppDbContext dbContext,
                AdminRegistrationDto dto
            ) =>
            {
                try
                {
                    if (dto == null)
                        return Results.BadRequest(new { error = "Invalid request body" });

                    var validationErrors = new List<string>();

                    if (string.IsNullOrWhiteSpace(dto.Name))
                        validationErrors.Add("Name is required");
                    else if (dto.Name.Length < 3)
                        validationErrors.Add("Name must be at least 3 characters");

                    if (string.IsNullOrWhiteSpace(dto.Email))
                        validationErrors.Add("Email is required");
                    else if (!IsValidEmail(dto.Email))
                        validationErrors.Add("Invalid email format");

                    if (string.IsNullOrWhiteSpace(dto.Password))
                        validationErrors.Add("Password is required");
                    else if (dto.Password.Length < 6)
                        validationErrors.Add("Password must be at least 6 characters");

                    if (string.IsNullOrWhiteSpace(dto.PhoneNumber))
                        validationErrors.Add("Phone number is required");
                    else if (dto.PhoneNumber.Length < 10)
                        validationErrors.Add("Phone number must be at least 10 characters");

                    if (dto.Age < 0)
                        validationErrors.Add("Age cannot be negative");

                    if (dto.DOB.HasValue && dto.DOB.Value > DateTime.UtcNow)
                        validationErrors.Add("Date of birth cannot be in the future");

                    if (!string.IsNullOrEmpty(dto.Address) && dto.Address.Length > 200)
                        validationErrors.Add("Address cannot exceed 200 characters");

                    if (validationErrors.Count > 0)
                        return Results.BadRequest(new { errors = validationErrors });

                    var trimmedEmail = dto.Email?.Trim() ?? string.Empty;
                    var emailExists = await dbContext.Users
                        .AnyAsync(u => u.Email == trimmedEmail);

                    if (emailExists)
                        return Results.Conflict(new { error = "Admin with this email already exists" });

                    var newAdmin = new User
                    {
                        Name = dto.Name?.Trim() ?? string.Empty,
                        Email = dto.Email?.Trim() ?? string.Empty,
                        Password = dto.Password ?? string.Empty,
                        PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty,
                        Age = dto.Age,
                        DOB = dto.DOB.HasValue ? DateTime.SpecifyKind(dto.DOB.Value, DateTimeKind.Utc) : (DateTime?)null,
                        Address = dto.Address?.Trim() ?? string.Empty,
                        Role = "Admin",
                        IsActive = true
                    };

                    dbContext.Users.Add(newAdmin);
                    await dbContext.SaveChangesAsync();

                    return Results.Created(
                        $"/api/admin/{newAdmin.Id}",
                        new
                        {
                            message = "Admin registered successfully",
                            adminId = newAdmin.Id,
                            email = newAdmin.Email,
                            name = newAdmin.Name,
                            role = newAdmin.Role
                        }
                    );
                }
                catch (ArgumentException ex)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }
                catch (DbUpdateException)
                {
                    return Results.Problem(
                        detail: "Database error occurred during admin registration",
                        statusCode: 500
                    );
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: "Internal server error: " + ex.Message,
                        statusCode: 500
                    );
                }
            });
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
                return Regex.IsMatch(email, emailPattern, RegexOptions.IgnoreCase);
            }
            catch
            {
                return false;
            }
        }
    }
}

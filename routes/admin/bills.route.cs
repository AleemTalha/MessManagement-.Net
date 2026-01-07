using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using MessManagement.Data;
using MessManagement.Models;
using MessManagement.Routes;
using MessManagement.Utils;

namespace MessManagement.Routes
{
    public class GenerateBillRequest
    {
        public int Month { get; set; }
        public int Year { get; set; }
    }

    public static class BillRoutes
    {
        public static void MapBillRoutes(this RouteGroupBuilder admin)
        {
            Console.WriteLine("Mapping bill routes...");
            var bills = admin.MapGroup("/bills");

            // Generate bills for all active users for a specific month
            bills.MapPost("/generate", async (HttpContext context, AppDbContext dbContext, GenerateBillRequest request) =>
            {
                Console.WriteLine($"Bill generate request: Month={request.Month}, Year={request.Year}");
                try
                {
                    // Validate request
                    if (request.Month < 1 || request.Month > 12 || request.Year < 2000 || request.Year > 2100)
                    {
                        return Results.BadRequest(new { message = "Invalid request parameters" });
                    }

                    // Get all active users
                    var activeUsers = await dbContext.Users
                        .Where(u => u.IsActive && u.Role == "User")
                        .ToListAsync();

                    Console.WriteLine($"Found {activeUsers.Count} active users");

                    var generatedBills = new List<object>();
                    var skippedUsers = new List<object>();

                    foreach (var user in activeUsers)
                    {
                        Console.WriteLine($"Processing user: {user.Id} - {user.Name}");

                        // Check if bill already exists for this user and month
                        var existingBill = await dbContext.Bills.FirstOrDefaultAsync(b =>
                            b.UserId == user.Id &&
                            b.BillMonth.Year == request.Year &&
                            b.BillMonth.Month == request.Month);

                        if (existingBill != null)
                        {
                            Console.WriteLine($"Bill already exists for user {user.Id}");
                            skippedUsers.Add(new
                            {
                                userId = user.Id,
                                userName = user.Name,
                                reason = "Bill already exists"
                            });
                            continue;
                        }

                        // Get monthly attendance
                        var monthlyAttendance = await dbContext.MonthlyAttendances
                            .Include(m => m.DailyAttendances)
                            .FirstOrDefaultAsync(m =>
                                m.UserId == user.Id &&
                                m.Month == request.Month &&
                                m.Year == request.Year);

                        if (monthlyAttendance == null)
                        {
                            Console.WriteLine($"No attendance data for user {user.Id}");
                            skippedUsers.Add(new
                            {
                                userId = user.Id,
                                userName = user.Name,
                                reason = "No attendance data found"
                            });
                            continue;
                        }

                        // Calculate total amount from daily attendances
                        var totalAmount = monthlyAttendance.DailyAttendances.Sum(d => d.MorningChargedAmount + d.EveningChargedAmount);

                        // Get meal IDs from attendance (meals that were taken)
                        // Note: Since attendance stores meal names and prices, we'll leave UserMealIds empty for now
                        // In future, we can enhance to map meal names to IDs
                        var mealIds = new List<int>();

                        // Create bill
                        var bill = new Bill
                        {
                            UserId = user.Id,
                            BillMonth = new DateTime(request.Year, request.Month, 1, 0, 0, 0, DateTimeKind.Utc),
                            UserMealIds = mealIds,
                            TotalAmount = totalAmount,
                            PaidAmount = 0,
                            Status = BillStatus.Pending,
                            DueDate = new DateTime(request.Year, request.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1).AddDays(-1),
                            Notes = $"Bill generated for {request.Month}/{request.Year}"
                        };

                        bill.CalculateDueAmount();

                        dbContext.Bills.Add(bill);

                        Console.WriteLine($"Bill created for user {user.Id}, amount: {totalAmount}");

                        generatedBills.Add(new
                        {
                            userId = user.Id,
                            userName = user.Name,
                            billId = bill.Id,
                            totalAmount = bill.TotalAmount,
                            dueAmount = bill.DueAmount,
                            status = bill.Status.ToString()
                        });
                    }

                    await dbContext.SaveChangesAsync();

                    Console.WriteLine($"Generated {generatedBills.Count} bills, skipped {skippedUsers.Count} users");

                    return Results.Ok(new
                    {
                        message = $"Bill generation completed. Generated {generatedBills.Count} bills, skipped {skippedUsers.Count} users.",
                        generatedBills = generatedBills,
                        skippedUsers = skippedUsers
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error generating bills: " + ex.Message);
                    Console.WriteLine("Stack trace: " + ex.StackTrace);
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });

            // Get bills with search and pagination
            _ = bills.MapGet("/get", async (HttpContext context, AppDbContext dbContext, int? page, int? limit, int? userId, string? userName) =>
            {
                Console.WriteLine("Bill GET route hit!");
                try
                {
                    page ??= 1;
                    limit ??= 10;

                    if (page < 1 || limit < 1 || limit > 100)
                    {
                        return Results.BadRequest(new { message = "Invalid page or limit parameters" });
                    }

                    var query = dbContext.Bills
                        .Include(b => b.User)
                        .AsQueryable();

                    // Apply filters
                    if (userId.HasValue)
                    {
                        query = query.Where(b => b.UserId == userId.Value);
                    }

                    if (!string.IsNullOrWhiteSpace(userName))
                    {
                        query = query.Where(b => b.User.Name.Contains(userName));
                    }

                    // Get total count
                    var totalCount = await query.CountAsync();

                    // Apply pagination
                    var bills = await query
                        .OrderByDescending(b => b.CreatedAt)
                        .Skip((page.Value - 1) * limit.Value)
                        .Take(limit.Value)
                        .Select(b => new
                        {
                            id = b.Id,
                            userId = b.UserId,
                            userName = b.User.Name,
                            userEmail = b.User.Email,
                            billMonth = b.BillMonth.ToString("yyyy-MM-dd"),
                            totalAmount = b.TotalAmount,
                            paidAmount = b.PaidAmount,
                            dueAmount = b.DueAmount,
                            status = b.Status.ToString(),
                            dueDate = b.DueDate.ToString("yyyy-MM-dd"),
                            notes = b.Notes,
                            createdAt = b.CreatedAt,
                            updatedAt = b.UpdatedAt
                        })
                        .ToListAsync();

                    return Results.Ok(new
                    {
                        bills = bills,
                        pagination = new
                        {
                            page = page,
                            limit = limit,
                            totalCount = totalCount,
                            totalPages = (int)Math.Ceiling((double)totalCount / limit.Value)
                        }
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error fetching bills: " + ex.Message);
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });

            // Update bill payment
            bills.MapPut("/{billId}/payment", async (HttpContext context, AppDbContext dbContext, int billId, decimal paidAmount) =>
            {
                try
                {
                    if (paidAmount < 0)
                    {
                        return Results.BadRequest(new { message = "Paid amount cannot be negative" });
                    }

                    var bill = await dbContext.Bills.FindAsync(billId);
                    if (bill == null)
                    {
                        return Results.NotFound(new { message = "Bill not found" });
                    }

                    bill.PaidAmount += paidAmount;
                    bill.CalculateDueAmount();

                    if (bill.DueAmount <= 0)
                    {
                        bill.Status = BillStatus.FullyPaid;
                    }
                    else if (bill.PaidAmount > 0)
                    {
                        bill.Status = BillStatus.PartiallyPaid;
                    }

                    bill.UpdateTimestamp();
                    await dbContext.SaveChangesAsync();

                    return Results.Ok(new
                    {
                        message = "Payment updated successfully",
                        bill = new
                        {
                            id = bill.Id,
                            totalAmount = bill.TotalAmount,
                            paidAmount = bill.PaidAmount,
                            dueAmount = bill.DueAmount,
                            status = bill.Status.ToString()
                        }
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error updating payment: " + ex.Message);
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });
        }
    }
}
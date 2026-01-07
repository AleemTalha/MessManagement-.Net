using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using MessManagement.Data;
using MessManagement.Models;
using MessManagement.Routes;
using MessManagement.Utils;
using System.Text.Json.Serialization;

namespace MessManagement.Routes
{
    public class UserBillPaymentRequest
    {
        public int BillId { get; set; }
        public decimal Amount { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public string TransactionId { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }

    public static class UserBillRoutes
    {
        public static void MapUserBillRoutes(this RouteGroupBuilder user)
        {
            // Get unpaid bills for the current user
            user.MapGet("/bills", async (HttpContext context, AppDbContext dbContext) =>
            {
                try
                {
                    var sessionUser = context.Items["User"] as SessionUtils.SessionUser;
                    if (sessionUser == null || sessionUser.UserRole != "User")
                    {
                        return Results.Unauthorized();
                    }

                    var bills = await dbContext.Bills
                        .Where(b => b.UserId == sessionUser.UserId &&
                                   (b.Status == BillStatus.Pending || b.Status == BillStatus.PartiallyPaid))
                        .OrderBy(b => b.DueDate)
                        .ThenBy(b => b.BillMonth)
                        .Select(b => new
                        {
                            id = b.Id,
                            billMonth = b.BillMonth.ToString("yyyy-MM"),
                            totalAmount = b.TotalAmount,
                            paidAmount = b.PaidAmount,
                            dueAmount = b.DueAmount,
                            status = b.Status.ToString(),
                            dueDate = b.DueDate.ToString("yyyy-MM-dd"),
                            notes = b.Notes,
                            createdAt = b.CreatedAt
                        })
                        .ToListAsync();

                    return Results.Ok(new
                    {
                        message = $"Found {bills.Count} unpaid bills",
                        bills = bills
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error fetching user bills: " + ex.Message);
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });

            // Make payment for a bill
            user.MapPost("/bills/pay", async (HttpContext context, AppDbContext dbContext, UserBillPaymentRequest request) =>
            {
                try
                {
                    var sessionUser = context.Items["User"] as SessionUtils.SessionUser;
                    if (sessionUser == null || sessionUser.UserRole != "User")
                    {
                        return Results.Unauthorized();
                    }

                    // Validate request
                    if (request.BillId <= 0 || request.Amount <= 0)
                    {
                        return Results.BadRequest(new { message = "Invalid bill ID or payment amount" });
                    }

                    // Get the bill and ensure it belongs to the current user
                    var bill = await dbContext.Bills
                        .FirstOrDefaultAsync(b => b.Id == request.BillId && b.UserId == sessionUser.UserId);

                    if (bill == null)
                    {
                        return Results.NotFound(new { message = "Bill not found or does not belong to you" });
                    }

                    // Check if bill is already fully paid
                    if (bill.Status == BillStatus.FullyPaid)
                    {
                        return Results.BadRequest(new { message = "Bill is already fully paid" });
                    }

                    // Check if payment amount exceeds due amount
                    if (request.Amount > bill.DueAmount)
                    {
                        return Results.BadRequest(new
                        {
                            message = "Payment amount exceeds due amount",
                            dueAmount = bill.DueAmount
                        });
                    }

                    // Update payment
                    bill.PaidAmount += request.Amount;
                    bill.CalculateDueAmount();

                    // Update status
                    if (bill.DueAmount <= 0)
                    {
                        bill.Status = BillStatus.FullyPaid;
                    }
                    else if (bill.PaidAmount > 0)
                    {
                        bill.Status = BillStatus.PartiallyPaid;
                    }

                    bill.UpdateTimestamp();

                    // Create payment record
                    var payment = new Payment
                    {
                        UserId = sessionUser.UserId.Value,
                        BillId = bill.Id,
                        AmountPaid = request.Amount,
                        BalanceRemaining = bill.DueAmount,
                        PaymentMethod = request.PaymentMethod,
                        TransactionId = string.IsNullOrWhiteSpace(request.TransactionId) ?
                            $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{bill.Id}" : request.TransactionId,
                        Status = PaymentStatus.Completed,
                        Notes = string.IsNullOrWhiteSpace(request.Notes) ?
                            $"Payment for bill {bill.Id} ({bill.BillMonth:yyyy-MM})" : request.Notes
                    };

                    dbContext.Payments.Add(payment);
                    await dbContext.SaveChangesAsync();

                    return Results.Ok(new
                    {
                        message = "Payment processed successfully",
                        bill = new
                        {
                            id = bill.Id,
                            totalAmount = bill.TotalAmount,
                            paidAmount = bill.PaidAmount,
                            dueAmount = bill.DueAmount,
                            status = bill.Status.ToString(),
                            paymentMade = request.Amount
                        }
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error processing payment: " + ex.Message);
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });

            // Get payment history for the current user
            user.MapGet("/payments", async (HttpContext context, AppDbContext dbContext, int? page, int? limit) =>
            {
                try
                {
                    var sessionUser = context.Items["User"] as SessionUtils.SessionUser;
                    if (sessionUser == null || sessionUser.UserRole != "User")
                    {
                        return Results.Unauthorized();
                    }

                    page ??= 1;
                    limit ??= 10;

                    if (page < 1 || limit < 1 || limit > 50)
                    {
                        return Results.BadRequest(new { message = "Invalid page or limit parameters" });
                    }

                    var query = dbContext.Payments
                        .Where(p => p.UserId == sessionUser.UserId)
                        .OrderByDescending(p => p.PaymentDate);

                    var totalCount = await query.CountAsync();

                    var payments = await query
                        .Skip((page.Value - 1) * limit.Value)
                        .Take(limit.Value)
                        .Select(p => new
                        {
                            id = p.Id,
                            billId = p.BillId,
                            amountPaid = p.AmountPaid,
                            balanceRemaining = p.BalanceRemaining,
                            paymentMethod = p.PaymentMethod.ToString(),
                            transactionId = p.TransactionId,
                            status = p.Status.ToString(),
                            notes = p.Notes,
                            paymentDate = p.PaymentDate,
                            createdAt = p.CreatedAt
                        })
                        .ToListAsync();

                    return Results.Ok(new
                    {
                        message = $"Found {totalCount} payments",
                        pagination = new
                        {
                            page = page,
                            limit = limit,
                            totalCount = totalCount,
                            totalPages = (int)Math.Ceiling(totalCount / (double)limit.Value)
                        },
                        payments = payments
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error fetching payment history: " + ex.Message);
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using MessManagement.Data;
using MessManagement.Utils;
using MessManagement.Models;

namespace MessManagement.Routes
{
    public static class UserTransactionRoutes
    {
        public static void MapUserTransactionRoutes(this RouteGroupBuilder app)
        {
            // Get user's transaction history
            app.MapGet("/transactions", async (HttpContext context, AppDbContext dbContext) =>
            {
                var sessionUser = context.Items["User"] as SessionUtils.SessionUser;
                if (sessionUser == null)
                {
                    return Results.Unauthorized();
                }

                if (sessionUser.UserRole != "User")
                {
                    return Results.Json(new { message = "Access denied. User role required." }, statusCode: 403);
                }

                try
                {
                    var transactions = await dbContext.Payments
                        .Where(p => p.UserId == sessionUser.UserId)
                        .OrderByDescending(p => p.PaymentDate)
                        .Select(p => new
                        {
                            p.Id,
                            p.AmountPaid,
                            p.BalanceRemaining,
                            p.PaymentDate,
                            p.PaymentMethod,
                            p.TransactionId,
                            p.Status,
                            p.Notes,
                            p.CreatedAt
                        })
                        .ToListAsync();

                    return Results.Ok(transactions);
                }
                catch (Exception ex)
                {
                    return Results.Json(new { message = "Internal server error" }, statusCode: 500);
                }
            });
        }
    }
}
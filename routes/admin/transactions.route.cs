using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using MessManagement.Data;
using MessManagement.Utils;
using MessManagement.Models;

namespace MessManagement.Routes
{
    public static class AdminTransactionRoutes
    {
        public static void MapAdminTransactionRoutes(this RouteGroupBuilder app)
        {
            // Get all transactions for all users
            app.MapGet("/transactions", async (HttpContext context, AppDbContext dbContext) =>
            {
                var user = context.Items["User"] as SessionUtils.SessionUser;
                if (user == null || user.UserRole != "Admin")
                {
                    return Results.Unauthorized();
                }

                try
                {
                    var transactions = await dbContext.Payments
                        .Join(dbContext.Users,
                              p => p.UserId,
                              u => u.Id,
                              (p, u) => new
                              {
                                  p.Id,
                                  p.UserId,
                                  UserName = u.Name,
                                  UserEmail = u.Email,
                                  p.AmountPaid,
                                  p.BalanceRemaining,
                                  p.PaymentDate,
                                  p.PaymentMethod,
                                  p.TransactionId,
                                  p.Status,
                                  p.Notes,
                                  p.CreatedAt
                              })
                        .OrderByDescending(t => t.PaymentDate)
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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MessManagement.Models;

namespace MessManagement.Data
{
    public class AppDbContext : DbContext
    { 
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Mess> Messes { get; set; }
        public DbSet<Meal> Meals { get; set; }
        public DbSet<WeekSchedule> WeekSchedules { get; set; }
        public DbSet<UserMeal> UserMeals { get; set; }
        public DbSet<Bill> Bills { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<UserBalance> UserBalances { get; set; }
        public DbSet<Attendance> Attendances { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Password).IsRequired();
                entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Address).HasMaxLength(200);
                entity.OwnsOne(e => e.ProfilePicture);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            modelBuilder.Entity<Mess>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Address).IsRequired().HasMaxLength(300);
                entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(150);
            });

            modelBuilder.Entity<Meal>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Weight).IsRequired();
                entity.Property(e => e.Price).IsRequired().HasColumnType("decimal(18,2)");
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.OwnsOne(e => e.Image);
            });

            modelBuilder.Entity<WeekSchedule>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.OwnsOne(e => e.Monday);
                entity.OwnsOne(e => e.Tuesday);
                entity.OwnsOne(e => e.Wednesday);
                entity.OwnsOne(e => e.Thursday);
                entity.OwnsOne(e => e.Friday);
                entity.OwnsOne(e => e.Saturday);
                entity.OwnsOne(e => e.Sunday);
            });

            modelBuilder.Entity<UserMeal>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalBill).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Dishes)
                    .HasConversion(
                        v => System.Text.Json.JsonSerializer.Serialize(v, new System.Text.Json.JsonSerializerOptions()),
                        v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, new System.Text.Json.JsonSerializerOptions()) ?? new List<string>()
                    );
                entity.Property(e => e.Notes).HasMaxLength(500);
            });

            modelBuilder.Entity<Bill>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.PaidAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.DueAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.UserMealIds)
                    .HasConversion(
                        v => System.Text.Json.JsonSerializer.Serialize(v, new System.Text.Json.JsonSerializerOptions()),
                        v => System.Text.Json.JsonSerializer.Deserialize<List<int>>(v, new System.Text.Json.JsonSerializerOptions()) ?? new List<int>()
                    );
                entity.Property(e => e.Notes).HasMaxLength(500);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AmountPaid).HasColumnType("decimal(18,2)");
                entity.Property(e => e.BalanceRemaining).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TransactionId).HasMaxLength(100);
                entity.Property(e => e.Notes).HasMaxLength(500);
            });

            modelBuilder.Entity<UserBalance>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalBill).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalPaid).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Balance).HasColumnType("decimal(18,2)");
                entity.HasIndex(e => e.UserId).IsUnique();
            });

            modelBuilder.Entity<Attendance>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.Date, e.MealTime }).IsUnique();
                entity.Property(e => e.Date).HasColumnType("date");
                entity.Property(e => e.ChargedAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Notes).HasMaxLength(500);
            });
        }
    }
}
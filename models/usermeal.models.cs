using System;
using System.Collections.Generic;

namespace MessManagement.Models
{
    public class UserMeal
    {
        private decimal totalBill = 0;

        public int Id { get; set; }

        public int UserId { get; set; }

        public int MealId { get; set; }

        public DateTime MealDate { get; set; } = DateTime.UtcNow;

        public MealTime MealTime { get; set; } = MealTime.Morning;

        public bool HasEaten { get; set; } = false;

        public List<string> Dishes { get; set; } = new List<string>();

        public decimal TotalBill
        {
            get => totalBill;
            set
            {
                if (value < 0)
                    throw new ArgumentException("Total bill cannot be negative.");
                totalBill = value;
            }
        }

        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

        public void UpdateTimestamp()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public enum MealTime
    {
        Morning = 0,
        Evening = 1
    }
}

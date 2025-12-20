using System;

namespace MessManagement.Models
{
    public class Attendance
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MealId { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow.Date;
        public MealTime MealTime { get; set; } = MealTime.Morning;
        public bool WasTaken { get; set; } = false;
        private decimal chargedAmount = 0;
        public decimal ChargedAmount
        {
            get => chargedAmount;
            set
            {
                if (value < 0) throw new ArgumentException("Charged amount cannot be negative.");
                chargedAmount = value;
            }
        }

        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;
        public void UpdateTimestamp() => UpdatedAt = DateTime.UtcNow;
    }
}

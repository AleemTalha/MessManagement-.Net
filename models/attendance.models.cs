using System;
using System.Collections.Generic;
using System.Linq;

namespace MessManagement.Models
{
    public class MonthlyAttendance
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        
        private int month;
        public int Month
        {
            get => month;
            set
            {
                if (value < 1 || value > 12)
                    throw new ArgumentException("Month must be between 1 and 12.");
                month = value;
            }
        }
        
        private int year;
        public int Year
        {
            get => year;
            set
            {
                if (value < 2000 || value > 2100)
                    throw new ArgumentException("Year must be between 2000 and 2100.");
                year = value;
            }
        }
        
        public List<DailyAttendance> DailyAttendances { get; set; } = new List<DailyAttendance>();
        
        public decimal TotalMonthlyBill { get; set; } = 0;
        public int TotalMealsTaken { get; set; } = 0;
        
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;
        
        public void UpdateTimestamp() => UpdatedAt = DateTime.UtcNow;
        
        public void CalculateMonthlyTotals()
        {
            TotalMonthlyBill = DailyAttendances.Sum(d => d.MorningChargedAmount + d.EveningChargedAmount);
            TotalMealsTaken = DailyAttendances.Count(d => d.MorningMealTaken) + 
                            DailyAttendances.Count(d => d.EveningMealTaken);
        }
        
        public void InitializeMonth()
        {
            var daysInMonth = DateTime.DaysInMonth(Year, Month);
            DailyAttendances.Clear();
            
            for (int day = 1; day <= daysInMonth; day++)
            {
                DailyAttendances.Add(new DailyAttendance
                {
                    Day = day,
                    Date = new DateTime(Year, Month, day)
                });
            }
        }
    }
    
    public class DailyAttendance
    {
        private int day;
        public int Day
        {
            get => day;
            set
            {
                if (value < 1 || value > 31)
                    throw new ArgumentException("Day must be between 1 and 31.");
                day = value;
            }
        }
        
        public DateTime Date { get; set; }
        
        public bool MorningMealTaken { get; set; } = false;
        public string MorningMealName { get; set; } = string.Empty;
        public decimal MorningMealPrice { get; set; } = 0;
        private decimal morningChargedAmount = 0;
        public decimal MorningChargedAmount
        {
            get => morningChargedAmount;
            set
            {
                if (value < 0) throw new ArgumentException("Charged amount cannot be negative.");
                morningChargedAmount = value;
            }
        }
        
        public bool EveningMealTaken { get; set; } = false;
        public string EveningMealName { get; set; } = string.Empty;
        public decimal EveningMealPrice { get; set; } = 0;
        private decimal eveningChargedAmount = 0;
        public decimal EveningChargedAmount
        {
            get => eveningChargedAmount;
            set
            {
                if (value < 0) throw new ArgumentException("Charged amount cannot be negative.");
                eveningChargedAmount = value;
            }
        }
        
        public string Notes { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public decimal GetDailyTotal() => MorningChargedAmount + EveningChargedAmount;
        public int GetMealsCount() => (MorningMealTaken ? 1 : 0) + (EveningMealTaken ? 1 : 0);
    }
}

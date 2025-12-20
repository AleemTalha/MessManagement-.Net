using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MessManagement.Models
{
    public class WeekSchedule
    {
        public int Id { get; set; }

        public int MessId { get; set; }

        public DaySchedule Monday { get; set; } = new DaySchedule();
        public DaySchedule Tuesday { get; set; } = new DaySchedule();
        public DaySchedule Wednesday { get; set; } = new DaySchedule();
        public DaySchedule Thursday { get; set; } = new DaySchedule();
        public DaySchedule Friday { get; set; } = new DaySchedule();
        public DaySchedule Saturday { get; set; } = new DaySchedule();
        public DaySchedule Sunday { get; set; } = new DaySchedule();

        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

        public void UpdateTimestamp()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public class DaySchedule
    {
        public int? MorningMealId { get; set; }
        public int? EveningMealId { get; set; }

        [NotMapped]
        public Meal? MorningMeal { get; set; }
        [NotMapped]
        public Meal? EveningMeal { get; set; }
    }
}

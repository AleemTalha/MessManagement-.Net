using System;
using System.Collections.Generic;

namespace MessManagement.Models
{
    public class Bill
    {
        private decimal totalAmount = 0;
        private decimal paidAmount = 0;
        private decimal dueAmount = 0;

        public int Id { get; set; }

        public int UserId { get; set; }

        public User User { get; set; }

        public DateTime BillMonth { get; set; } = DateTime.UtcNow;

        public List<int> UserMealIds { get; set; } = new List<int>();

        public decimal TotalAmount
        {
            get => totalAmount;
            set
            {
                if (value < 0)
                    throw new ArgumentException("Total amount cannot be negative.");
                totalAmount = value;
            }
        }

        public decimal PaidAmount
        {
            get => paidAmount;
            set
            {
                if (value < 0)
                    throw new ArgumentException("Paid amount cannot be negative.");
                paidAmount = value;
            }
        }

        public decimal DueAmount
        {
            get => dueAmount;
            set => dueAmount = value;
        }

        public BillStatus Status { get; set; } = BillStatus.Pending;

        public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(7);

        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

        public void CalculateDueAmount()
        {
            DueAmount = TotalAmount - PaidAmount;
        }

        public void UpdateTimestamp()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public enum BillStatus
    {
        Pending = 0,
        PartiallyPaid = 1,
        FullyPaid = 2,
        Overdue = 3
    }
}

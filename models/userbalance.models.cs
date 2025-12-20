using System;

namespace MessManagement.Models
{
    public class UserBalance
    {
        private decimal totalBill = 0;
        private decimal totalPaid = 0;
        private decimal balance = 0;

        public int Id { get; set; }

        public int UserId { get; set; }

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

        public decimal TotalPaid
        {
            get => totalPaid;
            set
            {
                if (value < 0)
                    throw new ArgumentException("Total paid cannot be negative.");
                totalPaid = value;
            }
        }

        public decimal Balance
        {
            get => balance;
            set => balance = value;
        }

        public DateTime LastBillDate { get; set; } = DateTime.UtcNow;

        public DateTime LastPaymentDate { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

        public void CalculateBalance()
        {
            Balance = TotalBill - TotalPaid;
        }

        public void UpdateTimestamp()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }
}

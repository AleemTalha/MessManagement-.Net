using System;

namespace MessManagement.Models
{
    public class Payment
    {
        private decimal amountPaid = 0;
        private decimal balanceRemaining = 0;

        public int Id { get; set; }

        public int UserId { get; set; }

        public int? BillId { get; set; }

        public decimal AmountPaid
        {
            get => amountPaid;
            set
            {
                if (value < 0)
                    throw new ArgumentException("Amount paid cannot be negative.");
                amountPaid = value;
            }
        }

        public decimal BalanceRemaining
        {
            get => balanceRemaining;
            set => balanceRemaining = value;
        }

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

        public string TransactionId { get; set; } = string.Empty;

        public PaymentStatus Status { get; set; } = PaymentStatus.Completed;

        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

        public void UpdateTimestamp()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public enum PaymentMethod
    {
        Cash = 0,
        Card = 1,
        UPI = 2,
        BankTransfer = 3,
        Other = 4
    }

    public enum PaymentStatus
    {
        Pending = 0,
        Completed = 1,
        Failed = 2,
        Refunded = 3
    }
}

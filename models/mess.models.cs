using System;

namespace MessManagement.Models
{
    public class Mess
    {
        private string name = string.Empty;
        private string address = string.Empty;
        private string phoneNumber = string.Empty;

        public int Id { get; set; }

        public string Name
        {
            get => name;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("Mess name cannot be empty.");
                if (value.Length < 3)
                    throw new ArgumentException("Mess name must be at least 3 characters.");
                name = value;
            }
        }

        public string Address
        {
            get => address;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("Address cannot be empty.");
                address = value;
            }
        }

        public string PhoneNumber
        {
            get => phoneNumber;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("Phone number cannot be empty.");
                if (value.Length < 10)
                    throw new ArgumentException("Phone number seems invalid.");
                phoneNumber = value;
            }
        }

        public string Email { get; set; } = string.Empty;

        public int AdminUserId { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

        public void UpdateTimestamp()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }
}

using System;

namespace MessManagement.Models
{
    public class User
    {
        private string name = string.Empty;
        private string email = string.Empty;
        private string password = string.Empty;
        private int age = 0;
        private string phoneNumber = string.Empty;
        private bool isActive = true;
        private string role = "User";
        private string address = string.Empty;
        private DateTime? dob = null;

        public int Id { get; set; }

        public string Name
        {
            get => name;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("Name cannot be empty.");
                if (value.Length < 3)
                    throw new ArgumentException("Name must be at least 3 characters.");
                name = value;
            }
        }

        public string Email
        {
            get => email;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("Email cannot be empty.");
                if (!value.Contains("@"))
                    throw new ArgumentException("Email must be valid.");
                email = value;
            }
        }

        public string Password
        {
            get => password;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("Password cannot be empty.");
                if (value.Length < 6)
                    throw new ArgumentException("Password must be at least 6 characters.");
                password = value;
            }
        }

        public int Age
        {
            get => age;
            set
            {
                if (value < 0)
                    throw new ArgumentException("Age cannot be negative.");
                age = value;
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

        public bool IsActive
        {
            get => isActive;
            set => isActive = value;
        }

        public string Role
        {
            get => role;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("Role cannot be empty.");
                if (value != "Admin" && value != "User")
                    throw new ArgumentException("Role must be either 'Admin' or 'User'.");
                role = value;
            }
        }

        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

        public DateTime? DOB
        {
            get => dob;
            set
            {
                if (value != null && value > DateTime.UtcNow)
                    throw new ArgumentException("DOB cannot be in the future.");
                dob = value;
            }
        }

        public string Address
        {
            get => address;
            set
            {
                if (value != null && value.Length > 200)
                    throw new ArgumentException("Address too long.");
                address = value ?? string.Empty;
            }
        }

        public int? MessId { get; set; }

        public ProfilePicture ProfilePicture { get; set; } = new ProfilePicture();
        
        // Current month attendance reference (for quick access)
        public int? CurrentMonthAttendanceId { get; set; }
        
        // Track when user's attendance tracking started
        public DateTime AttendanceStartDate { get; set; } = DateTime.UtcNow;

        public void UpdateTimestamp()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public class ProfilePicture
    {
        private string publicId = string.Empty;
        private string url = string.Empty;

        public string PublicId
        {
            get => publicId;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("PublicId cannot be empty.");
                publicId = value;
            }
        }

        public string Url
        {
            get => url;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("Url cannot be empty.");
                url = value;
            }
        }
    }
}

using System;

namespace MessManagement.Models
{
    public class Meal
    {
        private string name = string.Empty;
        private double weight = 0;
        private decimal price = 0;
        private bool isAvailable = true;

        public int Id { get; set; }

        public string Name
        {
            get => name;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("Meal name cannot be empty.");
                if (value.Length < 2)
                    throw new ArgumentException("Meal name must be at least 2 characters.");
                name = value;
            }
        }

        public double Weight
        {
            get => weight;
            set
            {
                if (value <= 0)
                    throw new ArgumentException("Weight must be positive.");
                weight = value;
            }
        }

        public decimal Price
        {
            get => price;
            set
            {
                if (value <= 0)
                    throw new ArgumentException("Price must be positive.");
                price = value;
            }
        }

        public bool IsAvailable
        {
            get => isAvailable;
            set => isAvailable = value;
        }

        public string Description { get; set; } = string.Empty;

        public MealImage Image { get; set; } = new MealImage();

        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

        public void UpdateTimestamp()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public class MealImage
    {
        private string publicId = string.Empty;
        private string url = string.Empty;

        public string PublicId
        {
            get => publicId;
            set => publicId = value ?? string.Empty;
        }

        public string Url
        {
            get => url;
            set => url = value ?? string.Empty;
        }
    }
}
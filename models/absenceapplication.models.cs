using System;
using System.ComponentModel.DataAnnotations;

namespace MessManagement.Models
{
    public class AbsenceApplication
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedBy { get; set; } // Admin name or ID
        public string? Notes { get; set; }
    }
}
# Mess Management System - EF Core & Database Setup

Ye document Mess Management System project ke liye Entity Framework Core commands, setup aur unka purpose explain karta hai.

---

## 1. Project Setup

### 1.1 Create Project
```bash
dotnet new webapi -n MessManagement
```

**Purpose:** Web API template ke saath naya project create karta hai.

### 1.2 Install EF Core CLI Tool
```bash
dotnet tool install --global dotnet-ef
```

**Purpose:** EF Core CLI commands chalane ke liye tool install karna.

**Mac users:** PATH set karna zaruri hai:
```bash
export PATH="$PATH:/Users/apple/.dotnet/tools"
```

---

## 2. Database Context Setup

### 2.1 Program.cs Basic Setup
```csharp
var builder = WebApplication.CreateBuilder(args);
```

**Purpose:** WebApplication ka builder initialize karta hai.

### 2.2 Register DbContext
```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);
```

**Purpose:**
- DB connection configure karta hai.
- `UseNpgsql` PostgreSQL database connect karta hai.
- Connection string `appsettings.json` ya environment variable se read hoti hai.

### 2.3 Apply Migrations Automatically
```csharp
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}
```

**Purpose:**
- App start ke time DB schema automatically update hota hai latest migration ke hisaab se.
- CLI commands jaise `dotnet ef database update` ki zarurat kam ho jati hai.

---

## 3. EF Core Commands

### 3.1 Add Migration
```bash
dotnet ef migrations add InitialCreate
```

**Purpose:**
- Naye schema changes ke liye migration create karta hai.
- `Migrations` folder me migration file generate hoti hai.

### 3.2 Update Database
```bash
dotnet ef database update
```

**Purpose:**
- DB ko migration ke hisaab se update karta hai.
- Tables aur schema changes DB me apply karta hai.

**Note:** Agar table already exist karte hain to error aata hai: `relation "TableName" already exists`.

### 3.3 Check Migrations
```bash
dotnet ef migrations list
```

**Purpose:** DB me applied aur pending migrations ka list dekhne ke liye.

---

## 4. Logging Database Connection

### 4.1 Example Logging
```csharp
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        if (dbContext.Database.CanConnect())
        {
            Console.WriteLine("Database connection successful!");
        }
        else
        {
            Console.WriteLine("Database connection failed!");
        }
        dbContext.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"DB connection failed: {ex.Message}");
    }
}
```

**Purpose:**
- DB connection test karne ke liye.
- App start me console pe success ya error show karta hai.

---

## 5. DbContext Configuration Summary

### 5.1 Users
- **DbSet:** `DbSet<User> Users`
- **Properties:** Id, Name, Email, Password, PhoneNumber, Role, Address, ProfilePicture
- **Constraints:** Unique Email

### 5.2 Messes
- **DbSet:** `DbSet<Mess> Messes`
- **Properties:** Id, Name, Address, PhoneNumber, Email

### 5.3 Meals
- **DbSet:** `DbSet<Meal> Meals`
- **Properties:** Id, Name, Weight, Price, Description, Image

### 5.4 WeekSchedules
- **DbSet:** `DbSet<WeekSchedule> WeekSchedules`
- **Properties:** Day-wise MorningMeals & EveningMeals (List<Meal> with JSON converters)

### 5.5 UserMeals
- **DbSet:** `DbSet<UserMeal> UserMeals`
- **Properties:** TotalBill, Dishes (List<string>), Notes

### 5.6 Bills
- **DbSet:** `DbSet<Bill> Bills`
- **Properties:** TotalAmount, PaidAmount, DueAmount, UserMealIds (List<int>), Notes

### 5.7 Payments
- **DbSet:** `DbSet<Payment> Payments`
- **Properties:** AmountPaid, BalanceRemaining, TransactionId, Notes

### 5.8 UserBalances
- **DbSet:** `DbSet<UserBalance> UserBalances`
- **Properties:** TotalBill, TotalPaid, Balance
- **Constraints:** Unique UserId

### 5.9 Attendances
- **DbSet:** `DbSet<Attendance> Attendances`
- **Properties:** UserId, MealId, Date, MealTime, WasTaken, ChargedAmount, Notes
- **Constraints:** Unique Index on {UserId, Date, MealTime}

---

## 6. Notes / Best Practices

1. **Migrate() method** schema changes ko automatic update karta hai, lekin existing data safe rahta hai.

2. Agar naya project hai, pehle `Migrations` folder delete karke clean migration create kar sakte ho:
   ```bash
   dotnet ef migrations add InitialCreate
   ```

3. Collection properties with converters (`List<Meal>`, `List<string>`) ke liye EF warnings aa sakti hain. Ye value comparers ke bina aata hai, lekin run-time pe kaam karta hai.

4. CLI aur automatic migration dono use kar sakte ho, lekin automatic migration `Program.cs` me convenient hota hai during development.

5. Console logging se connection aur migration status easily verify kar sakte ho.

6. **GetRequiredService vs GetRequiredKeyedService:**
   - Regular service ke liye: `GetRequiredService<AppDbContext>()`
   - Keyed service ke liye: `GetRequiredKeyedService<DbContext>("AppDbContext")`

---

## 7. Common Errors & Solutions

### Error 1: "No keyed service registered"
**Problem:** `GetRequiredKeyedService` use kar rahe ho but service regular register ki hai.

**Solution:**
```csharp
// Wrong
var dbContext = scope.ServiceProvider.GetRequiredKeyedService<DbContext>("AppDbContext");

// Correct
var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
```

### Error 2: "relation already exists"
**Problem:** Table already database me exist karta hai.

**Solution:**
- Ya to database drop karo aur fresh migrations apply karo
- Ya existing migrations ko update/modify karo

### Error 3: Connection string not found
**Problem:** `appsettings.json` me connection string missing hai.

**Solution:** `appsettings.json` me add karo:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=mess_management;Username=postgres;Password=yourpassword"
  }
}
```

---

## 8. Quick Reference Commands

```bash
# Install EF Tools
dotnet tool install --global dotnet-ef

# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# List migrations
dotnet ef migrations list

# Remove last migration (if not applied)
dotnet ef migrations remove

# Build project
dotnet build

# Run project with hot reload
dotnet watch run
```

---

**Created by:** Mess Management Team  
**Last Updated:** December 15, 2025

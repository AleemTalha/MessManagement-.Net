using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backned.Migrations
{
    /// <inheritdoc />
    public partial class AddMonthlyAttendanceAndUserTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Attendances");

            migrationBuilder.AddColumn<DateTime>(
                name: "AttendanceStartDate",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CurrentMonthAttendanceId",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MonthlyAttendances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    TotalMonthlyBill = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TotalMealsTaken = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonthlyAttendances", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DailyAttendance",
                columns: table => new
                {
                    MonthlyAttendanceId = table.Column<int>(type: "integer", nullable: false),
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Day = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    MorningMealTaken = table.Column<bool>(type: "boolean", nullable: false),
                    MorningMealId = table.Column<int>(type: "integer", nullable: true),
                    MorningChargedAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    EveningMealTaken = table.Column<bool>(type: "boolean", nullable: false),
                    EveningMealId = table.Column<int>(type: "integer", nullable: true),
                    EveningChargedAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyAttendance", x => new { x.MonthlyAttendanceId, x.Id });
                    table.ForeignKey(
                        name: "FK_DailyAttendance_MonthlyAttendances_MonthlyAttendanceId",
                        column: x => x.MonthlyAttendanceId,
                        principalTable: "MonthlyAttendances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DailyAttendance_Date",
                table: "DailyAttendance",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyAttendances_UserId_Month_Year",
                table: "MonthlyAttendances",
                columns: new[] { "UserId", "Month", "Year" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyAttendance");

            migrationBuilder.DropTable(
                name: "MonthlyAttendances");

            migrationBuilder.DropColumn(
                name: "AttendanceStartDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CurrentMonthAttendanceId",
                table: "Users");

            migrationBuilder.CreateTable(
                name: "Attendances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ChargedAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    MealId = table.Column<int>(type: "integer", nullable: false),
                    MealTime = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    WasTaken = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attendances", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_UserId_Date_MealTime",
                table: "Attendances",
                columns: new[] { "UserId", "Date", "MealTime" },
                unique: true);
        }
    }
}

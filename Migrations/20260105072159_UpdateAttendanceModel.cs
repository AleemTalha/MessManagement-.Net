using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backned.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAttendanceModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EveningMealId",
                table: "DailyAttendance");

            migrationBuilder.DropColumn(
                name: "MorningMealId",
                table: "DailyAttendance");

            migrationBuilder.AddColumn<string>(
                name: "EveningMealName",
                table: "DailyAttendance",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "EveningMealPrice",
                table: "DailyAttendance",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "MorningMealName",
                table: "DailyAttendance",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "MorningMealPrice",
                table: "DailyAttendance",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EveningMealName",
                table: "DailyAttendance");

            migrationBuilder.DropColumn(
                name: "EveningMealPrice",
                table: "DailyAttendance");

            migrationBuilder.DropColumn(
                name: "MorningMealName",
                table: "DailyAttendance");

            migrationBuilder.DropColumn(
                name: "MorningMealPrice",
                table: "DailyAttendance");

            migrationBuilder.AddColumn<int>(
                name: "EveningMealId",
                table: "DailyAttendance",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MorningMealId",
                table: "DailyAttendance",
                type: "integer",
                nullable: true);
        }
    }
}

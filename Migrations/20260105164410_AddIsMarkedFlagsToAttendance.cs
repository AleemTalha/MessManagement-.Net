using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backned.Migrations
{
    /// <inheritdoc />
    public partial class AddIsMarkedFlagsToAttendance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EveningIsMarked",
                table: "DailyAttendance",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MorningIsMarked",
                table: "DailyAttendance",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EveningIsMarked",
                table: "DailyAttendance");

            migrationBuilder.DropColumn(
                name: "MorningIsMarked",
                table: "DailyAttendance");
        }
    }
}

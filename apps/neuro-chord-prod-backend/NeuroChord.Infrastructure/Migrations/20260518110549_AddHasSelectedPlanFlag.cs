using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NeuroChord.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHasSelectedPlanFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasSelectedPlan",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasSelectedPlan",
                table: "Users");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NeuroChord.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionPlanDetailInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Badge",
                table: "SubscriptionPlans",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cta",
                table: "SubscriptionPlans",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Features",
                table: "SubscriptionPlans",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Highlight",
                table: "SubscriptionPlans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "StudentLimit",
                table: "SubscriptionPlans",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tagline",
                table: "SubscriptionPlans",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Badge",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "Cta",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "Features",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "Highlight",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "StudentLimit",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "Tagline",
                table: "SubscriptionPlans");
        }
    }
}

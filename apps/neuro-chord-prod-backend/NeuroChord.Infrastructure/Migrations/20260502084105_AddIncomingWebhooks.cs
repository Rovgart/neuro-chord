using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NeuroChord.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIncomingWebhooks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "IncomingWebhooks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalEventId = table.Column<string>(type: "text", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Payload = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IncomingWebhooks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IncomingWebhooks_Subscriptions_SubscriptionId",
                        column: x => x.SubscriptionId,
                        principalTable: "Subscriptions",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IncomingWebhooks_SubscriptionId",
                table: "IncomingWebhooks",
                column: "SubscriptionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IncomingWebhooks");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NeuroChord.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNewFieldsToSessionArchive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "SessionArchives",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "RevokedAt",
                table: "SessionArchives",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "SessionArchives");

            migrationBuilder.DropColumn(
                name: "RevokedAt",
                table: "SessionArchives");
        }
    }
}

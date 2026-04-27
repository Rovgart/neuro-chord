using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NeuroChord.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSharedResourcesToEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Instruments");

            migrationBuilder.AddColumn<Guid>(
                name: "TypeId",
                table: "Instruments",
                type: "uuid",
                nullable: false,
                defaultValue: Guid.Empty);

            migrationBuilder.CreateIndex(
                name: "IX_Instruments_TypeId",
                table: "Instruments",
                column: "TypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Instruments_Instruments_TypeId",
                table: "Instruments",
                column: "TypeId",
                principalTable: "Instruments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // 2. SHAREDRESOURCES - Tworzymy od zera (bo wywaliłeś ją z bazy)
            migrationBuilder.CreateTable(
                name: "SharedResources",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MaterialId = table.Column<Guid>(type: "uuid", nullable: true),
                    TargetId = table.Column<Guid>(type: "uuid", nullable: true),
                    TargetType = table.Column<int>(type: "integer", nullable: false),
                    QuizId = table.Column<Guid>(type: "uuid", nullable: true),
                    FolderId = table.Column<Guid>(type: "uuid", nullable: true),
                    AccessLevel = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SharedResources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SharedResources_Materials_MaterialId",
                        column: x => x.MaterialId,
                        principalTable: "Materials",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SharedResources_Folders_FolderId",
                        column: x => x.FolderId,
                        principalTable: "Folders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SharedResources_MaterialId",
                table: "SharedResources",
                column: "MaterialId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedResources_FolderId",
                table: "SharedResources",
                column: "FolderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Instruments_Instruments_TypeId",
                table: "Instruments");

            migrationBuilder.DropIndex(
                name: "IX_Instruments_TypeId",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "TypeId",
                table: "Instruments");

            migrationBuilder.AlterColumn<string>(
                name: "AccessLevel",
                table: "SharedResources",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Instruments",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}

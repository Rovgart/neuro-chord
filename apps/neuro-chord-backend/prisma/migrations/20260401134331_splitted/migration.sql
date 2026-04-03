/*
  Warnings:

  - You are about to drop the column `expires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `Session` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EXPERIENCE_LEVEL" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "description" TEXT,
ADD COLUMN     "imgUrl" TEXT;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "expires",
DROP COLUMN "refresh_token";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "experience_level" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "favourite_music_genre" TEXT NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Verification_user_id_key" ON "Verification"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_token_key" ON "Verification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_profile_id_key" ON "StudentProfile"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_username_key" ON "StudentProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_profileId_key" ON "TeacherProfile"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_email_key" ON "PasswordReset"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_user_id_key" ON "PasswordReset"("user_id");

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

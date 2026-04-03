import { CreateStudentProfileDto, CreateTeacherProfileDto } from '@DTOs/create-profile-dto';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UsersService } from '@users/users.service';
import { PinoLogger } from 'nestjs-pino';

interface ProfileServiceI {
  createTeachersProfile: (userId: string, teachersProfileData: CreateTeacherProfileDto) => Promise<void>;
  createStudentsProfile: (userId: string, teachersProfileData: CreateStudentProfileDto) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
}
@Injectable()
export class ProfileService implements ProfileServiceI {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
    private readonly userService: UsersService,
  ) {}
  async createTeachersProfile(userId: string, teachersProfileData: CreateTeacherProfileDto) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const teachersProfile = await tx.profile.create({
          data: {
            userId,
            displayName: teachersProfileData.displayName,
            description: teachersProfileData.description,
          },
        });
        await tx.teacherProfile.create({
          data: {
            profileId: teachersProfile.id,
            specialization: teachersProfileData.specialization,
            favMusicGenre: teachersProfileData.favMusicGenre,
          },
        });
        await tx.user.update({
          data: {
            isVerified: false,
            role: Role.TEACHER,
          },
          where: {
            id: userId,
          },
        });
      });
    } catch (error) {
      this.logger.error("Failed to update teacher's profile", error);
      throw new InternalServerErrorException("Failed to update teacher's profile");
    }
  }
  async createStudentsProfile(userId: string, studentProfileData: CreateStudentProfileDto) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const profile = await tx.profile.create({
          data: {
            userId,
            imgUrl: studentProfileData?.imgUrl,
            displayName: studentProfileData.displayName,
            description: studentProfileData?.description,
          },
        });
        await tx.studentProfile.create({
          data: {
            experienceLevel: 0,
            username: studentProfileData?.username,
            profileId: profile.id,
          },
        });
        await tx.user.update({
          data: {
            isVerified: true,
            role: Role.STUDENT,
          },
          where: {
            id: userId,
          },
        });
      });
    } catch (error) {
      this.logger.error("Failed to update student's profile", error);
      throw new InternalServerErrorException("Failed to update students's profile");
    }
  }

  async deleteProfile(profileId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.profile.delete({
          where: { id: profileId },
        });
        // Triggering service worker for cleaning up s3 storage
      });
    } catch (error) {
      this.logger.error('Failed to delete profile', error);
      throw new InternalServerErrorException('Failed to delete profile');
    }
  }
  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }
    const { password, ...rest } = user;
    return rest;
  }
}

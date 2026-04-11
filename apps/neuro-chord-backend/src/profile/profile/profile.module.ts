import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { UsersModule } from '@users/users.module';
import { ProfileService } from './profile.service';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}

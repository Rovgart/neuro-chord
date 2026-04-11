import { Module } from '@nestjs/common';
import { SecurityModule } from '@security/security.module';
import { UsersService } from './users.service';

@Module({
  imports: [SecurityModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

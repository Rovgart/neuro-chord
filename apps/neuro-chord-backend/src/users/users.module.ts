import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SecurityModule } from '@security/security.module';
import { UsersService } from './users.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    SecurityModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

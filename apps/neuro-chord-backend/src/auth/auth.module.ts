import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from 'src/redis/redis.module';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
// auth.module.ts
// auth.module.ts
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    RedisModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, JwtStrategy, AuthGuard],
})
export class AuthModule {}

import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { SecurityModule } from "@security/security.module";
import { SessionModule } from "@session/session.module";
import { UsersModule } from "@users/users.module";
import { RedisModule } from "src/common/infrastructure/redis/redis.module";
import { VerificationsModule } from "src/common/infrastructure/verifications/verifications.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    PassportModule,
    UsersModule,
    SecurityModule,
    SessionModule,
    VerificationsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "7d" },
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

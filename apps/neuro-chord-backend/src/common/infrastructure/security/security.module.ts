import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { RedisModule } from "@redis/redis.module";
import { SecurityService } from "./security.service";

@Module({
  imports: [RedisModule, JwtModule],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}

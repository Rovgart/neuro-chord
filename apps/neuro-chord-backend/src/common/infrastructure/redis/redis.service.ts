import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
@Injectable()
export class RedisService {
  private readonly redisClient: Redis;
  constructor(configService: ConfigService) {
    this.redisClient = new Redis({
      host: configService.get("REDIS_HOST") || "localhost",
      port: parseInt(configService.get("REDIS_PORT") as string, 10) || 6379,
      password: configService.get("REDIS_PASSWORD") || undefined,
    });
  }
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redisClient.set(key, value, "EX", ttlSeconds);
  }
  async setWithExpiry(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redisClient.setex(key, ttlSeconds, value);
  }
  async del(key: string): Promise<void> {
    if (!key) {
      throw new Error("Deletion key wasn't provided");
    }
    await this.redisClient.del(key);
  }
  private async getWithValidation(
    token: string | undefined,
    errorMessage: string,
  ) {
    if (!token) {
      throw new UnauthorizedException(errorMessage);
    }
    return await this.redisClient.get(token);
  }
  private async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }
  public async getBlacklistedAccessToken(token: string) {
    return await this.getWithValidation(token, "Token wasn't provided");
  }

  public async getPasswordReset(token: string) {
    return await this.getWithValidation(
      token,
      "Password reset token wasn't provided",
    );
  }
  public async getBlacklistedRefreshToken(token: string) {
    return await this.getWithValidation(token, "Token wasn't provided");
  }
}

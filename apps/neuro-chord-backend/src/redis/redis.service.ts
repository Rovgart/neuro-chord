import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
@Injectable()
export class RedisService {
  private readonly redisClient: Redis;
  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }
  async setWithExpiry(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redisClient.setex(key, ttlSeconds, value);
  }
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }
}

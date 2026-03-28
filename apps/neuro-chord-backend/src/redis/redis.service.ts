import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Logger } from 'nestjs-pino';
@Injectable()
export class RedisService {
  private readonly redisClient: Redis;
  constructor(
    configService: ConfigService,
    private logger: Logger,
  ) {
    this.redisClient = new Redis({
      host: configService.get('REDIS_HOST') || 'localhost',
      port: parseInt(configService.get('REDIS_PORT') as string, 10) || 6379,
      password: configService.get('REDIS_PASSWORD') || undefined,
    });
  }
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redisClient.set(key, value, 'EX', ttlSeconds);
    } catch (err) {
      console.error('Redis error', err);
      this.logger.error('Redis error', err);
    }
  }
  async setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redisClient.setex(key, ttlSeconds, value);
    } catch (err) {
      console.error('Redis error', err);
      this.logger.error('Redis error', err);
    }
  }
  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error('Redis error', error);
    }
  }
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }
}

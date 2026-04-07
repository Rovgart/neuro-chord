/** biome-ignore-all lint/style/useImportType: <explanation> */

import { IS_PUBLIC_KEY } from '@decorators/public.decorator';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { type CanActivate, type ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SecurityService } from '@security/security.service';
import type { Request } from 'express';
import { RedisService } from 'src/common/infrastructure/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private redisService: RedisService,
    private reflector: Reflector,
    private securityService: SecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    if (request.url === '/metrics') {
      return true;
    }
    const token = this.extractTokenFromCookie(request);
    console.log(token);
    const cacheKey = `auth_val:${token}`;
    const cachedUser = await this.cache.get(cacheKey);
    if (cachedUser) {
      request.user = cachedUser;
      this.attachMetadata(request);
      return true;
    }
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const isBlacklisted = await this.redisService.getBlacklistedAccessToken(`bl_acc:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been blacklisted');
    }
    const verifiedToken = await this.securityService.verifyToken('ACCESS', token);
    if (!verifiedToken) {
      throw new UnauthorizedException('Invalid  token');
    }
    const validateToken = await this.securityService.validateTokensExpiration(verifiedToken);
    await this.cache.set(cacheKey, validateToken, 60000);
    request.user = validateToken;
    this.attachMetadata(request);
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.access_token;
  }
  private attachMetadata(request: any) {
    request.metadata = {
      ip: request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress,
      userAgent: request.headers['user-agent'] || 'unknown',
    };
  }
}

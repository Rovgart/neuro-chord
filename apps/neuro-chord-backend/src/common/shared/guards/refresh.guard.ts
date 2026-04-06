/** biome-ignore-all lint/style/useImportType: <explanation> */
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { SecurityService } from '@security/security.service';
import { Request } from 'express';
import { RedisService } from 'src/common/infrastructure/redis/redis.service';
@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    private redis: RedisService,
    private securityService: SecurityService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractTokenFromCookie(request);
    const cacheKey = `ref_val:${refreshToken.slice(-20)}`; // Bierzemy końcówkę tokena dla bezpieczeństwa klucza
    const cachedPayload = await this.cache.get(cacheKey);
    if (cachedPayload) {
      request.refreshTokenData = cachedPayload;
      return true;
    }
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token doesn't exist");
    }
    const isBlacklisted = await this.redis.getBlacklistedRefreshToken(`bl_ref:${refreshToken}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('This refresh token is blacklistend');
    }
    const payload = await this.securityService.verifyToken('REFRESH', refreshToken);
    const tokenData = { sub: payload.sub, sid: payload.sid };
    request.refreshTokenData = tokenData;
    await this.cache.set(cacheKey, tokenData, 30000);
    return true;
  }
  private extractTokenFromCookie(req: Request) {
    return req.cookies?.refresh_token;
  }
}

/** biome-ignore-all lint/style/useImportType: <explanation> */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SecurityService } from '@security/security.service';
import { Request } from 'express';
import { RedisService } from 'src/common/infrastructure/redis/redis.service';
@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    private redis: RedisService,
    private securityService: SecurityService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractTokenFromCookie(request);
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token doesn't exist");
    }
    const isBlacklisted = await this.redis.getBlacklistedRefreshToken(`bl_ref:${refreshToken}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('This refresh token is blacklistend');
    }
    const payload = await this.securityService.verifyToken('REFRESH', refreshToken);
    request.user = { sub: payload.sub, sid: payload.sid };

    return true;
  }
  private extractTokenFromCookie(req: Request) {
    return req.cookies?.refresh_token;
  }
}

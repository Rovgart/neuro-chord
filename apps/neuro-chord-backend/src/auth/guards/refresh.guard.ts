/** biome-ignore-all lint/style/useImportType: <explanation> */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    private jwtServ: JwtService,
    private redis: RedisService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractTokenFromCookie(request);
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token doesn't exist");
    }
    try {
      const isBlacklisted = await this.redis.get(`bl_ref:${refreshToken}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('This refresh token is blacklistend');
      }
      const payload = await this.jwtServ.verifyAsync<{ id: string; email: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      console.log(payload);
      request.user = { id: payload.id, email: payload.email };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid or expired refresh token', error);
    }

    return true;
  }
  private extractTokenFromCookie(req: Request) {
    return req.cookies?.refresh_token;
  }
}

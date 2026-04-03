import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { RedisService } from 'src/common/infrastructure/redis/redis.service';

@Injectable()
export class PasswordRecoverGuard implements CanActivate {
  constructor(
    private redis: RedisService,
    private logger: Logger,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.query.token;
    if (!token) {
      throw new UnauthorizedException('No password reset token provided');
    }
    try {
      const userId = await this.redis.getPasswordReset(`password-reset:${token}`);
      if (!userId) {
        throw new UnauthorizedException('No user found for this password reset token');
      }
      req.userInternalId = userId;
      return true;
    } catch (error) {
      this.logger.error('Invalid or expired password reset token', error);
      throw new UnauthorizedException('Invalid or expired password reset token');
    }
  }
}

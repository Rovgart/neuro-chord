import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from 'src/common/infrastructure/redis/redis.service';

@Injectable()
export class PinGuard implements CanActivate {
  constructor(private redis: RedisService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { email, pin } = req.body;
    if (!email || !pin) {
      throw new UnauthorizedException('Email and PIN are required');
    }
    const storedPin = await this.redis.getPasswordReset(`password-reset_pin:${email}`);
    if (!storedPin || storedPin !== pin) {
      throw new UnauthorizedException("No password reset token provided or pin isn't the same as provided pin");
    }
    req.userToReset = { email };
    return true;
  }
}

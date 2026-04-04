import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { extractTokenFromCookie } from 'src/utils';

@Injectable()
export class PasswordRecoverGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const resetToken = extractTokenFromCookie('RESET', req);
    if (!resetToken) {
      throw new BadRequestException("Reset token wasn't provided");
    }
    req.resetPasswordToken = resetToken;
    return true;
  }
}

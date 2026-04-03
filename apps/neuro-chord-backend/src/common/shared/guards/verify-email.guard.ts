import { VERIFY_EMAIL_KEY } from '@decorators/verify-email.decorator';
import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@prisma/prisma.service';
import { SecurityService } from '@security/security.service';

@Injectable()
export class EmailTokenGuard implements CanActivate {
  constructor(
    private securityService: SecurityService,
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isTokenRequired = this.reflector.getAllAndOverride(VERIFY_EMAIL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isTokenRequired) return true;

    const req = context.switchToHttp().getRequest();
    const token = req.query.token;

    if (!token) {
      throw new BadRequestException('Verification token is missing');
    }
    const user = await this.prisma.verification.findFirst({
      where: { token: token },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    req.user = user;
    return true;
  }
}

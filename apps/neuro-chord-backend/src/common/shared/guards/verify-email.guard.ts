import { VERIFY_EMAIL_KEY } from "@decorators/verify-email.decorator";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { VerificationService } from "src/common/infrastructure/verifications/verifications.service";

@Injectable()
export class EmailTokenGuard implements CanActivate {
  constructor(
    private verificationService: VerificationService,
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
    const verifiedUser = await this.verificationService.verifyToken(token);
    if (!verifiedUser) {
      throw new UnauthorizedException("User with this token doesn't exist");
    }

    req.verifiedUser = verifiedUser;
    return true;
  }
}

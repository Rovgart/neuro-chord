import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";

export const VERIFY_EMAIL_KEY = "require_email_token";
export const RequireEmailToken = () => SetMetadata(VERIFY_EMAIL_KEY, true);

export const VerifiedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.verifiedUser;
  },
);

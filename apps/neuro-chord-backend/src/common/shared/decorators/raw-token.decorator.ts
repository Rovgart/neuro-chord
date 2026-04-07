import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RawToken = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const token = req.cookies.access_token;
  return token;
});

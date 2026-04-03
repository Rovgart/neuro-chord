import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RawToken = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const token = req.headers.authorization.split(' ')[1];
  return token;
});

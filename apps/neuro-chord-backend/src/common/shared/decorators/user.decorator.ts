import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;

  return data ? user?.[data] : user;
});

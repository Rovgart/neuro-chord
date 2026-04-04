import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const RecoverPasswordToken = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.query.token || request.body.token;
  },
);

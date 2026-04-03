import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ExtractVerifyToken = createParamDecorator((data, req: ExecutionContext) => {
  const request = req.switchToHttp().getRequest();
  const verifyToken = request.query.token;

  if (!verifyToken) {
    throw new BadRequestException('Verification token is missing in query parameter');
  }

  return verifyToken;
});

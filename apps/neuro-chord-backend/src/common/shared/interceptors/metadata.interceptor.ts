import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

export class MetadataInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    request.metadata = {
      ip: request.ip,
      userAgent: request.headers["user-agent"],
      language: request.headers["accept-language"],
      timestamp: new Date().toISOString(),
    };
    return next.handle();
  }
}

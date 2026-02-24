import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { Counter } from 'prom-client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger,
    @InjectMetric('http_errors_total') private readonly httpErrorCounter: Counter,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const type = host.getType();

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    this.logger.error({ exception, contextType: type }, message);

    switch (type) {
      case 'http': {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
          exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        this.httpErrorCounter.inc({
          method: request.method,  
          path: request.url,       
          status: String(status),  
        });

        response.status(status).json({
          statusCode: status,
          message,                 
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
      }
      case 'ws': {
        const client = host.switchToWs().getClient();
        const wsMessage = exception instanceof Error ? exception.message : 'Internal socket error';
        client.emit('error', { message: wsMessage })
        break;
      }
      default:
        break;
    }
  }
}
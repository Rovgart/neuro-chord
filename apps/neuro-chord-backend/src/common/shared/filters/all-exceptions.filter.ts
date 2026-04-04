import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Request, Response } from "express";
import { Logger } from "nestjs-pino";
import { Counter } from "prom-client";
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger,
    @InjectMetric("http_errors_total")
    private readonly httpErrorCounter: Counter,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const type = host.getType();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }
    if (this.isRedisError(exception)) {
      this.logger.fatal("Redis connection or Command Error", exception);
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = "Service temporarly unvailable";
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = this.prismaErrorMapper(exception);
      status = mapped.status;
      message = mapped.message;
    }
    this.logger.error(
      {
        err: exception,
        contextType: type,
        statusCode: status,
      },
      message,
    );
    switch (type) {
      case "http": {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

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
      case "ws": {
        const client = host.switchToWs().getClient();
        const wsMessage =
          exception instanceof Error
            ? exception.message
            : "Internal socket error";
        client.emit("error", { message: wsMessage });
        break;
      }
      default:
        break;
    }
  }
  private isRedisError(err: any): boolean {
    return (
      err?.name === "ECONNREFUSED" ||
      err?.name === "ETIMEDOUT" ||
      err?.name === "EAI_AGAIN" ||
      err?.name === "ECONNRESET"
    );
  }
  private prismaErrorMapper(err: any) {
    const prismaErrorMap: Record<string, { status: number; message: string }> =
      {
        P2002: {
          status: HttpStatus.CONFLICT,
          message: "Record already exists",
        },
        P2025: { status: HttpStatus.NOT_FOUND, message: "Record not found" },
        P2003: {
          status: HttpStatus.BAD_REQUEST,
          message: "Foreign key constraint failed",
        },
        P2014: {
          status: HttpStatus.BAD_REQUEST,
          message: "Relation violation",
        },
      };
    return (
      prismaErrorMap[err.code] ?? {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Database error",
      }
    );
  }
}

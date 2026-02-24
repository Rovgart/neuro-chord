import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { PrismaClientUnknownRequestError } from '@prisma/client/runtime/client';
@Catch(PrismaClientUnknownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const prismaErrorMap:Record<string, {status:number, message:string}>={
      P2002: { status: HttpStatus.CONFLICT, message: 'Record already exists' },
      P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
      P2003: { status: HttpStatus.BAD_REQUEST, message: 'Foreign key constraint failed' },
      P2014: { status: HttpStatus.BAD_REQUEST, message: 'Relation violation' },
        }
        const mapped=prismaErrorMap[exception.code] ?? {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Database error',
        }
        response.status(mapped.status).json({
            statusCode: mapped.status,
            message: mapped.message,
            code: exception.code,
             timestamp: new Date().toISOString(),
        });
    }
}
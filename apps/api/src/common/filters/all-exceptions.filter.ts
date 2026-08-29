import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request & { requestId?: string }>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = typeof raw === 'string'
      ? raw
      : Array.isArray((raw as { message?: unknown })?.message)
        ? (raw as { message: unknown[] }).message
        : (raw as { message?: unknown })?.message ?? '服务器内部错误';

    response.status(status).json({
      success: false,
      error: {
        code: status,
        message,
      },
      path: request.originalUrl,
      requestId: request.requestId ?? 'unknown',
      timestamp: new Date().toISOString(),
    });
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class ApiEnvelopeInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { requestId?: string }>();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        requestId: request.requestId ?? 'unknown',
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

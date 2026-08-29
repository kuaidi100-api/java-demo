import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request & { requestId?: string }, response: Response, next: NextFunction): void {
    const requestId = String(request.headers['x-request-id'] ?? randomUUID());
    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);
    next();
  }
}

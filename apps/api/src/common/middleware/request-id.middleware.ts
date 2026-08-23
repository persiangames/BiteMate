import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { requestContext } from '../logging/request-context';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header('x-request-id');
    const requestId =
      incoming && /^[A-Za-z0-9-]{8,80}$/.test(incoming) ? incoming : randomUUID();
    res.setHeader('x-request-id', requestId);
    requestContext.run({ requestId }, () => next());
  }
}

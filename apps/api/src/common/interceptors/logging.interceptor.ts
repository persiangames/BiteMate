import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { getRequestId, requestContext } from '../logging/request-context';
import type { JwtPayload } from '../../modules/auth/types/jwt-payload.type';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const { method, url } = request;
    const startedAt = Date.now();
    const requestId = getRequestId();
    const store = requestContext.getStore();
    if (store && request.user?.sub) {
      store.userId = request.user.sub;
    }

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<{ statusCode: number }>();
        this.write(method, url, response.statusCode, Date.now() - startedAt, requestId, request.user?.sub);
      }),
    );
  }

  private write(
    method: string,
    url: string,
    status: number,
    durationMs: number,
    requestId?: string,
    userId?: string,
  ): void {
    const entry = JSON.stringify({
      msg: 'http_request',
      method,
      url,
      status,
      durationMs,
      requestId,
      userId: userId ?? null,
    });
    if (status >= 500) {
      this.logger.error(entry);
      return;
    }
    this.logger.log(entry);
  }
}

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiErrorResponse } from '@bitemate/shared';
import { Request, Response } from 'express';
import { getRequestId } from '../logging/request-context';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message = this.extractMessage(exceptionResponse, exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        JSON.stringify({
          msg: 'unhandled_exception',
          method: request.method,
          url: request.url,
          requestId: getRequestId(),
          status,
        }),
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn(
        JSON.stringify({
          msg: 'http_error',
          method: request.method,
          url: request.url,
          requestId: getRequestId(),
          status,
          message,
        }),
      );
    }

    const body: ApiErrorResponse = {
      statusCode: status,
      message,
      error:
        exception instanceof HttpException
          ? (exceptionResponse as { error?: string })?.error ??
            HttpStatus[status]
          : 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: getRequestId(),
    };

    response.status(status).json(body);
  }

  private extractMessage(
    exceptionResponse: string | object | null,
    exception: unknown,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      return (exceptionResponse as { message: string | string[] }).message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }
}

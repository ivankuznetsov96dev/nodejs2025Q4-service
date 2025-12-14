import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from './logging.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errorResponse: Record<string, unknown>;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorResponse = {
          statusCode: status,
          message,
          error: exception.name,
        };

      } else if (typeof exceptionResponse === 'object') {
        errorResponse = exceptionResponse as Record<string, unknown>;

        message = (errorResponse.message as string) || exception.message;
      } else {
        message = exception.message;

        errorResponse = {
          statusCode: status,
          message,
          error: exception.name,
        };
      }
    } else {
      // 500 Err
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorResponse = {
        statusCode: status,
        message,
        error: 'Internal Server Error',
      };
    }

    // Log
    const errorMessage = `${request.method} ${request.url} - ${status} - ${message}`;
    const stack = exception instanceof Error ? exception.stack : undefined;
    this.loggingService.error(errorMessage, stack, 'ExceptionFilter');

    response.status(status).json(errorResponse);
  }
}

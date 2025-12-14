import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, query, body } = request;
    const startTime = Date.now();

    this.loggingService.logRequest(
      method,
      url,
      query as Record<string, unknown>,
      body,
      'HTTP',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;

          this.loggingService.logResponse(
            method,
            url,
            response.statusCode,
            duration,
            'HTTP',
          );
        },

        error: () => {
          const duration = Date.now() - startTime;

          this.loggingService.logResponse(
            method,
            url,
            response.statusCode,
            duration,
            'HTTP',
          );
        },
      }),
    );
  }
}

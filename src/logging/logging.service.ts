import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { LogLevelEnum } from './models/log-level.enum';

@Injectable()
export class LoggingService {
  private readonly logLevel: LogLevelEnum;
  private readonly maxFileSizeKB: number;
  private readonly logToFile: boolean;
  private readonly logsDir: string;
  private currentLogFile: string;

  constructor(private readonly configService: ConfigService) {
    const level = this.configService
      .get<string>('LOG_LEVEL', 'LOG')
      .toUpperCase();

    this.logLevel =
      LogLevelEnum[level as keyof typeof LogLevelEnum] ?? LogLevelEnum.LOG;

    this.maxFileSizeKB = this.configService.get<number>(
      'LOG_FILE_SIZE_KB',
      100,
    );

    this.logToFile =
      this.configService.get<string>('LOG_TO_FILE', 'false') === 'true';

    this.logsDir = this.configService.get<string>('LOGS_DIR', 'logs');

    if (this.logToFile) {
      this.ensureLogsDirectory();
      this.currentLogFile = this.getLogFileName();
    }
  }

  private ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private getLogFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return path.join(this.logsDir, `app-${timestamp}.log`);
  }

  private rotateLogFileIfNeeded(): void {
    if (!this.logToFile || !this.currentLogFile) return;

    try {
      if (fs.existsSync(this.currentLogFile)) {
        const stats = fs.statSync(this.currentLogFile);
        const fileSizeKB = stats.size / 1024;

        if (fileSizeKB >= this.maxFileSizeKB) {
          this.currentLogFile = this.getLogFileName();
        }
      }
    } catch {}
  }

  private formatMessage(
    level: string,
    message: string,
    context?: string,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';

    return `${timestamp} ${level} ${contextStr} ${message}`;
  }

  private writeLog(level: string, message: string, context?: string): void {
    const formattedMessage = this.formatMessage(level, message, context);

    process.stdout.write(formattedMessage + '\n');
    if (this.logToFile) {
      this.rotateLogFileIfNeeded();

      try {
        fs.appendFileSync(this.currentLogFile, formattedMessage + '\n');
      } catch (err) {
        process.stderr.write(`Failed to write to log file: ${err}\n`);
      }
    }
  }

  error(message: string, trace?: string, context?: string): void {
    if (this.logLevel >= LogLevelEnum.ERROR) {
      this.writeLog('ERROR', message, context);

      if (trace) {
        this.writeLog('ERROR', trace, context);
      }
    }
  }

  warn(message: string, context?: string): void {
    if (this.logLevel >= LogLevelEnum.WARN) {
      this.writeLog('WARN', message, context);
    }
  }

  log(message: string, context?: string): void {
    if (this.logLevel >= LogLevelEnum.LOG) {
      this.writeLog('LOG', message, context);
    }
  }

  debug(message: string, context?: string): void {
    if (this.logLevel >= LogLevelEnum.DEBUG) {
      this.writeLog('DEBUG', message, context);
    }
  }

  verbose(message: string, context?: string): void {
    if (this.logLevel >= LogLevelEnum.VERBOSE) {
      this.writeLog('VERBOSE', message, context);
    }
  }

  logRequest(
    method: string,
    url: string,
    query: Record<string, unknown>,
    body: unknown,
    context?: string,
  ): void {
    const queryStr = Object.keys(query).length > 0 ? JSON.stringify(query) : '';
    const bodyStr = body ? JSON.stringify(body) : '';

    const message = `Incoming Request: ${method} ${url}${queryStr ? ` Query: ${queryStr}` : ''}${bodyStr ? ` Body: ${bodyStr}` : ''}`;

    this.log(message, context);
  }

  logResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: string,
  ): void {
    const message = `Response: ${method} ${url} ${statusCode} - ${duration}ms`;

    this.log(message, context);
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LoggingService } from './logging/logging.service';
import { AllExceptionsFilter } from './logging/exceptions.filter';
import { LoggingInterceptor } from './logging/logging.interceptor';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const loggingService = app.get(LoggingService);
  app.useGlobalFilters(new AllExceptionsFilter(loggingService));
  app.useGlobalInterceptors(new LoggingInterceptor(loggingService));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  process.on('uncaughtException', (error: Error) => {
    loggingService.error(
      `Uncaught Exception: ${error.message}`,
      error.stack,
      'UncaughtException',
    );


    setTimeout(() => {
      //Exit
      process.exit(1);
    }, 1000);
  });


  process.on('unhandledRejection', (reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;

    loggingService.error(
      `Unhandled Rejection: ${message}`,
      stack,
      'UnhandledRejection',
    );

  });

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);

  loggingService.log(`App running on ${port}`);
}

bootstrap();

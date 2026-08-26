import 'dotenv/config';
import './instrument';
import * as dns from 'node:dns';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import helmet from 'helmet';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { isProductionEnv } from './common/utils/environment.util';

dns.setDefaultResultOrder('ipv4first');

function resolveLogLevels(level: string): LogLevel[] {
  const normalized = level === 'info' ? 'log' : level === 'trace' ? 'verbose' : level;
  const ordered: LogLevel[] = ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'];
  const index = ordered.indexOf(normalized as LogLevel);

  if (index === -1) {
    return ['error', 'warn', 'log'];
  }

  return ordered.slice(0, index + 1);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      bufferLogs: false,
      rawBody: true,
    },
  );

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const port = configService.get<number>('app.port', 3000);
  const corsOrigins = configService.get<string[]>('app.corsOrigins', []);
  const logLevel = configService.get<string>('logging.level', 'info');
  const uploadDir = configService.get<string>('storage.localUploadDir', 'uploads');
  const trustProxy = configService.get<boolean>('security.trustProxy', false);

  const jsonBodyLimit = configService.get<string>('security.jsonBodyLimit', '1mb')!;

  if (trustProxy) {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');
  app.useBodyParser('json', { limit: jsonBodyLimit });
  app.useBodyParser('urlencoded', { limit: jsonBodyLimit, extended: true });

  app.use(
    helmet({
      contentSecurityPolicy: isProductionEnv(nodeEnv) ? undefined : false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  app.useStaticAssets(join(process.cwd(), uploadDir), {
    prefix: '/uploads/',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  });
  app.useLogger(resolveLogLevels(logLevel));
  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`BiteMate API [${nodeEnv}] on http://0.0.0.0:${port}/${apiPrefix}`);
}

bootstrap();

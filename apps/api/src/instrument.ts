import * as Sentry from '@sentry/nestjs';

const dsn = process.env.SENTRY_DSN;
const nodeEnv = process.env.NODE_ENV ?? 'development';

if (dsn) {
  Sentry.init({
    dsn,
    environment: nodeEnv,
    tracesSampleRate: nodeEnv === 'production' ? 0.1 : 1.0,
    profilesSampleRate: nodeEnv === 'production' ? 0.1 : 0,
    sendDefaultPii: false,
  });
}

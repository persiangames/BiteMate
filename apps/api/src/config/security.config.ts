import { registerAs } from '@nestjs/config';

export const securityConfig = registerAs('security', () => ({
  throttleTtlSeconds: parseInt(process.env.THROTTLE_TTL_SECONDS ?? '60', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT ?? '120', 10),
  authThrottleTtlSeconds: parseInt(process.env.AUTH_THROTTLE_TTL_SECONDS ?? '60', 10),
  authThrottleLimit: parseInt(process.env.AUTH_THROTTLE_LIMIT ?? '8', 10),
  loginFailLimit: parseInt(process.env.LOGIN_FAIL_LIMIT ?? '8', 10),
  loginFailWindowSeconds: parseInt(process.env.LOGIN_FAIL_WINDOW_SECONDS ?? '900', 10),
  registerIpHourlyLimit: parseInt(process.env.REGISTER_IP_HOURLY_LIMIT ?? '3', 10),
  jsonBodyLimit: process.env.JSON_BODY_LIMIT ?? '1mb',
  trustProxy: process.env.TRUST_PROXY === 'true',
}));

export const sentryConfig = registerAs('sentry', () => ({
  dsn: process.env.SENTRY_DSN || undefined,
  enabled: Boolean(process.env.SENTRY_DSN),
}));

import { registerAs } from '@nestjs/config';

export type SmsProvider = 'console' | 'kavenegar' | 'melipayamak' | 'http';
export type EmailProvider = 'console' | 'smtp' | 'resend';

export const messagingConfig = registerAs('messaging', () => ({
  appName: process.env.APP_NAME ?? 'BiteMate',
  appUrl: process.env.APP_PUBLIC_URL ?? 'https://www.bitemate.ir',
  sms: {
    provider: (process.env.SMS_PROVIDER ?? 'console') as SmsProvider,
    sender: process.env.SMS_SENDER ?? 'BiteMate',
    kavenegar: {
      apiKey: process.env.KAVENEGAR_API_KEY ?? '',
      template: process.env.KAVENEGAR_OTP_TEMPLATE ?? '',
    },
    melipayamak: {
      username: process.env.MELIPAYAMAK_USERNAME?.trim() ?? '',
      password: process.env.MELIPAYAMAK_PASSWORD?.trim() ?? '',
      from: process.env.MELIPAYAMAK_FROM?.trim() ?? '',
    },
    http: {
      url: process.env.SMS_HTTP_URL ?? '',
      method: process.env.SMS_HTTP_METHOD ?? 'POST',
      apiKeyHeader: process.env.SMS_HTTP_API_KEY_HEADER ?? 'Authorization',
      apiKey: process.env.SMS_HTTP_API_KEY ?? '',
    },
  },
  email: {
    provider: (process.env.EMAIL_PROVIDER ?? 'console') as EmailProvider,
    from: process.env.EMAIL_FROM ?? 'noreply@bitemate.ir',
    fromName: process.env.EMAIL_FROM_NAME ?? 'BiteMate',
    resend: {
      apiKey: process.env.RESEND_API_KEY?.trim() ?? '',
    },
    smtp: {
      host: process.env.SMTP_HOST?.trim() ?? '',
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER?.trim() ?? '',
      pass: process.env.SMTP_PASS?.trim() ?? '',
    },
  },
}));

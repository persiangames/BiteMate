"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagingConfig = void 0;
const config_1 = require("@nestjs/config");
exports.messagingConfig = (0, config_1.registerAs)('messaging', () => ({
    appName: process.env.APP_NAME ?? 'BiteMate',
    appUrl: process.env.APP_PUBLIC_URL ?? 'https://www.bitemate.ir',
    sms: {
        provider: (process.env.SMS_PROVIDER ?? 'console'),
        sender: process.env.SMS_SENDER ?? 'BiteMate',
        kavenegar: {
            apiKey: process.env.KAVENEGAR_API_KEY ?? '',
            template: process.env.KAVENEGAR_OTP_TEMPLATE ?? '',
        },
        melipayamak: {
            username: process.env.MELIPAYAMAK_USERNAME ?? '',
            password: process.env.MELIPAYAMAK_PASSWORD ?? '',
            from: process.env.MELIPAYAMAK_FROM ?? '',
        },
        http: {
            url: process.env.SMS_HTTP_URL ?? '',
            method: process.env.SMS_HTTP_METHOD ?? 'POST',
            apiKeyHeader: process.env.SMS_HTTP_API_KEY_HEADER ?? 'Authorization',
            apiKey: process.env.SMS_HTTP_API_KEY ?? '',
        },
    },
    email: {
        provider: (process.env.EMAIL_PROVIDER ?? 'console'),
        from: process.env.EMAIL_FROM ?? 'noreply@bitemate.ir',
        fromName: process.env.EMAIL_FROM_NAME ?? 'BiteMate',
        smtp: {
            host: process.env.SMTP_HOST ?? '',
            port: parseInt(process.env.SMTP_PORT ?? '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            user: process.env.SMTP_USER ?? '',
            pass: process.env.SMTP_PASS ?? '',
        },
    },
}));
//# sourceMappingURL=messaging.config.js.map
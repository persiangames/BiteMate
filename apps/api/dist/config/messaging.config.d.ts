export type SmsProvider = 'console' | 'kavenegar' | 'melipayamak' | 'http';
export type EmailProvider = 'console' | 'smtp';
export declare const messagingConfig: (() => {
    appName: string;
    appUrl: string;
    sms: {
        provider: SmsProvider;
        sender: string;
        kavenegar: {
            apiKey: string;
            template: string;
        };
        melipayamak: {
            username: string;
            password: string;
            from: string;
        };
        http: {
            url: string;
            method: string;
            apiKeyHeader: string;
            apiKey: string;
        };
    };
    email: {
        provider: EmailProvider;
        from: string;
        fromName: string;
        smtp: {
            host: string;
            port: number;
            secure: boolean;
            user: string;
            pass: string;
        };
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    appName: string;
    appUrl: string;
    sms: {
        provider: SmsProvider;
        sender: string;
        kavenegar: {
            apiKey: string;
            template: string;
        };
        melipayamak: {
            username: string;
            password: string;
            from: string;
        };
        http: {
            url: string;
            method: string;
            apiKeyHeader: string;
            apiKey: string;
        };
    };
    email: {
        provider: EmailProvider;
        from: string;
        fromName: string;
        smtp: {
            host: string;
            port: number;
            secure: boolean;
            user: string;
            pass: string;
        };
    };
}>;

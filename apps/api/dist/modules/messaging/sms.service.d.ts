import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendOtpSms(phoneNumber: string, code: string, purpose: string): Promise<void>;
    private sendKavenegar;
    private sendMelipayamak;
    private sendHttp;
}

import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private getTransporter;
    sendOtpEmail(to: string, code: string, purpose: string): Promise<void>;
}

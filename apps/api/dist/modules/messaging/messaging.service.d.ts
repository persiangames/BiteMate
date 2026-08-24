import { EmailService } from './email.service';
import { SmsService } from './sms.service';
export declare class MessagingService {
    private readonly emailService;
    private readonly smsService;
    constructor(emailService: EmailService, smsService: SmsService);
    sendOtp(destination: string, code: string, purposeLabel: string): Promise<void>;
}

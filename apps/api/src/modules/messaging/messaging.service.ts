import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Injectable()
export class MessagingService {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async sendOtp(destination: string, code: string, purposeLabel: string): Promise<void> {
    const target = destination.trim();
    if (target.includes('@')) {
      await this.emailService.sendOtpEmail(target.toLowerCase(), code, purposeLabel);
      return;
    }
    await this.smsService.sendOtpSms(target, code, purposeLabel);
  }
}

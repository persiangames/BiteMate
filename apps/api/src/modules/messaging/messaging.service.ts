import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Injectable()
export class MessagingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  isConsoleOnly(): boolean {
    const smsProvider = this.configService.get<string>('messaging.sms.provider', 'console');
    const emailProvider = this.configService.get<string>(
      'messaging.email.provider',
      'console',
    );
    return smsProvider === 'console' && emailProvider === 'console';
  }

  async sendOtp(destination: string, code: string, purposeLabel: string): Promise<void> {
    const target = destination.trim();
    if (target.includes('@')) {
      await this.emailService.sendOtpEmail(target.toLowerCase(), code, purposeLabel);
      return;
    }
    await this.smsService.sendOtpSms(target, code, purposeLabel);
  }
}

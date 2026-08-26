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

  isEmailDestination(destination: string): boolean {
    return destination.trim().includes('@');
  }

  isDevCodeEnabledFor(destination: string): boolean {
    if (this.isEmailDestination(destination)) {
      return this.configService.get<string>('messaging.email.provider', 'console') === 'console';
    }
    return this.configService.get<string>('messaging.sms.provider', 'console') === 'console';
  }

  /** @deprecated Use isDevCodeEnabledFor(destination) for channel-aware dev codes. */
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
    if (this.isEmailDestination(target)) {
      await this.emailService.sendOtpEmail(target.toLowerCase(), code, purposeLabel);
      return;
    }
    await this.smsService.sendOtpSms(target, code, purposeLabel);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtpSms(phoneNumber: string, code: string, purpose: string): Promise<void> {
    const provider = this.configService.get<string>('messaging.sms.provider', 'console');
    const appName = this.configService.get<string>('messaging.appName', 'BiteMate');
    const message = `${appName}: ${purpose} code ${code}`;

    if (provider === 'console') {
      this.logger.log(`[SMS:console] to=${phoneNumber} code=${code}`);
      return;
    }

    if (provider === 'kavenegar') {
      await this.sendKavenegar(phoneNumber, code, message);
      return;
    }

    if (provider === 'melipayamak') {
      await this.sendMelipayamak(phoneNumber, message);
      return;
    }

    if (provider === 'http') {
      await this.sendHttp(phoneNumber, message);
      return;
    }

    this.logger.warn(`Unknown SMS provider "${provider}" — code logged`);
    this.logger.log(`[SMS:fallback] to=${phoneNumber} code=${code}`);
  }

  private async sendKavenegar(phoneNumber: string, code: string, fallbackMessage: string): Promise<void> {
    const apiKey = this.configService.get<string>('messaging.sms.kavenegar.apiKey');
    const template = this.configService.get<string>('messaging.sms.kavenegar.template');
    const sender = this.configService.get<string>('messaging.sms.sender', 'BiteMate');

    if (!apiKey) {
      this.logger.warn('KAVENEGAR_API_KEY missing');
      this.logger.log(`[SMS:fallback] ${fallbackMessage}`);
      return;
    }

    const receptor = phoneNumber.replace(/\D/g, '');
    if (template) {
      const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json?receptor=${encodeURIComponent(receptor)}&token=${encodeURIComponent(code)}&template=${encodeURIComponent(template)}`;
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Kavenegar verify failed: ${response.status}`);
      }
      return;
    }

    const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`;
    const body = new URLSearchParams({
      receptor,
      sender,
      message: fallbackMessage,
    });
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) {
      throw new Error(`Kavenegar SMS failed: ${response.status}`);
    }
  }

  private async sendMelipayamak(phoneNumber: string, message: string): Promise<void> {
    const username = this.configService.get<string>('messaging.sms.melipayamak.username');
    const password = this.configService.get<string>('messaging.sms.melipayamak.password');
    const from = this.configService.get<string>('messaging.sms.melipayamak.from');

    if (!username || !password || !from) {
      this.logger.warn('Melipayamak credentials missing');
      this.logger.log(`[SMS:fallback] to=${phoneNumber} message=${message}`);
      return;
    }

    const response = await fetch('https://rest.payamak-panel.com/api/SendSMS/SendSMS', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        to: phoneNumber,
        from,
        text: message,
        isFlash: false,
      }),
    });
    if (!response.ok) {
      throw new Error(`Melipayamak SMS failed: ${response.status}`);
    }
  }

  private async sendHttp(phoneNumber: string, message: string): Promise<void> {
    const url = this.configService.get<string>('messaging.sms.http.url');
    if (!url) {
      this.logger.warn('SMS_HTTP_URL missing');
      return;
    }
    const method = this.configService.get<string>('messaging.sms.http.method', 'POST');
    const apiKeyHeader = this.configService.get<string>('messaging.sms.http.apiKeyHeader', 'Authorization');
    const apiKey = this.configService.get<string>('messaging.sms.http.apiKey', '');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers[apiKeyHeader] = apiKey;
    }
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({ to: phoneNumber, message }),
    });
    if (!response.ok) {
      throw new Error(`HTTP SMS failed: ${response.status}`);
    }
  }
}

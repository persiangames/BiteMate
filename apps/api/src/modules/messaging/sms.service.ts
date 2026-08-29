import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtpSms(phoneNumber: string, code: string, purpose: string): Promise<void> {
    const provider = this.configService.get<string>('messaging.sms.provider', 'console');
    const appName = this.configService.get<string>('messaging.appName', 'BiteMate');
    const message =
      provider === 'melipayamak'
        ? `Code ${appName}: ${code}`
        : `${appName}: ${purpose} code ${code}`;

    if (provider === 'console') {
      this.logger.log(`[SMS:console] to=${phoneNumber} code=${code}`);
      return;
    }

    if (provider === 'kavenegar') {
      await this.sendKavenegar(phoneNumber, code, message);
      return;
    }

    if (provider === 'melipayamak') {
      await this.sendMelipayamakOtp(phoneNumber, code, message);
      return;
    }

    if (provider === 'http') {
      await this.sendHttp(phoneNumber, message);
      return;
    }

    this.logger.warn(`Unknown SMS provider "${provider}" — code logged`);
    this.logger.log(`[SMS:fallback] to=${phoneNumber} code=${code}`);
  }

  private async sendMelipayamakOtp(
    phoneNumber: string,
    code: string,
    fallbackMessage: string,
  ): Promise<void> {
    const otpBodyId = this.configService.get<string>('messaging.sms.melipayamak.otpBodyId');
    const kavenegarKey = this.configService.get<string>('messaging.sms.kavenegar.apiKey');
    const kavenegarTemplate = this.configService.get<string>('messaging.sms.kavenegar.template');

    if (otpBodyId) {
      await this.sendMelipayamakPattern(phoneNumber, code, otpBodyId);
      return;
    }

    if (kavenegarKey && kavenegarTemplate) {
      this.logger.warn(
        'MELIPAYAMAK_OTP_BODY_ID is not set — using Kavenegar verify template for OTP instead of promotional Melipayamak SMS',
      );
      await this.sendKavenegar(phoneNumber, code, fallbackMessage);
      return;
    }

    this.logger.error(
      'Set MELIPAYAMAK_OTP_BODY_ID for OTP SMS. Promotional SendSMS hits telecom blacklist for verification codes.',
    );

    try {
      await this.sendMelipayamak(phoneNumber, fallbackMessage);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      const isBlacklist = /blacklist|RetStatus.?11|Value.?11|RetStatus.?35|Value.?35/i.test(detail);
      if (isBlacklist && kavenegarKey) {
        this.logger.warn(
          'Melipayamak promotional SMS blocked by telecom blacklist — retrying with Kavenegar',
        );
        await this.sendKavenegar(phoneNumber, code, fallbackMessage);
        return;
      }
      throw error;
    }
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

  private formatMelipayamakRecipient(phoneNumber: string): string {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.startsWith('98') && digits.length >= 12) {
      return `0${digits.slice(2)}`;
    }
    if (digits.startsWith('9') && digits.length === 10) {
      return `0${digits}`;
    }
    if (digits.startsWith('09') && digits.length === 11) {
      return digits;
    }
    return phoneNumber.trim();
  }

  private formatMelipayamakMessage(message: string): string {
    const normalized = message.trim();
    if (/لغو\s*11/i.test(normalized)) {
      return normalized;
    }
    return `${normalized}\nلغو11`;
  }

  private describeMelipayamakFailure(payload: {
    RetStatus?: number | string;
    StrRetStatus?: string;
    Value?: string;
  } | null): string {
    const status = Number(payload?.RetStatus);
    const valueCode = Number(payload?.Value);
    const map: Record<number, string> = {
      0: 'Invalid Melipayamak username or API key',
      2: 'Insufficient Melipayamak credit',
      5: 'Invalid sender line (MELIPAYAMAK_FROM)',
      7: 'SMS text blocked by operator filter',
      9: 'Dedicated line required; public lines cannot send via webservice',
      11: 'Recipient is on telecom blacklist',
      12: 'Melipayamak account documents incomplete',
      15: 'SMS must include unsubscribe suffix (لغو11)',
      16: 'Recipient number not found',
      18: 'Invalid recipient number',
      19: 'Hourly send limit exceeded',
      35: 'Recipient is on telecom blacklist',
      [-108]: 'Melipayamak blocked IP after failed attempts — contact support',
      [-109]: 'Add Render outbound IP ranges to Melipayamak allowed IPs',
      [-110]: 'Use APIKey as password, not panel password',
      108: 'Melipayamak blocked IP after failed attempts — contact support',
      109: 'Add Render outbound IP ranges to Melipayamak allowed IPs',
      110: 'Use APIKey as password, not panel password',
    };
    if (Number.isFinite(status) && map[status]) {
      return map[status];
    }
    if (Number.isFinite(valueCode) && map[valueCode]) {
      return map[valueCode];
    }
    return payload?.StrRetStatus ?? payload?.Value ?? 'Unknown Melipayamak error';
  }

  private isMelipayamakSuccess(payload: {
    RetStatus?: number | string;
    Value?: string;
  } | null): boolean {
    if (Number(payload?.RetStatus) === 1) {
      return true;
    }
    const valueDigits = String(payload?.Value ?? '').replace(/\D/g, '');
    return valueDigits.length > 10;
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeoutMs = 10_000,
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  /** Service-line OTP via Melipayamak pattern — not subject to promotional blacklist. */
  private async sendMelipayamakPattern(
    phoneNumber: string,
    code: string,
    bodyId: string,
  ): Promise<void> {
    const username = this.configService.get<string>('messaging.sms.melipayamak.username');
    const password = this.configService.get<string>('messaging.sms.melipayamak.password');

    if (!username || !password) {
      throw new Error('Melipayamak SMS is not configured');
    }

    const to = this.formatMelipayamakRecipient(phoneNumber);
    const attempts: Array<{ url: string; body: URLSearchParams }> = [
      {
        url: 'https://rest.payamak-panel.com/api/SendSMS/SendByBaseNumber',
        body: new URLSearchParams({ username, password, to, bodyId, text: code }),
      },
      {
        url: 'https://rest.payamak-panel.com/api/SendSMS/SendByBaseNumber2',
        body: new URLSearchParams({
          username,
          password,
          to,
          bodyId,
          text: JSON.stringify([code]),
        }),
      },
    ];

    let lastError = 'Melipayamak pattern SMS rejected';

    for (const attempt of attempts) {
      const response = await this.fetchWithTimeout(attempt.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: attempt.body,
      });

      const payload = (await response.json().catch(() => null)) as
        | { RetStatus?: number; StrRetStatus?: string; Value?: string }
        | null;

      if (response.ok && this.isMelipayamakSuccess(payload)) {
        this.logger.log(`Melipayamak OTP pattern queued for ${to} (recId=${payload?.Value ?? 'ok'})`);
        return;
      }

      lastError = this.describeMelipayamakFailure(payload);
      this.logger.warn(`Melipayamak OTP attempt failed via ${attempt.url}: ${lastError}`);
    }

    throw new Error(`Melipayamak pattern SMS rejected: ${lastError}`);
  }

  private async sendMelipayamak(phoneNumber: string, message: string): Promise<void> {
    const username = this.configService.get<string>('messaging.sms.melipayamak.username');
    const password = this.configService.get<string>('messaging.sms.melipayamak.password');
    const from = this.configService.get<string>('messaging.sms.melipayamak.from');

    if (!username || !password || !from) {
      this.logger.error(
        'Melipayamak credentials missing — set MELIPAYAMAK_USERNAME, MELIPAYAMAK_PASSWORD (APIKey), MELIPAYAMAK_FROM',
      );
      throw new Error('Melipayamak SMS is not configured');
    }

    const to = this.formatMelipayamakRecipient(phoneNumber);
    const text = this.formatMelipayamakMessage(message);
    const body = new URLSearchParams({
      username,
      password,
      to,
      from,
      text,
      isFlash: 'false',
    });

    let response: Response;
    try {
      response = await this.fetchWithTimeout(
        'https://rest.payamak-panel.com/api/SendSMS/SendSMS',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        },
      );
    } catch (error) {
      this.logger.error(`Melipayamak request failed for ${to}`, error);
      throw error;
    }

    const payload = (await response.json().catch(() => null)) as
      | { RetStatus?: number; StrRetStatus?: string; Value?: string }
      | null;

    if (!response.ok) {
      throw new Error(`Melipayamak SMS failed: HTTP ${response.status}`);
    }

    if (!this.isMelipayamakSuccess(payload)) {
      const detail = this.describeMelipayamakFailure(payload);
      this.logger.error(
        `Melipayamak rejected SMS to ${to}: ${detail} (payload=${JSON.stringify(payload)})`,
      );
      throw new Error(`Melipayamak SMS rejected: ${detail}`);
    }

    this.logger.log(`Melipayamak SMS queued for ${to} (recId=${payload?.Value ?? 'ok'})`);
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

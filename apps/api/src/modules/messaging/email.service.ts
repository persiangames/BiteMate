import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { buildOtpEmailContent, type OtpEmailPurpose } from './email-templates';
import { smtpIpv4Lookup } from './smtp-ipv4.util';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }
    const host = this.configService.get<string>('messaging.email.smtp.host');
    const user = this.configService.get<string>('messaging.email.smtp.user');
    const pass = this.configService.get<string>('messaging.email.smtp.pass');
    if (!host || !user || !pass) {
      return null;
    }
    this.transporter = nodemailer.createTransport({
      host,
      port: this.configService.get<number>('messaging.email.smtp.port', 587),
      secure: this.configService.get<boolean>('messaging.email.smtp.secure', false),
      auth: { user, pass },
      lookup: smtpIpv4Lookup,
    } as nodemailer.TransportOptions);
    return this.transporter;
  }

  async sendOtpEmail(to: string, code: string, purpose: string): Promise<void> {
    const provider = this.configService.get<string>('messaging.email.provider', 'console');
    const appName = this.configService.get<string>('messaging.appName', 'BiteMate');
    const appUrl = this.configService.get<string>('messaging.appUrl', 'https://www.bitemate.ir');
    const from = this.configService.get<string>('messaging.email.from', 'noreply@bitemate.ir');
    const fromName = this.configService.get<string>('messaging.email.fromName', 'BiteMate');
    const expiresMinutes = Math.max(
      1,
      Math.round(
        this.configService.get<number>('otp.expiresInSeconds', 300) / 60,
      ),
    );
    const emailPurpose = (purpose as OtpEmailPurpose) || 'verification';
    const { subject, text, html } = buildOtpEmailContent({
      appName,
      code,
      purpose: emailPurpose,
      appUrl,
      expiresMinutes,
    });

    if (provider === 'console') {
      this.logger.log(`[EMAIL:console] to=${to} subject=${subject} code=${code}`);
      return;
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      this.logger.error(
        'Email SMTP not configured — set EMAIL_PROVIDER=smtp and SMTP_HOST, SMTP_USER, SMTP_PASS',
      );
      throw new Error('Email SMTP is not configured');
    }

    await transporter.sendMail({
      from: `"${fromName}" <${from}>`,
      to,
      subject,
      text,
      html,
    });

    this.logger.log(`OTP email sent to ${to} (${emailPurpose})`);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dns from 'node:dns/promises';
import * as nodemailer from 'nodemailer';
import { buildOtpEmailContent, type OtpEmailPurpose } from './email-templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private transporterPromise: Promise<nodemailer.Transporter | null> | null = null;

  constructor(private readonly configService: ConfigService) {}

  private async resolveTransporter(): Promise<nodemailer.Transporter | null> {
    if (this.transporter) {
      return this.transporter;
    }
    if (!this.transporterPromise) {
      this.transporterPromise = this.buildTransporter();
    }
    this.transporter = await this.transporterPromise;
    return this.transporter;
  }

  private async buildTransporter(): Promise<nodemailer.Transporter | null> {
    const host = this.configService.get<string>('messaging.email.smtp.host');
    const user = this.configService.get<string>('messaging.email.smtp.user');
    const pass = this.configService.get<string>('messaging.email.smtp.pass');
    if (!host || !user || !pass) {
      return null;
    }

    let connectHost = host;
    try {
      const resolved = await dns.lookup(host, { family: 4 });
      connectHost = resolved.address;
      this.logger.log(`SMTP using IPv4 ${connectHost} for ${host}`);
    } catch (error) {
      this.logger.warn(
        `Could not resolve ${host} to IPv4; falling back to hostname`,
        error instanceof Error ? error.message : error,
      );
    }

    return nodemailer.createTransport({
      host: connectHost,
      port: this.configService.get<number>('messaging.email.smtp.port', 587),
      secure: this.configService.get<boolean>('messaging.email.smtp.secure', false),
      auth: { user, pass },
      tls: {
        servername: host,
      },
    });
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

    const transporter = await this.resolveTransporter();
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

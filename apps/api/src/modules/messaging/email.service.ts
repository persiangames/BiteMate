import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
    });
    return this.transporter;
  }

  async sendOtpEmail(to: string, code: string, purpose: string): Promise<void> {
    const provider = this.configService.get<string>('messaging.email.provider', 'console');
    const appName = this.configService.get<string>('messaging.appName', 'BiteMate');
    const from = this.configService.get<string>('messaging.email.from', 'noreply@bitemate.ir');
    const fromName = this.configService.get<string>('messaging.email.fromName', 'BiteMate');
    const subject = `${appName} verification code`;
    const text = `Your ${appName} ${purpose} code is: ${code}\n\nThis code expires in a few minutes. If you did not request it, ignore this email.`;
    const html = `<p>Your <strong>${appName}</strong> ${purpose} code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p><p>If you did not request this, you can ignore this email.</p>`;

    if (provider === 'console') {
      this.logger.log(`[EMAIL:console] to=${to} subject=${subject} code=${code}`);
      return;
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      this.logger.warn('SMTP not configured — OTP email logged to console instead');
      this.logger.log(`[EMAIL:fallback] to=${to} code=${code}`);
      return;
    }

    await transporter.sendMail({
      from: `"${fromName}" <${from}>`,
      to,
      subject,
      text,
      html,
    });
  }
}

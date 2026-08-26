export type OtpEmailPurpose =
  | 'account verification'
  | 'password reset'
  | 'login'
  | 'verification';

const purposeCopy: Record<
  OtpEmailPurpose,
  { subjectEn: string; subjectFa: string; leadEn: string; leadFa: string }
> = {
  'account verification': {
    subjectEn: 'Verify your BiteMate account',
    subjectFa: 'تأیید حساب BiteMate',
    leadEn: 'Use this code to verify your account:',
    leadFa: 'برای تأیید حساب، این کد را وارد کنید:',
  },
  'password reset': {
    subjectEn: 'Reset your BiteMate password',
    subjectFa: 'بازیابی رمز BiteMate',
    leadEn: 'Use this code to reset your password:',
    leadFa: 'برای بازیابی رمز، این کد را وارد کنید:',
  },
  login: {
    subjectEn: 'Your BiteMate login code',
    subjectFa: 'کد ورود BiteMate',
    leadEn: 'Use this code to sign in:',
    leadFa: 'برای ورود، این کد را وارد کنید:',
  },
  verification: {
    subjectEn: 'Your BiteMate verification code',
    subjectFa: 'کد تأیید BiteMate',
    leadEn: 'Use this verification code:',
    leadFa: 'کد تأیید شما:',
  },
};

export function buildOtpEmailContent(options: {
  appName: string;
  code: string;
  purpose: OtpEmailPurpose;
  appUrl: string;
  expiresMinutes: number;
}): { subject: string; text: string; html: string } {
  const copy = purposeCopy[options.purpose] ?? purposeCopy.verification;
  const subject = `${copy.subjectEn} | ${copy.subjectFa}`;
  const text = [
    copy.leadEn,
    options.code,
    '',
    copy.leadFa,
    options.code,
    '',
    `This code expires in ${options.expiresMinutes} minutes.`,
    `این کد تا ${options.expiresMinutes} دقیقه معتبر است.`,
    '',
    `If you did not request this, ignore this email.`,
    `اگر این درخواست را شما نداده‌اید، این ایمیل را نادیده بگیرید.`,
    '',
    options.appUrl,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">
        <tr><td style="background:linear-gradient(135deg,#ff6b35,#e63946);padding:28px 24px;text-align:center;">
          <div style="color:#fff;font-size:24px;font-weight:700;letter-spacing:.3px;">${options.appName}</div>
          <div style="color:rgba(255,255,255,.9);font-size:13px;margin-top:6px;">Meet. Eat. Enjoy Together.</div>
        </td></tr>
        <tr><td style="padding:28px 24px 12px;color:#111827;">
          <p style="margin:0 0 8px;font-size:16px;font-weight:600;">${copy.subjectEn}</p>
          <p style="margin:0 0 16px;font-size:14px;color:#6b7280;direction:rtl;text-align:right;">${copy.subjectFa}</p>
          <p style="margin:0 0 8px;font-size:14px;color:#374151;">${copy.leadEn}</p>
          <p style="margin:0 0 20px;font-size:14px;color:#374151;direction:rtl;text-align:right;">${copy.leadFa}</p>
          <div style="text-align:center;margin:24px 0;">
            <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:#111827;background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:16px 24px;">${options.code}</span>
          </div>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
            Expires in ${options.expiresMinutes} minutes · معتبر تا ${options.expiresMinutes} دقیقه
          </p>
        </td></tr>
        <tr><td style="padding:0 24px 28px;color:#9ca3af;font-size:12px;line-height:1.6;">
          If you did not request this code, you can safely ignore this email.<br>
          <span style="direction:rtl;display:inline-block;">اگر این درخواست از طرف شما نبوده، این ایمیل را نادیده بگیرید.</span>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;"><a href="${options.appUrl}" style="color:#e63946;text-decoration:none;">${options.appUrl.replace(/^https?:\/\//, '')}</a></p>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

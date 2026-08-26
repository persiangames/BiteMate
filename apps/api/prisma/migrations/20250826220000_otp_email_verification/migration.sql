-- Add dedicated OTP purpose for email account verification.
ALTER TYPE "OtpPurpose" ADD VALUE IF NOT EXISTS 'EMAIL_VERIFICATION';

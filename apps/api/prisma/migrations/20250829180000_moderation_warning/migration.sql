-- Add moderation warning notification type for admin actions
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MODERATION_WARNING';

ALTER TYPE "UserRole" ADD VALUE 'PLATFORM_ADMIN';
ALTER TYPE "UserRole" ADD VALUE 'MODERATOR';

CREATE TYPE "RestaurantApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "AbuseReportStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED');
CREATE TYPE "AbuseReportTargetType" AS ENUM ('USER', 'RESTAURANT', 'POST', 'MEETUP');

ALTER TABLE "users" ADD COLUMN "admin_verified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "restaurants" ADD COLUMN "approval_status" "RestaurantApprovalStatus" NOT NULL DEFAULT 'PENDING';
UPDATE "restaurants" SET "approval_status" = 'APPROVED';
CREATE INDEX "restaurants_approval_status_is_active_idx" ON "restaurants"("approval_status", "is_active");

CREATE TABLE "abuse_reports" (
  "id" TEXT NOT NULL,
  "reporter_id" TEXT NOT NULL,
  "target_type" "AbuseReportTargetType" NOT NULL,
  "target_id" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "details" TEXT,
  "status" "AbuseReportStatus" NOT NULL DEFAULT 'OPEN',
  "reviewed_by_id" TEXT,
  "resolution_note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "abuse_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "abuse_reports_status_created_at_idx" ON "abuse_reports"("status", "created_at" DESC);
CREATE INDEX "abuse_reports_target_type_target_id_idx" ON "abuse_reports"("target_type", "target_id");
CREATE INDEX "abuse_reports_reporter_id_idx" ON "abuse_reports"("reporter_id");

CREATE TABLE "admin_audit_logs" (
  "id" TEXT NOT NULL,
  "admin_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT,
  "details" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_audit_logs_admin_id_created_at_idx" ON "admin_audit_logs"("admin_id", "created_at" DESC);
CREATE INDEX "admin_audit_logs_action_created_at_idx" ON "admin_audit_logs"("action", "created_at" DESC);

ALTER TABLE "abuse_reports" ADD CONSTRAINT "abuse_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "abuse_reports" ADD CONSTRAINT "abuse_reports_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" ADD COLUMN "bio" TEXT;
ALTER TABLE "users" ADD COLUMN "live_location_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "invisible_mode" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "availability_status" "AvailabilityStatus" NOT NULL DEFAULT 'OFFLINE';
ALTER TABLE "users" ADD COLUMN "live_latitude" DOUBLE PRECISION;
ALTER TABLE "users" ADD COLUMN "live_longitude" DOUBLE PRECISION;
ALTER TABLE "users" ADD COLUMN "last_live_location_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_country_city_idx" ON "users"("country", "city");

-- CreateIndex
CREATE INDEX "users_role_availability_status_idx" ON "users"("role", "availability_status");

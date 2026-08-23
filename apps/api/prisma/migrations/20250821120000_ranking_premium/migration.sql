-- CreateEnum
CREATE TYPE "PremiumSubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RestaurantAdStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "AffiliateSourceType" AS ENUM ('BOOKING', 'RESTAURANT_AD_CLICK');

-- CreateEnum
CREATE TYPE "AffiliateCommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "premium_expires_at" TIMESTAMP(3),
ADD COLUMN "rank_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "activity_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "successful_meetups" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN "rank_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "visit_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "conversion_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "is_sponsored" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "affiliate_referrer_id" TEXT;

-- CreateTable
CREATE TABLE "premium_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "PremiumSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan_id" TEXT NOT NULL DEFAULT 'premium_monthly',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "provider_reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_ads" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image_url" TEXT,
    "target_url" TEXT,
    "budget" DECIMAL(10,2) NOT NULL,
    "spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "status" "RestaurantAdStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_commissions" (
    "id" TEXT NOT NULL,
    "referrer_user_id" TEXT NOT NULL,
    "source_type" "AffiliateSourceType" NOT NULL,
    "source_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "AffiliateCommissionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_rank_score_idx" ON "users"("rank_score" DESC);

-- CreateIndex
CREATE INDEX "restaurants_rank_score_idx" ON "restaurants"("rank_score" DESC);

-- CreateIndex
CREATE INDEX "premium_subscriptions_user_id_status_idx" ON "premium_subscriptions"("user_id", "status");

-- CreateIndex
CREATE INDEX "premium_subscriptions_expires_at_idx" ON "premium_subscriptions"("expires_at");

-- CreateIndex
CREATE INDEX "restaurant_ads_restaurant_id_status_idx" ON "restaurant_ads"("restaurant_id", "status");

-- CreateIndex
CREATE INDEX "restaurant_ads_owner_id_idx" ON "restaurant_ads"("owner_id");

-- CreateIndex
CREATE INDEX "restaurant_ads_status_starts_at_idx" ON "restaurant_ads"("status", "starts_at");

-- CreateIndex
CREATE INDEX "affiliate_commissions_referrer_user_id_status_idx" ON "affiliate_commissions"("referrer_user_id", "status");

-- CreateIndex
CREATE INDEX "affiliate_commissions_source_type_source_id_idx" ON "affiliate_commissions"("source_type", "source_id");

-- AddForeignKey
ALTER TABLE "premium_subscriptions" ADD CONSTRAINT "premium_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_ads" ADD CONSTRAINT "restaurant_ads_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_ads" ADD CONSTRAINT "restaurant_ads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_referrer_user_id_fkey" FOREIGN KEY ("referrer_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

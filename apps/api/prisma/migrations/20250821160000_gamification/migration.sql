ALTER TABLE "users" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "users" ADD COLUMN "experience_points" INTEGER NOT NULL DEFAULT 0;

CREATE TYPE "UserBadgeType" AS ENUM (
  'FOOD_EXPLORER',
  'SOCIAL_EATER',
  'TOP_REVIEWER',
  'TRUSTED_HOST'
);

CREATE TABLE "user_badges" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "badge" "UserBadgeType" NOT NULL,
  "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_badges_user_id_badge_key" ON "user_badges"("user_id", "badge");
CREATE INDEX "user_badges_user_id_idx" ON "user_badges"("user_id");

CREATE TABLE "meetup_participations" (
  "id" TEXT NOT NULL,
  "meetup_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "meetup_participations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "meetup_participations_meetup_id_user_id_key" ON "meetup_participations"("meetup_id", "user_id");
CREATE INDEX "meetup_participations_user_id_completed_at_idx" ON "meetup_participations"("user_id", "completed_at" DESC);

CREATE TABLE "meetup_reviews" (
  "id" TEXT NOT NULL,
  "meetup_id" TEXT NOT NULL,
  "reviewer_id" TEXT NOT NULL,
  "reviewed_id" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "meetup_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "meetup_reviews_meetup_id_reviewer_id_reviewed_id_key" ON "meetup_reviews"("meetup_id", "reviewer_id", "reviewed_id");
CREATE INDEX "meetup_reviews_reviewed_id_created_at_idx" ON "meetup_reviews"("reviewed_id", "created_at" DESC);

ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meetup_participations" ADD CONSTRAINT "meetup_participations_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "food_meetups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meetup_participations" ADD CONSTRAINT "meetup_participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meetup_reviews" ADD CONSTRAINT "meetup_reviews_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "food_meetups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meetup_reviews" ADD CONSTRAINT "meetup_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meetup_reviews" ADD CONSTRAINT "meetup_reviews_reviewed_id_fkey" FOREIGN KEY ("reviewed_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

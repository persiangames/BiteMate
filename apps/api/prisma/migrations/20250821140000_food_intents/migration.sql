-- Food Intent matching engine (Phase 11)

CREATE TYPE "FoodIntentStatus" AS ENUM ('ACTIVE', 'MATCHED', 'CANCELLED', 'EXPIRED', 'COMPLETED');

CREATE TABLE "food_intents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "meetup_id" TEXT,
    "food_type" TEXT NOT NULL,
    "food_category" TEXT,
    "time_start" TIMESTAMP(3) NOT NULL,
    "time_end" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius_km" DOUBLE PRECISION NOT NULL,
    "desired_people" INTEGER NOT NULL DEFAULT 2,
    "budget_min" DOUBLE PRECISION,
    "budget_max" DOUBLE PRECISION,
    "status" "FoodIntentStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_intents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "food_intents_meetup_id_key" ON "food_intents"("meetup_id");
CREATE INDEX "food_intents_user_id_created_at_idx" ON "food_intents"("user_id", "created_at" DESC);
CREATE INDEX "food_intents_status_time_start_idx" ON "food_intents"("status", "time_start");
CREATE INDEX "food_intents_food_type_time_start_idx" ON "food_intents"("food_type", "time_start");

ALTER TABLE "food_intents" ADD CONSTRAINT "food_intents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_intents" ADD CONSTRAINT "food_intents_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "food_meetups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

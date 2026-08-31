-- Align food_meetups with Prisma schema (event composer fields)

ALTER TYPE "MeetupStatus" ADD VALUE 'FULL';

ALTER TABLE "food_meetups" ADD COLUMN "meal_slot" TEXT;
ALTER TABLE "food_meetups" ADD COLUMN "food_name" TEXT;
ALTER TABLE "food_meetups" ADD COLUMN "preferred_gender" TEXT;
ALTER TABLE "food_meetups" ADD COLUMN "age_min" INTEGER;
ALTER TABLE "food_meetups" ADD COLUMN "age_max" INTEGER;
ALTER TABLE "food_meetups" ADD COLUMN "preferred_education" TEXT;
ALTER TABLE "food_meetups" ADD COLUMN "country" TEXT;
ALTER TABLE "food_meetups" ADD COLUMN "city" TEXT;

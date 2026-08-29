-- Add preferred interests array to food meetups for companion filtering
ALTER TABLE "food_meetups" ADD COLUMN "preferred_interests" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

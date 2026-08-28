-- Profile completion: interests, relationship status, children

CREATE TYPE "RelationshipStatus" AS ENUM (
  'SINGLE',
  'IN_RELATIONSHIP',
  'MARRIED',
  'DIVORCED',
  'WIDOWED',
  'PREFER_NOT_TO_SAY'
);

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "interests" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "relationship_status" "RelationshipStatus";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_children" BOOLEAN;

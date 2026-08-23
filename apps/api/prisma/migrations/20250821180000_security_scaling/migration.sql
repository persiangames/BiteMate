ALTER TABLE "users" ADD COLUMN "token_version" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "refresh_tokens" ADD COLUMN "family_id" TEXT;
UPDATE "refresh_tokens" SET "family_id" = gen_random_uuid()::text WHERE "family_id" IS NULL;
ALTER TABLE "refresh_tokens" ALTER COLUMN "family_id" SET NOT NULL;
ALTER TABLE "refresh_tokens" ADD COLUMN "revoked_at" TIMESTAMP(3);
ALTER TABLE "refresh_tokens" ADD COLUMN "replaced_by_hash" TEXT;
CREATE INDEX "refresh_tokens_family_id_idx" ON "refresh_tokens"("family_id");

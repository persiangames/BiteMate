-- CreateEnum
CREATE TYPE "PostTagRole" AS ENUM ('RESTAURANT', 'CHEF', 'HOST', 'GUEST', 'COMPANION', 'INFLUENCER', 'REVIEWER', 'OWNER', 'HOME_CHEF');

-- CreateTable
CREATE TABLE "post_tags" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "PostTagRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_tags_post_id_user_id_key" ON "post_tags"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "post_tags_user_id_idx" ON "post_tags"("user_id");

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

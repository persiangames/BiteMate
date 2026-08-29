-- Cross-post meetups in the social feed
ALTER TABLE "posts" ADD COLUMN "meetup_id" TEXT;

CREATE UNIQUE INDEX "posts_meetup_id_key" ON "posts"("meetup_id");
CREATE INDEX "posts_meetup_id_idx" ON "posts"("meetup_id");

ALTER TABLE "posts" ADD CONSTRAINT "posts_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "food_meetups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

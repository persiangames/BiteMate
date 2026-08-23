-- CreateEnum
CREATE TYPE "MeetupStatus" AS ENUM ('OPEN', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MeetupInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MeetupRoomStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "is_premium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "meetup_rating" DOUBLE PRECISION NOT NULL DEFAULT 3;
ALTER TABLE "users" ADD COLUMN "meetup_review_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "food_meetups" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "food_type" TEXT NOT NULL,
    "food_category" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "radius_km" DOUBLE PRECISION NOT NULL,
    "desired_people" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location_label" TEXT,
    "status" "MeetupStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_meetups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetup_invites" (
    "id" TEXT NOT NULL,
    "meetup_id" TEXT NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "invitee_id" TEXT NOT NULL,
    "status" "MeetupInviteStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meetup_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetup_rooms" (
    "id" TEXT NOT NULL,
    "meetup_id" TEXT NOT NULL,
    "status" "MeetupRoomStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "meetup_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetup_room_members" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meetup_room_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetup_room_messages" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meetup_room_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_meetups_creator_id_created_at_idx" ON "food_meetups"("creator_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "food_meetups_status_scheduled_at_idx" ON "food_meetups"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "food_meetups_food_type_scheduled_at_idx" ON "food_meetups"("food_type", "scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "meetup_invites_meetup_id_invitee_id_key" ON "meetup_invites"("meetup_id", "invitee_id");

-- CreateIndex
CREATE INDEX "meetup_invites_invitee_id_status_idx" ON "meetup_invites"("invitee_id", "status");

-- CreateIndex
CREATE INDEX "meetup_invites_inviter_id_created_at_idx" ON "meetup_invites"("inviter_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "meetup_rooms_meetup_id_key" ON "meetup_rooms"("meetup_id");

-- CreateIndex
CREATE UNIQUE INDEX "meetup_room_members_room_id_user_id_key" ON "meetup_room_members"("room_id", "user_id");

-- CreateIndex
CREATE INDEX "meetup_room_members_user_id_idx" ON "meetup_room_members"("user_id");

-- CreateIndex
CREATE INDEX "meetup_room_messages_room_id_created_at_idx" ON "meetup_room_messages"("room_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "food_meetups" ADD CONSTRAINT "food_meetups_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_invites" ADD CONSTRAINT "meetup_invites_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "food_meetups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_invites" ADD CONSTRAINT "meetup_invites_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_invites" ADD CONSTRAINT "meetup_invites_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_rooms" ADD CONSTRAINT "meetup_rooms_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "food_meetups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_room_members" ADD CONSTRAINT "meetup_room_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "meetup_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_room_members" ADD CONSTRAINT "meetup_room_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_room_messages" ADD CONSTRAINT "meetup_room_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "meetup_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_room_messages" ADD CONSTRAINT "meetup_room_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

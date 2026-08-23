-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('NORMAL_USER', 'RESTAURANT_OWNER', 'CAFE_OWNER', 'FOOD_TRUCK_OWNER', 'HOME_CHEF', 'FOOD_REVIEWER', 'COMPANION_USER', 'INFLUENCER');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'FACEBOOK', 'PHONE');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('PHONE_VERIFICATION', 'LOGIN');

-- CreateEnum
CREATE TYPE "SupportedLocale" AS ENUM ('en', 'fa', 'ar', 'hi', 'tr', 'fr', 'it', 'zh', 'ja', 'es', 'de', 'ru', 'pt', 'ko', 'id', 'th', 'vi', 'nl');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone_number" TEXT,
    "password_hash" TEXT,
    "full_name" TEXT,
    "country" TEXT,
    "city" TEXT,
    "date_of_birth" DATE,
    "role" "UserRole",
    "profile_image" TEXT,
    "locale" "SupportedLocale" NOT NULL DEFAULT 'en',
    "auth_provider" "AuthProvider" NOT NULL,
    "firebase_uid" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "phone_number" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localization_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" "SupportedLocale" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "localization_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "otp_codes_phone_number_purpose_idx" ON "otp_codes"("phone_number", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "localization_keys_key_locale_key" ON "localization_keys"("key", "locale");

-- CreateIndex
CREATE INDEX "localization_keys_locale_idx" ON "localization_keys"("locale");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

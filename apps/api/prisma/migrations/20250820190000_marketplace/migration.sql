-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('RESTAURANT_TABLE', 'HOME_CHEF_MEAL');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReviewTargetType" AS ENUM ('RESTAURANT', 'HOME_CHEF');

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "profile_image" TEXT,
    "cover_image" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone_number" TEXT,
    "cuisine_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_opening_hours" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "restaurant_opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_menu_items" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "category" TEXT,
    "image_url" TEXT,
    "discount_percent" INTEGER NOT NULL DEFAULT 0,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_chef_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "accepts_orders" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_chef_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_chef_menu_items" (
    "id" TEXT NOT NULL,
    "home_chef_profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "image_url" TEXT,
    "available_date" DATE NOT NULL,
    "servings_available" INTEGER NOT NULL,
    "servings_sold" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_chef_menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_chef_availability" (
    "id" TEXT NOT NULL,
    "home_chef_profile_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "home_chef_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "type" "BookingType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "restaurant_id" TEXT,
    "home_chef_profile_id" TEXT,
    "home_chef_menu_item_id" TEXT,
    "booking_date" DATE NOT NULL,
    "booking_time" TEXT NOT NULL,
    "party_size" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "total_price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "target_type" "ReviewTargetType" NOT NULL,
    "restaurant_id" TEXT,
    "home_chef_profile_id" TEXT,
    "booking_id" TEXT,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "is_verified_purchase" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restaurants_owner_id_idx" ON "restaurants"("owner_id");

-- CreateIndex
CREATE INDEX "restaurants_city_country_idx" ON "restaurants"("city", "country");

-- CreateIndex
CREATE INDEX "restaurants_average_rating_idx" ON "restaurants"("average_rating" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_opening_hours_restaurant_id_day_of_week_key" ON "restaurant_opening_hours"("restaurant_id", "day_of_week");

-- CreateIndex
CREATE INDEX "restaurant_menu_items_restaurant_id_category_idx" ON "restaurant_menu_items"("restaurant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "home_chef_profiles_user_id_key" ON "home_chef_profiles"("user_id");

-- CreateIndex
CREATE INDEX "home_chef_menu_items_home_chef_profile_id_available_date_idx" ON "home_chef_menu_items"("home_chef_profile_id", "available_date");

-- CreateIndex
CREATE UNIQUE INDEX "home_chef_availability_home_chef_profile_id_day_of_week_key" ON "home_chef_availability"("home_chef_profile_id", "day_of_week");

-- CreateIndex
CREATE INDEX "bookings_customer_id_created_at_idx" ON "bookings"("customer_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "bookings_restaurant_id_booking_date_idx" ON "bookings"("restaurant_id", "booking_date");

-- CreateIndex
CREATE INDEX "bookings_home_chef_profile_id_booking_date_idx" ON "bookings"("home_chef_profile_id", "booking_date");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");

-- CreateIndex
CREATE INDEX "reviews_restaurant_id_created_at_idx" ON "reviews"("restaurant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reviews_home_chef_profile_id_created_at_idx" ON "reviews"("home_chef_profile_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_opening_hours" ADD CONSTRAINT "restaurant_opening_hours_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_menu_items" ADD CONSTRAINT "restaurant_menu_items_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_chef_profiles" ADD CONSTRAINT "home_chef_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_chef_menu_items" ADD CONSTRAINT "home_chef_menu_items_home_chef_profile_id_fkey" FOREIGN KEY ("home_chef_profile_id") REFERENCES "home_chef_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_chef_availability" ADD CONSTRAINT "home_chef_availability_home_chef_profile_id_fkey" FOREIGN KEY ("home_chef_profile_id") REFERENCES "home_chef_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_home_chef_profile_id_fkey" FOREIGN KEY ("home_chef_profile_id") REFERENCES "home_chef_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_home_chef_menu_item_id_fkey" FOREIGN KEY ("home_chef_menu_item_id") REFERENCES "home_chef_menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_home_chef_profile_id_fkey" FOREIGN KEY ("home_chef_profile_id") REFERENCES "home_chef_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

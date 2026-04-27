-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENTE', 'INVITADO');

-- CreateEnum
CREATE TYPE "SpotType" AS ENUM ('NORMAL', 'DISABLED', 'EV_CHARGING', 'MOTORCYCLE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('HOURS', 'DAILY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MERCADO_PAGO', 'CASH', 'TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CLIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "userId" INTEGER,
    "brand" TEXT,
    "model" TEXT,
    "color" TEXT,
    "heightCm" DOUBLE PRECISION,
    "widthCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "maxHeightCm" DOUBLE PRECISION NOT NULL,
    "maxWeightKg" DOUBLE PRECISION NOT NULL,
    "maxWidthCm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_spots" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "floorId" INTEGER NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,
    "spotType" "SpotType" NOT NULL DEFAULT 'NORMAL',
    "maxWidthCm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "parking_spots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_sessions" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "spotId" INTEGER NOT NULL,
    "entryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitAt" TIMESTAMP(3),
    "totalMinutes" INTEGER,
    "amountCharged" DOUBLE PRECISION,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "paidWithSubscription" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "parking_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "SubscriptionType" NOT NULL,
    "hoursRemaining" INTEGER,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER,
    "subscriptionId" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'MERCADO_PAGO',
    "externalPaymentId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_licensePlate_key" ON "vehicles"("licensePlate");

-- CreateIndex
CREATE INDEX "vehicles_licensePlate_idx" ON "vehicles"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "parking_spots_floorId_row_column_key" ON "parking_spots"("floorId", "row", "column");

-- CreateIndex
CREATE UNIQUE INDEX "payments_sessionId_key" ON "payments"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_subscriptionId_key" ON "payments"("subscriptionId");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_spots" ADD CONSTRAINT "parking_spots_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "parking_spots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "parking_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

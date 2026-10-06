-- CreateEnum
CREATE TYPE "PublicEventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "PublicEvent" (
    "id" TEXT NOT NULL,
    "status" "PublicEventStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicEvent_status_startsAt_idx" ON "PublicEvent"("status", "startsAt");

-- CreateIndex
CREATE INDEX "PublicEvent_status_endsAt_idx" ON "PublicEvent"("status", "endsAt");

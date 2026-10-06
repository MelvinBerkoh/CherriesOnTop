-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('HOLD', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReservationKind" AS ENUM ('HOLD', 'PRIVATE_EVENT', 'PUBLIC_EVENT', 'BLOCKED');

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'HOLD',
    "eventDate" DATE NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "title" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "location" TEXT NOT NULL,
    "guestCount" INTEGER,
    "quotedTotalCents" INTEGER,
    "internalNotes" TEXT,
    "holdExpiresAt" TIMESTAMPTZ(3),
    "confirmationTokenHash" TEXT,
    "quoteRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayReservation" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "kind" "ReservationKind" NOT NULL,
    "bookingId" TEXT,
    "publicEventId" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_confirmationTokenHash_key" ON "Booking"("confirmationTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_quoteRequestId_key" ON "Booking"("quoteRequestId");

-- CreateIndex
CREATE INDEX "Booking_status_eventDate_idx" ON "Booking"("status", "eventDate");

-- CreateIndex
CREATE INDEX "Booking_status_holdExpiresAt_idx" ON "Booking"("status", "holdExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "DayReservation_date_key" ON "DayReservation"("date");

-- CreateIndex
CREATE INDEX "DayReservation_bookingId_idx" ON "DayReservation"("bookingId");

-- CreateIndex
CREATE INDEX "DayReservation_publicEventId_idx" ON "DayReservation"("publicEventId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayReservation" ADD CONSTRAINT "DayReservation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayReservation" ADD CONSTRAINT "DayReservation_publicEventId_fkey" FOREIGN KEY ("publicEventId") REFERENCES "PublicEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

import "server-only";
import { Temporal } from "@js-temporal/polyfill";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { eventTimeZone } from "@/lib/events";

export class ReservationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationError";
  }
}

export function getReservationDates(startsAt: Date, endsAt: Date): Date[] {
  if (endsAt <= startsAt) {
    throw new ReservationError("The end must be after the start.");
  }

  let day = Temporal.Instant.from(startsAt.toISOString())
    .toZonedDateTimeISO(eventTimeZone)
    .toPlainDate();
  // The end is exclusive: ending at midnight does not reserve the next day.
  const lastDay = Temporal.Instant.from(endsAt.toISOString())
    .subtract({ nanoseconds: 1 })
    .toZonedDateTimeISO(eventTimeZone)
    .toPlainDate();
  const dates: Date[] = [];

  while (Temporal.PlainDate.compare(day, lastDay) <= 0) {
    if (dates.length === 366) {
      throw new ReservationError("An event can span at most 366 calendar days.");
    }
    dates.push(new Date(`${day.toString()}T00:00:00.000Z`));
    day = day.add({ days: 1 });
  }
  return dates;
}

export async function reservationTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await db.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 15000,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2034" && attempt < 2) continue;
        if (error.code === "P2002") {
          throw new ReservationError(
            "A reservation changed while you were saving. Reload and try again.",
          );
        }
      }
      throw error;
    }
  }
  throw new ReservationError("The calendar is busy. Please try again.");
}

export async function expireHolds(tx: Prisma.TransactionClient, now: Date) {
  const expired = await tx.booking.findMany({
    where: { status: "HOLD", holdExpiresAt: { lte: now } },
    select: { id: true },
  });
  const ids = expired.map((booking) => booking.id);
  if (ids.length === 0) return;

  await tx.dayReservation.deleteMany({ where: { bookingId: { in: ids } } });
  await tx.booking.updateMany({
    where: { id: { in: ids }, status: "HOLD" },
    data: { status: "EXPIRED" },
  });
}

// Reconcile existing published events as well as the event being saved.
// A conflict aborts the whole transaction, including edits and released dates.
export async function syncPublicEventReservations(
  tx: Prisma.TransactionClient,
  now: Date,
) {
  await expireHolds(tx, now);
  const events = await tx.publicEvent.findMany({
    where: { status: "PUBLISHED", endsAt: { gt: now } },
    select: { id: true, startsAt: true, endsAt: true },
    orderBy: { id: "asc" },
  });

  await tx.dayReservation.deleteMany({
    where: { kind: "PUBLIC_EVENT", publicEventId: { not: null } },
  });

  for (const event of events) {
    for (const date of getReservationDates(event.startsAt, event.endsAt)) {
      const occupied = await tx.dayReservation.findUnique({
        where: { date },
        select: { id: true },
      });
      if (occupied) {
        throw new ReservationError(
          `${date.toISOString().slice(0, 10)} is already reserved. Choose another day. If two older public events share that day, move or cancel one first.`,
        );
      }
      await tx.dayReservation.create({
        data: { date, kind: "PUBLIC_EVENT", publicEventId: event.id },
      });
    }
  }
}


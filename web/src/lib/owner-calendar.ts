import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getCalendarMonth } from "@/lib/availability";
import { expireHolds, getReservationDates, reservationTransaction } from "@/lib/reservations";

export type OwnerCalendarItem = {
  id: string;
  kind: "HOLD" | "PRIVATE_EVENT" | "PUBLIC_EVENT" | "BLOCKED" | "COMPLETED";
  title: string; href?: string; location?: string; customerName?: string;
  startsAt?: string; endsAt?: string; holdExpiresAt?: string; notes?: string;
  updatedAt?: string; quotedTotalCents?: number;
};

export async function getOwnerCalendar(value: unknown, now = new Date()) {
  const calendar = getCalendarMonth(value, now, { pastMonths: 12, futureMonths: 24 });
  await reservationTransaction(tx => expireHolds(tx, now));
  const firstDate = new Date(`${calendar.days[0]}T00:00:00.000Z`);
  const nextDate = new Date(`${calendar.month}-01T00:00:00.000Z`);
  nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
  const dayItems = await db.$transaction(async tx => {
    const bookings = await tx.booking.findMany({
      where: { startsAt: { lt: calendar.endsAt }, endsAt: { gt: calendar.startsAt }, status: { in: ["HOLD", "CONFIRMED", "COMPLETED"] } },
      select: { id: true, status: true, title: true, eventDate: true, startsAt: true, endsAt: true, customerName: true, location: true,
        internalNotes: true, holdExpiresAt: true, quoteRequestId: true, quotedTotalCents: true },
      orderBy: [{ eventDate: "asc" }, { id: "asc" }],
    });
    const events = await tx.publicEvent.findMany({
      where: { status: "PUBLISHED", startsAt: { lt: calendar.endsAt }, endsAt: { gt: calendar.startsAt } },
      select: { id: true, title: true, startsAt: true, endsAt: true, location: true }, orderBy: [{ startsAt: "asc" }, { id: "asc" }],
    });
    const blocks = await tx.dayReservation.findMany({
      where: { kind: "BLOCKED", date: { gte: firstDate, lt: nextDate } },
      select: { id: true, date: true, internalNotes: true, updatedAt: true }, orderBy: { date: "asc" },
    });
    const items: Record<string, OwnerCalendarItem[]> = {};
    const add = (date: string, item: OwnerCalendarItem) => { if (calendar.days.includes(date)) (items[date] ??= []).push(item); };
    for (const booking of bookings) {
      const item: OwnerCalendarItem = {
        id: booking.id, kind: booking.status === "HOLD" ? "HOLD" : booking.status === "COMPLETED" ? "COMPLETED" : "PRIVATE_EVENT",
        title: booking.title, customerName: booking.customerName, location: booking.location,
        startsAt: booking.startsAt.toISOString(), endsAt: booking.endsAt.toISOString(), holdExpiresAt: booking.holdExpiresAt?.toISOString(),
        notes: booking.internalNotes ?? undefined, quotedTotalCents: booking.quotedTotalCents ?? undefined,
        href: booking.quoteRequestId ? `/owner/quotes/${booking.quoteRequestId}/booking` : undefined,
      };
      for (const date of getReservationDates(booking.startsAt, booking.endsAt)) add(date.toISOString().slice(0, 10), item);
    }
    for (const event of events) for (const date of getReservationDates(event.startsAt, event.endsAt)) add(date.toISOString().slice(0, 10), {
      id: event.id, kind: "PUBLIC_EVENT", title: event.title, location: event.location,
      startsAt: event.startsAt.toISOString(), endsAt: event.endsAt.toISOString(), href: `/owner/events/${event.id}/edit`,
    });
    for (const block of blocks) add(block.date.toISOString().slice(0, 10), {
      id: block.id, kind: "BLOCKED", title: "Manually blocked", notes: block.internalNotes ?? undefined, updatedAt: block.updatedAt.toISOString(),
    });
    return items;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  return { today: calendar.today, month: calendar.month, previous: calendar.previous, next: calendar.next, offset: calendar.offset, days: calendar.days, dayItems };
}

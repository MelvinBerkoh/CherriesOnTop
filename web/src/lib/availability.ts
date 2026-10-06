import "server-only";
import { Temporal } from "@js-temporal/polyfill";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { eventTimeZone } from "@/lib/events";
import { getEarliestBookingDate, formatBookingCutoff } from "@/lib/booking-lead-time";
import { getReservationDates } from "@/lib/reservations";

export function getCalendarMonth(value: unknown, now = new Date()) {
  const today = Temporal.Instant.from(now.toISOString())
    .toZonedDateTimeISO(eventTimeZone).toPlainDate();
  const first = today.with({ day: 1 });
  const last = first.add({ months: 12 });
  let month = first;
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) {
    try {
      const candidate = Temporal.PlainDate.from(`${value}-01`);
      if (Temporal.PlainDate.compare(candidate, first) >= 0 &&
        Temporal.PlainDate.compare(candidate, last) <= 0) month = candidate;
    } catch { /* Invalid month falls back to the current month. */ }
  }
  const monthKey = (date: Temporal.PlainDate) => date.toString().slice(0, 7);
  const instant = (date: Temporal.PlainDate) => new Date(date.toZonedDateTime(eventTimeZone).epochMilliseconds);
  return {
    today: today.toString(),
    month: monthKey(month),
    previous: Temporal.PlainDate.compare(month, first) > 0 ? monthKey(month.subtract({ months: 1 })) : null,
    next: Temporal.PlainDate.compare(month, last) < 0 ? monthKey(month.add({ months: 1 })) : null,
    offset: month.dayOfWeek % 7,
    days: Array.from({ length: month.daysInMonth }, (_, index) => month.with({ day: index + 1 }).toString()),
    startsAt: instant(month),
    endsAt: instant(month.add({ months: 1 })),
    todayStartsAt: instant(today),
  };
}

type PublicCalendarEvent = {
  id: string; title: string; description: string; location: string;
  address: string; startsAt: string; endsAt: string;
};
export type CalendarDayDetail =
  | { kind: "public"; events: PublicCalendarEvent[] }
  | { kind: "private" }
  | { kind: "blocked" };

// Private dates expose only a generic label. Never select customer or booking details.
export async function getPublicAvailability(value: unknown, now = new Date()) {
  const calendar = getCalendarMonth(value, now);
  const firstDate = new Date(`${calendar.days[0]}T00:00:00.000Z`);
  const nextDate = new Date(`${calendar.month}-01T00:00:00.000Z`);
  nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
  const snapshot = await db.$transaction(async tx => {
    const reserved = await tx.dayReservation.findMany({
      where: {
        date: { gte: firstDate, lt: nextDate },
        OR: [
          { kind: "BLOCKED" },
          {
            kind: { in: ["HOLD", "PRIVATE_EVENT"] },
            booking: { is: { OR: [
              { status: { in: ["CONFIRMED", "COMPLETED"] } },
              { status: "HOLD", OR: [{ holdExpiresAt: { gt: now } }, { holdExpiresAt: null }] },
            ] } },
          },
        ],
      },
      select: { date: true, kind: true },
    });
    // Read published events directly so older events are covered before backfill.
    const publicEvents = await tx.publicEvent.findMany({
      where: {
        status: "PUBLISHED",
        startsAt: { lt: calendar.endsAt },
        endsAt: { gt: calendar.startsAt },
      },
      select: { id: true, title: true, description: true, location: true, address: true, startsAt: true, endsAt: true },
    });
    const dates = new Set(reserved.map(item => item.date.toISOString().slice(0, 10)));
    const dayDetails: Record<string, CalendarDayDetail> = {};
    for (const item of reserved) {
      dayDetails[item.date.toISOString().slice(0, 10)] = { kind: item.kind === "BLOCKED" ? "blocked" : "private" };
    }
    for (const event of publicEvents) {
      const published = { ...event, startsAt: event.startsAt.toISOString(), endsAt: event.endsAt.toISOString() };
      for (const date of getReservationDates(event.startsAt, event.endsAt)) {
        const key = date.toISOString().slice(0, 10);
        if (key >= calendar.days[0] && key <= calendar.days.at(-1)!) {
          dates.add(key);
          const existing = dayDetails[key];
          // A legacy conflict must never reveal private details alongside a public event.
          if (existing && existing.kind !== "public") continue;
          dayDetails[key] = { kind: "public", events: [...(existing?.events ?? []), published] };
        }
      }
    }
    return { unavailable: [...dates].sort(), dayDetails };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  return {
    today: calendar.today, earliestDate: getEarliestBookingDate(now),
    earliestStart: formatBookingCutoff(now), month: calendar.month, previous: calendar.previous,
    next: calendar.next, offset: calendar.offset, days: calendar.days, unavailable: snapshot.unavailable, dayDetails: snapshot.dayDetails,
  };
}

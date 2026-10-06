import "server-only";
import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";
import { eventTimeZone } from "@/lib/events";
import {
  getReservationDates,
  ReservationError,
  reservationTransaction,
  syncPublicEventReservations,
} from "@/lib/reservations";

const detailsSchema = z.object({
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  endsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  location: z.string().trim().min(3).max(300),
  guestCount: z.coerce.number().int().min(1).max(10000),
  quotedTotal: z.string().trim().refine(
    (value) => value === "" || /^\d{1,7}(\.\d{1,2})?$/.test(value),
    "Enter a valid dollar amount with at most two decimal places.",
  ),
  internalNotes: z.string().trim().max(2000),
  holdHours: z.enum(["24", "48", "72"]),
});

export type BookingCommand = {
  quoteId: string;
  quoteUpdatedAt: string;
  bookingUpdatedAt: string;
  intent: "HOLD" | "CONFIRM" | "CANCEL";
  details: Record<string, unknown>;
};

function localTime(value: string) {
  try {
    return new Date(Temporal.PlainDateTime.from(value)
      .toZonedDateTime(eventTimeZone, { disambiguation: "reject" })
      .epochMilliseconds);
  } catch {
    throw new ReservationError(
      "Choose valid New Jersey dates and times. Missing or repeated daylight-saving hours cannot be used.",
    );
  }
}

export async function saveQuoteBooking(command: BookingCommand) {
  const details = command.intent === "CANCEL"
    ? null
    : detailsSchema.safeParse(command.details);
  if (details && !details.success) {
    throw new ReservationError(
      "Check the dates, location, guest count, price, and notes. Choose a 24, 48, or 72 hour hold.",
    );
  }
  const values = details?.success ? details.data : null;
  const startsAt = values ? localTime(values.startsAt) : null;
  const endsAt = values ? localTime(values.endsAt) : null;
  const dates = startsAt && endsAt ? getReservationDates(startsAt, endsAt) : [];
  if (dates.length > 1) {
    throw new ReservationError("Private bookings must fit within one New Jersey calendar day.");
  }

  await reservationTransaction(async (tx) => {
    const now = new Date();
    // Include older published events before considering a private date free.
    await syncPublicEventReservations(tx, now);
    const quote = await tx.quoteRequest.findUnique({
      where: { id: command.quoteId },
      include: { booking: true },
    });
    if (!quote || quote.updatedAt.toISOString() !== command.quoteUpdatedAt ||
      (quote.booking?.updatedAt.toISOString() ?? "") !== command.bookingUpdatedAt) {
      throw new ReservationError("This request or booking changed. Reload before saving again.");
    }
    const current = quote.booking;
    if (current?.status === "COMPLETED") {
      throw new ReservationError("A completed booking cannot be changed here.");
    }

    if (command.intent === "CANCEL") {
      if (!current || !["HOLD", "CONFIRMED"].includes(current.status)) {
        throw new ReservationError("There is no active booking to cancel.");
      }
      await tx.dayReservation.deleteMany({ where: { bookingId: current.id } });
      await tx.booking.update({ where: { id: current.id }, data: { status: "CANCELLED", holdExpiresAt: null } });
      await tx.quoteRequest.update({ where: { id: quote.id }, data: { status: "QUOTED", updatedAt: now } });
      return;
    }

    if (quote.status === "CLOSED") {
      throw new ReservationError("Reopen this request before creating a booking.");
    }
    if (current?.status === "CONFIRMED") {
      throw new ReservationError("This booking is already confirmed. Cancel it before changing its date or details.");
    }
    if (!values || !startsAt || !endsAt || startsAt <= now) {
      throw new ReservationError("Choose a start time in the future.");
    }

    if (current) {
      await tx.dayReservation.deleteMany({ where: { bookingId: current.id } });
    }
    const date = dates[0];
    const occupied = await tx.dayReservation.findUnique({ where: { date }, select: { id: true } });
    if (occupied) {
      throw new ReservationError(`${date.toISOString().slice(0, 10)} is already reserved. Choose another day.`);
    }

    const confirmed = command.intent === "CONFIRM";
    const holdExpiresAt = confirmed ? null : new Date(Math.min(
      now.getTime() + Number(values.holdHours) * 60 * 60 * 1000,
      startsAt.getTime(),
    ));
    const data = {
      status: confirmed ? "CONFIRMED" as const : "HOLD" as const,
      eventDate: date,
      startsAt,
      endsAt,
      title: `${quote.eventType} · ${quote.name}`,
      customerName: quote.name,
      customerEmail: quote.email,
      customerPhone: quote.phone,
      location: values.location,
      guestCount: values.guestCount,
      quotedTotalCents: values.quotedTotal === "" ? null : Math.round(Number(values.quotedTotal) * 100),
      internalNotes: values.internalNotes || null,
      holdExpiresAt,
    };
    const booking = current
      ? await tx.booking.update({ where: { id: current.id }, data })
      : await tx.booking.create({ data: { ...data, quoteRequestId: quote.id } });
    await tx.dayReservation.create({
      data: { date, kind: confirmed ? "PRIVATE_EVENT" : "HOLD", bookingId: booking.id },
    });
    await tx.quoteRequest.update({
      where: { id: quote.id },
      data: { status: confirmed ? "BOOKED" : "QUOTED", updatedAt: now },
    });
  });
}

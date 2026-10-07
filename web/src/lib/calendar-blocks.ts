import "server-only";
import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";
import { getTodayInNewJersey } from "@/lib/quote-request";
import { ReservationError, reservationTransaction, syncPublicEventReservations } from "@/lib/reservations";

const commandSchema = z.object({
  intent: z.enum(["BLOCK", "UNBLOCK"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
    try { return Temporal.PlainDate.from(value).toString() === value; } catch { return false; }
  }),
  notes: z.string().trim().max(2000),
  reservationId: z.string().max(128),
  updatedAt: z.union([z.literal(""), z.iso.datetime()]),
});

export async function saveCalendarBlock(input: unknown) {
  const parsed = commandSchema.safeParse(input);
  if (!parsed.success) throw new ReservationError("Reload the calendar and check your notes before saving.");
  const command = parsed.data;
  const date = new Date(`${command.date}T00:00:00.000Z`);
  await reservationTransaction(async tx => {
    const now = new Date();
    if (command.intent === "BLOCK" && command.date < getTodayInNewJersey(now)) {
      throw new ReservationError("Choose today or a future date to block.");
    }
    await syncPublicEventReservations(tx, now);
    const reservation = await tx.dayReservation.findUnique({ where: { date } });
    if (command.intent === "BLOCK") {
      if (reservation) throw new ReservationError("This day is already reserved. Manage its booking or public event instead.");
      if (command.reservationId || command.updatedAt) throw new ReservationError("This day changed. Reload the calendar before saving.");
      await tx.dayReservation.create({ data: { date, kind: "BLOCKED", internalNotes: command.notes || null } });
      return;
    }
    if (!reservation || reservation.kind !== "BLOCKED" || reservation.id !== command.reservationId || reservation.updatedAt.toISOString() !== command.updatedAt) {
      throw new ReservationError("This block changed or was removed. Reload the calendar before trying again.");
    }
    await tx.dayReservation.delete({ where: { id: reservation.id } });
  });
}

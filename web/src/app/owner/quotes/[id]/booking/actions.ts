"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { saveQuoteBooking } from "@/lib/bookings";
import { requireOwner } from "@/lib/owner-session";
import { ReservationError } from "@/lib/reservations";

export type BookingActionState = { status: "idle" | "error"; message: string };

export async function manageQuoteBooking(
  _state: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  await requireOwner();
  const identity = z.object({
    quoteId: z.string().min(1).max(128),
    quoteUpdatedAt: z.iso.datetime(),
    bookingUpdatedAt: z.union([z.literal(""), z.iso.datetime()]),
    intent: z.enum(["HOLD", "CONFIRM", "CANCEL"]),
  }).safeParse(Object.fromEntries(formData));
  if (!identity.success) {
    return { status: "error", message: "Reload the booking page and try again." };
  }
  try {
    await saveQuoteBooking({ ...identity.data, details: Object.fromEntries(formData) });
  } catch (error) {
    console.error("Booking save failed:", error instanceof Error ? error.name : "UnknownError");
    return {
      status: "error",
      message: error instanceof ReservationError ? error.message : "Could not save the booking. Please try again.",
    };
  }
  revalidatePath("/owner");
  revalidatePath("/owner/events");
  revalidatePath("/events");
  revalidatePath(`/owner/quotes/${identity.data.quoteId}`);
  revalidatePath(`/owner/quotes/${identity.data.quoteId}/booking`);
  redirect(`/owner/quotes/${identity.data.quoteId}/booking`);
}

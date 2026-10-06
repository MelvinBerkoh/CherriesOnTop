"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/owner-session";
import { quoteStatuses, type QuoteStatusState } from "@/lib/quote-status";
import { ReservationError, reservationTransaction } from "@/lib/reservations";

const editableStatuses = quoteStatuses.filter(status => status !== "BOOKED");
const updateSchema = z.object({
  id: z.string().min(1).max(128),
  status: z.enum(editableStatuses),
  updatedAt: z.iso.datetime(),
});

export async function updateQuoteStatus(
  _previousState: QuoteStatusState,
  formData: FormData,
): Promise<QuoteStatusState> {
  await requireOwner();
  const result = updateSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { status: "error", message: "Choose a valid status. Use the booking page to confirm a booking." };
  }
  let updatedAt: Date;
  try {
    updatedAt = await reservationTransaction(async tx => {
      const quote = await tx.quoteRequest.findUnique({
        where: { id: result.data.id },
        include: { booking: { select: { status: true, holdExpiresAt: true } } },
      });
      if (!quote || quote.updatedAt.toISOString() !== result.data.updatedAt) {
        throw new ReservationError("This request changed. Reload before saving again.");
      }
      const activeHold = quote.booking?.status === "HOLD" &&
        (!quote.booking.holdExpiresAt || quote.booking.holdExpiresAt > new Date());
      if (activeHold || quote.booking?.status === "CONFIRMED") {
        throw new ReservationError("Manage or cancel the active booking on the booking page first.");
      }
      const saved = await tx.quoteRequest.update({
        where: { id: quote.id },
        data: { status: result.data.status, updatedAt: new Date() },
      });
      return saved.updatedAt;
    });
  } catch (error) {
    console.error("Quote status save failed:", error instanceof Error ? error.name : "UnknownError");
    return {
      status: "error",
      message: error instanceof ReservationError ? error.message : "Could not save the status. Please try again.",
    };
  }
  revalidatePath("/owner");
  revalidatePath(`/owner/quotes/${result.data.id}`);
  revalidatePath(`/owner/quotes/${result.data.id}/booking`);
  return { status: "success", message: "Status saved.", updatedAt: updatedAt.toISOString() };
}

"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/owner-session";
import { saveCalendarBlock } from "@/lib/calendar-blocks";
import { ReservationError } from "@/lib/reservations";
export type CalendarBlockState = { status: "idle" | "error"; message: string };
export async function manageCalendarBlock(_state: CalendarBlockState, formData: FormData): Promise<CalendarBlockState> {
  await requireOwner();
  try { await saveCalendarBlock(Object.fromEntries(formData)); }
  catch (error) {
    console.error("Calendar block save failed:", error instanceof Error ? error.name : "UnknownError");
    return { status: "error", message: error instanceof ReservationError ? error.message : "Could not update this date. Please try again." };
  }
  const date = String(formData.get("date"));
  revalidatePath("/owner/calendar"); revalidatePath("/availability"); revalidatePath("/owner/events");
  redirect(`/owner/calendar?month=${date.slice(0, 7)}&day=${date}#day-details`);
}

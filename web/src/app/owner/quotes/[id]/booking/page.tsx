import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/owner/booking-form";
import { db } from "@/lib/db";
import { toEventLocalInput } from "@/lib/event-time";
import { requireOwner } from "@/lib/owner-session";
import { expireHolds, reservationTransaction } from "@/lib/reservations";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Private Booking | Cherries On Top",
  robots: { index: false, follow: false },
};
const timeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York",
});
const labels = { HOLD: "On hold", CONFIRMED: "Confirmed", CANCELLED: "Cancelled", EXPIRED: "Hold expired", COMPLETED: "Completed" };

export default async function QuoteBookingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireOwner();
  const { id } = await params;
  if (id.length > 128) notFound();
  await reservationTransaction(tx => expireHolds(tx, new Date()));
  const quote = await db.quoteRequest.findUnique({ where: { id }, include: { booking: true } });
  if (!quote) notFound();
  const booking = quote.booking;
  const day = quote.eventDate.toISOString().slice(0, 10);
  const preferred = quote.preferredTime && /^\d{2}:\d{2}$/.test(quote.preferredTime) ? quote.preferredTime : "13:00";

  return (
    <main id="main-content" className={`container ${styles.page}`}>
      <Link className="text-link" href={`/owner/quotes/${id}`}>← Back to request</Link>
      <h1>Private booking</h1>
      <p>{quote.name} · {quote.eventType}</p>
      <section className={styles.panel}>
        <h2>{booking ? labels[booking.status] : "No date reserved yet"}</h2>
        {booking && <p>{timeFormat.format(booking.startsAt)} – {timeFormat.format(booking.endsAt)} · New Jersey</p>}
        {booking?.status === "HOLD" && booking.holdExpiresAt && <p>Hold expires {timeFormat.format(booking.holdExpiresAt)} · New Jersey</p>}
        {!booking && quote.status === "BOOKED" && <p>This request was marked Booked using the older status control. Confirm a booking here to reserve its day.</p>}
        <BookingForm
          key={`${quote.updatedAt.toISOString()}-${booking?.updatedAt.toISOString() ?? "new"}`}
          quoteId={id}
          quoteUpdatedAt={quote.updatedAt.toISOString()}
          bookingUpdatedAt={booking?.updatedAt.toISOString() ?? ""}
          bookingStatus={booking?.status ?? null}
          values={{
            startsAt: booking ? toEventLocalInput(booking.startsAt) : `${day}T${preferred}`,
            endsAt: booking ? toEventLocalInput(booking.endsAt) : `${day}T16:00`,
            location: booking?.location ?? quote.location,
            guestCount: booking?.guestCount ?? quote.guestCount,
            quotedTotal: booking?.quotedTotalCents != null ? (booking.quotedTotalCents / 100).toFixed(2) : "",
            internalNotes: booking?.internalNotes ?? "",
          }}
        />
      </section>
    </main>
  );
}

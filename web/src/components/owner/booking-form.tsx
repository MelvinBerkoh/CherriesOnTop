"use client";

import { useActionState } from "react";
import { manageQuoteBooking, type BookingActionState } from "@/app/owner/quotes/[id]/booking/actions";
import styles from "@/app/owner/quotes/[id]/booking/page.module.css";

export type BookingFormValues = {
  startsAt: string;
  endsAt: string;
  location: string;
  guestCount: number;
  quotedTotal: string;
  internalNotes: string;
};

export function BookingForm({
  quoteId, quoteUpdatedAt, bookingUpdatedAt, bookingStatus, values,
}: {
  quoteId: string;
  quoteUpdatedAt: string;
  bookingUpdatedAt: string;
  bookingStatus: string | null;
  values: BookingFormValues;
}) {
  const initialState: BookingActionState = { status: "idle", message: "" };
  const [state, action, pending] = useActionState(manageQuoteBooking, initialState);
  const confirmed = bookingStatus === "CONFIRMED";
  const completed = bookingStatus === "COMPLETED";
  const active = confirmed || bookingStatus === "HOLD";

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="quoteId" value={quoteId} />
      <input type="hidden" name="quoteUpdatedAt" value={quoteUpdatedAt} />
      <input type="hidden" name="bookingUpdatedAt" value={bookingUpdatedAt} />
      <fieldset disabled={pending || confirmed || completed}>
        <legend>Agreed event details</legend>
        <label htmlFor="booking-start">Start · New Jersey time</label>
        <input id="booking-start" name="startsAt" type="datetime-local" defaultValue={values.startsAt} required />
        <label htmlFor="booking-end">End · New Jersey time</label>
        <input id="booking-end" name="endsAt" type="datetime-local" defaultValue={values.endsAt} required />
        <label htmlFor="booking-location">Venue or address</label>
        <input id="booking-location" name="location" defaultValue={values.location} minLength={3} maxLength={300} required />
        <label htmlFor="booking-guests">Guests</label>
        <input id="booking-guests" name="guestCount" type="number" defaultValue={values.guestCount} min={1} max={10000} required />
        <label htmlFor="booking-price">Agreed price · USD, optional</label>
        <input id="booking-price" name="quotedTotal" type="number" defaultValue={values.quotedTotal} min={0} max={9999999.99} step="0.01" />
        <label htmlFor="booking-notes">Internal notes</label>
        <textarea id="booking-notes" name="internalNotes" defaultValue={values.internalNotes} maxLength={2000} rows={4} />
        <label htmlFor="booking-hold">Hold duration</label>
        <select id="booking-hold" name="holdHours" defaultValue="24">
          <option value="24">24 hours</option>
          <option value="48">48 hours</option>
          <option value="72">72 hours</option>
        </select>
      </fieldset>
      <p>One event per New Jersey day. A hold blocks the whole day and expires no later than the event start.</p>
      <div className={styles.buttons}>
        {!confirmed && !completed && <>
          <button className="button" name="intent" value="HOLD" disabled={pending}>
            {bookingStatus === "HOLD" ? "Update hold" : "Hold date"}
          </button>
          <button className="button" name="intent" value="CONFIRM" disabled={pending}>Confirm booking</button>
        </>}
        {active && <button className="button" name="intent" value="CANCEL" formNoValidate disabled={pending}>Cancel booking and release date</button>}
      </div>
      {pending && <p role="status">Saving…</p>}
      {state.message && <p role="alert">{state.message}</p>}
      <p>Customer details stay private. These actions do not send email or collect payment.</p>
    </form>
  );
}

"use client";
import { useActionState } from "react";
import { manageCalendarBlock, type CalendarBlockState } from "@/app/owner/calendar/actions";
import styles from "@/app/owner/calendar/page.module.css";
export function CalendarBlockForm({ date, block }: { date: string; block?: { id: string; updatedAt: string; notes?: string } }) {
  const initial: CalendarBlockState = { status: "idle", message: "" };
  const [state, action, pending] = useActionState(manageCalendarBlock, initial);
  return <form action={action} className={styles.form}>
    <input type="hidden" name="date" value={date} /><input type="hidden" name="reservationId" value={block?.id ?? ""} />
    <input type="hidden" name="updatedAt" value={block?.updatedAt ?? ""} />
    {block ? <><input type="hidden" name="notes" value="" /><p>Removing this manual block reopens the day for booking requests.</p></> : <>
      <label htmlFor="block-notes">Private reason or notes · optional</label>
      <textarea id="block-notes" name="notes" rows={3} maxLength={2000} placeholder="Maintenance, time off, travel…" disabled={pending} />
      <p>Visitors will see only that the trailer is unavailable.</p>
    </>}
    <button className="button" name="intent" value={block ? "UNBLOCK" : "BLOCK"} disabled={pending}>{pending ? "Saving…" : block ? "Remove block" : "Block this day"}</button>
    {state.message && <p role="alert">{state.message}</p>}
  </form>;
}

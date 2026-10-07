"use client";

import { useActionState, useState } from "react";
import { deletePublicEvent } from "@/app/owner/events/actions";
import { initialEventState } from "@/lib/event-form";
import styles from "@/app/owner/events/events.module.css";

export function EventDeleteForm({ id, title, updatedAt }: { id: string; title: string; updatedAt: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(deletePublicEvent, initialEventState);
  return (
    <section className={styles.deleteSection} aria-labelledby="delete-heading">
      <h2 id="delete-heading">Delete event</h2>
      <p>Remove this public event and release its reserved dates. Choose Cancelled above if you want to keep its record.</p>
      {!confirming ? <button type="button" className={styles.deleteButton} onClick={() => setConfirming(true)}>Delete event</button> : (
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="updatedAt" value={updatedAt} />
          <input type="hidden" name="confirmed" value="yes" />
          <p className={styles.deleteWarning}>Permanently delete “{title}”? This cannot be undone.</p>
          <div className={styles.deleteActions}>
            <button type="button" className="button" disabled={pending} onClick={() => setConfirming(false)} autoFocus>Keep event</button>
            <button type="submit" className={styles.deleteButton} disabled={pending}>{pending ? "Deleting…" : "Yes, delete event"}</button>
          </div>
          {state.message && <p role="alert" className={styles.error}>{state.message}</p>}
        </form>
      )}
    </section>
  );
}

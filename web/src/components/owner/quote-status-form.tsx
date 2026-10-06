"use client";

import { useActionState, useState } from "react";
import { updateQuoteStatus } from "@/app/owner/quotes/[id]/actions";
import {
  quoteStatuses,
  quoteStatusLabels,
  type QuoteStatus,
  type QuoteStatusState,
} from "@/lib/quote-status";
import styles from "@/app/owner/quotes/[id]/page.module.css";

const initialState: QuoteStatusState = {
  status: "idle",
  message: "",
};

export function QuoteStatusForm({
  id,
  initialStatus,
  updatedAt,
}: {
  id: string;
  initialStatus: QuoteStatus;
  updatedAt: string;
}) {
  const [state, action, pending] = useActionState(
    updateQuoteStatus,
    initialState,
  );

  const [selectedStatus, setSelectedStatus] =
    useState<QuoteStatus>(initialStatus);

  return (
    <form action={action} className={styles.statusForm}>
      <input type="hidden" name="id" value={id} />
      <input
        type="hidden"
        name="updatedAt"
        value={state.updatedAt ?? updatedAt}
      />

      <label htmlFor="quote-status">Request status</label>
      <select
        id="quote-status"
        name="status"
        value={selectedStatus}
        disabled={pending}
        onChange={(event) =>
          setSelectedStatus(
            event.currentTarget.value as QuoteStatus,
          )
        }
      >
        {quoteStatuses.map((status) => (
          <option key={status} value={status}>
            {quoteStatusLabels[status]}
          </option>
        ))}
      </select>

      <button
        className="button"
        type="submit"
        disabled={pending}
      >
        {pending ? "Saving…" : "Save status"}
      </button>

      {state.message && (
        <p role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      )}

      <p className={styles.note}>
        This changes the internal request status. It does not
        send an email or confirm a booking with the customer.
      </p>
    </form>
  );
}
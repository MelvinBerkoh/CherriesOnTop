"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createPublicEvent,
  updatePublicEvent,
} from "@/app/owner/events/actions";
import {
  eventStatuses,
  eventStatusLabels,
  initialEventState,
  type EventField,
  type EventFormValues,
} from "@/lib/event-form";
import styles from "@/app/owner/events/events.module.css";

const fields: {
  name: EventField;
  label: string;
  type: "text" | "datetime-local";
  maxLength?: number;
}[] = [
  {
    name: "title",
    label: "Event title",
    type: "text",
    maxLength: 120,
  },
  {
    name: "location",
    label: "Venue name or town",
    type: "text",
    maxLength: 150,
  },
  {
    name: "address",
    label: "Full address",
    type: "text",
    maxLength: 300,
  },
  {
    name: "startsAt",
    label: "Starts · New Jersey time",
    type: "datetime-local",
  },
  {
    name: "endsAt",
    label: "Ends · New Jersey time",
    type: "datetime-local",
  },
];

export function EventForm({
  id,
  updatedAt,
  initialValues,
}: {
  id?: string;
  updatedAt?: string;
  initialValues?: EventFormValues;
}) {
  const [state, action, pending] = useActionState(
    id ? updatePublicEvent : createPublicEvent,
    initialEventState,
  );

  const [values, setValues] = useState<EventFormValues>(
    initialValues ?? {
      title: "",
      description: "",
      location: "",
      address: "",
      startsAt: "",
      endsAt: "",
      status: "DRAFT",
    },
  );

  const errorBanner = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.status === "error") {
      errorBanner.current?.focus();
    }
  }, [state]);

  const update = (name: EventField, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const error = (name: EventField) =>
    state.fieldErrors?.[name]?.[0];

  return (
    <form action={action} className={styles.form}>
      {id && (
        <input type="hidden" name="id" value={id} />
      )}
      {updatedAt && (
        <input
          type="hidden"
          name="updatedAt"
          value={updatedAt}
        />
      )}

      {state.message && (
        <p
          ref={errorBanner}
          tabIndex={-1}
          role="alert"
          className={styles.error}
        >
          {state.message}
        </p>
      )}

      <fieldset disabled={pending}>
        <legend className="sr-only">
          Public event details
        </legend>

        {fields.map((field) => (
          <div className={styles.field} key={field.name}>
            <label htmlFor={`event-${field.name}`}>
              {field.label}
            </label>

            <input
              name={field.name}
              type={field.type}
              maxLength={field.maxLength}
              id={`event-${field.name}`}
              required
              value={values[field.name]}
              onChange={(event) =>
                update(field.name, event.currentTarget.value)
              }
              aria-invalid={Boolean(error(field.name))}
              aria-describedby={
                error(field.name)
                  ? `error-${field.name}`
                  : undefined
              }
            />

            {error(field.name) && (
              <p
                id={`error-${field.name}`}
                className={styles.error}
              >
                {error(field.name)}
              </p>
            )}
          </div>
        ))}

        <div className={styles.field}>
          <label htmlFor="event-description">
            Public description
          </label>

          <textarea
            id="event-description"
            name="description"
            rows={5}
            required
            maxLength={2000}
            value={values.description}
            onChange={(event) =>
              update("description", event.currentTarget.value)
            }
            aria-invalid={Boolean(error("description"))}
            aria-describedby={
              error("description")
                ? "error-description"
                : undefined
            }
          />

          {error("description") && (
            <p
              id="error-description"
              className={styles.error}
            >
              {error("description")}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="event-status">Status</label>

          <select
            id="event-status"
            name="status"
            value={values.status}
            onChange={(event) =>
              update("status", event.currentTarget.value)
            }
            aria-invalid={Boolean(error("status"))}
            aria-describedby="event-status-help"
          >
            {eventStatuses.map((status) => (
              <option key={status} value={status}>
                {eventStatusLabels[status]}
              </option>
            ))}
          </select>

          <p id="event-status-help" className={styles.note}>
            Drafts stay private. Published events appear on the
            public schedule until they end. Cancelled events
            are hidden.
          </p>

          {error("status") && (
            <p className={styles.error}>{error("status")}</p>
          )}
        </div>

        <p className={styles.note}>
          Enter every time in New Jersey local time, even if
          you are travelling.
        </p>

        <button
          className="button"
          type="submit"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save event"}
        </button>
      </fieldset>
    </form>
  );
}
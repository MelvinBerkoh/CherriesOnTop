"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { submitQuoteRequest } from "@/app/(marketing)/quote/actions";
import {
  getPackageEstimate,
  type CateringPackage,
} from "@/lib/packages";
import {
  initialQuoteState,
  type QuoteField,
  type QuoteFormValues,
} from "@/lib/quote-request";
import styles from "./quote-form.module.css";

type InputProps = {
  name: QuoteField;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "date" | "time" | "number";
  required?: boolean;
  autoComplete?: string;
  min?: string | number;
  max?: number;
  maxLength?: number;
  error?: string;
};

function InputField({
  label,
  error,
  onChange,
  type = "text",
  ...props
}: InputProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={`quote-${props.name}`}>
        {label}
        {!props.required && <span> (optional)</span>}
      </label>

      <input
        {...props}
        id={`quote-${props.name}`}
        type={type}
        onChange={(event) => onChange(event.currentTarget.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `error-${props.name}` : undefined
        }
      />

      {error && (
        <p
          id={`error-${props.name}`}
          className={styles.fieldError}
        >
          {error}
        </p>
      )}
    </div>
  );
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type QuoteFormProps = {
  packages: CateringPackage[];
  eventTypes: readonly string[];
  minDate: string;
  initialPackageId: string;
  initialGuests: string;
};

export function QuoteForm({
  packages,
  eventTypes,
  minDate,
  initialPackageId,
  initialGuests,
}: QuoteFormProps) {
  const [state, formAction, pending] = useActionState(
    submitQuoteRequest,
    initialQuoteState,
  );

  const [values, setValues] = useState<QuoteFormValues>({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    preferredTime: "",
    location: "",
    guestCount: initialGuests,
    packageId: initialPackageId,
    message: "",
  });

  const resultMessage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "idle") {
      resultMessage.current?.focus();
    }
  }, [state]);

  const selected = packages.find(
    (item) => item.id === values.packageId,
  );
  const guests = Number(values.guestCount);
  const estimate = selected
    ? getPackageEstimate(selected, guests)
    : null;

  const error = (name: QuoteField) =>
    state.fieldErrors?.[name]?.[0];

  const update = (name: QuoteField, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const input = (name: QuoteField, label: string) => ({
    name,
    label,
    value: values[name],
    onChange: (value: string) => update(name, value),
    error: error(name),
  });

  if (state.status === "success") {
    return (
      <div
        ref={resultMessage}
        tabIndex={-1}
        role="status"
        className={styles.success}
      >
        <p className="eyebrow">Request received</p>
        <h2>Thanks, {values.name.trim().split(/\s+/)[0]}.</h2>
        <p>{state.message}</p>
        <p>
          This is a quote request. Your date and booking are
          confirmed separately.
        </p>
        <p className={styles.reference}>
          Request reference: <code>{state.reference}</code>
        </p>
        <Link className="button" href="/">
          Back to Cherries On Top
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <form action={formAction} className={styles.form}>
        {state.status === "error" && (
          <div
            ref={resultMessage}
            tabIndex={-1}
            role="alert"
            className={styles.formError}
          >
            {state.message}
          </div>
        )}

        <fieldset disabled={pending} className={styles.fields}>
          <legend className="sr-only">
            Quote request details
          </legend>

          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="quote-website">
              Leave this blank
            </label>
            <input
              id="quote-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <section
            className={styles.section}
            aria-labelledby="contact-details-heading"
          >
            <p className="eyebrow">01 · A little introduction</p>
            <h2 id="contact-details-heading">
              How can we reach you?
            </h2>

            <div className={styles.grid}>
              <InputField
                {...input("name", "Your name")}
                required
                autoComplete="name"
                maxLength={100}
              />
              <InputField
                {...input("email", "Email address")}
                type="email"
                required
                autoComplete="email"
                maxLength={254}
              />
              <InputField
                {...input("phone", "Phone number")}
                type="tel"
                autoComplete="tel"
                maxLength={40}
              />
            </div>
          </section>

          <section
            className={styles.section}
            aria-labelledby="event-details-heading"
          >
            <p className="eyebrow">02 · The occasion</p>
            <h2 id="event-details-heading">
              Tell us about your event.
            </h2>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="quote-eventType">
                  Event type
                </label>
                <select
                  id="quote-eventType"
                  name="eventType"
                  required
                  value={values.eventType}
                  onChange={(event) =>
                    update("eventType", event.currentTarget.value)
                  }
                  aria-invalid={Boolean(error("eventType"))}
                  aria-describedby={
                    error("eventType")
                      ? "error-eventType"
                      : undefined
                  }
                >
                  <option value="">Choose an occasion</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {error("eventType") && (
                  <p
                    id="error-eventType"
                    className={styles.fieldError}
                  >
                    {error("eventType")}
                  </p>
                )}
              </div>

              <InputField
                {...input("eventDate", "Event date")}
                type="date"
                required
                min={minDate}
              />
              <InputField
                {...input("preferredTime", "Preferred start time")}
                type="time"
              />
              <InputField
                {...input("guestCount", "Expected guests")}
                type="number"
                required
                min={1}
                max={10000}
              />

              <div className={styles.fullWidth}>
                <InputField
                  {...input("location", "Venue or town")}
                  required
                  maxLength={300}
                />
              </div>
            </div>
          </section>

          <section
            className={styles.section}
            aria-labelledby="treat-details-heading"
          >
            <p className="eyebrow">03 · Something sweet</p>
            <h2 id="treat-details-heading">
              What do you have in mind?
            </h2>

            <div className={styles.field}>
              <label htmlFor="quote-packageId">
                Preferred package <span>(optional)</span>
              </label>
              <select
                id="quote-packageId"
                name="packageId"
                value={values.packageId}
                onChange={(event) =>
                  update("packageId", event.currentTarget.value)
                }
                aria-invalid={Boolean(error("packageId"))}
                aria-describedby={
                  error("packageId")
                    ? "error-packageId"
                    : undefined
                }
              >
                <option value="">Help me choose</option>
                {packages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {error("packageId") && (
                <p
                  id="error-packageId"
                  className={styles.fieldError}
                >
                  {error("packageId")}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="quote-message">
                Anything else we should know?{" "}
                <span>(optional)</span>
              </label>
              <textarea
                id="quote-message"
                name="message"
                rows={5}
                maxLength={2000}
                value={values.message}
                onChange={(event) =>
                  update("message", event.currentTarget.value)
                }
                aria-invalid={Boolean(error("message"))}
                aria-describedby={
                  error("message") ? "error-message" : undefined
                }
              />
              {error("message") && (
                <p
                  id="error-message"
                  className={styles.fieldError}
                >
                  {error("message")}
                </p>
              )}
            </div>
          </section>

          <p className={styles.note}>
            Submitting lets us contact you about this event.
            Your booking is confirmed separately.
          </p>

          <button
            className="button"
            type="submit"
            disabled={pending}
          >
            {pending
              ? "Sending your request…"
              : "Request a quote"}
          </button>
        </fieldset>

        <p className={styles.emailFallback}>
          Prefer email?{" "}
          <a
            className="text-link"
            href="mailto:cherriesontopchester@gmail.com"
          >
            Get in touch directly.
          </a>
        </p>
      </form>

      <aside
        className={styles.summary}
        aria-labelledby="quote-summary-heading"
      >
        <p className="eyebrow">Your celebration</p>
        <h2 id="quote-summary-heading">
          A little sweetness, planned.
        </h2>

        <dl>
          <div>
            <dt>Package</dt>
            <dd>{selected?.name ?? "Let’s choose together"}</dd>
          </div>
          <div>
            <dt>Guests</dt>
            <dd>{values.guestCount || "Add your guest count"}</dd>
          </div>
        </dl>

        <div
          className={styles.estimate}
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="eyebrow">Estimated package total</p>
          <p className={styles.amount}>
            {estimate === null
              ? "Let’s talk"
              : money.format(estimate / 100)}
          </p>
          <p>
            {selected
              ? `This package starts at ${selected.minimumGuests} guests. We can discuss options for smaller events.`
              : "Choose a package and guest count to see an estimate."}
          </p>
        </div>

        <p className={styles.note}>
          Final pricing and availability are confirmed after we
          review your request.
        </p>
      </aside>
    </div>
  );
}
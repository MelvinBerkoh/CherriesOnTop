import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteStatusForm } from "@/components/owner/quote-status-form";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner-session";
import { quoteStatusLabels } from "@/lib/quote-status";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Quote Request | Cherries On Top",
  robots: { index: false, follow: false },
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const receivedFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
  timeZoneName: "short",
});

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();

  const { id } = await params;
  if (id.length > 128) notFound();

  const request = await db.quoteRequest.findUnique({
    where: { id },
  });

  if (!request) notFound();

  return (
    <main
      id="main-content"
      className={`container ${styles.page}`}
    >
      <Link className="text-link" href="/owner">
        ← Back to quote inbox
      </Link>

      <header className={styles.heading}>
        <p className="eyebrow">
          Quote request · {quoteStatusLabels[request.status]}
        </p>
        <h1>{request.name}</h1>
        <p>
          Received {receivedFormat.format(request.createdAt)}
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.details}>
          <section
            className={styles.panel}
            aria-labelledby="customer-heading"
          >
            <h2 id="customer-heading">Contact details</h2>

            <dl>
              <div>
                <dt>Email</dt>
                <dd>
                  <a
                    className="text-link"
                    href={`mailto:${encodeURIComponent(request.email)}`}
                  >
                    {request.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{request.phone || "Not provided"}</dd>
              </div>
            </dl>
          </section>

          <section
            className={styles.panel}
            aria-labelledby="event-heading"
          >
            <h2 id="event-heading">Event details</h2>

            <dl>
              <div>
                <dt>Occasion</dt>
                <dd>{request.eventType}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{dateFormat.format(request.eventDate)}</dd>
              </div>
              <div>
                <dt>Preferred start time</dt>
                <dd>
                  {request.preferredTime
                    ? `${request.preferredTime} · New Jersey local time`
                    : "Not provided"}
                </dd>
              </div>
              <div>
                <dt>Venue or town</dt>
                <dd>{request.location}</dd>
              </div>
              <div>
                <dt>Guests</dt>
                <dd>{request.guestCount}</dd>
              </div>
              <div>
                <dt>Package</dt>
                <dd>
                  {request.packageName || "Help choosing"}
                </dd>
              </div>
              <div>
                <dt>Package estimate</dt>
                <dd>
                  {request.estimatedTotalCents === null
                    ? "To discuss"
                    : money.format(
                        request.estimatedTotalCents / 100,
                      )}
                </dd>
              </div>
            </dl>

            <p className={styles.note}>
              The estimate recorded when the request was
              submitted. Final pricing is agreed separately.
            </p>
          </section>

          <section
            className={styles.panel}
            aria-labelledby="message-heading"
          >
            <h2 id="message-heading">Customer message</h2>
            <p className={styles.message}>
              {request.message || "No additional message."}
            </p>
          </section>

          <p className={styles.reference}>
            Request reference: <code>{request.id}</code>
          </p>
        </div>

        <aside
          className={styles.panel}
          aria-labelledby="manage-heading"
        >
          <h2 id="manage-heading">Manage request</h2>
          <QuoteStatusForm
            id={request.id}
            initialStatus={request.status}
            updatedAt={request.updatedAt.toISOString()}
          />
        </aside>
      </div>
    </main>
  );
}
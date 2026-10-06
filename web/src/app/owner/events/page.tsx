import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner-session";
import { eventStatusLabels } from "@/lib/event-form";
import { eventTimeZone } from "@/lib/events";
import styles from "./events.module.css";

export const metadata: Metadata = {
  title: "Manage Events | Cherries On Top",
  robots: { index: false, follow: false },
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: eventTimeZone,
  timeZoneName: "short",
});

export default async function OwnerEventsPage() {
  await requireOwner();

  const events = await db.publicEvent.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 50,
    select: {
      id: true,
      title: true,
      location: true,
      startsAt: true,
      endsAt: true,
      status: true,
    },
  });

  return (
    <main
      id="main-content"
      className={`container ${styles.page}`}
    >
      <Link className="text-link" href="/owner">
        ← Back to quote inbox
      </Link>

      <header className={styles.listHeading}>
        <div className={styles.heading}>
          <p className="eyebrow">Owner dashboard</p>
          <h1>Public events</h1>
          <p>
            Latest 50 events · All times are local to New Jersey.
          </p>
        </div>

        <Link className="button" href="/owner/events/new">
          Add event
        </Link>
      </header>

      {events.length === 0 ? (
        <section className={styles.empty}>
          <h2>No events yet.</h2>
          <p>
            Add your next public stop. Save it as a draft until
            the details are confirmed.
          </p>
        </section>
      ) : (
        <ul className={styles.list}>
          {events.map((event) => (
            <li key={event.id} className={styles.eventCard}>
              <div>
                <p className="eyebrow">{event.location}</p>
                <h2>{event.title}</h2>

                <Link
                  className="text-link"
                  href={`/owner/events/${event.id}/edit`}
                >
                  Edit event
                </Link>

                <p>
                  <time dateTime={event.startsAt.toISOString()}>
                    {dateFormat.format(event.startsAt)}
                  </time>
                  {" – "}
                  <time dateTime={event.endsAt.toISOString()}>
                    {dateFormat.format(event.endsAt)}
                  </time>
                </p>
              </div>

              <span
                className={styles.badge}
                data-status={event.status}
              >
                {eventStatusLabels[event.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
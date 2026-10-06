import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import {
  eventTimeZone,
  getUpcomingEvents,
  publicEvents,
} from "@/lib/events";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Events | Cherries On Top",
  description:
    "Find upcoming public stops for the Cherries On Top ice cream trailer, or get in touch about your own event.",
};

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: eventTimeZone,
});

const dayFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  timeZone: eventTimeZone,
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: eventTimeZone,
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
  timeZone: eventTimeZone,
});

export default async function EventsPage() {
  await connection();

  const events = getUpcomingEvents(publicEvents);

  return (
    <main id="main-content">
      <div className="container">
        <section
          className={styles.intro}
          aria-labelledby="events-heading"
        >
          <p className="eyebrow">Find the trailer</p>

          <h1 id="events-heading">Your next sweet stop.</h1>

          <p className={styles.description}>
            Come say hello, pick your favorite, and enjoy a little
            Cherries On Top. You will find our upcoming public events
            here.
          </p>
        </section>

        <section
          className={styles.schedule}
          aria-labelledby="schedule-heading"
        >
          <div className={styles.scheduleHeading}>
            <h2 id="schedule-heading">Upcoming public events</h2>
            <span>All times are local to New Jersey.</span>
          </div>

          {events.length === 0 ? (
            <div className={styles.emptyState}>
              <p className="eyebrow">More sweet stops to come</p>

              <h3>No public dates announced yet.</h3>

              <p className={styles.emptyCopy}>
                Check back for our next stop, or follow along on
                Instagram. Planning your own celebration? Get in
                touch to talk about your event.
              </p>

              <div className={styles.actions}>
                <a
                  className="button"
                  href="https://www.instagram.com/cherriesontopchester/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Cherries On Top on Instagram (opens in a new tab)"
                >
                  Follow on Instagram ↗
                </a>

                <Link className="text-link" href="/quote">
                  Ask about your event
                </Link>
              </div>
            </div>
          ) : (
            <ul className={styles.eventList}>
              {events.map((event) => {
                const start = new Date(event.startsAt);
                const end = new Date(event.endsAt);
                const sameDay =
                  dateFormat.format(start) === dateFormat.format(end);

                return (
                  <li key={event.id}>
                    <article className={styles.eventCard}>
                      <div
                        className={styles.dateBadge}
                        aria-hidden="true"
                      >
                        <span>{monthFormat.format(start)}</span>
                        <strong>{dayFormat.format(start)}</strong>
                      </div>

                      <div className={styles.eventBody}>
                        <p className="eyebrow">{event.location}</p>

                        <h3>{event.title}</h3>

                        <p className={styles.eventDate}>
                          <time dateTime={event.startsAt}>
                            {dateFormat.format(start)} ·{" "}
                            {timeFormat.format(start)}
                          </time>
                          {" – "}
                          <time dateTime={event.endsAt}>
                            {!sameDay &&
                              `${dateFormat.format(end)} · `}
                            {timeFormat.format(end)}
                          </time>
                        </p>

                        <p className={styles.eventDescription}>
                          {event.description}
                        </p>

                        <p className={styles.address}>
                          {event.address}
                        </p>

                        <a
                          className="text-link"
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Get directions to ${event.title} (opens in a new tab)`}
                        >
                          Get directions ↗
                        </a>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section
        className="contact"
        aria-labelledby="events-contact-heading"
      >
        <div className="container contact-inner">
          <div>
            <h2 id="events-contact-heading">
              Give your guests something sweet.
            </h2>

            <p>
              Bring the trailer to your celebration. Tell us the date,
              the place, and what you are planning.
            </p>
          </div>

          <Link className="button button-light" href="/quote">
            Plan your event
          </Link>
        </div>
      </section>
    </main>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getPublicAvailability } from "@/lib/availability";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Availability | Cherries On Top",
  description: "Check trailer availability and choose a date for your ice cream catering request.",
};
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const eventFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" });
const dateFormat = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function AvailabilityPage({ searchParams }: {
  searchParams: Promise<{ month?: string | string[]; day?: string | string[] }>;
}) {
  await connection();
  const query = await searchParams;
  const calendar = await getPublicAvailability(query.month);
  const unavailable = new Set(calendar.unavailable);
  const selectedDay = typeof query.day === "string" && calendar.days.includes(query.day) ? query.day : null;
  const detail = selectedDay ? calendar.dayDetails[selectedDay] : null;
  const monthTitle = monthFormat.format(new Date(`${calendar.month}-01T12:00:00Z`));
  return (
    <main id="main-content" className={`container ${styles.page}`}>
      <p className="eyebrow">Make room for something sweet</p>
      <h1>Find your day.</h1>
      <p className={styles.intro}>We bring one trailer to one event per day. Choose an available date to start your quote request.</p>
      <p className={styles.intro}>Please give us at least 48 hours. Earliest event start: <strong>{calendar.earliestStart}</strong>. On that first available day, choose this time or later.</p>
      <section className={styles.calendar} aria-labelledby="calendar-heading">
        <div className={styles.heading}>
          {calendar.previous ? <Link prefetch={false} href={`/availability?month=${calendar.previous}`} aria-label="Previous month">← Previous</Link> : <span />}
          <h2 id="calendar-heading">{monthTitle}</h2>
          {calendar.next ? <Link prefetch={false} href={`/availability?month=${calendar.next}`} aria-label="Next month">Next →</Link> : <span />}
        </div>
        <div className={styles.weekdays} aria-hidden="true">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <span key={day}>{day}</span>)}
        </div>
        <ul className={styles.days} aria-label={`${monthTitle} availability`}>
          {Array.from({ length: calendar.offset }, (_, index) => <li key={`blank-${index}`} className={styles.blank} aria-hidden="true" />)}
          {calendar.days.map(date => {
            const isToday = date === calendar.today;
            const past = date < calendar.today;
            const tooSoon = date < calendar.earliestDate;
            const booked = unavailable.has(date);
            const label = `${isToday ? "Today, " : ""}${dateFormat.format(new Date(`${date}T12:00:00Z`))}`;
            return (
              <li key={date} className={`${past ? styles.past : booked ? styles.unavailable : tooSoon ? styles.past : styles.available} ${isToday ? styles.today : ""}`}>
                {booked ? <Link prefetch={false} href={`/availability?month=${calendar.month}&day=${date}#day-details`}
                  aria-label={`${label}: Reserved. View event details.`} aria-current={date === selectedDay ? "date" : undefined}>
                  {isToday && <span className={styles.todayBadge}>Today</span>}
                  <time dateTime={date}>{Number(date.slice(-2))}</time>
                  {!past && <span>Reserved</span>}
                </Link> : past || tooSoon ? <div aria-label={`${label}: ${past ? "Date has passed" : "48 hours notice required"}`}>
                  {isToday && <span className={styles.todayBadge}>Today</span>}
                  <time dateTime={date}>{Number(date.slice(-2))}</time>
                </div> : <Link prefetch={false} href={`/quote?date=${date}`} aria-label={`${label}: Available. Request a quote.`}>
                  {isToday && <span className={styles.todayBadge}>Today</span>}
                  <time dateTime={date}>{Number(date.slice(-2))}</time>
                  <span>Available</span>
                </Link>}
              </li>
            );
          })}
        </ul>
        <div className={styles.legend} aria-label="Calendar key">
          <span><i className={styles.openDot} aria-hidden="true" />Available</span>
          <span><i className={styles.reservedDot} aria-hidden="true" />Reserved · select for details</span>
          <span><i className={styles.closedDot} aria-hidden="true" />Not open for new bookings</span>
        </div>
        {selectedDay && detail && <section id="day-details" className={styles.detail} tabIndex={-1} aria-labelledby="day-details-heading">
          <p className="eyebrow">{dateFormat.format(new Date(`${selectedDay}T12:00:00Z`))}</p>
          <h3 id="day-details-heading">{detail.kind === "public" ? "Public event" : detail.kind === "private" ? "Private event" : "Trailer unavailable"}</h3>
          {detail.kind === "public" ? detail.events.map(event => <article key={event.id}>
            <h4>{event.title}</h4>
            <p>{event.description}</p>
            <p>{eventFormat.format(new Date(event.startsAt))} – {eventFormat.format(new Date(event.endsAt))} · New Jersey</p>
            <p>{event.location}<br />{event.address}</p>
            <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`}
              target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${event.title} (opens in a new tab)`}>Get directions ↗</a>
          </article>) : <p>{detail.kind === "private" ? "The trailer is reserved for a private event. Please choose another available day." : "The trailer is unavailable on this day. Please choose another available day."}</p>}
          <Link className="text-link" prefetch={false} href={`/availability?month=${calendar.month}#calendar-heading`}>Close details</Link>
        </section>}
        <p className={styles.note}>Muted dates have already passed or fall within our 48-hour notice period.</p>
        <p className={styles.note}>All dates follow New Jersey time. Availability can change. A quote request does not reserve a date; we confirm your booking separately.</p>
      </section>
      <p className={styles.footer}>Want to find us at a public event? <Link className="text-link" href="/events">See upcoming stops →</Link></p>
    </main>
  );
}

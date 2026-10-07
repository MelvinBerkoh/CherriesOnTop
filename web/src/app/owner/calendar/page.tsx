import type { Metadata } from "next";
import Link from "next/link";
import { CalendarBlockForm } from "@/components/owner/calendar-block-form";
import { getOwnerCalendar } from "@/lib/owner-calendar";
import { requireOwner } from "@/lib/owner-session";
import styles from "./page.module.css";
export const metadata: Metadata = { title: "Owner Calendar | Cherries On Top", robots: { index: false, follow: false } };
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const dayFormat = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const eventFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" });
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const labels = { HOLD: "On hold", PRIVATE_EVENT: "Private booking", PUBLIC_EVENT: "Public event", BLOCKED: "Blocked", COMPLETED: "Completed" };
export default async function OwnerCalendarPage({ searchParams }: { searchParams: Promise<{ month?: string | string[]; day?: string | string[] }> }) {
  await requireOwner();
  const query = await searchParams;
  const calendar = await getOwnerCalendar(query.month);
  const selected = typeof query.day === "string" && calendar.days.includes(query.day) ? query.day : calendar.days.includes(calendar.today) ? calendar.today : calendar.days[0];
  const items = calendar.dayItems[selected] ?? [];
  const block = items.find(item => item.kind === "BLOCKED");
  const reservedDays = Object.keys(calendar.dayItems).length;
  const title = monthFormat.format(new Date(`${calendar.month}-01T12:00:00Z`));
  return <main id="main-content" className={`container ${styles.page}`}>
    <header className={styles.intro}><div><p className="eyebrow">Owner dashboard</p><h1>Trailer calendar</h1>
      <p>{reservedDays} reserved {reservedDays === 1 ? "day" : "days"} this month · New Jersey time</p></div>
      <Link className="button" href="/owner/events/new">Add public event</Link></header>
    <div className={styles.layout}>
      <section className={styles.calendar} aria-labelledby="month-heading">
        <div className={styles.heading}>
          {calendar.previous ? <Link prefetch={false} href={`/owner/calendar?month=${calendar.previous}`} aria-label="Previous month">← Previous</Link> : <span />}
          <h2 id="month-heading">{title}</h2>
          {calendar.next ? <Link prefetch={false} href={`/owner/calendar?month=${calendar.next}`} aria-label="Next month">Next →</Link> : <span />}
        </div>
        <Link className="text-link" prefetch={false} href="/owner/calendar">Back to today</Link>
        <div className={styles.weekdays} aria-hidden="true">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <span key={day}>{day}</span>)}</div>
        <ul className={styles.days} aria-label={`${title} reservations`}>
          {Array.from({ length: calendar.offset }, (_, index) => <li key={`blank-${index}`} aria-hidden="true" />)}
          {calendar.days.map(date => {
            const entries = calendar.dayItems[date] ?? [];
            const kind = entries.length > 1 ? "CONFLICT" : entries[0]?.kind ?? "OPEN";
            const isToday = date === calendar.today;
            const label = entries.length > 1 ? "Conflict" : entries.length ? labels[entries[0].kind] : "Open";
            return <li key={date} data-kind={kind} className={`${date < calendar.today ? styles.past : ""} ${isToday ? styles.today : ""}`}>
              <Link prefetch={false} href={`/owner/calendar?month=${calendar.month}&day=${date}#day-details`} aria-current={date === selected ? "date" : undefined}
                aria-label={`${isToday ? "Today, " : ""}${dayFormat.format(new Date(`${date}T12:00:00Z`))}: ${label}. View day.`}>
                {isToday && <span className={styles.todayBadge}>Today</span>}<time dateTime={date}>{Number(date.slice(-2))}</time><span>{label}</span>
              </Link></li>;
          })}
        </ul>
        <p className={styles.note}>Select any day to view reservations or manage a manual block. Create private bookings from the quote inbox.</p>
        <Link className="text-link" href="/owner">Open quote inbox →</Link>
      </section>
      <section id="day-details" tabIndex={-1} className={styles.detail} aria-labelledby="day-heading">
        <p className="eyebrow">Selected day</p><h2 id="day-heading">{dayFormat.format(new Date(`${selected}T12:00:00Z`))}</h2>
        {items.length > 1 && <p role="alert">Multiple reservations are listed for this day. Move or cancel conflicting bookings or events before reserving it again.</p>}
        {items.length === 0 && <p>No active reservation on this day.</p>}
        {items.map(item => <article key={`${item.kind}-${item.id}`} className={styles.item}>
          <p className="eyebrow">{labels[item.kind]}</p><h3>{item.title}</h3>
          {item.customerName && <p>Customer: {item.customerName}</p>}
          {item.startsAt && item.endsAt && <p>{eventFormat.format(new Date(item.startsAt))} – {eventFormat.format(new Date(item.endsAt))}</p>}
          {item.location && <p>{item.location}</p>}
          {item.holdExpiresAt && <p>Hold expires {eventFormat.format(new Date(item.holdExpiresAt))}</p>}
          {item.quotedTotalCents !== undefined && <p>Agreed price: {money.format(item.quotedTotalCents / 100)}</p>}
          {item.notes && <p className={styles.notes}>Internal notes: {item.notes}</p>}
          {item.href && <Link className="text-link" href={item.href}>{item.kind === "PUBLIC_EVENT" ? "Edit public event" : "Manage private booking"} →</Link>}
        </article>)}
        {block && items.length === 1 ? <CalendarBlockForm key={`${selected}-${block.updatedAt}`} date={selected} block={{ id: block.id, updatedAt: block.updatedAt!, notes: block.notes }} />
          : items.length === 0 && selected >= calendar.today ? <CalendarBlockForm key={selected} date={selected} /> : null}
        <p className={styles.note}>Private customer details and notes are visible only to the owner. Manual block notes are never public.</p>
      </section>
    </div>
  </main>;
}

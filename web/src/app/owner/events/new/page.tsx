import type { Metadata } from "next";
import Link from "next/link";
import { EventForm } from "@/components/owner/event-form";
import { requireOwner } from "@/lib/owner-session";
import styles from "../events.module.css";

export const metadata: Metadata = {
  title: "Add Event | Cherries On Top",
  robots: { index: false, follow: false },
};

export default async function NewEventPage() {
  await requireOwner();

  return (
    <main
      id="main-content"
      className={`container ${styles.page}`}
    >
      <Link className="text-link" href="/owner/events">
        ← Back to events
      </Link>

      <header className={styles.heading}>
        <p className="eyebrow">
          Owner dashboard · Public events
        </p>
        <h1>Add a sweet stop.</h1>
        <p>Save a draft while you confirm the details.</p>
      </header>

      <EventForm />
    </main>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/owner/event-form";
import { EventDeleteForm } from "@/components/owner/event-delete-form";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner-session";
import { toEventLocalInput } from "@/lib/event-time";
import styles from "../../events.module.css";

export const metadata: Metadata = {
  title: "Edit Event | Cherries On Top",
  robots: { index: false, follow: false },
};

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();

  const { id } = await params;
  if (id.length > 128) notFound();

  const event = await db.publicEvent.findUnique({
    where: { id },
  });

  if (!event) notFound();

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
        <h1>Edit your sweet stop.</h1>
        <p>
          Update the details, publish a confirmed stop, or hide
          it by choosing Draft or Cancelled.
        </p>
      </header>

      <EventForm
        key={event.updatedAt.toISOString()}
        id={event.id}
        updatedAt={event.updatedAt.toISOString()}
        initialValues={{
          title: event.title,
          description: event.description,
          location: event.location,
          address: event.address,
          startsAt: toEventLocalInput(event.startsAt),
          endsAt: toEventLocalInput(event.endsAt),
          status: event.status,
        }}
      />
      <EventDeleteForm
        key={`delete-${event.updatedAt.toISOString()}`}
        id={event.id}
        title={event.title}
        updatedAt={event.updatedAt.toISOString()}
      />
    </main>
  );
}

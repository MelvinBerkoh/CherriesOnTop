import "server-only";
import { db } from "@/lib/db";

export async function getPublishedUpcomingEvents(
  now = new Date(),
) {
  const events = await db.publicEvent.findMany({
    where: {
      status: "PUBLISHED",
      endsAt: { gt: now },
    },
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      address: true,
      startsAt: true,
      endsAt: true,
    },
  });

  return events
    .filter((event) => event.endsAt > event.startsAt)
    .map((event) => ({
      ...event,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
    }));
}
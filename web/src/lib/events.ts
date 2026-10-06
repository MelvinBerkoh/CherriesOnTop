export type PublicEvent = {
  id: string;
  title: string;
  location: string;
  address: string;
  startsAt: string;
  endsAt: string;
  description: string;
};

export const eventTimeZone = "America/New_York";

// Add confirmed public events here.
// Include a timezone offset in both timestamps.
// The owner dashboard will load these from the database later.
export const publicEvents: PublicEvent[] = [];

export function getUpcomingEvents(
  events: PublicEvent[],
  now = new Date(),
) {
  return events
    .filter((event) => {
      const start = Date.parse(event.startsAt);
      const end = Date.parse(event.endsAt);

      return (
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        end > start &&
        end > now.getTime()
      );
    })
    .sort(
      (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
    );
}
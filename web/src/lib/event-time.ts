import "server-only";
import { Temporal } from "@js-temporal/polyfill";
import { eventTimeZone } from "@/lib/events";

export function toEventLocalInput(date: Date) {
  return Temporal.Instant.from(date.toISOString())
    .toZonedDateTimeISO(eventTimeZone)
    .toPlainDateTime()
    .toString({ smallestUnit: "minute" });
}
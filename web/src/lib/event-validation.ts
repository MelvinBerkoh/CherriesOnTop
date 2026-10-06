import "server-only";
import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";
import { eventStatuses } from "@/lib/event-form";
import { eventTimeZone } from "@/lib/events";

const localDateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
    "Choose a date and time.",
  )
  .transform((value, context) => {
    try {
      const local = Temporal.PlainDateTime.from(value);

      if (local.year < 1900) {
        throw new RangeError("Unsupported year");
      }

      const zoned = local.toZonedDateTime(eventTimeZone, {
        disambiguation: "reject",
      });

      return new Date(zoned.epochMilliseconds);
    } catch {
      context.issues.push({
        code: "custom",
        input: value,
        message:
          "Choose a valid New Jersey time. Missing or repeated daylight-saving hours cannot be used.",
      });

      return z.NEVER;
    }
  });

export const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Enter an event title.")
      .max(120, "Use 120 characters or fewer."),

    description: z
      .string()
      .trim()
      .min(10, "Add a short event description.")
      .max(2000, "Use 2,000 characters or fewer."),

    location: z
      .string()
      .trim()
      .min(3, "Enter the venue name or town.")
      .max(150, "Use 150 characters or fewer."),

    address: z
      .string()
      .trim()
      .min(5, "Enter the event address.")
      .max(300, "Use 300 characters or fewer."),

    startsAt: localDateTime,
    endsAt: localDateTime,

    status: z.enum(eventStatuses, {
      error: "Choose an event status.",
    }),
  })
  .superRefine((event, context) => {
    if (event.endsAt <= event.startsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "The end must be after the start.",
      });
    }
  });
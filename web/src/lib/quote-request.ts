import { z } from "zod";
import { cateringPackages } from "@/lib/packages";

export const eventTypes = [
  "Wedding",
  "Birthday",
  "Corporate event",
  "Graduation",
  "Festival",
  "Other",
] as const;

export const quoteFields = [
  "name",
  "email",
  "phone",
  "eventType",
  "eventDate",
  "preferredTime",
  "location",
  "guestCount",
  "packageId",
  "message",
] as const;

export type QuoteField = (typeof quoteFields)[number];
export type QuoteFormValues = Record<QuoteField, string>;

export type QuoteActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: Partial<Record<QuoteField, string[]>>;
  reference?: string;
};

export const initialQuoteState: QuoteActionState = {
  status: "idle",
  message: "",
};

export function getTodayInNewJersey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

const optionalText = (limit: number) =>
  z
    .string()
    .trim()
    .max(limit, `Keep this under ${limit + 1} characters.`)
    .transform((value) => value || undefined);

export function createQuoteSchema(now = new Date()) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your name.")
      .max(100, "Keep your name under 101 characters."),

    email: z
      .string()
      .trim()
      .max(254)
      .pipe(z.email({ error: "Enter a valid email address." })),

    phone: optionalText(40),

    eventType: z.enum(eventTypes, {
      error: "Choose an event type.",
    }),

    eventDate: z
      .string()
      .refine(isCalendarDate, "Choose a valid event date.")
      .refine(
        (value) => value >= getTodayInNewJersey(now),
        "Choose today or a future date.",
      ),

    preferredTime: z
      .string()
      .refine(
        (value) =>
          value === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(value),
        "Choose a valid start time.",
      )
      .transform((value) => value || undefined),

    location: z
      .string()
      .trim()
      .min(3, "Enter your venue or town.")
      .max(300, "Keep the location under 301 characters."),

    guestCount: z
      .string()
      .trim()
      .regex(/^\d+$/, "Enter a whole guest count.")
      .transform(Number)
      .pipe(
        z
          .number()
          .int()
          .min(1, "Enter at least one guest.")
          .max(10000, "Enter 10,000 guests or fewer."),
      ),

    packageId: z
      .string()
      .refine(
        (value) =>
          value === "" ||
          cateringPackages.some((item) => item.id === value),
        "Choose one of the available packages.",
      )
      .transform((value) => value || undefined),

    message: optionalText(2000),
  });
}
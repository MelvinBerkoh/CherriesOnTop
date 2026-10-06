import type { Metadata } from "next";
import { QuoteForm } from "@/components/marketing/quote-form";
import styles from "@/components/marketing/quote-form.module.css";
import { cateringPackages } from "@/lib/packages";
import { getEarliestBookingDate, formatBookingCutoff } from "@/lib/booking-lead-time";
import {
  createQuoteSchema,
  eventTypes,
} from "@/lib/quote-request";

export const metadata: Metadata = {
  title: "Request a Quote | Cherries On Top",
  description:
    "Tell us about your celebration and request a quote for Cherries On Top ice cream catering.",
};

type QuotePageProps = {
  searchParams: Promise<{
    package?: string | string[];
    guests?: string | string[];
    date?: string | string[];
  }>;
};

export default async function QuotePage({
  searchParams,
}: QuotePageProps) {
  const query = await searchParams;
  const packageId =
    typeof query.package === "string" ? query.package : "";
  const guests =
    typeof query.guests === "string" ? query.guests : "";

  const initialPackageId = cateringPackages.some(
    (item) => item.id === packageId,
  )
    ? packageId
    : "";

  const initialGuests =
    /^\d+$/.test(guests) &&
    Number(guests) >= 1 &&
    Number(guests) <= 10000
      ? guests
      : "";

  const selectedDate = createQuoteSchema().shape.eventDate.safeParse(query.date);
  const initialEventDate = selectedDate.success ? selectedDate.data : "";

  return (
    <main id="main-content" className="container">
      <section
        className={styles.intro}
        aria-labelledby="quote-heading"
      >
        <p className="eyebrow">Let’s plan something sweet</p>
        <h1 id="quote-heading">Your people. Our treats.</h1>
        <p>
          Tell us what you are planning. We will help you find
          the right treats for your celebration.
        </p>
        <p>We need at least 48 hours before your event starts. Earliest start: <strong>{formatBookingCutoff()}</strong>, New Jersey time.</p>
      </section>

      <QuoteForm
        key={`${initialPackageId}:${initialGuests}:${initialEventDate}`}
        packages={cateringPackages}
        eventTypes={eventTypes}
        minDate={getEarliestBookingDate()}
        initialPackageId={initialPackageId}
        initialGuests={initialGuests}
        initialEventDate={initialEventDate}
      />
    </main>
  );
}

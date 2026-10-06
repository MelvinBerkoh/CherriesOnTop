import type { Metadata } from "next";
import { QuoteForm } from "@/components/marketing/quote-form";
import styles from "@/components/marketing/quote-form.module.css";
import { cateringPackages } from "@/lib/packages";
import {
  eventTypes,
  getTodayInNewJersey,
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
      </section>

      <QuoteForm
        key={`${initialPackageId}:${initialGuests}`}
        packages={cateringPackages}
        eventTypes={eventTypes}
        minDate={getTodayInNewJersey()}
        initialPackageId={initialPackageId}
        initialGuests={initialGuests}
      />
    </main>
  );
}
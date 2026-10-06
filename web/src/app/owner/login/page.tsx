import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OwnerAuthButton } from "@/components/owner/owner-auth-buttons";
import { getOwnerSession } from "@/lib/owner-session";
import styles from "../owner.module.css";

export const metadata: Metadata = {
  title: "Owner Login | Cherries On Top",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OwnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const query = await searchParams;

  if (await getOwnerSession()) {
    redirect("/owner");
  }

  return (
    <main
      id="main-content"
      className={`container ${styles.page}`}
    >
      <section
        className={styles.card}
        aria-labelledby="owner-login-heading"
      >
        <p className="eyebrow">
          Cherries On Top · Owner access
        </p>
        <h1 id="owner-login-heading">Welcome back.</h1>
        <p>
          Sign in with your approved Google account to manage
          the business.
        </p>

        {query.error && (
          <p role="alert">
            Sign-in was not completed. Use the approved owner
            account and try again.
          </p>
        )}

        <OwnerAuthButton action="sign-in" />

        <Link className="text-link" href="/">
          Back to the website
        </Link>
      </section>
    </main>
  );
}
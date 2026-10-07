import Link from "next/link";
import { getOwnerSession } from "@/lib/owner-session";
import styles from "./owner.module.css";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOwnerSession();

  return (
    <>
      {session && (
        <nav
          className={`container ${styles.headerActions}`}
          aria-label="Owner navigation"
          style={{ paddingBlock: "1rem" }}
        >
          <Link className="text-link" href="/owner">
            Quote inbox
          </Link>
          <Link className="text-link" href="/owner/calendar">
            Calendar
          </Link>
          <Link className="text-link" href="/owner/events">
            Manage events
          </Link>
          <Link className="text-link" href="/">
            Public website
          </Link>
        </nav>
      )}

      {children}
    </>
  );
}

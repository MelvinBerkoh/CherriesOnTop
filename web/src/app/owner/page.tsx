import type { Metadata } from "next";
import Link from "next/link";
import { OwnerAuthButton } from "@/components/owner/owner-auth-buttons";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner-session";
import styles from "./owner.module.css";

export const metadata: Metadata = {
  title: "Quote Inbox | Cherries On Top",
  robots: { index: false, follow: false },
};

const pageSize = 20;

const eventDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const receivedFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const statusLabels = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTED: "Quoted",
  BOOKED: "Booked",
  CLOSED: "Closed",
};

export default async function OwnerPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const session = await requireOwner();
  const query = await searchParams;

  const rawPage =
    typeof query.page === "string" ? query.page : "1";
  const parsedPage = /^\d+$/.test(rawPage)
    ? Number(rawPage)
    : 1;
  const requestedPage =
    Number.isSafeInteger(parsedPage) && parsedPage >= 1
      ? parsedPage
      : 1;

  const groups = await db.quoteRequest.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const total = groups.reduce(
    (sum, group) => sum + group._count._all,
    0,
  );

  const countFor = (status: keyof typeof statusLabels) =>
    groups.find((group) => group.status === status)?._count
      ._all ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize),
  );
  const page = Math.min(requestedPage, totalPages);

  const requests = await db.quoteRequest.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: pageSize,
    skip: (page - 1) * pageSize,
    select: {
      id: true,
      name: true,
      email: true,
      eventType: true,
      eventDate: true,
      guestCount: true,
      location: true,
      packageName: true,
      estimatedTotalCents: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <main
      id="main-content"
      className={`container ${styles.dashboard}`}
    >
      <header className={styles.dashboardHeader}>
        <div>
          <p className="eyebrow">
            Cherries On Top · Owner dashboard
          </p>
          <h1>Quote inbox</h1>
          <p className={styles.email}>
            Signed in as {session.user.email}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link className="text-link" href="/">
            View website
          </Link>
          <OwnerAuthButton action="sign-out" />
        </div>
      </header>

      <dl className={styles.stats}>
        <div>
          <dt>Total requests</dt>
          <dd>{total}</dd>
        </div>
        <div>
          <dt>New requests</dt>
          <dd>{countFor("NEW")}</dd>
        </div>
        <div>
          <dt>Booked events</dt>
          <dd>{countFor("BOOKED")}</dd>
        </div>
      </dl>

      <section
        className={styles.inbox}
        aria-labelledby="requests-heading"
      >
        <div className={styles.inboxHeading}>
          <h2 id="requests-heading">Recent requests</h2>
          <p>
            Newest first · Event dates are local calendar dates.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className={styles.empty}>
            <h3>No quote requests yet.</h3>
            <p>
              Requests submitted through the public form will
              appear here.
            </p>
            <Link className="text-link" href="/quote">
              Open the quote form
            </Link>
          </div>
        ) : (
          <>
            <div
              className={styles.tableScroll}
              role="region"
              aria-label="Quote requests table"
              tabIndex={0}
            >
              <table className={styles.table}>
                <caption className="sr-only">
                  Quote requests, page {page} of {totalPages}
                </caption>

                <thead>
                  <tr>
                    <th scope="col">Customer</th>
                    <th scope="col">Event</th>
                    <th scope="col">Package</th>
                    <th scope="col">Status</th>
                    <th scope="col">Received</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>
                          <Link
                            className="text-link"
                            href={`/owner/quotes/${request.id}`}
                          >
                            {request.name}
                          </Link>
                        </strong>
                        <a
                          className="text-link"
                          href={`mailto:${encodeURIComponent(request.email)}`}
                        >
                          {request.email}
                        </a>
                      </td>

                      <td>
                        <strong>{request.eventType}</strong>
                        <span>
                          {eventDateFormat.format(
                            request.eventDate,
                          )}
                          {" · "}
                          {request.guestCount} guests
                        </span>
                        <span>{request.location}</span>
                      </td>

                      <td>
                        <strong>
                          {request.packageName ??
                            "Help choosing"}
                        </strong>
                        <span>
                          {request.estimatedTotalCents === null
                            ? "Estimate to discuss"
                            : `${money.format(
                                request.estimatedTotalCents /
                                  100,
                              )} estimated`}
                        </span>
                      </td>

                      <td>
                        <span
                          className={styles.status}
                          data-status={request.status}
                        >
                          {statusLabels[request.status]}
                        </span>
                      </td>

                      <td>
                        <time
                          dateTime={request.createdAt.toISOString()}
                        >
                          {receivedFormat.format(
                            request.createdAt,
                          )}{" "}
                          ET
                        </time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <nav
              className={styles.pagination}
              aria-label="Quote inbox pages"
            >
              {page > 1 ? (
                <Link
                  className="text-link"
                  href={`/owner?page=${page - 1}`}
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}

              <p>
                Page {page} of {totalPages}
              </p>

              {page < totalPages ? (
                <Link
                  className="text-link"
                  href={`/owner?page=${page + 1}`}
                >
                  Next
                </Link>
              ) : (
                <span />
              )}
            </nav>
          </>
        )}
      </section>
    </main>
  );
}
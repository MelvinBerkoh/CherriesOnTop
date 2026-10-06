"use client";

import Link from "next/link";
import { useState } from "react";
import {
  getPackageEstimate,
  type CateringPackage,
} from "@/lib/packages";
import styles from "./package-explorer.module.css";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function PackageExplorer({
  packages,
}: {
  packages: CateringPackage[];
}) {
  const [selectedId, setSelectedId] = useState(
    packages[1]?.id ?? packages[0]?.id ?? "",
  );
  const [guestCount, setGuestCount] = useState(100);

  const selected =
    packages.find((item) => item.id === selectedId) ?? packages[0];

  if (!selected) return null;

  const estimate = getPackageEstimate(selected, guestCount);
  const inquiryHref = `/quote?package=${encodeURIComponent(selected.id)}&guests=${guestCount}`;

  return (
    <section
      id="packages"
      className={styles.section}
      aria-labelledby="packages-title"
    >
      <div className="container">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>A menu for your moment</p>

          <h2 id="packages-title">
            Find your <em>perfect scoop.</em>
          </h2>

          <p>
            Pick your treats. Bring your people. See what your
            celebration could look like.
          </p>
        </div>

        <fieldset className={styles.choices}>
          <legend className="sr-only">
            Choose a catering package
          </legend>

          {packages.map((item, index) => (
            <label
              key={item.id}
              className={styles.choice}
              data-selected={selected.id === item.id}
            >
              <input
                className="sr-only"
                type="radio"
                name="catering-package"
                value={item.id}
                checked={selected.id === item.id}
                onChange={() => setSelectedId(item.id)}
              />

              <span className={styles.choiceNumber}>
                0{index + 1}
              </span>
              <span className={styles.choiceName}>
                {item.name}
              </span>
              <span className={styles.choicePrice}>
                {money.format(item.pricePerPersonCents / 100)}
                {" "}/ person
              </span>
            </label>
          ))}
        </fieldset>

        <div className={styles.workspace}>
          <div className={styles.menu}>
            <p className="eyebrow">On the menu</p>
            <h3>{selected.name}</h3>

            <p className={styles.description}>
              {selected.description}
            </p>

            <ul className={styles.menuList}>
              {selected.menu.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className={styles.details}>
              <span>
                {selected.serviceMinutes} minutes of service
              </span>
              <span>
                {selected.minimumGuests}-guest minimum
              </span>
            </div>
          </div>

          <div className={styles.estimate}>
            <div className={styles.guestHeading}>
              <label htmlFor="guest-count">
                How many guests?
              </label>
              <output htmlFor="guest-count">
                {guestCount}
              </output>
            </div>

            <input
              className={styles.slider}
              id="guest-count"
              type="range"
              min={25}
              max={300}
              step={5}
              value={guestCount}
              aria-describedby="guest-count-help"
              onChange={(event) =>
                setGuestCount(Number(event.currentTarget.value))
              }
            />

            <div className={styles.rangeLabels} aria-hidden="true">
              <span>25 guests</span>
              <span>300 guests</span>
            </div>

            <div
              className={styles.total}
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="eyebrow">Estimated package total</p>

              <p className={styles.amount}>
                {estimate === null
                  ? "Let’s talk"
                  : money.format(estimate / 100)}
              </p>

              <p className={styles.calculation}>
                {estimate === null
                  ? `This package starts at ${selected.minimumGuests} guests. Ask us about a smaller celebration.`
                  : `${guestCount} guests × ${money.format(
                      selected.pricePerPersonCents / 100,
                    )} per person`}
              </p>
            </div>

            <Link className="button" href={inquiryHref}>
              Ask about this package
            </Link>

            <p id="guest-count-help" className={styles.note}>
              Package estimate only. Final pricing and availability
              are confirmed with your quote. For events outside
              this guest range, get in touch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
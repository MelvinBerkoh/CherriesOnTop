"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import styles from "./site-header.module.css";

const navigation = [
  { label: "The experience", href: "/#experience" },
  { label: "Get in touch", href: "/#contact" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          event.preventDefault();
          closeMenu();
          menuButton.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          closeMenu();
        }
      }}
    >
      <div className="container header-inner">
        <Link
          className="wordmark"
          href="/"
          aria-label="Cherries On Top home"
          onClick={closeMenu}
        >
          <span className="wordmark-main">Cherries</span>
          <span className="wordmark-sub">ON TOP</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navigation.map((item) => (
            <Link className="nav-link" key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}

          <Link className="button button-small" href="/#contact">
            Plan your event
          </Link>
        </nav>

        <button
          ref={menuButton}
          className={styles.menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <nav
        id="mobile-navigation"
        className={styles.mobileNav}
        aria-label="Mobile navigation"
        hidden={!menuOpen}
      >
        <div className={`container ${styles.mobileLinks}`}>
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </Link>
          ))}

          <Link
            className="button"
            href="/#contact"
            onClick={closeMenu}
          >
            Plan your event
          </Link>
        </div>
      </nav>
    </header>
  );
}
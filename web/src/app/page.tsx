import Image from "next/image";
import Link from "next/link";

const occasions = [
  "Weddings",
  "Birthdays",
  "Corporate events",
  "Graduations",
  "Festivals",
];

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link
            className="wordmark"
            href="/"
            aria-label="Cherries On Top home"
          >
            <span className="wordmark-main">Cherries</span>
            <span className="wordmark-sub">ON TOP</span>
          </Link>

          <nav className="site-nav" aria-label="Main navigation">
            <a className="nav-link" href="#experience">
              The experience
            </a>

            <a className="nav-link" href="#contact">
              Get in touch
            </a>

            <a className="button button-small" href="#contact">
              Plan your event
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="container hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Ice cream catering · Chester, NJ</p>

            <h1 id="hero-title">
              A sweeter kind of <em>celebration.</em>
            </h1>

            <p className="hero-description">
              Your favorite people. Something worth celebrating. Our vintage
              dessert trailer, serving up the cherry on top.
            </p>

            <div className="hero-actions">
              <a className="button" href="#contact">
                Plan your event
              </a>

              <a className="text-link" href="#experience">
                Meet the experience
              </a>
            </div>

            <p className="hero-note">
              Sundaes, shakes, floats, and plenty of happy guests.
            </p>
          </div>

          <figure className="hero-figure">
            <div className="hero-photo-frame">
              <div className="hero-photo">
                <Image
                  src="/images/trailer-service.jpg"
                  alt="A Cherries On Top team member serving guests from the dessert trailer"
                  fill
                  priority
                  sizes="(max-width: 680px) 100vw, 45vw"
                />
              </div>
            </div>

            <figcaption className="hero-caption">
              <span>A little vintage charm.</span>
              <span>A whole lot of joy.</span>
            </figcaption>
          </figure>
        </section>

        <div className="occasion-strip">
          <ul className="container occasion-list" aria-label="Events we cater">
            {occasions.map((occasion) => (
              <li key={occasion}>{occasion}</li>
            ))}
          </ul>
        </div>

        <section
          id="experience"
          className="container experience"
          aria-labelledby="experience-title"
        >
          <div>
            <p className="eyebrow">Good company. Great ice cream.</p>

            <h2 id="experience-title">
              We bring the treats. You make the memories.
            </h2>
          </div>

          <div className="experience-body">
            <p>
              From wedding receptions to backyard birthdays, our vintage
              dessert trailer brings something a little different to the party.
            </p>

            <p>
              Choose the treats your guests will love. Tell us what you’re
              planning. We’ll help you put together an ice cream experience
              that fits your celebration.
            </p>
          </div>
        </section>

        <section
          id="contact"
          className="contact"
          aria-labelledby="contact-title"
        >
          <div className="container contact-inner">
            <div>
              <h2 id="contact-title">Something sweet on the horizon?</h2>

              <p>
                Tell us your date, location, and guest count. Let’s talk about
                what you have in mind.
              </p>
            </div>

            <a
              className="button button-light"
              href="mailto:cherriesontopchester@gmail.com"
            >
              Let’s plan it
            </a>
          </div>
        </section>
      </main>

      <footer className="container site-footer">
        <p>Cherries On Top · Chester, New Jersey</p>

        <a
          className="text-link"
          href="https://www.instagram.com/cherriesontopchester/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Find us on Instagram
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </footer>
    </>
  );
}
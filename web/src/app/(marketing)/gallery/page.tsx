import type { Metadata } from "next";
import Link from "next/link";
import { PhotoGallery } from "@/components/marketing/photo-gallery";
import styles from "@/components/marketing/photo-gallery.module.css";
import { galleryPhotos } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Gallery | Cherries On Top",
  description:
    "A look inside Cherries On Top: our vintage trailer, handmade treats, and the people behind the scoops.",
};

export default function GalleryPage() {
  return (
    <main id="main-content">
      <div className="container">
        <section
          className={styles.intro}
          aria-labelledby="gallery-heading"
        >
          <p className="eyebrow">The Cherries On Top gallery</p>

          <h1 id="gallery-heading">Good times, by the scoop.</h1>

          <p className={styles.description}>
            A peek through our serving window. The treats, the trailer,
            and the little moments that make it all worthwhile.
          </p>
        </section>

        <PhotoGallery photos={galleryPhotos} />
      </div>

      <section
        className="contact"
        aria-labelledby="gallery-contact-heading"
      >
        <div className="container contact-inner">
          <div>
            <h2 id="gallery-contact-heading">
              Picture us at your next event.
            </h2>
            <p>
              Tell us what you have in mind. We would love to bring
              a little sweetness to it.
            </p>
          </div>

          <Link className="button button-light" href="/quote">
            Plan your event
          </Link>
        </div>
      </section>
    </main>
  );
}
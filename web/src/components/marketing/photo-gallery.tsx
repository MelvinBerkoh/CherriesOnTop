"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { GalleryPhoto } from "@/lib/gallery";
import styles from "./photo-gallery.module.css";

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [category, setCategory] = useState("All");
  const [activeId, setActiveId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);

  const categories = [
    "All",
    ...new Set(photos.map((photo) => photo.category)),
  ];
  const visible = photos.filter(
    (photo) => category === "All" || photo.category === category,
  );
  const activeIndex = visible.findIndex((photo) => photo.id === activeId);
  const activePhoto = visible[activeIndex];
  const isOpen = activeId !== null;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function openPhoto(photo: GalleryPhoto, button: HTMLButtonElement) {
    returnFocus.current = button;
    setActiveId(photo.id);
    dialog.current?.showModal();
  }

  function movePhoto(direction: number) {
    if (!visible.length) return;

    const nextIndex =
      (activeIndex + direction + visible.length) % visible.length;

    setActiveId(visible[nextIndex].id);
  }

  return (
    <>
      <section className={styles.gallery} aria-label="Photo gallery">
        <div
          className={styles.filters}
          role="group"
          aria-label="Filter photos"
        >
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={styles.filter}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <p className={styles.count} role="status">
          {visible.length} {visible.length === 1 ? "photo" : "photos"}
          {category !== "All"
            ? ` · ${category}`
            : " · A taste of life at Cherries On Top"}
        </p>

        <div className={styles.grid}>
          {visible.map((photo) => (
            <figure key={photo.id} className={styles.card}>
              <button
                type="button"
                className={styles.photoButton}
                aria-label={`Enlarge photo: ${photo.alt}`}
                aria-haspopup="dialog"
                onClick={(event) => openPhoto(photo, event.currentTarget)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw"
                />
                <span className={styles.enlarge} aria-hidden="true">
                  View photo ↗
                </span>
              </button>

              <figcaption>
                <span className={styles.category}>{photo.category}</span>
                <p>{photo.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label="Enlarged gallery photo"
        aria-describedby="gallery-photo-caption"
        onClose={() => {
          setActiveId(null);
          returnFocus.current?.focus();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            movePhoto(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;

          const bounds = event.currentTarget.getBoundingClientRect();

          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          ) {
            dialog.current?.close();
          }
        }}
      >
        <div className={styles.dialogTop}>
          <span>Cherries On Top · Gallery</span>

          <button
            type="button"
            className={styles.dialogButton}
            onClick={() => dialog.current?.close()}
            aria-label="Close enlarged photo"
          >
            Close ×
          </button>
        </div>

        {activePhoto && (
          <div className={styles.enlargedPhoto}>
            <Image
              key={activePhoto.id}
              src={activePhoto.src}
              alt={activePhoto.alt}
              fill
              sizes="(max-width: 1000px) 90vw, 1000px"
              className={styles.containedPhoto}
            />
          </div>
        )}

        <div className={styles.dialogBottom}>
          <div aria-live="polite" aria-atomic="true">
            <p id="gallery-photo-caption">{activePhoto?.caption}</p>
            <span className={styles.count}>
              {activeIndex + 1} of {visible.length}
            </span>
          </div>

          <div className={styles.arrows}>
            <button
              type="button"
              className={styles.dialogButton}
              aria-label="Previous photo"
              onClick={() => movePhoto(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className={styles.dialogButton}
              aria-label="Next photo"
              onClick={() => movePhoto(1)}
            >
              →
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
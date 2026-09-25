import { useEffect, useState } from "react";

export type HeroSlide = { alt: string; sizes: Array<{ src: string; width: number; height: number }> };

const INTERVAL_MS = 6000;

/**
 * Homepage hero photos that cross-fade in turn. Only the first photo loads
 * eagerly; the rest load after it. Visitors who prefer reduced motion see the
 * first photo only, and rotation pauses while the tab is hidden.
 */
export default function HeroSlides({ slides, sizes }: { slides: HeroSlide[]; sizes: string }) {
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setStarted(true);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setActive((index) => (index + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="jh-slides">
      {slides.map((slide, index) => {
        // Later photos are only requested once rotation has started.
        if (index > 0 && !started) return null;
        const largest = slide.sizes[slide.sizes.length - 1];
        return (
          <picture key={largest.src} className={index === active ? "is-active" : undefined} aria-hidden={index === active ? undefined : true}>
            <source type="image/webp" srcSet={slide.sizes.map((size) => `${size.src} ${size.width}w`).join(", ")} sizes={sizes} />
            <img
              src={largest.src}
              alt={index === active ? slide.alt : ""}
              width={largest.width}
              height={largest.height}
              fetchPriority={index === 0 ? "high" : "low"}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </picture>
        );
      })}
    </div>
  );
}

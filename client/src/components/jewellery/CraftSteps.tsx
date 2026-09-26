import { useEffect, useRef } from "react";
import "./CraftSteps.css";

interface CraftStep {
  slug: string;
  title: string;
  copy: string;
  posterAlt: string;
}

const STEPS: CraftStep[] = [
  {
    slug: "selection",
    title: "Diamond Selection",
    copy: "We carefully select lab grown diamonds for brilliance, clarity and balance so the final piece looks refined from every angle.",
    posterAlt: "A gemmologist inspecting a lab grown diamond with a loupe at a grading bench.",
  },
  {
    slug: "setting",
    title: "Precision Setting",
    copy: "Each stone is set with attention to proportion, security and comfort, so your jewellery feels beautiful and wearable.",
    posterAlt: "A jeweller setting a diamond into a ring at a workbench.",
  },
  {
    slug: "finishing",
    title: "Final Finishing",
    copy: "Every piece is polished, checked and packed with care before it reaches you.",
    posterAlt: "A finished Alvora ring being checked before packing.",
  },
];

// The owner dropped the 4:5 variants: every placement uses the 16:9 clips.
function assetBase(slug: string) {
  return `/assets/craft/${slug}-16x9`;
}

/** Adds VideoObject JSON-LD for the three clips (homepage only). */
function useCraftJsonLd(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const id = "craft-steps-jsonld";
    if (document.getElementById(id)) return;
    const origin = window.location.origin;
    const uploadDate = new Date().toISOString().slice(0, 10);
    const graph = STEPS.map((step) => ({
      "@type": "VideoObject",
      name: step.title,
      description: step.copy,
      thumbnailUrl: `${origin}${assetBase(step.slug)}.jpg`,
      contentUrl: `${origin}${assetBase(step.slug)}.mp4`,
      uploadDate,
    }));
    const el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    el.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.appendChild(el);
    return () => el.remove();
  }, [enabled]);
}

export default function CraftSteps({ withJsonLd = false }: { withJsonLd?: boolean }) {
  const rootRef = useRef<HTMLElement | null>(null);
  useCraftJsonLd(withJsonLd);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const videos = Array.from(root.querySelectorAll("video"));
    if (reduced) {
      // Reduced-motion visitors get the poster only; the clips never autoplay.
      videos.forEach((video) => video.pause());
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.4 },
    );
    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="craft-steps" aria-labelledby="craft-steps-heading" ref={rootRef}>
      <h2 id="craft-steps-heading">How your piece is made</h2>
      <div className="craft-steps-row">
        {STEPS.map((step) => {
          const base = assetBase(step.slug);
          return (
            <article className="craft-step" key={step.slug}>
              <div className="craft-step-media">
                <video
                  muted
                  loop
                  playsInline
                  preload="none"
                  poster={`${base}.jpg`}
                  aria-label={step.title}
                >
                  <source src={`${base}.webm`} type="video/webm" />
                  <source src={`${base}.mp4`} type="video/mp4" />
                </video>
              </div>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          );
        })}
      </div>
      {/* Remove this caption only when the owner replaces these clips with
          real workshop footage. */}
      <p className="craft-steps-caption">Illustrative footage.</p>
    </section>
  );
}

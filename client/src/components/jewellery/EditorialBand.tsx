import type { ReactNode } from "react";

type Props = {
  image: string;
  image800?: string;
  alt: string;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  caption?: string;
  reverse?: boolean;
  tone?: "paper" | "vellum" | "ink";
};

/**
 * A calm editorial break between product rows: one large photograph and a
 * ruled text column, using the bench photography already on the site.
 */
export default function EditorialBand({ image, image800, alt, eyebrow, title, children, caption, reverse = false, tone = "vellum" }: Props) {
  return (
    <section className={`jw-band jw-band-${tone}${reverse ? " is-reverse" : ""}`}>
      <figure className="jw-band-figure">
        <img src={image} srcSet={image800 ? `${image800} 800w, ${image} 1600w` : undefined} sizes="(min-width: 900px) 50vw, 100vw" alt={alt} loading="lazy" decoding="async" />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
      <div className="jw-band-copy">
        <p className="jw-eyebrow">{eyebrow}</p>
        <h2 className="jw-band-title">{title}</h2>
        {children}
      </div>
    </section>
  );
}

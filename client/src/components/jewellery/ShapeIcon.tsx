/**
 * Outline drawings of each diamond shape, drawn on a 48×48 grid with a
 * hairline stroke so they sit with the ruled, technical Alvora look.
 */
import type { ReactElement } from "react";

type Props = { shape: string | null; size?: number; className?: string; title?: string };

const PATHS: Record<string, ReactElement> = {
  round: (
    <>
      <circle cx="24" cy="24" r="17" />
      <circle cx="24" cy="24" r="8.5" />
      <path d="M24 7v8.5M24 32.5V41M7 24h8.5M32.5 24H41M12 12l6 6M30 30l6 6M36 12l-6 6M18 30l-6 6" />
    </>
  ),
  oval: (
    <>
      <ellipse cx="24" cy="24" rx="12" ry="18" />
      <ellipse cx="24" cy="24" rx="6" ry="9" />
      <path d="M24 6v9M24 33v9M12 24h6M30 24h6" />
    </>
  ),
  emerald: (
    <>
      <path d="M17 6h14l6 6v24l-6 6H17l-6-6V12z" />
      <path d="M19 11h10l3 3v20l-3 3H19l-3-3V14z" />
      <path d="M21 16h6v16h-6z" />
    </>
  ),
  pear: (
    <>
      <path d="M24 5c6 8 13 16 13 25a13 13 0 0 1-26 0c0-9 7-17 13-25z" />
      <path d="M24 15c3 5 6.5 10 6.5 15a6.5 6.5 0 0 1-13 0c0-5 3.5-10 6.5-15z" />
    </>
  ),
  marquise: (
    <>
      <path d="M24 4c9 7 12 13 12 20s-3 13-12 20c-9-7-12-13-12-20s3-13 12-20z" />
      <path d="M24 14c4 3.5 5.5 6.5 5.5 10s-1.5 6.5-5.5 10c-4-3.5-5.5-6.5-5.5-10s1.5-6.5 5.5-10z" />
    </>
  ),
  radiant: (
    <>
      <path d="M16 6h16l5 5v26l-5 5H16l-5-5V11z" />
      <path d="M16 6l8 18 8-18M16 42l8-18 8 18M11 11l13 13 13-13M11 37l13-13 13 13" />
    </>
  ),
  cushion: (
    <>
      <rect x="8" y="8" width="32" height="32" rx="9" />
      <rect x="16" y="16" width="16" height="16" rx="4" />
      <path d="M11 11l5 5M37 11l-5 5M11 37l5-5M37 37l-5-5" />
    </>
  ),
  "elongated-cushion": (
    <>
      <rect x="11" y="5" width="26" height="38" rx="9" />
      <rect x="17" y="13" width="14" height="22" rx="4" />
      <path d="M14 8l3 5M34 8l-3 5M14 40l3-5M34 40l-3-5" />
    </>
  ),
  "old-mine": (
    <>
      <rect x="8" y="8" width="32" height="32" rx="11" />
      <circle cx="24" cy="24" r="6" />
      <path d="M24 8v10M24 30v10M8 24h10M30 24h10" />
    </>
  ),
  asscher: (
    <>
      <path d="M17 7h14l10 10v14L31 41H17L7 31V17z" />
      <path d="M19 12h10l7 7v10l-7 7H19l-7-7V19z" />
      <path d="M21 17h6l4 4v6l-4 4h-6l-4-4v-6z" />
    </>
  ),
  hexagon: (
    <>
      <path d="M24 5l16 9.5v19L24 43 8 33.5v-19z" />
      <path d="M24 14l8 4.75v9.5L24 33l-8-4.75v-9.5z" />
    </>
  ),
  princess: (
    <>
      <rect x="9" y="9" width="30" height="30" />
      <path d="M9 9l30 30M39 9L9 39" />
      <rect x="17" y="17" width="14" height="14" />
    </>
  ),
  trillion: (
    <>
      <path d="M24 7l17 31H7z" />
      <path d="M24 17l8 15H16z" />
    </>
  ),
  baguette: (
    <>
      <rect x="15" y="5" width="18" height="38" />
      <rect x="19" y="10" width="10" height="28" />
    </>
  ),
  heart: (
    <>
      <path d="M24 41S7 30 7 18a8.5 8.5 0 0 1 17-3 8.5 8.5 0 0 1 17 3c0 12-17 23-17 23z" />
      <path d="M24 32s-8-5-8-12a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 7-8 12-8 12z" />
    </>
  ),
};

export default function ShapeIcon({ shape, size = 36, className, title }: Props) {
  const drawing = (shape && PATHS[shape]) || PATHS.round;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {drawing}
    </svg>
  );
}

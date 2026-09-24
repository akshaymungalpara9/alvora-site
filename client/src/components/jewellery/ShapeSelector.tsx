import { Link } from "wouter";
import ShapeIcon from "./ShapeIcon";

export const SHOP_SHAPES: Array<{ shape: string; label: string }> = [
  { shape: "oval", label: "Oval" },
  { shape: "round", label: "Round" },
  { shape: "emerald", label: "Emerald" },
  { shape: "pear", label: "Pear" },
  { shape: "marquise", label: "Marquise" },
  { shape: "radiant", label: "Radiant" },
  { shape: "elongated-cushion", label: "Elongated cushion" },
  { shape: "old-mine", label: "Old mine" },
  { shape: "asscher", label: "Asscher" },
];

type Props = {
  /** Link target for a shape. Defaults to the engagement shape pages. */
  hrefFor?: (shape: string) => string;
  active?: string | null;
  shapes?: Array<{ shape: string; label: string }>;
  heading?: string;
};

/** Horizontal "shop by shape" rail; scrolls sideways on narrow screens. */
export default function ShapeSelector({ hrefFor = (shape) => `/engagement-rings/shape/${shape}`, active = null, shapes = SHOP_SHAPES, heading }: Props) {
  return (
    <nav className="jw-shapes" aria-label={heading ?? "Shop by shape"}>
      <ul>
        {shapes.map(({ shape, label }) => (
          <li key={shape}>
            <Link href={hrefFor(shape)} className={`jw-shape${active === shape ? " is-active" : ""}`} aria-current={active === shape ? "page" : undefined}>
              <ShapeIcon shape={shape} size={40} />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

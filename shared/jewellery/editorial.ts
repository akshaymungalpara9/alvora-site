/**
 * Editorial copy for SEO money pages and their supporting guides.
 * Written answer-first: the first sentence under every heading answers the
 * heading on its own, so both searchers and AI answers can quote it.
 * See seo/reports for the research behind each page.
 */
import { PUBLIC_PIECES, type JewelleryPiece } from "./catalog";
import { formatInr, fromPriceInr } from "./pricing";

export type EditorialSection = { heading: string; body: string[]; link?: { label: string; href: string } };

export type ShapeContent = {
  title: string;
  description: string;
  heading: string;
  intro: string;
  sections: EditorialSection[];
  guide?: { label: string; href: string };
};



function priceSpan(pieces: JewelleryPiece[]) {
  const prices = pieces.map((p) => fromPriceInr(p)).filter((p): p is number => p != null).sort((a, b) => a - b);
  if (!prices.length) return null;
  return { from: prices[0], to: prices[prices.length - 1], count: prices.length };
}

/** Per-shape copy for /engagement-rings/shape/:shape. Shapes without an entry use the generic template. */
export function shapeContentFor(shape: string): ShapeContent | null {
  if (shape !== "marquise") return null;
  const pieces = PUBLIC_PIECES.filter((p) => p.shape === "marquise" && p.collections.includes("engagement-rings"));
  const dutch = pieces.filter((p) => p.tags.includes("dutch-marquise")).length;
  // This copy is about vintage and Dutch marquise; without Dutch pieces on sale
  // it would promise rings we do not show, so the generic template is used.
  if (!dutch) return null;
  const span = priceSpan(pieces);
  const fromText = span ? ` from ${formatInr(span.from)}` : "";
  return {
    title: "Vintage & Dutch Marquise Engagement Rings, Lab-Grown | Alvora",
    description: `Vintage-style marquise and Dutch marquise lab-grown diamond engagement rings with milgrain, filigree and engraved detail, made to order in silver, 14K or 18K gold, or platinum${fromText}.`,
    heading: "Vintage & Dutch marquise engagement rings",
    intro: `Lab-grown marquise diamonds in vintage-style settings, from the classic curved marquise to the straighter-sided Dutch marquise, made to your size in silver, 14K or 18K gold, or platinum${fromText}.`,
    guide: { label: "Dutch marquise or classic marquise? Read the guide", href: "/guides/dutch-marquise-vs-marquise" },
    sections: [
      {
        heading: "What makes a marquise engagement ring vintage?",
        body: [
          "The setting does. Milgrain edges, filigree, hand engraving and leaf- or flower-shaped claws give a marquise the look of an heirloom, while the long, pointed stone itself has been a jewellery classic since 18th-century France.",
          "Most of the rings on this page carry at least one of those details. Each product page names the detailing on that ring.",
        ],
      },
      {
        heading: "Dutch marquise or classic marquise?",
        body: [
          "A classic marquise has smoothly curved sides that meet in two points; a Dutch marquise has straight, angled sides that form a long six-sided outline, so it reads slightly wider and more geometric on the hand.",
          `${dutch} of the ${pieces.length} rings here are Dutch marquise. Both shapes lengthen the look of the finger.`,
        ],
        link: { label: "Compare the two shapes in detail", href: "/guides/dutch-marquise-vs-marquise" },
      },
      {
        heading: "How much does a lab-grown marquise engagement ring cost?",
        body: [
          span
            ? `Our marquise engagement rings start at ${formatInr(span.from)} in 925 sterling silver with a 0.5 ct centre stone; the price rises with the centre-stone size and metal you choose.`
            : "Prices depend on the centre-stone size and gold you choose.",
          "You receive a written price for your exact ring, stone and size before anything is made, and nothing is charged until you confirm.",
        ],
        link: { label: "Book a free consultation", href: "/book-a-consultation" },
      },
    ],
  };
}

export type Guide = {
  slug: string;
  title: string;
  description: string;
  heading: string;
  /** One-sentence direct answer shown first. */
  answer: string;
  published: string;
  sections: EditorialSection[];
  /** Pieces to show beneath the guide. */
  pieces: () => JewelleryPiece[];
  cta: { label: string; href: string };
};

export const GUIDES: Guide[] = [
  {
    slug: "dutch-marquise-vs-marquise",
    title: "Dutch Marquise vs Marquise Cut: What's the Difference? | Alvora",
    description: "A Dutch marquise has straight, angled sides forming a six-sided outline; a classic marquise has curved sides. How they look on the hand, and which to choose.",
    heading: "Dutch marquise vs marquise: what's the difference?",
    answer:
      "A classic marquise has smoothly curved sides that meet in two points, like a boat; a Dutch marquise keeps the same long, pointed shape but has straight, angled sides, giving it an elongated six-sided outline that looks a little wider and more geometric.",
    published: "2026-09-24",
    sections: [
      {
        heading: "How do they look on the hand?",
        body: [
          "Both lengthen the look of the finger. The classic marquise is the slimmer and more dramatic of the two, with a narrow, blade-like profile.",
          "The Dutch marquise is fuller through the middle because its sides run straight instead of curving in, so the same carat weight can read slightly broader from above. Its crisp edges catch light in clean flashes rather than a soft sweep.",
        ],
      },
      {
        heading: "Which one looks more vintage?",
        body: [
          "The Dutch marquise, usually. Its faceted, antique-inspired outline pairs naturally with milgrain, filigree and engraved bands, which is why most of our Dutch marquise rings sit in heritage settings.",
          "A classic marquise can be vintage too; it depends on the setting. In a slim modern solitaire it looks clean and contemporary, and in a milgrain or filigree mount it looks like an heirloom.",
        ],
      },
      {
        heading: "Is a Dutch marquise less likely to chip?",
        body: [
          "Neither shape is safer by itself. Both have two points, and those points are the most exposed part of the stone, so what protects them is the setting: V-shaped prongs or claws that wrap each tip.",
          "Ask us to confirm how the points are held on any ring you are considering; we include it in your written quote.",
        ],
      },
      {
        heading: "Are Dutch marquise diamonds available lab-grown?",
        body: [
          "Yes. The Dutch marquise has grown mainly in lab-grown diamonds, because lab-grown stones can be cut to newer specialty shapes more readily. Every stone we set is lab-grown: the same carbon crystal as a mined diamond, grown under controlled conditions.",
        ],
        link: { label: "Are lab-grown diamonds real?", href: "/insights/are-lab-grown-diamonds-real-diamonds" },
      },
      {
        heading: "How do I choose between them?",
        body: [
          "Choose the classic marquise if you want the slimmest, most elongated look, or a modern solitaire. Choose the Dutch marquise if you love an antique, faceted look and want a stone that reads a little fuller on the hand.",
          "If you are still unsure, a short consultation lets you compare both side by side before anything is made.",
        ],
        link: { label: "Book a free consultation", href: "/book-a-consultation" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.shape === "marquise" && p.collections.includes("engagement-rings")).sort((a, b) => Number(b.tags.includes("dutch-marquise")) - Number(a.tags.includes("dutch-marquise")) || b.featuredScore - a.featuredScore).slice(0, 8),
    cta: { label: "See all marquise engagement rings", href: "/engagement-rings/shape/marquise" },
  },
];

/** A guide is published only while it has pieces on sale to point at. */
export function isGuideLive(guide: Guide) {
  return guide.pieces().some((piece) => piece.tags.includes("dutch-marquise")) || !guide.slug.includes("dutch-marquise");
}

export const LIVE_GUIDES = GUIDES.filter(isGuideLive);

export function findGuide(slug: string) {
  return LIVE_GUIDES.find((guide) => guide.slug === slug);
}

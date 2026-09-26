/**
 * Centre stone for engagement rings and necklaces/pendants: the carat sizes a
 * customer can choose, the standard grade (owner-confirmed 2026-09-25:
 * E colour, VS1 clarity, Excellent cut) and the story shown on the product page.
 */
import type { JewelleryPiece } from "./catalog";

/** 0.5 ct to 6 ct in half-carat steps. */
export const CENTRE_STONE_CARATS = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6"];

export const CENTRE_STONE_GRADE = { colour: "E", clarity: "VS1", cut: "Excellent" } as const;

type Piece = Pick<JewelleryPiece, "category" | "collections" | "shape" | "shapeLabel" | "stoneColourLabel">;

/** Engagement rings and necklaces/pendants are made around a chosen centre stone. */
export function hasCentreStone(piece: Pick<JewelleryPiece, "category" | "collections">) {
  return piece.category === "pendant" || piece.collections.includes("engagement-rings");
}

/** Colour grades apply to white diamonds only; coloured diamonds are described by their colour. */
export function isWhite(piece: Piece) {
  return !piece.stoneColourLabel;
}

/**
 * Laboratories give a cut grade to round brilliants; other shapes are graded
 * on polish and symmetry, so the wording follows the shape.
 */
function cutWording(piece: Piece) {
  return piece.shape === "round" ? `${CENTRE_STONE_GRADE.cut} cut` : `${CENTRE_STONE_GRADE.cut} polish and symmetry`;
}

export function centreStoneSpec(piece: Piece): Array<{ label: string; value: string }> {
  return [
    { label: "Carat", value: `${CENTRE_STONE_CARATS[0]} – ${CENTRE_STONE_CARATS[CENTRE_STONE_CARATS.length - 1]} ct, your choice` },
    isWhite(piece) ? { label: "Colour", value: `${CENTRE_STONE_GRADE.colour}, colourless` } : { label: "Colour", value: `${piece.stoneColourLabel} lab-grown diamond` },
    { label: "Clarity", value: `${CENTRE_STONE_GRADE.clarity}, eye-clean` },
    { label: "Cut", value: piece.shape === "round" ? CENTRE_STONE_GRADE.cut : `${CENTRE_STONE_GRADE.cut} polish & symmetry` },
    { label: "Origin", value: "Lab-grown, cut in Surat" },
  ];
}

const SHAPE_LINES: Record<string, string> = {
  round: "A round brilliant is cut for pure sparkle: dozens of facets arranged to send as much light as possible back to the eye.",
  oval: "An oval keeps the fire of a round brilliant in a longer, softer outline that gently lengthens the look of the hand.",
  moval: "A moval sits between a marquise and an oval: long and elegant, with softly tapered ends.",
  emerald: "An emerald cut trades glitter for clarity of line. Long step facets open like a hall of mirrors, with calm, bright flashes of light.",
  pear: "A pear joins the round and the marquise in one stone: a teardrop that points gracefully along the finger.",
  marquise: "A marquise looks the largest of any shape for its weight: a long, pointed stone with a history reaching back to eighteenth-century France.",
  radiant: "A radiant pairs the clean, cropped corners of an emerald cut with the brilliance of a round, so it sparkles from edge to edge.",
  cushion: "A cushion's pillowed corners and generous facets give it a warm, romantic glow.",
  "elongated-cushion": "An elongated cushion stretches that pillowed outline into a graceful rectangle, soft at the corners and long on the hand.",
  "old-mine": "An old mine cut recalls the hand-cut diamonds of the 1800s: a high crown, a small table and broad facets that glow like candlelight.",
  "old-euro": "An old European cut, the round of the early twentieth century, has broad facets that give a soft, flickering sparkle.",
  asscher: "An asscher is a square step cut with deep cropped corners, its facets drawing the eye into a windmill pattern at its heart.",
  baguette: "A baguette is a slim rectangular step cut: clean lines and quiet, mirror-like light.",
  hexagon: "A hexagon's six crisp sides give a modern, architectural outline with bright, geometric flashes.",
  princess: "A princess cut is a square brilliant, sharp at the corners and full of sparkle.",
};

export function centreStoneStory(piece: Piece): { heading: string; paragraphs: string[] } {
  const shapeLine = (piece.shape && SHAPE_LINES[piece.shape]) || "Your centre stone is chosen for its shape, then cut and polished to show its light.";
  const grade = isWhite(piece)
    ? `We set it at ${CENTRE_STONE_GRADE.colour} colour, ${CENTRE_STONE_GRADE.clarity} clarity and ${cutWording(piece)}. E sits in the colourless range, a single step from the top grade, so the stone reads icy-white in any metal. VS1 means any tiny inclusions can only be found under 10x magnification: to the eye, the stone is clean.`
    : `We set it at ${CENTRE_STONE_GRADE.clarity} clarity with ${cutWording(piece)}, so its ${piece.stoneColourLabel!.toLowerCase()} colour is carried by clean, lively light. VS1 means any tiny inclusions can only be found under 10x magnification: to the eye, the stone is clean.`;
  return {
    heading: "Your centre stone",
    paragraphs: [
      shapeLine,
      "Grown, not mined. Your diamond is grown from carbon in a laboratory and is a real diamond, with the same crystal structure, hardness and fire as one taken from the ground. There is no mine behind it and no question over where it came from.",
      `${grade} Choose any size from ${CENTRE_STONE_CARATS[0]} to ${CENTRE_STONE_CARATS[CENTRE_STONE_CARATS.length - 1]} carats.`,
      "It is cut and polished in Surat, India, the city where most of the world's diamonds are cut, and checked against its grade before it is set by hand in the metal you choose. Every stone ships with its own IGI or GIA report.",
    ],
  };
}

/** One-line summary for meta descriptions and structured data. */
export function centreStoneSummary(piece: Piece) {
  const colour = isWhite(piece) ? `${CENTRE_STONE_GRADE.colour} colour, ` : "";
  return `Centre stone 0.5 to 6 ct, ${colour}${CENTRE_STONE_GRADE.clarity} clarity, ${cutWording(piece)}, lab-grown.`;
}

/**
 * Titles and descriptions for the jewellery routes. Shared by the server
 * (initial HTML for crawlers) and the client (SPA navigation) so both agree.
 */
import { centreStoneSummary, hasCentreStone } from "./centreStone";
import type { JewelleryPiece } from "./catalog";
import { shapeContentFor } from "./editorial";

export type JewelleryRouteMeta = { title: string; description: string };

export const JEWELLERY_HOME_META: JewelleryRouteMeta = {
  title: "Lab-Grown Diamond Engagement Rings & Fine Jewellery | Alvora",
  description:
    "Engagement rings and earrings set with lab-grown diamonds, from Alvora, a diamond house in Surat. Choose a piece and enquire for sizing and price.",
};

export const JEWELLERY_COLLECTION_META: Record<string, JewelleryRouteMeta & { heading: string; intro: string }> = {
  "/jewellery": {
    title: "Lab-Grown Diamond Jewellery Collection | Alvora",
    description: "Every Alvora piece in one place: lab-grown diamond engagement rings and earrings in solid gold, each priced or quoted before anything is made.",
    heading: "The collection",
    intro: "Every piece we currently make, in one place. Filter by shape, setting or metal, then open a piece to choose its details.",
  },
  "/engagement-rings": {
    title: "Lab-Grown Diamond Engagement Rings | Alvora",
    description: "Lab-grown diamond engagement rings in oval, round, emerald, pear and antique cuts. Solitaire, bezel, east-west and heritage settings in solid gold.",
    heading: "Engagement rings",
    intro: "Solitaires, bezels, east-west and heritage settings, each made to your size in yellow, white or rose gold.",
  },
  "/rings": {
    title: "Lab-Grown Diamond Rings in Solid Gold | Alvora",
    description: "Alvora rings set with lab-grown diamonds: solitaires, three-stone, halo and heritage designs, made to your size in 14K or 18K gold.",
    heading: "Rings",
    intro: "Rings for every day and for the day itself, set with lab-grown diamonds and made to your size.",
  },
  "/earrings": {
    title: "Lab-Grown Diamond Earrings & Studs | Alvora",
    description: "Lab-grown diamond studs, halo studs and drop earrings in solid gold from Alvora. Matched pairs, set by hand, with prices shown.",
    heading: "Earrings",
    intro: "Studs and drops with matched pairs of lab-grown diamonds, from everyday pieces to statement pairs.",
  },
  "/necklaces": {
    title: "Lab-Grown Diamond Necklaces & Pendants | Alvora",
    description: "Lab-grown diamond necklaces and pendants on fine gold chains: solitaire and halo designs in round, oval, emerald, pear, marquise and more, from Alvora.",
    heading: "Necklaces & pendants",
    intro: "A single lab-grown diamond on a fine gold chain: solitaire and halo pendants in the shape you love, in yellow, white or rose gold.",
  },
  "/wedding-bands": {
    title: "Lab-Grown Diamond Wedding & Eternity Bands | Alvora",
    description: "Eternity bands and wrap rings set with lab-grown diamonds, made in solid gold to sit beside your engagement ring.",
    heading: "Wedding & bands",
    intro: "Eternity bands and wrap rings, made to sit beside your engagement ring.",
  },
  "/jewellery/antique-cuts": {
    title: "Antique Cut Lab-Grown Diamond Rings | Alvora",
    description: "Old mine, old European and rose-cut lab-grown diamonds in heritage settings. Antique-cut engagement rings with soft, candlelit sparkle.",
    heading: "Antique cuts",
    intro: "Old mine, old European and rose cuts: broad facets and a softer, candlelit sparkle.",
  },
  "/jewellery/coloured-stones": {
    title: "Champagne, Green & Coloured Diamond Rings | Alvora",
    description: "Champagne, green, pink and blue lab-grown diamonds in engagement rings and fine jewellery, set in solid gold by Alvora.",
    heading: "Coloured stones",
    intro: "Champagne, green, pink and blue stones for a ring that is entirely your own.",
  },
};

export const CONSULTATION_META: JewelleryRouteMeta = {
  title: "Book a Jewellery Consultation | Alvora",
  description: "Book a WhatsApp or phone consultation with Alvora to choose a lab-grown diamond ring, confirm your size and metal, and get a price for your piece.",
};

export function shapePageMeta(shape: string, label: string): JewelleryRouteMeta {
  const editorial = shapeContentFor(shape);
  if (editorial) return { title: editorial.title, description: editorial.description };
  return {
    title: `${label} Lab-Grown Diamond Engagement Rings | Alvora`,
    description: `${label} lab-grown diamond engagement rings from Alvora: solitaire, bezel, east-west and heritage settings in solid gold, made to your size.`,
  };
}

export function pieceMeta(piece: Pick<JewelleryPiece, "name" | "description" | "fromPriceUsd" | "shapeLabel" | "styleLabel" | "category" | "collections" | "shape" | "stoneColourLabel">): JewelleryRouteMeta {
  const price = piece.fromPriceUsd != null ? ` From $${piece.fromPriceUsd.toLocaleString("en-US")}.` : "";
  const stone = hasCentreStone(piece) ? ` ${centreStoneSummary(piece)}` : "";
  return {
    title: `${piece.name} | Alvora`,
    // Leading with the name keeps descriptions unique across similar designs.
    description: `The ${piece.name}: ${piece.description.charAt(0).toLowerCase()}${piece.description.slice(1)}${stone}${price} Choose your metal and size, then enquire.`.slice(0, 300),
  };
}

export const TRADE_JEWELLERY_META: JewelleryRouteMeta = {
  title: "Wholesale Lab-Grown Diamond Jewellery for Retailers | Alvora Trade",
  description: "Finished lab-grown diamond jewellery for retailers and brands: engagement rings and earrings in solid gold, with private label and trade line sheets.",
};

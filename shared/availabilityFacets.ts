/**
 * Canonical facet map for the crawlable /availability slices.
 *
 * Each facet is a single URL that queries the SAME public tRPC endpoint the
 * main /availability page uses, with a pre-set filter. The filter values below
 * are the exact strings present in the live availability catalogue - hand-mapped
 * from a `getPublicAvailabilitySummary` query on 17 Sep 2026, so we don't rely
 * on lowercase substring matching that could drift as the data changes.
 *
 * The live catalogue has known casing inconsistency (e.g. "Round" alongside
 * "ROUND", "10ct +" alongside "10ct+"). Every facet enumerates every observed
 * variant. When the catalogue is normalised in a future import pass, the
 * duplicate entries here can be trimmed down.
 *
 * When you add a new observed value in the catalogue (via a new import), pull
 * the summary via scripts/query-availability-summary.mjs and add the value to
 * the appropriate facet below. Nothing else changes.
 */

/** All facets use the "core" collection today; Statement stones are addressed by their own catalogue tab. */
export type FacetCollection = "core";

export interface AvailabilityFacet {
  slug: string; // route path segment
  route: string; // full public URL path
  displayName: string;
  category?: "White" | "Fancy Colour"; // undefined = both categories
  colours?: string[];
  shapes?: string[];
  caratBands?: string[];
  observedTotal: number; // count seen in the 17 Sep 2026 summary; for documentation, not enforced
}

/**
 * Canonical facet list. Order matters for the /availability discovery strip -
 * colour facets first, shape facets next, size facet last.
 */
export const AVAILABILITY_FACETS: AvailabilityFacet[] = [
  {
    slug: "pink-lab-grown-diamonds",
    route: "/pink-lab-grown-diamonds",
    displayName: "Pink",
    category: "Fancy Colour",
    colours: [
      "VIVID PINK",
      "Fancy Vivid Pink",
      "Fancy Intense Pink",
      "INTENSE PINK",
      "Fancy Pink",
      "FANCY PINK",
      "Fancy Light Pink",
      "Light Pink",
    ],
    observedTotal: 982,
  },
  {
    slug: "blue-lab-grown-diamonds",
    route: "/blue-lab-grown-diamonds",
    displayName: "Blue",
    category: "Fancy Colour",
    colours: ["Fancy Vivid Blue", "Fancy Vivid Greenish Blue"],
    observedTotal: 100,
  },
  {
    slug: "yellow-lab-grown-diamonds",
    route: "/yellow-lab-grown-diamonds",
    displayName: "Yellow",
    category: "Fancy Colour",
    colours: ["VIVID YELLOW", "INTENSE YELLOW"],
    observedTotal: 97,
  },
  {
    slug: "white-lab-grown-diamonds",
    route: "/white-lab-grown-diamonds",
    displayName: "White (D–G, VVS1–SI1)",
    category: "White",
    // Filter by category alone - the White collection is entirely D/E/F/G by
    // definition. Enumerating colours here would silently exclude any future
    // colourless stone imported outside the D–G band, which shouldn't happen
    // per Alvora's stated range but we don't need to enforce it twice.
    observedTotal: 1155,
  },
  {
    slug: "round-lab-grown-diamonds",
    route: "/round-lab-grown-diamonds",
    displayName: "Round brilliant",
    shapes: ["Round", "ROUND"],
    observedTotal: 1533,
  },
  {
    slug: "pear-lab-grown-diamonds",
    route: "/pear-lab-grown-diamonds",
    displayName: "Pear",
    shapes: ["Pear", "PEAR"],
    observedTotal: 256,
  },
  {
    slug: "radiant-lab-grown-diamonds",
    route: "/radiant-lab-grown-diamonds",
    displayName: "Radiant",
    shapes: ["Radiant", "RADIANT"],
    observedTotal: 155,
  },
  {
    slug: "large-lab-grown-diamonds",
    route: "/large-lab-grown-diamonds",
    displayName: "Large (5 ct +)",
    caratBands: ["5.00–9.99ct", "10ct +", "10ct+"],
    observedTotal: 188,
  },
];

/** Fast lookup by route path. */
export const FACET_BY_ROUTE: Record<string, AvailabilityFacet> = Object.fromEntries(
  AVAILABILITY_FACETS.map((facet) => [facet.route, facet]),
);

/**
 * The tRPC input the facet route sends to publicAvailability.profiles.
 * Filters translate to the same array-of-strings inputs the standard
 * /availability page uses; nothing bypasses the public no-price contract.
 */
export function facetToProfilesInput(facet: AvailabilityFacet, page = 0, pageSize = 48) {
  return {
    collection: "core" as const,
    ...(facet.category ? { category: facet.category } : {}),
    ...(facet.shapes?.length ? { shapes: facet.shapes } : {}),
    ...(facet.caratBands?.length ? { caratBands: facet.caratBands } : {}),
    ...(facet.colours?.length ? { colours: facet.colours } : {}),
    sort: "carat_desc" as const,
    page,
    pageSize,
  };
}

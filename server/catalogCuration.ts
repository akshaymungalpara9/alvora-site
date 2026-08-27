export type CatalogSort = "curated" | "carat_desc" | "carat_asc" | "new_arrivals";

export type CuratableStone = {
  stockNumber: string;
  category: string | null;
  shape: string | null;
  carat: number;
  color: string | null;
  clarity: string | null;
  cut: string | null;
  polish: string | null;
  symmetry: string | null;
  fluorescence: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
};

export type CurationMetadata = {
  pinned: boolean;
  pinRank: number | null;
  heroNote: string | null;
  firstSeenAt: Date;
};

export type CuratableCatalogRow<T extends CuratableStone = CuratableStone> = {
  stone: T;
  curation: CurationMetadata | null;
};

const normalize = (value: string | null | undefined) => value?.trim().replace(/\s+/g, " ").toUpperCase() ?? "";

export function clarityScore(clarity: string | null | undefined) {
  return ({ VVS1: 100, VVS2: 90, VS1: 70, VS2: 55, SI1: 30, SI2: 15 } as Record<string, number>)[normalize(clarity)] ?? 0;
}

export function cutScore(cut: string | null | undefined) {
  const value = normalize(cut);
  if (!value || value === "N/A") return 50;
  if (value.includes("IDEAL") || value.includes("H&A") || value.includes("HEARTS")) return 100;
  if (value === "EX" || value.includes("EXCELLENT")) return 85;
  if (value === "VG" || value.includes("VERY GOOD")) return 60;
  if (value === "GD" || value.includes("GOOD")) return 40;
  if (value === "F" || value.includes("FAIR")) return 20;
  return 50;
}

export function polishSymmetryScore(polish: string | null | undefined, symmetry: string | null | undefined) {
  const polishValue = normalize(polish);
  const symmetryValue = normalize(symmetry);
  const excellent = (value: string) => value === "EX" || value.includes("EXCELLENT");
  const veryGood = (value: string) => value === "VG" || value.includes("VERY GOOD");
  if (excellent(polishValue) && excellent(symmetryValue)) return 100;
  if ((excellent(polishValue) && veryGood(symmetryValue)) || (veryGood(polishValue) && excellent(symmetryValue))) return 85;
  if (veryGood(polishValue) && veryGood(symmetryValue)) return 70;
  return 50;
}

export function fluorescenceScore(fluorescence: string | null | undefined) {
  const value = normalize(fluorescence);
  if (!value) return 80;
  if (value === "NONE" || value === "NO" || value === "NIL") return 100;
  if (value.includes("VERY SLIGHT")) return 90;
  if (value === "SLIGHT" || value === "FAINT") return 75;
  if (value.includes("MEDIUM")) return 40;
  if (value.includes("STRONG")) return 15;
  return 80;
}

export function colourRarityScore(color: string | null | undefined) {
  const value = normalize(color);
  const tiers: Array<[number, string[]]> = [
    [100, ["FANCY VIVID BLUE"]], [95, ["FANCY VIVID GREEN"]], [90, ["FANCY VIVID PINK"]],
    [85, ["FANCY VIVID GREENISH BLUE", "FANCY DEEP BLUE"]], [75, ["FANCY INTENSE PINK"]],
    [70, ["FANCY VIVID YELLOW", "FANCY INTENSE BLUE"]], [65, ["FANCY INTENSE GREEN"]],
    [60, ["FANCY INTENSE YELLOW", "FANCY DEEP ORANGE"]], [50, ["FANCY PINK"]],
    [40, ["FANCY LIGHT PINK"]], [35, ["FANCY YELLOW"]], [25, ["FANCY BROWNISH PINK", "LIGHT PINK", "LIGHT ORANGEY PINK"]],
    [15, ["FANCY BROWN", "FANCY LIGHT BROWN", "FANCY YELLOW BROWN"]],
  ];
  for (const [score, values] of tiers) if (values.includes(value)) return score;
  return value.includes("FANCY") ? 30 : 20;
}

export function colourGradeScore(color: string | null | undefined) {
  const value = normalize(color).replace(/[^A-Z-]/g, "");
  return ({ D: 100, E: 90, F: 80, G: 65, H: 50, I: 35, J: 20, K: 20, L: 20, M: 20, "J-M": 20 } as Record<string, number>)[value] ?? 20;
}

export function shapeRarityScore(shape: string | null | undefined) {
  const value = normalize(shape);
  const tiers: Array<[number, string[]]> = [
    [100, ["PORTUGUESE"]], [95, ["OLD MINER"]], [90, ["HALF MOON"]], [85, ["DUTCH MARQUISE"]],
    [80, ["ROSE", "TRILLIANT"]], [75, ["MOVAL", "MARQUISE MODIFIED", "PEAR MODIFIED", "HEART MODIFIED"]],
    [65, ["OVAL MODIFIED", "SQ. CUSHION MODIFIED", "CUSHION MODIFIED"]],
    [60, ["EUROCUT", "OCTAGONAL", "BAGUETTE", "LOZENGE", "CRISS CUT", "OVAL STEP", "PEAR STEP"]],
    [55, ["ASSCHER", "EMERALD", "MARQUISE", "HEART"]], [45, ["RADIANT", "CUSHION", "SQ. RADIANT"]],
    [35, ["PEAR", "OVAL"]], [25, ["ROUND", "PRINCESS"]],
  ];
  for (const [score, values] of tiers) if (values.includes(value)) return score;
  return 45;
}

export function mediaScore(stone: Pick<CuratableStone, "videoUrl" | "imageUrl">) {
  return stone.videoUrl && stone.imageUrl ? 100 : stone.videoUrl || stone.imageUrl ? 60 : 0;
}

function calibratedScore(carat: number) {
  return [0.3, 0.5, 0.7, 0.9, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 7, 10].some((target) => Math.abs(carat - target) <= 0.03) ? 100 : 50;
}

export function displayScore(stone: CuratableStone, collection: "core" | "statement") {
  const carat = Math.min(stone.carat / 10, 1) * 100;
  const clarity = clarityScore(stone.clarity);
  const cut = cutScore(stone.cut);
  const polishSymmetry = polishSymmetryScore(stone.polish, stone.symmetry);
  const fluo = fluorescenceScore(stone.fluorescence);
  const media = mediaScore(stone);
  if (collection === "statement") {
    const fancy = stone.category === "Fancy Colour" || normalize(stone.color).includes("FANCY");
    const colourOrGrade = fancy ? Math.min(100, colourRarityScore(stone.color) + 10) : colourGradeScore(stone.color);
    return 0.25 * shapeRarityScore(stone.shape) + 0.2 * colourOrGrade + 0.2 * carat + 0.15 * media + 0.1 * clarity + 0.05 * cut + 0.05 * polishSymmetry;
  }
  if (stone.category === "Fancy Colour") return 0.35 * colourRarityScore(stone.color) + 0.3 * carat + 0.1 * clarity + 0.1 * cut + 0.05 * polishSymmetry + 0.05 * fluo + 0.05 * media;
  return 0.3 * colourGradeScore(stone.color) + 0.25 * clarity + 0.15 * carat + 0.15 * calibratedScore(stone.carat) + 0.1 * cut + 0.05 * polishSymmetry;
}

export function orderCatalogRows<T extends CuratableStone>(rows: CuratableCatalogRow<T>[], collection: "core" | "statement", sort: CatalogSort) {
  const decorated = rows.map((row) => ({ row, score: displayScore(row.stone, collection), media: mediaScore(row.stone), clarity: clarityScore(row.stone.clarity) }));
  const compareFallback = (a: typeof decorated[number], b: typeof decorated[number]) => b.row.stone.carat - a.row.stone.carat || b.media - a.media || b.clarity - a.clarity || a.row.stone.stockNumber.localeCompare(b.row.stone.stockNumber);
  const compareMain = (a: typeof decorated[number], b: typeof decorated[number]) => {
    if (sort === "carat_desc") return b.row.stone.carat - a.row.stone.carat || compareFallback(a, b);
    if (sort === "carat_asc") return a.row.stone.carat - b.row.stone.carat || compareFallback(a, b);
    if (sort === "new_arrivals") return Number(b.row.curation?.firstSeenAt ?? 0) - Number(a.row.curation?.firstSeenAt ?? 0) || compareFallback(a, b);
    return b.score - a.score || compareFallback(a, b);
  };
  const pinned = decorated.filter((entry) => entry.row.curation?.pinned).sort((a, b) => (a.row.curation?.pinRank ?? Number.MAX_SAFE_INTEGER) - (b.row.curation?.pinRank ?? Number.MAX_SAFE_INTEGER) || compareFallback(a, b));
  const unpinned = decorated.filter((entry) => !entry.row.curation?.pinned).sort(compareMain);
  return [...pinned.slice(0, 8), ...unpinned].map((entry) => entry.row);
}

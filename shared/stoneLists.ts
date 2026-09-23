/**
 * Single source of truth for stone-list keys, labels and bands.
 * Raw data lives in stoneLists.json so scripts/build-stones-index.mjs (Node ESM)
 * and TypeScript consumers can both read the same file.
 */

import stoneListsData from "./stoneLists.json";

export type StoneBand = "yellow" | "green" | "pink" | "blue";

export const LIST_LABELS: Record<string, string> = stoneListsData.labels;

export const LIST_BANDS: Record<string, StoneBand> = stoneListsData.bands as Record<string, StoneBand>;

export const LIST_KEYS: readonly string[] = Object.keys(stoneListsData.labels);

import { applyDocumentMetadata } from "@/lib/publicSeo";

/**
 * Jewellery pages are English-only: set title/description/canonical and clear
 * the wholesale hreflang set left behind by client-side navigation.
 */
export function applyJewellerySeo(path: string, title: string, description: string) {
  applyDocumentMetadata({ lang: "en", path, title, description });
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
  document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((node) => node.remove());
}

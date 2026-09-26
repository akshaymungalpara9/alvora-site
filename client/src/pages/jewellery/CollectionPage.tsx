import { useEffect, useMemo } from "react";
import { fromPriceInr } from "@shared/jewellery/pricing";
import { formatMoney } from "@shared/jewellery/currency";
import { useCurrency } from "@/lib/currency";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowRight } from "lucide-react";
import JewelleryShell from "@/components/jewellery/JewelleryShell";
import CollectionGrid from "@/components/jewellery/CollectionGrid";
import CurrencySwitcher from "@/components/jewellery/CurrencySwitcher";
import ShapeSelector, { SHOP_SHAPES } from "@/components/jewellery/ShapeSelector";
import { PUBLIC_PIECES, type JewelleryCollection, type JewelleryPiece } from "@shared/jewellery/catalog";
import { JEWELLERY_COLLECTION_META, shapePageMeta } from "@shared/jewellery/seo";
import { shapeContentFor } from "@shared/jewellery/editorial";
import { applyJewellerySeo } from "@/lib/jewellerySeo";
import "./jewellery-pages.css";

/** Collection path → catalogue collection key ("/jewellery" shows everything). */
export const COLLECTION_ROUTES: Record<string, JewelleryCollection | null> = {
  "/jewellery": null,
  "/engagement-rings": "engagement-rings",
  "/rings": "rings",
  "/earrings": "earrings",
  "/necklaces": "pendants",
  "/wedding-bands": "wedding-bands",
  "/jewellery/antique-cuts": "antique-cuts",
  "/jewellery/coloured-stones": "coloured-stones",
};

/** "From" price bands in rupees (prices are set in rupees; see pricing.ts). */
const PRICE_BANDS = [
  { value: "under-50000", max: 50000, label: "Under", test: (p: number) => p < 50000 },
  { value: "50000-100000", min: 50000, max: 100000, label: "Range", test: (p: number) => p >= 50000 && p < 100000 },
  { value: "100000-200000", min: 100000, max: 200000, label: "Range", test: (p: number) => p >= 100000 && p < 200000 },
  { value: "200000-plus", min: 200000, label: "Plus", test: (p: number) => p >= 200000 },
] as const;

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Newest" },
] as const;

type Props = { path: string; shape?: string };

function sortPieces(pieces: JewelleryPiece[], sort: string) {
  const priced = (piece: JewelleryPiece, fallback: number) => fromPriceInr(piece) ?? fallback;
  const copy = [...pieces];
  if (sort === "price-asc") return copy.sort((a, b) => priced(a, Infinity) - priced(b, Infinity));
  if (sort === "price-desc") return copy.sort((a, b) => priced(b, -1) - priced(a, -1));
  if (sort === "newest") return copy.sort((a, b) => (b.addedOn ?? "").localeCompare(a.addedOn ?? "") || b.featuredScore - a.featuredScore);
  return copy.sort((a, b) => b.featuredScore - a.featuredScore);
}

export default function CollectionPage({ path, shape }: Props) {
  const currency = useCurrency();
  const priceBandLabel = (item: typeof PRICE_BANDS[number]) => item.label === "Under" ? `Under ${formatMoney(item.max, currency)}` : item.label === "Plus" ? `${formatMoney(item.min, currency)}+` : `${formatMoney(item.min, currency)} - ${formatMoney(item.max, currency)}`;
  const search = useSearch();
  const [location, navigate] = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const collection = COLLECTION_ROUTES[path] ?? null;
  const shapeLabel = shape ? SHOP_SHAPES.find((item) => item.shape === shape)?.label ?? PUBLIC_PIECES.find((piece) => piece.shape === shape)?.shapeLabel ?? shape : null;
  const base = JEWELLERY_COLLECTION_META[path];
  const editorial = shape ? shapeContentFor(shape) : null;
  const meta = shape && shapeLabel ? { ...base, ...shapePageMeta(shape, shapeLabel), heading: editorial?.heading ?? `${shapeLabel} engagement rings` } : base;

  useEffect(() => {
    applyJewellerySeo(location, meta.title, meta.description);
  }, [location, meta.title, meta.description]);

  const inScope = useMemo(
    () => PUBLIC_PIECES.filter((piece) => (collection ? piece.collections.includes(collection) : true) && (shape ? piece.shape === shape : true)),
    [collection, shape],
  );

  const shapes = useMemo(() => Array.from(new Set(inScope.map((p) => p.shape).filter(Boolean) as string[])), [inScope]);
  const styles = useMemo(() => Array.from(new Map(inScope.map((p) => [p.style, p.styleLabel])).entries()).sort((a, b) => a[1].localeCompare(b[1])), [inScope]);
  const colours = useMemo(() => Array.from(new Map(inScope.map((p) => [p.stoneColour, p.stoneColourLabel ?? "White"])).entries()), [inScope]);

  const active = {
    shape: shape ? null : params.get("shape"),
    style: params.get("style"),
    colour: params.get("colour"),
    price: params.get("price"),
    sort: params.get("sort") ?? "featured",
  };

  // Price filters and sorts only help when the pieces here differ in price.
  const priceVaries = new Set(inScope.map((piece) => fromPriceInr(piece))).size > 1;
  const band = priceVaries ? PRICE_BANDS.find((item) => item.value === active.price) : undefined;
  const results = sortPieces(
    inScope.filter(
      (piece) =>
        (!active.shape || piece.shape === active.shape) &&
        (!active.style || piece.style === active.style) &&
        (!active.colour || piece.stoneColour === active.colour) &&
        (!band || (fromPriceInr(piece) != null && band.test(fromPriceInr(piece)!))),
    ),
    active.sort,
  );

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(search);
    if (value && !(key === "sort" && value === "featured")) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    navigate(`${location}${query ? `?${query}` : ""}`, { replace: true });
  };
  const clearAll = () => navigate(location, { replace: true });
  const hasFilters = Boolean(active.shape || active.style || active.colour || active.price);

  const isEngagement = path === "/engagement-rings";

  return (
    <JewelleryShell>
      <section className="jc-hero">
        <nav className="jc-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          {shape ? (
            <>
              <Link href="/engagement-rings">Engagement rings</Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span aria-current="page">{meta.heading}</span>
        </nav>
        <h1 className="jw-display">{meta.heading}</h1>
        <p className="jw-lede">{editorial?.intro ?? (shape ? `${shapeLabel} stones in solitaire, bezel, east-west and heritage settings, each made to your size in silver, platinum, or yellow, white or rose gold.` : base.intro)}</p>
        {editorial?.guide ? (
          <Link href={editorial.guide.href} className="jw-link jc-guide-link">{editorial.guide.label} <ArrowRight size={13} /></Link>
        ) : null}
        {!shape && path === "/engagement-rings" ? (
          <Link href="/engagement-rings/shape/marquise" className="jw-link jc-guide-link">Drawn to a longer stone? Start with the marquise rings <ArrowRight size={13} /></Link>
        ) : null}
      </section>

      {editorial?.answer ? (
        <div className="insight-answer-block">
          <p className="insight-answer-label">{editorial.answer.question}</p>
          <p className="insight-answer-text">{editorial.answer.text}</p>
          <p className="insight-answer-buyer">{editorial.answer.buyerNote}</p>
        </div>
      ) : null}

      {isEngagement || shape ? (
        <div className="jc-shapes">
          <ShapeSelector shapes={SHOP_SHAPES.filter((item) => PUBLIC_PIECES.some((p) => p.shape === item.shape && p.collections.includes("engagement-rings")))} active={shape ?? null} />
        </div>
      ) : null}

      <div className="jc-toolbar">
        <div className="jc-filters" role="group" aria-label="Filter pieces">
          {!shape && shapes.length > 1 ? (
            <label>
              <span>Shape</span>
              <select value={active.shape ?? ""} onChange={(event) => setParam("shape", event.target.value || null)}>
                <option value="">All shapes</option>
                {shapes.map((value) => (
                  <option key={value} value={value}>{SHOP_SHAPES.find((s) => s.shape === value)?.label ?? inScope.find((p) => p.shape === value)?.shapeLabel ?? value}</option>
                ))}
              </select>
            </label>
          ) : null}
          {styles.length > 1 ? (
            <label>
              <span>Setting</span>
              <select value={active.style ?? ""} onChange={(event) => setParam("style", event.target.value || null)}>
                <option value="">All settings</option>
                {styles.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          ) : null}
          {colours.length > 1 ? (
            <label>
              <span>Stone</span>
              <select value={active.colour ?? ""} onChange={(event) => setParam("colour", event.target.value || null)}>
                <option value="">All stones</option>
                {colours.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          ) : null}
          {priceVaries ? (
          <label>
            <span>Price</span>
            <select value={active.price ?? ""} onChange={(event) => setParam("price", event.target.value || null)}>
              <option value="">Any price</option>
              {PRICE_BANDS.map((item) => (
                <option key={item.value} value={item.value}>{priceBandLabel(item)}</option>
              ))}
            </select>
          </label>
          ) : null}
          {hasFilters ? (
            <button type="button" className="jc-clear" onClick={clearAll}>Clear filters</button>
          ) : null}
        </div>
        <div className="jc-sort">
          <CurrencySwitcher id="collection-currency" />
          <p className="jc-count" aria-live="polite">{results.length} {results.length === 1 ? "piece" : "pieces"}</p>
          <label>
            <span>Sort</span>
            <select value={active.sort} onChange={(event) => setParam("sort", event.target.value)}>
              {SORTS.filter((item) => priceVaries || !item.value.startsWith("price")).map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <section className="jc-results" aria-label={`${meta.heading} results`}>
        <CollectionGrid
          pieces={results}
          empty={
            <div className="jc-empty">
              <p>No pieces match these filters yet.</p>
              <p>We make to order, so if you have something in mind we can often make it for you.</p>
              <div>
                {hasFilters ? <button type="button" className="jw-button jw-button-ghost" onClick={clearAll}>Clear filters</button> : null}
                <Link href="/book-a-consultation" className="jw-button">Book a consultation</Link>
              </div>
            </div>
          }
        />
      </section>

      {editorial?.sections.length ? (
        <section className="jc-editorial" aria-label={`About ${meta.heading.toLowerCase()}`}>
          {editorial.sections.map((section) => (
            <article key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.link ? <Link href={section.link.href} className="jw-link">{section.link.label} <ArrowRight size={13} /></Link> : null}
            </article>
          ))}
        </section>
      ) : null}

      <section className="jc-cta">
        <div>
          <p className="jw-eyebrow">Not sure where to start?</p>
          <h2>Talk it through with us.</h2>
          <p>A short WhatsApp or phone call to choose a shape, setting and size, with a written price afterwards.</p>
        </div>
        <Link href="/book-a-consultation" className="jw-button">Book a consultation <ArrowRight size={15} strokeWidth={1.6} /></Link>
      </section>
    </JewelleryShell>
  );
}

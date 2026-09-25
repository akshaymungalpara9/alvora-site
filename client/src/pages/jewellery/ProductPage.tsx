import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Gem, MessageCircle, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import JewelleryShell from "@/components/jewellery/JewelleryShell";
import PieceImage from "@/components/jewellery/PieceImage";
import MetalSwatches, { METAL_LABELS } from "@/components/jewellery/MetalSwatches";
import CollectionGrid from "@/components/jewellery/CollectionGrid";
import EnquiryForm, { type PieceSelection } from "@/components/jewellery/EnquiryForm";
import NotFound from "@/pages/NotFound";
import { GRADING_REPORT_IMAGE, PUBLIC_PIECES, findPublicPiece, formatFromPrice, type MetalColour } from "@shared/jewellery/catalog";
import { pieceMeta } from "@shared/jewellery/seo";
import { CENTRE_STONE_CARATS, centreStoneSpec, centreStoneStory, hasCentreStone } from "@shared/jewellery/centreStone";
import { formatMoney } from "@shared/jewellery/currency";
import CurrencySwitcher from "@/components/jewellery/CurrencySwitcher";
import { showLaunchOffer, useCurrency } from "@/lib/currency";
import { LAUNCH_OFFER, RING_METALS, formatFullPrice, formatOfferEnd, hasRingPricing, ringPriceInr, type RingMetal } from "@shared/jewellery/pricing";
import { COMPANY } from "@shared/companyInfo";
import { applyJewellerySeo } from "@/lib/jewellerySeo";
import { buildWhatsAppHrefWithMessage } from "@/lib/whatsapp";
import { trackWhatsappClick } from "@/lib/ga4";
import "./jewellery-pages.css";

/** US ring sizes with their UK equivalents. */
const RING_SIZES: Array<{ us: string; uk: string }> = [
  ["3", "F"], ["3.5", "G"], ["4", "H"], ["4.5", "I"], ["5", "J½"], ["5.5", "K½"], ["6", "L½"], ["6.5", "M½"],
  ["7", "N½"], ["7.5", "O½"], ["8", "P½"], ["8.5", "Q½"], ["9", "R½"], ["9.5", "S½"], ["10", "T½"],
].map(([us, uk]) => ({ us, uk }));

const CATEGORY_LINKS: Record<string, { label: string; href: string }> = {
  ring: { label: "Engagement rings", href: "/engagement-rings" },
  band: { label: "Wedding & bands", href: "/wedding-bands" },
  earrings: { label: "Earrings", href: "/earrings" },
  pendant: { label: "Necklaces & pendants", href: "/necklaces" },
};

const METAL_NAMES: Record<MetalColour, NonNullable<PieceSelection["metal"]>> = { yellow: "Yellow gold", white: "White gold", rose: "Rose gold" };

function caratOptions(range: [number, number] | null) {
  if (!range) return [];
  const [min, max] = range;
  if (min === max) return [min.toFixed(2).replace(/\.?0+$/, "")];
  const options: string[] = [];
  for (let value = min; value <= max + 1e-9; value += 0.5) options.push(String(Number(value.toFixed(2))));
  return options;
}

export default function ProductPage({ slug }: { slug: string }) {
  const piece = findPublicPiece(slug);
  const [imageIndex, setImageIndex] = useState(0);
  const [metal, setMetal] = useState<MetalColour>("yellow");
  const [karat, setKarat] = useState<string>(() => (piece?.karats.includes("14K") ? "14K" : piece?.karats[0] ?? "14K"));
  const currency = useCurrency();
  const priced = piece ? hasRingPricing(piece) : false;
  // Priced rings open on the "From" price: silver with a 0.5 ct centre stone.
  const [ringMetal, setRingMetal] = useState<RingMetal>("silver");
  const [carat, setCarat] = useState<string | undefined>(priced ? CENTRE_STONE_CARATS[0] : undefined);
  const [sizeSystem, setSizeSystem] = useState<"us" | "uk">("us");
  const [ringSize, setRingSize] = useState<string>("");

  useEffect(() => {
    if (!piece) return;
    const meta = pieceMeta(piece);
    applyJewellerySeo(`/jewellery/${piece.slug}`, meta.title, meta.description);
    setImageIndex(0);
    setRingMetal("silver");
    setCarat(hasRingPricing(piece) ? CENTRE_STONE_CARATS[0] : undefined);
    setRingSize("");
  }, [piece]);

  const related = useMemo(() => {
    if (!piece) return [];
    const others = PUBLIC_PIECES.filter((p) => p.code !== piece.code);
    const score = (p: typeof piece) => (p.shape === piece.shape ? 2 : 0) + (p.style === piece.style ? 1 : 0) + (p.category === piece.category ? 1 : 0);
    return others.sort((a, b) => score(b) - score(a) || b.featuredScore - a.featuredScore).slice(0, 4);
  }, [piece]);

  if (!piece) return <NotFound />;

  const isRing = piece.category === "ring" || piece.category === "band";
  const withCentre = hasCentreStone(piece);
  const carats = withCentre ? CENTRE_STONE_CARATS : caratOptions(piece.caratRange);
  const story = withCentre ? centreStoneStory(piece) : null;
  const sizeLabel = ringSize ? (sizeSystem === "us" ? `US ${ringSize}` : `UK ${RING_SIZES.find((s) => s.us === ringSize)?.uk}`) : undefined;
  // Silver and platinum come in white only; gold in the piece's colours.
  const isGold = !priced || RING_METALS.find((m) => m.value === ringMetal)!.gold;
  const selection: PieceSelection = {
    metal: isGold ? METAL_NAMES[metal] : ringMetal === "silver" ? "Silver" : "Platinum",
    karat: isGold ? ((priced ? ringMetal : karat) as PieceSelection["karat"]) : undefined,
    caratWeight: carat,
    ringSize: isRing ? sizeLabel ?? "Not sure yet" : undefined,
  };
  const metalText = isGold ? `${selection.karat} ${METAL_LABELS[metal].toLowerCase()}` : selection.metal!.toLowerCase();
  const summary = [metalText, carat ? `${carat} ct` : null, isRing && sizeLabel ? `size ${sizeLabel}` : null].filter(Boolean).join(", ");
  const price = priced && carat ? ringPriceInr(ringMetal, carat) : null;
  const offer = price != null && showLaunchOffer();
  const metalList = priced ? "925 sterling silver, 14K or 18K gold, or platinum" : `Solid ${piece.karats.join(" or ")} gold`;
  const whatsappHref = buildWhatsAppHrefWithMessage(COMPANY.whatsappNumber, `Hello Alvora, I'd like to ask about the ${piece.name} (${piece.code}): ${summary}.`);
  const category = CATEGORY_LINKS[piece.category];
  const shapeCrumb = piece.shape && piece.collections.includes("engagement-rings") && piece.shapeLabel ? { label: piece.shapeLabel, href: `/engagement-rings/shape/${piece.shape}` } : null;
  // The grading-report photo closes every gallery.
  const images = [...piece.images, GRADING_REPORT_IMAGE];

  return (
    <JewelleryShell>
      <article className="jp">
        <div className="jp-gallery">
          {images.length > 1 ? (
            <ul className="jp-thumbs" aria-label="Photos">
              {images.map((image, index) => (
                <li key={image.src}>
                  <button type="button" aria-current={index === imageIndex} aria-label={`Show photo ${index + 1}`} onClick={() => setImageIndex(index)}>
                    <PieceImage piece={piece} image={image} sizes="76px" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <span />
          )}
          <div className="jp-stage">
            <div className="jp-stage-main">
              <PieceImage piece={piece} image={images[imageIndex]} priority sizes="(min-width: 980px) 55vw, 100vw" />
            </div>
            <div className="jp-stage-strip" aria-label="Photos, swipe for more">
              {images.length ? images.map((image, index) => <PieceImage key={image.src} piece={piece} image={image} priority={index === 0} sizes="100vw" />) : <PieceImage piece={piece} priority sizes="100vw" />}
            </div>
          </div>
        </div>

        <div className="jp-info">
          <nav className="jc-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            {category ? <Link href={category.href}>{category.label}</Link> : null}
            {shapeCrumb ? (
              <>
                <span aria-hidden="true">/</span>
                <Link href={shapeCrumb.href}>{shapeCrumb.label}</Link>
              </>
            ) : null}
          </nav>
          <h1 className="jp-title">{piece.name}</h1>
          <p className="jp-sub">{[piece.shapeLabel, piece.styleLabel, piece.stoneColourLabel].filter(Boolean).join(" · ")}</p>
          {price != null ? (
            <div className="jp-price" aria-live="polite">
              <p className="jp-price-line">
                <strong>{formatMoney(price, currency)}</strong>
                {offer ? <s aria-label={`Full price ${formatFullPrice(price, currency)}`}>{formatFullPrice(price, currency)}</s> : null}
                <CurrencySwitcher />
              </p>
              {offer ? <span className="jp-offer">{LAUNCH_OFFER.percentOff}% launch offer until {formatOfferEnd()}</span> : null}
              <span>{`${RING_METALS.find((m) => m.value === ringMetal)!.label}, ${carat} ct centre stone · confirmed in writing before making`}</span>
            </div>
          ) : (
            <p className="jp-price">
              <strong>{formatFromPrice(piece, currency)}</strong>
              <span>We quote your exact selection</span>
            </p>
          )}
          <p className="jp-desc">{piece.description}</p>

          {priced ? (
            <fieldset className="jp-option">
              <legend>Metal <b>{RING_METALS.find((m) => m.value === ringMetal)!.label}</b></legend>
              <div className="jp-chips" role="radiogroup" aria-label="Metal">
                {RING_METALS.map((option) => (
                  <button key={option.value} type="button" role="radio" aria-checked={ringMetal === option.value} className="jp-chip" onClick={() => setRingMetal(option.value)}>{option.label}</button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {isGold ? (
            <fieldset className="jp-option">
              <legend>{priced ? "Gold colour" : "Metal"} <b>{METAL_LABELS[metal]}</b></legend>
              <MetalSwatches colours={piece.metalColours} selected={metal} onSelect={setMetal} size="md" />
            </fieldset>
          ) : null}

          {!priced && piece.karats.length > 1 ? (
            <fieldset className="jp-option">
              <legend>Gold <b>{karat}</b></legend>
              <div className="jp-chips" role="radiogroup" aria-label="Gold purity">
                {piece.karats.map((value) => (
                  <button key={value} type="button" role="radio" aria-checked={karat === value} className="jp-chip" onClick={() => setKarat(value)}>{value}</button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {carats.length ? (
            <fieldset className="jp-option">
              <legend>Centre stone <b>{carat ? `${carat} ct` : "Choose a carat"}</b></legend>
              <div className="jp-chips" role="radiogroup" aria-label="Centre stone carat">
                {carats.map((value) => (
                  <button key={value} type="button" role="radio" aria-checked={carat === value} className="jp-chip" onClick={() => setCarat(value)}>{value} ct</button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {isRing ? (
            <div className="jp-option">
              <label className="jp-option-label" htmlFor="ring-size">Ring size <b>{sizeLabel ?? "Not sure yet"}</b></label>
              <div className="jp-size">
                <select id="ring-size" value={ringSize} onChange={(event) => setRingSize(event.target.value)}>
                  <option value="">Not sure yet</option>
                  {RING_SIZES.map((size) => (
                    <option key={size.us} value={size.us}>{sizeSystem === "us" ? `US ${size.us}` : `UK ${size.uk}`}</option>
                  ))}
                </select>
                <div className="jp-size-toggle" role="group" aria-label="Size system">
                  <button type="button" aria-pressed={sizeSystem === "us"} onClick={() => setSizeSystem("us")}>US</button>
                  <button type="button" aria-pressed={sizeSystem === "uk"} onClick={() => setSizeSystem("uk")}>UK</button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="jp-actions">
            <a href="#enquire" className="jw-button">Enquire about this piece <ArrowRight size={15} strokeWidth={1.6} /></a>
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="jw-button jp-whatsapp" onClick={() => trackWhatsappClick("jewellery_product")}>
                <MessageCircle size={15} strokeWidth={1.6} /> Ask on WhatsApp
              </a>
            ) : null}
            <Link href="/book-a-consultation" className="jw-link">Or book a consultation</Link>
          </div>

          <ul className="jp-trust">
            <li><Gem size={16} strokeWidth={1.4} /> {withCentre ? "E colour, VS1 clarity, grown not mined" : "Lab-grown diamonds, graded before setting"}</li>
            <li><Sparkles size={16} strokeWidth={1.4} /> {metalList}</li>
            <li><Ruler size={16} strokeWidth={1.4} /> Made to your size</li>
            <li><ShieldCheck size={16} strokeWidth={1.4} /> Price confirmed before making</li>
          </ul>

          <dl className="jp-details">
            <div><dt>Style code</dt><dd>{piece.code}</dd></div>
            {piece.shapeLabel ? <div><dt>Shape</dt><dd>{piece.shapeLabel}</dd></div> : null}
            <div><dt>Setting</dt><dd>{piece.styleLabel}</dd></div>
            {withCentre ? null : <div><dt>Stone</dt><dd>{piece.stoneColourLabel ? `${piece.stoneColourLabel} lab-grown diamond` : "Lab-grown diamond"}</dd></div>}
            {withCentre ? centreStoneSpec(piece).map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>) : null}
            {!withCentre && piece.caratRange ? <div><dt>Carat</dt><dd>{piece.caratRange[0] === piece.caratRange[1] ? `${piece.caratRange[0]} ct` : `${piece.caratRange[0]} – ${piece.caratRange[1]} ct`}</dd></div> : null}
            <div><dt>Metal</dt><dd>{priced ? "925 sterling silver or platinum (white); 14K or 18K yellow, white or rose gold" : `${piece.karats.join(" / ")} yellow, white or rose gold`}</dd></div>
          </dl>
        </div>
      </article>

      {story ? (
        <section className="jp-story" aria-labelledby="story-heading">
          <p className="jw-eyebrow">Ethically grown</p>
          <h2 id="story-heading">{story.heading}</h2>
          {story.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
        </section>
      ) : null}

      <section className="jp-enquire" id="enquire" aria-labelledby="enquire-heading">
        <div>
          <p className="jw-eyebrow">Enquire</p>
          <h2 id="enquire-heading">Ask about the {piece.name}</h2>
          <p>Send your selection and we reply within one working day with a written price and timing. Nothing is made or charged until you confirm.</p>
        </div>
        <EnquiryForm kind="piece" piece={piece} selection={selection} idPrefix="piece" />
      </section>

      {related.length ? (
        <section className="jp-related" aria-labelledby="related-heading">
          <h2 id="related-heading">You may also like</h2>
          <CollectionGrid pieces={related} priorityCount={0} />
        </section>
      ) : null}
    </JewelleryShell>
  );
}

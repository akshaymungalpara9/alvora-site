/**
 * Trade-only finished jewellery: the full collection (every wave) by style
 * code, with no retail prices. Buyers select styles and request trade pricing
 * and a line sheet; the request lands in the production-brief queue.
 */
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import SpecialtyPageShell from "@/components/SpecialtyPageShell";
import PieceImage from "@/components/jewellery/PieceImage";
import { trpc } from "@/lib/trpc";
import { trackConversion } from "@/lib/ga4";
import { applyDocumentMetadata } from "@/lib/publicSeo";
import { ALL_PIECES, type JewelleryCategory } from "@shared/jewellery/catalog";
import { TRADE_JEWELLERY_META } from "@shared/jewellery/seo";
import "@/components/jewellery/jewellery.css";
import "./trade-jewellery.css";

const CATEGORY_TABS: Array<{ value: "all" | JewelleryCategory; label: string }> = [
  { value: "all", label: "All styles" },
  { value: "ring", label: "Rings" },
  { value: "band", label: "Bands" },
  { value: "earrings", label: "Earrings" },
  { value: "pendant", label: "Pendants" },
];

const TRADE_TERMS = [
  { label: "Private label", text: "Your own stamp and packaging on request; Alvora names never appear on your pieces." },
  { label: "Metals", text: "10K, 14K and 18K gold in yellow, white and rose, confirmed per style." },
  { label: "Minimums & timing", text: "Minimum quantities and lead times are confirmed per style in your line sheet." },
  { label: "Stones", text: "Centre stones can be matched from our loose lab-grown diamond production." },
];

export default function TradeJewellery() {
  const [category, setCategory] = useState<"all" | JewelleryCategory>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const submit = trpc.productionBrief.submitFastRfq.useMutation({
    onSuccess: () => trackConversion("trade_linesheet_request", { styles: String(selected.length) }),
  });

  useEffect(() => {
    applyDocumentMetadata({ lang: "en", path: "/trade/jewellery", ...TRADE_JEWELLERY_META });
  }, []);

  const visible = useMemo(() => ALL_PIECES.filter((piece) => category === "all" || piece.category === category), [category]);
  const toggle = (code: string) => setSelected((current) => (current.includes(code) ? current.filter((c) => c !== code) : [...current, code]));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const styles = selected.map((code) => {
      const piece = ALL_PIECES.find((p) => p.code === code);
      return `- ${code} ${piece?.name ?? ""}`.trim();
    });
    const notes = String(values.get("notes") ?? "").trim();
    submit.mutate({
      market: "GLOBAL",
      website: String(values.get("_website") ?? ""),
      contactName: String(values.get("name") ?? "").trim(),
      email: String(values.get("email") ?? "").trim(),
      company: String(values.get("company") ?? "").trim() || undefined,
      phone: String(values.get("phone") ?? "").trim(),
      requirement: [`Trade jewellery line sheet request (${selected.length} styles)`, ...styles, notes ? `\nNotes:\n${notes}` : ""].join("\n").trim(),
    });
  };

  return (
    <SpecialtyPageShell>
      <div className="jw tj">
        <section className="tj-hero">
          <p className="jw-eyebrow">Alvora Trade · Finished jewellery</p>
          <h1 className="jw-display">Finished jewellery for retailers and brands.</h1>
          <p className="jw-lede">
            {ALL_PIECES.length} styles in solid gold, set with lab-grown diamonds. Select the styles you want to carry and we will send trade pricing and a line sheet.
          </p>
          <dl className="tj-terms">
            {TRADE_TERMS.map((term) => (
              <div key={term.label}>
                <dt>{term.label}</dt>
                <dd>{term.text}</dd>
              </div>
            ))}
          </dl>
          <p className="tj-retail">Shopping for yourself? <a href="/">Visit Alvora fine jewellery <ArrowUpRight size={13} /></a></p>
        </section>

        <div className="tj-toolbar">
          <div className="tj-tabs" role="tablist" aria-label="Category">
            {CATEGORY_TABS.map((tab) => (
              <button key={tab.value} type="button" role="tab" aria-selected={category === tab.value} onClick={() => setCategory(tab.value)}>
                {tab.label} <span>{tab.value === "all" ? ALL_PIECES.length : ALL_PIECES.filter((p) => p.category === tab.value).length}</span>
              </button>
            ))}
          </div>
          <a href="#trade-request" className="jw-button">Request line sheet{selected.length ? ` (${selected.length})` : ""}</a>
        </div>

        <ul className="tj-grid">
          {visible.map((piece) => {
            const isSelected = selected.includes(piece.code);
            return (
              <li key={piece.code}>
                <button type="button" className={`tj-card${isSelected ? " is-selected" : ""}`} aria-pressed={isSelected} onClick={() => toggle(piece.code)}>
                  <span className="tj-card-media">
                    <PieceImage piece={piece} />
                    <span className="tj-card-check" aria-hidden="true">{isSelected ? <Check size={14} /> : <Plus size={14} />}</span>
                  </span>
                  <span className="tj-card-code">{piece.code}</span>
                  <span className="tj-card-name">{piece.name}</span>
                  <span className="tj-card-detail">{[piece.shapeLabel, piece.styleLabel, piece.karats.join("/")].filter(Boolean).join(" · ")}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <section className="tj-request" id="trade-request" aria-labelledby="trade-request-title">
          <div>
            <p className="jw-eyebrow">Trade pricing</p>
            <h2 id="trade-request-title">Request a line sheet</h2>
            <p>We reply within one working day with trade prices, minimums and lead times for the styles you selected.</p>
            {selected.length ? (
              <ul className="tj-selected">
                {selected.map((code) => (
                  <li key={code}>
                    <span>{code}</span> {ALL_PIECES.find((p) => p.code === code)?.name}
                    <button type="button" onClick={() => toggle(code)} aria-label={`Remove ${code}`}>×</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="tj-hint">Tap styles above to add them, or describe what you need below.</p>
            )}
          </div>
          {submit.isSuccess ? (
            <div className="jw-form-done" role="status">
              <Check size={22} strokeWidth={1.5} aria-hidden="true" />
              <h3>Thank you, your request is in.</h3>
              <p>Our trade team will send pricing and a line sheet within one working day.</p>
            </div>
          ) : (
            <form className="jw-form" onSubmit={onSubmit}>
              <div className="jw-form-row">
                <label htmlFor="tj-name"><span>Name</span><input id="tj-name" name="name" required minLength={2} maxLength={180} autoComplete="name" /></label>
                <label htmlFor="tj-company"><span>Company</span><input id="tj-company" name="company" required maxLength={180} autoComplete="organization" /></label>
              </div>
              <div className="jw-form-row">
                <label htmlFor="tj-email"><span>Work email</span><input id="tj-email" name="email" type="email" required maxLength={320} autoComplete="email" /></label>
                <label htmlFor="tj-phone"><span>Phone or WhatsApp</span><input id="tj-phone" name="phone" type="tel" required minLength={2} maxLength={80} autoComplete="tel" /></label>
              </div>
              <label htmlFor="tj-notes"><span>Quantities, metals or other notes <small>optional</small></span><textarea id="tj-notes" name="notes" rows={4} maxLength={3000} placeholder="e.g. 10 units per style in 14K, private label, delivery to London" /></label>
              <div className="jw-form-honeypot" aria-hidden="true">
                <label htmlFor="tj-website">Website</label>
                <input id="tj-website" name="_website" tabIndex={-1} autoComplete="off" />
              </div>
              <button type="submit" className="jw-button jw-form-submit" disabled={submit.isPending}>{submit.isPending ? "Sending…" : "Request trade pricing"}</button>
              {submit.isError ? <p className="jw-form-error" role="alert">Sorry, that did not send. Please try again or message us on WhatsApp.</p> : null}
            </form>
          )}
        </section>
      </div>
    </SpecialtyPageShell>
  );
}

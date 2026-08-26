import { useAuth } from "@/_core/hooks/useAuth";
import PublicMetadata from "@/components/PublicMetadata";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, ExternalLink, Grid2X2, List, Loader2, Play, Send, SlidersHorizontal } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";

type Locale = "global" | "fr" | "it";

const copy = {
  global: { kicker: "ALVORA / CURRENT PRODUCTION", title: "Current production availability.", intro: "Cut, calibrated and IGI-certified at our own benches in Surat. Ready now.", fancy: "Fancy Colour", white: "White", filter: "Refine the menu", shape: "Shape", carat: "Carat band", colour: "Colour", clarity: "Clarity", all: "All", rows: "stones shown", request: "Request price", hold: "Request / Hold", verify: "Verify on IGI", video: "View video", commission: "Commission a make", commissionKicker: "ALVORA / MADE TO SPECIFICATION", commissionCopy: "For a profile not in the current menu, send the make your jewellery programme requires.", empty: "No current profiles match these filters.", page: "Page", prev: "Previous", next: "Next", refreshed: "Last refreshed", details: "View full details", made: "Made at our benches in Surat.", buyer: "Approved buyer view" },
  fr: { kicker: "ALVORA / PRODUCTION ACTUELLE", title: "Disponibilités de production actuelles.", intro: "Diamants de synthèse taillés, calibrés et certifiés IGI par nos propres équipes à Surat. Prêts maintenant.", fancy: "Couleurs fantaisie", white: "Blancs", filter: "Affiner la sélection", shape: "Forme", carat: "Plage de carats", colour: "Couleur", clarity: "Pureté", all: "Toutes", rows: "pierres affichées", request: "Demander un prix", hold: "Demander / Réserver", verify: "Vérifier auprès d’IGI", video: "Voir la vidéo", commission: "Demander une fabrication", commissionKicker: "ALVORA / SUR SPÉCIFICATION", commissionCopy: "Pour un profil absent de la sélection actuelle, décrivez la fabrication requise par votre programme joaillier.", empty: "Aucun profil actuel ne correspond à ces filtres.", page: "Page", prev: "Précédent", next: "Suivant", refreshed: "Dernière actualisation", details: "Voir le détail", made: "Fabriqué sur nos établis à Surat.", buyer: "Vue acheteur approuvé" },
  it: { kicker: "ALVORA / PRODUZIONE ATTUALE", title: "Disponibilità di produzione attuale.", intro: "Diamanti sintetici tagliati, calibrati e certificati IGI dai nostri banchi a Surat. Pronti ora.", fancy: "Colori Fancy", white: "Bianchi", filter: "Affina il menu", shape: "Forma", carat: "Fascia carati", colour: "Colore", clarity: "Purezza", all: "Tutti", rows: "pietre visualizzate", request: "Richiedi il prezzo", hold: "Richiedi / Blocca", verify: "Verifica su IGI", video: "Guarda il video", commission: "Commissiona una produzione", commissionKicker: "ALVORA / SU SPECIFICA", commissionCopy: "Per un profilo non presente nella selezione attuale, inviate la lavorazione richiesta dal vostro programma di gioielleria.", empty: "Nessun profilo attuale corrisponde a questi filtri.", page: "Pagina", prev: "Precedente", next: "Successiva", refreshed: "Ultimo aggiornamento", details: "Vedi dettagli", made: "Realizzato ai nostri banchi a Surat.", buyer: "Vista acquirente approvato" },
} as const;

const menuLinks: Record<Locale, string> = { global: "/", fr: "/fr", it: "/it" };

function SelectField({ label, values, value, onChange, all }: { label: string; values: string[]; value: string; onChange: (value: string) => void; all: string }) {
  return <label className="catalog-filter"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="">{all}</option>{values.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>;
}

export default function PublicAvailability({ locale = "global" }: { locale?: Locale }) {
  const text = copy[locale];
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState<"Fancy Colour" | "White">("Fancy Colour");
  const [shape, setShape] = useState("");
  const [caratBand, setCaratBand] = useState("");
  const [colour, setColour] = useState("");
  const [clarity, setClarity] = useState("");
  const [page, setPage] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const buyer = trpc.buyer.myAvailability.useQuery(undefined, { enabled: isAuthenticated });
  const filterInput = useMemo(() => ({ category, shapes: shape ? [shape] : undefined, caratBands: caratBand ? [caratBand] : undefined, colours: colour ? [colour] : undefined, clarities: clarity ? [clarity] : undefined, page, pageSize: 48 }), [category, shape, caratBand, colour, clarity, page]);
  const catalog = trpc.availability.profiles.useQuery(filterInput);
  const summary = trpc.availability.summary.useQuery();
  const categorySummary = trpc.availability.summary.useQuery({ category });
  const buyerStones = buyer.data?.status === "approved" ? new Map(buyer.data.stones.map((stone) => [stone.id, stone])) : new Map();
  const filters = useMemo(() => {
    return {
      shapes: categorySummary.data?.byShape.map((entry) => entry.shape).sort() ?? [],
      caratBands: categorySummary.data?.byCaratBand.map((entry) => entry.caratBand) ?? [],
      colours: categorySummary.data?.byColour.map((entry) => entry.colour).sort() ?? [],
      clarities: categorySummary.data?.byClarity.map((entry) => entry.clarity).sort() ?? [],
    };
  }, [categorySummary.data]);
  const totalPages = Math.max(1, Math.ceil((catalog.data?.total ?? 0) / (catalog.data?.pageSize ?? 48)));
  const resetPage = (set: (value: string) => void) => (value: string) => { set(value); setPage(0); };
  const openBrief = (stone: { stockNumber: string; shape: string; carat: number; color: string; clarity: string; reportNumber: string | null }) => `${menuLinks[locale]}?availability=${encodeURIComponent(`${stone.stockNumber} — ${stone.shape}, ${stone.carat} ct, ${stone.color}, ${stone.clarity}, IGI ${stone.reportNumber ?? ""}`)}#production-brief`;

  return <div className="catalog-shell"><PublicMetadata locale={locale} page="availability" /><header className="catalog-header"><Link href={menuLinks[locale]} className="brand"><span className="brand-name">ALVORA</span></Link><nav><a href={menuLinks[locale]}>{text.made}</a><a href="#catalog-filter">{text.filter}</a><a href="#catalog-collections">{text.fancy} / {text.white}</a></nav><Link href={menuLinks[locale]} className="catalog-back">← Alvora</Link></header>
    <main>
      <section className="catalog-hero"><p className="eyebrow eyebrow-bright"><span /> {text.kicker}</p><h1>{text.title}</h1><p>{text.intro}</p>{summary.data?.import && <p className="catalog-freshness">{text.refreshed}: {new Date(summary.data.import.activatedAt).toLocaleString()}</p>}</section>
      <section className="catalog-collection-tabs" aria-label="Collection selection"><button className={category === "Fancy Colour" ? "is-active" : ""} onClick={() => { setCategory("Fancy Colour"); setPage(0); }}>{text.fancy}<span>{summary.data?.byCategory.find((entry) => entry.category === "Fancy Colour")?.count ?? 0}</span></button><button className={category === "White" ? "is-active" : ""} onClick={() => { setCategory("White"); setPage(0); }}>{text.white}<span>{summary.data?.byCategory.find((entry) => entry.category === "White")?.count ?? 0}</span></button></section>
      <section className="catalog-controls" id="catalog-filter"><div className="catalog-filter-title"><SlidersHorizontal size={16} /><span>{text.filter}</span></div><div className="catalog-filter-fields"><SelectField label={text.shape} values={filters.shapes} value={shape} onChange={resetPage(setShape)} all={text.all} /><SelectField label={text.carat} values={filters.caratBands} value={caratBand} onChange={resetPage(setCaratBand)} all={text.all} /><SelectField label={text.colour} values={filters.colours} value={colour} onChange={resetPage(setColour)} all={text.all} /><SelectField label={text.clarity} values={filters.clarities} value={clarity} onChange={resetPage(setClarity)} all={text.all} /></div><div className="catalog-view-toggle"><button className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={16} /></button><button className={view === "list" ? "is-active" : ""} onClick={() => setView("list")} aria-label="List view"><List size={16} /></button></div></section>
      <section id="catalog-collections" className={view === "grid" ? "catalog-grid" : "catalog-list"} aria-live="polite">{catalog.isLoading ? <p className="catalog-loading"><Loader2 className="animate-spin" /> Loading current production…</p> : catalog.data?.profiles.length ? catalog.data.profiles.map((stone) => { const buyerStone = buyerStones.get(stone.id); return <article className="catalog-stone" key={stone.id}><div className="catalog-stone-top"><span>{category === "Fancy Colour" ? stone.color : stone.shape}</span><strong>{stone.shape} · {stone.carat.toFixed(stone.carat % 1 === 0 ? 0 : 2)} ct</strong></div><div className="catalog-stone-grades"><p>{stone.color} · {stone.clarity}</p>{[stone.cut && `Cut ${stone.cut}`, stone.polish && `Polish ${stone.polish}`, stone.symmetry && `Symmetry ${stone.symmetry}`].filter(Boolean).join(" · ") && <p>{[stone.cut && `Cut ${stone.cut}`, stone.polish && `Polish ${stone.polish}`, stone.symmetry && `Symmetry ${stone.symmetry}`].filter(Boolean).join(" · ")}</p>}<p>{[stone.measurements, stone.depthPct !== null && `Depth ${stone.depthPct}%`, stone.tablePct !== null && `Table ${stone.tablePct}%`, stone.ratio !== null && `Ratio ${stone.ratio}`].filter(Boolean).join(" · ")}</p></div><div className="catalog-cert"><span>IGI {stone.reportNumber}</span><a href={stone.verifyUrl ?? "https://www.igi.org/Verify-Your-Report/"} target="_blank" rel="noreferrer">{text.verify} <ExternalLink size={13} /></a></div><div className="catalog-stone-actions"><a href={openBrief(stone)}>{text.request} <Send size={14} /></a>{buyerStone && <><a className="catalog-hold" href="/buyer-availability">{text.hold}</a>{buyerStone.videoUrl && <a className="catalog-video" href={buyerStone.videoUrl} target="_blank" rel="noreferrer"><Play size={13} /> {text.video}</a>}</>}</div><small>{stone.stockNumber}</small></article>; }) : <p className="catalog-empty">{text.empty}</p>}</section>
      {(catalog.data?.total ?? 0) > 0 && <nav className="catalog-pagination" aria-label="Catalog pages"><button disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}><ChevronLeft size={16} /> {text.prev}</button><span>{text.page} {page + 1} / {totalPages} · {catalog.data?.total} {text.rows}</span><button disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>{text.next} <ChevronRight size={16} /></button></nav>}
      <section className="catalog-commission"><p className="eyebrow"><span /> {text.commissionKicker}</p><h2>{text.commission}</h2><p>{text.commissionCopy}</p><a href={`${menuLinks[locale]}#production-brief`}>{text.commission} <Send size={15} /></a></section>
    </main>
  </div>;
}

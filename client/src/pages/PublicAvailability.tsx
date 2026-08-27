import PublicMetadata from "@/components/PublicMetadata";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Grid2X2, List, Loader2, Play, Send, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";

type Locale = "global" | "fr" | "it";
type CollectionTab = "Fancy Colour" | "White" | "statement";
type DetailKey = "stock" | "collection" | "shape" | "carat" | "caratBand" | "colour" | "clarity" | "cut" | "polish" | "symmetry" | "fluorescence" | "measurements" | "depth" | "table" | "ratio" | "lab" | "certificate" | "type" | "crownHeight" | "pavilionDepth" | "crownAngle" | "pavilionAngle" | "girdle";

type CatalogStone = {
  id: number;
  stockNumber: string;
  category: string | null;
  shape: string | null;
  carat: number;
  caratBand: string | null;
  color: string | null;
  clarity: string | null;
  cut: string | null;
  polish: string | null;
  symmetry: string | null;
  fluorescence: string | null;
  measurements: string | null;
  depthPct: number | null;
  tablePct: number | null;
  ratio: number | null;
  crownHeight: number | null;
  pavilionDepth: number | null;
  crownAngle: number | null;
  pavilionAngle: number | null;
  girdlePct: number | null;
  statementType: string | null;
  lab: string | null;
  reportNumber: string | null;
  verifyUrl: string | null;
  videoUrl?: string | null;
  imageUrl: string | null;
  isPinned: boolean;
  heroNote: string | null;
};

const copy = {
  global: { kicker: "ALVORA / CURRENT PRODUCTION", title: "Current production availability.", intro: "Cut, calibrated and IGI-certified at our own benches in Surat. Ready now.", fancy: "Fancy Colour", white: "White", statement: "Statement", statementIntro: "Signature cuts, rare colours and larger makes. Every listed stone has a matching IGI or GIA certificate record; 360° viewing is shown only where verified for this catalogue.", filter: "Refine the menu", sort: "Sort by", curated: "Curated", caratDesc: "Carat: large to small", caratAsc: "Carat: small to large", newArrivals: "New arrivals", picks: "Curated selections", shape: "Shape", carat: "Carat band", colour: "Colour", clarity: "Clarity", type: "Type", lab: "Lab", all: "All", rows: "stones shown", request: "Request price", certificate: "View certificate", video: "View 360°", download: "Download current view", preparing: "Preparing current view…", commission: "Commission a make", commissionKicker: "ALVORA / MADE TO SPECIFICATION", commissionCopy: "For a profile not in the current menu, send the make your jewellery programme requires.", empty: "No current profiles match these filters.", page: "Page", prev: "Previous", next: "Next", refreshed: "Last refreshed", details: "View full details", made: "Made at our benches in Surat.", fluo: "Fluo", listType: "Type", listFluo: "Fluorescence", crownAngle: "Crown angle", pavilionAngle: "Pavilion angle", girdle: "Girdle" },
  fr: { kicker: "ALVORA / PRODUCTION ACTUELLE", title: "Disponibilités de production actuelles.", intro: "Diamants de synthèse taillés, calibrés et certifiés IGI par nos propres équipes à Surat. Prêts maintenant.", fancy: "Couleurs fantaisie", white: "Blancs", statement: "Statement", statementIntro: "Tailles signature, couleurs rares et fabrications de plus grande dimension. Chaque diamant de synthèse présenté possède un certificat IGI ou GIA correspondant ; la vue 360° n’est affichée que lorsqu’elle est vérifiée pour cette sélection.", filter: "Affiner la sélection", sort: "Trier par", curated: "Sélection", caratDesc: "Carat : grand au petit", caratAsc: "Carat : petit au grand", newArrivals: "Nouveautés", picks: "Sélection de la maison", shape: "Forme", carat: "Plage de carats", colour: "Couleur", clarity: "Pureté", type: "Type", lab: "Laboratoire", all: "Toutes", rows: "pierres affichées", request: "Demander un prix", certificate: "Voir le certificat", video: "Voir à 360°", download: "Télécharger la vue actuelle", preparing: "Préparation de la vue actuelle…", commission: "Demander une fabrication", commissionKicker: "ALVORA / SUR SPÉCIFICATION", commissionCopy: "Pour un profil absent de la sélection actuelle, décrivez la fabrication requise par votre programme joaillier.", empty: "Aucun profil actuel ne correspond à ces filtres.", page: "Page", prev: "Précédent", next: "Suivant", refreshed: "Dernière actualisation", details: "Voir le détail", made: "Fabriqué sur nos établis à Surat.", fluo: "Fluo", listType: "Type", listFluo: "Fluorescence", crownAngle: "Angle de couronne", pavilionAngle: "Angle de pavillon", girdle: "Rondiste" },
  it: { kicker: "ALVORA / PRODUZIONE ATTUALE", title: "Disponibilità di produzione attuale.", intro: "Diamanti sintetici tagliati, calibrati e certificati IGI dai nostri banchi a Surat. Pronti ora.", fancy: "Colori Fancy", white: "Bianchi", statement: "Statement", statementIntro: "Tagli distintivi, colori rari e lavorazioni di dimensioni maggiori. Ogni diamante sintetico indicato ha un certificato IGI o GIA corrispondente; la vista a 360° è mostrata solo dove verificata per questo catalogo.", filter: "Affina il menu", sort: "Ordina per", curated: "Selezione", caratDesc: "Carati: dal grande al piccolo", caratAsc: "Carati: dal piccolo al grande", newArrivals: "Nuovi arrivi", picks: "Selezioni della maison", shape: "Forma", carat: "Fascia carati", colour: "Colore", clarity: "Purezza", type: "Tipo", lab: "Laboratorio", all: "Tutti", rows: "pietre visualizzate", request: "Richiedi il prezzo", certificate: "Vedi certificato", video: "Vedi a 360°", download: "Scarica la vista attuale", preparing: "Preparazione della vista attuale…", commission: "Commissiona una produzione", commissionKicker: "ALVORA / SU SPECIFICA", commissionCopy: "Per un profilo non presente nella selezione attuale, inviate la lavorazione richiesta dal vostro programma di gioielleria.", empty: "Nessun profilo attuale corrisponde a questi filtri.", page: "Pagina", prev: "Precedente", next: "Successiva", refreshed: "Ultimo aggiornamento", details: "Vedi dettagli", made: "Realizzato ai nostri banchi a Surat.", fluo: "Fluo", listType: "Tipo", listFluo: "Fluorescenza", crownAngle: "Angolo corona", pavilionAngle: "Angolo padiglione", girdle: "Cintura" },
} as const;

const detailLabels: Record<Locale, Record<DetailKey, string>> = {
  global: { stock: "Stock no.", collection: "Collection", shape: "Shape", carat: "Carat", caratBand: "Carat band", colour: "Colour", clarity: "Clarity", cut: "Cut", polish: "Polish", symmetry: "Symmetry", fluorescence: "Fluorescence", measurements: "Measurements", depth: "Depth", table: "Table", ratio: "Ratio", lab: "Laboratory", certificate: "Certificate no.", type: "Type", crownHeight: "Crown height", pavilionDepth: "Pavilion depth", crownAngle: "Crown angle", pavilionAngle: "Pavilion angle", girdle: "Girdle" },
  fr: { stock: "N° de stock", collection: "Collection", shape: "Forme", carat: "Carat", caratBand: "Plage de carats", colour: "Couleur", clarity: "Pureté", cut: "Taille", polish: "Polissage", symmetry: "Symétrie", fluorescence: "Fluorescence", measurements: "Dimensions", depth: "Profondeur", table: "Table", ratio: "Ratio", lab: "Laboratoire", certificate: "N° de certificat", type: "Type", crownHeight: "Hauteur de couronne", pavilionDepth: "Profondeur du pavillon", crownAngle: "Angle de couronne", pavilionAngle: "Angle de pavillon", girdle: "Rondiste" },
  it: { stock: "N. stock", collection: "Collezione", shape: "Forma", carat: "Carati", caratBand: "Fascia carati", colour: "Colore", clarity: "Purezza", cut: "Taglio", polish: "Lucidatura", symmetry: "Simmetria", fluorescence: "Fluorescenza", measurements: "Misure", depth: "Profondità", table: "Tavola", ratio: "Rapporto", lab: "Laboratorio", certificate: "N. certificato", type: "Tipo", crownHeight: "Altezza corona", pavilionDepth: "Profondità padiglione", crownAngle: "Angolo corona", pavilionAngle: "Angolo padiglione", girdle: "Cintura" },
};

const menuLinks: Record<Locale, string> = { global: "/", fr: "/fr", it: "/it" };

function SelectField({ label, values, value, onChange, all }: { label: string; values: string[]; value: string; onChange: (value: string) => void; all: string }) {
  return <label className="catalog-filter"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="">{all}</option>{values.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>;
}

function CatalogStoneCard({ stone, isStatement, tab, locale, view, onOpenViewer }: { stone: CatalogStone; isStatement: boolean; tab: CollectionTab; locale: Locale; view: "grid" | "list"; onOpenViewer: (url: string, stockNumber: string) => void }) {
  const text = copy[locale];
  const labels = detailLabels[locale];
  const certText = [stone.lab, stone.reportNumber].filter(Boolean).join(" ");
  const gradeDetails = [stone.cut && `Cut ${stone.cut}`, stone.polish && `Polish ${stone.polish}`, stone.symmetry && `Symmetry ${stone.symmetry}`].filter(Boolean).join(" · ");
  const measurements = [stone.measurements, stone.depthPct !== null && `Depth ${stone.depthPct}%`, stone.tablePct !== null && `Table ${stone.tablePct}%`, stone.ratio !== null && `Ratio ${stone.ratio}`].filter(Boolean) as string[];
  const label = isStatement ? (stone.category === "Fancy Colour" ? stone.color : stone.shape) : (tab === "Fancy Colour" ? stone.color : stone.shape);
  const rawDetails: Array<[DetailKey, string | null]> = [
    ["stock", stone.stockNumber], ["collection", stone.category], ["shape", stone.shape], ["carat", `${stone.carat} ct`], ["caratBand", stone.caratBand], ["colour", stone.color], ["clarity", stone.clarity], ["cut", stone.cut], ["polish", stone.polish], ["symmetry", stone.symmetry], ["fluorescence", stone.fluorescence], ["measurements", stone.measurements], ["depth", stone.depthPct === null ? null : `${stone.depthPct}%`], ["table", stone.tablePct === null ? null : `${stone.tablePct}%`], ["ratio", stone.ratio === null ? null : String(stone.ratio)], ["lab", stone.lab], ["certificate", certText || null], ["type", stone.statementType], ["crownHeight", stone.crownHeight === null ? null : `${stone.crownHeight}%`], ["pavilionDepth", stone.pavilionDepth === null ? null : `${stone.pavilionDepth}%`], ["crownAngle", stone.crownAngle === null ? null : `${stone.crownAngle}°`], ["pavilionAngle", stone.pavilionAngle === null ? null : `${stone.pavilionAngle}°`], ["girdle", stone.girdlePct === null ? null : `${stone.girdlePct}%`],
  ];
  const details = rawDetails.filter((entry): entry is [DetailKey, string] => Boolean(entry[1]));
  const briefDetails = [`${stone.stockNumber} — ${stone.shape}`, `${stone.carat} ct`, stone.color, stone.clarity, certText].filter(Boolean).join(", ");
  const requestHref = `${menuLinks[locale]}?availability=${encodeURIComponent(briefDetails)}#production-brief`;

  return <article className={`catalog-stone${isStatement ? " catalog-statement-stone" : ""}`}>
    {isStatement && stone.imageUrl && <img className="catalog-statement-image" src={stone.imageUrl} alt="" loading="lazy" />}
    <div className="catalog-stone-top"><span>{label}</span><strong>{stone.shape} · {stone.carat.toFixed(stone.carat % 1 === 0 ? 0 : 2)} ct</strong></div>
    {stone.heroNote && <p className="catalog-stone-hero-note">{stone.heroNote}</p>}
    <div className="catalog-stone-grades"><p>{[stone.color, stone.clarity].filter(Boolean).join(" · ")}</p>{gradeDetails && <p>{gradeDetails}</p>}{measurements.length > 0 && <div className="catalog-stone-metrics">{measurements.map((metric) => <span key={metric}>{metric}</span>)}</div>}{isStatement && (stone.statementType || stone.fluorescence) && <p className="catalog-statement-badges">{stone.statementType && <span>{stone.statementType}</span>}{stone.fluorescence && <span>{text.fluo} {stone.fluorescence}</span>}</p>}{isStatement && view === "list" && <p className="catalog-statement-list-details">{[stone.statementType && `${text.listType} ${stone.statementType}`, stone.fluorescence && `${text.listFluo} ${stone.fluorescence}`, stone.crownAngle !== null && `${text.crownAngle} ${stone.crownAngle}°`, stone.pavilionAngle !== null && `${text.pavilionAngle} ${stone.pavilionAngle}°`, stone.girdlePct !== null && `${text.girdle} ${stone.girdlePct}%`].filter(Boolean).join(" · ")}</p>}</div>
    {(certText || stone.verifyUrl) && <div className="catalog-cert"><span>{certText}</span>{stone.verifyUrl ? <a href={stone.verifyUrl} target="_blank" rel="noreferrer">{text.certificate} <ExternalLink size={13} /></a> : null}</div>}
    <div className="catalog-stone-actions"><a href={requestHref}>{text.request} <Send size={14} /></a>{stone.videoUrl && <button className="catalog-video" type="button" onClick={() => onOpenViewer(stone.videoUrl!, stone.stockNumber)}><Play size={13} /> {text.video}</button>}</div>
    <details className="catalog-stone-details"><summary>{text.details}</summary><dl>{details.map(([key, value]) => <div key={key}><dt>{labels[key]}</dt><dd>{value}</dd></div>)}</dl></details>
    <small>{stone.stockNumber}</small>
  </article>;
}

export default function PublicAvailability({ locale = "global" }: { locale?: Locale }) {
  const text = copy[locale];
  const [tab, setTab] = useState<CollectionTab>("Fancy Colour");
  const [shape, setShape] = useState("");
  const [caratBand, setCaratBand] = useState("");
  const [colour, setColour] = useState("");
  const [clarity, setClarity] = useState("");
  const [statementType, setStatementType] = useState("");
  const [lab, setLab] = useState("");
  const [sort, setSort] = useState<"curated" | "carat_desc" | "carat_asc" | "new_arrivals">("curated");
  const [page, setPage] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [viewer, setViewer] = useState<{ url: string; stockNumber: string } | null>(null);
  const reportedCuratedTabs = useRef(new Set<CollectionTab>());
  const isStatement = tab === "statement";
  const coreCategory = tab === "statement" ? undefined : tab;
  const filterInput = useMemo(() => ({ collection: isStatement ? "statement" as const : "core" as const, category: coreCategory, shapes: shape ? [shape] : undefined, caratBands: caratBand ? [caratBand] : undefined, colours: colour ? [colour] : undefined, clarities: clarity ? [clarity] : undefined, statementTypes: isStatement && statementType ? [statementType] : undefined, labs: isStatement && lab ? [lab] : undefined, sort, page, pageSize: 48 }), [isStatement, coreCategory, shape, caratBand, colour, clarity, statementType, lab, sort, page]);
  const statementSummaryInput = useMemo(() => ({ collection: "statement" as const }), []);
  const activeSummaryInput = useMemo(() => isStatement ? { collection: "statement" as const } : { category: coreCategory }, [isStatement, coreCategory]);
  const catalog = trpc.availability.profiles.useQuery(filterInput);
  const coreSummary = trpc.availability.summary.useQuery();
  const statementSummary = trpc.availability.summary.useQuery(statementSummaryInput);
  const activeSummary = trpc.availability.summary.useQuery(activeSummaryInput);
  const downloadCurrentView = trpc.availability.downloadCurrentView.useMutation({ onSuccess: (result) => window.open(result.storageUrl, "_blank", "noopener,noreferrer") });
  const filters = useMemo(() => ({ shapes: activeSummary.data?.byShape.map((entry) => entry.shape).sort() ?? [], caratBands: activeSummary.data?.byCaratBand.map((entry) => entry.caratBand) ?? [], colours: activeSummary.data?.byColour.map((entry) => entry.colour).sort() ?? [], clarities: activeSummary.data?.byClarity.map((entry) => entry.clarity).sort() ?? [], types: activeSummary.data?.byStatementType.map((entry) => entry.statementType).sort() ?? [], labs: activeSummary.data?.byLab.map((entry) => entry.lab).sort() ?? [] }), [activeSummary.data]);
  const totalPages = Math.max(1, Math.ceil((catalog.data?.total ?? 0) / (catalog.data?.pageSize ?? 48)));
  const resetPage = (set: (value: string) => void) => (value: string) => { set(value); setPage(0); };
  const setCollection = (next: CollectionTab) => { setTab(next); setPage(0); setShape(""); setCaratBand(""); setColour(""); setClarity(""); setStatementType(""); setLab(""); };
  const visibleStones = catalog.data?.profiles ?? [];
  const pinnedStones = page === 0 ? visibleStones.filter((stone) => stone.isPinned) : [];
  const regularStones = visibleStones.filter((stone) => !stone.isPinned);
  const tabCount = (target: CollectionTab) => {
    if (target === tab) return catalog.isLoading ? "—" : catalog.data?.total ?? "—";
    if (target === "statement") return statementSummary.isLoading ? "—" : statementSummary.data?.total ?? "—";
    return coreSummary.isLoading ? "—" : coreSummary.data?.byCategory.find((entry) => entry.category === target)?.count ?? "—";
  };

  useEffect(() => {
    if (sort !== "curated" || page !== 0 || !visibleStones.length || reportedCuratedTabs.current.has(tab) || typeof window === "undefined") return;
    const tracker = (window as Window & { umami?: { track?: (event: string, data: Record<string, unknown>) => void } }).umami;
    tracker?.track?.("availability_first_screen_view", { tab, first_stock_nos: visibleStones.slice(0, 8).map((stone) => stone.stockNumber) });
    reportedCuratedTabs.current.add(tab);
  }, [page, sort, tab, visibleStones]);

  return <div className="catalog-shell"><PublicMetadata locale={locale} page="availability" /><header className="catalog-header"><Link href={menuLinks[locale]} className="brand"><span className="brand-name">ALVORA</span></Link><nav><a href={menuLinks[locale]}>{text.made}</a><a href="#catalog-filter">{text.filter}</a><a href="#catalog-collections">{text.fancy} / {text.white} / {text.statement}</a></nav><Link href={menuLinks[locale]} className="catalog-back">← Alvora</Link></header>
    <main>
      <section className="catalog-hero"><p className="eyebrow eyebrow-bright"><span /> {text.kicker}</p><h1>{text.title}</h1><p>{text.intro}</p>{(isStatement ? statementSummary.data?.import : coreSummary.data?.import) && <p className="catalog-freshness">{text.refreshed}: {new Date((isStatement ? statementSummary.data?.import : coreSummary.data?.import)!.activatedAt).toLocaleString()}</p>}</section>
      <section className="catalog-collection-tabs" aria-label="Collection selection"><button className={tab === "Fancy Colour" ? "is-active" : ""} onClick={() => setCollection("Fancy Colour")}>{text.fancy}<span>{tabCount("Fancy Colour")}</span></button><button className={tab === "White" ? "is-active" : ""} onClick={() => setCollection("White")}>{text.white}<span>{tabCount("White")}</span></button><button className={isStatement ? "is-active" : ""} onClick={() => setCollection("statement")}>{text.statement}<span>{tabCount("statement")}</span></button></section>
      {isStatement && <p className="catalog-statement-intro">{text.statementIntro}</p>}
      <section className="catalog-controls" id="catalog-filter"><div className="catalog-filter-title"><SlidersHorizontal size={16} /><span>{text.filter}</span></div><div className="catalog-filter-fields"><SelectField label={text.shape} values={filters.shapes} value={shape} onChange={resetPage(setShape)} all={text.all} /><SelectField label={text.carat} values={filters.caratBands} value={caratBand} onChange={resetPage(setCaratBand)} all={text.all} /><SelectField label={text.colour} values={filters.colours} value={colour} onChange={resetPage(setColour)} all={text.all} /><SelectField label={text.clarity} values={filters.clarities} value={clarity} onChange={resetPage(setClarity)} all={text.all} />{isStatement && <><SelectField label={text.type} values={filters.types} value={statementType} onChange={resetPage(setStatementType)} all={text.all} /><SelectField label={text.lab} values={filters.labs} value={lab} onChange={resetPage(setLab)} all={text.all} /></>}</div><label className="catalog-sort"><span>{text.sort}</span><select value={sort} onChange={(event) => { setSort(event.target.value as typeof sort); setPage(0); }}><option value="curated">{text.curated}</option><option value="carat_desc">{text.caratDesc}</option><option value="carat_asc">{text.caratAsc}</option><option value="new_arrivals">{text.newArrivals}</option></select></label><div className="catalog-view-toggle"><button className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={16} /></button><button className={view === "list" ? "is-active" : ""} onClick={() => setView("list")} aria-label="List view"><List size={16} /></button></div><button className="catalog-download" type="button" disabled={!catalog.data?.profiles.length || downloadCurrentView.isPending} onClick={() => downloadCurrentView.mutate({ collection: isStatement ? "statement" : "core", stoneIds: catalog.data?.profiles.map((stone) => stone.id) ?? [] })}><Download size={14} /> {downloadCurrentView.isPending ? text.preparing : text.download}</button>{downloadCurrentView.error && <p className="catalog-download-error">{downloadCurrentView.error.message}</p>}</section>
      <div id="catalog-collections" className="catalog-results" aria-live="polite">{catalog.isLoading ? <section className={view === "grid" ? "catalog-grid" : "catalog-list"}><p className="catalog-loading"><Loader2 className="animate-spin" /> Loading current production…</p></section> : visibleStones.length ? <>{pinnedStones.length > 0 && <section className="catalog-curated"><header><p className="eyebrow"><span /> {text.picks}</p></header><div className={view === "grid" ? "catalog-grid catalog-curated-grid" : "catalog-list catalog-curated-list"}>{pinnedStones.map((stone) => <CatalogStoneCard key={stone.id} stone={stone} isStatement={isStatement} tab={tab} locale={locale} view={view} onOpenViewer={(url, stockNumber) => setViewer({ url, stockNumber })} />)}</div></section>}{regularStones.length > 0 && <section className={view === "grid" ? "catalog-grid" : "catalog-list"}>{regularStones.map((stone) => <CatalogStoneCard key={stone.id} stone={stone} isStatement={isStatement} tab={tab} locale={locale} view={view} onOpenViewer={(url, stockNumber) => setViewer({ url, stockNumber })} />)}</section>}</> : <section className={view === "grid" ? "catalog-grid" : "catalog-list"}><p className="catalog-empty">{text.empty}</p></section>}</div>
      {(catalog.data?.total ?? 0) > 0 && <nav className="catalog-pagination" aria-label="Catalog pages"><button disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}><ChevronLeft size={16} /> {text.prev}</button><span>{text.page} {page + 1} / {totalPages} · {catalog.data?.total} {text.rows}</span><button disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>{text.next} <ChevronRight size={16} /></button></nav>}
      <section className="catalog-commission"><p className="eyebrow"><span /> {text.commissionKicker}</p><h2>{text.commission}</h2><p>{text.commissionCopy}</p><a href={`${menuLinks[locale]}#production-brief`}>{text.commission} <Send size={15} /></a></section>
    </main>{viewer && <div className="catalog-viewer-backdrop" role="presentation" onMouseDown={() => setViewer(null)}><section className="catalog-viewer" role="dialog" aria-modal="true" aria-label={`360° viewer for ${viewer.stockNumber}`} onMouseDown={(event) => event.stopPropagation()}><header><span>{viewer.stockNumber} · {text.video}</span><button type="button" onClick={() => setViewer(null)} aria-label="Close 360 viewer"><X size={18} /></button></header><iframe src={viewer.url} title={`360° viewer for ${viewer.stockNumber}`} allow="fullscreen" /></section></div>}
  </div>;
}

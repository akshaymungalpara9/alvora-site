import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArchiveRestore, Database, FileCheck2, Loader2, Pin, Search, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type Collection = "core" | "statement";
type ImportPreview = { filename: string; collection: Collection; valid: boolean; rowCount: number; rejectionReport: { row: number; sku: string; reason: string }[]; whiteRowCount: number; fancyRowCount: number; flaggedRows: { sku: string; flags: string[] }[] };
const coreHeader = "stock_no,category,colour,shape,carat,carat_band,clarity,cut,polish,symmetry,measurements,depth_pct,table_pct,ratio,lab,cert_no,verify_url,video_url";
const statementHeader = "stock_no,category,type,colour,shape,carat,carat_band,clarity,cut,polish,symmetry,fluorescence,measurements,ratio,depth_pct,table_pct,crown_height,pavilion_depth,crown_angle,pavilion_angle,girdle_pct,lab,cert_no,cert_pdf_url,video_url,image_url";

export default function AdminAvailability() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [collection, setCollection] = useState<Collection>("core");
  const [file, setFile] = useState<File | null>(null);
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [curationSearch, setCurationSearch] = useState("");
  const [curationNotice, setCurationNotice] = useState("");
  const summary = trpc.adminAvailability.summary.useQuery({ collection }, { enabled: isAuthenticated });
  const versions = trpc.adminAvailability.versions.useQuery(undefined, { enabled: isAuthenticated });
  const curation = trpc.adminAvailability.curation.useQuery({ collection }, { enabled: isAuthenticated });
  const validate = trpc.adminAvailability.validateImport.useMutation({ onSuccess: (data) => setPreview(data) });
  const replace = trpc.adminAvailability.replaceImport.useMutation({ onSuccess: () => { setPreview(null); setFile(null); setCsv(""); void utils.adminAvailability.summary.invalidate(); void utils.adminAvailability.versions.invalidate(); void utils.adminAvailability.curation.invalidate(); void utils.availability.profiles.invalidate(); void utils.availability.summary.invalidate(); } });
  const restore = trpc.adminAvailability.restoreVersion.useMutation({ onSuccess: () => { void utils.adminAvailability.summary.invalidate(); void utils.adminAvailability.versions.invalidate(); void utils.adminAvailability.curation.invalidate(); void utils.availability.profiles.invalidate(); void utils.availability.summary.invalidate(); } });
  const updateCuration = trpc.adminAvailability.updateCuration.useMutation({
    onSuccess: () => { setCurationNotice("Curation settings saved."); void utils.adminAvailability.curation.invalidate(); void utils.availability.profiles.invalidate(); },
    onError: (error) => setCurationNotice(error.message),
  });
  const data = summary.data;
  const collectionLabel = collection === "statement" ? "STATEMENT" : "CORE / FANCY COLOUR + WHITE";
  const pinnedCount = curation.data?.filter((stone) => stone.pinned).length ?? 0;
  const visibleCuration = useMemo(() => {
    const term = curationSearch.trim().toLowerCase();
    const rows = curation.data ?? [];
    const matched = term ? rows.filter((stone) => [stone.stockNumber, stone.shape, stone.color, stone.category, stone.clarity].filter(Boolean).some((value) => value!.toLowerCase().includes(term))) : rows;
    return matched.slice(0, 48);
  }, [curation.data, curationSearch]);

  const chooseCollection = (next: Collection) => { setCollection(next); setFile(null); setCsv(""); setPreview(null); setConfirmed(false); setCurationSearch(""); setCurationNotice(""); };
  const chooseFile = async (event: ChangeEvent<HTMLInputElement>) => { const selected = event.target.files?.[0] ?? null; setFile(selected); setPreview(null); setConfirmed(false); setCsv(selected ? await selected.text() : ""); };
  const validateSelected = () => { if (file && csv) validate.mutate({ filename: file.name, csv, collection }); };
  const replaceCurrent = () => { if (file && csv && preview?.valid && confirmed) replace.mutate({ filename: file.name, csv, collection }); };
  const saveCuration = (event: FormEvent<HTMLFormElement>, stockNumber: string) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const pinRank = String(form.get("pinRank") || "").trim();
    const catalogTab = String(form.get("catalogTab")) as "Fancy Colour" | "White" | "statement";
    updateCuration.mutate({ collection, catalogTab, stockNumber, pinned: form.get("pinned") === "on", pinRank: pinRank ? Number(pinRank) : undefined, heroNote: String(form.get("heroNote") || "").trim() || undefined });
  };

  return <DashboardLayout><div className="admin-shell availability-admin-shell">
    <header className="admin-topline"><div><p className="portal-kicker">ALVORA / AVAILABILITY CONTROL</p><h1>Live availability.</h1><p>Validate first, then replace only the selected collection’s active snapshot. Other collections remain live and previous versions remain recoverable.</p></div><Database size={25} className="text-[#c9ff63]" /></header>
    <p className="admin-data-note">Every catalog collection carries no price field. Price is neither imported, calculated, displayed, nor included in buyer collateral.</p>
    <section className="availability-import-panel"><header><div><p className="portal-kicker">01 / SELECT COLLECTION</p><h2>Review before activation.</h2></div><FileCheck2 size={19} /></header><label className="availability-file-field"><span>Collection</span><select value={collection} onChange={(event) => chooseCollection(event.target.value as Collection)}><option value="core">Core — Fancy Colour + White</option><option value="statement">STATEMENT</option></select></label><p>Required header: <code>{collection === "statement" ? statementHeader : coreHeader}</code></p><label className="availability-file-field"><span>{collectionLabel} CSV</span><input type="file" accept=".csv,text/csv" onChange={chooseFile} />{file && <small>{file.name}</small>}</label><div className="admin-actions"><button className="admin-primary" onClick={validateSelected} disabled={!file || validate.isPending}>{validate.isPending ? <><Loader2 size={15} className="animate-spin" /> Validating…</> : <><Upload size={15} /> Validate file</>}</button></div>{validate.error && <p className="availability-error">{validate.error.message}</p>}{preview && <div className={preview.valid ? "availability-preview availability-preview-valid" : "availability-preview availability-preview-invalid"}><div><strong>{preview.valid ? "Validation passed" : "Validation blocked"}</strong><span>{preview.rowCount} rows checked · {preview.fancyRowCount} Fancy Colour · {preview.whiteRowCount} White</span></div>{preview.rejectionReport.length > 0 && <div className="availability-report"><p>Rejection report</p>{preview.rejectionReport.map((row) => <article key={`${row.row}-${row.sku}`}><strong>{row.sku}</strong><span>Line {row.row} · {row.reason}</span></article>)}</div>}{preview.valid && <div className="availability-activate"><label><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> I have reviewed the validation and understand this replaces only the selected live collection.</label><button className="admin-primary" onClick={replaceCurrent} disabled={!confirmed || replace.isPending}>{replace.isPending ? <><Loader2 size={15} className="animate-spin" /> Activating…</> : `Replace ${collectionLabel} availability`}</button>{replace.error && <p className="availability-error">{replace.error.message}</p>}</div>}</div>}</section>
    <section className="availability-summary-grid"><article><span>Live {collectionLabel} SKUs</span><strong>{data?.totals.live ?? "—"}</strong></article><article><span>Fancy Colour</span><strong>{data?.activeImport?.fancyRowCount ?? "—"}</strong></article><article><span>White</span><strong>{data?.activeImport?.whiteRowCount ?? "—"}</strong></article><article><span>Last refreshed</span><strong className="availability-summary-date">{data?.activeImport ? new Date(data.activeImport.activatedAt).toLocaleString() : "No live import"}</strong></article></section>
    <section className="availability-admin-grid"><article className="availability-admin-card"><header><div><p className="portal-kicker">LIVE MIX</p><h2>By shape</h2></div></header>{data?.byShape.length ? <div className="availability-breakdown">{data.byShape.map((item) => <p key={item.shape}><span>{item.shape}</span><strong>{item.count}</strong></p>)}</div> : <p className="admin-empty">No active {collectionLabel} snapshot yet.</p>}</article><article className="availability-admin-card"><header><div><p className="portal-kicker">LIVE MIX</p><h2>By carat band</h2></div></header>{data?.byCaratBand.length ? <div className="availability-breakdown">{data.byCaratBand.map((item) => <p key={item.band}><span>{item.band}</span><strong>{item.count}</strong></p>)}</div> : <p className="admin-empty">No active {collectionLabel} snapshot yet.</p>}</article></section>
    <section className="availability-admin-card availability-curation-panel"><header><div><p className="portal-kicker">02 / CURATED FIRST SCREEN</p><h2>Pin a house selection.</h2></div><Pin size={19} /></header><p>Pin up to eight active, certificate-verified stones for each public tab. Lower rank appears first. The optional note is shown under the public card headline. Pins and first-seen dates survive a refresh only when the same stock number remains in this collection.</p><div className="availability-curation-toolbar"><label><Search size={15} /><span>Find stock</span><input value={curationSearch} onChange={(event) => setCurationSearch(event.target.value)} placeholder="Stock, shape, colour" /></label><span>{pinnedCount} pinned across this admin collection</span></div>{curationNotice && <p className="admin-message">{curationNotice}</p>}<div className="availability-curation-list">{visibleCuration.map((stone) => <form key={`${stone.catalogTab}-${stone.stockNumber}`} className="availability-curation-row" onSubmit={(event) => saveCuration(event, stone.stockNumber)}><input name="catalogTab" type="hidden" value={stone.catalogTab} /><div><strong>{stone.stockNumber}</strong><span>{[stone.catalogTab, stone.shape, `${stone.carat.toFixed(2)} ct`, stone.color, stone.clarity].filter(Boolean).join(" · ")}</span></div><label><input name="pinned" type="checkbox" defaultChecked={stone.pinned} /> Pin to top</label><label>Rank<input name="pinRank" type="number" min="1" max="999" defaultValue={stone.pinRank ?? ""} /></label><label className="availability-hero-note">Hero note<input name="heroNote" maxLength={120} defaultValue={stone.heroNote ?? ""} placeholder="Optional · maximum 120 characters" /></label><button className="admin-primary" type="submit" disabled={updateCuration.isPending}>{updateCuration.isPending ? "Saving…" : "Save"}</button></form>)}{!visibleCuration.length && <p className="admin-empty">{curationSearch ? "No current stock matches this search." : "No certificate-verified current stock is available to curate."}</p>}</div></section>
    <section className="availability-admin-card"><header><div><p className="portal-kicker">IMPORT VALIDATION</p><h2>Catalog acceptance</h2></div><FileCheck2 size={19} /></header><p className="admin-empty">Core imports require complete certificate and verification data. STATEMENT imports retain supplied image, viewer, and certificate-PDF fields; intentionally blank certificate details remain blank, never inferred. Any malformed identifier, required profile field, numeric detail, or supplied URL is blocked before activation.</p></section>
    <section className="availability-admin-card"><header><div><p className="portal-kicker">RECOVERY</p><h2>Snapshot history</h2></div><ArchiveRestore size={19} /></header>{versions.data?.length ? <div className="availability-version-list">{versions.data.map((version) => <article key={version.id}><div><strong>{version.sourceFilename}</strong><span>{version.collection === "statement" ? "STATEMENT" : "CORE"} · {version.rowCount} rows · {version.fancyRowCount} Fancy Colour · {version.whiteRowCount} White · {new Date(version.activatedAt).toLocaleString()}</span></div>{version.status === "active" ? <em>Active</em> : <button onClick={() => restore.mutate({ importId: version.id })} disabled={restore.isPending}>Restore this version</button>}</article>)}</div> : <p className="admin-empty">No availability snapshots have been imported.</p>}</section>
  </div></DashboardLayout>;
}

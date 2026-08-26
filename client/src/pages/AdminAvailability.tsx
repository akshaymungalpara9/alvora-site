import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArchiveRestore, Database, FileCheck2, Loader2, Upload } from "lucide-react";
import { ChangeEvent, useState } from "react";

type ImportPreview = {
  filename: string;
  valid: boolean;
  rowCount: number;
  rejectionReport: { row: number; sku: string; reason: string }[];
  standardRowCount: number;
  flaggedRows: { sku: string; flags: string[] }[];
};

export default function AdminAvailability() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const summary = trpc.adminAvailability.summary.useQuery(undefined, { enabled: isAuthenticated });
  const versions = trpc.adminAvailability.versions.useQuery(undefined, { enabled: isAuthenticated });
  const validate = trpc.adminAvailability.validateImport.useMutation({ onSuccess: (data) => setPreview(data) });
  const replace = trpc.adminAvailability.replaceImport.useMutation({
    onSuccess: () => {
      setPreview(null);
      setFile(null);
      setCsv("");
      void utils.adminAvailability.summary.invalidate();
      void utils.adminAvailability.versions.invalidate();
      void utils.availability.profiles.invalidate();
      void utils.buyer.myAvailability.invalidate();
    },
  });
  const restore = trpc.adminAvailability.restoreVersion.useMutation({
    onSuccess: () => {
      void utils.adminAvailability.summary.invalidate();
      void utils.adminAvailability.versions.invalidate();
      void utils.availability.profiles.invalidate();
      void utils.buyer.myAvailability.invalidate();
    },
  });
  const [file, setFile] = useState<File | null>(null);
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const chooseFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setPreview(null);
    setConfirmed(false);
    setCsv(selected ? await selected.text() : "");
  };

  const validateSelected = () => {
    if (!file || !csv) return;
    validate.mutate({ filename: file.name, csv });
  };

  const replaceCurrent = () => {
    if (!file || !csv || !preview?.valid || !confirmed) return;
    replace.mutate({ filename: file.name, csv });
  };

  const data = summary.data;
  return <DashboardLayout><div className="admin-shell availability-admin-shell">
    <header className="admin-topline"><div><p className="portal-kicker">ALVORA / AVAILABILITY CONTROL</p><h1>Live availability.</h1><p>Validate first, then replace the active snapshot only with an explicit administrative confirmation. Previous snapshots remain recoverable.</p></div><Database size={25} className="text-[#c9ff63]" /></header>
    <p className="admin-data-note">`origin_partner` appears only in this protected review surface. It is omitted from public production profiles, buyer availability responses, private requests, and buyer line-sheet PDFs.</p>

    <section className="availability-import-panel"><header><div><p className="portal-kicker">01 / VALIDATE CSV</p><h2>Review before activation.</h2></div><FileCheck2 size={19} /></header><p>Required header: <code>sku,shape,carat,color,clarity,cut,fluorescence,measurements,igi_cert_number,video_url,price_usd,band_tag,origin_partner</code></p><label className="availability-file-field"><span>Availability CSV</span><input type="file" accept=".csv,text/csv" onChange={chooseFile} />{file && <small>{file.name}</small>}</label><div className="admin-actions"><button className="admin-primary" onClick={validateSelected} disabled={!file || validate.isPending}>{validate.isPending ? <><Loader2 size={15} className="animate-spin" /> Validating…</> : <><Upload size={15} /> Validate file</>}</button></div>
      {validate.error && <p className="availability-error">{validate.error.message}</p>}
      {preview && <div className={preview.valid ? "availability-preview availability-preview-valid" : "availability-preview availability-preview-invalid"}><div><strong>{preview.valid ? "Validation passed" : "Validation blocked"}</strong><span>{preview.rowCount} row{preview.rowCount === 1 ? "" : "s"} checked · {preview.standardRowCount} standard · {preview.flaggedRows.length} flagged</span></div>{preview.rejectionReport.length > 0 && <div className="availability-report"><p>Rejection report</p>{preview.rejectionReport.map((row) => <article key={`${row.row}-${row.sku}`}><strong>{row.sku}</strong><span>Line {row.row} · {row.reason}</span></article>)}</div>}{preview.flaggedRows.length > 0 && <div className="availability-report"><p>Standards review — retained but not buyer/public visible</p>{preview.flaggedRows.map((row) => <article key={row.sku}><strong>{row.sku}</strong><span>{row.flags.join("; ")}</span></article>)}</div>}{preview.valid && <div className="availability-activate"><label><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> I have reviewed the validation and understand this replaces the current live snapshot.</label><button className="admin-primary" onClick={replaceCurrent} disabled={!confirmed || replace.isPending}>{replace.isPending ? <><Loader2 size={15} className="animate-spin" /> Activating…</> : "Replace live availability"}</button>{replace.error && <p className="availability-error">{replace.error.message}</p>}</div>}</div>}
    </section>

    <section className="availability-summary-grid"><article><span>Live SKUs</span><strong>{data?.totals.live ?? "—"}</strong></article><article><span>Standard menu</span><strong>{data?.totals.standard ?? "—"}</strong></article><article className={data?.totals.flagged ? "availability-summary-warning" : ""}><span>Flagged review</span><strong>{data?.totals.flagged ?? "—"}</strong></article><article><span>Last refreshed</span><strong className="availability-summary-date">{data?.activeImport ? new Date(data.activeImport.activatedAt).toLocaleString() : "No live import"}</strong></article></section>

    <section className="availability-admin-grid"><article className="availability-admin-card"><header><div><p className="portal-kicker">LIVE MIX</p><h2>By shape</h2></div></header>{data?.byShape.length ? <div className="availability-breakdown">{data.byShape.map((item) => <p key={item.shape}><span>{item.shape}</span><strong>{item.count}</strong></p>)}</div> : <p className="admin-empty">No active availability snapshot yet.</p>}</article><article className="availability-admin-card"><header><div><p className="portal-kicker">LIVE MIX</p><h2>By carat band</h2></div></header>{data?.byCaratBand.length ? <div className="availability-breakdown">{data.byCaratBand.map((item) => <p key={item.band}><span>{item.band}</span><strong>{item.count}</strong></p>)}</div> : <p className="admin-empty">No active availability snapshot yet.</p>}</article></section>

    <section className="availability-admin-card"><header><div><p className="portal-kicker">STANDARDS REVIEW</p><h2>Flagged rows</h2></div><AlertTriangle size={19} /></header>{data?.flaggedRows.length ? <div className="availability-flagged-list">{data.flaggedRows.map((row) => <article key={row.id}><div><strong>{row.stockNumber}</strong><span>{row.shape} · {row.carat} ct · {row.color} · {row.clarity} · {row.cut || "—"}</span><small>{Array.isArray(row.standardsFlags) ? row.standardsFlags.join("; ") : "Review required"}</small></div><p><b>Partner origin (admin only)</b>{row.originPartner || "Not recorded"}</p></article>)}</div> : <p className="admin-empty">No flagged rows in the active snapshot.</p>}</section>

    <section className="availability-admin-card"><header><div><p className="portal-kicker">RECOVERY</p><h2>Snapshot history</h2></div><ArchiveRestore size={19} /></header>{versions.data?.length ? <div className="availability-version-list">{versions.data.map((version) => <article key={version.id}><div><strong>{version.sourceFilename}</strong><span>{version.rowCount} rows · {version.standardRowCount} standard · {version.flaggedRowCount} flagged · {new Date(version.activatedAt).toLocaleString()}</span></div>{version.status === "active" ? <em>Active</em> : <button onClick={() => restore.mutate({ importId: version.id })} disabled={restore.isPending}>Restore this version</button>}</article>)}</div> : <p className="admin-empty">No availability snapshots have been imported.</p>}</section>
  </div></DashboardLayout>;
}

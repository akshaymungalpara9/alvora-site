import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Check, Download, Gem, Loader2, MailWarning, RotateCw } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

const statusOptions = ["new", "contacted", "quoted", "won", "lost", "on_hold"] as const;
type FollowUpStatus = (typeof statusOptions)[number];

const contactLabels: Record<string, string> = { email: "email", whatsapp: "WhatsApp", phone: "phone", video: "video call" };

export default function AdminJewelleryEnquiries() {
  const { user, loading } = useAuth();
  const canLoad = !loading && user?.role === "admin";
  const enquiries = trpc.adminJewellery.list.useQuery(undefined, { enabled: canLoad });
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState<"all" | FollowUpStatus>("all");
  const [kindFilter, setKindFilter] = useState<"all" | "piece" | "consultation">("all");
  const [notice, setNotice] = useState("");
  const update = trpc.adminJewellery.updateFollowUp.useMutation({
    onSuccess: () => {
      utils.adminJewellery.list.invalidate();
      setNotice("Follow-up saved.");
    },
    onError: (error) => setNotice(error.message),
  });
  const retry = trpc.adminJewellery.retryAlert.useMutation({
    onSuccess: (result) => {
      utils.adminJewellery.list.invalidate();
      setNotice(result.alertStatus === "sent" ? "Alert resent." : "Alert still failing; the enquiry stays saved here.");
    },
    onError: (error) => setNotice(error.message),
  });
  const exportCsv = trpc.adminJewellery.exportCsv.useQuery(undefined, { enabled: false });

  const visible = useMemo(
    () => enquiries.data?.filter((item) => (statusFilter === "all" || item.followUpStatus === statusFilter) && (kindFilter === "all" || item.kind === kindFilter)) ?? [],
    [enquiries.data, statusFilter, kindFilter],
  );

  const save = (event: FormEvent<HTMLFormElement>, id: number) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    update.mutate({
      id,
      followUpStatus: String(data.get("followUpStatus")) as FollowUpStatus,
      ownerName: String(data.get("ownerName") || "").trim() || undefined,
      internalNote: String(data.get("internalNote") || "").trim() || undefined,
    });
  };

  const download = async () => {
    setNotice("");
    const result = await exportCsv.refetch();
    if (!result.data) return setNotice("The export could not be prepared. Please try again.");
    const url = URL.createObjectURL(new Blob([result.data.content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = result.data.filename;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Jewellery enquiry export downloaded.");
  };

  if (!loading && user?.role !== "admin") {
    return <DashboardLayout><div className="admin-shell"><p className="portal-kicker">ALVORA / ADMIN</p><h1>Administrative access only.</h1><p className="admin-empty">This area is reserved for the Alvora team.</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="admin-shell">
        <header className="admin-topline">
          <div>
            <p className="portal-kicker">ALVORA / JEWELLERY ENQUIRIES</p>
            <h1>Jewellery enquiries</h1>
            <p>Piece enquiries and consultation requests from the jewellery site. Each is saved before the alert email is sent.</p>
          </div>
          <div className="admin-brief-header-actions">
            <button className="admin-export-button" type="button" onClick={download} disabled={exportCsv.isFetching}>
              <Download size={15} /> {exportCsv.isFetching ? "Preparing…" : "Export CSV"}
            </button>
          </div>
        </header>
        <p className="brief-export-note">Internal use only. The maker column is private and must never be shared with customers.</p>
        <div className="brief-filter">
          <span>Show</span>
          <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | FollowUpStatus)}>
            <option value="all">All statuses</option>
            {statusOptions.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
          </select>
          <select aria-label="Filter by type" value={kindFilter} onChange={(event) => setKindFilter(event.target.value as "all" | "piece" | "consultation")}>
            <option value="all">Enquiries and consultations</option>
            <option value="piece">Piece enquiries</option>
            <option value="consultation">Consultations</option>
          </select>
          <span>{visible.length} shown</span>
        </div>
        {notice ? <p className="admin-message">{notice}</p> : null}
        {enquiries.isLoading ? (
          <Loader2 className="animate-spin text-[#9c7a32]" />
        ) : (
          <div className="admin-brief-list">
            {visible.map((item) => (
              <article className="admin-brief" key={item.id}>
                <header>
                  <div>
                    <p className="admin-account-name">{item.kind === "consultation" ? "Consultation" : item.pieceName ?? "Piece enquiry"}</p>
                    <p>{item.contactName} · <a href={`mailto:${item.email}`}>{item.email}</a>{item.phone ? ` · ${item.phone}` : ""}</p>
                  </div>
                  <div className="admin-brief-statuses">
                    <span className={`admin-status admin-status-${item.followUpStatus}`}>{item.followUpStatus.replace("_", " ")}</span>
                    <span className={`admin-status admin-status-alert-${item.alertStatus}`}>alert {item.alertStatus}</span>
                  </div>
                </header>
                <p className="admin-bands">
                  {[item.pieceCode, item.karat && item.metal ? `${item.karat} ${item.metal.toLowerCase()}` : item.metal, item.caratWeight ? `${item.caratWeight} ct` : null, item.ringSize ? `size ${item.ringSize}` : null, item.country, `prefers ${contactLabels[item.preferredContact]}`, item.preferredTime, item.budget ? `budget ${item.budget}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {item.maker ? <p className="admin-bands">Maker (internal): {item.maker.partner} · {item.maker.handle}{item.maker.partnerPriceUsd != null ? ` · partner price $${item.maker.partnerPriceUsd}` : ""}</p> : null}
                {item.landingPage ? <p className="admin-bands">Landed on {item.landingPage}{item.referrer ? ` · from ${item.referrer}` : ""}</p> : null}
                {item.sourceClass || item.utmSource ? (
                  <p className="admin-bands">
                    Source {item.sourceClass ?? "unknown"}
                    {item.utmSource ? ` · utm_source=${item.utmSource}` : ""}
                    {item.utmMedium ? ` · utm_medium=${item.utmMedium}` : ""}
                    {item.utmCampaign ? ` · utm_campaign=${item.utmCampaign}` : ""}
                  </p>
                ) : null}
                {item.message ? <p className="admin-brief-body">{item.message}</p> : null}
                <form className="brief-triage-form" onSubmit={(event) => save(event, item.id)}>
                  <label>Status<select name="followUpStatus" defaultValue={item.followUpStatus}>{statusOptions.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></label>
                  <label>Owner<input name="ownerName" defaultValue={item.ownerName || ""} placeholder="Initials or team member" /></label>
                  <label className="brief-triage-note">Internal note<textarea name="internalNote" defaultValue={item.internalNote || ""} rows={2} placeholder="Quote sent, size confirmed, next step" /></label>
                  <button type="submit" disabled={update.isPending}>{update.isPending ? "Saving…" : <><Check size={14} /> Save</>}</button>
                </form>
                <footer>
                  <span>Received {new Date(item.createdAt).toLocaleString()}</span>
                  {item.lastActionAt ? <span>Updated {new Date(item.lastActionAt).toLocaleString()}</span> : null}
                  {item.alertError ? <span className="admin-brief-error"><MailWarning size={14} /> {item.alertError}</span> : null}
                  {item.alertStatus === "failed" ? (
                    <button className="brief-retry-button" type="button" onClick={() => retry.mutate({ id: item.id })} disabled={retry.isPending}>
                      <RotateCw size={14} /> Retry alert
                    </button>
                  ) : null}
                </footer>
              </article>
            ))}
            {visible.length === 0 ? (
              <p className="admin-empty"><Gem size={18} /> {enquiries.data?.length ? "No enquiries match these filters." : "No jewellery enquiries yet."}</p>
            ) : null}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

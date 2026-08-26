import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Check, ClipboardList, Download, Loader2, MailWarning, RotateCw, Timer } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

const statusOptions = ["new", "reviewing", "shortlist_sent", "quoted", "on_hold", "closed"] as const;
type FollowUpStatus = (typeof statusOptions)[number];
const marketOptions = ["GLOBAL", "FR", "IT", "US", "CA"] as const;
type MarketCode = (typeof marketOptions)[number];

export default function AdminProductionBriefs() {
  const { user, loading } = useAuth();
  const canLoadAdminData = !loading && user?.role === "admin";
  const briefs = trpc.adminBriefs.list.useQuery(undefined, { enabled: canLoadAdminData });
  const qualifierSchedule = trpc.adminBriefs.qualifierFollowUpSchedule.useQuery(undefined, { enabled: canLoadAdminData });
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState<"all" | FollowUpStatus>("all");
  const [marketFilter, setMarketFilter] = useState<"all" | MarketCode>("all");
  const [notice, setNotice] = useState("");
  const update = trpc.adminBriefs.updateFollowUp.useMutation({
    onSuccess: () => {
      utils.adminBriefs.list.invalidate();
      setNotice("Follow-up details saved.");
    },
    onError: (error) => setNotice(error.message),
  });
  const retryAlert = trpc.adminBriefs.retryAlert.useMutation({
    onSuccess: (result) => {
      utils.adminBriefs.list.invalidate();
      setNotice(result.alertStatus === "sent" ? "Alert delivery retried and sent." : "Alert retry failed; the saved lead remains available for follow-up.");
    },
    onError: (error) => setNotice(error.message),
  });
  const enableQualifierFollowUps = trpc.adminBriefs.enableQualifierFollowUps.useMutation({
    onSuccess: () => { qualifierSchedule.refetch(); setNotice("Hourly qualifier follow-up has been enabled for the published site."); },
    onError: (error) => setNotice(error.message),
  });
  const exportScope = marketFilter === "all" ? undefined : { market: marketFilter };
  const exportCsv = trpc.adminBriefs.exportCsv.useQuery(exportScope, { enabled: false });
  const visibleBriefs = useMemo(
    () => briefs.data?.filter((item) =>
      (statusFilter === "all" || item.followUpStatus === statusFilter)
      && (marketFilter === "all" || item.market === marketFilter),
    ) ?? [],
    [briefs.data, statusFilter, marketFilter],
  );

  const saveFollowUp = (event: FormEvent<HTMLFormElement>, briefId: number) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    update.mutate({
      briefId,
      followUpStatus: String(data.get("followUpStatus")) as FollowUpStatus,
      ownerName: String(data.get("ownerName") || "").trim() || undefined,
      internalNote: String(data.get("internalNote") || "").trim() || undefined,
    });
  };

  const downloadCsv = async () => {
    setNotice("");
    const result = await exportCsv.refetch();
    if (!result.data) {
      setNotice("The export could not be prepared. Please try again.");
      return;
    }
    const blob = new Blob([result.data.content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.data.filename;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`${marketFilter === "all" ? "All-market" : `${marketFilter} market`} production-brief export downloaded.`);
  };

  if (!loading && user?.role !== "admin") {
    return <DashboardLayout><div className="admin-shell"><p className="portal-kicker">ALVORA / ADMIN</p><h1>Administrative access only.</h1><p className="admin-empty">This area is reserved for the Alvora team.</p></div></DashboardLayout>;
  }

  return <DashboardLayout><div className="admin-shell">
    <header className="admin-topline">
      <div><p className="portal-kicker">ALVORA / PRODUCTION BRIEFS</p><h1>Incoming makes</h1><p>Public manufacturing enquiries are stored before an alert email is attempted.</p></div>
      <div className="admin-brief-header-actions"><button className="admin-export-button" type="button" onClick={downloadCsv} disabled={exportCsv.isFetching}><Download size={15} /> {exportCsv.isFetching ? "Preparing…" : `Export ${marketFilter === "all" ? "CSV" : `${marketFilter} CSV`}`}</button><button className="admin-export-button" type="button" onClick={() => enableQualifierFollowUps.mutate()} disabled={enableQualifierFollowUps.isPending || Boolean(qualifierSchedule.data?.isEnabled)}><Timer size={15} /> {qualifierSchedule.data?.isEnabled ? "Hourly follow-up active" : enableQualifierFollowUps.isPending ? "Enabling…" : "Enable hourly follow-up"}</button><ClipboardList size={25} className="text-[#c9ff63]" /></div>
    </header>
    <p className="brief-export-note">Internal use only. The export includes buyer contact details, credit-qualification responses, market origin, and follow-up notes; store it only in Alvora-approved systems. Select a market before export when a regional team does not require the wider lead file.</p>
    <p className="brief-export-note">When a shortlist is sent, set the follow-up state to <strong>shortlist sent</strong>. This pauses the 24-hour qualifier email. Enable the hourly control only after this checkpoint is published; the schedule is managed from the project’s protected operations area.</p>
    <div className="brief-filter">
      <span>Show</span>
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | FollowUpStatus)}><option value="all">All follow-up states</option>{statusOptions.map((status) => <option value={status} key={status}>{status.replaceAll("_", " ")}</option>)}</select>
      <select aria-label="Filter by market" value={marketFilter} onChange={(event) => setMarketFilter(event.target.value as "all" | MarketCode)}><option value="all">All markets</option>{marketOptions.map((market) => <option value={market} key={market}>{market}</option>)}</select>
      <span>{visibleBriefs.length} shown</span>
    </div>
    {notice && <p className="admin-message">{notice}</p>}
    {briefs.isLoading ? <Loader2 className="animate-spin text-[#c9ff63]" /> : <div className="admin-brief-list">
      {visibleBriefs.map((item) => <article className="admin-brief" key={item.id}>
        <header><div><p className="admin-account-name">{item.company || item.contactName}</p><p>{item.contactName} · <a href={`mailto:${item.email}`}>{item.email}</a></p></div><div className="admin-brief-statuses"><span className="admin-status">market {item.market}</span><span className={`admin-status admin-status-${item.followUpStatus}`}>{item.followUpStatus.replaceAll("_", " ")}</span><span className={`admin-status admin-status-${item.alertStatus}`}>alert {item.alertStatus}</span></div></header>
        <p className="admin-bands">{item.requestType} · {item.yearsTrading} years trading · references {item.tradeReferencesAvailable}{item.referrerName ? ` · introduced by ${item.referrerName}` : ""}</p>
        <p className="admin-brief-body">{item.brief}</p>
        <form className="brief-triage-form" onSubmit={(event) => saveFollowUp(event, item.id)}>
          <label>Follow-up<select name="followUpStatus" defaultValue={item.followUpStatus}>{statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label>
          <label>Owner<input name="ownerName" defaultValue={item.ownerName || ""} placeholder="Initials or team member" /></label>
          <label className="brief-triage-note">Internal note<textarea name="internalNote" defaultValue={item.internalNote || ""} rows={2} placeholder="Next action, quote detail, or constraint" /></label>
          <button type="submit" disabled={update.isPending}>{update.isPending ? "Saving…" : <><Check size={14} /> Save triage</>}</button>
        </form>
        <footer><span>{item.preferredPaymentApproach}</span><span>Received {new Date(item.createdAt).toLocaleString()}</span>{item.lastActionAt && <span>Updated {new Date(item.lastActionAt).toLocaleString()}</span>}{item.alertError && <span className="admin-brief-error"><MailWarning size={14} /> {item.alertError}</span>}{item.alertStatus === "failed" && <button className="brief-retry-button" type="button" onClick={() => retryAlert.mutate({ briefId: item.id })} disabled={retryAlert.isPending}>{retryAlert.isPending ? <Loader2 size={13} className="animate-spin" /> : <RotateCw size={13} />} Retry internal alert</button>}</footer>
      </article>)}
      {visibleBriefs.length === 0 && <p className="admin-empty"><ClipboardList size={18} /> {briefs.data?.length ? "No briefs match the current market and follow-up filters." : "No public production briefs have been recorded."}</p>}
    </div>}
  </div></DashboardLayout>;
}

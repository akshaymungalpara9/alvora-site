import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Download, Loader2, MailCheck, Plus, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

const splitBands = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export default function AdminBuyers() {
  const { user, loading } = useAuth();
  const rollout = trpc.admin.rolloutStatus.useQuery();
  const accounts = trpc.admin.listBuyerAccounts.useQuery();
  const privateRequests = trpc.admin.privateRequests.useQuery();
  const utils = trpc.useUtils();
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [activityFor, setActivityFor] = useState<number | null>(null);
  const activity = trpc.admin.buyerActivity.useQuery({ buyerAccountId: activityFor ?? 0 }, { enabled: activityFor !== null });
  const create = trpc.admin.createBuyerAccount.useMutation({ onSuccess: () => { void utils.admin.listBuyerAccounts.invalidate(); setFormOpen(false); setMessage("Buyer account created as pending approval."); }, onError: (error) => setMessage(error.message) });
  const approve = trpc.admin.approveBuyerAccount.useMutation({ onSuccess: (result) => { void utils.admin.listBuyerAccounts.invalidate(); setActivityFor(result.buyer.id); setMessage(result.welcome.status === "sent" ? "Buyer approved, line sheet stored, and welcome kit sent." : "Buyer approved and line sheet stored, but the welcome email could not be sent. Check the account activity log."); }, onError: (error) => setMessage(error.message) });
  const generate = trpc.admin.generateLineSheet.useMutation({ onSuccess: (result) => { setMessage(`Line sheet generated and saved (${result.stoneCount} matching stones).`); window.open(result.lineSheet.storageUrl, "_blank", "noopener,noreferrer"); }, onError: (error) => setMessage(error.message) });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    create.mutate({ accountName: String(data.get("accountName")), contactName: String(data.get("contactName")), email: String(data.get("email")), shapes: splitBands(String(data.get("shapes"))), caratMin: Number(data.get("caratMin")), caratMax: Number(data.get("caratMax")), colors: splitBands(String(data.get("colors"))), clarities: splitBands(String(data.get("clarities"))) });
  };

  if (!loading && user?.role !== "admin") return <DashboardLayout><div className="admin-shell"><p className="portal-kicker">ALVORA / ADMIN</p><h1>Administrative access only.</h1><p className="admin-empty">This area is reserved for the Alvora team.</p></div></DashboardLayout>;

  return <DashboardLayout><div className="admin-shell">
    <header className="admin-topline"><div><p className="portal-kicker">ALVORA / ADMIN</p><h1>Approved buyers</h1><p>Create buyer bands, approve access, and produce the current private-list collateral.</p></div><button className="admin-primary" onClick={() => setFormOpen((open) => !open)}><Plus size={16} /> New buyer account</button></header>
    <p className="admin-early-access">Current production availability is live. Early access remains limited to selected buyers. {!rollout.data?.buyerActivationEnabled && <strong>Buyer approval and welcome-email delivery are locked.</strong>}</p>
    <p className="admin-data-note">The current catalog contains verified non-price specifications. Generated line sheets retain only permitted catalog fields and the buyer’s approved bands.</p>
    {message && <p className="admin-message">{message}</p>}
    {formOpen && <form className="buyer-form" onSubmit={submit}><label>Account name<input name="accountName" required placeholder="Atelier name" /></label><label>Buyer contact<input name="contactName" required placeholder="Full name" /></label><label>Work email<input name="email" type="email" required placeholder="buyer@atelier.com" /></label><div className="buyer-form-grid"><label>Shapes, comma-separated<input name="shapes" required defaultValue="ROUND,OVAL" /></label><label>Colours, comma-separated<input name="colors" required defaultValue="D,E,F,G" /></label><label>Minimum carat<input name="caratMin" type="number" min="0.01" step="0.01" required defaultValue="0.5" /></label><label>Maximum carat<input name="caratMax" type="number" min="0.01" step="0.01" required defaultValue="2" /></label><label>Clarities, comma-separated<input name="clarities" required defaultValue="VVS2,VS1,VS2" /></label></div>{create.error && <p className="request-error">{create.error.message}</p>}<button className="admin-primary" disabled={create.isPending}>{create.isPending ? "Creating…" : "Create pending account"}</button></form>}
    {accounts.isLoading ? <Loader2 className="animate-spin" /> : <div className="admin-account-list">{accounts.data?.map((account) => <article key={account.id} className="admin-account"><div><p className="admin-account-name">{account.accountName}</p><p>{account.contactName} · {account.email}</p><p className="admin-bands">{account.shapes.replaceAll(",", " / ")} · {account.caratMin}–{account.caratMax} ct · {account.colors.replaceAll(",", " / ")} · {account.clarities.replaceAll(",", " / ")}</p></div><div className="admin-actions"><span className={`admin-status admin-status-${account.status}`}>{account.status}</span>{account.status !== "approved" && <button onClick={() => approve.mutate({ buyerAccountId: account.id })} disabled={approve.isPending || !rollout.data?.buyerActivationEnabled} title={!rollout.data?.buyerActivationEnabled ? "Controlled early access is locked" : undefined}><ShieldCheck size={15} /> {rollout.data?.buyerActivationEnabled ? "Approve & send welcome" : "Approval locked"}</button>}<button onClick={() => generate.mutate({ buyerAccountId: account.id })} disabled={generate.isPending}><Download size={15} /> Generate line sheet</button><button onClick={() => setActivityFor(activityFor === account.id ? null : account.id)}>{activityFor === account.id ? "Hide activity" : "View activity"}</button></div></article>)}{accounts.data?.length === 0 && <p className="admin-empty"><MailCheck size={18} /> No buyer accounts yet. Create an account and set its production bands to begin.</p>}</div>}
    {activityFor && <section className="admin-activity"><p className="portal-kicker">BUYER ACCOUNT ACTIVITY</p>{activity.isLoading ? <Loader2 className="animate-spin" size={18} /> : <><p>{activity.data?.latestLineSheet ? <a href={activity.data.latestLineSheet.storageUrl} target="_blank" rel="noreferrer">Download the latest saved line sheet</a> : "No line sheet has been generated."}</p><div>{activity.data?.emailLogs.map((log) => <p key={log.id}><strong>{log.emailType.replaceAll("_", " ")}</strong> · {log.status} · {new Date(log.createdAt).toLocaleString()}{log.errorMessage ? ` · ${log.errorMessage}` : ""}</p>)}</div></>}</section>}
    <section className="admin-requests"><p className="portal-kicker">PRIVATE-LIST REQUESTS</p>{privateRequests.isLoading ? <Loader2 className="animate-spin" size={18} /> : privateRequests.data?.length ? <div>{privateRequests.data.map((request) => <p key={request.id}><strong>{request.buyerAccountName}</strong> · IGI {request.certificateNumber} · {request.requestIntent} · request {request.requestStatus} · alert {request.emailStatus}{request.emailError ? ` · ${request.emailError}` : ""}</p>)}</div> : <p>No private-list requests have been recorded.</p>}</section>
  </div></DashboardLayout>;
}

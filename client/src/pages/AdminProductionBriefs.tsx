import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { ClipboardList, Loader2, MailWarning } from "lucide-react";

export default function AdminProductionBriefs() {
  const { user, loading } = useAuth();
  const briefs = trpc.adminBriefs.list.useQuery();

  if (!loading && user?.role !== "admin") return <DashboardLayout><div className="admin-shell"><p className="portal-kicker">ALVORA / ADMIN</p><h1>Administrative access only.</h1><p className="admin-empty">This area is reserved for the Alvora team.</p></div></DashboardLayout>;

  return <DashboardLayout><div className="admin-shell"><header className="admin-topline"><div><p className="portal-kicker">ALVORA / PRODUCTION BRIEFS</p><h1>Incoming makes</h1><p>Public manufacturing enquiries are stored before an alert email is attempted.</p></div><ClipboardList size={25} className="text-[#c9ff63]" /></header>{briefs.isLoading ? <Loader2 className="animate-spin text-[#c9ff63]" /> : <div className="admin-brief-list">{briefs.data?.map((item) => <article className="admin-brief" key={item.id}><header><div><p className="admin-account-name">{item.company || item.contactName}</p><p>{item.contactName} · <a href={`mailto:${item.email}`}>{item.email}</a></p></div><span className={`admin-status admin-status-${item.alertStatus}`}>alert {item.alertStatus}</span></header><p className="admin-bands">{item.requestType} · {item.yearsTrading} years trading · references {item.tradeReferencesAvailable}</p><p className="admin-brief-body">{item.brief}</p><footer><span>{item.preferredPaymentApproach}</span><span>{new Date(item.createdAt).toLocaleString()}</span>{item.alertError && <span className="admin-brief-error"><MailWarning size={14} /> {item.alertError}</span>}</footer></article>)}{briefs.data?.length === 0 && <p className="admin-empty"><ClipboardList size={18} /> No public production briefs have been recorded.</p>}</div>}</div></DashboardLayout>;
}

import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Loader2, LockKeyhole, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";

type Stone = { id: number; stockNumber: string; reportNumber: string | null; shape: string; carat: number; color: string; clarity: string; cut: string | null; polish: string | null; price: number | null };

export default function BuyerAvailability() {
  const { isAuthenticated } = useAuth();
  const availability = trpc.buyer.myAvailability.useQuery(undefined, { enabled: isAuthenticated });
  const requestStone = trpc.buyer.requestStone.useMutation({ onSuccess: () => setSelectedStone(null) });
  const [selectedStone, setSelectedStone] = useState<Stone | null>(null);
  const [note, setNote] = useState("");

  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStone) return;
    requestStone.mutate({ stoneId: selectedStone.id, note: note.trim() || undefined });
  };

  if (isAuthenticated && availability.isLoading) return <main className="portal-shell portal-centre"><Loader2 className="animate-spin text-[#c9ff63]" size={26} /></main>;
  if (!isAuthenticated) return <main className="portal-shell portal-centre"><section className="portal-gate"><LockKeyhole size={22} /><p className="portal-kicker">ALVORA / PRIVATE AVAILABILITY</p><h1>Your production list is held privately.</h1><p>Sign in with the work email associated with your approved buyer account.</p><button className="portal-button" onClick={() => startLogin()}>Sign in to view availability</button><Link href="/" className="portal-back"><ArrowLeft size={15} /> Back to Alvora</Link></section></main>;

  const result = availability.data;
  if (!result || result.status !== "approved") return <main className="portal-shell portal-centre"><section className="portal-gate"><LockKeyhole size={22} /><p className="portal-kicker">ALVORA / PRIVATE AVAILABILITY</p><h1>This account is not yet approved.</h1><p>Use the work email supplied to Alvora, or contact the team for account approval.</p><Link href="/" className="portal-back"><ArrowLeft size={15} /> Back to Alvora</Link></section></main>;

  return <main className="portal-shell">
    <header className="portal-header"><Link href="/" className="portal-wordmark">ALVORA</Link><span>PRIVATE AVAILABILITY / {result.buyer.accountName.toUpperCase()}</span></header>
    <section className="portal-main">
      <div className="portal-intro"><p className="portal-kicker">APPROVED PRODUCTION BANDS</p><h1>Your current availability.</h1><p>{result.buyer.shapes.replaceAll(",", " / ")} · {result.buyer.caratMin}–{result.buyer.caratMax} ct · {result.buyer.colors.replaceAll(",", " / ")} · {result.buyer.clarities.replaceAll(",", " / ")}</p>{result.latestLineSheet && <a className="portal-download" href={result.latestLineSheet.storageUrl}><Download size={15} /> Download current line sheet</a>}</div>
      <div className="availability-summary"><span>{result.stones.length} matching stones</span><span>Request a stone to confirm the make and dispatch.</span></div>
      <div className="availability-table-wrap"><table className="availability-table"><thead><tr><th>Shape</th><th>Carat</th><th>Colour</th><th>Clarity</th><th>Cut</th><th>IGI cert #</th><th>Price</th><th /></tr></thead><tbody>{result.stones.map((stone) => <tr key={stone.id}><td>{stone.shape}</td><td>{stone.carat.toFixed(stone.carat % 1 === 0 ? 0 : 2)}</td><td>{stone.color}</td><td>{stone.clarity}</td><td>{stone.cut || stone.polish || "—"}</td><td>{stone.reportNumber || "Not listed"}</td><td>{stone.price === null ? "On request" : `$${stone.price.toLocaleString("en-US")}`}</td><td><button onClick={() => { setSelectedStone(stone); setNote(""); }}>Request this stone</button></td></tr>)}</tbody></table></div>
    </section>
    {selectedStone && <div className="request-modal-backdrop" role="presentation"><form className="request-modal" onSubmit={submitRequest}><button type="button" className="request-close" onClick={() => setSelectedStone(null)}>×</button><p className="portal-kicker">PLACE A REQUEST</p><h2>{selectedStone.shape} · {selectedStone.carat} ct · {selectedStone.color} · {selectedStone.clarity}</h2><p>IGI reference: <strong>{selectedStone.reportNumber || "Not listed"}</strong><br/>Account: <strong>{result.buyer.accountName}</strong></p><label>Dispatch or make note<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Any setting, dispatch, or timing detail for the Alvora team." rows={4} /></label>{requestStone.error && <p className="request-error">{requestStone.error.message}</p>}<button className="portal-button" disabled={requestStone.isPending}>{requestStone.isPending ? "Saving request…" : <><Send size={15} /> Confirm this request</>}</button><p className="request-note">Your request is recorded first. We will confirm the make within 24 hours.</p></form></div>}
  </main>;
}

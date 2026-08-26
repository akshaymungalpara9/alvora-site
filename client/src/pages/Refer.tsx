import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Refer() {
  const { user, loading } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const submit = trpc.introductions.submit.useMutation({ onSuccess: () => setSubmitted(true) });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitted(false);
    submit.mutate({
      jewellerName: String(form.get("jeweller_name") || "").trim(),
      company: String(form.get("company") || "").trim() || undefined,
      workEmail: String(form.get("work_email") || "").trim() || undefined,
      market: String(form.get("market") || "GLOBAL") as "GLOBAL" | "FR" | "IT" | "US" | "CA",
      note: String(form.get("note") || "").trim() || undefined,
    });
  };

  if (loading) return <main className="refer-page"><Loader2 className="animate-spin text-[#c9ff63]" /></main>;
  if (!user) return <main className="refer-page"><a className="brand" href="/"><img className="brand-mark" src="/manus-storage/alvora-faceted-a_2ef055e2.png" alt="" /><span className="brand-name">ALVORA</span></a><section><p className="eyebrow eyebrow-bright"><span />ALVORA / PRIVATE INTRODUCTION</p><h1>Introduce a jeweller.</h1><p>This private link is available to existing Alvora trade accounts.</p><button className="button button-signal" type="button" onClick={startLogin}>Sign in to continue <ArrowUpRight size={17} /></button></section></main>;

  return <main className="refer-page"><a className="brand" href="/"><img className="brand-mark" src="/manus-storage/alvora-faceted-a_2ef055e2.png" alt="" /><span className="brand-name">ALVORA</span></a><section><p className="eyebrow eyebrow-bright"><span />ALVORA / PRIVATE INTRODUCTION</p><h1>Introduce a jeweller.</h1><p>Send a considered introduction to a jeweller who may value a direct relationship with our benches. We will thank you personally after the first confirmed order.</p>{submitted ? <p className="refer-confirmation" role="status">Thank you. The introduction is recorded with the Alvora team.</p> : <form className="refer-form" onSubmit={onSubmit}><label><span>Jeweller name</span><input name="jeweller_name" minLength={2} maxLength={180} required autoComplete="name" /></label><label><span>Company / workshop</span><input name="company" maxLength={180} autoComplete="organization" /></label><label><span>Work email <em>(optional)</em></span><input name="work_email" type="email" maxLength={320} autoComplete="email" inputMode="email" autoCapitalize="none" /></label><label><span>Market</span><select name="market" defaultValue="GLOBAL"><option value="GLOBAL">Global</option><option value="FR">France</option><option value="IT">Italy</option><option value="US">United States</option><option value="CA">Canada</option></select></label><label><span>A short note <em>(optional)</em></span><textarea name="note" maxLength={2000} rows={4} placeholder="How you know them or what they may value in a production relationship." /></label><button className="button button-signal" type="submit" disabled={submit.isPending}>{submit.isPending ? "Recording…" : <>Send introduction <ArrowUpRight size={17} /></>}</button>{submit.error && <p className="form-confirmation form-confirmation-error" role="alert">{submit.error.message}</p>}</form>}</section></main>;
}

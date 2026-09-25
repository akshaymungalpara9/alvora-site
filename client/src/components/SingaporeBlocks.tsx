import { FormEvent, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { trackRfqSubmit } from "@/lib/ga4";

// ── 1. Certification and verification note ────────────────────────────────────

export function SgCertificationNote() {
  return (
    <div>
      <p className="eyebrow"><span />CERTIFICATION</p>
      <p>
        Every Alvora stone ships IGI laser-inscribed and verified against the IGI database before
        dispatch. The report number is inscribed on the girdle of the stone and is searchable on
        the IGI verification platform by any buyer in any market in real time, without contacting
        us.
      </p>
      <p style={{ marginTop: 16 }}>
        GIA certification is available as an alternative for buyers who require it; ask when
        placing your enquiry. Premium and repeat accounts can request an independent verification
        right before a parcel is released, including pre-dispatch inspection or third-party grading
        on reasonable notice.
      </p>
    </div>
  );
}

// ── 2. Landed-cost transparency ───────────────────────────────────────────────

export function SgLandedCostBlock() {
  return (
    <div>
      <p className="eyebrow"><span />SINGAPORE LANDED COST</p>
      <p>
        Singapore levies 9% GST calculated on CIF value plus duties and incidental charges. Loose
        diamonds are not a dutiable category under Singapore Customs, so the applicable rate is 0%
        customs duty plus 9% import GST. A GST-registered Singapore buyer can typically claim the
        import GST as input tax, reducing the effective landed cost to the stone price plus logistics
        and clearance fees in most circumstances. Confirm your buyer's GST registration status and
        the applicable HS classification with a Singapore customs broker before the first shipment.
      </p>
      <p style={{ marginTop: 16 }}>
        A Free Trade Zone or licensed Zero-GST warehouse can suspend GST while goods remain under
        the relevant scheme. GST becomes payable when goods are released for local circulation.
        This makes Singapore a practical logistics point for buyers consolidating stock for onward
        export, but it does not convert a domestic sale to a Singapore jeweller into a tax-free
        transaction.
      </p>

      <p className="eyebrow" style={{ marginTop: 40 }}><span />ILLUSTRATIVE PLANNING MODEL</p>
      <p style={{ fontSize: "0.82rem", color: "var(--paper-dim)", marginBottom: 18, lineHeight: 1.7 }}>
        The figures below are a planning model for a 100 ct parcel at an assumed invoice price of
        USD 500/ct, air freight, standard insurance, and mid-market exchange rates from 30 August
        2026. This is not a carrier quote or a live price. Replace all assumptions with actual
        forwarder quotes and confirmed exchange rates before pricing any transaction.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }} aria-label="Illustrative landed cost for a 100 ct parcel">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--rule)" }}>
            <th scope="col" style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400, color: "#71736e" }}>Item</th>
            <th scope="col" style={{ textAlign: "right", padding: "8px 0", fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400, color: "#71736e" }}>USD</th>
            <th scope="col" style={{ textAlign: "right", padding: "8px 0", fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400, color: "#71736e" }}>SGD (approx.)</th>
          </tr>
        </thead>
        <tbody>
          {([
            ["100 ct at USD 500/ct", "50,000", "63,693"],
            ["Air freight assumption", "250", "318"],
            ["Insurance assumption (0.15% of merchandise)", "75", "96"],
            ["CIF value", "50,325", "64,107"],
            ["Customs duty", "0", "0"],
            ["Clearance, permit, and handling assumption", "200", "255"],
            ["Import GST at 9% of CIF", "4,529", "5,768"],
            ["Cash landed outlay before recoverable GST", "55,104", "70,131"],
            ["Economic landed cost if GST is fully claimable", "50,575", "64,362"],
          ] as [string, string, string][]).map(([label, usd, sgd]) => (
            <tr key={label} style={{ borderBottom: "1px solid var(--rule)" }}>
              <td style={{ padding: "10px 0", lineHeight: 1.5 }}>{label}</td>
              <td style={{ textAlign: "right", fontFamily: "var(--mono)", padding: "10px 0 10px 24px", whiteSpace: "nowrap" }}>{usd}</td>
              <td style={{ textAlign: "right", fontFamily: "var(--mono)", padding: "10px 0 10px 24px", whiteSpace: "nowrap" }}>{sgd}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: "0.74rem", color: "#777a73", marginTop: 12, lineHeight: 1.65 }}>
        Exchange rate reference: XE 30 Aug 2026, 1 SGD = USD 0.7850. Confirm the applicable rate
        with your bank or forwarder on quote day. Confirm HS classification and whether incidental
        charges are included in the taxable import value with your Singapore customs broker.
      </p>
    </div>
  );
}

// ── 3. Payment terms ──────────────────────────────────────────────────────────

export function SgPaymentTermsBlock() {
  return (
    <div>
      <p className="eyebrow"><span />PAYMENT TERMS</p>
      <p>
        For a first cross-border order with a new supplier, the most straightforward structures
        are cash against documents (CAD) and letter of credit at sight (LC at sight). Both give
        the buyer documentary control before funds are released while giving the supplier confirmed
        payment before the parcel is delivered. After a buyer has verified the company and
        certificates on a first order, we offer 50% pre-dispatch with the balance due before
        dispatch of the confirmed parcel. For small trial orders from an established contact,
        telegraphic transfer in advance removes the documentary overhead and is the simplest route
        for parcels under a defined value threshold.
      </p>
      <p style={{ marginTop: 16 }}>
        Memo and consignment are not offered as a default. The stones are high-value and the
        dispute risk without a robust inspection protocol on both sides is significant. If a
        specific arrangement is required for your account structure, raise it in your enquiry and
        we will advise on what we can support.
      </p>
    </div>
  );
}

// ── 4. Reorder / replenishment workflow ───────────────────────────────────────

export function SgReplenishmentWorkflow() {
  return (
    <div>
      <p className="eyebrow"><span />REPLENISHMENT WORKFLOW</p>
      <p>
        For manufacturers and setting houses running a regular programme, the practical starting
        point is a weekly make list. Send us the list and we return a cut, size, and price matrix
        with matched parcels that fit your week's work. As the relationship develops, the parcel
        can be built to a standing specification and dispatched on a regular cadence without
        requiring a fresh brief each time.
      </p>
      <div className="about-process-list" style={{ marginTop: 28 }}>
        {([
          ["Make list", "Submit your weekly shape, size, and weight requirements. A spreadsheet or plain text list is sufficient."],
          ["Matrix return", "We return a price and availability matrix with matched parcels against each line."],
          ["Approval", "Confirm the parcel. We verify each stone against its certificate before packing."],
          ["Dispatch", "Parcel dispatches insured, with report files and a declared invoice per stone, ready for Singapore Customs permit and GST declaration."],
          ["Replenishment", "Approved specifications are held on file. Repeat orders follow the same cadence without re-briefing."],
        ] as [string, string][]).map(([title, desc]) => (
          <article key={title}>
            <div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ── 5. Trust panel ────────────────────────────────────────────────────────────

export function SgTrustPanel() {
  return (
    <div>
      <p className="eyebrow"><span />SUPPLY CREDENTIALS</p>
      <div className="specialty-feature-list" style={{ marginTop: 0 }}>
        {([
          [
            "Surat factory, direct",
            "We manufacture at our own benches in Surat. There is no wholesaler, broker, or intermediary in the supply chain between our production and your parcel.",
          ],
          [
            "IGI or GIA report per stone",
            "Every stone ships laser-inscribed and report-matched. Report numbers are searchable on the IGI or GIA verification platform by any buyer in any market in real time.",
          ],
          [
            "Video and image pack",
            "Each stone dispatched to a new account is accompanied by a video, proportions diagram, fluorescence grade, and still image set. For repeat accounts, the pack is available on request.",
          ],
          [
            "Insured shipping, declared invoice",
            "Parcels ship insured against declared value with a per-stone invoice reconciled to the certificate. All documentation is prepared for Singapore Customs permit and GST declaration.",
          ],
          [
            "Singapore-time response window",
            "We respond to enquiries and availability questions within the Singapore business day. WhatsApp is the fastest channel for urgent requirements.",
          ],
        ] as [string, string][]).map(([k, v]) => (
          <article key={k}>
            <span className="feat-mark">-</span>
            <div>
              <h3>{k}</h3>
              <p>{v}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ── 6. FAQ block ──────────────────────────────────────────────────────────────

export interface FaqItem {
  question: string;
  answer: string;
}

export function SgFaqBlock({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <p className="eyebrow"><span />FREQUENTLY ASKED QUESTIONS</p>
      <div style={{ borderTop: "1px solid var(--rule)" }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderBottom: "1px solid var(--rule)" }}>
            <button
              type="button"
              aria-expanded={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 20,
                width: "100%",
                padding: "20px 0",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                color: "inherit",
                fontSize: "0.9rem",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  color: "var(--signal)",
                  fontFamily: "var(--mono)",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  paddingTop: 2,
                }}
              >
                {openIndex === i ? "−" : "+"}
              </span>
            </button>
            {openIndex === i && (
              <div style={{ paddingBottom: 20 }}>
                <p style={{ margin: 0, fontSize: "0.86rem", lineHeight: 1.75, color: "var(--paper-dim)" }}>
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 7. Contact / enquiry block ────────────────────────────────────────────────

type SubmissionState = "idle" | "sending" | "sent" | "saved" | "error";

function SgFormConfirmation({ state, onReset }: { state: SubmissionState; onReset: () => void }) {
  if (state === "idle") return null;
  return (
    <p
      className={`form-confirmation form-confirmation-${state}`}
      role={state === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {state === "sending"
        ? "Recording your enquiry…"
        : state === "sent"
        ? "Thank you. Your enquiry has been recorded and sent to the Alvora team. We will respond within the Singapore business day."
        : state === "saved"
        ? "Thank you. Your enquiry has been safely recorded for the Alvora team. We will respond shortly."
        : (
          <>
            Your enquiry could not be recorded. Please try again, or{" "}
            <button className="inline-link" onClick={onReset} type="button">reset the form</button>.
          </>
        )}
    </p>
  );
}

export function SgContactBlock({ submitLabel = "Send Enquiry" }: { submitLabel?: string }) {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const submitBrief = trpc.productionBrief.submit.useMutation({
    onMutate: () => setSubmissionState("sending"),
    onSuccess: (result) => {
      setSubmissionState(result.alertStatus === "sent" ? "sent" : "saved");
      formRef.current?.reset();
    },
    onError: () => setSubmissionState("error"),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);

    const buyingFor = String(values.get("buying_for") || "Not specified");
    const requirement = String(values.get("requirement") || "").trim();
    const brief = [
      `Buying for: ${buyingFor}`,
      requirement ? `\nRequirement:\n${requirement}` : null,
    ].filter(Boolean).join("\n");

    setSubmissionState("idle");
    submitBrief.mutate({
      requestType: "Singapore supply enquiry",
      market: "GLOBAL",
      website: String(values.get("_website") || ""),
      contactName: String(values.get("name") || "").trim(),
      email: String(values.get("email") || "").trim(),
      company: String(values.get("company") || "").trim() || undefined,
      yearsTrading: (String(values.get("years_trading") || "2–5") as "Under 2" | "2–5" | "5–10" | "10+"),
      tradeReferencesAvailable: "Yes",
      preferredPaymentApproach: "Open to discussion",
      brief,
      leadType: "qualified_brief",
    });
    trackRfqSubmit("Singapore supply enquiry", "SG", "qualified_brief");
  };

  return (
    <div>
      <h2 className="rfq-form-heading">Send an Enquiry</h2>
      <form ref={formRef} className="brief-form" onSubmit={handleSubmit}>
        <div className="honeypot-field" aria-hidden="true">
          <label>
            Website
            <input name="_website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="rfq-row">
          <label>
            <span>Your name *</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              minLength={2}
              maxLength={180}
              required
              placeholder="Name"
            />
          </label>
          <label>
            <span>Work email *</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={320}
              required
              placeholder="name@company.com"
            />
          </label>
        </div>

        <div className="rfq-row">
          <label>
            <span>Company / workshop</span>
            <input
              name="company"
              type="text"
              autoComplete="organization"
              maxLength={180}
              placeholder="Company name"
            />
          </label>
          <label>
            <span>Years trading</span>
            <select name="years_trading" defaultValue="2–5">
              <option>Under 2</option>
              <option>2–5</option>
              <option>5–10</option>
              <option>10+</option>
            </select>
          </label>
        </div>

        <label>
          <span>Do you buy loose LGD for Singapore setting, or for onward export? *</span>
          <select name="buying_for" required defaultValue="">
            <option value="" disabled>Select one…</option>
            <option value="Singapore setting: retail or bespoke">Singapore setting: retail or bespoke</option>
            <option value="Singapore setting: manufacturing or trade">Singapore setting: manufacturing or trade</option>
            <option value="Onward export: regional distribution">Onward export: regional distribution</option>
            <option value="Both setting and export">Both setting and export</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </label>

        <label>
          <span>Requirement</span>
          <textarea
            name="requirement"
            maxLength={4500}
            rows={5}
            placeholder="Shape, carat weight, colour, clarity, quantity, certification, timeline, or describe the parcel."
          />
        </label>

        <div className="form-submit-row">
          <button
            className="button button-signal"
            type="submit"
            disabled={submitBrief.isPending}
          >
            {submitBrief.isPending
              ? "Sending enquiry…"
              : <>{submitLabel} <ArrowUpRight size={18} /></>}
          </button>
          <p>We respond within the Singapore business day.</p>
        </div>

        <SgFormConfirmation state={submissionState} onReset={() => setSubmissionState("idle")} />
      </form>
    </div>
  );
}

// ── 8. Product panel ──────────────────────────────────────────────────────────

type Programme = "calibrated" | "matched-pairs" | "custom-spec" | "all";

const PROGRAMME_DEFS = {
  calibrated: {
    title: "Calibrated Parcel Programme",
    href: "/singapore/calibrated-parcels",
    body: "Stones cut, polished, and measured to a fixed diameter tolerance, supplied as matched parcels by shape, grade, and cut quality. Suited to manufacturers and setting houses that need upstream consistency to reduce bench time and hand-sorting at the setter.",
  },
  "matched-pairs": {
    title: "Matched-Pair Programme",
    href: "/singapore/matched-pairs",
    body: "Pairs matched by colour, clarity, cut grade, and proportions for earrings, side-stone settings, and bespoke commissions. Available as a standing parcel for high-volume programmes or sourced stone by stone for individual design briefs.",
  },
  "custom-spec": {
    title: "Custom Specification Desk",
    baseHref: "/request-a-quote",
    body: "For shapes, dimensions, or cut-grade combinations that standard production does not supply. Send a specification and we return a cutting schedule and per-stone price. Suited to ateliers, private-label operations, and buyers with non-standard design briefs.",
  },
} as const;

export function SgProductPanel({ programme = "all", pageSlug }: { programme?: Programme; pageSlug?: string }) {
  const raqHref = pageSlug
    ? `/request-a-quote?utm_source=site&utm_medium=organic&utm_campaign=singapore&utm_content=${pageSlug}`
    : "/request-a-quote";

  const programmes = {
    calibrated: PROGRAMME_DEFS.calibrated,
    "matched-pairs": PROGRAMME_DEFS["matched-pairs"],
    "custom-spec": { ...PROGRAMME_DEFS["custom-spec"], href: raqHref },
  } as Record<string, { title: string; href: string; body: string }>;

  const entries: Array<[string, { title: string; href: string; body: string }]> =
    programme === "all"
      ? Object.entries(programmes)
      : [[programme, programmes[programme]]];

  return (
    <div className="specialty-feature-list">
      {entries.map(([key, prog]) => (
        <article key={key}>
          <span className="feat-mark">-</span>
          <div>
            <h3>
              <a href={prog.href} style={{ color: "inherit", textDecoration: "none" }}>
                {prog.title}
              </a>
            </h3>
            <p>{prog.body}</p>
            <a
              href={prog.href}
              className="inline-link"
              style={{ display: "inline-block", marginTop: 10 }}
            >
              Learn more <ArrowUpRight size={11} style={{ display: "inline", verticalAlign: "middle" }} />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

// ── 9. Sibling navigation ─────────────────────────────────────────────────────

export interface SiblingPage {
  label: string;
  href: string;
}

export function SgSiblingNav({ siblings }: { siblings: SiblingPage[] }) {
  return (
    <div>
      <p className="eyebrow"><span />ALSO IN THIS SECTION</p>
      <nav aria-label="Related Singapore pages" style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem 2.5rem", marginTop: 20 }}>
        <a href="/singapore" className="inline-link">
          Singapore supply hub <ArrowUpRight size={11} style={{ display: "inline", verticalAlign: "middle" }} />
        </a>
        {siblings.map(({ label, href }) => (
          <a key={href} href={href} className="inline-link">
            {label} <ArrowUpRight size={11} style={{ display: "inline", verticalAlign: "middle" }} />
          </a>
        ))}
      </nav>
    </div>
  );
}

import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";

interface LedgerData {
  generatedAt: string;
  generatedAtLabel: string;
  total: number;
  byLab: { IGI: number; GIA: number };
  withVideo: number;
  withEmbeddableVideo: number;
  byList: Record<string, number>;
}

async function fetchLedger(): Promise<LedgerData> {
  const res = await fetch("/api/stone/ledger");
  if (!res.ok) throw new Error(`fetch ledger failed (${res.status})`);
  return (await res.json()) as LedgerData;
}

function readHydratedLedger(): LedgerData | undefined {
  if (typeof document === "undefined") return undefined;
  const el = document.getElementById("stock-ledger-data");
  if (!el || !el.textContent) return undefined;
  try {
    return JSON.parse(el.textContent) as LedgerData;
  } catch {
    return undefined;
  }
}

function formatIndian(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  return n.toLocaleString("en-IN");
}

interface StockLedgerViewProps {
  data: LedgerData;
}

export function StockLedgerView({ data }: StockLedgerViewProps) {
  const listsCount = Object.keys(data.byList).length;
  const figures: Array<{ value: number; label: string }> = [
    { value: data.byLab.IGI, label: "IGI-certified" },
    { value: data.withVideo, label: "with 360 video" },
    { value: listsCount, label: "lists" },
    { value: data.byLab.GIA, label: "GIA-certified" },
  ];
  return (
    <>
      <section className="stock-ledger settle d2" aria-labelledby="stock-ledger-title">
        <div className="stock-ledger-grid">
          <div className="stock-ledger-heading">
            <h2 id="stock-ledger-title">Certified stones with passports</h2>
            <p className="stock-ledger-asof">As of {data.generatedAtLabel}</p>
          </div>
          <div className="stock-ledger-figs" role="list">
            {figures.map((f, i) => (
              <div
                key={f.label}
                role="listitem"
                className={`stock-ledger-fig${i > 0 ? " stock-ledger-fig-sep" : ""}`}
              >
                <span className="stock-ledger-fig-value num">{formatIndian(f.value)}</span>
                <span className="stock-ledger-fig-label">{f.label}</span>
              </div>
            ))}
          </div>
          <div className="stock-ledger-link">
            <a href="/availability">See what is available</a>
          </div>
        </div>
      </section>
      <p className="stock-ledger-footnote">
        Every stone above has its own page with the lab report and video. Prices are agreed on enquiry.
      </p>
    </>
  );
}

export default function StockLedger() {
  const initialData = useRef(readHydratedLedger()).current;
  const query = useQuery({
    queryKey: ["stone", "ledger"],
    queryFn: fetchLedger,
    initialData,
    retry: false,
    staleTime: 60 * 60_000,
  });

  if (!query.data) {
    return (
      <section className="stock-ledger stock-ledger-skeleton" aria-busy="true" aria-labelledby="stock-ledger-title">
        <div className="stock-ledger-grid">
          <div className="stock-ledger-heading">
            <h2 id="stock-ledger-title">Certified stones with passports</h2>
            <p className="stock-ledger-asof">Loading ledger&hellip;</p>
          </div>
        </div>
      </section>
    );
  }

  return <StockLedgerView data={query.data} />;
}

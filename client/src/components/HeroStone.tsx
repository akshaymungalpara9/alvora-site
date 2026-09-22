import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface HeroStoneRecord {
  report: string;
  lab: "IGI" | "GIA";
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut: string | null;
  polish: string;
  symmetry: string;
  measurements: string;
  stock: string;
  certUrl: string;
  videoUrl: string | null;
  videoHost: string | null;
  videoEmbeddable: boolean;
  lists: string[];
  band: "yellow" | "green" | "pink" | "blue";
  listedOn: string;
  dateLabel: string;
}

const STONE_PASSPORT_INDEXABLE = false;

function readHydratedRecord(): HeroStoneRecord | undefined {
  if (typeof document === "undefined") return undefined;
  const el = document.getElementById("hero-stone");
  if (!el || !el.textContent) return undefined;
  try {
    return JSON.parse(el.textContent) as HeroStoneRecord;
  } catch {
    return undefined;
  }
}

async function fetchToday(): Promise<HeroStoneRecord> {
  const res = await fetch("/api/stone/today");
  if (!res.ok) throw new Error(`fetch today failed (${res.status})`);
  return (await res.json()) as HeroStoneRecord;
}

async function fetchAnother(exclude: string): Promise<HeroStoneRecord> {
  const res = await fetch(`/api/stone/another?exclude=${encodeURIComponent(exclude)}`);
  if (!res.ok) throw new Error(`fetch another failed (${res.status})`);
  return (await res.json()) as HeroStoneRecord;
}

function formatWeight(w: number): string {
  return Number.isFinite(w) ? w.toFixed(2) : String(w);
}

function specLine(record: HeroStoneRecord): string {
  return `${formatWeight(record.weight)} ct ${record.shape} ${record.color} ${record.clarity}`;
}

interface HeroStoneViewProps {
  record: HeroStoneRecord;
  onAnother?: () => void;
  isSwapping?: boolean;
  openBrief?: () => void;
  leadTimes?: { stockShort: string; custom: string };
}

export function HeroStoneView({ record, onAnother, isSwapping, openBrief, leadTimes }: HeroStoneViewProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [renderIframe, setRenderIframe] = useState(false);
  useEffect(() => {
    setIframeLoaded(false);
  }, [record.videoUrl]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void }).requestIdleCallback;
    if (typeof idle === "function") {
      const id = idle(() => setRenderIframe(true), { timeout: 2000 });
      return () => (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setRenderIframe(true), 350);
    return () => window.clearTimeout(id);
  }, []);

  const stockShort = leadTimes?.stockShort ?? "1 to 5 working days";
  const custom = leadTimes?.custom ?? "5 to 10 working days";
  const passportHref = `/stone/${record.report}`;
  const rel = STONE_PASSPORT_INDEXABLE ? undefined : "nofollow";

  return (
    <section className="hero-stone" aria-labelledby="hero-stone-title">
      <div className="hero-stone-grid">
        <div className="hero-stone-left settle d1" aria-busy={isSwapping ? "true" : undefined}>
          <div className="tray hero-stone-tray">
            {record.videoEmbeddable && record.videoUrl && renderIframe ? (
              <iframe
                className={iframeLoaded ? "loaded" : ""}
                src={record.videoUrl}
                title={`360 video of ${record.lab} ${record.report}`}
                loading="lazy"
                allow="autoplay; fullscreen"
                referrerPolicy="no-referrer"
                onLoad={() => setIframeLoaded(true)}
              />
            ) : record.videoEmbeddable && record.videoUrl ? (
              <div className="tray-placeholder">
                <span>
                  {record.lab} {record.report}
                </span>
              </div>
            ) : (
              <div className="tray-placeholder">
                <span>
                  {record.lab} {record.report}
                </span>
                {record.videoUrl ? (
                  <a href={record.videoUrl} target="_blank" rel="noopener">
                    Open 360 video
                  </a>
                ) : null}
              </div>
            )}
          </div>
          <p className="hero-stone-caption settle d2">
            <a href={passportHref} rel={rel}>
              {record.lab} {record.report}
            </a>
            {` · ${specLine(record)} · today's stone, ${record.dateLabel}`}
          </p>
        </div>
        <div className="hero-stone-right">
          <h1 id="hero-stone-title" className="hero-stone-h1 settle">
            Lab-grown diamonds, cut in Surat, certified by IGI.
          </h1>
          <p className="hero-stone-body settle d1">
            {`Standard specifications ship in ${stockShort} from stock or our matched network. Anything outside standard is cut to your brief at our benches in ${custom}.`}
          </p>
          <div className="hero-stone-actions settle d3">
            <a className="hero-stone-button" href="/availability">
              See what is available
            </a>
            <a
              className="hero-stone-button"
              href="#production-brief"
              onClick={(event) => {
                if (openBrief) {
                  event.preventDefault();
                  openBrief();
                }
              }}
            >
              Send a production brief
            </a>
          </div>
          {onAnother ? (
            <button type="button" className="hero-stone-another" onClick={onAnother} disabled={isSwapping}>
              Show me another stone
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

interface HeroStoneProps {
  openBrief?: () => void;
  leadTimes?: { stockShort: string; custom: string };
}

export default function HeroStone({ openBrief, leadTimes }: HeroStoneProps) {
  const queryClient = useQueryClient();
  const initialData = useRef(readHydratedRecord()).current;

  const query = useQuery({
    queryKey: ["stone", "today"],
    queryFn: fetchToday,
    initialData,
    staleTime: 60 * 60_000,
    retry: false,
  });

  const [swapping, setSwapping] = useState(false);

  const onAnother = async () => {
    const current = queryClient.getQueryData<HeroStoneRecord>(["stone", "today"]);
    if (!current) return;
    setSwapping(true);
    try {
      const next = await fetchAnother(current.report);
      queryClient.setQueryData(["stone", "today"], next);
    } catch {
      /* leave current on failure */
    } finally {
      setSwapping(false);
    }
  };

  if (!query.data) {
    return (
      <section className="hero-stone" aria-busy="true" aria-labelledby="hero-stone-title">
        <div className="hero-stone-grid">
          <div className="hero-stone-left">
            <div className="tray hero-stone-tray hero-stone-tray-placeholder" />
          </div>
          <div className="hero-stone-right">
            <h1 id="hero-stone-title" className="hero-stone-h1">
              Lab-grown diamonds, cut in Surat, certified by IGI.
            </h1>
            <p className="hero-stone-body">
              {`Standard specifications ship in ${leadTimes?.stockShort ?? "1 to 5 working days"} from stock or our matched network. Anything outside standard is cut to your brief at our benches in ${leadTimes?.custom ?? "5 to 10 working days"}.`}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <HeroStoneView record={query.data} onAnother={onAnother} isSwapping={swapping} openBrief={openBrief} leadTimes={leadTimes} />;
}

import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { COMPANY } from "@shared/companyInfo";
import { LIST_LABELS } from "@shared/stoneLists";
import NotFound from "./NotFound";
import "./stone-passport.css";

export interface StoneRecord {
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
  depthPct?: number | null;
  tablePct?: number | null;
  ratio?: number | null;
  crownAngle?: number | null;
  pavilionAngle?: number | null;
  girdlePct?: string | number | null;
  fluorescence?: string | null;
}

interface StonePassportProps {
  report: string;
}

const PLEX_FONT_HREF =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap";

function ensurePlexFonts() {
  if (typeof document === "undefined") return;
  if (document.querySelector("link[data-plex]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = PLEX_FONT_HREF;
  link.setAttribute("data-plex", "true");
  document.head.appendChild(link);
}

class NotFoundError extends Error {
  status = 404;
  constructor() {
    super("not_found");
  }
}

async function fetchStone(report: string): Promise<StoneRecord> {
  const res = await fetch(`/api/stone/${report}`);
  if (res.status === 404) throw new NotFoundError();
  if (!res.ok) throw new Error(`fetch failed (${res.status})`);
  return (await res.json()) as StoneRecord;
}

function formatWeight(w: number): string {
  return Number.isFinite(w) ? w.toFixed(2) : String(w);
}

function specLine(record: StoneRecord): string {
  return [`${formatWeight(record.weight)} ct`, record.shape, record.color, record.clarity]
    .filter(Boolean)
    .join(" ");
}

function contactSentence(record: StoneRecord): string {
  return `Alvora, ${record.lab} ${record.report}, ${specLine(record)}. Please confirm availability and terms.`;
}

function whatsappHref(record: StoneRecord): string {
  return `https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent(contactSentence(record))}`;
}

function emailHref(record: StoneRecord): string {
  const subject = `${record.lab} ${record.report} · ${specLine(record)}`;
  const body = contactSentence(record);
  return `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function labDomain(lab: "IGI" | "GIA"): string {
  return lab === "GIA" ? "gia.edu" : "igi.org";
}

function measurementsWithMultiplyChar(m: string): string {
  return m.replace(/ x /g, " × ");
}

function provenanceLine(record: StoneRecord): string {
  const names = record.lists.map((k) => LIST_LABELS[k] ?? k);
  let listText: string;
  if (names.length === 0) listText = "current lists";
  else if (names.length === 1) listText = names[0];
  else if (names.length === 2) listText = `${names[0]} and ${names[1]}`;
  else listText = `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  const date = format(new Date(record.listedOn), "d MMMM yyyy");
  return `Listed in ${listText}, ${date}.`;
}

function hasAnyTechnicalField(record: StoneRecord): boolean {
  return Boolean(
    record.depthPct != null ||
      record.tablePct != null ||
      record.ratio != null ||
      record.crownAngle != null ||
      record.pavilionAngle != null ||
      (record.girdlePct != null && record.girdlePct !== "") ||
      (record.fluorescence != null && record.fluorescence !== "")
  );
}

interface ViewProps {
  record: StoneRecord;
  /**
   * When true, the primary verification link renders in its post-click "done"
   * state. Used by render tests to inspect the verified visual without
   * simulating a click. Not part of the public API.
   */
  defaultVerified?: boolean;
}

export function StonePassportView({ record, defaultVerified }: ViewProps) {
  const [copied, setCopied] = useState(false);
  const [verified, setVerified] = useState(Boolean(defaultVerified));
  const [shareAvailable, setShareAvailable] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const h1Ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    ensurePlexFonts();
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setShareAvailable(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mm = window.matchMedia("(max-width: 900px)");
    setIsMobile(mm.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mm.addEventListener("change", handler);
    return () => mm.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const target = h1Ref.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const onCopy = async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) return;
      await navigator.clipboard.writeText(record.report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* keep "Copy" label if the clipboard API is unavailable or rejects */
    }
  };

  const onShare = async () => {
    try {
      if (typeof navigator === "undefined" || typeof navigator.share !== "function") return;
      await navigator.share({ title: `${record.lab} ${record.report}`, url: window.location.href });
    } catch {
      /* user cancellation or unsupported context is not an error */
    }
  };

  const specText = specLine(record);
  const measurements = measurementsWithMultiplyChar(record.measurements);
  const domain = labDomain(record.lab);
  const showShare = shareAvailable && isMobile;

  return (
    <>
      <div
        className={`passport-stickybar${stickyVisible ? " visible" : ""}`}
        aria-hidden={!stickyVisible}
      >
        <span>
          {record.lab} {record.report} · {specText}
        </span>
        <a className="verify-link" href={record.certUrl} target="_blank" rel="noopener">
          Open {record.lab} report
        </a>
      </div>
      <main className="passport" aria-labelledby="passport-h1">
        <h1 className="passport-h1" id="passport-h1" ref={h1Ref}>
          <span>
            {record.lab} {record.report}
          </span>
          <button
            type="button"
            className="h1-copy"
            aria-label={`Copy report number ${record.report}`}
            onClick={onCopy}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </h1>
        <p className="spec-line settle">{specText}</p>

        <div className="grid">
          <section className="left settle d1">
            <div className="tray">
              {record.videoEmbeddable && record.videoUrl ? (
                <iframe
                  className={iframeLoaded ? "loaded" : ""}
                  src={record.videoUrl}
                  title={`360 video of ${record.lab} ${record.report}`}
                  loading="lazy"
                  allow="autoplay; fullscreen"
                  referrerPolicy="no-referrer"
                  onLoad={() => setIframeLoaded(true)}
                />
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
          </section>

          <section className="right settle d2">
            <table className="spec">
              <tbody>
                <tr>
                  <th scope="row">Shape</th>
                  <td>{record.shape}</td>
                </tr>
                <tr>
                  <th scope="row">Weight (ct)</th>
                  <td className="num">{formatWeight(record.weight)}</td>
                </tr>
                <tr>
                  <th scope="row">Colour</th>
                  <td>{record.color}</td>
                </tr>
                <tr>
                  <th scope="row">Clarity</th>
                  <td>{record.clarity}</td>
                </tr>
                {record.cut ? (
                  <tr>
                    <th scope="row">Cut</th>
                    <td>{record.cut}</td>
                  </tr>
                ) : null}
                <tr>
                  <th scope="row">Polish</th>
                  <td>{record.polish}</td>
                </tr>
                <tr>
                  <th scope="row">Symmetry</th>
                  <td>{record.symmetry}</td>
                </tr>
                <tr>
                  <th scope="row">Measurements (mm)</th>
                  <td className="num">{measurements}</td>
                </tr>
                <tr>
                  <th scope="row">Lab</th>
                  <td>{record.lab}</td>
                </tr>
                <tr>
                  <th scope="row">Report</th>
                  <td className="num">{record.report}</td>
                </tr>
                <tr>
                  <th scope="row">Stock ref</th>
                  <td>{record.stock}</td>
                </tr>
              </tbody>
            </table>

            <p className={`verify${verified ? " done" : ""}`}>
              <a
                href={record.certUrl}
                target="_blank"
                rel="noopener"
                className={verified ? "done" : ""}
                onClick={() => setVerified(true)}
              >
                Open {record.lab} report {record.report}
              </a>
              <span className="opened">Opened on {domain}</span>
            </p>
            <p className="verify-caption">
              The report opens on {record.lab}'s own server. We do not host or alter certificates.
            </p>

            {hasAnyTechnicalField(record) ? (
              <details className="details">
                <summary>View full details</summary>
                <dl>
                  {record.depthPct != null ? (
                    <>
                      <dt>Depth</dt>
                      <dd>{formatPercent(record.depthPct)}</dd>
                    </>
                  ) : null}
                  {record.tablePct != null ? (
                    <>
                      <dt>Table</dt>
                      <dd>{formatPercent(record.tablePct)}</dd>
                    </>
                  ) : null}
                  {record.ratio != null ? (
                    <>
                      <dt>Ratio</dt>
                      <dd>{record.ratio.toFixed(2)}</dd>
                    </>
                  ) : null}
                  {record.crownAngle != null ? (
                    <>
                      <dt>Crown angle</dt>
                      <dd>{record.crownAngle.toFixed(1)}°</dd>
                    </>
                  ) : null}
                  {record.pavilionAngle != null ? (
                    <>
                      <dt>Pavilion angle</dt>
                      <dd>{record.pavilionAngle.toFixed(1)}°</dd>
                    </>
                  ) : null}
                  {record.girdlePct != null && record.girdlePct !== "" ? (
                    <>
                      <dt>Girdle</dt>
                      <dd>{String(record.girdlePct)}</dd>
                    </>
                  ) : null}
                  {record.fluorescence != null && record.fluorescence !== "" ? (
                    <>
                      <dt>Fluorescence</dt>
                      <dd>{record.fluorescence}</dd>
                    </>
                  ) : null}
                </dl>
              </details>
            ) : null}

            <p className="provenance">{provenanceLine(record)}</p>

            {showShare ? (
              <button type="button" className="share-button available" onClick={onShare}>
                Share
              </button>
            ) : null}

            <div className="actions">
              <a href={whatsappHref(record)} target="_blank" rel="noopener">
                WhatsApp about this stone
              </a>
              <a href={emailHref(record)}>Email about this stone</a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function formatPercent(v: number): string {
  return `${v.toFixed(1)}%`;
}

function PassportSkeleton({ report }: { report: string }) {
  return (
    <main className="passport passport-skeleton" aria-busy="true">
      <h1 className="passport-h1">
        <span>IGI {report}</span>
      </h1>
      <div className="sk-line" />
      <div className="sk-line" />
      <div className="sk-line" style={{ width: "40%" }} />
      <div className="grid">
        <div className="left">
          <div className="sk-tray" />
        </div>
        <div className="right">
          <div className="sk-row" />
          <div className="sk-row" />
          <div className="sk-row" />
          <div className="sk-row" />
          <div className="sk-row" />
          <div className="sk-row" />
          <div className="sk-row" />
          <div className="sk-row" />
          <div className="sk-row" />
          <div className="sk-row" />
          <div className="sk-row" />
        </div>
      </div>
    </main>
  );
}

function PassportNotFound({ report }: { report: string }) {
  return (
    <>
      <NotFound />
      <p className="passport-notfound-note">
        No certified stone with report {report} is in the current lists.
      </p>
    </>
  );
}

function PassportFallback({ report }: { report: string }) {
  const fallbackCertUrl = `https://api.igi.org/viewpdf.php?r=${report}`;
  return (
    <main className="passport">
      <h1 className="passport-h1">
        <span>IGI {report}</span>
      </h1>
      <p className="spec-line">
        The catalogue is unavailable for a moment. The report number above still opens on IGI.
      </p>
      <p className="verify">
        <a href={fallbackCertUrl} target="_blank" rel="noopener">
          Open IGI report {report}
        </a>
      </p>
    </main>
  );
}

export default function StonePassport({ report }: StonePassportProps) {
  const query = useQuery({
    queryKey: ["stone", report],
    queryFn: () => fetchStone(report),
    retry: false,
    staleTime: 5 * 60_000,
  });

  if (query.isLoading) return <PassportSkeleton report={report} />;
  const errorStatus = query.error instanceof NotFoundError ? 404 : null;
  if (errorStatus === 404) return <PassportNotFound report={report} />;
  if (query.error) return <PassportFallback report={report} />;
  if (!query.data) return <PassportSkeleton report={report} />;
  return <StonePassportView record={query.data} />;
}

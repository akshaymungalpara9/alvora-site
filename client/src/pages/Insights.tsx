import { MoveLeft } from "lucide-react";
import { useEffect } from "react";
import { applyDocumentMetadata, publicSocialImage } from "@/lib/publicSeo";

export default function Insights({ articleSlug }: { articleSlug?: string }) {
  const path = articleSlug ? `/insights/${articleSlug}` : "/insights";
  const title = "Alvora Trade Insights — In preparation";
  const description = "Alvora is preparing concise manufacturing notes for trade buyers. Current production availability remains available to browse now.";
  useEffect(() => {
    applyDocumentMetadata({ lang: "en", path, title, description, robots: "noindex,follow,max-image-preview:large" });
  }, [description, path, title]);

  return <main className="insight-page"><header className="insight-header"><a className="brand" href="/"><img className="brand-mark" src="/manus-storage/alvora-faceted-a_2ef055e2.png" alt="" /><span className="brand-name">ALVORA</span></a><a className="insight-back" href="/"><MoveLeft size={15} /> Alvora home</a></header><section className="insight-intro"><p className="eyebrow eyebrow-bright"><span />ALVORA / TRADE INSIGHTS</p><h1>Manufacturing notes are in preparation.</h1><p>Alvora is preparing concise production notes for trade buyers. In the meantime, current production availability, certificate links where supplied, and production briefs remain available.</p><a className="text-link" href="/availability">View current availability</a></section></main>;
}

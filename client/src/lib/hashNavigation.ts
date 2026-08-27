import { useEffect } from "react";

function targetFor(hash: string) {
  if (!hash.startsWith("#") || hash.length < 2) return null;
  return document.getElementById(decodeURIComponent(hash.slice(1)));
}

export function scrollToPublicAnchor(hash: string, behavior: ScrollBehavior = "smooth") {
  const target = targetFor(hash);
  if (!target) return false;
  const header = document.querySelector<HTMLElement>(".site-header");
  const offset = (header?.offsetHeight ?? 0) + 18;
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
  window.scrollTo({ top, behavior });
  return true;
}

export function navigateToPublicAnchor(hash: string) {
  if (!scrollToPublicAnchor(hash)) return false;
  window.history.pushState(null, "", hash);
  return true;
}

export function usePublicHashNavigation() {
  useEffect(() => {
    const settleTimers: number[] = [];
    const restore = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const align = () => window.requestAnimationFrame(() => scrollToPublicAnchor(hash, "auto"));
      align();
      [160, 480, 960].forEach((delay) => settleTimers.push(window.setTimeout(align, delay)));
    };

    restore();
    window.addEventListener("hashchange", restore);
    window.addEventListener("load", restore);
    return () => {
      window.removeEventListener("hashchange", restore);
      window.removeEventListener("load", restore);
      settleTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);
}

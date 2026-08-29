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

  // Use scrollIntoView so the scroll works regardless of which element is the
  // actual scroll container (window or an inner node). Setting scroll-margin-top
  // on the target before the call makes the browser account for the header
  // clearance; the value is captured synchronously at call time so we can
  // restore it immediately without affecting the ongoing animation.
  const prev = target.style.scrollMarginTop;
  target.style.scrollMarginTop = `${offset}px`;
  target.scrollIntoView({ behavior, block: "start" });
  target.style.scrollMarginTop = prev;
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

# Phase 0 State Audit — Alvora Website

**Audited:** 2026-09-03  
**Stack:** Vite 7 + React 19, Express, tRPC, Drizzle, pnpm, Railway  
**Repo:** `/Users/akshaymungalpara/Claude/Projects/LBG/website`  
**Branch:** `main` @ `e7d8e7c`

---

## 1. `server/seoInjection.ts` — routes and remaining TODOs

### Routes with injected `<head>` tags

`resolveRouteMeta()` has an explicit `case` for every route listed below. All inject title, description, canonical, robots, Open Graph, Twitter Card, Org/LocalBusiness JSON-LD, and (where set) a service/article/FAQ JSON-LD block.

| Route | JSON-LD type(s) | robots directive |
|---|---|---|
| `/` | FAQPage (7 questions) | index,follow |
| `/fr` | — | index,follow |
| `/it` | — | index,follow |
| `/us` | — | index,follow |
| `/availability` | — | index,follow |
| `/fr/availability` | — | index,follow |
| `/it/availability` | — | index,follow |
| `/buyer-availability` | — | **noindex,nofollow** |
| `/insights` | ItemList (5 items) | index,follow |
| `/refer` | — | **noindex,nofollow** |
| `/privacy` | — | **noindex,follow** |
| `/terms` | — | **noindex,follow** |
| `/calibrated-diamond-layouts` | Service | index,follow |
| `/matched-lab-grown-diamond-pairs` | Service | index,follow |
| `/custom-cut-lab-grown-diamonds` | Service | index,follow |
| `/igi-certified-lab-grown-diamonds` | Product | index,follow |
| `/cvd-lab-grown-diamonds` | Product | index,follow |
| `/hpht-lab-grown-diamonds` | AboutPage | index,follow |
| `/fancy-shape-colour-lab-grown-diamonds` | Service | index,follow |
| `/precision-lab-grown-diamond-wholesale` | ContactPage | index,follow |
| `/matched-pair-diamonds` | Service | index,follow |
| `/custom-cut-diamonds` | Service | index,follow |
| `/melee-diamonds` | Service | index,follow |
| `/certifications` | Service | index,follow |
| `/about` | Organization | index,follow |
| `/for-jewelry-brands` | Service | index,follow |
| `/request-a-quote` | Service | index,follow |
| `/insights/are-lab-grown-diamonds-real-diamonds` | Article + FAQPage | index,follow |
| `/insights/best-lab-grown-diamond-manufacturer-for-your-need` | Article + FAQPage | index,follow |
| `/insights/is-a-lab-grown-diamond-worth-it` | Article + FAQPage | index,follow |
| `/insights/lab-grown-diamond-price-per-carat` | Article + FAQPage (2 Qs) | index,follow |
| `/insights/lab-grown-diamond-wholesale-how-to-buy` | Article + FAQPage | index,follow |
| `/insights/largest-lab-grown-diamond-manufacturers-india` | Article + FAQPage (3 Qs) | index,follow |
| `/insights/12-questions-to-ask-a-manufacturer` | Article | index,follow |
| `/insights/calibrated-diamond-layouts-explained` | Article | index,follow |
| `/insights/cvd-vs-hpht-lab-grown-diamonds` | Article | index,follow |
| `/insights/matched-pairs-vs-melee-vs-layouts` | Article | index,follow |
| `/insights/sourcing-lab-grown-diamonds-from-surat` | Article | index,follow |
| `/insights/*` (catch-all `default`) | — | index,follow |

**Total explicit cases: 37** (plus the catch-all `default` for unknown `/insights/*` slugs). Routes not listed (admin, `/api/`, etc.) return `null` and receive no injection.

### Remaining `TODO(alvora)` placeholders in `seoInjection.ts`

All four are inside `buildOrgJsonLd()`, which is emitted on **every** injected route as the `LocalBusiness` structured-data block:

| Line | Field | Current value |
|---|---|---|
| 34 | `address.streetAddress` | `"TODO(alvora): street address"` |
| 37 | `address.postalCode` | `"TODO(alvora): postal code"` |
| 40 | `telephone` | `"TODO(alvora): +91-XXX-XXX-XXXX"` |
| 41 | `email` | `"TODO(alvora): contact@alvoradiamonds.com"` |

These four are the only TODOs in this file. No GST, IEC, founder, capacity, or other business facts are attempted here.

---

## 2. `scripts/prerender.mjs` — behaviour

### Route source
Routes are read from `scripts/publicRoutes.json` at runtime (`fs.readFileSync`). This is the **single source of truth** shared with `server/publicSeoRoutes.ts`. The current JSON contains **33 routes**.

### Chromium discovery (priority order)
1. `process.env.CHROMIUM_PATH` (env override)
2. `/usr/bin/chromium`
3. `/usr/bin/chromium-browser`
4. `/snap/bin/chromium`
5. macOS Playwright cache (`~/Library/Caches/ms-playwright`) — scans all version directories for four sub-paths each:
   - `chrome-headless-shell-mac-arm64/chrome-headless-shell`
   - `chrome-headless-shell-mac-x64/chrome-headless-shell`
   - `chrome-mac-arm64/Google Chrome for Testing.app/…/Google Chrome for Testing`
   - `chrome-mac-x64/Google Chrome for Testing.app/…/Google Chrome for Testing`

If no executable is found the script **exits 0** (non-blocking) with a warning. This means a missing Chromium never breaks the Railway build; routes fall back to the SEO-injected HTML shell.

### Output
- Spins up an Express static server over `dist/public/` on port 4173.
- For each route: navigates Playwright, waits for `#root` to have children, extracts `#root.innerHTML`.
- Writes each snapshot to `dist/prerendered/<key>.html` (e.g. `index.html`, `fr.html`, `insights-are-lab-grown-diamonds-real-diamonds.html`).
- Writes `dist/prerendered/manifest.json` mapping route → filename.
- Express server and browser are closed after all routes are processed.

### Last local build result
All **33/33 routes snapshotted** successfully. (See §6 for build noise detail.)

---

## 3. `server/publicSeoRoutes.ts` — sitemap and robots

### Dynamic serving
Both files are served by Express routes registered in `registerPublicSeoRoutes()`:

```
GET /robots.txt   → renderRobots(origin)   Cache-Control: public, max-age=3600
GET /sitemap.xml  → renderSitemap(origin)  Cache-Control: public, max-age=3600
```

Content is generated fresh per request (not static files), with the origin resolved at request time.

### `CANONICAL_ORIGIN` usage

`getPublicOrigin(request)`:
- If `CANONICAL_ORIGIN` is set → strips trailing slash and returns it verbatim, ignoring the request host.
- Otherwise → falls back to `x-forwarded-proto` + `request.get("host")` (Railway preview host).

`renderRobots(origin)`:
- Uses `process.env.CANONICAL_ORIGIN` **directly** (not via `getPublicOrigin`) for the `Sitemap:` line, so robots.txt always points to the canonical domain even if the request came in on a Railway preview URL.

Both `<link rel="canonical">` and `<xhtml:link rel="alternate" hreflang="…">` in the sitemap, and `og:url` / Twitter tags in `seoInjection.ts`, all use the origin resolved by `getPublicOrigin`.

### Sitemap URLs emitted (all 33)

The sitemap emits every route in `publicRoutes.json`. The first four home-locale routes also carry `<xhtml:link rel="alternate" hreflang="…">` for `en`, `fr`, `it`, `en-US`, and `x-default`.

```
/                                                     priority 1.0  weekly
/fr                                                   priority 0.9  weekly
/it                                                   priority 0.9  weekly
/us                                                   priority 0.9  weekly
/calibrated-diamond-layouts                           priority 0.8  monthly
/matched-pair-diamonds                                priority 0.8  monthly
/custom-cut-diamonds                                  priority 0.8  monthly
/melee-diamonds                                       priority 0.8  monthly
/certifications                                       priority 0.7  monthly
/about                                                priority 0.7  monthly
/for-jewelry-brands                                   priority 0.8  monthly
/request-a-quote                                      priority 0.9  monthly
/insights                                             priority 0.7  monthly
/insights/are-lab-grown-diamonds-real-diamonds        priority 0.7  monthly
/insights/best-lab-grown-diamond-manufacturer-for-your-need  priority 0.7  monthly
/insights/is-a-lab-grown-diamond-worth-it             priority 0.7  monthly
/insights/lab-grown-diamond-price-per-carat           priority 0.7  monthly
/insights/lab-grown-diamond-wholesale-how-to-buy      priority 0.6  monthly
/insights/largest-lab-grown-diamond-manufacturers-india  priority 0.6  monthly
/insights/12-questions-to-ask-a-manufacturer          priority 0.6  monthly
/insights/calibrated-diamond-layouts-explained        priority 0.6  monthly
/insights/cvd-vs-hpht-lab-grown-diamonds              priority 0.6  monthly
/insights/matched-pairs-vs-melee-vs-layouts           priority 0.6  monthly
/insights/sourcing-lab-grown-diamonds-from-surat      priority 0.6  monthly
/matched-lab-grown-diamond-pairs                      priority 0.7  monthly
/custom-cut-lab-grown-diamonds                        priority 0.7  monthly
/igi-certified-lab-grown-diamonds                     priority 0.7  monthly
/cvd-lab-grown-diamonds                               priority 0.6  monthly
/hpht-lab-grown-diamonds                              priority 0.6  monthly
/fancy-shape-colour-lab-grown-diamonds                priority 0.6  monthly
/precision-lab-grown-diamond-wholesale                priority 0.7  monthly
/privacy                                              priority 0.3  yearly
/terms                                                priority 0.3  yearly
```

Note: `/privacy` and `/terms` are in the sitemap but are `noindex,follow` in `seoInjection.ts`. This is a minor inconsistency — sitemap convention is to omit noindex pages — but it is harmless in practice.

`lastmod` for every entry is the mtime of `dist/prerendered/manifest.json` (i.e. the build date), or today's date if no build artefact exists.

---

## 4. `TODO(alvora)` markers — full inventory

Counts below are **occurrence counts** (a single file line with two TODOs on it counts as two).

### By file

| File | Count |
|---|---|
| `client/public/llms-full.txt` | ~65 |
| `content/product-pages/calibrated-diamond-layouts.md` | 7 |
| `content/product-pages/custom-cut-lab-grown-diamonds.md` | 7 |
| `content/product-pages/cvd-lab-grown-diamonds.md` | 7 |
| `content/product-pages/fancy-shape-colour-lab-grown-diamonds.md` | 7 |
| `content/product-pages/hpht-lab-grown-diamonds.md` | 7 (incl. 2 `url`/`description`) |
| `content/product-pages/igi-certified-lab-grown-diamonds.md` | 7 |
| `content/product-pages/matched-lab-grown-diamond-pairs.md` | 7 |
| `content/product-pages/precision-lab-grown-diamond-wholesale.md` | 7 (incl. `telephone`, `email`, `url`) |
| `content/insights/12-questions-to-ask-a-manufacturer.md` | 3 (prose refs) |
| `content/insights/calibrated-diamond-layouts-explained.md` | 1 (prose ref) |
| `content/insights/matched-pairs-vs-melee-vs-layouts.md` | 1 (prose ref) |
| `content/paa-pages/largest-lab-grown-diamond-manufacturers-india.md` | 1 (prose ref) |
| `server/seoInjection.ts` | 4 |
| `client/src/components/pages/MarkdownPage.tsx` | 2 (a `console.warn` and a display label) |

### By fact type

| Fact type | Locations |
|---|---|
| **address / street / postal code** | `seoInjection.ts` L34, L37; 8× product-page JSON-LD (areaServed is also a form of this) |
| **telephone** | `seoInjection.ts` L40; `precision-lab-grown-diamond-wholesale.md`; `llms-full.txt` |
| **email** | `seoInjection.ts` L41; `precision-lab-grown-diamond-wholesale.md`; `llms-full.txt` |
| **url / mainEntityOfPage / @id** | 10× across `llms-full.txt` JSON-LD blocks; `hpht-lab-grown-diamonds.md`; `precision-lab-grown-diamond-wholesale.md` |
| **MOQ (minimum order quantity)** | All 8 product-page `.md` files (body text + JSON-LD PropertyValue); `llms-full.txt` ×10+ |
| **lead time** | All 8 product-page `.md` files (body text + JSON-LD PropertyValue); `llms-full.txt` ×8+ |
| **tolerance (±mm)** | All 8 product-page `.md` files (body text + JSON-LD PropertyValue); `llms-full.txt` ×10+ |
| **price / priceCurrency** | All 8 product-page `.md` files (Offer JSON-LD); `llms-full.txt` ×10+ |
| **CVD/HPHT process** | `llms-full.txt` L20; product-page bodies |
| **capacity** | `llms-full.txt` L21 |
| **team / founder** | `llms-full.txt` L24 |
| **verification process** | `llms-full.txt` L118, L149 |
| **areaServed** | 4× product-page JSON-LD (currently literal "TODO(alvora)" string in structured data) |
| **GST / IEC** | Not present — no GST or IEC TODO markers found anywhere |

> **Note on `areaServed`:** Four product-page markdown files have `"areaServed": "TODO(alvora): ______"` in their JSON-LD blocks. This means the structured data emitted by those pages currently contains the literal placeholder string. The eight `seoInjection.ts` Service/Product entries hardcode `areaServed: "Worldwide"` and are unaffected.

> **Note on `llms-full.txt`:** The markers in `llms-full.txt` are intentional LLM-agent instructions, not broken page content. They tell an AI agent to leave fields blank until owner-confirmed values are available. They do not appear on any public-facing page.

---

## 5. Test suite (`npm test`) and type check (`npm run check`)

### Vitest results

```
Test Files:   5 failed | 28 passed (33 total)
Tests:        7 failed | 95 passed (102 total)
```

#### Failing tests (all pre-existing, not introduced by recent commits)

| File | Test name | Root cause |
|---|---|---|
| `server/publicMakerLanguage.test.ts` | keeps sourcing and supply terminology out of public copy | Content file contains word "sourcing" in a draft/comment context |
| `server/publicMakerLanguage.test.ts` | keeps unverified credentials and unfinished editorial drafts out of public navigation | `insightsContent.ts` stub form doesn't match expected text |
| `server/buyerWorkflow.test.ts` | persists a private-list request before attempting the tagged alert… | Expected value is `undefined` where a number is needed (DB not connected) |
| `server/buyerWorkflow.test.ts` | stores a line sheet and logs a welcome email when an admin approves a buyer | Mock delivery returns `"failed"` instead of `"sent"` |
| `server/tradeEngagementPublic.test.ts` | publishes the Insights hub with real article links and no draft content | Test reads source file which no longer contains the expected export form |
| `server/whatsappConfig.test.ts` | uses an international-digit number accepted by the WhatsApp endpoint | `VITE_ALVORA_WHATSAPP_NUMBER` not set in local env |
| `server/resend.integration.test.ts` | authenticates against the domains endpoint with the configured key | `RESEND_API_KEY` not set in local env |

The `node --test scripts/validate-partner-availability.test.mjs` step never runs because vitest exits non-zero first.

### Type check

```
1 error — server/_core/vite.ts(84,78):
  Type 'MapIterator<string>' can only be iterated through when using
  the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
```

This is a pre-existing error in the server Vite plugin helper, not in any recently modified file. All client-side and GA4 code type-checks cleanly.

---

## 6. `npm run build` — Vite + esbuild + prerender

### Build command
```
vite build
  && cp scripts/publicRoutes.json dist/publicRoutes.json
  && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
  && node scripts/prerender.mjs
```

### Vite build — **succeeded** (exit 0)

Two expected warnings when run without env vars set locally:

```
(!) %VITE_ANALYTICS_ENDPOINT% is not defined in env variables
(!) %VITE_ANALYTICS_WEBSITE_ID% is not defined in env variables
<script src="%VITE_ANALYTICS_ENDPOINT%/umami"> can't be bundled without type="module"
```

These are harmless in Railway where both vars are set. One chunk-size advisory:

```
(!) Some chunks are larger than 500 kB after minification.
    index-CCP1DPfx.js  511.77 kB (gzip: 151.23 kB)
```

Not a build failure, just a suggestion to code-split further.

### esbuild — **succeeded** (`dist/index.js` 183.1 kB)

### Prerender — **all 33/33 routes snapshotted**

```
[prerender] Using Chromium at: ~/Library/Caches/ms-playwright/chromium-1234/
            chrome-mac-arm64/Google Chrome for Testing.app/.../Google Chrome for Testing
[prerender] ✓ /                              → index.html                     (40.2 kB)
[prerender] ✓ /fr                           → fr.html                        (32.7 kB)
[prerender] ✓ /it                           → it.html                        (32.5 kB)
[prerender] ✓ /us                           → us.html                        (33.9 kB)
[prerender] ✓ /calibrated-diamond-layouts   → calibrated-diamond-layouts.html (10.6 kB)
[prerender] ✓ /matched-pair-diamonds        → matched-pair-diamonds.html     (15.0 kB)
[prerender] ✓ /custom-cut-diamonds          → custom-cut-diamonds.html       (17.5 kB)
[prerender] ✓ /melee-diamonds               → melee-diamonds.html            (15.5 kB)
[prerender] ✓ /certifications               → certifications.html            (18.3 kB)
[prerender] ✓ /about                        → about.html                     (18.0 kB)
[prerender] ✓ /for-jewelry-brands           → for-jewelry-brands.html        (16.2 kB)
[prerender] ✓ /request-a-quote              → request-a-quote.html           (16.2 kB)
[prerender] ✓ /insights                     → insights.html                  (13.5 kB)
[prerender] ✓ /insights/are-lab-grown-…     → insights-are-…html              (8.7 kB)
... (all 11 insight/PAA routes) ...
[prerender] ✓ /matched-lab-grown-…          → matched-lab-grown-…html        (10.1 kB)
... (all 7 specialty SEO routes) ...
[prerender] ✓ /privacy                      → privacy.html                    (7.5 kB)
[prerender] ✓ /terms                        → terms.html                      (6.4 kB)
[prerender] Manifest written: 33 route(s)
[prerender] All 33 routes snapshotted.
```

**Noise (not failures):** Every route emits a `URIError: Failed to decode param '/%VITE_ANALYTICS_ENDPOINT%/umami'` in the prerender static server's stderr. This happens because the built `index.html` contains the unexpanded literal `%VITE_ANALYTICS_ENDPOINT%` in the Umami script `src`, which the Playwright browser requests, and Express's static handler crashes trying to `decodeURIComponent` that percent-encoded string. The error is caught and suppressed by Express's error handler — it does not affect prerendering. In Railway, `VITE_ANALYTICS_ENDPOINT` is set before build so the issue never occurs. The fix locally would be to set the env vars before running `npm run build`.

---

## 7. Page components — inventory

| File | Route(s) | Type |
|---|---|---|
| `Home.tsx` | `/` | Hardcoded React |
| `MarketLanding.tsx` | `/fr`, `/it`, `/us` | Hardcoded React (3 locale variants via `variant` prop) |
| `Insights.tsx` | `/insights`, `/insights/:slug` | Wired from markdown — article bodies loaded from `content/insights/*.md` and `content/paa-pages/*.md` via `insightsArticles.ts` |
| `RequestAQuote.tsx` | `/request-a-quote` | Hardcoded React form + tRPC mutation |
| `LegalPage.tsx` | `/privacy`, `/terms` | Hardcoded React (2 variants via `page` prop) |
| `MatchedPairDiamonds.tsx` | `/matched-pair-diamonds` | Hardcoded React |
| `CustomCutDiamonds.tsx` | `/custom-cut-diamonds` | Hardcoded React |
| `MeleeDiamonds.tsx` | `/melee-diamonds` | Hardcoded React |
| `Certifications.tsx` | `/certifications` | Hardcoded React |
| `About.tsx` | `/about` | Hardcoded React |
| `ForJewelryBrands.tsx` | `/for-jewelry-brands` | Hardcoded React |
| `PublicAvailability.tsx` | `/availability`, `/fr/availability`, `/it/availability`, `/buyer-availability` | Hardcoded React (data fetched from tRPC API at runtime) |
| `CalibratedDiamondLayouts.tsx` | **not routed** | Legacy — superseded by `MarkdownPage` on `/calibrated-diamond-layouts` |
| `Refer.tsx` | `/refer` | Hardcoded React — protected, `noindex` |
| `NotFound.tsx` | `/404` + catch-all | Hardcoded React |
| `ComponentShowcase.tsx` | **not routed** | Dev/testing artefact, no route in `App.tsx` |
| `BuyerAvailability.tsx` | **not routed** | Appears to be a legacy or renamed version; `PublicAvailability.tsx` handles `/buyer-availability` |
| `AdminOperations.tsx` | `/admin` | Admin-only (Manus OAuth gated) |
| `AdminBuyers.tsx` | `/admin/buyers` | Admin-only |
| `AdminAvailability.tsx` | `/admin/availability` | Admin-only |
| `AdminProductionBriefs.tsx` | `/admin/briefs` | Admin-only |

**Wired from markdown (via `MarkdownPage` component + `productPages.ts` glob):**

| Route | Markdown source |
|---|---|
| `/calibrated-diamond-layouts` | `content/product-pages/calibrated-diamond-layouts.md` |
| `/matched-lab-grown-diamond-pairs` | `content/product-pages/matched-lab-grown-diamond-pairs.md` |
| `/custom-cut-lab-grown-diamonds` | `content/product-pages/custom-cut-lab-grown-diamonds.md` |
| `/igi-certified-lab-grown-diamonds` | `content/product-pages/igi-certified-lab-grown-diamonds.md` |
| `/cvd-lab-grown-diamonds` | `content/product-pages/cvd-lab-grown-diamonds.md` |
| `/hpht-lab-grown-diamonds` | `content/product-pages/hpht-lab-grown-diamonds.md` |
| `/fancy-shape-colour-lab-grown-diamonds` | `content/product-pages/fancy-shape-colour-lab-grown-diamonds.md` |
| `/precision-lab-grown-diamond-wholesale` | `content/product-pages/precision-lab-grown-diamond-wholesale.md` |

---

## Summary of blockers and items to act on

| Priority | Item | Detail |
|---|---|---|
| **High** | Fill 4 `TODO(alvora)` in `seoInjection.ts` | `streetAddress`, `postalCode`, `telephone`, `email` — currently emitted as placeholder strings in every page's `LocalBusiness` JSON-LD |
| **High** | Fix `areaServed: "TODO(alvora)…"` in 4 product-page markdown files | Literal placeholder string lands in Service JSON-LD; affects `/calibrated-diamond-layouts`, `/matched-lab-grown-diamond-pairs`, `/custom-cut-lab-grown-diamonds`, `/matched-lab-grown-diamond-pairs` |
| **High** | Set Railway env vars before each build | `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` must be set; without them the Umami script tag is left as a literal placeholder in the built HTML (harmless on Railway where they are set, but a build noise source locally) |
| **Medium** | 7 failing vitest tests | `buyerWorkflow` (2) needs a live DB or a fixed mock; `publicMakerLanguage` (2) and `tradeEngagementPublic` (1) need content/source alignment; `whatsappConfig` and `resend.integration` need env vars |
| **Medium** | 1 TypeScript error in `server/_core/vite.ts:84` | `MapIterator` target issue; does not block build or runtime |
| **Medium** | `CalibratedDiamondLayouts.tsx` and `BuyerAvailability.tsx` are orphaned | Not routed in `App.tsx`; safe to delete or intentionally kept as legacy |
| **Low** | `/privacy` and `/terms` in sitemap despite `noindex,follow` | Convention says noindex pages should be omitted from sitemaps; Google will likely ignore them but it is technically inconsistent |
| **Low** | Prerender `URIError` noise | Cosmetic stderr noise during local `npm run build` when Umami env vars are unset; no route fails |
| **Low** | Large chunk warning (`index-CCP1DPfx.js` 511 kB) | Consider code-splitting the React/Radix vendor bundle |

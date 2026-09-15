# Alvora SEO State Audit — 2026-09-15

---

## Summary Table

| Item | Verdict | Evidence | What is missing |
|------|---------|----------|-----------------|
| 0. Branch State | DONE | `git status`: clean; `git branch`: main; 0 commits ahead/behind origin/main | `codex/phase-1-foundation` has 2 unmerged commits with CSS + Home.tsx changes; no uncommitted files in working tree |
| 1. LLMS.TXT Sync | PARTIAL | `client/public/llms.txt` (19 URLs); `scripts/publicRoutes.json` (53 routes) | 34 routes absent from llms.txt; llms-full.txt is empty (0 bytes); no build-time or CI check keeps them in sync |
| 2. Dispatch Wording | PARTIAL | `client/src/pages/PublicAvailability.tsx:44`, `MarketLanding.tsx:45`, `RequestAQuote.tsx:237`, `content/paa-pages/is-a-lab-grown-diamond-worth-it.md:30` | "Ready now" appears twice in UI strings; "In stock" appears in a dropdown option; `shared/companyInfo.ts` has `leadTime.bespoke` flagged `// DRAFT`; lead times are hardcoded in pages (not read from companyInfo) |
| 3. Conversion Pages | NOT STARTED | No `/cert-clinic`, `/quote-autopsy`, `/spec-response-time` routes in `publicRoutes.json` | Only enquiry paths are `/request-a-quote`, `/contact`, and WhatsApp (`wa.me/919924490125`); no free-tool conversion pages exist |
| 4. Factory Gate Index | NOT STARTED | No `content/index/` directory; no Dataset JSON-LD in `server/seoInjection.ts`; no `.csv` in `client/public/`; no `index` or `price-index` routes in `publicRoutes.json` | Entire Factory Gate Index feature is absent |
| 5. Market Clusters | PARTIAL | `/singapore` hub + 10 sub-pages in `publicRoutes.json`; `/us`, `/fr`, `/it` market landing pages exist | No `/ca`, `/gcc`, `/au`, `/australia` clusters; `/us` is a single locale-market landing page (MarketLanding component, variant "us"), not a full cluster with sub-pages |
| 6. GA4 and Events | PARTIAL | `client/src/lib/ga4.ts` implements GA4 with `VITE_GA4_MEASUREMENT_ID`; 4 events defined; Umami also wired in `client/index.html` | `VITE_GA4_MEASUREMENT_ID` is NOT set in `.env.railway.txt` (only Umami credentials present); GA4 silently no-ops if env var absent; `availability_first_screen_view` event uses Umami not GA4; no event for article_read on Singapore pages |
| 7. sameAs and Social | NOT STARTED | `server/seoInjection.ts:26`: `sameAs: []` (empty array); no social links block in `shared/companyInfo.ts`; no footer social icon components | `sameAs` array is empty — no LinkedIn, Instagram, Facebook, or other profiles wired; no social icon components anywhere in codebase |
| 8. Validation Suite | PARTIAL | `scripts/validate-seo-meta.ts` (title/desc uniqueness + presence); `scripts/check-no-todo.mjs` (TODO guard); `prebuild` runs both; `vitest` suite with 30+ test files | No `.github/workflows/` CI directory exists; no `check:routes` or llms.txt sync validation; DRAFT-VALUE markers in content/ are not caught by the todo guard (only checks `TODO(alvora)` pattern) |
| 9. Content Hygiene | PARTIAL | Multiple hits; see detail section | `DRAFT-VALUE` in 8 content product pages (24 occurrences); `COPY:` placeholders in `Contact.tsx`; `TODO:` in 6 page components; `DRAFT` in `companyInfo.ts`; `BLOCKED` in `companyInfo.ts` for street/postalCode |
| 10. Meta Coverage | PARTIAL | All 53 publicRoutes have explicit `case` blocks in `server/seoInjection.ts`; 0 duplicate titles; 0 duplicate descriptions | 9 titles > 60 chars; 8 descriptions > 155 chars (see detail) |
| 11. Images | PARTIAL | 19 total `<img>` tags across client/src; see detail | 1 `<img>` tag missing `alt` attribute entirely (`ManusDialog.tsx:58`); all others have `alt` (many with `alt=""`); zero `<img>` tags have `width=` or `height=` attributes — all 19 are missing both |

---

## Detail: Item 1 — LLMS.TXT Sync

### publicRoutes.json route count: 53 routes

### llms.txt URL count: 19 URLs (colon-prefixed path entries)

### llms-full.txt: Empty file (0 bytes / 0 content)

### Routes in publicRoutes.json ABSENT from llms.txt (34 routes):

```
/
/fr
/it
/us
/contact
/insights
/insights/12-questions-to-ask-before-your-first-lab-grown-order
/insights/how-to-spec-a-calibrated-parcel
/insights/igi-vs-gia-vs-sgl-lab-grown-diamonds
/insights/import-duty-lc-terms-lab-grown-diamonds
/insights/lab-grown-diamond-wholesale-price-trends-2026
/insights/melee-vs-solitaire-moq-realities
/insights/reading-a-matched-layout-tolerance-sheet
/insights/sourcing-lab-grown-diamonds-us-retailer
/matched-lab-grown-diamond-pairs
/custom-cut-lab-grown-diamonds
/igi-certified-lab-grown-diamonds
/cvd-lab-grown-diamonds
/hpht-lab-grown-diamonds
/fancy-shape-colour-lab-grown-diamonds
/precision-lab-grown-diamond-wholesale
/singapore
/singapore/wholesale-lab-grown-diamonds
/singapore/lab-grown-diamond-wholesaler
/singapore/for-jewellers
/singapore/lab-grown-diamond-supplier
/singapore/calibrated-parcels
/singapore/matched-pairs
/singapore/melee
/singapore/for-manufacturers
/singapore/surat-to-singapore
/singapore/wholesale-parcels
/privacy
/terms
```

All 10 Singapore sub-pages added on 2026-09-01 are absent. All 8 specialty redirect pages (`/matched-lab-grown-diamond-pairs`, `/custom-cut-lab-grown-diamonds`, `/igi-certified-lab-grown-diamonds`, `/cvd-lab-grown-diamonds`, `/hpht-lab-grown-diamonds`, `/fancy-shape-colour-lab-grown-diamonds`, `/precision-lab-grown-diamond-wholesale`) are absent. The 8 newer insight articles (from `feat: register 8 new insight articles` commit) are absent.

### Paths in llms.txt NOT in publicRoutes.json: 0 — no stale/broken URLs

### llms-full.txt status: File exists at `client/public/llms-full.txt` but contains 0 bytes (empty)

### Build-time / CI sync check: NONE

- `scripts/prebuild` runs `check-no-todo.mjs` and `validate-seo-meta.ts` but neither checks llms.txt
- No `.github/workflows/` directory exists — zero CI pipelines
- `scripts/prerender.mjs` reads `publicRoutes.json` but does not touch llms files
- No `sync-llms`, `check:routes`, or equivalent script exists

---

## Detail: Item 2 — Dispatch Wording

### Every occurrence of flagged wording (case-insensitive search across client/ and content/):

**"Ready now"**

| File | Line | Exact text |
|------|------|------------|
| `client/src/pages/PublicAvailability.tsx` | 44 | `intro: "Cut, calibrated and IGI-certified at our own benches in Surat. Ready now."` |
| `client/src/pages/MarketLanding.tsx` | 45 | `title: "From the bench, ready now."` (US variant availability teaser) |

**"In stock"** (as user-visible text or option)

| File | Line | Exact text |
|------|------|------------|
| `client/src/pages/RequestAQuote.tsx` | 237 | `<option>Immediate (in stock / urgent)</option>` |
| `content/paa-pages/is-a-lab-grown-diamond-worth-it.md` | 30 | `"A standard in-stock stone can move faster than a custom cut..."` (editorial, not Alvora's claim) |

**"Available now"** — 0 occurrences found.

**"Ready to ship"** — 0 occurrences found.

**"Ships same day"** — 0 occurrences found.

**"Ships today"** — 0 occurrences found.

**"Immediate dispatch"** — 0 occurrences found.

**"In-stock"** (hyphenated) — 0 occurrences found (the `RequestAQuote.tsx:237` instance uses "in stock" un-hyphenated).

### shared/companyInfo.ts dispatch/lead-time block:

```typescript
// shared/companyInfo.ts lines 70-73
leadTime: Object.freeze({
  stock: "2–3 working days",
  bespoke: "7–10 working days",  // DRAFT — confirm with Akshay for custom-cut/layout pages
}),
```

`leadTime.bespoke` is explicitly flagged `DRAFT`. Neither `leadTime.stock` nor `leadTime.bespoke` is used by any page component — all lead-time copy is hardcoded directly in TSX pages. Evidence:

- `client/src/pages/Home.tsx:178` — `"Specification make lead time: 5–10 working days."` (hardcoded)
- `client/src/pages/Home.tsx:294` — `"Typical lead time for a spec make: <strong>5–10 working days</strong>"` (hardcoded)
- `client/src/pages/About.tsx:96` — `"5–10 working day lead time from specification sign-off."` (hardcoded)
- `client/src/pages/MarketLanding.tsx:104` — `stamp: "SPEC 05–10 DAYS"` (hardcoded)
- `client/src/pages/CustomCutDiamonds.tsx:15`, `24`, `39` — `"5–10 working day lead time"` (hardcoded × 3)

No page reads `COMPANY.leadTime.stock` or `COMPANY.leadTime.bespoke`.

---

## Detail: Item 6 — GA4 and Events

### Is GA4 integrated?

Yes. `client/src/lib/ga4.ts` implements a full GA4 integration using `window.gtag` loaded from `googletagmanager.com/gtag/js`. It initialises with Consent Mode set to `analytics_storage: 'denied'` (cookieless-ping mode). The env var key is `VITE_GA4_MEASUREMENT_ID`.

In parallel, **Umami analytics** is loaded via `client/index.html:14`:
```html
<script defer src="%VITE_ANALYTICS_ENDPOINT%/umami" data-website-id="%VITE_ANALYTICS_WEBSITE_ID%"></script>
```
Umami credentials (`VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID`) ARE present in `.env.railway.txt` pointing to `https://manus-analytics.com`.

### Is VITE_GA4_MEASUREMENT_ID set?

**NO.** The file `.env.railway.txt` does not contain `VITE_GA4_MEASUREMENT_ID`. The `SEO_LAUNCH_CHECKLIST.md:177` and `RAILWAY_DEPLOYMENT.md:60` both document it as a manual step (`VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX`) but it has not been added. GA4 silently no-ops when the env var is absent — `initGA4()` returns immediately without loading the script.

### Full GA4 event inventory:

| Event name | Function | File:Line | User action that triggers it |
|------------|----------|-----------|------------------------------|
| `whatsapp_click` | `trackWhatsappClick(ctaLocation)` | `client/src/lib/ga4.ts:38-40` | Definition |
| `whatsapp_click` | — | `client/src/components/FloatingWhatsApp.tsx:33` | Click floating WhatsApp button (`cta_location: "floating_button"`) |
| `whatsapp_click` | — | `client/src/components/WhatsAppQuickContact.tsx:9` | Click WhatsApp link in Insights sidebar (`cta_location: "floating_button"`) — **note: same `cta_location` as floating button, may cause attribution confusion** |
| `whatsapp_click` | — | `client/src/components/SpecialtyPageShell.tsx:42` | Click WhatsApp CTA on specialty pages (`cta_location: "specialty_cta"`) |
| `whatsapp_click` | — | `client/src/pages/Contact.tsx:165` | Click WhatsApp on contact page (`cta_location: "contact_page"`) |
| `whatsapp_click` | — | `client/src/pages/RequestAQuote.tsx:382` | Click WhatsApp in RFQ sidebar (`cta_location: "rfq_sidebar"`) |
| `rfq_submit` | `trackRfqSubmit(productInterest, country, leadType?)` | `client/src/lib/ga4.ts:42-44` | Definition |
| `rfq_submit` | — | `client/src/components/FastRfqForm.tsx:73` | Fast RFQ form successful submission (`product_interest: "Fast RFQ"`, `lead_type: "fast_rfq"`) |
| `rfq_submit` | — | `client/src/pages/RequestAQuote.tsx:78` | Full RFQ form successful submission (`lead_type: "qualified_brief"`) |
| `rfq_submit` | — | `client/src/components/SingaporeBlocks.tsx:327` | Singapore supply enquiry form submission (`product_interest: "Singapore supply enquiry"`, country: "SG", `lead_type: "qualified_brief"`) |
| `article_read` | `trackArticleRead(slug)` | `client/src/lib/ga4.ts:46-48` | Definition |
| `article_read` | — | `client/src/pages/Insights.tsx:113` | Article component mounts with a slug (i.e. user navigates to an insight article) |

### Additional Umami event (NOT a GA4 event):

| Event name | Source | Trigger |
|------------|--------|---------|
| `availability_first_screen_view` | `client/src/pages/PublicAvailability.tsx:126-127` | First visible stones rendered on catalogue page; fires via `window.umami.track()` — Umami only, not GA4 |

### Flag — same `cta_location` for two different WhatsApp CTAs:

`WhatsAppQuickContact.tsx:9` passes `cta_location: 'floating_button'` but is rendered inside the Insights sidebar, not the floating button. This duplicates `FloatingWhatsApp.tsx`'s location value, making the two CTAs indistinguishable in GA4 reports.

### Flag — events defined but never called:

None. All three exported functions (`trackWhatsappClick`, `trackRfqSubmit`, `trackArticleRead`) have at least one call site.

---

## Detail: Item 9 — Content Hygiene

### Term: "TODO(alvora)"

**0 occurrences found** in content/, client/src/, shared/, server/. The `check-no-todo.mjs` build guard confirms zero markers. Allowlist at `scripts/todo-allowlist.json` is empty (`{ "allowPatterns": [] }`).

---

### Term: "DRAFT-VALUE"

Found in 8 content product-page markdown files. 24 total occurrences. All are HTML comments (`<!-- DRAFT-VALUE: confirm with Akshay -->`), so they are stripped at build time by the vite markdown plugin and never rendered. However they represent unconfirmed production values.

**`content/product-pages/calibrated-diamond-layouts.md`** (lines 17, 18, 19)
- Line 17: `- Tolerance range: ±0.05mm...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 18: `- MOQ: Minimum 5 carats...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 19: `- Lead time: 7–10 working days...<!-- DRAFT-VALUE: confirm with Akshay -->`

**`content/product-pages/custom-cut-lab-grown-diamonds.md`** (lines 17, 18, 19)
- Line 17: `- Tolerance range: ±0.05mm...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 18: `- MOQ: Minimum 5 carats total...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 19: `- Lead time: 7–10 working days...<!-- DRAFT-VALUE: confirm with Akshay -->`

**`content/product-pages/cvd-lab-grown-diamonds.md`** (lines 17, 18, 19)
- Line 17: `- Tolerance range: ±0.05mm...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 18: `- MOQ: No minimum (ex-stock loose); 5 ct minimum...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 19: `- Lead time: 2–3 working days (ex-stock); 7–10 working days...<!-- DRAFT-VALUE: confirm with Akshay -->`

**`content/product-pages/fancy-shape-colour-lab-grown-diamonds.md`** (lines 17, 18, 19)
- Line 17: `- Tolerance range: ±0.05mm...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 18: `- MOQ: Minimum 5 carats per custom-cut...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 19: `- Lead time: 7–10 working days; separate sourcing...<!-- DRAFT-VALUE: confirm with Akshay -->`

**`content/product-pages/hpht-lab-grown-diamonds.md`** (lines 17, 18, 19)
- Line 17: `- Tolerance range: ±0.05mm...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 18: `- MOQ: No minimum (ex-stock loose); 5 ct minimum...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 19: `- Lead time: 2–3 working days (ex-stock); 7–10 working days...<!-- DRAFT-VALUE: confirm with Akshay -->`

**`content/product-pages/igi-certified-lab-grown-diamonds.md`** (lines 17, 18, 19)
- Line 17: `- Tolerance range: ±0.05mm...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 18: `- MOQ: No minimum (ex-stock loose); 5 ct minimum...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 19: `- Lead time: 2–3 working days (ex-stock); 7–10 working days...<!-- DRAFT-VALUE: confirm with Akshay -->`

**`content/product-pages/matched-lab-grown-diamond-pairs.md`** (lines 17, 18, 19)
- Line 17: `- Tolerance range: Matched within 1 colour grade...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 18: `- MOQ: 1 pair (2 stones) minimum...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 19: `- Lead time: 7–10 working days...<!-- DRAFT-VALUE: confirm with Akshay -->`

**`content/product-pages/precision-lab-grown-diamond-wholesale.md`** (lines 17, 18, 19)
- Line 17: `- Tolerance range: ±0.05mm...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 18: `- MOQ: No minimum (ex-stock loose); 5 ct minimum...<!-- DRAFT-VALUE: confirm with Akshay -->`
- Line 19: `- Lead time: 2–3 working days (ex-stock); 7–10 working days...<!-- DRAFT-VALUE: confirm with Akshay -->`

Note: `shared/companyInfo.ts:72` also contains `// DRAFT — confirm with Akshay for custom-cut/layout pages` on the `bespoke` lead time value. And `companyInfo.ts:45,48` contain `// BLOCKED` for `street` and `postalCode`.

---

### Term: "sourcing" OR "we source" OR "supplier network"

**"sourcing"** — Occurs widely in content/ (articles, market research) and in a handful of client/src pages. These are editorial and informational uses, not Alvora's own claims of being a "sourcing" intermediary:

**client/src/pages/ — non-editorial sourcing mentions:**

| File | Line | Text (excerpt) |
|------|------|----------------|
| `client/src/pages/ForJewelryBrands.tsx` | 98 | `"from a brand's catalogue at reorder is not a test of sourcing — it is a test of"` |
| `client/src/pages/CustomCutDiamonds.tsx` | 35 | `"pavilion angles, finish — and we make the diamond to meet it. That is not sourcing. That"` |
| `client/src/pages/Insights.tsx` | 48 | `"Practical guides, Q&A, and sourcing notes from Alvora's team in Surat"` |
| `client/src/pages/singapore/ForJewellers.tsx` | 24 | `"bespoke sourcing."` (in description string) |
| `client/src/pages/singapore/ForJewellers.tsx` | 42 | `"For jewellers sourcing individual stones or small lots..."` |
| `client/src/pages/singapore/ForJewellers.tsx` | 56, 65, 125 | `"bespoke sourcing"` (3 occurrences in JSX) |

**"we source"** — 0 occurrences found.

**"supplier network"** — Found in `content/market-research/au-prospecting-report.md` (lines 14, 67, 182, 289) — all referring to competitors' or prospects' supplier networks, not Alvora's.

---

### Term: "returns" (in prose, not as a JS keyword)

**content/ files only** (these are all editorial uses advising buyers to ask about return terms):

| File | Line | Text (excerpt) |
|------|------|----------------|
| `content/insights/12-questions-to-ask-before-your-first-lab-grown-order.md` | 52 | `"**12. What are the conditions for returns or balance stock?**"` |
| `content/insights/12-questions-to-ask-before-your-first-lab-grown-order.md` | 60 | `"...your discrepancy, remedy and returns policy."` |
| `content/insights/sourcing-lab-grown-diamonds-from-surat.md` | 57 | `"| Commercial terms | MOQ, payment, returns, memo or sample terms, insurance |"` |
| `content/paa-pages/lab-grown-diamond-wholesale-how-to-buy.md` | 28 | `"...payment exposure, insurance, returns, and internal QC."` |
| `content/paa-pages/lab-grown-diamond-wholesale-how-to-buy.md` | 36 | `"A platform promise about returns, credit, or QC..."` |
| `content/paa-pages/is-a-lab-grown-diamond-worth-it.md` | 26 | `"...freight, duties, returns, marketing, labour, and inventory risk."` |
| `content/paa-pages/best-lab-grown-diamond-manufacturer-for-your-need.md` | 34 | `"Whether the exact stone is owned, memo/returns, certification..."` |
| `content/paa-pages/lab-grown-diamond-price-per-carat.md` | 51 | `"...retailer inventory accumulation, memo returns..."` |

**client/src/ pages (non-JS-keyword "returns"):**

| File | Line | Text (excerpt) |
|------|------|----------------|
| `client/src/pages/MatchedPairDiamonds.tsx` | 49 | `"proportions, and the way light returns from each stone"` — optical/physical use |

Note: Alvora does not state its own returns policy anywhere on the site. The mentions are buyer-education advisory content.

---

### Term: "largest" OR "#1" OR "leading" (as superlative applied to Alvora)

**Alvora makes no self-promotional "largest", "#1", or "leading" claims anywhere in client/src/ or content/.** The term "largest" appears only in:
- Content about KIRA/Kira Jewels: `content/paa-pages/largest-lab-grown-diamond-manufacturers-india.md` (correctly attributes this to KIRA, explicitly states Alvora should NOT be described this way)
- Editorial market-research notes: `content/market-research/au-prospecting-report.md`
- The `seoInjection.ts` case block for the insight article URL `/insights/largest-lab-grown-diamond-manufacturers-india`

"#1" — 0 occurrences found.

"Leading" as applied to Alvora — 0 occurrences found. The term "leading" appears in `paa-pages/largest-lab-grown-diamond-manufacturers-india.md` as an FAQ question ("Who is the leading supplier?") and the answer correctly declines to name any single leader.

### Additional hygiene: TODO: markers in TSX pages (not caught by check-no-todo.mjs)

The build guard only catches the pattern `TODO(alvora)`. Plain `TODO:` and `specialty-todo` class markers survive the guard and are visible in the rendered page DOM:

| File | Line | Text |
|------|------|------|
| `client/src/pages/ForJewelryBrands.tsx` | 117 | `[TODO: confirm minimum order quantities for brand programmes]` |
| `client/src/pages/CustomCutDiamonds.tsx` | 40 | `[TODO: confirm]` |
| `client/src/pages/CustomCutDiamonds.tsx` | 110 | `"TODO: confirm achievable size range."` |
| `client/src/pages/RequestAQuote.tsx` | 350 | `[TODO: confirm]` |
| `client/src/pages/MeleeDiamonds.tsx` | 72 | `"TODO: confirm specific size ranges"` |
| `client/src/pages/MeleeDiamonds.tsx` | 74 | `"TODO: confirm IGI melee certification scope and process."` |
| `client/src/pages/MeleeDiamonds.tsx` | 115 | `[TODO: confirm minimum order quantities]` |
| `client/src/pages/MeleeDiamonds.tsx` | 125 | `[TODO: confirm for melee parcels]` |
| `client/src/pages/About.tsx` | 64 | `"TODO: confirm"` (25+ years figure) |
| `client/src/pages/About.tsx` | 65 | `"TODO: confirm cumulative"` (10,000+ stones) |
| `client/src/pages/About.tsx` | 121 | `[TODO: confirm and expand each stage with production specifics]` |
| `client/src/pages/About.tsx` | 128 | `"TODO: confirm tooling and cutting approach."` |
| `client/src/pages/MatchedPairDiamonds.tsx` | 61 | `"TODO: confirm — e.g., E/F or F/G range"` |
| `client/src/pages/MatchedPairDiamonds.tsx` | 62 | `"TODO: confirm tolerance"` |
| `client/src/pages/MatchedPairDiamonds.tsx` | 64 | `"TODO: confirm angular tolerance."` |
| `client/src/pages/MatchedPairDiamonds.tsx` | 112 | `[TODO: confirm] from specification sign-off.` |
| `client/src/pages/Certifications.tsx` | 67 | `"TODO: confirm Alvora's growth type(s)."` |
| `client/src/pages/Certifications.tsx` | 112 | `"TODO: confirm — do we ship Very Good on any stones?"` |
| `client/src/pages/Certifications.tsx` | 114 | `"TODO: confirm colour range"` |
| `client/src/pages/Certifications.tsx` | 115 | `"TODO: confirm clarity range"` |
| `client/src/pages/Certifications.tsx` | 116 | `"TODO: confirm — HPHT, CVD, or both"` |

Additionally, `client/src/pages/Contact.tsx` lines 1–26 contain `COPY:` placeholder constants:
- `COPY_INTRO`, `COPY_ADDRESS_BUILDING`, `COPY_ADDRESS_PIN`, `COPY_ADDRESS_NOTE`, `COPY_RESPONSE_TIME`, `COPY_GST`, `COPY_IEC`, `COPY_GJEPC` — all contain bracket-wrapped placeholder strings that render verbatim to users visiting `/contact`.

---

## Detail: Item 10 — Meta Coverage (for completeness)

All 53 publicRoutes have explicit `case` blocks in `server/seoInjection.ts`. No route falls through to the default handler. 0 duplicate titles. 0 duplicate descriptions.

### Titles over 60 characters (9 routes):

| Route | Title | Chars |
|-------|-------|-------|
| `/insights/12-questions-to-ask-before-your-first-lab-grown-order` | 12 Questions to Ask Before Your First Lab-Grown Diamond Order \| Alvora | 70 |
| `/insights/how-to-spec-a-calibrated-parcel` | How to Spec a Calibrated Parcel: A Buyer's Checklist \| Alvora | 61 |
| `/insights/igi-vs-gia-vs-sgl-lab-grown-diamonds` | IGI vs GIA vs SGL for Lab-Grown Diamonds: An Honest Comparison \| Alvora | 71 |
| `/insights/import-duty-lc-terms-lab-grown-diamonds` | Import Duties and Payment Terms for Lab-Grown Diamonds, Explained \| Alvora | 74 |
| `/insights/lab-grown-diamond-wholesale-price-trends-2026` | Lab-Grown Diamond Wholesale Price Trends Through 2026 \| Alvora | 62 |
| `/insights/melee-vs-solitaire-moq-realities` | Melee vs Solitaire MOQs: Why Bulk and Singles Behave Differently \| Alvora | 73 |
| `/insights/reading-a-matched-layout-tolerance-sheet` | Reading a Matched-Layout Tolerance Sheet: What the Numbers Mean \| Alvora | 72 |
| `/insights/sourcing-lab-grown-diamonds-us-retailer` | Sourcing Lab-Grown Diamonds from India: A US Retailer's Guide \| Alvora | 70 |
| `/singapore/for-manufacturers` | Lab-Grown Diamonds for Singapore Jewellery Manufacturers \| Alvora | 65 |

### Descriptions over 155 characters (8 routes):

| Route | Description (truncated) | Chars |
|-------|-------------------------|-------|
| `/insights/12-questions-to-ask-before-your-first-lab-grown-order` | A pre-order checklist for first-time B2B buyers of lab-grown diamonds: payment terms, sample approval, shipping insurance... | 176 |
| `/insights/how-to-spec-a-calibrated-parcel` | What jewellery manufacturers must specify before requesting a calibrated lab-grown diamond quote — shape, size range... | 185 |
| `/insights/import-duty-lc-terms-lab-grown-diamonds` | What first-time importers of loose lab-grown diamonds should ask about duties, tariffs, letters of credit... | 169 |
| `/insights/lab-grown-diamond-wholesale-price-trends-2026` | A dated, factual overview of publicly reported lab-grown diamond wholesale price trends through 2026... | 167 |
| `/insights/melee-vs-solitaire-moq-realities` | Why melee parcels, single solitaires and bespoke custom-cut lab-grown diamonds carry different minimum order quantities... | 167 |
| `/insights/reading-a-matched-layout-tolerance-sheet` | How to read and specify a matched-layout tolerance sheet for lab-grown diamond layouts: what 'matched within X' constrains... | 170 |
| `/insights/sourcing-lab-grown-diamonds-us-retailer` | A first-time guide for US retailers importing lab-grown diamonds from India: import basics, documentation... | 166 |
| `/singapore/for-manufacturers` | Calibrated and matched lab-grown diamond supply for Singapore jewellery manufacturers: production parcels... | 158 |

---

## Detail: Item 11 — Images

### img tags missing `alt` attribute entirely (no alt prop at all):

| File | Line | Tag |
|------|------|-----|
| `client/src/components/ManusDialog.tsx` | 58 | `<img src={logo} className="w-10 h-10 rounded-md" />` — no `alt` attribute |

All other `<img>` tags in the codebase have an `alt` attribute (though many use `alt=""`, which is acceptable for decorative images like brand marks).

### img tags using `alt=""` (decorative/presentational):

| File | Line | Context |
|------|------|---------|
| `client/src/components/SpecialtyPageShell.tsx` | 60, 116 | Brand mark (decorative) |
| `client/src/pages/MarketLanding.tsx` | 165, 208 | Brand mark in nav and footer |
| `client/src/pages/Home.tsx` | 97, 484 | Brand mark in nav and footer |
| `client/src/pages/Refer.tsx` | 25, 27 | Brand mark (decorative) |
| `client/src/pages/PublicAvailability.tsx` | 76 | Statement stone image (decorative — loaded lazily) |
| `client/src/pages/Insights.tsx` | 36, 126, 145 | Brand mark (decorative) |

### img tags missing `width` and `height` attributes:

All 19 `<img>` tags across `client/src/` are missing both `width=` and `height=` attributes. None set explicit dimensions. This affects CLS (Cumulative Layout Shift) scores. Complete list:

| File | Line |
|------|------|
| `client/src/components/ManusDialog.tsx` | 58 |
| `client/src/components/SpecialtyPageShell.tsx` | 60 |
| `client/src/components/SpecialtyPageShell.tsx` | 116 |
| `client/src/pages/MarketLanding.tsx` | 165 |
| `client/src/pages/MarketLanding.tsx` | 174 (hero image) |
| `client/src/pages/MarketLanding.tsx` | 180 (faceting image) |
| `client/src/pages/MarketLanding.tsx` | 184 (laser image) |
| `client/src/pages/MarketLanding.tsx` | 208 (footer brand mark) |
| `client/src/pages/Home.tsx` | 97 |
| `client/src/pages/Home.tsx` | 142 (hero image) |
| `client/src/pages/Home.tsx` | 227 (faceting image) |
| `client/src/pages/Home.tsx` | 301 (laser image) |
| `client/src/pages/Home.tsx` | 484 |
| `client/src/pages/Refer.tsx` | 25 |
| `client/src/pages/Refer.tsx` | 27 |
| `client/src/pages/PublicAvailability.tsx` | 76 |
| `client/src/pages/Insights.tsx` | 36 |
| `client/src/pages/Insights.tsx` | 126 |
| `client/src/pages/Insights.tsx` | 145 |

# Content Audit Report
**Audited:** `LBG/Content for Claude code/`
**Date:** 2026-09-02 (revised — first pass missed files hidden from `ls` but visible to `find`)
**Auditor:** Claude Code (no source files touched)

---

## 0. Corrected file inventory

| File | Present | Notes |
|---|---|---|
| `alvora-fact-base.md` | ❌ Not found | No file by this name exists; `llms-full.txt` serves the same role |
| `product-pages/*.md` (8 individual files) | ❌ Not found | All 8 product pages are sections inside `llms-full.txt`, not separate files |
| `Homepage Trust and FAQ.md` | ✅ | Flat, no frontmatter; has TODO items and a FAQPage JSON-LD block |
| `insights/*.md` (5 individual files) | ❌ Not found | All 5 insight articles are sections inside `llms-full.txt`, not separate files |
| `paa-pages/*.md` (6 individual files) | ❌ Not found | All 6 PAA pages are sections inside `llms-full.txt`, not separate files |
| `llms.txt` | ✅ | 32 lines; compact index of all routes for LLM retrieval |
| `llms-full.txt` | ✅ | 1,394 lines / 118 KB; **all 19 pages of content live here** |

**Additional files found:** `Competitor Website Review.md`, `CVD vs HPHT.md`, `IGI vs GIA vs GCAL.md`, `Global Market Snapshot.md`, `Wholesale Channels.md`, `Regulatory Positioning + Fact Checklist.md` (6 research docs), plus Python generator scripts (`rewrite_product_pages.py`, `write_insights.py`, `write_paa_four.py`, `write_paa_two.py`, `build_llms_files.py`, etc.) and `pasted_content.txt` (a task prompt, not content).

**`route: /insights/`** — a directory with this exact filesystem name. Both levels are empty (0 files). Artefact of a script trying to create a path with `/` in the name.

---

## 1. Page sections in llms-full.txt

All 19 sections confirmed present. Format per section: `- **Type:**`, `- **URL:**`, `- **Published:**`, body copy, references, fenced ` ```json ``` ` JSON-LD block.

| # | Title | Type | URL in file |
|---|---|---|---|
| 1 | About Alvora Diamonds | Product page | `/about` |
| 2 | Calibrated Lab-Grown Diamond Layouts | Product page | `/calibrated-diamond-layouts` |
| 3 | IGI-Certified Lab-Grown Diamonds | Product page | `/certifications` |
| 4 | Custom-Cut Lab-Grown Diamonds | Product page | `/custom-cut-diamonds` |
| 5 | Lab-Grown Diamond Supply for Jewelry Brands | Product page | `/for-jewelry-brands` |
| 6 | Matched Pair Lab-Grown Diamonds | Product page | `/matched-pair-diamonds` |
| 7 | Wholesale Lab-Grown Melee Diamonds | Product page | `/melee-diamonds` |
| 8 | Request a Lab-Grown Diamond Wholesale Quote | Product page | `/request-a-quote` |
| 9 | Are Lab-Grown Diamonds Real Diamonds? | PAA page | `/insights/are-lab-grown-diamonds-real-diamonds` |
| 10 | Which Lab-Grown Diamond Manufacturer Is Best? | PAA page | `/insights/best-lab-grown-diamond-manufacturer-for-your-need` |
| 11 | Is a Lab-Grown Diamond Worth Buying? | PAA page | `/insights/is-a-lab-grown-diamond-worth-it` |
| 12 | Lab-Grown Diamond Price Per Carat | PAA page | `/insights/lab-grown-diamond-price-per-carat` |
| 13 | Where to Buy Lab-Grown Diamonds Wholesale | PAA page | `/insights/lab-grown-diamond-wholesale-how-to-buy` |
| 14 | The Largest Lab-Grown Diamond Manufacturers in India | PAA page | `/insights/largest-lab-grown-diamond-manufacturers-india` |
| 15 | 12 Questions to Ask a Manufacturer | Insight article | ⚠️ `/request-a-quote` ← WRONG (see §4) |
| 16 | Calibrated Diamond Layouts, Explained | Insight article | ⚠️ `/calibrated-diamond-layouts` ← WRONG |
| 17 | CVD vs HPHT Lab-Grown Diamonds | Insight article | ⚠️ `/cvd-lab-grown-diamonds` ← WRONG |
| 18 | Matched Pairs vs Melee vs Layouts | Insight article | ⚠️ `/matched-pair-diamonds` ← WRONG |
| 19 | Sourcing Lab-Grown Diamonds from Surat | Insight article | ⚠️ `/precision-lab-grown-diamond-wholesale` ← WRONG |

---

## 2. Frontmatter audit

**None of the files use YAML `---` frontmatter.** `llms-full.txt` uses inline meta lines (`- **Type:**`, `- **URL:**`, `- **Published:**`) instead of a YAML block.

| Required field | Present? | Where |
|---|---|---|
| `route` / `slug` | ⚠️ Partially | `- **URL:**` lines in `llms-full.txt` (but 5 of 19 are wrong — see §4) |
| `title` | ⚠️ Partially | `## H2 heading` serves as title — not a parseable frontmatter field |
| `metaDescription` | ❌ Missing | No field by this name anywhere |
| `h1` | ⚠️ Partially | `## H2 heading` is the closest equivalent |
| `answerSentence` | ❌ Missing | PAA pages have a `## Key takeaways` section instead; no `answerSentence` field |

**Impact:** `gray-matter` won't parse anything useful from these files as-is. Content will need to be either (a) split into individual `.md` files with proper frontmatter added, or (b) parsed with a custom splitter that reads the `- **URL:**` / `- **Type:**` meta lines.

---

## 3. Puffery word audit (all files)

Searched: `world's best`, `leading`, `#1`, `premier`, `largest`, `biggest`, `top-rated`, `world-class`

**No unearned Alvora claims found anywhere.** Every hit describes a competitor or market statistic with named attribution. Summary:

| Term | Occurrences | All attributed to? |
|---|---|---|
| `world's largest` | 6 | KIRA (GJEPC/JCK headline), Greenlab (self-claim, LinkedIn), IGI, National Jeweler |
| `largest` | 8 | North America market share data; Nivoda/Vicenzaoro platform stats; competitor benchmark table |
| `leading` | 4 | Bhanderi self-claim; India government policy coverage; Inhorgenta self-description; SERP analysis note |
| `#1` | 1 | SERP analysis quoting listicle blogs naming competitors |
| `premier`, `biggest`, `top-rated`, `world-class` | 0 | Not found |

✅ **No puffery flags for Alvora itself.**

---

## 4. URL mismatch — 5 insight article routes are wrong

`llms.txt` (the canonical route index) declares these 5 insight article slugs:

| llms.txt declared slug | llms-full.txt `- **URL:**` line | Status |
|---|---|---|
| `/insights/12-questions-to-ask-a-manufacturer` | `/request-a-quote` | ❌ Duplicates product page URL |
| `/insights/calibrated-diamond-layouts-explained` | `/calibrated-diamond-layouts` | ❌ Duplicates product page URL |
| `/insights/cvd-vs-hpht-lab-grown-diamonds` | `/cvd-lab-grown-diamonds` | ❌ Wrong path (not under `/insights/`) |
| `/insights/matched-pairs-vs-melee-vs-layouts` | `/matched-pair-diamonds` | ❌ Duplicates product page URL |
| `/insights/sourcing-lab-grown-diamonds-from-surat` | `/precision-lab-grown-diamond-wholesale` | ❌ Wrong slug and not under `/insights/`) |

**These must be corrected in `llms-full.txt` before the content is wired to routes.** The correct values are from `llms.txt`.

---

## 5. TODO(alvora) — full deduplicated list

`llms-full.txt` has **78 occurrences** of `TODO(alvora)`. After deduplication (body-text explanatory references vs. actual placeholder blanks), the unique data gaps are:

### Group A — Alvora-specific operational facts (needed across multiple pages)

| ID | Gap | Pages affected |
|---|---|---|
| A-1 | Growth method (CVD only / HPHT only / both) | About, all product pages |
| A-2 | Monthly production capacity (ct or pieces) | About |
| A-3 | Team structure (roles and headcount) | About |
| A-4 | MOQ — calibrated layouts | Calibrated Layouts, Request a Quote |
| A-5 | MOQ — custom cuts | Custom Cut |
| A-6 | MOQ — certifications / certified orders | Certifications |
| A-7 | MOQ — jewelry brand orders | For Jewelry Brands |
| A-8 | MOQ — matched pairs | Matched Pairs |
| A-9 | MOQ — melee lots (min weight, single/mixed) | Melee |
| A-10 | Lead time — calibrated layouts (stages) | Calibrated Layouts |
| A-11 | Lead time — custom cuts (stages) | Custom Cut |
| A-12 | Lead time — certified orders | Certifications |
| A-13 | Lead time — for jewelry brands | For Jewelry Brands |
| A-14 | Lead time — matched pairs | Matched Pairs |
| A-15 | Lead time — melee (sorting, QC, dispatch) | Melee |

### Group B — Precision / QC specs

| ID | Gap | Pages affected |
|---|---|---|
| B-1 | Calibrated layout tolerance ±mm (length, width, depth — three separate values) | Calibrated Layouts, For Jewelry Brands, Insight: layouts-explained |
| B-2 | Matched pair tolerance ±mm (length, width) | Matched Pairs, Insight: matched-pairs-vs-melee |
| B-3 | Melee size range (mm or ct band; sieve method) | Melee |
| B-4 | IGI report-to-stone verification process | Certifications |
| B-5 | Sample / memo terms (days, deposit, shipping responsibility) | Custom Cut |

### Group C — Contact and commercial terms

| ID | Gap | Pages affected |
|---|---|---|
| C-1 | For Jewelry Brands response standard (hours) | For Jewelry Brands |
| C-2 | WhatsApp / telephone number | Request a Quote JSON-LD |
| C-3 | Email address | Request a Quote JSON-LD |
| C-4 | Quote form URL | Request a Quote JSON-LD |

### Group D — JSON-LD @id canonical URLs (all 19 pages)

Every JSON-LD block has `"@id": "TODO(alvora): ______"`. These are the canonical page URLs. Once `CANONICAL_ORIGIN=https://www.alvoradiamonds.com` is set in Railway, these become `https://www.alvoradiamonds.com/about`, etc. They don't block rendering but they do affect structured-data quality.

---

## 6. answerSentence body-match check

No file has an `answerSentence` field. PAA pages in `llms-full.txt` use a `## Key takeaways` bullet list (3–5 sentences) in place of a single sentence. **Check skipped — field doesn't exist.**

If the implementation requires a single `answerSentence`, it needs to be either (a) added as a frontmatter field when splitting into individual files, or (b) taken as the first Key Takeaway bullet from each PAA page.

---

## 7. JSON-LD validation

**25/25 JSON-LD blocks in `llms-full.txt` are valid JSON. ✅**

All blocks parse without error. All contain `TODO(alvora)` in the `@id` field and several contain TODO placeholders in `PropertyValue` / `offers` / `ContactPoint` fields (covered under §5). No structural JSON errors.

`Homepage Trust and FAQ.md` has 1 additional `FAQPage` JSON-LD block — also valid. ✅

---

## 8. Internal markdown link audit

All internal links found and their validity against the declared routes:

| Link text | Destination | Valid? |
|---|---|---|
| `calibrated diamond layouts` | `/calibrated-diamond-layouts` | ✅ Route exists |
| `custom-cut diamonds` | `/custom-cut-diamonds` | ✅ Route exists |
| `certifications` | `/certifications` | ✅ Route exists |
| `for jewelry brands` | `/for-jewelry-brands` | ✅ Route exists |
| `matched pair diamonds` | `/matched-pair-diamonds` | ✅ Route exists |
| `melee diamonds` | `/melee-diamonds` | ✅ Route exists |
| `request a quote` | `/request-a-quote` | ✅ Route exists |
| `about` | `/about` | ✅ Route exists |
| `Precision lab-grown diamond wholesale supply` | `/precision-lab-grown-diamond-wholesale` | ❌ Route does not exist (appears at end of insight article §19) |
| `View the location on a map` | `TODO(alvora)` | ❌ Broken link — placeholder URL (in `Homepage Trust and FAQ.md:7`) |

**2 broken internal links.**

---

## 9. Dev dependencies

| Package | Version | Status |
|---|---|---|
| `playwright-core` | `^1.62.1` | ✅ Already present |
| `gray-matter` | `4.0.3` | ✅ Installed now |
| `react-markdown` | `10.1.0` | ✅ Installed now |
| `remark-gfm` | `4.0.1` | ✅ Installed now |

Installed via local pnpm (`node_modules/.bin/pnpm add -D …`). npm 11 crashes on this workspace due to pnpm symlinks — use the local binary going forward.

---

## 10. Summary — what must be resolved before implementation

| Priority | Issue | Action needed |
|---|---|---|
| 🔴 P0 | 5 insight article URLs in `llms-full.txt` are wrong — 3 duplicate product page paths | Fix the `- **URL:**` lines in `llms-full.txt` to match `llms.txt` |
| 🔴 P0 | No YAML frontmatter — `gray-matter` can't parse any file as-is | Either split `llms-full.txt` into 19 individual `.md` files with frontmatter, OR build a custom parser for the `- **Type:** / **URL:**` meta format |
| 🔴 P0 | `metaDescription` field missing from all content | Add to frontmatter or derive from first body paragraph |
| 🟡 P1 | 33 operational TODO items (groups A–C) | Akshay to fill in: growth method, MOQ, lead times, tolerances, contact details |
| 🟡 P1 | 19 JSON-LD `@id` TODOs | Set `CANONICAL_ORIGIN=https://www.alvoradiamonds.com` in Railway; update the content once set |
| 🟡 P1 | Broken link: `/precision-lab-grown-diamond-wholesale` | Fix to `/insights/sourcing-lab-grown-diamonds-from-surat` |
| 🟡 P1 | Broken link: `[View the location on a map](TODO(alvora))` | Fill in Google Maps URL |
| 🟢 P2 | `answerSentence` not present | Decide: add as frontmatter, or use first Key Takeaway bullet |
| 🟢 P2 | `Homepage Trust and FAQ.md` has 9 TODO items (GST, IEC, address, MOQ, memo, lead times) | These overlap with group A/B TODOs — fill once |

---

*End of report. No source files were modified. Awaiting instruction to proceed.*

# Alvora: SEO & GEO work summary

_Updated 25 September 2026. SEO = ranking on Google and Bing. GEO = being read, trusted and quoted by AI answers (ChatGPT, Google AI Overviews, Perplexity)._

---

## At a glance

| Area | Status |
|---|---|
| Page titles and descriptions | ✅ All 136 public pages have their own; a check blocks duplicates |
| Structured data (hidden labels Google reads) | ✅ Organisation, website, breadcrumbs, products, collections, articles |
| Pre-built pages for crawlers | ✅ All 136 pages; old ones are removed automatically |
| Sitemap, robots and AI guide (`llms.txt`) | ✅ List only live pages |
| Conversion tracking | ✅ Enquiries, consultations and trade line-sheet requests, with the landing page |
| Public "TODO" placeholders | ✅ Removed from all pages |
| Stock facts on public pages | ✅ Match the real stone list |
| Link previews (WhatsApp etc.) | ✅ Homepage photos, or each ring's own photo |
| Search Console and Bing | ⏳ Connect after launch (your step) |
| Live stone catalogue (`/availability`) open to Google and AI | ⏳ Your decision |
| Next money page (`/earrings`) | ⏳ Audit due |

---

## 1. SEO foundations

- **Titles and descriptions.** Every page has its own title and description. `scripts/validate-seo-meta.ts` checks all 136 routes on every build and fails if two match.
- **Structured data.** This is the hidden information that tells Google what a page is.
  - **Organisation and WebSite:** on every page.
  - **BreadcrumbList:** the page's place in the site, on every page.
  - **Product:** on each ring and earring page, with name, photos, price when set, and the centre-stone grade.
  - **ItemList:** on collection pages.
  - **Article:** on guides.
- **Pre-built pages.** Google and AI tools see the full page content straight away, not a loading screen. The build now also deletes snapshots of pages that no longer exist. Before this, 139 old snapshots could still have been served.
- **Sitemap and robots.** Only live pages are listed. A hidden piece drops out automatically, and comes back once it has photos.
- **Redirects.** `/pendants` forwards to `/necklaces`, so older links keep working.

## 2. Jewellery SEO

- **Site structure.**
  - Jewellery is the homepage; wholesale lives at `/trade`.
  - Collections: engagement rings, antique cuts, coloured stones, earrings, and necklaces & pendants.
  - One page per ring shape, for example `/engagement-rings/shape/oval`.
  - A product page for every piece.
- **Naming by search demand.** "Necklaces & Pendants" lives at `/necklaces` because "lab grown diamond necklace" gets about 4,400 searches a month, against 880 for "pendant" (Semrush, US).
- **Product pages.**
  - **Carat and grade:** 0.5–6 ct centre-stone choice with the grade E colour, VS1 clarity, Excellent cut.
  - **Search descriptions:** the grade appears in each ring's Google description, which helps searches like "2 carat E VS1 oval ring".
  - **Story:** a factual "Your centre stone" section: grown not mined, what E and VS1 mean, cut in Surat.
- **Honest wording, so Google and AI tools can trust the pages.**
  - Rounds say "Excellent cut". Fancy shapes say "Excellent polish and symmetry", because labs only grade cut on rounds.
  - No "eco-friendly" or "sustainable" claims, since advertising rules require proof.
  - "Wedding bands" was removed from the copy while none are on sale.
  - "A oval" was fixed to "An oval" on 51 pages.

## 3. Your SEO playbook, set up in `seo/`

| File | What it's for |
|---|---|
| `BRIEF.md` | The business, the buyers, what counts as a conversion, and the rules |
| `STATE.md` | Keyword data and baselines |
| `LOG.md` | Every SEO change, with why and what to measure |
| `WEEKLY_LOOP.md` | The weekly routine |
| `reports/2026-09-24-money-page.md` | The first four-pass money-page audit |

- **First bet: the marquise ring page.** It was researched and built, with a Dutch-marquise guide alongside. When the launch list was narrowed, those rings went off sale, so the page went back to the standard layout and the guide was unpublished. Both return automatically if those rings go live again.
- **Next bet: `/earrings`.** "lab grown diamond earrings" gets 9,900 searches a month with low competition (KD 9), and "stud earrings" gets 2,400 (KD 7). The page has 20 pieces, all priced.

## 4. GEO (AI search)

**Phase 1 (17 Sept):**
- Answer-first page openings, which AI tools like to quote.
- Shortened meta descriptions.
- WebSite and breadcrumb structured data.
- The live stone catalogue opened to crawlers.

**Problem found:** the site snapshot deployed on 23 Sept undid part of this work, and reintroduced problems AI tools would repeat. Fixed on 25 Sept:

- **Public "TODO: confirm…" notes removed from 7 pages:** About, Certifications, Melee, Custom cut, Matched pairs, Request a quote, and For jewelry brands. Unconfirmed details now read "confirmed in your quotation".
- **Unverified figures replaced.** "25+ years" and "10,000+ stones dispatched" became "3,000+ certified stones", which is counted from your stone list.
- **Placeholder values removed** from the About page's structured data (founding date and employee count were set to "TODO").
- **Stone grades corrected to match your stock.** The list has 3,185 stones: white colours D–G (with 4 exceptions), clarity IF–SI2 (mostly VVS2–VS1), cut mostly Ideal or Excellent. The Singapore page's wrong "D–J" is now "D–G".
- **The AI guide file (`llms.txt`)** lists only live pages.

**Still undone from phase 1, waiting on you:** the live stone catalogue (`/availability`) is blocked from Google and AI tools again. Reopening it is the strongest GEO proof of your inventory depth, and it lists no prices.

## 5. Link previews
- Homepage and jewellery pages show your four homepage photos side by side.
- Product pages show that ring's own photo.
- Trade pages keep the loupe image.
- All previews are JPEG, which WhatsApp and iMessage display reliably.

---

## What's next

| # | Step | Who |
|---|---|---|
| 1 | Deploy the latest work (`git pull` then `railway up`) | You |
| 2 | Connect Google Search Console and Bing Webmaster Tools; submit the sitemap | You, with my guidance |
| 3 | Decide whether to reopen `/availability` to Google and AI tools | You |
| 4 | Confirm every stone ships with an IGI report (or IGI/GIA), then add that line to product pages | You, then me |
| 5 | Four-pass audit and improvements on `/earrings` | Me |
| 6 | Add prices for the 45 June Rings pieces (priced pages convert and rank better) | You |
| 7 | Add Pooja photos, bringing 91 more pieces live | You, then me |
| 8 | 14 days after launch: record baselines in `STATE.md` and start the weekly loop | Me |

**How we'll measure:**
- Search Console impressions and positions for the earrings and ring-grade searches.
- The `jewellery_enquiry` and `consultation_request` events in Google Analytics, broken down by landing page.

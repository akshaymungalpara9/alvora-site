# SEO log

Append-only. Newest entry at the bottom. Never delete an entry.

---

## 2026-09-24: Setup and first bet (pre-launch)

**Done**
- Added named conversion events `jewellery_enquiry`, `consultation_request` and `trade_linesheet_request`, each with `landing_page` and `referrer_host` (GA4 + Umami). The landing page and referrer are also saved on each enquiry row and shown in `/admin/jewellery` and the CSV export.
- Ran keyword research (Semrush, US). Chose the money page `/engagement-rings/shape/marquise` with main query "vintage marquise engagement ring". Full reasoning: `reports/2026-09-24-money-page.md`.

**Decided**
- The site is pre-launch, so this cycle ships the best version of the money page and one supporting page together (the "zero to first page" path). The one-change-per-week rule starts after the 14-day post-launch baseline.

**Next**
- Launch. Then connect Google Search Console (Domain property) and Bing Webmaster Tools, and submit `/sitemap.xml`.
- Day 14 after launch: first baseline in STATE.md (impressions, clicks and position for the cluster; conversions by landing page).

## 2026-09-24: Launch version of the money page and supporting page (pre-launch)

**Shipped to the branch** (not live until deploy):
1. `/engagement-rings/shape/marquise`
   - Title: "Vintage & Dutch Marquise Engagement Rings, Lab-Grown | Alvora" (was "Marquise Lab-Grown Diamond Engagement Rings | Alvora").
   - H1: "Vintage & Dutch marquise engagement rings" (was "Marquise engagement rings").
   - Answer-first intro, plus three question sections: vintage, Dutch vs classic, cost.
   - Link to the guide above the products.
2. The 8 Dutch-marquise rings are renamed "… Dutch Marquise Heritage" with new URLs (…-dutch-marquise-heritage). Their descriptions now name the real detailing, and 4 classic marquise descriptions were corrected too.
3. Product breadcrumbs now go Home › Engagement rings › *Shape* › Piece (page and BreadcrumbList schema), giving every engagement ring a link back to its shape page.
4. New supporting page `/guides/dutch-marquise-vs-marquise` (Article + Breadcrumb schema). It links to the money page twice and shows 8 marquise rings. A footer link reaches it from every jewellery page.
5. Removed one claim I couldn't verify (that every marquise is set with covered points). It now asks the customer to confirm prong style in the quote.

**Why:** see `reports/2026-09-24-money-page.md` §6.

**Measure after launch:**
- Impressions and position for the STATE.md cluster on both URLs.
- `jewellery_enquiry` and `consultation_request` events where `landing_page` is the marquise page or the guide.

## 2026-09-25: Pendants collection becomes "Necklaces & Pendants"

**Changed:** `/pendants` → `/necklaces`, with the old address forwarding to the new one. The label is now "Necklaces & Pendants" in the menus and breadcrumbs, and "Necklaces & pendants" as the H1 and in the trade catalogue tab.

**Why:** Semrush (US, 2026-09-24) shows "lab grown diamond necklace" at 4,400/mo vs "lab grown diamond pendant" at 880/mo. The owner asked to keep necklaces and pendants in one collection. Pre-launch, so no baseline is affected.

## 2026-09-25: Launch set narrowed; the money page needs re-picking

**Changed (owner decision):** live pieces = launch list ∩ {all June Rings, all Pooja Diamond, Carat Diamonds earrings only}. That's 156 pieces (118 rings, 6 bands, 32 earrings, all 32 earrings priced), set in `data/jewellery/launch.json`.

**Effect on SEO:**
- All 8 Dutch-marquise rings were Carat rings and are no longer live. The marquise page now has 7 rings (4 priced), so its vintage/Dutch copy is switched off (it would have promised rings we don't show).
- `/guides/dutch-marquise-vs-marquise` is unpublished: removed from the sitemap and footer, and the route now 404s. Both stay in `shared/jewellery/editorial.ts` and come back automatically if Dutch-marquise pieces go live again.
- Necklaces & Pendants has 0 live pieces and hides itself.

**Next bet:** `/earrings` for "lab grown diamond earrings" (9,900/mo, KD 9, commercial) and "lab grown diamond stud earrings" (2,400, KD 7). It has 32 pieces, all priced. See STATE.md backup candidates; a four-pass checkup is due before launch.

## 2026-09-26: 151 new rings complete the June Rings catalogue import

**Changed:** 151 pieces added from the remaining source folders (ALV-R-0141 to ALV-R-0291): cushion, elongated cushion, oval, round, emerald, pear, marquise, radiant, asscher, princess, trillion, baguette, moval, roval, old-mine and old-euro cuts across solitaire, bezel, east-west, three-stone, five-stone, toi-et-moi, halo, signet and heritage styles, including champagne, green, blue, pink, yellow and ruby stones. Engagement-ring pieces pick up the rupee price table, the 0.5-6 ct centre-stone choice and the E/VS1/Excellent copy; signets and pieces with unknown shapes stay Price on request. Five source folders were skipped as duplicates of live or new pieces, six likely-same-design pairs were kept as separate pieces pending owner review, and three band designs classify as rings until a bands wave exists. Shapes that could not be read from the folder name (portrait cuts, geo cut, octagon, cabochon, five-stone) are blank until confirmed against the photos.

**Why:** the import brings the catalogue from 45 to 196 rings and gives the shape, colour and style landing pages real depth.

**Measure:** impressions and clicks for the new shape and colour landing combinations; product-page coverage in Search Console once indexed.

## 2026-09-25: Launch: only pieces with photos are shown

**Changed:** a launch piece is shown only once it has at least one photo (`isShown()` in `shared/jewellery/catalog.ts`). At launch, 65 of 156 are shown: 45 June Rings rings and 20 Carat earrings. The 91 Pooja pieces (all 6 bands among them) stay hidden until their photos are added. The sitemap, `llms.txt` and prerendered snapshots list only shown pages (136 routes). The build now deletes snapshots of routes that no longer exist.

**Copy:** "engagement rings, wedding bands and earrings" became "engagement rings and earrings" on the homepage, the meta descriptions, the trade meta and `llms.txt`, because no bands are on sale. Revert this when the Pooja bands go live.

**Effect on the next bet:** `/earrings` now has 20 pieces (Carat only), not 32. Re-check how many are priced before the four-pass checkup.

**Measure from launch day:** connect Search Console and Bing, then record baseline impressions and positions for the earrings cluster in STATE.md.

## 2026-09-25: Centre-stone grade on every engagement ring

**Changed:** engagement rings (and necklaces/pendants, when live) offer 0.5–6 ct centre stones at the owner-confirmed grade: E colour, VS1 clarity, Excellent cut. For fancy shapes this is worded as "Excellent polish and symmetry". Each product page adds a "Your centre stone" section: a shape story, grown-not-mined, what E and VS1 mean, and cut in Surat. The meta description and Product JSON-LD description now carry the grade.

**Why:** people searching for specific grades ("E VS1 lab grown oval ring", "2 carat lab grown engagement ring") and AI answers comparing grades need the spec stated plainly on the page.

**Measure:** impressions for queries containing carat sizes or "E VS1" on product URLs.

## 2026-09-26: Necklaces & Pendants collection live (16 pieces)

**Shipped**
- 16 pendant pieces (ALV-P-0001 to 0017, minus 0004) went live with 4 brand photos each (ivory backdrop, Alvora watermark). The Necklaces & Pendants nav tab, collection route, cards and product pages surfaced automatically once photos were attached.
- Product pages show metal (14K/18K, yellow/white/rose) and centre-stone carat (0.5 to 6 ct) enquiry options, like the engagement rings; prices stay on request, like the earrings.
- ALV-P-0004 (pear) and ALV-P-0018 (cushion) stay hidden: no matching photo sets exist in the source material.

**Data repair**
- The source photo folders' code prefixes did not match the catalogue: 12 of 17 sets sat under a code whose named design did not match the photos. Every set was re-assigned by visual design match (shape, motif and metal, corroborated by the descriptive folder slugs, which agree with the re-assigned photos in all 16 cases). Product names and slugs were already correct; only the photo attachment changed. One spare cushion photo set (rose gold) has no catalogue home and was left out, held for owner confirmation.

**Verification**
- Visual check of every photo set (4 photos x 17 sets) before and after the remap; product-page check (desktop + phone) confirms the Elowen Emerald Pendant page shows emerald photos, carat and metal selectors, and "Price on request".
- Gates: tsc clean, validate-seo-meta 325 routes, vitest identical to main baseline, full build with prerender snapshots committed.

**Next**
- Owner to confirm whether a pear pendant photo set exists (ALV-P-0004) and whether the spare rose-gold cushion set is ALV-P-0018 Viola.

## 2026-09-26: GEO phase 1 part 2 - evidence labels, specification template, prompt panel

**Shipped**
- Evidence labels on the claim-bearing sections of the 8 volatile articles (price, duty, certification, manufacturer comparisons): 29 markers reading "Evidence: Verified public evidence", "Evidence: Alvora process" or "Evidence: Unknown - confirm at quote", rendered as small markers via a paragraph-level component in the article renderer.
- New page /calibrated-parcel-specification-template: a ready-to-copy eight-field specification template for calibrated parcels, linked from the spec checklist article (worked-example section) and from the quote form's message field.
- seo/geo-prompt-panel.md: 36 fixed monthly prompts in four groups (consumer, trade sourcing, technical specialist, brand/entity) with recording fields and a run protocol. First monthly run scheduled.

**Verification**
- Gates: tsc clean, validate-seo-meta 326 routes, vitest identical to main baseline (12 pre-existing failures) plus the llms.txt drift guard passing, full build with prerender snapshots committed.
- Visual check: specification template page and a labelled article on desktop and phone.

**Next**
- Monthly prompt-panel run (first run in the October cycle); record results in the panel's sheet and summarise here.
- Phase 1 items 3, 4 and 6 of the plan remain owner-gated (redacted documents, off-site outreach, company facts).

## 2026-09-26: Readability repair (white-on-cream text) and DRAFT-VALUE removal

**Done**
- Owner reported unreadable white text on the live site. Traced to the 27 August light-editorial reskin, which moved page backgrounds to the light canvas but left dark-era text colours on the SpecialtyPageShell family: white hero titles, light-grey hero copy, and white body text on the cream `.specialty-section-ink` sections. Affected every specialty page, all markdown product pages (including the new calibrated-parcel-specification-template), and the contact hero since 27 August.
- Fixed site-wide: specialty hero, copy and section colours pinned to the light-surface ink scale; contact hero; referral page H1; catalogue pagination buttons; availability summary; weak mid-greys raised to the standard secondary ink; markdown body links styled; form labels and inputs on the contact page's intentionally dark columns restored to dark-panel values; hero-maker-line inside light specialty heroes pinned to the secondary ink; an inline `color: var(--paper)` removed from Certifications.tsx; inline `#9fa19a` raised to `var(--paper-dim)` in SingaporeBlocks.
- Removed 24 literal `DRAFT-VALUE` HTML comments (unconfirmed tolerance, MOQ and lead-time values) from 8 product pages and the matching invented values from two pages' JSON-LD. Bullets now state "On request" with confirmation at quotation, per the no-invented-terms rule.
- Verification: scripted contrast audit over all 326 prerendered routes in headless Chromium (text elements below 2.0 contrast flagged; remaining flags are text over photos, the brand gold eyebrow, and a deliberately invisible form honeypot), plus visual screenshots at 1280 and 390 of the template page, calibrated-diamond-layouts, certifications, about, contact, singapore, request-a-quote and availability.

**Decided**
- The cream `.specialty-section-ink` band stays as a design alternation; only its text colour was wrong.
- The brand gold eyebrow (#c7a75a on cream, about 2.1:1) is a deliberate site-wide accent used on owner-approved pages; left unchanged.
## 2026-09-26: Catalogue lead-photo coherence pass (all 232 live pieces)

**Done**
- Re-processed every live catalogue lead card (rings, earrings, pendants, bands) to one standard: piece detected and cropped from the original full-resolution source, composited centred on the ivory backdrop with the Alvora watermark at a fixed product-to-frame ratio (longest side 0.78 of frame, subjectFill 0.78), light sharpen (sigma 0.5), exported at 2x card size (1400px lead plus 600px thumb).
- 228 of 232 live pieces shipped to the new standard. Real-ESRGAN (realesr-general-x4v3) upscaling used on 58 pieces where the tight crop would have been too low-resolution; every upscale visually compared against its original for invented detail before shipping. 17 lifestyle leads with unusable primary photos were recomposed from a different photo in the same source folder (original lead stays in the gallery); 3 pieces with only AI-generated lead images were normalised from those sources.
- 4 pieces stay as-is (ALV-R-0213, ALV-R-0214, ALV-R-0215, ALV-R-0219): on-hand-only sources where subject isolation either keeps the hand or drops the band, which would misrepresent the piece. Listed for the owner.
- Lifestyle and styled shots remain untouched as secondary gallery photos; only lead card images changed. No partner names, SKUs or original filenames in public output.

**Verification**
- Full-catalogue contact sheets (6 sheets, all 232 cards) reviewed visually for centring, fill consistency, backdrop and watermark coherence before merge.
- Gates: tsc clean, validate-seo-meta 326 routes, vitest identical to main baseline (12 pre-existing failures), full build with prerender snapshots.

**Next**
- Owner to review the 4 stays-as-is pieces and supply studio photos if they should join the standard.

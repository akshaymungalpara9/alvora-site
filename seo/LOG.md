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

## 2026-09-25: Launch: only pieces with photos are shown

**Changed:** a launch piece is shown only once it has at least one photo (`isShown()` in `shared/jewellery/catalog.ts`). At launch, 65 of 156 are shown: 45 June Rings rings and 20 Carat earrings. The 91 Pooja pieces (all 6 bands among them) stay hidden until their photos are added. The sitemap, `llms.txt` and prerendered snapshots list only shown pages (136 routes). The build now deletes snapshots of routes that no longer exist.

**Copy:** "engagement rings, wedding bands and earrings" became "engagement rings and earrings" on the homepage, the meta descriptions, the trade meta and `llms.txt`, because no bands are on sale. Revert this when the Pooja bands go live.

**Effect on the next bet:** `/earrings` now has 20 pieces (Carat only), not 32. Re-check how many are priced before the four-pass checkup.

**Measure from launch day:** connect Search Console and Bing, then record baseline impressions and positions for the earrings cluster in STATE.md.

## 2026-09-25: Centre-stone grade on every engagement ring

**Changed:** engagement rings (and necklaces/pendants, when live) offer 0.5–6 ct centre stones at the owner-confirmed grade: E colour, VS1 clarity, Excellent cut. For fancy shapes this is worded as "Excellent polish and symmetry". Each product page adds a "Your centre stone" section: a shape story, grown-not-mined, what E and VS1 mean, and cut in Surat. The meta description and Product JSON-LD description now carry the grade.

**Why:** people searching for specific grades ("E VS1 lab grown oval ring", "2 carat lab grown engagement ring") and AI answers comparing grades need the spec stated plainly on the page.

**Measure:** impressions for queries containing carat sizes or "E VS1" on product URLs.

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

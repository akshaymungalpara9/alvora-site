# Money page decision and four-pass checkup: 2026-09-24

**Verdict:** bet on `/engagement-rings/shape/marquise` for the query cluster led by **"vintage marquise engagement ring"**, with a new supporting guide, `/guides/dutch-marquise-vs-marquise`.

Status: pre-launch. There are no Search Console or conversion baselines yet, so the choice rests on search demand, difficulty, what the search results reward, and what we can sell today.

---

## 1. Candidates and calls

Source for every volume and KD figure: Semrush keyword overview, US database, 2026-09-24 ([batch 1](https://www.semrush.com/analytics/keywordoverview/?db=us&q=lab+grown+diamond+engagement+rings), [batch 2](https://www.semrush.com/analytics/keywordoverview/?db=us&q=vintage+marquise+engagement+ring)).

| Candidate page | Main query | Vol | KD | Pieces (priced) | Call | Reason |
|---|---|---|---|---|---|---|
| `/engagement-rings/shape/marquise` | vintage marquise engagement ring | 1,300 | 6 | 15 (12) | **Keep** | Winnable, high order value, and most pieces show a price, so the path to enquiry is clear. |
| `/earrings` | lab grown diamond earrings | 9,900 | 9 | 12 (12) | Keep, as the next bet | Bigger demand but lower order value; [top 10](https://www.semrush.com/analytics/keywordoverview/?db=us&q=lab+grown+diamond+earrings) includes Forbes and Amazon. |
| `/engagement-rings/shape/elongated-cushion` | elongated cushion engagement ring | 1,300 | 2 | 5 (0) | Keep once fixed | Needs prices first: 0 of 5 are priced. The partner brand ranks #7 with the same designs ([SERP](https://www.semrush.com/analytics/keywordoverview/?db=us&q=elongated+cushion+engagement+ring)). |
| `/engagement-rings/shape/old-mine` | old mine cut diamond ring | 2,400 | 8 | 3 (0) | Keep once fixed | Needs prices, and there are only 3 pieces. |
| `/engagement-rings` | lab grown diamond engagement rings | 22,200 | 36 | 65 | Drop for now | Too hard for a new domain with no backlinks. |
| `/engagement-rings/shape/marquise` | marquise engagement ring (head term) | 14,800 | 27 | n/a | Drop this query | [Top 10](https://www.semrush.com/analytics/keywordoverview/?db=us&q=marquise+engagement+ring) is Zales, Kay, Tacori and Gabriel. Target the long tail instead. |

## 2. Pass 1: can Google reach it?
- ✅ The route renders, and the prerendered snapshot contains the H1 and all 15 product names (`prerendered/engagement-rings-shape-marquise.html`, 52 KB).
- ✅ The page is in `scripts/publicRoutes.json`, so it's in the sitemap. It is `index,follow` with a self-canonical.
- ⚠️ Speed (PageSpeed Insights, mobile): **missing**. The page isn't public yet, so measure it on launch day.

## 3. Pass 2: what do the winners do?
Direct page reading was blocked from this environment, so these findings come from Semrush SERP lists and web-search excerpts only.

- Every one of the top 10 for "vintage marquise engagement ring" is a **marquise collection page** or a Pinterest/Reddit/journal page ([SERP](https://www.semrush.com/analytics/keywordoverview/?db=us&q=vintage+marquise+engagement+ring)). Examples: [Felicegals](https://felicegals.com/collections/marquise), [Austen & Blake vintage marquise](https://www.austenblake.us/engagement-rings/vintage/marquise), [Melanie Casey](https://www.melaniecasey.com/collections/marquise-cut-engagement-rings), [Brilliant Earth vintage marquise](https://www.brilliantearth.com/engagement-rings/vintage/marquise/). **Search intent matches our page type.**
- Web-search excerpts on vintage marquise talk about milgrain, filigree and detailed galleries, plus the cut's 18th-century origin ([VRAI journal](https://www.vrai.com/journal/post/vintage-inspired-marquise-engagement-rings)). **Our page doesn't mention vintage detailing at all.**
- "dutch marquise ring" (1,600/mo) is won by Dutch-marquise collections and guides: [Stienhardt](https://stienhardt.com/collections/dutch-marquise-diamond-engagement-rings/), [Grown Brilliance](https://www.grownbrilliance.com/3-3-4-ctw-dutch-marquise-lab-grown-diamond-vintage-side-stone-engagement-ring-14k-yellow-gold/pid/RIGAJR07563DM3-GY3), [Diamond Rensu](https://diamondrensu.com/collections/dutch-marquise-diamond-rings) ([SERP](https://www.semrush.com/analytics/keywordoverview/?db=us&q=dutch+marquise+ring)). **8 of our 15 marquise rings are Dutch marquise, but the page and product names never say so.**
- The difference guides agree: a Dutch marquise has straight, angled sides forming an elongated hexagon, while a classic marquise has continuous curves ([Stienhardt guide](https://stienhardt.com/blogs/education/what-is-a-dutch-marquise-diamond), [Krikawa](https://www.krikawa.com/blog/post/the-dutch-marquise-engagement-ring-guide), [Diamond Rensu comparison](https://diamondrensu.com/blogs/comparisons/dutch-marquise-cut-vs-marquise-cut-key-differences-explained)).
- The partner that makes these designs also ranks for "dutch marquise ring" with the same designs. Expect Google to treat identical product photos as near-duplicates, so the watermark and ivory frame help, and our own photography would help more.

## 4. Pass 3: can AI answers use it?
- ❌ The H1 is "Marquise engagement rings". It doesn't match how people ask (vintage, Dutch, lab-grown).
- ❌ There's no opening sentence that answers the query, and no section that makes sense on its own.
- ❌ Product names say "Heritage" but not "Dutch marquise", "milgrain" or "filigree", the words buyers search.
- ✅ The business details (Surat, lab-grown, enquiry-first) are consistent across the site.
- ⚠️ Off-site mentions: there's a [Reddit thread asking for an antique-style marquise lab diamond](https://www.reddit.com/r/EngagementRings/comments/x8svnz/looking_for_an_antiquestyle_marquise_lab_diamond/) ranking #4. Worth joining honestly **after** launch, disclosing that you're the seller.

## 5. Pass 4: from page to conversion
- ✅ 12 of 15 pieces show a "From" price. Every card leads to a product page with options and an enquiry form.
- ✅ Named conversion events now exist, carrying the landing page.
- ⚠️ The only CTA on the collection page itself is at the bottom. Someone unsure between classic and Dutch marquise has nowhere to go but the consultation band.
- ⚠️ Product breadcrumbs skip the shape page, so there's no internal link from each marquise ring back to the money page.

## 6. What ships in this pre-launch cycle
Because nothing is live yet, these ship together as the launch version. The one-change rule starts after the baseline.

1. **Marquise page copy:** a title and H1 aimed at the cluster, an answer-first intro, and three short question-led sections (what makes it vintage, classic vs Dutch, what it costs), linking to the guide and consultation.
2. **Product accuracy:** the 8 Dutch-marquise rings are named and described as Dutch marquise, with their real detailing (milgrain, filigree, leaf prongs, kite side stones).
3. **Internal links:** product breadcrumbs go Home › Engagement rings › *Shape* › Piece.
4. **Supporting page:** `/guides/dutch-marquise-vs-marquise`, an answer-first guide that links to the money page and shows the Dutch pieces.
EOF
echo ok
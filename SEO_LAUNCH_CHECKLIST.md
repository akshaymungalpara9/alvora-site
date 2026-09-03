# SEO Launch Checklist — Alvora Diamonds

**Domain**: https://www.alvoradiamonds.com  
**Complete after Railway deployment is live on the custom domain.**

---

## 0. Pre-flight — confirm before opening Search Console

- [ ] `https://www.alvoradiamonds.com/` returns HTTP 200 (not a Railway preview URL)
- [ ] `https://www.alvoradiamonds.com/sitemap.xml` returns HTTP 200 with `Content-Type: application/xml`
- [ ] `https://www.alvoradiamonds.com/robots.txt` contains `Sitemap: https://www.alvoradiamonds.com/sitemap.xml`
- [ ] `curl -s https://www.alvoradiamonds.com/ | grep 'canonical'` shows `href="https://www.alvoradiamonds.com/"` (not a Railway subdomain)
- [ ] GoDaddy bare-domain forward (`alvoradiamonds.com` → `www.alvoradiamonds.com`) is active and returns 301

**Railway variable to add (if not already set):**
```
CANONICAL_ORIGIN = https://www.alvoradiamonds.com
```
Without this, canonical tags and the sitemap will reflect the Railway host header instead of www.

---

## 1. Google Search Console

### 1a. Add and verify the property

1. Go to **https://search.google.com/search-console**
2. Click **Add property** → choose **URL prefix**
3. Enter: `https://www.alvoradiamonds.com/`
4. Choose **HTML tag** verification method
5. Copy the `<meta name="google-site-verification" content="…">` tag
6. Add it to `server/seoInjection.ts` inside `injectSeoIntoHtml`, just before `</head>`:
   ```typescript
   `<meta name="google-site-verification" content="PASTE_VALUE_HERE" />`,
   ```
7. Rebuild and deploy, then click **Verify** in Search Console

> Alternative: use the DNS TXT record method via GoDaddy — no code change needed.

### 1b. Submit the sitemap

1. In Search Console, go to **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Click **Submit**
4. Verify status shows **Success** (may take a few minutes)

**Sitemap URL**: `https://www.alvoradiamonds.com/sitemap.xml`

### 1c. Request indexing of priority pages

For each URL below, paste it into the **URL Inspection** tool (top search bar) and click **Request Indexing**. Google allows ~12 manual requests per day — start with these:

```
https://www.alvoradiamonds.com/
https://www.alvoradiamonds.com/calibrated-diamond-layouts
https://www.alvoradiamonds.com/matched-pair-diamonds
https://www.alvoradiamonds.com/for-jewelry-brands
https://www.alvoradiamonds.com/request-a-quote
https://www.alvoradiamonds.com/insights
```

Then queue the remaining product pages and insight articles over the following days:

```
https://www.alvoradiamonds.com/fr
https://www.alvoradiamonds.com/it
https://www.alvoradiamonds.com/us
https://www.alvoradiamonds.com/custom-cut-diamonds
https://www.alvoradiamonds.com/melee-diamonds
https://www.alvoradiamonds.com/certifications
https://www.alvoradiamonds.com/about
https://www.alvoradiamonds.com/insights/are-lab-grown-diamonds-real-diamonds
https://www.alvoradiamonds.com/insights/best-lab-grown-diamond-manufacturer-for-your-need
https://www.alvoradiamonds.com/insights/is-a-lab-grown-diamond-worth-it
https://www.alvoradiamonds.com/insights/lab-grown-diamond-price-per-carat
https://www.alvoradiamonds.com/insights/lab-grown-diamond-wholesale-how-to-buy
https://www.alvoradiamonds.com/insights/largest-lab-grown-diamond-manufacturers-india
https://www.alvoradiamonds.com/insights/12-questions-to-ask-a-manufacturer
https://www.alvoradiamonds.com/insights/calibrated-diamond-layouts-explained
https://www.alvoradiamonds.com/insights/cvd-vs-hpht-lab-grown-diamonds
https://www.alvoradiamonds.com/insights/matched-pairs-vs-melee-vs-layouts
https://www.alvoradiamonds.com/insights/sourcing-lab-grown-diamonds-from-surat
```

> Google typically processes indexing requests within 24–72 hours.

### 1d. Add GoDaddy as a second property (optional but recommended)

Add `https://alvoradiamonds.com/` (without www) as a separate URL-prefix property and verify it. This lets you see any traffic that hits the bare domain before GoDaddy's forward kicks in, and confirm the 301 redirect is working.

---

## 2. Bing Webmaster Tools

### 2a. Add and verify the property

1. Go to **https://www.bing.com/webmasters**
2. Click **Add a site**
3. Enter: `https://www.alvoradiamonds.com/`
4. Choose **XML file** or **Meta tag** verification
   - Meta tag: same approach as Google — add to `seoInjection.ts`
   - XML file: drop the file in `client/public/` (it'll be served as a static asset)
5. Click **Verify**

> Tip: Bing also supports **Import from Google Search Console** — if GSC is verified first, use this to skip re-verification.

### 2b. Submit the sitemap

1. In Bing Webmaster, go to **Sitemaps**
2. Click **Submit sitemap**
3. Enter: `https://www.alvoradiamonds.com/sitemap.xml`
4. Click **Submit**

**Sitemap URL**: `https://www.alvoradiamonds.com/sitemap.xml`

### 2c. Request URL indexing

In **URL Submission** (Bing Webmaster sidebar), submit:

```
https://www.alvoradiamonds.com/
https://www.alvoradiamonds.com/fr
https://www.alvoradiamonds.com/it
https://www.alvoradiamonds.com/us
```

Bing processes manual submissions faster than Google — often same day.

---

## 3. Link GSC to GA4

1. In GSC → **Settings** → **Associations** → Link Google Analytics property
2. In GA4 → **Admin** → **Product links** → Search Console → New link → select Alvora property
3. After 48 h, organic search data appears in GA4 under **Acquisition → Search Console**

---

## 4. Future sitemap maintenance

The canonical route list lives in **`scripts/publicRoutes.json`** — the single source of truth used by both the sitemap generator (`server/publicSeoRoutes.ts`) and the prerender script (`scripts/prerender.mjs`).

| Trigger | Action |
|---|---|
| New indexable page added | Add the path to `scripts/publicRoutes.json`; add per-route metadata to `ROUTE_META` in `server/publicSeoRoutes.ts`; add SEO head injection to `server/seoInjection.ts` |
| New locale (e.g. `/de`) added | Add path to `publicRoutes.json`; add to `HOME_ALTERNATES` and `ROUTE_META` in `publicSeoRoutes.ts`; add locale metadata to `publicSeo.ts` and `seoInjection.ts` |
| Page removed or moved | Remove path from `publicRoutes.json`; add a 301 redirect in the Express server |
| Major content rewrite | `lastmod` is set to the build date automatically — redeploy to update it |

---

## 5. Optional — structured data testing

After deployment, test these URLs in Google's Rich Results Test:

- `https://www.alvoradiamonds.com/` — should find Organization + LocalBusiness JSON-LD
- Fill in the TODO placeholders in `server/seoInjection.ts` (domain, address, phone, email, logo, social URLs) before running the test

**Rich Results Test**: https://search.google.com/test/rich-results  
**Schema Markup Validator**: https://validator.schema.org/

---

---

## 6. GA4 setup and Search Console linking

### 6a. Create the GA4 property

1. Go to **https://analytics.google.com** → Admin (gear icon, bottom left)
2. Click **Create property** → enter "Alvora Diamonds", timezone = India (IST), currency = USD
3. Click **Next** → Business size: Small; Industry: Shopping → **Create**
4. Choose **Web** as the platform → enter `https://www.alvoradiamonds.com` and stream name "Alvora www"
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### 6b. Add VITE_GA4_MEASUREMENT_ID to Railway

In Railway, add the variable:
```
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```
Replace `G-XXXXXXXXXX` with the Measurement ID from step 6a. Redeploy after saving.

> The GA4 script is loaded only when this variable is present. It uses Consent Mode with `analytics_storage: 'denied'`, so no `_ga` / `_ga_*` cookies are set and no consent banner is needed.

### 6c. Verify GA4 is firing (DebugView)

1. In GA4 → Admin → **DebugView**
2. Open `https://www.alvoradiamonds.com` in a browser
3. Click the WhatsApp floating button → you should see a `whatsapp_click` event appear in DebugView within a few seconds
4. Submit the `/request-a-quote` form → `rfq_submit` event should appear
5. Scroll to >60% of an insights article → `article_read` event should appear

### 6d. Link GA4 to Google Search Console

1. In **Google Search Console** → select the Alvora property → Settings → **Associations**
2. Click **Associate** → find the GA4 property "Alvora Diamonds" → confirm
3. In **GA4** → Admin → **Product links** → Search Console → **Link** → select the Alvora GSC property → **Next** → **Submit**
4. After 48 hours, organic search data appears in GA4 under **Acquisition → Search Console → Queries**

> This linking gives you keyword-level data (impressions, clicks, CTR, position) alongside conversion events (whatsapp_click, rfq_submit) in a single GA4 report.

### 6e. Confirm cookie-free configuration (ongoing)

The GA4 property is initialised with Consent Mode `analytics_storage: 'denied'`. Verify after any GA4 config change:

```bash
# In a browser DevTools console on the live site:
document.cookie  # must be empty string ""
```

If cookies appear, re-check the `initGA4()` call in `client/src/lib/ga4.ts` and redeploy.

---

*This checklist was generated on 2026-09-01 for the initial launch of alvoradiamonds.com.*

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

For each URL below, paste it into the **URL Inspection** tool (top search bar) and click **Request Indexing**:

```
https://www.alvoradiamonds.com/
https://www.alvoradiamonds.com/fr
https://www.alvoradiamonds.com/it
https://www.alvoradiamonds.com/us
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

## 3. Future sitemap maintenance

| Trigger | Action |
|---|---|
| First insights article published | Remove `noindex` from `/insights` route in `server/seoInjection.ts`; add the article slug to `SITEMAP_ENTRIES` in `server/publicSeoRoutes.ts` |
| New locale (e.g. `/de`) added | Add to `HOME_ALTERNATES` and `SITEMAP_ENTRIES` in `publicSeoRoutes.ts`; add metadata to `publicSeo.ts` and `seoInjection.ts` |
| Product/category pages added | Add their paths to `SITEMAP_ENTRIES` with appropriate `changefreq` and `priority` |
| Major content rewrite | `lastmod` updates automatically from `new Date()` at request time — no action needed |

---

## 4. Optional — structured data testing

After deployment, test these URLs in Google's Rich Results Test:

- `https://www.alvoradiamonds.com/` — should find Organization + LocalBusiness JSON-LD
- Fill in the TODO placeholders in `server/seoInjection.ts` (domain, address, phone, email, logo, social URLs) before running the test

**Rich Results Test**: https://search.google.com/test/rich-results  
**Schema Markup Validator**: https://validator.schema.org/

---

*This checklist was generated on 2026-09-01 for the initial launch of alvoradiamonds.com.*

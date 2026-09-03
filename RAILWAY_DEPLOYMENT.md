# Railway deployment for Alvora

The authoritative source for the deployed Alvora site is the project root containing `package.json`, `client/`, `server/`, `drizzle/`, and `shared/`. In Railway, set the service root directory to this project root. Do not deploy the older `website/` tree or a nested directory from the ZIP.

## Build and start

Use the following commands in Railway → Service → Settings → Build & Deploy:

```text
Build command: pnpm install --frozen-lockfile && pnpm build
Start command: pnpm start
```

`pnpm build` runs these steps in sequence:
1. `vite build` — compiles the React SPA into `dist/public/`
2. `cp scripts/publicRoutes.json dist/publicRoutes.json` — copies the route list for the server
3. `esbuild server/_core/index.ts … --outdir=dist` — compiles the Express server to `dist/index.js`
4. `npx playwright install --with-deps chromium` — downloads Playwright's pinned Chromium and installs its system libraries via apt. This is required for the prerender step and is more reliable than the `chromium-browser` apt package, which is a non-functional snap meta-package on Ubuntu 22.04.
5. `node scripts/prerender.mjs` — headlessly renders all public routes into `dist/prerendered/`. The Express server injects the right snapshot into every response at runtime so crawlers see real body content, not an empty `<div id="root"></div>`.

`pnpm start` runs `node dist/index.js`. On startup the server reads `dist/prerendered/manifest.json` and logs how many snapshots were loaded. If zero are loaded, the prerender step failed silently — check the build logs for `[prerender] Chromium binary not found`.

The application listens on Railway's injected `PORT`.

## Required Railway variables

### Critical — set before first deploy

```text
NODE_ENV=production
CANONICAL_ORIGIN=https://www.alvoradiamonds.com
```

`CANONICAL_ORIGIN` controls what appears in `<link rel="canonical">`, the XML sitemap, and `robots.txt`. Without it those values reflect the Railway-assigned preview hostname (e.g. `alvora-production.up.railway.app`) instead of `www.alvoradiamonds.com`. The server logs a startup warning if this variable is missing in production.

### Database

```text
DATABASE_URL=<MySQL/TiDB connection string for the active Alvora availability snapshot>
JWT_SECRET=<long random session secret>
```

### Email delivery (Resend)

```text
RESEND_API_KEY=<Resend API key>
LEAD_ALERT_TO=<internal email address for lead alert notifications>
ALVORA_EMAIL_FROM=Alvora Diamonds <onboarding@resend.dev>
```

### WhatsApp

```text
VITE_ALVORA_WHATSAPP_NUMBER=<international WhatsApp number, e.g. 919876543210>
```

### Analytics (optional)

```text
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

GA4 is loaded only when this variable is set. It uses Consent Mode with `analytics_storage: 'denied'`, so no `_ga` / `_ga_*` cookies are written and no consent banner is required. See SEO_LAUNCH_CHECKLIST.md §6 for setup steps.

### Manus / protected admin (if applicable)

```text
BUILT_IN_FORGE_API_URL=<Manus Forge API base URL>
BUILT_IN_FORGE_API_KEY=<Manus Forge API key>
VITE_APP_ID=<Manus OAuth application ID>
OAUTH_SERVER_URL=<Manus OAuth server URL>
OWNER_OPEN_ID=<owner identity>
ALVORA_EARLY_ACCESS_ENABLED=false
```

Do not copy values from the Manus environment blindly. Use Railway's Variables panel and keep secrets out of GitHub and ZIP archives.

## Database setup

The active public catalogue is not reconstructed from the small legacy `availability_seed.sql` file. It is read from the current managed database snapshot, including the certified no-price core and STATEMENT collections. Connect Railway to that database through `DATABASE_URL` and apply the checked-in Drizzle migrations only when the target database is intended to host this project. Do not seed sample or legacy inventory over the active snapshot.

If Railway is intended to use a new database, the current live catalogue must be imported through the protected availability import workflow or a separately reviewed migration. Without a database containing the active availability rows, `/availability` can render its shell but cannot show the live stone cards or counts.

## Why the hero images are bundled

The four brand and workshop images are now served from `client/public/assets/` and referenced as `/assets/*.webp`. They no longer depend on the Manus-only `/manus-storage/` proxy, so the hero and supporting imagery load on Railway without Manus Forge storage credentials. The supplied catalogue media and certificate links remain governed by their source URLs and the public certificate/privacy rules.

## Post-deploy checks

After deployment:

1. Check Railway build logs for `[prerender] All 33 routes snapshotted.` — if you see `Chromium binary not found` instead, the prerender step failed and crawlers will see an empty body.
2. Check Railway runtime logs for `Loaded 33 prerendered snapshot(s)` on startup.
3. Run: `curl -A "Googlebot" -s https://www.alvoradiamonds.com/ | grep 'id="root"'` — the root div should contain real HTML content, not be empty.
4. Verify the following URLs return HTTP 200:

```text
https://www.alvoradiamonds.com/
https://www.alvoradiamonds.com/sitemap.xml
https://www.alvoradiamonds.com/robots.txt
https://www.alvoradiamonds.com/calibrated-diamond-layouts
```

5. Confirm `robots.txt` contains `Sitemap: https://www.alvoradiamonds.com/sitemap.xml` (not a Railway preview URL) — this requires `CANONICAL_ORIGIN` to be set.
6. Check that `/api/trpc/availability.summary` returns 200. A 500 generally means `DATABASE_URL` is missing or unavailable.

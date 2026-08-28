# Railway deployment for Alvora

The authoritative source for the deployed Alvora site is the project root containing `package.json`, `client/`, `server/`, `drizzle/`, and `shared/`. In Railway, set the service root directory to this project root. Do not deploy the older `website/` tree or a nested directory from the ZIP.

## Build and start

Use the following commands:

```text
Build command: pnpm install --frozen-lockfile && pnpm build
Start command: pnpm start
```

The application listens on Railway's injected `PORT`. The production build creates `dist/public` for the client and `dist/index.js` for the Express server. The standalone catalogue route is part of the SPA and is available at `/availability`, `/fr/availability`, and `/it/availability`.

## Required Railway variables

The public homepage and catalogue API are database-backed. Configure these variables in Railway before expecting live availability data:

```text
DATABASE_URL=<the MySQL/TiDB connection string containing the active Alvora availability snapshot>
JWT_SECRET=<long random session secret>
NODE_ENV=production
```

The published Manus project also uses the following server-side variables for storage-backed PDFs, uploaded media, and the existing protected administration flows:

```text
BUILT_IN_FORGE_API_URL=<Manus Forge API base URL>
BUILT_IN_FORGE_API_KEY=<Manus Forge API key>
VITE_APP_ID=<Manus OAuth application ID, if administrator login is required>
OAUTH_SERVER_URL=<Manus OAuth server URL, if administrator login is required>
OWNER_OPEN_ID=<owner identity, if administrator login is required>
RESEND_API_KEY=<optional until email delivery is enabled>
LEAD_ALERT_TO=<internal alert destination, if email delivery is enabled>
ALVORA_EMAIL_FROM=Alvora Diamonds <onboarding@resend.dev>
ALVORA_EARLY_ACCESS_ENABLED=false
VITE_ALVORA_WHATSAPP_NUMBER=<international WhatsApp number>
```

Do not copy values from the Manus environment blindly. Use Railway's Variables panel and keep secrets out of GitHub and ZIP archives.

## Database setup

The active public catalogue is not reconstructed from the small legacy `availability_seed.sql` file. It is read from the current managed database snapshot, including the certified no-price core and STATEMENT collections. Connect Railway to that database through `DATABASE_URL` and apply the checked-in Drizzle migrations only when the target database is intended to host this project. Do not seed sample or legacy inventory over the active snapshot.

If Railway is intended to use a new database, the current live catalogue must be imported through the protected availability import workflow or a separately reviewed migration. Without a database containing the active availability rows, `/availability` can render its shell but cannot show the live stone cards or counts.

## Why the hero images are bundled

The four brand and workshop images are now served from `client/public/assets/` and referenced as `/assets/*.webp`. They no longer depend on the Manus-only `/manus-storage/` proxy, so the hero and supporting imagery load on Railway without Manus Forge storage credentials. The supplied catalogue media and certificate links remain governed by their source URLs and the public certificate/privacy rules.

## Post-deploy checks

After deployment, verify the following URLs:

```text
/
/availability
/fr/availability
/it/availability
```

Then check Railway logs for `Server running` and confirm that the browser's Network panel returns `200` for `/assets/alvora-hero-qc.webp` and for `/api/trpc/availability.summary`. A `500` from `/api/trpc/availability.summary` generally means `DATABASE_URL` is missing or points to an unavailable database; a `500` from `/manus-storage/*` means Forge storage variables are absent, but the homepage hero should not depend on that route after this portability fix.

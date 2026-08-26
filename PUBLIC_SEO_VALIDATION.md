# Public locale metadata validation

On 26 August 2026, the rendered `/fr` route was checked after client hydration. The document language was `fr`; the route title and description were French; the canonical URL ended in `/fr`; alternate links were present for English, French, Italian, North American English, and `x-default`; and the route exposed `index,follow,max-image-preview:large` crawl guidance.

The checked French metadata uses **« diamants synthétiques »** and excludes `diamant de laboratoire`, `diamant cultivé`, `cultivé en laboratoire`, and `lab-grown`.

`robots.txt` allows the public landing routes while disallowing `/admin`, `/admin/`, and `/availability`. A canonical sitemap is intentionally deferred until the public production domain is confirmed, so no temporary preview host is published as the canonical discovery address.

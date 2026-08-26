# Public market-route bundle deferral validation

On 26 August 2026, the French (`/fr`), Italian (`/it`), and North American (`/us`) routes were opened directly after `MarketLanding` was moved behind a route-level dynamic import. Each route rendered its localized page title, navigation, localized production-brief form, and market-specific content without relying on inventory or administrator data.

The validated production build emitted a separate `MarketLanding` client chunk of **73.57 kB** (**13.50 kB gzip**) and reduced the default `index` client chunk to **702.32 kB** (**198.31 kB gzip**). Buyer and administrator route chunks remain independently deferred. This improvement does not alter public form persistence, market tagging, inventory state, buyer access, or early-access configuration.

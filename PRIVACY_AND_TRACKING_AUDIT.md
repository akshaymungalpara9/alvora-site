# Privacy and tracking audit

**Reviewed:** 26 August 2026  
**Scope:** Public Alvora routes only (`/`, `/fr`, `/it`, `/us`, plus planned public legal pages). This is an implementation record, not legal advice.

## Current implementation findings

| Area | Observed implementation | Privacy consequence |
| --- | --- | --- |
| Production briefs | Public forms submit contact name, work email, optional company, qualification responses, request description, and market/country context to the database-first brief workflow. | The privacy page must explain the commercial-enquiry purpose, internal recipients, response handling, and access/right-to-request channel. |
| Email delivery | Internal brief alerts use Resend through server-side configuration; saved records retain alert status and error metadata. | Resend must be named as an email-delivery processor in the policy. |
| Analytics | `client/index.html` loads the configured Umami tracker. No explicit client `track(...)` calls or custom event names were found in the public React route source. | The policy should name page views and the standard tracker attributes, not invent conversion-event names. |
| Public browser storage | No Alvora-created public cookie, local-storage, or session-storage feature was found in public route code. The authentication fallback reads `sessionStorage` only for protected-session handling. | No consent banner is added for the present public implementation. |
| Protected access | Manus OAuth/session handling supports authenticated buyer and administrator areas. | Authentication/session storage is necessary for protected access and is outside the public analytics decision. |

## Current consent-banner decision

No consent banner is included in this release. The sole public tracker is configured as Umami, whose official FAQ states that its tracking code does not use cookies; its documentation describes anonymised, cookie-free analytics. [1] [2] The current source contains no custom analytics event calls.

> This decision applies only while the public site keeps this cookie-free Umami configuration and does not add advertising pixels, session replay, cross-site tracking, non-essential A/B testing, or another non-essential storage technology.

Before any of those changes, re-audit the tracker, update the privacy page, and introduce an opt-in consent mechanism before the non-essential technology loads. CNIL states that audience-measurement tracers generally require consent unless strict exemption conditions are met, while the ICO states that non-strictly-necessary cookies need an appropriate means of consent. [3] [4]

## Privacy-page drafting checklist

The public privacy page should state the data categories, purposes, recipients/processors, retention approach, security posture, available data-rights request channel, and contact identity. The European Commission’s privacy guidance lists purposes, legal grounds, collected data, retention, safeguards, access recipients, rights, and contact details as core privacy-statement information. [5] The ICO similarly recommends mapping what information is held, why it is processed, who it is shared with, and how long it is kept before drafting clear information. [6]

## Runtime SEO verification

On 26 August 2026, the development server returned host-aware crawler directives that allow the public site and block `/admin`, `/admin/`, `/availability`, and `/api/`. Its sitemap reference used the active request host rather than a preview-domain value embedded in a static production file. The runtime sitemap listed only `/`, `/fr`, `/it`, `/us`, `/privacy`, and `/terms`; it did not list protected routes. This origin-aware approach is intentional until the owner confirms a final public domain.

The rendered English route was also checked in the browser. It exposed the route canonical, five expected alternates (`en`, `fr`, `it`, `en-US`, and `x-default`), a market-specific Open Graph title and description, a full hero-image URL, and Twitter’s `summary_large_image` card configuration.

The French public route was checked in the browser as well. Its document language was `fr`; its canonical resolved to `/fr`; and its Open Graph and Twitter titles used the French synthetic-diamond market wording. The localized footer contained working links to the shared privacy and trade-terms pages.

The Italian public route was checked in the browser. Its document language was `it`; its canonical resolved to `/it`; and its Open Graph and Twitter titles used the Italian synthetic-diamond market wording. The localized footer contained working links to the shared privacy and trade-terms pages.

The North American public route was checked in the browser. Its document language was `en-US`; its canonical resolved to `/us`; and its Open Graph description uses the route’s US-and-Canada delivery positioning. Twitter exposed the expected `summary_large_image` card configuration, and the footer contained working links to the shared privacy and trade-terms pages.

At a 375 × 812 mobile viewport, both legal pages retained readable headline hierarchy, single-column policy sections, visible legal links, and the dark editorial visual system without horizontal overflow.

On the live development `/us` route, browser inspection found an empty `document.cookie` value, no visible or hidden elements with cookie- or consent-related identifiers/classes, and one Umami analytics script. This evidence matches the documented no-banner posture for the present configuration; it is not a substitute for re-auditing any future tracker or consent change.

## References

[1]: https://docs.umami.is/docs/faq "Umami FAQ"
[2]: https://umami.is/blog/gdpr-compliant-website-analytics "Umami — GDPR Compliant Website Analytics"
[3]: https://www.cnil.fr/en/sheet-ndeg16-use-analytics-your-websites-and-applications "CNIL — Use analytics on your websites and applications"
[4]: https://ico.org.uk/for-the-public/online/cookies/ "ICO — Cookies"
[5]: https://commission.europa.eu/privacy-policy-websites-managed-european-commission_en "European Commission — Privacy policy for websites managed by the European Commission"
[6]: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/how-should-we-draft-our-privacy-information/ "ICO — How should we draft our privacy information?"

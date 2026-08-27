# Public catalog access decision

**Decision date:** 27 August 2026  
**Owner direction:** Retire the pending buyer magic-link work and make Current Production Availability public.

## Access model

`/availability`, `/fr/availability`, `/it/availability`, and the retained legacy `/buyer-availability` URL render the same public catalog. A visitor does not need a Manus account, Alvora account, password, or email link to browse the active Fancy Colour, White, or STATEMENT collections; open supplied 360° media; open supplied certificate links; create a bounded no-price current-view PDF; or prefill a public production brief for a listed stock number.

Public catalog APIs return only the active available rows for the chosen collection. They intentionally exclude price, partner-origin, standards, and other internal fields. The public current-view PDF is limited to 48 current active rows and contains the same no-price specification columns.

## Administration remains protected

The owner direction applies to customer-facing catalog activity. Manus OAuth remains the separately protected mechanism for administrative operations, including catalog imports, recovery, briefs, operations, and internal buyer-account history. No customer identity mechanism is currently used or required.

## Retired magic-link exploration

The proposed Resend magic-link path was not implemented. It would have been blocked for real buyers while the configured `onboarding@resend.dev` sender is used, because that sender is restricted to the Resend account owner. The planned 15-minute one-time link, 30-day buyer session, and trusted login-origin setting therefore do not exist in the application.

## Browser verification

An anonymous browser session opened `/buyer-availability` after the route update and received the public Current Production Availability page, with all three active collection counts—684 Fancy Colour, 1,155 White, and 593 STATEMENT—and no sign-in gate. The same session requested a 48-row public current-view PDF successfully: the API returned HTTP 200 and a public storage URL. No price, partner-origin, or standard-menu field was rendered; an API payload audit then identified and removed the legacy `isStandardMenu` field before final validation.

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

## Full public SKU details

Following an explicit owner direction, each catalog card now includes an anonymous **View full details** disclosure. It presents every populated non-price specification received for that SKU: stock number, collection, shape, carat and carat band, colour, clarity, make and finish fields, fluorescence, dimensions, proportions, laboratory and certificate number, plus applicable STATEMENT technical fields. Blank source values remain absent rather than being fabricated. Certificate links and supplied 360° media remain public where present; price, partner-origin, standards, import, and other internal fields remain excluded.

The global public route was reviewed with active Fancy Colour records. Opening a detail disclosure rendered the full populated specification for stock `R-30` without a sign-in prompt or any commercial/internal field. The current-site handoff was also reconciled: WhatsApp already uses a configured public number, current STATEMENT records already use supplied media where available, and protected catalogue administration already provides the optional curation/import foundation. No placeholder marketplace URL exists in this site to replace.

The public STATEMENT tab was subsequently reviewed without authentication. Its active 593-row collection exposed the additional type and laboratory filters, supplied still imagery, 360° links where supplied, certificate actions where supplied, and the same full-detail disclosure. A reviewed populated record displayed its stock number, Fancy Colour collection, shape, carat, carat band, colour, clarity, polish, symmetry, fluorescence, measurements, depth, table, ratio, laboratory, certificate number, production type, crown, pavilion, angle, and girdle data where received. Deliberately blank source fields remain absent, not hidden behind an account or replaced with invented values.

On 27 August 2026, an automated anonymous-browser regression opened a detail disclosure in each active collection, confirmed every card on the current 48-row page offers that control, and verified common specification labels without any price or internal-metadata wording. The complete 77-test application regression suite, the dedicated public-detail browser test, mobile accessibility test, public cookie-posture test, and production build also passed. The dedicated test reads the expanded native disclosure’s DOM text after waiting for its `open` state; this avoids a headless-browser `innerText` quirk while preserving the user-visible interaction as the assertion’s prerequisite.

## Client-trust certificate and media quality rule

Following the owner’s instruction to optimise the catalogue for trade-client confidence, the public catalogue now lists only records with a matching certificate action from the named official laboratory: IGI links must resolve to an `igi.org` host, GIA links to a `gia.edu` host, and each link must contain the listed report number. This retains all 1,839 core records and presents 551 of the 593 supplied STATEMENT records. The 42 STATEMENT source records that lack a complete trusted laboratory/certificate chain remain retained in the protected import history for data correction; they are not presented as certified public stock.

Source-held `workshop.360view.link` URLs are no longer published as public 360° actions. The active STATEMENT feed contained 460 of these workshop links. Where a verified, source-provided 360° asset exists on another host, it remains public alongside the stone’s official certificate action. New core and STATEMENT imports now reject blank laboratory/certificate data, generic laboratory landing pages, non-official hosts, and certificate URLs that do not identify the supplied report number. The no-price rule and exclusion of internal partner/import metadata remain unchanged.

Anonymous browser verification after the rule was enabled loaded 684 Fancy Colour, 1,155 White, and 551 certified STATEMENT records, with the STATEMENT collection explaining its matching-certificate and verified-360° standard. The French public route produced the same collection counts, no sign-in screen, and compliant `diamant de synthèse` terminology; public certificate actions and detail disclosures remained available with no price or internal metadata rendered.

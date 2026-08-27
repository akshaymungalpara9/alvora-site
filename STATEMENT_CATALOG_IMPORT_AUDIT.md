# STATEMENT Catalog Import Audit

The owner-supplied `alvora_availability_statement.csv` was preflighted against the dedicated 26-column, no-price STATEMENT contract and activated as isolated snapshot **30001** on 27 August 2026. The feed contained **593** available rows: **389 Fancy Colour** and **204 White**. It replaced no core data; the active core snapshot remains import **1** with **1,839** records.

The parser treats literal `null` values in optional technical and media fields as blank. The source snapshot has **561** supplied images, **573** supplied 360° viewers, and **562** supplied certificate destinations. The client-trust catalogue rule presents only the **551** records with a matching official IGI or GIA certificate action; **521** of these present a supplied still image and **110** retain a non-workshop 360° action. The remaining **42** source records stay retained in protected import history for data correction, but are not represented as certified public stock. No link, placeholder, or specification is fabricated.

All active records have a null stored price. Active core records use `https://api.igi.org/viewpdf.php?r={cert_no}`. Public STATEMENT records preserve their matching supplied IGI/GIA certificate destination. Source-held `workshop.360view.link` URLs are not published as client-facing 360° actions; **421** otherwise certified records use those source-held URLs and are represented without that action. Public browser review confirmed the three collection tabs, STATEMENT’s six filters, its image card presentation, generic **View certificate** action, and 360° action only where a verified non-workshop viewer URL exists.

French browser review confirmed the localized STATEMENT introduction, Type and Laboratory filters, **Voir le certificat** / **Voir à 360°** actions, live count of **551** certified records, and visible loaded supplied still images. The French catalog retains the required `diamants de synthèse` terminology.

Italian browser review confirmed the localized third tab, live collection count, standard catalog filters, certificate action, and the retained `diamanti sintetici` terminology. The STATEMENT tab uses the same locale-aware request-prefill route as its core collections.

Mobile capture at 375 px confirmed the three-tab control, four standard filters, readable mono labels, and grid/list controls fit the public catalog header. Core availability resolved with the live counts; localized requests resolve after their independent catalog queries complete.

Homepage review confirmed that the Live production profiles summary reflects the current certified STATEMENT count beside the existing core collection and shape tiles. The public Availability entry point remains `/availability`.

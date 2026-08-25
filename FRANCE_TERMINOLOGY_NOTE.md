# France terminology note

> **Working implementation note — obtain qualified French legal review before relying on this copy commercially.**

## Required public-page terminology

The French public route must use **« diamant synthétique »** whenever referring to the stones. The spelling **« diamant de synthèse »** may be used only after counsel confirms that it remains appropriate for the specific commercial context; the implemented route standardizes on the explicit statutory adjective **« synthétique »**.

The page must not use **« diamant de laboratoire »**, **« diamant cultivé »**, **« cultivé en laboratoire »**, **« lab-grown »**, **« élevé »**, **« de culture »**, or the unqualified word **« diamant »** to describe a synthetic diamond.

## Basis checked on 26 August 2026

| Source | Finding relevant to the implementation |
| --- | --- |
| [Décret n°2002-65, article 4 (Légifrance)](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006207478) | Defines the qualifier **« synthétique »** for stones made wholly or partly through human intervention that essentially reproduce the physical, chemical, and crystal properties of the natural stone. It prohibits the terms **« élevé »**, **« cultivé »**, **« de culture »**, **« vrai »**, **« précieux »**, **« fin »**, **« véritable »**, and **« naturel »** for the products enumerated by the article. |
| [DGCCRF: Qualité et conformité des bijoux comportant des pierres](https://www.economie.gouv.fr/dgccrf/laction-de-la-dgccrf/les-enquetes/qualite-et-conformite-des-bijoux-comportant-des-pierres) | States that the decree applies to synthetic stones, identifies “diamants dits « de culture » pour des diamants synthétiques” as problematic practice, and emphasizes complete and fair consumer information. |
| [Assemblée nationale, question écrite n°5268, response published 3 June 2025](https://questions.assemblee-nationale.fr/q17/17-5268QE.htm) | Confirms that the Government decided not to modify the decree after the terminology consultation and refers to the regulatory qualifier **« synthétique »** as imposed by article 4. |

## Implementation guardrails

The production-brief form must send `market: "FR"` to the existing database-first submission path. The French credentials strip carries a concise **« Conformité DGCCRF »** note and links to no legal conclusion beyond the terminology reference. This note must be reviewed if the French legal text or regulator guidance changes.

## Rendered-route check

On 26 August 2026, the rendered `/fr` route was checked for the prohibited terms `diamant de laboratoire`, `diamant cultivé`, `cultivé en laboratoire`, and `lab-grown`. All four checks returned `false`. The page uses **« diamant synthétique »** in its headline, body, FAQ, and credentials strip.

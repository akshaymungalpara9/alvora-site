# Current Production Availability — Import Audit

## Supplied source files

The owner supplied one combined feed and two collection-specific feeds. All three use the no-price header contract requested for the public catalog.

```csv
stock_no,category,colour,shape,carat,carat_band,clarity,cut,polish,symmetry,measurements,depth_pct,table_pct,ratio,lab,cert_no,verify_url,video_url
```

| File | Data rows | Observed content | Import state |
| --- | ---: | --- | --- |
| `alvora_availability.csv` | 1,839 | 1,155 White and 684 Fancy Colour rows | Not imported |
| `alvora_availability_white.csv` | 1,155 | White collection | Not imported |
| `alvora_availability_fancy.csv` | 684 | Fancy Colour collection | Not imported |

The combined and split feeds contain the same stock-number set. The split-file count initially included the second header line; after header handling, there was no stock-number difference. The combined feed has no duplicate stock numbers and no blank `stock_no`, `cert_no`, or `verify_url` values. All supplied `video_url` cells are blank, which is expected and will not create placeholder controls.

## Certification-link confirmation

IGI’s official verification page exposes the report-diagnosis endpoint with the query key `r`. A live check of supplied report `819696674` returned valid report data at the official endpoint below; catalog certification links may therefore use the feed’s supplied `verify_url` plus the encoded `r` value, rather than a guessed parameter.

```text
https://www.igi.org/API-IGI/report-diagnosis.php?r=819696674
```

Source: [IGI Verify Your Report](https://www.igi.org/Verify-Your-Report/) and its verified report-diagnosis response.

## Safety status

No catalog rows have been inserted, no public availability surface has been activated from the supplied feed, no price has been derived or displayed, and the buyer early-access lock remains unchanged. The next implementation step replaces the prior price-based import contract with this explicitly no-price catalog model.

# MEPS Review 2026 — Findings 3: Asia (AC)

Research date: 2026-07-02. Overall: 11 of 16 Asia rows wrong or mislabeled. Systemic problem: metric conflation. Chart labels everything "CSPF" but China uses EER/SEER/APF (GB/T 7725 bins), Japan APF (JIS C 9612, includes heating), Korea CSPF per KS C 9306 (Korean bins), India ISEER (IS 1391, Indian bins), Singapore weighted COP (NEA publishes CSPF equivalents). Only ASEAN roadmap is natively ISO 16358-1 CSPF.

## CHINA

| Row | Verdict | Correction |
|---|---|---|
| 2010: CSPF 3.2 "GB 21455 2010" | WRONG (name + metric) | Standard is GB 12021.3-2010 (eff. 1 Jun 2010). 3.2 real but is EER (split fixed-speed <=4.5 kW MEPS/Grade 3). ISO CSPF equiv ~3.4 (LBNL 1.062) |
| 2013: CSPF 4.5 | WRONG value | GB 21455-2013 (eff. 1 Oct 2013) MEPS = SEER 4.3 (cooling-only <=4.5 kW Grade 3) / APF 3.5 (heat pump). 4.5 is Grade 1 APF label level, not MEPS |
| 2016: CSPF 5.0 | WRONG, delete | No 2016 standard exists. CLASP timeline: 1989/2000/2004/2010 (GB 12021.3), 2008/2013/2019 (GB 21455) |
| 2020: CSPF 6.09 | CORRECT w/ caveats | GB 21455-2019 (eff. 1 Jul 2020) = China SEER 5.00 (VS cooling <=4.5 kW Grade 3 floor for inverters); 6.09 is LBNL/U4E ISO-CSPF translation. OK only if axis says "ISO CSPF equivalent" |
| 2025: CSPF 7.64 | WRONG as official | 7.64 = LBNL BAT scenario (Phadke et al. 2020; U4E roadmap "It is envisaged that ISO CSPF of 7.64... could be adopted"). No GB 21455 revision after 2019; revision in drafting (SAMR plan 20251031-Q-469, 30 Apr 2025, values not public). Delete or mark analyst scenario |

GB 21455-2019 grade tables (triple-corroborated: CNIS drafter presentation, CLASP Jun 2023, Baidu), capacity <=4500 / 4500-7100 / 7100-14000 W:
- APF (heat pump): G1 5.00/4.50/4.20; G2 4.50/4.00/3.70; G3 4.00/3.50/3.30; G4 3.50/3.30/3.20; G5 3.30/3.20/3.10
- SEER (cooling only): G1 5.80/5.50/5.20; G2 5.40/5.10/4.70; G3 5.00/4.40/4.00; G4 3.90/3.80/3.70; G5 3.70/3.60/3.50
- GB 12021.3-2010 EER grades (split): 3.60/3.40/3.20 (<=4500 W). Enforcement: G5 floor fixed-speed, G3 floor variable-speed (CLASP).

Sources: openstd.samr.gov.cn record BC04CDC71AD8C36B62C0FF4AE58F633C; std.samr.gov.cn plan 347023A132D8ADB2E06397BE0A0A691A; cheaa.com/app/2010-3/20100303i.pdf; CNIS/IEA presentation (iea.blob.core.windows.net .../LiuMeng...pdf); clasp.ngo Chinas-MEPS-Lead-to-Major-AC-Market-Transformation-2.pdf; iea.org/policies/11661, /2395; U4E ASEAN roadmap PDF. Caveat: 2019 tables via drafter presentation (GB text paywalled); 2013 effective date secondary.

## JAPAN

| Row | Verdict | Correction |
|---|---|---|
| 2010: APF 5.2 | WRONG | FY2010 target, wall-mounted <=3.2 kW (Category A) = APF 5.8. The 5.2 is Category H (floor/ceiling, FY2012), wrong product class |
| 2022: APF 5.8 | WRONG label | No "Top Runner 2022" standard. FY2010 target (APF 5.8) in force "until FY2026". 31 May 2022 = promulgation of next standard only. Flat line 2010-2026 |
| 2027: APF 6.2 | WRONG | FY2027 wall-mounted <=2.8 kW non-cold-region = APF 6.6 (Category I). 6.2 is cold-region Category II. METI: 2.2-3.2 kW classes 5.8 -> 6.6; 4.0 kW 4.9 -> 6.6; >2.8 kW formula E = 6.84 - 0.210 x (A - 2.8), capped 6.6 |

APF x 0.9 CSPF conversion UNVERIFIED: no official APF-to-CSPF conversion (APF includes heating, Tokyo climate; JIS C 9612 method changed 2005->2013). Footnote required: Top Runner is shipment-weighted corporate fleet average, not per-unit MEPS ("the weighted harmonic average value... shall not be below the target standard value").

Sources: enecho.meti.go.jp .../toprunner/en/02_aircon.html (Wayback); meti.go.jp/press/2022/05/20220531003/20220531003.html; eccj.or.jp/top_runner/pdf/tr_air_con_06.pdf; asiaeec-col.eccj.or.jp/specialreport202303-2/.

## SOUTH KOREA

| Row | Verdict | Correction |
|---|---|---|
| 2020: CSPF 3.2 | WRONG (nuance) | In force 2020 (since 1 Oct 2018, notice 2020-83 Annex 1): split <4 kW CSPF 3.50; 3.17 is window/packaged. 3.2 only defensible for window units |
| 2024: CSPF 3.5 "MOTIE 2024 Grade 5" | WRONG | No 2024 change. Since 1 Oct 2021 (notice 2020-225): split <4 kW MEPS = Grade 5 floor = CSPF 4.50 (grades: 1st >=6.90, 2nd 6.30, 3rd 5.70, 4th 5.10, 5th 4.50). Dashboard "3.2/3.5" reproduces the two 2018 values misdated. Next step: notice 2025-145, eff. 1 Nov 2025, split <4 kW 4.63 |

Metric: CSPF per KS C 9306 (2017, Annex E), "largely consistent with ISO 16358:2013" but Korean bins (24-38 C, 941 h) — label "CSPF (KS C 9306)". Verbatim MEPS: "2018-10-01: integrated 3.17 | split <4kW 3.50 | 4-10kW 3.15 | 10-17.5kW 2.89"; "2021-10-01: split <4kW 4.50, 4-10kW 4.40, 10-17.5kW 4.20".

Sources: law.go.kr Annex 1 (flDownload.do?flSeq=142533085); eep.energy.or.kr/pds/view.aspx?cate=4&no=161; law.go.kr/admRulLsInfoP.do?admRulSeq=2100000196679; kharn.kr 14849, 27014, 7712; U4E/LBNL ASEAN-AC-EE-Harmonization_Final_Feb-2021.pdf. UNVERIFIED: 2017 gazette number "2017-206" (U4E attribution only).

## INDIA

| Row | Verdict | Correction |
|---|---|---|
| 2018: ISEER 2.7 | WRONG | Split 1-star min eff. 1 Jan 2018 = ISEER 3.10 (1★3.10 2★3.30 3★3.50 4★4.00 5★4.50). 2.7 is window/unitary in 2022 table (IEA S.O. 3897: "2.7 and 3.3 for unitary and split") or old EER MEPS |
| 2022: ISEER 3.3 | CORRECT | Eff. 1 Jul 2022 (S.O. 3897 Oct 2019, COVID-deferred). Table: 1★3.30 2★3.50 3★3.80 4★4.40 5★5.00 |
| 2024: ISEER 3.3 | CORRECT | Extended through 31 Dec 2025. ADD: 1 Jan 2026, 1-star min ISEER 3.5 (5★5.6; BEE advisory 30 Sep 2025). 2026 intermediate bands + gazette number UNVERIFIED |
| 2027/2030/2033: 5.0/6.3/7.4 | Proposal only; attribution wrong; dash or remove | Verbatim "Set 1-star at ISEER 5.0" (2027), 6.3 (2030), 7.4 (2033) from IECC UC Berkeley working paper (Abhyankar, Shah, Phadke; Electricity Journal 2025), NOT BEE, NOT notified. ICAP only sets 25-40% cooling energy reduction by 2037-38 |

Metric: ISEER per IS 1391, "based on ISO 16358 but India-specific temperature distribution" (24-43 C, 54-city profile).

Sources: iecc.gspp.berkeley.edu/resources/reports/ac-efficency-standards-report2025/; iea.org/policies/20476; consumer-voice.org/ac/iseer-rating/; cag.org.in ISEER newsletter; iifiir.org; complinity.com BEE advisory; vsctimes.com/bee-star-ratings-air-conditioners/ (secondary).

## SINGAPORE

| Row | Verdict | Correction |
|---|---|---|
| 2020: CSPF 3.7 "NEA 2020" | WRONG | Regulates on weighted COP. In force 2020 (since 1 Sep 2016): split inverter WCOP >= 3.78 = CSPF-eq ~4.82 (NEA formula CSPF = 1.1917 x COP + 0.3111). Raised WCOP 4.04 (CSPF-eq ~5.1) 1 Jan 2022 |
| 2025: CSPF 6.09 "NEA 2025" | ESSENTIALLY CORRECT (use 6.10) | Eff. 1 Apr 2025: single-split WCOP >= 4.86 (4-tick) = NEA-stated "CSPF Equivalent 6.10"; multi-split WCOP 5.50 (6.86). Cite NEA 6.10. Legal basis: Energy Conservation Regulations 2017; NEA circular NEA-LSD-CIRCULAR-ECA-00001-2026 |

Timeline verified: 2011 introduced, 2013 tightened, 1 Sep 2016 WCOP 3.78, 1 Jan 2022 WCOP 4.04, 1 Apr 2025 WCOP 4.86/5.50. UNVERIFIED: formal SS 5306/ISO 16358 reference (sso.agc.gov.sg 403).

Sources: nea.gov.sg media releases 8 Jun 2021, 2 Mar 2023; NEA MEPS/tick pages; NEA circular PDF; united4efficiency.org/wp-content/uploads/2024/11/1-MELS-MEPS-Overview.pdf (formula).

## ASEAN

| Row | Verdict | Correction |
|---|---|---|
| 2020: 3.08 "SHINE Phase 1" | Value/year correct; label off | "minimum EER 2.9 W/W or CSPF 3.08 by 2020" (<3.52 kW), endorsed 33rd AMEM 7 Oct 2015. Relabel "2015 regional roadmap (33rd AMEM)" |
| 2023: 3.7 "Phase 2" | Correct as endorsed target; label wrong; not in force | Official name "Step 1" of updated roadmap (ACE/IIEC/U4E Aug 2021), endorsed 39th AMEM Sep 2021. Most member states still ~3.08-3.4 in 2024. Dash it |
| 2030: 6.09 "Phase 4" | Value correct; year disputed; label wrong | Endorsed doc says "Step 2: By 2025... ISO CSPF 6.09". The 2030 date only in ACE blog 19 May 2025 (slipped timeline); no AMEM-endorsed 2030 date (UNVERIFIED). "Phase 4" does not exist. "4.5" in roadmap is kW scope, not CSPF |

Metric: CSPF per ISO 16358-1, testing ISO 5151.

Sources: U4E roadmap PDF (2022/07); policy.asiapacificenergy.org/node/2936; aseanenergy.org blog 19 May 2025 + Oct 2024 publication; U4E AMEM news; ACE Feb 2024 status presentation.

## Cross-cutting recommendations

1. Retitle axis "seasonal efficiency (national metric, ISO CSPF equivalent where noted)" or convert explicitly with per-row notes.
2. Remove fabricated/nonexistent points: China 2016, Japan "2022 standard", Korea 2024 change, India 2018 value 2.7.
3. Dash or remove (not adopted/in force): China 2025 (7.64 LBNL scenario), India 2027/2030/2033 (Berkeley proposal), ASEAN 3.7 + 6.09 (endorsed aspirations), Japan FY2027 (adopted but fleet-average).
4. Add real adopted points: Singapore 1 Jan 2022 (WCOP 4.04 ~ CSPF 5.1), Korea 1 Nov 2025 (CSPF 4.63), India 1 Jan 2026 (ISEER 3.5), Japan flat 5.8 through FY2026.
5. UNVERIFIED list: China GB 21455 revision values; Japan APF->CSPF factor; India 2026 intermediate bands/gazette; ASEAN 6.09-by-2030 official date; Singapore formal ISO reference; Korea 2017 notification number.

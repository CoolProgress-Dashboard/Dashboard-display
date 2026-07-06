# MEPS Review 2026 — Findings 4: Refrigerators (EEI chart)

Research date: 2026-07-02. Headline: EU-style EEI is real and the ~274 kWh/yr anchor approximately right, BUT only 4 of 13 jurisdictions regulate in anything resembling that metric (EU, SADC, EAC, U4E-R). The chart presents cross-metric conversions and in several cases invented numbers as regulated EEI values. Needs restructuring.

## Methodology verification

- EEI/SAE method: Annex IV of Delegated Reg (EU) 2019/2016 (labelling), identical in Annex III of Reg (EU) 2019/2019 (ecodesign = actual MEPS). Verbatim: "SAE = C x D x SUM Ac x Bc x [Vc/V] x (Nc + V x rc x Mc)", "EEI = AE/SAE" in %. Parameters: fresh food rc=1.00 Nc=75 Mc=0.12; 4-star freezer rc=2.10 Nc=138 Mc=0.15; frost-free Ac=1.10 frozen; combi C = 1.3 + 0.87 x frzf (frzf <= 0.3). Ta = 24C; AE from IEC/EN 62552-3 at 16C/32C (Edaily = 0.5 x E16 + 0.5 x E32).
  Source: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02019R2016-20210501
- Worked 400L frost-free combi: 300/100 split SAE = 250.2 kWh/yr; 280/120 = 270.4; 260/140 = 274.3. So "~274" defensible only with stated split; recommend "SAE ~ 250-275 kWh/yr depending on compartment split".
- CRITICAL: old EU Reg 643/2009 used a DIFFERENT formula (Veq at 25C, M=0.777 N=303 for combis; CELEX 32009R0643), so pre-2021 and post-2021 EU EEI are different scales. A single EEI axis 2010-2026 is not internally consistent even for the EU alone.

## Row-by-row verdicts

### EU
- 2010: 130 "643/2009 Class A" — WRONG. 2010 floor was old-scale EEI < 55. 130 in no regulation; indicative new-scale ~148-162.
- 2012: 113 "Tier 2 A+" — WRONG. 1 Jul 2012 floor = old EEI < 44. Indicative new-scale ~118-130. The 2014 tier (old EEI < 42) missing entirely.
- 2021: 125 "Class F" — SUPPORTED; cite Reg 2019/2019 Annex II Table 1 ("From 1 March 2021... not above... 125"), not 2019/2016.
- 2026 projected: 100 — WRONG date/status. EEI <= 100 is ADOPTED LAW in force since 1 March 2024 (2019/2019 Annex II Table 2). Review underway (Call for Evidence 26 May 2025) but no new floor proposed.
  https://energy.ec.europa.eu/news/call-evidence-updating-ecodesign-and-labelling-requirements-refrigerating-appliances-2025-05-26_en

### China (metric = TEEI vs Chinese baseline, NOT EU EEI)
- 2016: 130 — WRONG. GB 12021.2-2015 (eff. 1 Oct 2016) entry level TEEI <= 90 of Chinese baseline; no source converts to EU EEI 130.
- 2020: 115 — WRONG, no such policy event. Delete.
- 2026: 90 — event SUPPORTED (GB 12021.2-2025, issued 30 May 2025, mandatory 1 Jun 2026; CLASP: "Grade 5 TEEI 90%") but vs a REVISED Chinese baseline (~40% tighter). Trap: 2015 floor was also "90" vs old baseline; a 130->115->90 trajectory is not derivable from any Chinese source.
  https://cprc-clasp.ngo/updates/china-raised-minimum-energy-performance-standards-refrigerators

### India (star bands of absolute kWh/yr, NO EEI exists)
- Gazette S.O. 4554(E): frost-free 1-star ceiling AEC < 0.180 x Vtot + 279, IS 17550 / IEC 62552 at 32C tropical.
- 2018: 140 — UNVERIFIABLE-AS-EEI (presumptively fabricated).
- 2022: 120 — WRONG date (bands "Valid from 1st January, 2023") + unverifiable value.
- 2026: 102 — event SUPPORTED (S.O. 4490(E), 22 Sep 2025: tables valid 1 Jan 2026-31 Dec 2028, labelling mandatory incl. direct-cool) but "102" corresponds to no Indian quantity.

### USA (max kWh/yr by product class f(AV), 90F DOE test — not convertible to IEC without model data)
- 10 CFR 430.32(a) Class 3 (top-mount auto defrost): 2001: 9.80AV+276.0; 2014: 8.07AV+233.7; 2029 rule: 6.86AV+198.6. 400L combi (AV~16.4 ft3): ~436/366/311 kWh/yr.
- All three rows (225/190/171) UNVERIFIABLE-AS-EEI; follow no stated method (naive /274 gives ~159/133/113).
- 2025 row WRONG: final rule published 17 Jan 2024, compliance 31 Jan 2029/2030. No 2025 proposal.
  https://www.federalregister.gov/documents/2024/01/17/2023-28978/...

### Japan (Top Runner kWh/yr fleet-average targets per JIS C 9801, not per-unit MEPS, no EEI)
- FY2021 target ~22% improvement vs FY2014 (fleet 363 -> ~283 kWh/yr). No FY2027 refrigerator target found. 110/97/93/85 match no published values. IEC-aligned test so conversion possible in principle but none cited.

### Korea (max kWh/month formulas on adjusted volume, grades 1-5, floor = grade 5; no EEI)
- MOTIE Notification 2020-225 (Dec 2020, eff. Oct 2021), rolling tightening: "current Grade 4 standards... will be Grade 5 from October 2024" (Enviliance). 115/80/65 unsourced.

### Brazil (kWh/month vs national class ceilings; not EU EEI)
- INMETRO Portaria 332/2021 (2 Aug 2021): three phases 1 Jul 2022 to end-2030 (first ~30% stricter, final ~61%), adopts IEC 62552-3:2020. New ENCE label from 1 Jan 2026 (Portaria 736/2024). Claimed 2012/2020/2025 values 130/109/101 match no Brazilian instrument.

### Australia
- GEMS (Household Refrigerating Appliances) Determination 2019, adopts AS/NZS 4474:2018 + AS/NZS IEC 62552:2018. MEPS = max CEC vs adjusted volume; stars = CEC/BEC index (EEI-like but Australian reference line).
- "GEMS 2024" is WRONG instrument: GEMS (Refrigerated Cabinets) Determination 2024 covers COMMERCIAL cabinets. Chart conflates commercial with domestic and cites superseded 4474.2. 140/120/109 unsourced.

### Singapore (tick ratings = AEC bands vs Singapore reference line)
- E.g. fridge-freezers 4-tick: AEC <= (465 + 1.378 x Vadj) x 0.228. MEPS raised to 2-tick Jan 2022; further update S 113/2025 (Feb 2025). Real milestones: 2011, 2015, 2022, 2025. Values 128/100/80 are not Singapore quantities.

### SADC — closest to SUPPORTED
- SADC HT 111:2023 (approved 2023, circulated Feb 2024). Full text: IEC 62552:2015 at 24C, AECMax = 0.222 x AV + 161 (combis), R = AECMax/AEC, "Minimum R: 1.00 (2024), 1.25 (2027)". R>=1.00 = 100% of reference line; R>=1.25 = 80%.
- "2024: 100" and "2027: 80" SUPPORTED IN SUBSTANCE. Metric = "% of U4E/SADC reference line", not EU EEI (400L example: SADC line 279 kWh/yr vs EU SAE 250 => SADC "100" ~ EU EEI ~111).
  https://united4efficiency.org/wp-content/uploads/2024/02/SADC-HT-111-SADC-Harmonised-MEPS-for-Refrigerating-Appliances-2023_v5_Dec2023.pdf

### EAC
- EAS 1214:2025 real; chart date wrong. Endorsed 26 Mar 2025, gazetted 2 Jul 2025, Phase 1 (2025) / Phase 2 (2027). U4E/LBNL-drafted like SADC; 100/80 plausible but numeric tables not retrieved. Mark "probable, pending confirmation"; change 2024 -> 2025.

### ECOWAS / Ghana
- Ghana 2019: 145 "ECOFRIDGES baseline" — UNVERIFIABLE, presumptively fabricated. ECOFRIDGES Ghana market assessment (Apr 2020) contains NO EEI figures. Ghana metric = LI 1958 (2009) star rating kWh/yr.
- 2026: 109 "ECREEE proposed" — UNVERIFIABLE. ECOSTAND 071-1:2017 exists for refrigerators but no doc proposes EEI 109 for 2026.

### U4E Model Regulation
- WRONG as stated: no EEI in the document. AECMax = 0.163 x AV + 102 (refrigerators), 0.222 x AV + 161 (combis) at 24C; grades via R (1.50/1.25/1.00). "Baseline EEI 102" is actually the INTERCEPT CONSTANT of the refrigerator formula. "High efficiency EEI 50" matches nothing (R>=1.50 = index ~67).

## Recommended presentation

1. SPLIT THE CHART. Panel A: true index-vs-reference-line jurisdictions (EU from 2021 only, SADC, EAC, optionally U4E model levels as % of U4E line flagged as sister metric ~1.05-1.12 x EU SAE). Panel B: everyone else in native metrics or "% reduction vs own 2010 baseline" (defensible without cross-test conversion).
2. Fix outright errors regardless: EU 2026 -> 2024 adopted; China 2020 deleted; India 2022 -> 2023; US "2025 proposed" -> "2024 final rule, compliance 2029/2030"; Australia citation -> Determination 2019; EAC 2024 -> 2025.
3. Never label China TEEI or any converted number "EEI" without footnoted conversion method.

Extracted primary texts (SADC HT 111, U4E model reg, ECOFRIDGES Ghana, GB 12021.2 draft, BEE gazette) saved in session scratchpad.

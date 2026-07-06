# MEPS Review 2026 — Findings 6: USA, EU, Brazil, Australia (AC)

Research date: 2026-07-02.

## USA (Central AC, DOE) — ALL THREE ROWS CORRECT

- 2006 SEER 13: CORRECT. 66 FR 7170 (22 Jan 2001), 10 CFR 430.32(c): split systems manufactured on/after 23 Jan 2006, SEER >= 13. Prior: SEER 10 (1992). Nuance: no <45 kBtu/h split existed in 2006 (qualifier arrived with 2017 rule). Source: https://www.govinfo.gov/content/pkg/FR-2001-01-22/html/01-1790.htm
- 2015 SEER 14 South / 13 North: CORRECT. 76 FR 37408 (27 Jun 2011), compliance 1 Jan 2015. Southeast SEER 14 (installation date); Southwest SEER 14 + EER 12.2/11.7. Source: https://www.govinfo.gov/content/pkg/FR-2011-06-27/html/2011-14557.htm
- 2023 SEER2 14.3 South (<45 kBtu/h) / 13.4 North: CORRECT. 82 FR 1786 (6 Jan 2017), 10 CFR 430.32(c)(5)-(6), compliance 1 Jan 2023. DOE crosswalk Table V-29/V-30: SEER 14 nat / 15 South = SEER2 13.4 / 14.3 (M1 raised external static pressure; factor ~0.95). Sources: https://www.govinfo.gov/content/pkg/FR-2017-01-06/html/2016-29992.htm ; https://www.energy.gov/cmei/buildings/consumer-central-air-conditioners-and-heat-pumps
- Room (window) ACs use CEER: current levels effective 1 Jun 2014 (76 FR 22454); May 2023 rule (88 FR 34298) raises to CEER 16.0 from 26 May 2026 manufacture.
- Conversion note: SEER2 13.4 ~ 3.9 W/W, 14.3 ~ 4.2 W/W are PURE UNIT CONVERSIONS (/3.412). Label as such, not measured CSPF. No sourced single US->CSPF equivalence exists for SEER2.

## EU (Regulation 206/2012) — BOTH ROWS WRONG

Verified from raw legal text (CELEX:32012R0206 + legislation.gov.uk mirror). Scope <= 12 kW, excl. single/double duct.
- 2013 "SEER 4.6 Tier 1": WRONG. Tier 1 (Annex I 2(b), Table 4), from 1 Jan 2013: SEER >= 3.60 (3.24 if GWP <= 150).
- 2014 "SEER 5.4 Tier 2": WRONG. Tier 2 (Annex I 2(c), Table 6), from 1 Jan 2014: SEER >= 4.60 (<6 kW), 4.30 (6-12 kW); (4.14/3.87 low-GWP). SEER 5.4 appears nowhere as MEPS (matches ~2020 market average, likely error origin).
- Successor: NOT ADOPTED as of Jul 2026. Draft at 7 Mar 2023 Consultation Forum proposed split SEER 6.0 (SCOP 4.0), intended Jan 2026; no OJ publication. Label any plot "draft, not adopted".
- Metric: EU SEER per EN 14825 (average climate/Strasbourg). Convert via Park 2020: ISO CSPF = 1.113 x SEER - 0.639.
- Sources: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32012R0206 ; https://www.legislation.gov.uk/eur/2012/206/annexes ; https://energy-efficient-products.ec.europa.eu/product-list/air-conditioners-and-comfort-fans_en ; coolproducts.eu consultation comments PDF

## Brazil (INMETRO) — 2020 row WRONG (conflates 3 regulations); 2025 row essentially CORRECT

- Pre-2019 MEPS: EER 2.60 W/W. Interministerial Ordinance MME/MDIC/MCTIC No 2 (14 May 2018): raised split MEPS to EER 3.02 W/W (manufacture/import from 30 Jun 2019; retail from 30 Jun 2020).
- Portaria 234/2020 Phase 1: minimum IDRS 3.14 (Class F floor), manufacture/import from 31 Dec 2022, class table 1 Jan 2023.
- Phase 2: minimum IDRS 3.50, manufacture/import from 31 Dec 2025, class table 1 Jan 2026 (Class A becomes IDRS >= 7.00). Plot at 2026 or footnote.
- IDRS = Brazil's CSPF per ISO 16358-1 (Brazilian climate, 100%/50% load): genuinely a CSPF, 1:1 plottable with note.
- Corrected series: 2019: EER 3.02 (x1.062 if fixed-speed -> ~3.21 ISO approx); 2023: IDRS 3.14; 2026: IDRS 3.50.
- UNVERIFIED: whether Portaria 332/2021+ shifted dates (amendment text unfetchable; dates consistent across CLASP, IIF/IIR, ICS).
- Sources: https://iifiir.org/en/news/newly-revised-efficiency-standards-for-acs-in-brazil-and-india ; https://www.clasp.ngo/updates/brazils-latest-ac-policy-to-dramatically-cut-costs-and-emissions/ ; https://climaesociedade.org/en/pbe-new-air-conditioning-classification/ ; https://www.iea.org/policies/6907-minimum-efficiency-levels-for-air-conditioners

## Australia (GEMS) — BOTH ROWS WRONG; partner's flag justified

Verified from GEMS (Air Conditioners up to 65kW) Determination 2019 (F2019L00490) full text + 2019 Decision RIS + Oct 2009 E3 fact sheet.
- Actual GEMS 2019 MEPS (Schedule 1): non-ducted single-split <4 kW: AEER 3.66; non-ducted 4-<10 kW: 3.22; ducted <10 kW: 3.10; 10-39 kW: 3.10; 39-65 kW: 2.90; portables: 2.50. Registered 1 Apr 2019, in force 1 Apr 2020. ES: "For the vast majority... MEPS levels will not change" (carried over).
- Metric: AEER (s.20) = full-load W/W with weighted inactive power folded in (2000 h assumption), per AS/NZS 3823.4.1:2014 Annex B. TCSPF (= ISO 16358-1 MOD, AU climate files) used ONLY for Zoned Energy Rating Label, NOT MEPS. Variable-capacity units (s.23): 95% of MEPS at full load allowed if part-load point complies.
- 2010 row: "GEMS 2010" does not exist (GEMS Act 2012; 2010 ran under state law + AS/NZS 3823.2:2009). Oct 2009 fact sheet: from 1 Apr 2010 splits <4 kW: EER 2.75 -> 3.33; 4-<10 kW: 2.93. From 1 Apr 2011 same levels became AEER-based + power factor requirement. AEER 2.9 matches no small-split class.
- 2019 row: correct value AEER 3.66 (not 3.1; 3.10 is ducted/unitary class — wrong product class picked).
- Step 3.33 -> 3.66 happened between 2011 tier and GEMS 2013 era; exact date UNVERIFIED (AS/NZS 3823.2:2013 paywalled; 2019 RIS calls 2011 "last MEPS increase"). Recommend plotting 3.33 (2010) and 3.66 (by 2019 determination, in force 2020).
- AEER->CSPF conversion NOT defensible (full-load + standby, not seasonal; IEA 4E: AU "N/A"). Show AEER natively.
- Post-2019: no MEPS increase <=65 kW found (separate >65 kW determination, 1 Oct 2022, AEER 2.90).
- Sources: https://www.legislation.gov.au/Details/F2019L00490 ; https://oia.pmc.gov.au/sites/default/files/posts/2019/06/1_decision_ris_air_conditioners.docx ; energyrating.gov.au Oct 2009 fact sheet (Wayback 1 Jun 2011) ; https://www.eeca.govt.nz/regulations/equipment-energy-efficiency/about-the-e3-programme/products-under-e3/air-conditioners-65-kw-and-under/

## Harmonization note

Only Brazil's IDRS is natively CSPF among these four. US SEER2: unit conversion defensible if labelled. EU SEER: Park 2020 equation. Australia AEER: no valid conversion, show natively.

## Verdict summary

USA 2006/2015/2023 CORRECT (drop capacity qualifier on 2006). EU 2013 WRONG (3.60 not 4.60); EU 2014 WRONG (4.60 not 5.40); successor NOT adopted. Brazil 2020 WRONG (EER 3.02 from 2019; Phase 1 IDRS 3.14 from Dec 2022); Brazil 2025 CORRECT value (IDRS 3.50, manufacture 31 Dec 2025 / market 2026). Australia 2010 WRONG (EER 3.33 from 1 Apr 2010); 2019 WRONG (AEER 3.66, in force 1 Apr 2020); AEER->CSPF conversions removed.

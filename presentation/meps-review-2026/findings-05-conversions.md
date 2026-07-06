# MEPS Review 2026 — Findings 5: AC Metric Conversion Methodology

Research date: 2026-07-02. Core outcome: a genuine peer-reviewed conversion basis EXISTS (Park et al. 2020). Old dashboard factors for Japan and India were wrong in DIRECTION, not just magnitude. Switch from constant multipliers to the published regression equations.

## The three citable institutional sources

**A. Park, Shah, Choi, Kang, Kim, Phadke (2020). "Lost in translation: Overcoming divergent seasonal performance metrics to strengthen air conditioner energy-efficiency policies." Energy for Sustainable Development 55:56-68. DOI 10.1016/j.esd.2020.01.003.** Open access: https://escholarship.org/uc/item/5jh2g8v5
THE peer-reviewed source converting national metrics to ISO 16358 CSPF. Appendix B Table B1 regression equations (alternative forms):

| To ISO CSPF from X | Equation | R2 |
|---|---|---|
| ISEER (India) | ISO CSPF = 7.726 x ln(ISEER) - 5.318 | 0.996 |
| China APF | ISO CSPF = 1.798 x X - 2.027 | 0.970 |
| Japan APF | ISO CSPF = 1.735 x exp(0.220 x X) | 0.976 |
| Korea CSPF | ISO CSPF = 0.970 x X + 0.048 | 0.991 |
| US SEER (Wh/Wh, App. M) | ISO CSPF = 0.962 x X + 0.087 | 0.999 |
| EU SEER (EN 14825) | ISO CSPF = 1.113 x X - 0.639 | 0.999 |

Table 6 (p.64) MEPS-level anchors: ISEER 3.50 = ISO CSPF 3.79; Japan APF 4.50 = 4.68; China SEER 5.00 = 6.09; China APF 4.00 = 5.17; Korea CSPF 3.15 = 3.44; EU SEER 4.60 = 4.48; US SEER 4.10 (Wh/Wh) = 4.01. Caveat to always carry: conversions "suitable for initially assessing... although not suitable for compliance purposes."

**B. Park, Shah, Letschert, Blake (LBNL/U4E, Feb 2021). "Harmonizing Energy-Efficiency Standards for Room Air Conditioners in Southeast Asia."** https://united4efficiency.org/wp-content/uploads/2022/07/ASEAN-AC-EE-Harmonization_Final_Feb-2021.pdf
p.19: "CSPF for fixed-speed units results in a linear relationship with EER, i.e., CSPF = beta x EER (e.g., beta = 1.062 with the ISO temperature bin hours...)". Inverters: "CSPF = 1.192 x WEER + 0.311" (57 R32 models, Annex D p.41). The 1.062 is mathematically exact under ISO 16358-1 clause 6.4 (29C from predetermined equations: Cap x 1.077, Power x 0.914).

**C. Econoler/Navigant/CEIS/ACEEE for CLASP (2011). "Cooling Benchmarking Study Part 2."** https://www.clasp.ngo/wp-content/uploads/2021/01/RAC-benchmarking_2-Benchmarking-component.pdf
pp.35-36: EER_NAFTA = EER_T1 x 1.0096; EER_Korea = EER_T1 x 1.012; Btu/Wh -> W/W: x 0.2931 (fn.12). Table 34 (pp.65-66) VSD conversions, precision "[-10%, +10%]".

**D. IEA 4E / Cadeo (Mar 2020). "Domestic AC Test Standards and Harmonization."** https://www.iea-4e.org/wp-content/uploads/2020/12/AC_Test_Methods_Report_Final_V2_incl_JP_KO.pdf
Explicitly states Australia/NZ and US SEER2 have NO published conversion ("not included").

## Per-metric key facts

- (a) ISEER IS the ISO 16358-1 calculation on India-specific bins (24-43C, 1600h, IS 1391). Hotter bins => same unit scores LOWER in ISEER than ISO CSPF. At ISEER 7.3 the Park equation gives 10.04 — exactly matches U4E/IIEC roadmap "ISEER ~7.3 (translated into ISO CSPF ~10)". Corroborated: LBNL 2022 Park & Shah (https://escholarship.org/uc/item/7v3628p3): ISO ~ 1.19 x ISEER for VSD, ~1.03 x fixed.
- (b) Australia GEMS 2019 (F2019L00490, https://www.legislation.gov.au/F2019L00490/latest): MEPS gate is AEER (s.22(2)); AEER = (cap x 2000)/(power x 2000 + Pia x 6.76) — EER degraded by inactive power, NOT seasonal. TCSPF defined per AS/NZS 3823.4.1:2014 = "(ISO 16358-1:2013, (MOD))", feeds Zoned Energy Rating Label (6 values), includes inactive energy => not 1:1 with reference CSPF. NO published AEER->ISO CSPF conversion.
- (c) US: x0.2931 unit identity published (Econoler). Profile adjustment: ISO CSPF = 0.962 x SEER(Wh/Wh) + 0.087 (2-4% BELOW, not +10%). SEER2: NO institutional conversion; only DOE crosswalk SEER<->SEER2 (14 SEER = 13.4 SEER2 split ducted, ratio 0.957). Ductless ~2-3% delta = industry commentary, UNVERIFIED.
- (d) Japan APF (JIS C 9612:2013) blends CSPF+HSPF, Tokyo climate. ISO CSPF = 1.735 x exp(0.220 x APF); anchor 4.50 -> 4.68. Econoler-derived: Japan APF = 0.799 x Japan CSPF + 0.582.
- (e) EU SEER includes standby/off modes, 17-40C profile. ISO CSPF = 1.113 x EU SEER - 0.639.
- (f) Fixed-speed EER: CSPF = 1.062 x EER (ISO bins). ONLY fixed-speed; inverters CSPF exceeds EER by 36-65%. Saudi: SASO SEER = CSPF x 3.412 => divide by 3.412 exactly. ASEAN + SADC natively ISO CSPF.
- Origin of fabricated 0.90/0.92: LBNL-1005798 (2016, Box 1, https://eta-publications.lbl.gov/sites/default/files/lbnl-1005798.pdf): Japanese APF and Korean CSPF "would lower by 10% and 13%... when converted to ISEER". Converts TO ISEER, not to ISO CSPF. Dashboard applied it backwards to the wrong target.

## Verdicts on old dashboard factors

| Old factor | Verdict | Replacement |
|---|---|---|
| CSPF 1:1 ASEAN, SADC | SUPPORTED (natively ISO 16358-1) | keep |
| CSPF 1:1 China | WRONG (Chinese bins differ; SEER 5.00 = ISO 6.09, +22%) | ISO = 1.798 x APF - 2.027 or Table 6 anchors |
| CSPF 1:1 Singapore | WRONG label (rates in WEER/COP) | fixed x1.062; inverter ISO = 1.192 x WEER + 0.311 |
| Japan APF x0.90 | WRONG direction (should be ~x1.04 at MEPS level) | ISO = 1.735 x exp(0.220 x APF) |
| India ISEER x0.92 | WRONG direction (3.5 -> 3.79; 7.3 -> 10.0) | ISO = 7.726 x ln(ISEER) - 5.318 |
| EU SEER x0.95 | UNSUPPORTED constant (accidentally close at 4.6; drifts) | ISO = 1.113 x SEER - 0.639 |
| US SEER2 x0.293 x1.1 | x0.293 supported (units); x1.1 WRONG (published ~x0.96-0.98) | SEER2 -> SEER (/0.957 ducted) -> /3.412 -> 0.962x + 0.087; label approximation |
| EER x1.062 (Saudi/Ghana) | SUPPORTED for fixed-speed T1 EER only | keep with citation; SASO SEER instead /3.412; never for inverters |
| Australia AEER x1.06 | UNSUPPORTED (IEA 4E: AU "N/A"; AEER embeds inactive power) | show AEER natively or TCSPF with MOD caveat; any approximation must be labeled unpublished assumption |

## Overall recommendation

Use Park et al. 2020 equations (nonlinear, so constant factors are structurally wrong for India/Japan/China). Keep 1:1 only for ASEAN/SADC(/EAC). Keep 1.062 only for genuine fixed-speed EER. Show Australia and US SEER2 as national metrics with footnoted approximate conversion. Always carry "not suitable for compliance purposes" caveat.

Extracted full texts in session scratchpad: park2020_lost.txt, asean_harmonization.txt, clasp_part2.txt, iea4e_testmethods.txt, u4e_asean_roadmap.txt, gems2019_full.txt, lbnl_india.txt, park_multiclimate.txt.

# CoolProgress Dashboard — Master Feedback Register
**Last updated:** 2026-07-06  
**Total items:** 80 (59 completed, 4 dropped, 17 open: 7 High / 7 Medium / 2 Blocked / 1 Low; updated 6 Jul 2026)  
**Sources:** Noah/CCC, Ari/CLASP, Patrick/HEAT, Jamie/CPR, Giorgia/SEforAll, Stefanie/HEAT, Dietram/UNEP, London event (12 May 2026), CCC orchestration board

---

## HOW TO USE THIS FILE
- This is the ONLY source of truth for feedback status. Never re-read the HTML feedback files for status.
- When an item is completed: mark it ✅ Done and add the commit hash inline.
- New feedback from stakeholders: add directly here with the next ID — do not create a new HTML file.
- Status key: ✅ Done | 🔴 High | 🟡 Medium | ⚪ Low | 🔵 Blocked (external dependency)

---

## PILLAR 0 — FRONT PAGE / OVERVIEW

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| OV-01 | Lead stat corrected: ~7% today, ~10% BAU 2050 — does NOT triple | Narrative | Noah/CCC | ✅ Done |
| OV-02 | Partner ecosystem names reformatted "Full Name — ACRONYM" | UI | Internal | ✅ Done |
| OV-03 | News section removed from partner ecosystem | Content | Internal | ✅ Done |
| OV-04 | FourPillarFramework: 3-bullet lists with color-coded markers added | Content | Internal | ✅ Done |
| OV-05 | Cross-pillar synergies bar below 5-pillar strip | Content | Dietram/UNEP | ✅ Done |
| OV-06 | Sustainable Cooling Hierarchy framing | Narrative | Dietram/UNEP | — Skipped |
| OV-07 | Sources bar — removed, not needed | Content | Internal | — Removed |

---

## PILLAR 1 — EMISSIONS

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| EM-01 | Appliance filter buttons reordered and renamed | UI | Ari/CLASP | ✅ Done |
| EM-02 | Appliance scope badges added per chart | Narrative | Ari/CLASP | ✅ Done |
| EM-03 | Scenario hint system added (label updates on hover) | UI | Internal | ✅ Done |
| EM-04 | Map color scale: 5-level log scale with ACCESS_RISK palette | UI | Internal | ✅ Done |
| EM-05 | Source citation logos below map (CLASP + GCI links) | Content | Internal | ✅ Done |
| EM-06 | Net Zero Appliances retired — scenarios now BAU / GB / BAT | Narrative | Ari/CLASP | ✅ Done |
| EM-07 | AC stock chart converted from line to vertical columns | UI | Internal | ✅ Done |
| EM-08 | ApplianceGrowthChart: hardcoded fallback removed; live data + spinner | Data | Internal | ✅ Done |
| EM-09 | AC stock heading says 3.1B→6.1B but chart shows 1.5B→3B — verified, closed | Data accuracy | Noah/CCC | ✅ Done |
| EM-10 | GCI vs CLASP conflict: China AC:fridge ratio ~20x off; US refrigerator nearly as large as AC | Data accuracy | Noah/CCC | ✅ Done |
| EM-11 | Single-source rule: do not show 2 competing sources per chart — pick the single best | Narrative | Nihar Shah/LBNL | ✅ Done |
| EM-12 | Scenario trajectory lines unlabelled by driver — needs Efficiency shift / Refrigerant shift / Grid decarbonization labels | Narrative | Noah/CCC | ✅ Done |
| EM-13 | Align scenarios with GCP 68% cut by 2050 as on-track/off-track benchmark | Data accuracy | Omar Abdelaziz/UNEP | ✅ Done |
| EM-14 | Abdel Aziz (UNEP/AUC) modelling data needed for scenario alignment | Data gap | Lily Riahi/UNEP | 🔵 Blocked |
| EM-15 | Direct emissions 2050 trajectory does not reflect HFC phasedown — data task, closed | Data accuracy | Noah/CCC | ✅ Done |

---

## PILLAR 2 — PRODUCT EFFICIENCY (MEPS)

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| ME-01 | MEPS Stringency section moved after map | UI | Internal | ✅ Done |
| ME-02 | Unverified AC CSPF and fridge EEI tables replaced with WIP callouts | Data accuracy | Internal | ✅ Done |
| ME-03 | ASEAN narrative added | Content | Patrick/HEAT | ✅ Done (0ccbf08) |
| ME-04 | SADC AC MEPS values too low vs U4E | Data accuracy | Patrick/HEAT | ✅ Done 3 Jul 2026 — 4.50 (2024) / 6.10 (2027), HT 110:2023 Table 10, MEPS review v2 (uncommitted) |
| ME-05 | EAC AC MEPS values too low vs U4E | Data accuracy | Patrick/HEAT | ✅ Done 3 Jul 2026 — 4.50 (2025) / 6.10 (2027), EAS 1213:2025, MEPS review v2 |
| ME-06 | Nigeria AC MEPS values too low | Data accuracy | Patrick/HEAT | ✅ Done 3 Jul 2026 — relabelled SON/ECN (approved 25 Feb 2025); phased values kept, flagged estimated (baseline NSEER 3.0 unpublished — obtain SON text via Patrick/U4E) |
| ME-07 | Saudi Arabia AC MEPS value needs verification | Data accuracy | Patrick/HEAT | ✅ Done 3 Jul 2026 — old values matched no SASO cell; now EER 11.8 Btu/Wh (2018, eq 3.67) + SASO 2663:2025 SEER 12.8 (Nov 2026, eq 3.75) |
| ME-08 | Japan Top Runner conversion unverified | Data accuracy | Patrick/HEAT | ✅ Done 3 Jul 2026 — old x0.90 wrong in direction; replaced with Park et al. 2020 equation; fleet-average caveat added |
| ME-09 | Australia EER→CSPF conversion unverified | Data accuracy | Patrick/HEAT | ✅ Done 3 Jul 2026 — no valid AEER→CSPF conversion exists (IEA 4E); Australia removed from CSPF chart, documented in changelog |
| ME-10 | U4E capacity range: shows 4.5–9.5 kW, standard is 2.5–5 kW | Data accuracy | Patrick/HEAT | ✅ Done 3 Jul 2026 — reference line now CSPF 6.10, Group 1 ≤4.5 kW (Table 5); typical residential band |
| ME-11 | U4E high-efficiency label: current 6.5, should be 7.6 or 8.0 | Data accuracy | Patrick/HEAT | ✅ Done 3 Jul 2026 — now 8.00 (Annex 2 Table 13, Group 1 ≤4.5 kW); 6.5 was the Group 2 value |
| ME-12 | Inverter savings understated: claim 40–44%, should be "up to 60%" | Data accuracy | Noah/CCC | ✅ Done — stat box now says "up to 60%", body text updated |
| ME-13 | Full MEPS benchmarking audit — U4E flagged additional low values at London | Data accuracy | U4E (London) | ✅ Done 3 Jul 2026 — all 16 AC jurisdictions + refrigerator chart source-verified; 50-record v2 dataset (meps_timeline_v2.json), calculation workbook in presentation/meps-review-2026/, findings 01–06 |
| ME-14 | LBNL inverter share dataset: % AC sales inverter vs fixed-speed by country, SE Asia zoom-in, time series | Data gap | Noah/CCC + London | 🔴 High |
| ME-15 | Super-efficient fans story: ~2M India sales, 50% energy reduction, price drop | Content | Noah/CCC | 🔴 High |
| ME-16 | High-temp + high-humidity operating conditions context — core to 5x efficiency / GCP story | Content | Noah/CCC | 🔴 High |
| ME-17 | MEPS map metric (MEPS/labels count) unexplained — add tooltip or remove | UI | Noah/CCC | ✅ Done 3 Jul 2026 — tooltip now says "MEPS policies / Labelling policies" with a counts-explainer line, plus a note under the map legend (coverage, not stringency) |
| ME-18 | Recent MEPS updates section: China fridges, Nigeria ACs, ASEAN harmonization | Content | Noah/CCC + Patrick | ✅ Done 3 Jul 2026 — section rewritten with verified facts (GB 12021.2-2025, Nigeria Feb 2025 NSEER phases, ASEAN roadmap + Singapore 6.10, SADC/EAC card added); stale "under review" disclaimers replaced |
| ME-19 | U4E country assessments: at least one example shown | Content | Noah/CCC | 🟡 Medium |
| ME-20 | Lifecycle cost (LCC) data: total cost of ownership per product and country | Data gap | Foundation (London) | 🟡 Medium |

---

## PILLAR 3 — REFRIGERANT TRANSITION (KIGALI)

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| KI-01 | Kigali Plus scenario line removed | Data accuracy | Noah/CCC | ✅ Done |
| KI-02 | Refrigerant bank: 3 toggle views (GWP Share / Bank Mass / Climate Impact) | UI | Internal | ✅ Done |
| KI-03 | 6-step lifecycle infographic added | Content | Internal | ✅ Done |
| KI-04 | Kigali ratification map restored | UI | Internal | ✅ Done |
| KI-05 | Appliance scope labels added | Narrative | Ari/CLASP | ✅ Done |
| KI-06 | Historical scenario lines diverge before 2025 — must converge to single line | UI bug | Internal | ✅ Done — superseded 3 Jul 2026 per Manuel: scenario lines now hidden entirely before 2025 (branch from the 2025 BAU point); legend renamed to plain language (Business as Usual / Kigali Implementation / Kigali+ accelerated) since "BAU" was unclear |
| KI-07 | LBNL refrigerant transition data: R-410A → R-32 market share by region, past 5 years | Data gap | Noah/CCC | 🔴 High |
| KI-08 | Kigali Amendment framing: introductory explanation of Montreal Protocol / HFC phasedown | Content | Noah/CCC | ✅ Done 3 Jul 2026 — "The Framework" section added (Montreal 1987 → Kigali 2016 → 2019 entry into force → 173 parties), MLF context (USD 965M 2024-2026, KIPs, ExCom 98 Jun 2026 Montreal) with Ozone Secretariat + MLF links |
| KI-09 | Build refrigerant data from BTR 1 + BTR 2 (Paris transparency framework) | Data accuracy | Satish/AEEE | — Discarded 3 Jul 2026 (decision Manuel) — BTR reconciliation not pursued |
| KI-10 | Add EIA F-Gas fact sheet link + EU F-Gas rule summary link | Links | Noah/CCC | ✅ Done (0ccbf08) — EU F-Gas Reg 2024/573 card with EIA plain-language guide + PDF, plus EIA F-Gas campaign card; register was stale, verified in code 3 Jul 2026 |
| KI-11 | Automate Kigali ratification count via API (currently hardcoded) | Automation | Internal | ✅ Done 3 Jul 2026 — scripts/check_kigali_ratifications.mjs compares kip table against ozone.unep.org/all-ratifications (with --fix mode + duplicate detection); data corrected: Haiti flagged (ratified 8 Apr 2026), PRK row inserted (ratified 2017, was missing), duplicate KOR row deleted; kip now 173 = UNEP 173; pillar fallback updated to 173. Run the script monthly or on ratification news |

---

## PILLAR 4 — ACCESS & VULNERABILITY

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| AC-01 | Access data range changed to 2015–2030 | Data | Internal | ✅ Done |
| AC-02 | Access map legend colors do not match chart colors | UI bug | Internal | ✅ Done — PCT_COLORS aligned to SEFORALL scheme (green/amber/red/dark-red); progress bar CSS updated to match |
| AC-03 | Access pillar broken link audit | Links | Internal | ✅ Done 6 Jul 2026 — all 11 external links tested and valid; the two unep.org links return 403 to bots but are live pages (verified via search index) |
| AC-04 | Access data start year: showing from 2015, consider starting 2020 | Data accuracy | Noah/CCC | ✅ Done 6 Jul 2026 — decision Manuel: charts now start 2022 (timeline 2022–2030, country baseline year 2022) |
| AC-05 | Gender dimension missing from Access pillar entirely | Content | Stefanie/HEAT | ✅ Done (pre-existing, register was stale) — 512M women stat card + per-country 2024 gender breakdown chart already live; confirmed by Manuel 6 Jul 2026 |
| AC-06 | Wet-bulb / WBGT integration for humidity-adjusted heat risk | Content | Stefanie/HEAT | — Discarded 6 Jul 2026 (decision Manuel); humidity disclaimer note under the map remains |
| AC-07 | Show both totals AND percentages for at-risk population | UI | Internal | ✅ Done 6 Jul 2026 — country detail panel now shows "X.XM at risk (Y.Y% of population)"; map tooltip already had both |
| AC-08 | Text contrast: light green/yellow text fails accessibility | UI | Internal | ✅ Done 6 Jul 2026 — counter labels #D4A843 → #8A6D1C (≥4.5:1); green text audited, all remaining greens pass AA. Related (same session): map under-5% bucket recolored green → light yellow #F0D878 per Manuel (green implied "solved"), legend + progress bar aligned |

---

## PILLAR 5 — NATIONAL PLANS & COMMITMENTS (POLICY)

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| PO-01 | GCP Non-Signatories bars removed from chart | UI | Internal | ✅ Done |
| PO-02 | NDC "Not Mentioned" bars removed | UI | Internal | ✅ Done |
| PO-03 | NDC Region chart: Previous NDC query fixed (NDC 2.0 → Other) | Data accuracy | Internal | ✅ Done |
| PO-04 | NDC 3.0 unhidden and shown as grouped bars vs Previous NDC | UI | Internal | ✅ Done (222c5e4) |
| PO-05 | Chapter-card padding reduced: 56px → 16px | UI | Internal | ✅ Done |
| PO-06 | Policy map legend colors do not match bottom color bar | UI bug | Internal | ✅ Done — country detail NDC icon/border now uses #6BADA0 for Mentioned (was wrongly using #D4A843) |
| PO-07 | NDC narrative contradiction: "37 signatories" vs "134 countries" vs "NDC 3.0 bleak" — one coherent message | Narrative | Noah/CCC | ✅ Done — rewritten to present 74 GCP signatories, 37 with cooling in NDCs, and 134 strategy mentions as three separate facts; NDC 3.0 gap clearly stated |
| PO-08 | GCP commitments not shown on dashboard — users click through twice to Cool Coalition | UI/Content | Noah/CCC | 🔴 High |
| PO-09 | Regulation behind pledges: surface binding national instrument per GCP/NDC/NCAP commitment | Content | CCC convention | 🔴 High |
| PO-10 | Policy pillar: full broken link audit (Cool Coalition Cooling Watch, CPR, Resources) | Links | Jamie/CPR | 🔴 High |
| PO-11 | CPR logo update — new version awaited from Jamie | Links | Jamie/CPR | 🔵 Blocked |
| PO-12 | Regulation linkage: connect pledges to national law via CPR index | Content | CIFF (London) | 🟡 Medium |
| PO-13 | Automate GCP signatory count via API (currently hardcoded) | Automation | Internal | 🟡 Medium |
| PO-14 | NCAP PDFs: archive and add Wayback Machine backup links | Links | Internal | ⚪ Low |

---

## CROSS-CUTTING

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| CC-01 | Methodology pages: Font Awesome CDN added | UI | Internal | ✅ Done |
| CC-02 | Methodology pages: back-button fixed (history.back + fallback) | UI | Internal | ✅ Done |
| CC-03 | Bilateral trade flow data: country-to-country equipment flows | Data gap | CIFF (London) | 🟡 Medium |
| CC-04 | MDB/DFI funding layer: clean cooling commitments and disbursements | Data gap | CCC convention | 🟡 Medium |
| CC-05 | Public API for data extraction | Platform | CLASP Asia (London) | 🟡 Medium |

---

## PRIORITY SUMMARY

| Pillar | 🔴 High | 🟡 Medium | 🔵 Blocked | ⚪ Low | ✅ Done |
|--------|---------|----------|-----------|-------|--------|
| Overview | 0 | 3 | 0 | 0 | 4 |
| Emissions | 0 | 1 | 1 | 0 | 13 |
| MEPS | 3 | 2 | 0 | 0 | 15 |
| Kigali | 1 | 0 | 0 | 0 | 9 (1 discarded) |
| Access | 0 | 0 | 0 | 0 | 7 (1 discarded) |
| Policy | 3 | 2 | 1 | 1 | 7 |
| Cross-cutting | 0 | 3 | 0 | 0 | 2 |
| **Total** | **13** | **24** | **2** | **1** | **38** |

---

## EXTERNAL DEPENDENCIES

| Dependency | Blocks | Owner | Status |
|------------|--------|-------|--------|
| CLASP data review (Ari + Jiayi, post-leave) | ME-04 to ME-13, ME-14 | CLASP | Awaiting scheduling |
| Abdel Aziz modelling data (UNEP/AUC) | EM-13, EM-14 | Lily Riahi/UNEP | Awaiting receipt |
| CPR logo update | PO-11 | Jamie/CPR | Awaiting receipt |
| LBNL datasets (inverter + refrigerant market) | ME-14, KI-07 | LBNL / Nihar Shah | Needs confirmation |

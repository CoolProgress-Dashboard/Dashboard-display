# CoolProgress Dashboard — Master Feedback Register
**Last updated:** 2026-06-22  
**Total items:** 95 (28 completed, 67 pending)  
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
| EM-09 | AC stock heading says 3.1B→6.1B but chart shows 1.5B→3B — verify and fix one | Data accuracy | Noah/CCC | 🔴 High |
| EM-10 | GCI vs CLASP conflict: China AC:fridge ratio ~20x off; US refrigerator nearly as large as AC | Data accuracy | Noah/CCC | 🔴 High |
| EM-11 | Single-source rule: do not show 2 competing sources per chart — pick the single best | Narrative | Nihar Shah/LBNL | 🔴 High |
| EM-12 | Scenario trajectory lines unlabelled by driver — needs Efficiency shift / Refrigerant shift / Grid decarbonization labels | Narrative | Noah/CCC | 🔴 High |
| EM-13 | Align scenarios with GCP 68% cut by 2050 as on-track/off-track benchmark | Data accuracy | Omar Abdelaziz/UNEP | 🔴 High |
| EM-14 | Abdel Aziz (UNEP/AUC) modelling data needed for scenario alignment | Data gap | Lily Riahi/UNEP | 🔵 Blocked |
| EM-15 | Direct emissions 2050 trajectory does not reflect HFC phasedown impact | Data accuracy | Noah/CCC | 🟡 Medium |

---

## PILLAR 2 — PRODUCT EFFICIENCY (MEPS)

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| ME-01 | MEPS Stringency section moved after map | UI | Internal | ✅ Done |
| ME-02 | Unverified AC CSPF and fridge EEI tables replaced with WIP callouts | Data accuracy | Internal | ✅ Done |
| ME-03 | ASEAN narrative added | Content | Patrick/HEAT | ✅ Done (0ccbf08) |
| ME-04 | SADC AC MEPS values too low vs U4E | Data accuracy | Patrick/HEAT | 🔴 High |
| ME-05 | EAC AC MEPS values too low vs U4E | Data accuracy | Patrick/HEAT | 🔴 High |
| ME-06 | Nigeria AC MEPS values too low | Data accuracy | Patrick/HEAT | 🔴 High |
| ME-07 | Saudi Arabia AC MEPS value needs verification | Data accuracy | Patrick/HEAT | 🔴 High |
| ME-08 | Japan Top Runner conversion unverified | Data accuracy | Patrick/HEAT | 🔴 High |
| ME-09 | Australia EER→CSPF conversion unverified | Data accuracy | Patrick/HEAT | 🔴 High |
| ME-10 | U4E capacity range: shows 4.5–9.5 kW, standard is 2.5–5 kW | Data accuracy | Patrick/HEAT | 🔴 High |
| ME-11 | U4E high-efficiency label: current 6.5, should be 7.6 or 8.0 | Data accuracy | Patrick/HEAT | 🔴 High |
| ME-12 | Inverter savings understated: claim 40–44%, should be "up to 60%" | Data accuracy | Noah/CCC | 🔴 High |
| ME-13 | Full MEPS benchmarking audit — U4E flagged additional low values at London | Data accuracy | U4E (London) | 🔴 High |
| ME-14 | LBNL inverter share dataset: % AC sales inverter vs fixed-speed by country, SE Asia zoom-in, time series | Data gap | Noah/CCC + London | 🔴 High |
| ME-15 | Super-efficient fans story: ~2M India sales, 50% energy reduction, price drop | Content | Noah/CCC | 🔴 High |
| ME-16 | High-temp + high-humidity operating conditions context — core to 5x efficiency / GCP story | Content | Noah/CCC | 🔴 High |
| ME-17 | MEPS map metric (MEPS/labels count) unexplained — add tooltip or remove | UI | Noah/CCC | 🟡 Medium |
| ME-18 | Recent MEPS updates section: China fridges, Nigeria ACs, ASEAN harmonization | Content | Noah/CCC + Patrick | 🟡 Medium |
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
| KI-06 | Historical scenario lines diverge before 2025 — must converge to single line | UI bug | Internal | 🔴 High |
| KI-07 | LBNL refrigerant transition data: R-410A → R-32 market share by region, past 5 years | Data gap | Noah/CCC | 🔴 High |
| KI-08 | Kigali Amendment framing: introductory explanation of Montreal Protocol / HFC phasedown | Content | Noah/CCC | 🟡 Medium |
| KI-09 | Build refrigerant data from BTR 1 + BTR 2 (Paris transparency framework) | Data accuracy | Satish/AEEE | 🟡 Medium |
| KI-10 | Add EIA F-Gas fact sheet link + EU F-Gas rule summary link | Links | Noah/CCC | 🟡 Medium |
| KI-11 | Automate Kigali ratification count via API (currently hardcoded) | Automation | Internal | 🟡 Medium |

---

## PILLAR 4 — ACCESS & VULNERABILITY

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| AC-01 | Access data range changed to 2015–2030 | Data | Internal | ✅ Done |
| AC-02 | Access map legend colors do not match chart colors | UI bug | Internal | 🔴 High |
| AC-03 | Access pillar broken link audit | Links | Internal | 🟡 Medium |
| AC-04 | Access data start year: showing from 2015, consider starting 2020 | Data accuracy | Noah/CCC | 🟡 Medium |
| AC-05 | Gender dimension missing from Access pillar entirely | Content | Stefanie/HEAT | 🟡 Medium |
| AC-06 | Wet-bulb / WBGT integration for humidity-adjusted heat risk | Content | Stefanie/HEAT | 🟡 Medium |
| AC-07 | Show both totals AND percentages for at-risk population | UI | Internal | 🟡 Medium |
| AC-08 | Text contrast: light green/yellow text fails accessibility | UI | Internal | 🟡 Medium |

---

## PILLAR 5 — NATIONAL PLANS & COMMITMENTS (POLICY)

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| PO-01 | GCP Non-Signatories bars removed from chart | UI | Internal | ✅ Done |
| PO-02 | NDC "Not Mentioned" bars removed | UI | Internal | ✅ Done |
| PO-03 | NDC Region chart: Previous NDC query fixed (NDC 2.0 → Other) | Data accuracy | Internal | ✅ Done |
| PO-04 | NDC 3.0 unhidden and shown as grouped bars vs Previous NDC | UI | Internal | ✅ Done (222c5e4) |
| PO-05 | Chapter-card padding reduced: 56px → 16px | UI | Internal | ✅ Done |
| PO-06 | Policy map legend colors do not match bottom color bar | UI bug | Internal | 🔴 High |
| PO-07 | NDC narrative contradiction: "37 signatories" vs "134 countries" vs "NDC 3.0 bleak" — one coherent message | Narrative | Noah/CCC | 🔴 High |
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
| Emissions | 5 | 1 | 1 | 0 | 8 |
| MEPS | 10 | 4 | 0 | 0 | 3 |
| Kigali | 2 | 4 | 0 | 0 | 5 |
| Access | 1 | 7 | 0 | 0 | 1 |
| Policy | 5 | 2 | 1 | 1 | 5 |
| Cross-cutting | 0 | 3 | 0 | 0 | 2 |
| **Total** | **23** | **24** | **2** | **1** | **28** |

---

## EXTERNAL DEPENDENCIES

| Dependency | Blocks | Owner | Status |
|------------|--------|-------|--------|
| CLASP data review (Ari + Jiayi, post-leave) | ME-04 to ME-13, ME-14 | CLASP | Awaiting scheduling |
| Abdel Aziz modelling data (UNEP/AUC) | EM-13, EM-14 | Lily Riahi/UNEP | Awaiting receipt |
| CPR logo update | PO-11 | Jamie/CPR | Awaiting receipt |
| LBNL datasets (inverter + refrigerant market) | ME-14, KI-07 | LBNL / Nihar Shah | Needs confirmation |

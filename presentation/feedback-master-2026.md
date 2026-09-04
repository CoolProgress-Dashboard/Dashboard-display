# CoolProgress Dashboard — Master Feedback Register
**Last updated:** 2026-09-01  
**Total items:** 127 IDs (47 new in the 31 Aug Noah/CCC batch). Open after batch: 65 (27 High / 34 Medium / 3 Blocked / 1 Low). 4 dropped, 4 superseded. See Priority Summary.  
**Sources:** Noah/CCC, Christina Hayes/CCC, Ari/CLASP, Patrick/HEAT, Jamie/CPR, Giorgia/SEforAll, Stefanie/HEAT, Dietram/UNEP, London event (12 May 2026), CCC orchestration board

> **Batch note (31 Aug 2026):** Combined CCC/team feedback received via Noah. Top-level ask: keep a laser focus on crisp progress snapshots (inverter transition, refrigerant GWP trends). Noah authorizes creative workarounds for the LBNL data-rights blocker, including less granular or password-protected sharing. See new items tagged "Noah/CCC (31 Aug)". Access & National Plans feedback still awaited as a follow-up. Call to review: Fri or Tue 8 Sep.

---

## HOW TO USE THIS FILE
- This is the ONLY source of truth for feedback status. Never re-read the HTML feedback files for status.
- When an item is completed: mark it ✅ Done and add the commit hash inline.
- New feedback from stakeholders: add directly here with the next ID — do not create a new HTML file.
- Status key: ✅ Done | 🔴 High | 🟡 Medium | ⚪ Low | 🔵 Blocked (external dependency)
- **PRECEDENCE RULE (per Manuel, 1 Sep 2026): Noah's feedback wins over any prior item.** Where a new Noah/CCC item conflicts with something already Done, the earlier item is marked ⚠️ SUPERSEDED and the new instruction is authoritative. Current supersessions: ME-24 reverses ME-12; ME-26 supersedes ME-17; CC-07 supersedes OV-02 and OV-03; EM-27 reopens EM-09.

---

## PILLAR 0 — FRONT PAGE / OVERVIEW

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| OV-01 | Lead stat corrected: ~7% today, ~10% BAU 2050 — does NOT triple | Narrative | Noah/CCC | ✅ Done |
| OV-02 | Partner ecosystem names reformatted "Full Name — ACRONYM" | UI | Internal | ⚠️ SUPERSEDED by CC-07 (Noah 31 Aug): remove the partner ecosystem entirely, drop "partner" framing |
| OV-03 | News section removed from partner ecosystem | Content | Internal | ⚠️ SUPERSEDED by CC-07 (Noah 31 Aug): whole section to be removed |
| OV-04 | FourPillarFramework: 3-bullet lists with color-coded markers added | Content | Internal | ✅ Done |
| OV-05 | Cross-pillar synergies bar below 5-pillar strip | Content | Dietram/UNEP | ✅ Done |
| OV-06 | Sustainable Cooling Hierarchy framing | Narrative | Dietram/UNEP | — Skipped |
| OV-07 | Sources bar — removed, not needed | Content | Internal | — Removed |
| OV-08 | Rewrite launch framing: open with "Cool Progress is a website designed to…", then the big frame (warming world, people turn to AC/fans, IEA 3B additional ACs by 2050 with India/Indonesia largest, grid stress/outages/warming loop, then >1B lack the cooling they need) | Narrative | Noah/CCC (31 Aug) | 🔴 High |
| OV-09 | Drop tons and %-of-global-emissions from intro text (already shown in graphics below) | Content | Noah/CCC (31 Aug) | 🟡 Medium |
| OV-10 | Anchor on "7% of global GHG today, growing to 10% by 2050" | Narrative | Noah/CCC (31 Aug) | 🟡 Medium |
| OV-11 | Remove TWh-savings (MEPS) bullet at bottom; cleaner two rows of three | UI | Noah/CCC (31 Aug) | 🟡 Medium |
| OV-12 | Opportunity text add: "…drastically reducing heat related illnesses and deaths" | Content | Noah/CCC (31 Aug) | 🟡 Medium |
| OV-13 | Passive rewrite: "Thermally focused building designs (insulation, shading, ventilation, and cool roofs) cut cooling demand at the source while enhancing thermal comfort" | Content | Noah/CCC (31 Aug) | 🟡 Medium |
| OV-14 | Refrigerants: say "ultra-low GWP" (or low and ultra-low), add lifecycle management (leak prevention, end-of-life venting); lock common vocabulary (low <750, ultra-low <10). Ties to KI-15 | Narrative | Noah/CCC (31 Aug) | 🔴 High |
| OV-15 | Page 4 label: "MEPS" becomes "energy efficiency standards or regulations" (readers won't know MEPS) | Content | Noah/CCC (31 Aug) | 🟡 Medium |

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
| EM-16 | Say "fossil fuel", not "fossil" | Content | Noah/CCC (31 Aug) | ✅ Done — "fossil-reliant"/"fossil-heavy" reworded to "powered by / rely on fossil fuels" in EmissionsPillar |
| EM-17 | Fix definitions: direct = refrigerant leaks; indirect = CO2 from electricity generation at power plants | Content | Noah/CCC (31 Aug) | 🔴 High |
| EM-18 | Add ~70% usage (indirect) / ~30% leakage (direct) split, with caveat it varies by equipment/refrigerant/grid and shifts over time. NEEDS the correct figure (Noah's is a guess) | Content | Noah/CCC (31 Aug) | ✅ Done — Noah's guess CONFIRMED by literature: ~71% indirect / 29% direct for the RAC sector (UNEP Ozone Secretariat briefing note + Green Cooling Initiative; IEA ~70/30 for mobile AC). Text now states ~70% indirect / ~30% direct with the varies-by-equipment/refrigerant/grid + shifts-over-time caveat and inline source. Note: domestic fridges are >95% indirect (backs EM-28) |
| EM-19 | Top-line figures in GT not MT (5,950 MT becomes ~6 GT); fewer significant figures | UI | Noah/CCC (31 Aug) | ✅ Done — stat cards now 2.3 Gt (today) and 6 Gt (2050 BAU); Header insight text updated to match. Detailed Mt breakdowns kept in hover context |
| EM-20 | Reword Pillar 3 cross-ref to drop "Kigali" (not yet introduced): "For more information about refrigerants and work to transition away from HFCs, see Pillar 3" | Content | Noah/CCC (31 Aug) | ✅ Done — cross-ref reworded, "Kigali Amendment ratification status" removed |
| EM-21 | Number formatting: commas as thousands separators (1,312 not 1.312); map hover shows MT/yr; legend says "annual emissions" | UI | Noah/CCC (31 Aug) | 🔴 High |
| EM-22 | Add caveat: map shading is NOT normalized for population or climate, so not a ranking of country performance | Narrative | Noah/CCC (31 Aug) | 🟡 Medium |
| EM-23 | Fix confusing "over 1 GtCO2e annually" sentence (contradicts earlier 2.3 GT/yr; fast-growing-regions logic doesn't follow) | Narrative | Noah/CCC (31 Aug) | ✅ Done — removed the contradictory "over 1 GtCO₂e annually" clause; reworded so fast-growing-regions point reads clearly |
| EM-24 | Emissions map: remove logos and "data partner" term. Part of CC-07 | UI | Noah/CCC (31 Aug) | ✅ Done (4 Sep) — "data partner" wording gone dashboard-wide: every "Data Partners" bar (Emissions, MEPS, Kigali, Access) now reads "Data Sources"; Overview "Powered by Our Partners" → "Our Data Sources" (dead "View All" link to removed partners page deleted); RightPanel "Data & Knowledge Partners" → "Sources"; handshake icons → database. Logos RETAINED per Manuel (keep data referenced with logos as now), so the "remove logos" half of EM-24 is intentionally NOT applied |
| EM-25 | Pledge text + progress link appears out of context; introduce it properly or remove | Narrative | Noah/CCC (31 Aug) | 🟡 Medium |
| EM-26 | Emissions trajectory chart: label as "annual emissions (Mt CO2/yr)" | UI | Noah/CCC (31 Aug) | 🔴 High |
| EM-27 | ⚠️ REOPENS EM-09. AC-stock chart still confuses "3B additional by 2050" with a graph showing ~3B total / +1.5B increase; y-axis says "millions of units" but values are billions (confirmed in his screenshot). Noah's 31 Aug instruction wins over the earlier "verified, closed" | Data accuracy | Noah/CCC (31 Aug) | 🔴 High |
| EM-28 | Add note: household refrigerators have very low direct emissions (industry already shifted to ultra-low-GWP refrigerants, e.g. R-600a) | Content | Noah/CCC (31 Aug) | ✅ Done — note added to the direct/indirect paragraph (R-600a, direct challenge concentrated in AC) |
| EM-29 | Document map methodology: how HFC emissions are integrated per country, the HFC source, and its reliability | Data accuracy | Christina Hayes/CCC (31 Aug) | 🟡 Medium |

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
| ME-12 | Inverter savings understated: claim 40–44%, should be "up to 60%" | Data accuracy | Noah/CCC | ⚠️ SUPERSEDED by ME-24 (Noah 31 Aug): "up to 60%" is a factual error, correct value is ~25–30%. Must revert |
| ME-13 | Full MEPS benchmarking audit — U4E flagged additional low values at London | Data accuracy | U4E (London) | ✅ Done 3 Jul 2026 — all 16 AC jurisdictions + refrigerator chart source-verified; 50-record v2 dataset (meps_timeline_v2.json), calculation workbook in presentation/meps-review-2026/, findings 01–06 |
| ME-14 | LBNL inverter share dataset: % AC sales inverter vs fixed-speed by country, SE Asia zoom-in, time series | Data gap | Noah/CCC + London | 🔴 High |
| ME-15 | Super-efficient fans story: ~2M India sales, 50% energy reduction, price drop | Content | Noah/CCC | 🔴 High |
| ME-16 | High-temp + high-humidity operating conditions context — core to 5x efficiency / GCP story | Content | Noah/CCC | 🔴 High |
| ME-17 | MEPS map metric (MEPS/labels count) unexplained — add tooltip or remove | UI | Noah/CCC | ⚠️ SUPERSEDED by ME-26 (Noah 31 Aug): remove the map entirely (most countries have MEPS; stringency is the real question). The tooltip fix is moot |
| ME-18 | Recent MEPS updates section: China fridges, Nigeria ACs, ASEAN harmonization | Content | Noah/CCC + Patrick | ✅ Done 3 Jul 2026 — section rewritten with verified facts (GB 12021.2-2025, Nigeria Feb 2025 NSEER phases, ASEAN roadmap + Singapore 6.10, SADC/EAC card added); stale "under review" disclaimers replaced |
| ME-19 | U4E country assessments: at least one example shown | Content | Noah/CCC | 🟡 Medium |
| ME-20 | Lifecycle cost (LCC) data: total cost of ownership per product and country | Data gap | Foundation (London) | 🟡 Medium |
| ME-21 | Reflow section: (1) growth to future emissions + grid stress dialed up (ACs up to 50% of peak in heatwaves in some countries, outage risk); (2) MEPS as key policy setting the floor, avoiding locked-in waste over 10+ yr lifetimes; many countries lack/have weak or old MEPS | Content | Noah/CCC (31 Aug) | 🔴 High |
| ME-22 | Move U4E country assessments up front, framed as savings/benefits potential, with at least one example (extends ME-19) | Content | Noah/CCC (31 Aug) | 🔴 High |
| ME-23 | Inverter penetration story + "% inverters by country" plot. Flagged in caps as the single most important addition. Same data as ME-14, now unblocked by Noah's password-protected authorization | Content / Data gap | Noah/CCC (31 Aug) | 🔴 High |
| ME-24 | ⚠️ Factual correction, REVERSES ME-12. Inverter savings is ~25–30%, NOT "up to 60%" (60% is a reach goal no model meets today). Undo what shipped. Urgent (published error) | Data accuracy | Noah/CCC (31 Aug) | ✅ Done — headline stat + body reverted to "25% to 30%" in MepsPillar (Global Cooling Prize 5x kept as a reach goal, not achievable savings) |
| ME-25 | Add country x appliance MEPS lookup (dropdowns, e.g. Nigeria + refrigerators), with caveat that differing test methods/metrics prevent apples-to-apples comparison | UI / Content | Noah/CCC (31 Aug) | 🟡 Medium |
| ME-26 | ⚠️ Remove the "has MEPS?" map. Supersedes ME-17 | UI | Noah/CCC (31 Aug) | ✅ Superseded by Manuel (4 Sep): KEEP the map. Instead: (1) show the last-update year prominently on map hover (1.25em bold), (2) darkened the low-contrast tooltip text — greys were #ddd/#aaa on a white tooltip, now #334155/#64748b with a dark navy country name and a colour-swatch status label. MepsPillar map mouseover |
| ME-27 | Add "raise the floor" pivot: Global Cooling Prize work, the 60% efficiency + better-refrigerant goal, key documents. Contact Sneha Sachar for the best links | Content | Noah/CCC (31 Aug) | 🟡 Medium |
| ME-28 | Reword dumping line: "…offload their least efficient models into markets that don't have efficiency regulations, or that have weaker or outdated ones" (dumping can be legal where MEPS are weak) | Content | Noah/CCC (31 Aug) | 🟡 Medium |
| ME-29 | Broaden ceiling-fans framing: not only for those who can't afford AC; households (e.g. India) often own both | Content | Noah/CCC (31 Aug) | 🟡 Medium |

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
| KI-12 | Show Nihar's/LBNL refrigerant plots, even password-protected: average GWP decline, R-32 rising / R-410A falling, country comparisons. Flagged "LETS DISCUSS". Same data as KI-07, now unblocked by Noah's password-protected authorization | Content / Data gap | Noah/CCC (31 Aug) | 🔴 High |
| KI-13 | Broaden products at the top beyond Residential AC + Domestic Refrigerators (supermarkets, heat pumps, commercial refrigeration/AC, etc.) | Content | Christina Hayes/CCC (31 Aug) | 🔴 High |
| KI-14 | Reword "The Challenge" tagline ("…leaking the climate away") to e.g. "Refrigerant leaks are a massive climate risk" | Content | Christina Hayes/CCC (31 Aug) | ✅ Done — tagline now "Refrigerant leaks are a massive climate risk." in KigaliPillar |
| KI-15 | Define GWP terms objectively, introduce "ultra-low GWP", consider a GWP infographic (his image2 is the reference). Ties to OV-14 | Content | Christina Hayes/CCC (31 Aug) | 🔴 High |
| KI-16 | Replace busy Kigali schedule table with a graph; use color to group countries; summarize groups alongside | UI | Christina Hayes/CCC (31 Aug) | 🟡 Medium |
| KI-17 | Elevate the "market momentum" note into a standout point, with sources | Content | Christina Hayes/CCC (31 Aug) | 🟡 Medium |
| KI-18 | Ratification map: define "more ambitious"; some approved KIPs exceed the 10%/2029 floor but don't show. Should they? | Data accuracy | Christina Hayes/CCC (31 Aug) | 🟡 Medium |
| KI-19 | ⚠️ BUG: clicking some countries shows "undefined % by undefined". Check data source / manual entry. Urgent (visible bug) | UI bug | Christina Hayes/CCC (31 Aug) | ✅ Done — KIP override with missing step pct/year now falls back to the default schedule instead of rendering "undefined% by undefined" (KigaliPillar kip1/kip2 guards) |
| KI-20 | Resources fixes + adds: CARB SB 1206 next to NY Part 494; label "EIA International" as "EIA UK" and use EIA-US for AIM Act; add EPA HFC Data Hub, Cool Technologies, Climate-Friendly Supermarkets (+scorecard), Multilateral Fund CP data, Ozone Secretariat data center, UC Berkeley KigaliSim | Links | Christina Hayes/CCC (31 Aug) | 🟡 Medium |

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
| AC-09 | Access & National Plans feedback: not yet received from CCC, coming as a follow-up. Placeholder | Content | Noah/CCC (31 Aug) | 🔵 Blocked (awaiting CCC) |

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
| PO-08 | GCP commitments not shown on dashboard — users click through twice to Cool Coalition | UI/Content | Noah/CCC | ✅ Done 6 Jul 2026 — GCP emissions waterfall (2022→2050 scenarios, direct/indirect split, Gt CO2e) reproduced on the Policy pillar from the Cool Coalition GCP Progress Dashboard (values extracted from origin page, dated in gcp_waterfall.json); complements the existing 5-theme commitments block + 14-commitments link |
| PO-09 | Regulation behind pledges: surface binding national instrument per GCP/NDC/NCAP commitment | Content | CCC convention | 🔴 High |
| PO-10 | Policy pillar: full broken link audit (Cool Coalition Cooling Watch, CPR, Resources) | Links | Jamie/CPR | ✅ Done 6 Jul 2026 — 22 links tested, 8 broken links fixed with verified replacements (Cooling Watch → UNEP GCW 2025, NCAP tracker → GCP Progress Dashboard, CCAC guidance PDF, UNEP NCAP methodology, GCI NDC Helpdesk, IFC Cooler Finance landing page, MENA NCAP methodology → CCAC, Ozone Secretariat Kigali page); unep/wedocs/undp 403s verified as bot-blocks, pages live |
| PO-11 | CPR logo update — new version awaited from Jamie | Links | Jamie/CPR | 🔵 Blocked — verified 6 Jul 2026 that all logos (incl. CPR) are served locally from /images, none hotlinked; swap the file when Jamie delivers |
| PO-12 | Regulation linkage: connect pledges to national law via CPR index | Content | CIFF (London) | 🟡 Medium |
| PO-13 | Automate GCP signatory count via API (currently hardcoded) | Automation | Internal | ✅ Done 6 Jul 2026 — all displayed counts (stats, pledge block, alignment badge) now derive live from the Supabase global_cooling_pledge table (never from the website at runtime); Kigali stat on Policy pillar likewise from kip table (was hardcoded stale 175+); scripts/check_gcp_signatories.mjs syncs against coolcoalition.org (found + fixed: Philippines missing). OPEN QUESTION for CCC: South Sudan flagged in our table but absent from the Cool Coalition members directory; site banner says 75, directory lists 74 |
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
| CC-06 | Make page breaks more visible; add page numbers per tab | UI | Noah/CCC (31 Aug) | 🟡 Medium |
| CC-07 | Remove "Partner Ecosystem" section entirely. Keep crediting data sources/reports, but drop the words "partner" and "partner ecosystem" everywhere (incl. "data partner" on Emissions map). Supersedes OV-02, OV-03; touches EM-05, EM-24 | Content | Noah/CCC (31 Aug) | ✅ Done (4 Sep) — removed the Partner Ecosystem page, sidebar nav item, /dashboard/partners route, PartnersPillar + PartnerEcosystem components, and VIEW_META.partners; tests updated. Per-pillar data-source logos RETAINED (VIEW_META.sources / SourceAttribution). Still open: "data partner" wording on Emissions map = EM-24 |
| CC-08 | Stop talking only about ACs. Cover refrigerators too; use "space cooling and refrigeration" where broad | Narrative | Noah/CCC (31 Aug) | 🔴 High |
| CC-09 | Clarify all emissions units: annual vs cumulative. Add "/yr" to headings, y-axes, hovers, top-line figures | Narrative | Noah/CCC (31 Aug) | 🔴 High |
| CC-10 | Spell out every acronym on first use (GWP, MEPS, etc.) | Content | Noah/CCC (31 Aug) | 🟡 Medium |
| CC-11 | New build: "Latest News in Cooling" bubble. Prominent oval top-right of landing page, repeated on each tab's front page. Christina Hayes supplies summaries at an agreed cadence | UI / Content | Noah/CCC (31 Aug) | ✅ Done (per Manuel 4 Sep design: box on the side + single news page) — new /dashboard/news page (all items, category filters); Sidebar "Latest News" panel replaced by a "Cool News" link box to that page; Overview big below-section replaced by a compact "Cool News" box teasing the 3 latest and linking to the page. Still needs: Christina's cadence/format for supplying summaries; follow-up = remove dead news CSS left in Sidebar/OverviewPillar |

---

## PRIORITY SUMMARY

Counts include the 31 Aug Noah/CCC batch. "Superseded" = prior Done items overridden by a new Noah item (not counted as open or done).

| Pillar | 🔴 High | 🟡 Medium | 🔵 Blocked | ⚪ Low | ✅ Done | ⚠️ Superseded |
|--------|---------|----------|-----------|-------|--------|--------------|
| Overview | 2 | 6 | 0 | 0 | 2 | 2 (OV-02, OV-03) |
| Emissions | 7 | 7 | 1 | 0 | 12 | 0 (EM-09 reopened as EM-27) |
| MEPS | 8 | 6 | 0 | 0 | 13 | 2 (ME-12, ME-17) |
| Kigali | 5 | 5 | 0 | 0 | 9 (1 discarded) | 0 |
| Access | 0 | 0 | 1 | 0 | 7 (1 discarded) | 0 |
| Policy | 1 | 1 | 1 | 1 | 10 | 0 |
| Cross-cutting | 4 | 5 | 0 | 0 | 2 | 0 |
| **Total** | **27** | **34** | **3** | **1** | **55** | **4** |

---

## EXTERNAL DEPENDENCIES

| Dependency | Blocks | Owner | Status |
|------------|--------|-------|--------|
| CLASP data review (Ari + Jiayi, post-leave) | ME-04 to ME-13, ME-14 | CLASP | Awaiting scheduling |
| Abdel Aziz modelling data (UNEP/AUC) | EM-13, EM-14 | Lily Riahi/UNEP | Awaiting receipt |
| CPR logo update | PO-11 | Jamie/CPR | Awaiting receipt |
| LBNL datasets (inverter + refrigerant market) | ME-14, ME-23, KI-07, KI-12 | LBNL / Nihar Shah | Noah authorizes (31 Aug) sharing even if less granular or password-protected. Agree the model on the call, then confirm scope with Nihar |
| Cool News summaries + cadence | CC-11 | Christina Hayes/CCC | Agree cadence and format on the call |
| Sneha Sachar link list (GCP / raise-the-floor docs) | ME-27 | Sneha Sachar/CCC | Reach out for recommended articles and reports |
| Access & National Plans feedback | AC-09 | Noah/CCC | Awaited as a follow-up |

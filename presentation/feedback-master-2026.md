# CoolProgress Dashboard — Master Feedback Register
**Last updated:** 2026-10-30  
**Total items:** 127 original IDs + 84 site-review IDs + 31 numbers-audit IDs (NU) = 242. Original items: 103 done, 14 open (5 High / 6 Medium / 2 Blocked / 1 Low), 4 superseded, 6 skipped/discarded/removed. Site review items and numbers audit (NU-01 to NU-31, 19 High / 12 Medium): see the two 26 Oct sections at the bottom. Numbers audit report: presentation/numbers-audit-2026-10-26.md. See Priority Summary.  
**26 Oct session:** Closed KI-15 (GWP vocabulary + ladder infographic), KI-17 (Market Momentum sourced and highlighted), KI-20 (Resources grid fixes + 7 new resources), ME-25 (country x appliance MEPS lookup), CC-09 (Kigali chart /yr), CC-10 (stat-card acronyms + NDC). Skipped KI-13 and CC-06 (decision Manuel). Ran a full read-only review of every page (4 agents: Overview/Emissions/News/auth, MEPS/Kigali, Access/Policy, methodology/shared layout) and logged the findings as new IDs in the "SITE REVIEW 26 OCT 2026" section. Also fixed the register itself (Priority Summary Done counts were stale, External Dependencies listed closed items). All 21 Oct and 26 Oct work is UNCOMMITTED, including the untracked /methodology/emissions-map route. Build passes; svelte-check 0 errors; 6 unit tests fail identically before and after (stale tests, logged as CC-21).  
**30 Sep session (part 1):** Overview text pass closed — OV-08 (launch framing rewrite), OV-09 (drop inline tons/%), OV-10 (anchor 7%→10% by 2050), OV-11 (drop TWh bullet, two rows of three), OV-12 (already present), OV-13 (passive rewrite), OV-14 (low/ultra-low GWP vocab + lifecycle management), OV-15 (spell out MEPS). Touches OverviewPillar.svelte + FourPillarFramework.svelte.  
**30 Sep session (part 2) — code audit vs register (4 read-only agents):** Found 7 items marked open that were ALREADY DONE in code — EM-25, ME-15, ME-19, KI-16, KI-18, PO-11 (CPR logo already swapped, register said blocked), CC-08 — now flipped to ✅ with file:line evidence. Several items re-scoped to ⚠️ PARTIAL with the exact remaining work (EM-29, ME-21, ME-22, ME-25, ME-28, KI-17, KI-20, PO-09, PO-12, CC-09, CC-10). Priority Summary counts also RECONCILED to the actual table rows (the earlier High/Medium totals were inflated and did not match the tables).  
**8 Sep session:** Emissions batch closed — EM-17 (direct/indirect definitions), EM-21 (number formatting / MT/yr / annual-emissions legend), EM-26 (trajectory axis label), EM-27 (AC-stock chart contradiction + axis units). CC-09 (annual-vs-cumulative /yr sweep) done for the Emissions pillar; Kigali/MEPS/Overview still pending.  
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
| OV-08 | Rewrite launch framing: open with "Cool Progress is a website designed to…", then the big frame (warming world, people turn to AC/fans, IEA 3B additional ACs by 2050 with India/Indonesia largest, grid stress/outages/warming loop, then >1B lack the cooling they need) | Narrative | Noah/CCC (31 Aug) | ✅ Done (30 Sep) — hero rewritten in OverviewPillar: opens "Cool Progress is a website designed to…", then warming→AC/fans→IEA 3B more ACs by 2050 (India & Indonesia largest)→fossil-fuel grids + refrigerant leaks→grid stress/outages/warming loop→>1B still lack cooling |
| OV-09 | Drop tons and %-of-global-emissions from intro text (already shown in graphics below) | Content | Noah/CCC (31 Aug) | ✅ Done (30 Sep) — removed "approximately 7%" and "7.2 billion tonnes CO₂e by 2050" from hero prose; figures remain in the stat cards + graphics below |
| OV-10 | Anchor on "7% of global GHG today, growing to 10% by 2050" | Narrative | Noah/CCC (31 Aug) | ✅ Done (30 Sep) — hero stat card now "~7% … rising to ~10% by 2050 under business-as-usual" (was "7.2 Gt CO₂e") |
| OV-11 | Remove TWh-savings (MEPS) bullet at bottom; cleaner two rows of three | UI | Noah/CCC (31 Aug) | ✅ Done (30 Sep) — removed the "Save 1,300 TWh" benefit; opportunity grid now 6 benefits = two rows of three |
| OV-12 | Opportunity text add: "…drastically reducing heat related illnesses and deaths" | Content | Noah/CCC (31 Aug) | ✅ Done — already present as the "Protect public health by drastically reducing heat-related illnesses and deaths" benefit |
| OV-13 | Passive rewrite: "Thermally focused building designs (insulation, shading, ventilation, and cool roofs) cut cooling demand at the source while enhancing thermal comfort" | Content | Noah/CCC (31 Aug) | ✅ Done (30 Sep) — FourPillarFramework "Building & Passive Cooling" description reworded to the exact requested phrasing |
| OV-14 | Refrigerants: say "ultra-low GWP" (or low and ultra-low), add lifecycle management (leak prevention, end-of-life venting); lock common vocabulary (low <750, ultra-low <10). Ties to KI-15 | Narrative | Noah/CCC (31 Aug) | ✅ Done (30 Sep) — FourPillarFramework refrigerants card now "low- and ultra-low-GWP … managing them across their lifecycle"; bullets lock the vocab (low <750, ultra-low <10; R-32/R-290/R-600a) and add lifecycle management (leak prevention + end-of-life recovery). Kigali-pillar definitional work still tracked under KI-15 |
| OV-15 | Page 4 label: "MEPS" becomes "energy efficiency standards or regulations" (readers won't know MEPS) | Content | Noah/CCC (31 Aug) | ✅ Done (30 Sep) — MEPS now spelled out on first use ("minimum energy performance standards (MEPS)") in both the FourPillarFramework efficiency bullet and the Overview five-pillar strip; the visible priority-area label is already reader-friendly ("Energy Efficient Products") |

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
| EM-17 | Fix definitions: direct = refrigerant leaks; indirect = CO2 from electricity generation at power plants | Content | Noah/CCC (31 Aug) | ✅ Done (8 Sep) — map intro reworded to "direct emissions (refrigerant that leaks from cooling equipment)" + "indirect emissions (the CO₂ released at power plants generating the electricity that runs the equipment)"; country-select prompt aligned ("indirect power-plant CO₂") in EmissionsPillar |
| EM-18 | Add ~70% usage (indirect) / ~30% leakage (direct) split, with caveat it varies by equipment/refrigerant/grid and shifts over time. NEEDS the correct figure (Noah's is a guess) | Content | Noah/CCC (31 Aug) | ✅ Done — Noah's guess CONFIRMED by literature: ~71% indirect / 29% direct for the RAC sector (UNEP Ozone Secretariat briefing note + Green Cooling Initiative; IEA ~70/30 for mobile AC). Text now states ~70% indirect / ~30% direct with the varies-by-equipment/refrigerant/grid + shifts-over-time caveat and inline source. Note: domestic fridges are >95% indirect (backs EM-28) |
| EM-19 | Top-line figures in GT not MT (5,950 MT becomes ~6 GT); fewer significant figures | UI | Noah/CCC (31 Aug) | ✅ Done — stat cards now 2.3 Gt (today) and 6 Gt (2050 BAU); Header insight text updated to match. Detailed Mt breakdowns kept in hover context |
| EM-20 | Reword Pillar 3 cross-ref to drop "Kigali" (not yet introduced): "For more information about refrigerants and work to transition away from HFCs, see Pillar 3" | Content | Noah/CCC (31 Aug) | ✅ Done — cross-ref reworded, "Kigali Amendment ratification status" removed |
| EM-21 | Number formatting: commas as thousands separators (1,312 not 1.312); map hover shows MT/yr; legend says "annual emissions" | UI | Noah/CCC (31 Aug) | ✅ Done (8 Sep) — map hover totals + per-appliance/subsector breakdowns now read "Mt CO₂/yr" / "Mt/yr"; map legend labels (dynamic + static) now "Annual … Emissions (Mt CO₂/yr):"; map caption "Annual cooling-sector emissions, Mt CO₂/yr"; trajectory tooltip uses toLocaleString (comma thousands). Stat cards already comma-separated |
| EM-22 | Add caveat: map shading is NOT normalized for population or climate, so not a ranking of country performance | Narrative | Noah/CCC (31 Aug) | ✅ Done (21 Oct): caveat callout under the map caption: shading is absolute, not adjusted for population or climate, so not a ranking of country performance (EmissionsPillar). Same point repeated on the new map methodology page |
| EM-23 | Fix confusing "over 1 GtCO2e annually" sentence (contradicts earlier 2.3 GT/yr; fast-growing-regions logic doesn't follow) | Narrative | Noah/CCC (31 Aug) | ✅ Done — removed the contradictory "over 1 GtCO₂e annually" clause; reworded so fast-growing-regions point reads clearly |
| EM-24 | Emissions map: remove logos and "data partner" term. Part of CC-07 | UI | Noah/CCC (31 Aug) | ✅ Done (4 Sep) — "data partner" wording gone dashboard-wide: every "Data Partners" bar (Emissions, MEPS, Kigali, Access) now reads "Data Sources"; Overview "Powered by Our Partners" → "Our Data Sources" (dead "View All" link to removed partners page deleted); RightPanel "Data & Knowledge Partners" → "Sources"; handshake icons → database. Logos RETAINED per Manuel (keep data referenced with logos as now), so the "remove logos" half of EM-24 is intentionally NOT applied |
| EM-25 | Pledge text + progress link appears out of context; introduce it properly or remove | Narrative | Noah/CCC (31 Aug) | ✅ Done (verified 30 Sep audit) — pledge is now a framed "Global Cooling Pledge Alignment" badge with target/signatory context + Progress Report link (EmissionsPillar.svelte:1578-1587), not stray text |
| EM-26 | Emissions trajectory chart: label as "annual emissions (Mt CO2/yr)" | UI | Noah/CCC (31 Aug) | ✅ Done (8 Sep) — "Emissions Trajectory — Scenario Comparison" chart y-axis now "Annual emissions (Mt CO₂/yr)" + tooltip appends "Mt CO₂/yr" with comma thousands; country-detail line chart y-axis also relabelled |
| EM-27 | ⚠️ REOPENS EM-09. AC-stock chart still confuses "3B additional by 2050" with a graph showing ~3B total / +1.5B increase; y-axis says "millions of units" but values are billions (confirmed in his screenshot). Noah's 31 Aug instruction wins over the earlier "verified, closed" | Data accuracy | Noah/CCC (31 Aug) | ✅ Done (8 Sep) — root cause was two AC-stock series shown together: subtitle pulled hardcoded IEA/CCC (3.1B→6.5B) while bars plot live CLASP data (~1.5B→3.2B). Fixes: (1) ApplianceGrowthChart subtitle now DERIVED from the plotted BAU data (2025 vs 2050) so heading can't contradict bars; (2) y-axis title "Millions of units" → "Units in use" (ticks already show B/M); (3) scope note added under the chart distinguishing CLASP-modelled residential split AC from the "~3 billion ACs today" all-types IEA headline (not in conflict) |
| EM-28 | Add note: household refrigerators have very low direct emissions (industry already shifted to ultra-low-GWP refrigerants, e.g. R-600a) | Content | Noah/CCC (31 Aug) | ✅ Done — note added to the direct/indirect paragraph (R-600a, direct challenge concentrated in AC) |
| EM-29 | Document map methodology: how HFC emissions are integrated per country, the HFC source, and its reliability | Data accuracy | Christina Hayes/CCC (31 Aug) | ✅ Done (21 Oct): new page /methodology/emissions-map (also carded on /methodology index); map "Methodology" link repointed from the dead /methodology#emissions-map anchor. Covers: GCI/HEAT default vs CLASP indirect-only view, 176 countries / 2 subsectors / BAU-KIP-KIP_PLUS (verified in Supabase), bottom-up HFC method (stock → charge/refrigerant mix → operating + end-of-life leakage → GWP), per-country summation formula, reliability caveats (modelled not inventory, input quality varies, 2 subsectors only, absolute, annual). Method text restored from the older methodology page dropped in bbae5d2. OPEN CHECK for Manuel: confirm GWP basis (AR4/AR5) and leak-rate source if you want them named |

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
| ME-15 | Super-efficient fans story: ~2M India sales, 50% energy reduction, price drop | Content | Noah/CCC | ✅ Done (verified 30 Sep audit) — "Super-Efficient Fans" section (MepsPillar.svelte:1061-1089) carries all three facts: ~2M India sales (BEE star ratings), ~50% less electricity, falling prices |
| ME-16 | High-temp + high-humidity operating conditions context — core to 5x efficiency / GCP story | Content | Noah/CCC | ✅ Done (21 Oct): new "Built for the Real Climate" section after The Inverter Revolution. High heat: ratings measured at 35°C, efficiency −2.5%/°C above that, 17–28% more power at 45–50°C, 5-star worse than 1-star at 45°C (CSE India lab study, 2016). Humidity: latent (moisture) load in humid climates, why local-bin seasonal metrics (ISEER, NSEER) and high-ambient tests matter. GCP story: Govt of India + Mission Innovation + RMI, field/lab tests in India Sep 2020–Mar 2021, Daikin/Nikken Sekkei and Gree/Tsinghua >5x lower climate impact by decoupling heat and humidity control, lifecycle cost ~half of baseline. Sources linked inline |
| ME-17 | MEPS map metric (MEPS/labels count) unexplained — add tooltip or remove | UI | Noah/CCC | ⚠️ SUPERSEDED by ME-26 (Noah 31 Aug): remove the map entirely (most countries have MEPS; stringency is the real question). The tooltip fix is moot |
| ME-18 | Recent MEPS updates section: China fridges, Nigeria ACs, ASEAN harmonization | Content | Noah/CCC + Patrick | ✅ Done 3 Jul 2026 — section rewritten with verified facts (GB 12021.2-2025, Nigeria Feb 2025 NSEER phases, ASEAN roadmap + Singapore 6.10, SADC/EAC card added); stale "under review" disclaimers replaced |
| ME-19 | U4E country assessments: at least one example shown | Content | Noah/CCC | ✅ Done (verified 30 Sep audit) — "U4E Country Savings Assessments" block (MepsPillar.svelte:1253-1269) + concrete examples (Nigeria, ASEAN/Singapore, SADC/EAC). Assessments linked out rather than embedded |
| ME-20 | Lifecycle cost (LCC) data: total cost of ownership per product and country | Data gap | Foundation (London) | 🟡 Medium |
| ME-21 | Reflow section: (1) growth to future emissions + grid stress dialed up (ACs up to 50% of peak in heatwaves in some countries, outage risk); (2) MEPS as key policy setting the floor, avoiding locked-in waste over 10+ yr lifetimes; many countries lack/have weak or old MEPS | Content | Noah/CCC (31 Aug) | ✅ Done (21 Oct): The Challenge now opens with the reflow. (1) Growth to more emissions and grid stress: cooling ~50% of peak demand in Saudi Arabia, India ~10% to 45% by 2050 (IEA, same figures as the PeakLoadChart data), heatwave surges and outage risk. (2) MEPS as the key policy setting the floor, 10+ yr lifetimes lock in waste, many countries have none or weak/outdated MEPS. Then the MEPS/labels explainer |
| ME-22 | Move U4E country assessments up front, framed as savings/benefits potential, with at least one example (extends ME-19) | Content | Noah/CCC (31 Aug) | ✅ Done (21 Oct): U4E Country Savings Assessments block moved up front (directly after The Challenge, before Environmental Dumping), reframed as "What stronger standards could save", with a Nigeria worked example: AC MEPS (Feb 2025) expected to save 11.5 TWh/yr and 39 Mt CO₂ by 2040 (U4E via IIR). Link updated to csa.united4efficiency.org (old URL 301s there) |
| ME-23 | Inverter penetration story + "% inverters by country" plot. Flagged in caps as the single most important addition. Same data as ME-14, now unblocked by Noah's password-protected authorization | Content / Data gap | Noah/CCC (31 Aug) | 🔴 High, ⚠️ PARTIAL (6 Nov, 919718e): global inverter share chart (JRAIA, demand weighted, 7 regions, 2021 to 2024: 81, 83, 85, 82%) added to The Inverter Revolution via new charts/GlobalInverterShareChart.svelte; global only per Manuel. Country plot still needs LBNL data (ME-14) |
| ME-24 | ⚠️ Factual correction, REVERSES ME-12. Inverter savings is ~25–30%, NOT "up to 60%" (60% is a reach goal no model meets today). Undo what shipped. Urgent (published error) | Data accuracy | Noah/CCC (31 Aug) | ✅ Done — headline stat + body reverted to "25% to 30%" in MepsPillar (Global Cooling Prize 5x kept as a reach goal, not achievable savings) |
| ME-25 | Add country x appliance MEPS lookup (dropdowns, e.g. Nigeria + refrigerators), with caveat that differing test methods/metrics prevent apples-to-apples comparison | UI / Content | Noah/CCC (31 Aug) | ✅ Done (26 Oct, uncommitted): new MepsLookup component under the MEPS Stringency chart. Country + appliance dropdowns (AC / refrigerators / fans, default Nigeria + AC) give a one-line summary (mandatory/voluntary MEPS, label, last adoption year), the verified MEPS level and next step where the July 2026 review has one (with legal source link), and the deduplicated CLASP policy records with links. Non-comparability caveat (CSPF/ISEER/NSEER/EER) shown. `notes` column added to the meps fetch for the CLASP links |
| ME-26 | ⚠️ Remove the "has MEPS?" map. Supersedes ME-17 | UI | Noah/CCC (31 Aug) | ✅ Superseded by Manuel (4 Sep): KEEP the map. Instead: (1) show the last-update year prominently on map hover (1.25em bold), (2) darkened the low-contrast tooltip text — greys were #ddd/#aaa on a white tooltip, now #334155/#64748b with a dark navy country name and a colour-swatch status label. MepsPillar map mouseover |
| ME-27 | Add "raise the floor" pivot: Global Cooling Prize work, the 60% efficiency + better-refrigerant goal, key documents. Contact Sneha Sachar for the best links | Content | Noah/CCC (31 Aug) | 🟡 Medium |
| ME-28 | Reword dumping line: "…offload their least efficient models into markets that don't have efficiency regulations, or that have weaker or outdated ones" (dumping can be legal where MEPS are weak) | Content | Noah/CCC (31 Aug) | ✅ Done (21 Oct): dumping line now "offload their least efficient models into markets that don't have efficiency regulations, or that have weaker or outdated ones" |
| ME-29 | Broaden ceiling-fans framing: not only for those who can't afford AC; households (e.g. India) often own both | Content | Noah/CCC (31 Aug) | ✅ Done (21 Oct): fans intro reframed: most widely owned cooling appliance, main option for those without AC but not only a substitute, many households (e.g. India) own both. Closing paragraph aligned |

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
| KI-13 | Broaden products at the top beyond Residential AC + Domestic Refrigerators (supermarkets, heat pumps, commercial refrigeration/AC, etc.) | Content | Christina Hayes/CCC (31 Aug) | Skipped 26 Oct 2026 (decision Manuel): product badges stay Residential AC + Domestic Refrigerators |
| KI-14 | Reword "The Challenge" tagline ("…leaking the climate away") to e.g. "Refrigerant leaks are a massive climate risk" | Content | Christina Hayes/CCC (31 Aug) | ✅ Done — tagline now "Refrigerant leaks are a massive climate risk." in KigaliPillar |
| KI-15 | Define GWP terms objectively, introduce "ultra-low GWP", consider a GWP infographic (his image2 is the reference). Ties to OV-14 | Content | Christina Hayes/CCC (31 Aug) | ✅ Done (26 Oct, uncommitted): new "Speaking the Same Language" section after The Challenge in KigaliPillar. Defines GWP neutrally (no single official definition; term used for anything from <1,000 to <10) and adds a 5-band ladder infographic modelled on Christina's reference: Very high (2,500+), High (750 to 2,500), Low (<750), Very low (<150), Ultra-low (<10), tagged Today / Transition / Target with AR4 examples. Each boundary is anchored on regulation: EU F-Gas servicing ban (2,500), EU split-AC limit and US AIM Act 700 (750), EU 2024/573 (150), California SB 1206 definition and NY Part 494 (10). Keeps the Overview vocabulary (low <750, ultra-low <10, OV-14). Adds lifecycle-management point and AR4 basis note |
| KI-16 | Replace busy Kigali schedule table with a graph; use color to group countries; summarize groups alongside | UI | Christina Hayes/CCC (31 Aug) | ✅ Done (verified 30 Sep audit) — dense table replaced by a colour-coded 4-card phase-down group grid + transition stepper with per-group country summaries (KigaliPillar.svelte:1256-1345). Note: card/stepper layout, not a plotted timeline |
| KI-17 | Elevate the "market momentum" note into a standout point, with sources | Content | Christina Hayes/CCC (31 Aug) | ✅ Done (26 Oct, uncommitted): Market Momentum callout now a highlighted box with figures and sources: Godrej & Boyce R-290 line (300,000 units/yr capacity, >600,000 sold with no reported incidents by 2019, IIR 2019), Midea/Gree/Haier conversions with MLF support (UNEP OzonAction), GCI R290 Split AC Resource Guide 2025. "At scale" wording softened in the matching stat card |
| KI-18 | Ratification map: define "more ambitious"; some approved KIPs exceed the 10%/2029 floor but don't show. Should they? | Data accuracy | Christina Hayes/CCC (31 Aug) | ✅ Done (verified 30 Sep audit) — "more ambitious" coded in getKipTier() (KigaliPillar.svelte:339-360): >10% at 2029 or >12% otherwise; distinct colour via getKigaliColor() + legend (:408-411); KIP overrides drive it |
| KI-19 | ⚠️ BUG: clicking some countries shows "undefined % by undefined". Check data source / manual entry. Urgent (visible bug) | UI bug | Christina Hayes/CCC (31 Aug) | ✅ Done — KIP override with missing step pct/year now falls back to the default schedule instead of rendering "undefined% by undefined" (KigaliPillar kip1/kip2 guards) |
| KI-20 | Resources fixes + adds: CARB SB 1206 next to NY Part 494; label "EIA International" as "EIA UK" and use EIA-US for AIM Act; add EPA HFC Data Hub, Cool Technologies, Climate-Friendly Supermarkets (+scorecard), Multilateral Fund CP data, Ozone Secretariat data center, UC Berkeley KigaliSim | Links | Christina Hayes/CCC (31 Aug) | ✅ Done (26 Oct, uncommitted): "EIA International" relabelled EIA UK; EIA US climate campaign link added to the AIM Act card; NY Part 494 card now also covers California SB 1206 (CARB page) + EIA US state policy tracker; new cards for EPA HFC Data Hub, MLF Country Programme data centre, Ozone Secretariat data centre, KigaliSim (UC Berkeley), Cool Technologies, Climate-Friendly Supermarkets (+ scorecard). All URLs checked live (200) |

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
| PO-09 | Regulation behind pledges: surface binding national instrument per GCP/NDC/NCAP commitment | Content | CCC convention | 🔴 High — ⚠️ PARTIAL (30 Sep audit): binding instruments named only in a static "Equivalent Policies in High-Income Countries" block (PolicyPillar.svelte:1170-1197: US AIM Act/DOE/IRA, EU F-Gas/Ecodesign/EPBD, Japan Top Runner). Global-North only, hard-coded, NOT wired per selected country/commitment. TO DO: per-country/per-pledge instrument linkage |
| PO-10 | Policy pillar: full broken link audit (Cool Coalition Cooling Watch, CPR, Resources) | Links | Jamie/CPR | ✅ Done 6 Jul 2026 — 22 links tested, 8 broken links fixed with verified replacements (Cooling Watch → UNEP GCW 2025, NCAP tracker → GCP Progress Dashboard, CCAC guidance PDF, UNEP NCAP methodology, GCI NDC Helpdesk, IFC Cooler Finance landing page, MENA NCAP methodology → CCAC, Ozone Secretariat Kigali page); unep/wedocs/undp 403s verified as bot-blocks, pages live |
| PO-11 | CPR logo update — new version awaited from Jamie | Links | Jamie/CPR | ✅ Done (verified 30 Sep audit) — new logo already swapped: static/images/cpr-logo-dark.png (full-size asset, committed bbae5d2), wired in partner-data.ts:218 and rendered in PolicyPillar (:1012, :1136); old placeholder assets no longer referenced. Register was stale |
| PO-12 | Regulation linkage: connect pledges to national law via CPR index | Content | CIFF (London) | 🟡 Medium — ⚠️ PARTIAL (30 Sep audit): CPR gateway boxes exist (PolicyPillar.svelte:1009-1027, 1133-1150) + partner-data.ts CPR "NCAP Finder", but all links are generic (homepage / static search), not per-country/per-pledge deep links. Feature present but shallow |
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
| CC-06 | Make page breaks more visible; add page numbers per tab | UI | Noah/CCC (31 Aug) | Skipped 26 Oct 2026 (decision Manuel) |
| CC-07 | Remove "Partner Ecosystem" section entirely. Keep crediting data sources/reports, but drop the words "partner" and "partner ecosystem" everywhere (incl. "data partner" on Emissions map). Supersedes OV-02, OV-03; touches EM-05, EM-24 | Content | Noah/CCC (31 Aug) | ✅ Done (4 Sep) — removed the Partner Ecosystem page, sidebar nav item, /dashboard/partners route, PartnersPillar + PartnerEcosystem components, and VIEW_META.partners; tests updated. Per-pillar data-source logos RETAINED (VIEW_META.sources / SourceAttribution). Still open: "data partner" wording on Emissions map = EM-24 |
| CC-08 | Stop talking only about ACs. Cover refrigerators too; use "space cooling and refrigeration" where broad | Narrative | Noah/CCC (31 Aug) | ✅ Done (verified 30 Sep audit) — all pillars now cover refrigeration (Kigali refrigerant-centred; MEPS treats Domestic Refrigeration as first-class; Overview "air conditioners and refrigeration equipment"; Policy "MEPS for AC and refrigeration"). Caveat: exact phrase "space cooling and refrigeration" not used, and Access is the lightest (appliance-level only) |
| CC-09 | Clarify all emissions units: annual vs cumulative. Add "/yr" to headings, y-axes, hovers, top-line figures | Narrative | Noah/CCC (31 Aug) | ✅ Done (26 Oct, uncommitted): Kigali direct-emissions chart axis now "Annual direct emissions (Mt CO₂e/yr)" and tooltip appends /yr. Follow-ups found in the 26 Oct review: CO₂ vs CO₂e labels on the Emissions map (EM-32) and the Kigali country card units (KI-23) |
| CC-10 | Spell out every acronym on first use (GWP, MEPS, etc.) | Content | Noah/CCC (31 Aug) | ✅ Done (26 Oct, uncommitted): stat cards now spell out at first use: MEPS and CSPF (MEPS cards), HFC and GWP (Kigali cards), NDC (Overview pillar card, Policy GCP card, pillar-content policy body). Remaining per-page gaps logged as CC-16 |
| CC-11 | New build: "Latest News in Cooling" bubble. Prominent oval top-right of landing page, repeated on each tab's front page. Christina Hayes supplies summaries at an agreed cadence | UI / Content | Noah/CCC (31 Aug) | ✅ Done (per Manuel 4 Sep design: box on the side + single news page) — new /dashboard/news page (all items, category filters); Sidebar "Latest News" panel replaced by a "Cool News" link box to that page; Overview big below-section replaced by a compact "Cool News" box teasing the 3 latest and linking to the page. Dead news CSS removed from Sidebar.svelte + OverviewPillar.svelte (25 Sep 2026). Cadence/format confirmed: Christina Hayes (CCC) sends a weekly "Cooling Updates" digest most Fridays; it now REPLACES the news feed. 25 Sep 2026: rebuilt partner-news.ts from her 09/11 digest (News/NEWS.docx), 20 items as full-width bars grouped into "In case you missed it / Upcoming events / Other interesting reads", real source hyperlinks attached from the docx rels. Refresh workflow: Christina sends digest → Manuel pastes into News/NEWS.docx → ask Claude to update partner-news.ts |

---

## PRIORITY SUMMARY

Counts RECOUNTED from the table rows on 26 Oct 2026 (the 30 Sep Done column had gone stale: Emissions said 19, actual 28). "Closed other" = skipped, discarded or removed. Superseded items are counted separately.

**Original register (127 IDs)**

| Pillar | 🔴 High | 🟡 Medium | 🔵 Blocked | ⚪ Low | ✅ Done | ⚠️ Superseded | Closed other |
|--------|---------|----------|-----------|-------|--------|--------------|--------------|
| Overview | 0 | 0 | 0 | 0 | 11 | 2 (OV-02, OV-03) | 2 (OV-06, OV-07) |
| Emissions | 0 | 0 | 1 (EM-14) | 0 | 28 | 0 | 0 |
| MEPS | 2 (ME-14, ME-23) | 2 (ME-20, ME-27) | 0 | 0 | 23 | 2 (ME-12, ME-17) | 0 |
| Kigali | 2 (KI-07, KI-12) | 0 | 0 | 0 | 16 | 0 | 2 (KI-09, KI-13) |
| Access | 0 | 0 | 1 (AC-09) | 0 | 7 | 0 | 1 (AC-06) |
| Policy | 1 (PO-09) | 1 (PO-12) | 0 | 1 (PO-14) | 11 | 0 | 0 |
| Cross-cutting | 0 | 3 (CC-03, CC-04, CC-05) | 0 | 0 | 7 | 0 | 1 (CC-06) |
| **Total** | **5** | **6** | **2** | **1** | **103** | **4** | **6** |

**26 Oct site review (84 new IDs, all open)**

| Area | 🔴 High | 🟡 Medium | ⚪ Low |
|------|---------|----------|-------|
| Overview (OV-16 to OV-23) | 2 | 4 | 2 |
| Emissions (EM-30 to EM-40) | 3 | 7 | 1 |
| MEPS (ME-30 to ME-41) | 4 | 6 | 2 |
| Kigali (KI-21 to KI-30) | 2 | 7 | 1 |
| Access (AC-10 to AC-17) | 2 | 5 | 1 |
| Policy (PO-15 to PO-23) | 3 | 5 | 1 |
| Cross-cutting (CC-12 to CC-21) | 1 | 6 | 3 |
| Methodology (MT-01 to MT-08) | 2 | 6 | 0 |
| Feedback page (FB-01 to FB-03) | 2 | 1 | 0 |
| News (NW-01 to NW-03) | 1 | 1 | 1 |
| Login (AU-01, AU-02) | 0 | 1 | 1 |
| **Total** | **22** | **49** | **13** |

**26 Oct numbers audit (31 NU IDs, all open):** 19 🔴 High, 12 🟡 Medium. CC-13 superseded by NU-23, so the site-review Cross-cutting Medium count is now 5 and the site-review total Medium 48.

Note: several original 🔴/🟡 items are gated on external data (ME-14/ME-20/ME-23 on LBNL/Foundation, KI-07/KI-12 on LBNL, CC-03/CC-04 on data gaps) but are colour-coded by priority, not moved to 🔵 Blocked. ME-27 needs Sneha Sachar's link list.

---

## EXTERNAL DEPENDENCIES

Cleaned 26 Oct 2026: removed rows whose blocked items are all closed (CLASP review for ME-04 to ME-13, CPR logo, Cool News cadence).

| Dependency | Blocks | Owner | Status |
|------------|--------|-------|--------|
| LBNL datasets (inverter + refrigerant market) | ME-14, ME-23, KI-07, KI-12 | LBNL / Nihar Shah | Noah authorises (31 Aug) sharing even if less granular or password-protected. Tied to the BSRIA/LBNL licence talks. See also CC-18 (RLS before licensed data goes in) |
| Abdel Aziz modelling data (UNEP/AUC) | EM-14 | Lily Riahi/UNEP | Awaiting receipt (EM-13 itself is done) |
| Sneha Sachar link list (GCP / raise-the-floor docs) | ME-27 | Sneha Sachar/CCC | Reach out for recommended articles and reports |
| Access & National Plans feedback | AC-09 | Noah/CCC | Awaited as a follow-up |
| Lifecycle cost data | ME-20 | Foundation (London) | No source identified yet |
| Decision: keep or remove Kigali+ line | KI-21 | Manuel | Open |
| Open questions for Manuel / CCC | EM-29 (GWP basis AR4 vs AR5 and leak-rate source on map methodology), PO-13 (South Sudan; 74 vs 75 signatories), AU-01 (no password reset by design?) | Manuel / CCC | Open |

---

## SITE REVIEW 26 OCT 2026 (new IDs)

Read-only review of every page by 4 agents, spot-checked by Claude. File:line refs are as of 26 Oct (uncommitted tree). One agent finding was verified FALSE and dropped: the Emissions year slider is fine (both the GCI and CLASP tables hold annual data, checked in Supabase). The real error was "5-year steps" on the emissions-map methodology page, fixed 26 Oct.

### Overview
| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| OV-16 | Text calls direct refrigerant emissions "the half that efficiency standards alone cannot address", contradicting the ~70/30 indirect/direct split on Emissions (OverviewPillar.svelte:196) | Narrative | Site review | 🔴 High |
| OV-17 | AC stock stated two ways: "IEA 3 billion additional ACs by 2050" (Overview :23, :34, Noah's OV-08 wording) vs "about 3 billion ACs in use today" (EmissionsPillar :1773) and milestone "Global AC stock surpassed 3 billion" (appliance-timeseries-data.ts:249). Pick one IEA statement and use it everywhere | Data accuracy | Site review | 🔴 High |
| OV-18 | HFC warming multiplier given three ways: "up to 1,000x" (Overview :66), "up to 12,000x" (FourPillarFramework :41), "hundreds to thousands" (Emissions :1391). Use one sourced range | Narrative | Site review | 🟡 Medium |
| OV-19 | "~7% of global GHG today" (about 4 Gt) vs Emissions headline "2.3 Gt CO₂e from cooling today": label 2.3 Gt as the modelled residential scope or reconcile | Data accuracy | Site review | 🟡 Medium |
| OV-20 | Three reduction figures shown without explanation: 73% (Overview :89, :205, GCW 2025), 68% (pledge badge), 60 to 97% (GCW resource card). Say what each means and verify the 73% | Narrative | Site review | 🟡 Medium |
| OV-21 | "100 GT" wrong unit symbol and no cumulative qualifier (:77, :81): should read "100 Gt CO₂e cumulative, 2020 to 2050" | UI | Site review | 🟡 Medium |
| OV-22 | Grammar "If transitioning to energy-efficient technology … we can significantly:" (:87); unsourced causal claim "countries with cooling in their NDCs are more likely to invest in access" (:214) | Content | Site review | ⚪ Low |
| OV-23 | FourPillarFramework cards look clickable but the navigate event is never dispatched (dead `dispatch`, unused `route`); "Four Priority Areas" vs "Five Pillars" need a bridging sentence | UI | Site review | ⚪ Low |

### Emissions
| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| EM-30 | Users see "vunknown · loaded unknown" next to the CLASP logo: CLASP_DATASET_VERSION and CLASP_LOADED_AT are 'unknown' in config.ts:8-9 (rendered at EmissionsPillar :1484, ApplianceGrowthChart :456). Fill in or hide | UI bug | Site review | 🔴 High |
| EM-31 | "Activate the DECARB scenario" (:1766) refers to a toggle that does not exist; DECARB is never explained | Content | Site review | 🔴 High |
| EM-32 | The GCI view includes HFC (direct) emissions but the map, legend, tooltips and charts say "Mt CO₂/yr" (and "CO2" at :1435). Should be "Mt CO₂e/yr". Follow-up to CC-09 | Data accuracy | Site review | 🔴 High |
| EM-33 | "IEA Efficient Cooling Scenario … avoid 460 GtCO₂e by 2060 … eight years of current energy-related output" (:1580): the source is the UNEP/IEA Cooling Emissions and Policy Synthesis Report (2020), and 460 Gt is about 8 years of TOTAL GHG, not energy CO₂ | Data accuracy | Site review | 🟡 Medium |
| EM-34 | Stat cards "Gt CO₂e from cooling today / by 2050" lack /yr; the 6 Gt 2050 BAU total does not reconcile with the sub-sector figures (needs ~7x growth in commercial and cold chain). Recheck (:63-70) | Data accuracy | Site review | 🟡 Medium |
| EM-35 | "On track to double by 2040 and potentially triple by 2050" (:1391) conflicts with Overview 7% to ~10% and GCW 4.1 to 6.1 Gt | Narrative | Site review | 🟡 Medium |
| EM-36 | Scenario hints are keyed on 'Kigali Implementation' / 'Kigali+' but the option values are 'KIP' / 'KIP_PLUS', so the Kigali hints never show (:1217-1229) | UI bug | Site review | 🟡 Medium |
| EM-37 | Map and country logic bugs: country y-axis shows "500k" on a Mt axis (:814); CLASP pie and "largest share" ignore the appliance filter while the total uses it (:634-651); GCI Global Total ignores the Direct/Indirect selector (:842-865); trend sentence reads "from 2025 to 2020" for years before 2025 (:703-721) | UI bug | Site review | 🟡 Medium |
| EM-38 | AC-stock loading fallback and 2025 milestone still say 3.1B / "3 Billion ACs" over a ~1.5B CLASP bar (ApplianceGrowthChart :396-399, appliance-timeseries-data.ts:270). Follow-up to EM-27 | Data accuracy | Site review | 🟡 Medium |
| EM-39 | Global Benchmark described as "a low-ambition policy scenario" (:1740), wording CLASP/U4E may object to; the GB line reuses the Kigali Implementation colour (:1739) | Narrative | Site review | 🟡 Medium |
| EM-40 | Naming and consistency: GCI tooltip header says "HEAT |" (:550); "Kigali Amendment (OzonAction)" links to the Ozone Secretariat (:1627); "U4E: United for Efficiency Standards" (:1667); Mepsy spelled 3 ways; interpolated 2023 BAU point shown as data; range text "2025 to 2050" vs slider starting 2020 | Content | Site review | ⚪ Low |

### Product Efficiency (MEPS)
| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| ME-30 | MEPS map misses ~14 countries in its id-to-code table, incl. Egypt, Oman, Singapore (quoted in the text as first ASEAN market at CSPF 6.10), Iceland, Moldova; South Sudan keyed '970' instead of 728. They render "No Data" and cannot be clicked (MepsPillar :137-172). Reuse the Kigali table | UI bug | Site review | 🔴 High |
| ME-31 | Deep link ?country=XXX shows "No Policies" in the header while listing N policies (filters not yet initialised), then gets overridden by the global view (:945-971, :934) | UI bug | Site review | 🔴 High |
| ME-32 | "1,300 TWh … roughly India's entire output" (:46) is wrong (India generates ~1,700 to 1,950 TWh/yr); hidden config says "all of Africa". Pick one correct comparison or drop it | Data accuracy | Site review | 🔴 High |
| ME-33 | "Fixed-speed units consume two to three times more energy" (:1204) contradicts the 25 to 30% inverter saving (ME-24). Reframe as the best-vs-worst market gap | Data accuracy | Site review | 🔴 High |
| ME-34 | Global Cooling Prize described as "5x efficiency" / "five-fold improvement in efficiency" (:1080, :1083); the criterion was 5x lower climate impact | Data accuracy | Site review | 🟡 Medium |
| ME-35 | Highlight cards advertise "MEPS & Labels by Region" and "Equipment Type Coverage" charts that are not rendered; the data feeding them is always 0 (meps/+page filters requirement_type on 'MEPS'/'Label' but the field holds Mandatory/Voluntary) (:61-80) | UI | Site review | 🟡 Medium |
| ME-36 | Map legend shows 3 classes but the map paints 6 (No Policies, Other Policies, No Data missing); No Policies vs No Data greys are indistinguishable (:286-294) | UI | Site review | 🟡 Medium |
| ME-37 | China "CSPF 6.09 … matching China's current MEPS" (:1186) vs the chart's 5.17 (6.09 is the cooling-only inverter floor); ASEAN card describes Singapore inconsistently and "Thailand and Vietnam lead with mandatory inverter-class standards" is unsourced (:1227) | Data accuracy | Site review | 🟡 Medium |
| ME-38 | SADC 2024 / EAC 2025 drawn as solid "Currently Effective" lines though their status is regional_approved (only Mauritius enforces nationally). Make dashed or relabel | Data accuracy | Site review | 🟡 Medium |
| ME-39 | Fact-check the ME-16/ME-21 text: "At 45°C a 5-star AC performed worse than a 1-star model" needs CSE's exact 2016 finding; "Saudi Arabia cooling ~half of peak" comes from a 50 to 70% of TOTAL demand figure (PMC/ASME), not IEA peak (see MT-02) | Data accuracy | Site review | 🟡 Medium |
| ME-40 | Smaller content issues: "~2M super-efficient fan sales in India" unsourced and likely understated (:1127); CLASP "Bridging the Cooling Gap" box links the homepage; "Top Ten" is Topten, not SEAD (:1374); U4E box uses the UNEP logo (u4e-logo.png exists); "Data currently under review" placeholder under the peak-load chart plus duplicate chart title; U4E reference-line tooltip shows "(2006)" | Content | Site review | ⚪ Low |
| ME-41 | Code hygiene: policy names from the DB inserted into innerHTML unescaped (:417, :434, :477, :632); d3 and world-atlas loaded from CDNs while Kigali uses bundled copies; Labels badge #D4A843 on #fef3d0 at ~2:1 contrast | Code | Site review | ⚪ Low |

### Refrigerant Transition (Kigali)
| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| KI-21 | DECISION NEEDED: the Kigali+ (KIP_PLUS) scenario line is still drawn. KI-01 says "Kigali Plus line removed", but KI-06 (3 Jul, Manuel) renamed the legend to "Kigali+ accelerated", so it was kept. Confirm keep or remove; if removed, also fix the subtitle (:1259) and highlight card (:87) | Decision | Site review | 🔴 High |
| KI-22 | EU F-Gas steps rendered as "% of baseline remaining" (e.g. "5% by 2030") next to Kigali "% reduction" steps, so they read as tiny cuts. Label as quota or convert to reductions; recheck values against Reg 2024/573 Annex VII (2024 step looks like ~23%, not 31%) (:122-134, :894) | Data accuracy | Site review | 🔴 High |
| KI-23 | Country card units: "x Mt" with no CO₂e or /yr, BAU not spelled out; the savings badge shows "0.00 Mt / -100%" when a country has no KIP rows and "--5.0%" when KIP is above BAU (:859-976) | UI bug | Site review | 🟡 Medium |
| KI-24 | Direct-emissions chart spins "Loading…" forever if data fails (static branch unreachable); the static fallback is in Gt but labelled Mt (:694-712, :757) | UI bug | Site review | 🟡 Medium |
| KI-25 | Bridge "global HFC emissions triple by 2050" and caption "cuts direct emissions by over 80% … avoiding ~1 GtCO₂e/yr by 2050" do not match the chart (cut at 2045, residential AC + fridges only) | Narrative | Site review | 🟡 Medium |
| KI-26 | Bank chart: "GWP Share (%)" is actually mass share; caption claims (HCFCs still dominate, HFC-32 called a "blend", natural refrigerant share growing) do not match the plotted series; R-410A appears only as its components | Data accuracy | Site review | 🟡 Medium |
| KI-27 | Highlight cards promise "GWP Comparison" and "Transition Timeline through 2050" charts that do not exist (:65-90). The new GWP ladder (KI-15) partly answers the first; retitle or remove | UI | Site review | 🟡 Medium |
| KI-28 | Wording and facts: "Global Cooling Initiative" should be Green Cooling Initiative (:1267); "countries have ratified" vs "parties" (:1440); MLF "first triennium explicitly funding KIPs" is questionable since KIP stage-I approvals began in 2021 to 2023 (:1241); map source says ExCom 97 while the text cites ExCom 98 | Content | Site review | 🟡 Medium |
| KI-29 | Generic resource links: "CCAC: LRM Resource Hub" links the NDC guidance page; "IIR: New Parties to Kigali" links the IIR homepage; both U4E cards link the U4E homepage. Deep-link each | Links | Site review | 🟡 Medium |
| KI-30 | Smaller issues: missing records shown as "Not Ratified / Montreal Protocol: No"; hardcoded "As of April 2026 / Latest: Haiti" next to a live count; NOUs attributed to UNEP; IEA quote overreaches on phase-out; "GWP thousands of times higher" vs R-32 at 675; progress-bar colours; "phasedown" vs "phase-down" | Content | Site review | ⚪ Low |

### Access & Vulnerability
| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| AC-10 | AnimatedCounter always rounds to 1 decimal: "2.83B" shows as 2.8B and "1.05B" as 1.1B, contradicting the body text (AnimatedCounter.svelte:59; AccessPillar :57, :62). Shared component, so check all pillars | UI bug | Site review | 🔴 High |
| AC-11 | Map tooltip and country panel pair the all-risk-groups total with the high-risk-only %: Argentina "28.3M (0.9% of population)", China "1,060M (5.0%)" (:416-423, :683-686) | Data accuracy | Site review | 🔴 High |
| AC-12 | Low-risk group counted as "at risk" / "without cooling access" in the timeline totals (~5B), stacked chart and change sentence, though the page says Low risk can access cooling (:508-547, :634-641, :668) | Data accuracy | Site review | 🟡 Medium |
| AC-13 | Map captions contradict each other (millions vs %, "high-risk only") (:1105, :1110, :1132); income-group and risk-level breakdown promised on hover but not shown (:89, :1107) | Content | Site review | 🟡 Medium |
| AC-14 | Countries outside the SEforALL 77 open a panel saying "0.0M at risk … decreased by 0% since 2022" (:652-668); a true 0% (Bhutan) is drawn as No data (:229) | UI bug | Site review | 🟡 Medium |
| AC-15 | Gender chart uses all risk groups while the "512M women" headline is high risk only (:799-801) | Data accuracy | Site review | 🟡 Medium |
| AC-16 | onMount is async so its cleanup never runs: resize listeners, window globals, ECharts instances and the SVG leak and stack on revisit (AccessPillar :157; GcpEmissionsWaterfall :169-181) | Code | Site review | 🟡 Medium |
| AC-17 | Smaller issues: map load failure leaves an empty box; no "back to global view" button; timeline blank when all risk levels are unticked; progress bar unlabeled; #ThisIsCool and Source links point to the 2020 SEforALL page; "(historical)" label on a chart that includes forecasts; dead imports | UI | Site review | ⚪ Low |

### National Plans & Commitments (Policy)
| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| PO-15 | "134" used for two different claims (:1522 GCW strategy mentions, :1523 NDC 3.0 submissions); live CLASP data has 138 NDC 3.0s. Use `ndc30Submitted` | Data accuracy | Site review | 🔴 High |
| PO-16 | Stat card "<30% NDCs mentioning cooling" (:44-46, pillar-content entryStat) contradicts "134 countries reference cooling" and the CLASP data (125 of 138 NDC 3.0s mention energy efficiency) | Data accuracy | Site review | 🔴 High |
| PO-17 | NDC chart categories 'Kigali Amendment' and 'MEPS & Labels' have 0 rows in ndc_tracker_clasp, so those bars are always empty (:307-310; the real names are 'Refrigerants', 'Appliance MEPS', 'Appliance Labels'); the comparison chart duplicates the category chart (:901-966) | UI bug | Site review | 🔴 High |
| PO-18 | GCP efficiency commitment misstated as "double the average efficiency … by 2030" (:1454); the pledge says +50% for new ACs (partner-data.ts:64) | Data accuracy | Site review | 🟡 Medium |
| PO-19 | NCAPs: Brazil is grey on the map and excluded from the list but shows "Has NCAP" / "Developed" on hover and in the panel; "~25 NCAPs" hardcoded vs 29 live (6 undated); "Developed/Adopted" overstates plans still in development | Data accuracy | Site review | 🟡 Medium |
| PO-20 | Signatory figures out of sync: hardcoded "74" in the stat bar (:1663) vs live gcpCount; 37/49/40 from the Nov 2024 report (~71 signatories) shown against 74; "signed at COP28" (:1071) wrong for later signatories; pillar-content subhead "66+ countries"; partner-data CCC "74 … at COP28" | Data accuracy | Site review | 🟡 Medium |
| PO-21 | Failed data loads look like real data: counters fall back to 74/173 while the map shows every country as Non-Signatory; a map CDN failure leaves an empty box | UI bug | Site review | 🟡 Medium |
| PO-22 | NDC tooltip shows the raw value "Other" (the dropdown calls it "Previous NDC") (:420); the country panel NDC box does not say which NDC version or category it reflects and ignores filter changes (:519-531) | UI | Site review | 🟡 Medium |
| PO-23 | Smaller issues: source boxes say "charts above" when they are below (:1090, :1140); near-identical legend greys; waterfall last-bar label differs from the legend; "GCP Progress Report 2025 (coming soon)" is stale; the "three critical areas" qualifier is dropped in the stat bar; dead Kigali code and unused imports | Content | Site review | ⚪ Low |

### Cross-cutting
| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| CC-12 | Global Cooling Pledge target shown as "68% by 2050 from BAU" on the Emissions (:1586), Access (:1242) and Kigali (:1651) badges; the target is at least 68% below 2022 levels (correct on Policy). The "Progress Report" button links to the pledge homepage | Data accuracy | Site review | 🔴 High |
| CC-13 | "0.5°C avoided" (Overview :93, FourPillarFramework :40, Kigali stat card) is sourced to a UNEP page that says "up to 0.4°C by 2100". Use 0.4°C or cite the 0.5°C source (Xu et al. 2013) | Data accuracy | Site review | ⚠️ SUPERSEDED by NU-23 (the 0.4°C suggestion was wrong; WMO/UNEP 2022 gives 0.3 to 0.5°C) |
| CC-14 | Country-id maps send Greenland to Denmark and Puerto Rico to the USA (Emissions :304, Kigali :203/:218, Access :123/:138, Policy :147); on Kigali, Greenland is painted as an EU member | UI bug | Site review | 🟡 Medium |
| CC-15 | House style: visible em dashes across the site (approx. lines: Access 35, Policy 34, Kigali 26, MEPS 14, Emissions 10+, Overview 9; methodology peak-load 24, meps-stringency 10, appliance-chart 7; feedback page 4; Header 1) plus " - " separators in Policy chart titles | Content | Site review | 🟡 Medium |
| CC-16 | Acronyms still unexpanded at first use (follow-up to CC-10): Overview GHG, IEA, F-Gas, SEforALL; Emissions GCI, DECARB, BAT wording; MEPS ISEER, NSEER, U4E, BEE, EEI; Kigali HCFC, CFC, HFO, PFAS, A2L/A3, LRM, ExCom; Access SEforALL, BAU, ILO, ESMAP; Policy NCAP, GCP, AIM Act, DOE, IRA, EPBD, Article 5 | Content | Site review | 🟡 Medium |
| CC-17 | Accessibility: no ECharts aria; maps and counter tooltips mouse-only; toggles lack aria-pressed; sidebar not a nav landmark; small grey text (#94a3b8) below AA in captions, sources and methodology eyebrows; Overview priority buttons remove the focus outline | Accessibility | Site review | 🟡 Medium |
| CC-18 | Data protection: dashboard data is fetched client-side with the anon key, so the login only guards the UI. Confirm RLS on every table before any licensed (BSRIA/LBNL) data goes in; remove table names and source paths from the public methodology pages | Security | Site review | 🟡 Medium |
| CC-19 | Hidden content contradicts the visible pages and would resurface if re-wired: config.ts VIEW_META / PILLAR_INFO ("175+ ratified", "AR6", "triple", "80%", "all of Africa"); pillar-content.ts "172 parties, Feb 2026". Dead components (RightPanel, PartnerStrip, HeroSection, SourceAttribution, Emissions waterfall/cumulative) and Partner Ecosystem CSS | Code | Site review | ⚪ Low |
| CC-20 | Page titles: root layout still says "Global Cooling Intelligence Platform" (inherited by login/register/reset); every pillar shares one title; methodology title formats differ; a trailing slash breaks the active nav item | UI | Site review | ⚪ Low |
| CC-21 | 6 unit tests fail on main (stale assertions on emissions data loading, route wiring, Header #last-updated, config $env import). Same result before and after the 26 Oct changes | Code | Site review | ⚪ Low |

### Methodology pages
| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| MT-01 | emissions-map says GCI/HEAT supplies direct AND indirect emissions; appliance-chart says "GCI/HEAT models direct emissions only". The code reads both. Fix the appliance-chart wording | Data accuracy | Site review | 🔴 High |
| MT-02 | peak-load claims IEA Future of Cooling is the "sole primary source", but Saudi 50% comes from PMC/ASME (share of total demand, not peak) and the Indonesia/Brazil/Mexico cross-checks come from CCC; the 2050 values are called the IEA "Cooling Scenario" but are the Baseline | Data accuracy | Site review | 🔴 High |
| MT-03 | peak-load smaller errors: "nine countries" (eight + Middle East); says MENA is not disaggregated yet shows Saudi; mixes share of demand growth with share of peak; "single-digit baseline" vs India at 10%; uses rated cooling output instead of electrical input; the pillar calls the data "under review" while the methodology presents it as final | Data accuracy | Site review | 🟡 Medium |
| MT-04 | meps-stringency: says the chart shows "four jurisdictions" then lists seven; "2006 to 2033" range wrong for refrigerators (2018 to 2029); "contact the team for access" with no contact given | Content | Site review | 🟡 Medium |
| MT-05 | emissions-map follow-ups: CLASP BAU/GB/BAT scenarios and 3-appliance coverage not documented; "Mt CO₂/yr" should be CO₂e; fa-shield-check icon not in Font Awesome Free (blank badge, also on appliance-chart and peak-load). Fixed 26 Oct: "5-year steps" corrected to annual data, scenario codes spelled out | Content | Site review | 🟡 Medium, PARTIAL |
| MT-06 | appliance-chart: "No data is hardcoded" is untrue (fallbacks in appliance-timeseries-data.ts); EU aggregate exclusion not mentioned; fans named three ways | Content | Site review | 🟡 Medium |
| MT-07 | The methodology index covers 4 pages only; Kigali, Access, Policy, MEPS and PillarInsight "Full methodology" all link to it generically. Three different "in partnership with" lists across pages (risk of overstating partnerships) | Content | Site review | 🟡 Medium |
| MT-08 | Back links call history.back(): visitors from Google or email are sent off-site, "Back to Emissions" from the index returns to the index, open-in-new-tab is blocked; anonymous visitors are bounced to /login with no explanation | UI bug | Site review | 🟡 Medium |

### Feedback page, News, Login
| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| FB-01 | The feedback page shows the old Overview headline above the form ("…rising to 7.2 billion tonnes", with an em dash) because 'feedback' is missing from PILLAR_VIEWS / VIEW_META (+layout.svelte:19-22, Header.svelte:11) | UI bug | Site review | 🔴 High |
| FB-02 | current_pillar is never recorded: the sidebar "Give Feedback" link does not pass ?from=, so every submission is "not specified" (Sidebar.svelte:76) | UI bug | Site review | 🔴 High |
| FB-03 | Q2 still uses the removed "partners" framing; radio inputs use `hidden` so keyboard and screen-reader users cannot answer; name and email asked though the user is logged in; confirm the feedback table RLS is insert-only | UI | Site review | 🟡 Medium |
| NW-01 | News headline "Southern Europe's heat deaths are 26x more likely" vs summary "roughly ten times more likely" (partner-news.ts:162-164). Check the Nature article | Data accuracy | Site review | 🔴 High |
| NW-02 | News last updated 11 Sep (6+ weeks) despite the weekly framing; CCC attribution defined but never rendered; the news page ignores the section grouping and date order | Content | Site review | 🟡 Medium |
| NW-03 | Source labels: a Scientific Reports item labelled "Nature" (:98); "Design Boom" should be designboom; NRDC, MOU, HERA, WMO, UNECE not spelled out | Content | Site review | ⚪ Low |
| AU-01 | No "Forgot password?" path: /reset-password is only reachable through an emailed link users cannot request. Confirm this is intended under the password-only, admin-provisioned decision; if so, add a "contact the admin" line | UI | Site review | 🟡 Medium |
| AU-02 | Login has no register link, branding or title; register errors are styled like success messages; no password-length hint on reset; the root redirect is client-only | UI | Site review | ⚪ Low |

## NUMBERS AUDIT 26 OCT 2026 (NU IDs)

Full report: `presentation/numbers-audit-2026-10-26.md` (canonical value for every repeated fact, data problems D-1 to D-12, clarity rules, decisions, appendix of all 216 findings). Raw per-page tables: `presentation/numbers-audit-2026-10-26/`. 343 numbers checked: 126 correct, 44 wrong, 36 inconsistent, 60 unclear, 42 unverified, 34 data mismatch. "Fact n" refers to report section 3; "D-n" to report section 4. Where an NU item overlaps an earlier site-review ID, the NU item is the authoritative instruction (it carries the verified canonical value).

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| NU-01 | Pledge target shown as "68% by 2050 from BAU" on the Emissions, Access and Kigali badges. Use "at least 68% below 2022 levels by 2050" (fact 17). Same as CC-12 | Data accuracy | Numbers audit | 🔴 High |
| NU-02 | Pledge signatories shown as 66, 71, 72 and 74 in different places, "74 signed at COP28", "235 subnational governments". Canonical: 76 countries and 291 cities as of 26 Oct 2026; more than 60 at launch. Sync the DB (D-5), derive every count from it, show the date (fact 16; also PO-20) | Data accuracy | Numbers audit | 🔴 High |
| NU-03 | Pledge progress indicators "37 NDCs, 49 MEPS, 40 building codes" (Nov 2024, base 71; "40 building codes" never right) shown against 74. Replace with Nov 2025: of 72, 50 NDCs, 53 room-AC MEPS, 30 building codes, 25 NCAPs (fact 19) | Data accuracy | Numbers audit | 🔴 High |
| NU-04 | Pledge efficiency target stated as "double the average efficiency" (Policy) and "50%" without context (Emissions). Use "raise the global average efficiency of new ACs by 50% by 2030" (fact 18; PO-18) | Data accuracy | Numbers audit | 🔴 High |
| NU-05 | Kigali parties: site says 173, "latest Haiti, April 2026". Canonical 175 (174 countries plus the EU) as of 5 Oct 2026, latest Israel. Set MDG and ISR to parties in `kip` (D-1); say "parties" not "countries" (fact 25) | Data accuracy | Numbers audit | 🔴 High |
| NU-06 | Sustainable pathway cut given as 73% (Overview, an old dashboard calculation misattributed to GCW 2025) and 60 to 97% (Emissions). Use GCW 2025: 64% below BAU by 2050, or 97% with rapid power-sector decarbonisation (fact 7; OV-20) | Data accuracy | Numbers audit | 🔴 High |
| NU-07 | Emissions stat cards "2.3 Gt today, 6 Gt by 2050" match neither the whole sector (4.1 Gt 2022, 7.2 Gt 2050, UNEP GCW 2025) nor our modelled data (1.97 Gt 2025, 3.78 Gt 2050). Decide which to headline (report decision 3) and label scope (facts 1, 4, 5; EM-34, OV-19) | Data accuracy | Numbers audit | 🔴 High |
| NU-08 | "Double by 2040, triple by 2050" (Emissions) is wrong: UNEP says almost double 2022 to 2050, our data shows about 1.9x (fact 4; EM-35) | Data accuracy | Numbers audit | 🔴 High |
| NU-09 | Kigali bridge "HFC emissions triple by 2050" and caption "about 1 Gt CO₂e per year avoided". Data: BAU 330 to 601 Mt (about 1.8x), Kigali avoids about 480 Mt/yr in 2050 (80%); chart stops at 2045 (fact 10; KI-25) | Data accuracy | Numbers audit | 🔴 High |
| NU-10 | HFC warming vs CO₂ stated as "up to 1,000x" (Overview), "up to 12,000x per molecule" (Four Priority Areas), "hundreds to thousands" (Emissions). Use "hundreds to over 10,000 times per kilogram over 100 years" with R-32 675, R-410A 2,088, HFC-23 14,800 (fact 27; OV-18) | Data accuracy | Numbers audit | 🔴 High |
| NU-11 | "80+ countries with MEPS" (3 places on MEPS) vs our own CLASP data: 128 jurisdictions (125 countries + EU, HK, Taiwan), 111 mandatory. Use "more than 120" (fact 29) | Data accuracy | Numbers audit | 🔴 High |
| NU-12 | 1,300 TWh card: wrong scope (U4E-level standards, 156 developing and emerging economies, 5 product groups, 2050), wrong source (UN SDSN / U4E, not CLASP Mepsy), wrong comparison (India generated about 2,000 TWh in 2024). 40% card vs 40 to 50% text, also misattributed (facts 30, 31; ME-32) | Data accuracy | Numbers audit | 🔴 High |
| NU-13 | Global Cooling Prize called "5x efficiency" in two places and "5x lower climate impact" in two others. Use 5x lower climate impact (fact 33; ME-34) | Data accuracy | Numbers audit | 🔴 High |
| NU-14 | Stat counter rounds to one decimal: 2.83B shows as 2.8B, 1.05B as 1.1B, contradicting the text (facts 14, 15; AC-10) | UI bug | Numbers audit | 🔴 High |
| NU-15 | Access map and panel pair the all-risk population with the high-risk %: India "1,437M at risk (22%)" (AC-11) | Data accuracy | Numbers audit | 🔴 High |
| NU-16 | Policy NDC numbers: "134" used for NDC 3.0 submissions (tracker: 138; 134 is GCW's cooling-in-plans count); "<30% of NDCs mention cooling" vs 39% of NDC 3.0s mentioning ACs; two chart categories always 0% (facts 20 to 22; PO-15, PO-16, PO-17) | Data accuracy | Numbers audit | 🔴 High |
| NU-17 | AC stock: "about 3 billion in use today" (IEA gives about 2.4 billion in 2025); milestone "3,099 million units" over a 1.4 billion bar (D-8); CLASP note says 1.5 to 3.2 billion, chart shows 1.4 to 3.0 (EU aggregate double-counted). Canonical: IEA 2.4 billion today to 5.6 billion in 2050, about 3 billion more (facts 11, 12; OV-17, EM-38) | Data accuracy | Numbers audit | 🔴 High |
| NU-18 | GCI country data anomaly: China is 67% of the 2030 global total; GCI and CLASP disagree on AC indirect emissions in opposite directions (China 986 vs 257 Mt, India 43.5 vs 236 Mt). Ask the HEAT GCI team to check before external review (D-7) | Data accuracy | Numbers audit | 🔴 High |
| NU-19 | Direct share called "the half" (Overview) vs about 30% (Emissions). Canonical: about one third (36% in 2022, UNEP GCW 2025; about 30% for refrigeration and AC) (fact 6; OV-16) | Data accuracy | Numbers audit | 🔴 High |
| NU-20 | Kigali country panels load incomplete data: "Montreal Protocol: No" for every country (D-2), ambitious-KIP layer never shown although 31 countries qualify (D-3), Belarus/Russia/Tajikistan/Kazakhstan/Uzbekistan get the standard schedule (D-4) | Data accuracy | Numbers audit | 🟡 Medium |
| NU-21 | "460 GtCO₂e by 2060, IEA Efficient Cooling Scenario, eight years of energy-related output". Use "210 to 460 Gt CO₂e by 2060, 4 to 8 years of total global GHG emissions" (UNEP and IEA 2020) (fact 8; EM-33) | Data accuracy | Numbers audit | 🟡 Medium |
| NU-22 | "100 GT" (Overview): use "up to 100 Gt CO₂e cumulative to 2050 from super-efficient room ACs (RMI)" (fact 9; OV-21) | UI | Numbers audit | 🟡 Medium |
| NU-23 | Kigali avoided warming given as a single 0.5°C. Use "0.3 to 0.5°C by 2100" or "up to 0.5°C" (WMO/UNEP 2022). Supersedes CC-13, whose 0.4°C suggestion was wrong (fact 26) | Data accuracy | Numbers audit | 🟡 Medium |
| NU-24 | DECISION: inverter saving 25 to 30% (Noah, ME-24) has no source found; CLASP eceee 2019 gives about 20%. Also contradicted by "fixed-speed units use two to three times more energy" (fact 32; ME-33) | Decision | Numbers audit | 🟡 Medium |
| NU-25 | Peak load: Saudi Arabia 50% to 60%, Nigeria and Japan labelled as IEA but not in the IEA figure; projection is IEA's Baseline, not "Cooling Scenario"; legend says baseline 2016 to 2018 (fact 34; MT-02, ME-39) | Data accuracy | Numbers audit | 🟡 Medium |
| NU-26 | NCAPs: "~25" vs 29 in the list; timeline sums to 23 (6 undated); Brazil shown both with and without an NCAP (fact 24; PO-19) | Data accuracy | Numbers audit | 🟡 Medium |
| NU-27 | Access 2030 forecast chart 1,015M vs SEforALL 1.05 billion in the text; "urban poor grow 7% to 744M" vs data 706.6M (D-9) | Data accuracy | Numbers audit | 🟡 Medium |
| NU-28 | Passive cooling "5 to 8°C" vs UNEP GCW 2025 about 2.2°C average indoor reduction (29% energy saving); AC efficiency gap "3x" vs IEA "up to 5x" (facts 35, 36) | Data accuracy | Numbers audit | 🟡 Medium |
| NU-29 | DECISION: "~10% of global GHG by 2050" (Overview, OV-10, Noah's wording) is not in the cited UNEP report. Ask Noah for the source or drop it | Decision | Numbers audit | 🟡 Medium |
| NU-30 | Apply the clarity rules site-wide (report section 5: unit, /yr or cumulative, year, scope, baseline, as-of date, CO₂e, display precision): clears the 60 Unclear rows. Source or remove each of the 42 Unverified rows (appendix) | Content | Numbers audit | 🟡 Medium |
| NU-31 | Data hygiene: `refrigerant_bank_data` table missing so the bank chart is always static (D-6); `meps` has 559 rows but 504 unique and a Mauritius fridge record filed under AC (D-10); `refrigerants` table holds AR6 GWPs next to AR4 pages (D-12) | Data | Numbers audit | 🟡 Medium |

Fixed during the audit (26 Oct, uncommitted): GWP ladder bands no longer overlap (150 to 750, 10 to 150) and the 750 and New York limits are qualified; MEPS lookup now shows the level in force with its start year, future steps with their effective year, and estimates labelled; emissions-map methodology "5-year steps" corrected to annual.

---

## MANUEL TO DO LIST 30 OCT 2026 (new IDs)

Added by Manuel after the Progress page push (f4e055b) and the Noah briefing. Not yet started. Priorities are a first proposal; the two High items feed the open data launch discussed with Noah.

| ID | Item | Type | Source | Status |
|----|------|------|--------|--------|
| PG-01 | Progress page: calculate the data ourselves. Build the HEAT open data indicators (inverter share, average GWP) from JRAIA plus the other open sources (Comtrade, GIZ GCI, MLF, registries, literature); load the remaining JRAIA equipment groups (multi split, PAC, VRF, 162 rows prepared); decide the country layer (registry model shares, labelled as such); check JRAIA republication terms before going live. Basis: KB 05-Database/BSRIA/03-open-data-position.md | Data | Manuel (30 Oct) | 🔴 High |
| KI-31 | Check the GWP values graph(s): values must match the corrected AR6 `refrigerants` table (R-410A 2,256, R-407C 1,908, R-404A 4,728); pillar-content.ts and view-meta-v2.ts still quote R-410A 2,088 (AR4) and R-134a 1,430. Overlaps NU-31 (D-12) | Data accuracy | Manuel (30 Oct) | 🟡 Medium |
| ME-42 | MEPS map: review and update (data currency, last-update year per the ME-26 decision, duplicate `meps` rows and the Mauritius fridge record under AC per NU-31 D-10) | Data accuracy | Manuel (30 Oct) | 🟡 Medium, ⚠️ PARTIAL (6 Nov, 919718e): map now shows one appliance at a time (single-select, Air conditioners default, no combined view) and no policy counts in the hover, map note or country panel (per Manuel). Data currency and duplicate rows still open |
| KI-32 | Refrigerant Transition resources are focused on the West only (EU, US, UK). Add ASEAN sources: regional (ASEAN Centre for Energy, ASEAN SHINE) and national refrigerant and HFC rules and ozone units (for example Thailand, Vietnam, Indonesia, Philippines, Malaysia) | Content / Links | Manuel (30 Oct) | 🟡 Medium |
| KI-33 | Kigali map: add the ambitious KIP data as a layer (31 countries qualify, never shown, see NU-20 D-3), rename the layer and legend so it is clear what "ambitious" means, and add links to each country's KIP (Multilateral Fund documents) | Data / UI / Links | Manuel (30 Oct) | 🔴 High |
| PO-24 | NCAPs: update the list (count, dates, Brazil inconsistency, see NU-26) and add a link to each NCAP | Data / Links | Manuel (30 Oct) | 🟡 Medium |
| PO-25 | NDC cooling mentions: remove the current NDC cooling mention indicator and replace it with a pointer to CLASP's work on cooling in NDCs (find the right CLASP page or tracker) | Content | Manuel (30 Oct) | 🟡 Medium |
| CC-22 | Think about how Resources and the Cool News newsletter are kept up to date: cadence, owner, source (Christina's digest for news), and whether part of it can be automated | Process | Manuel (30 Oct) | 🟡 Medium |

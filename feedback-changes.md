# Feedback Changes — Implementation Checklist

> Derived from consolidated feedback (Noah/CCC, Jamie/CPR, Giorgia/SEforAll, Stefanie/HEAT, Ari/CLASP, Cool Coalition 2026-04-29, Textbausteine, Patrick/HEAT + Ari/CLASP + Manuel + Dietram session 2026-04-22, Patrick/HEAT email 2026-05-04).
> Priority: **High** / **Medium** / **Low** | Type: **Bug Fix** / **UI** / **Content** / **Data**

---

## PENDING DECISIONS (blockers — do not implement until resolved)

- [x] **Medium | UI** — RESOLVED (Option B): Cross-reference Kigali map from Emissions pillar with a link to Pillar 3: Refrigerant Transition. Implemented as styled note below direct-emissions intro. (2026-05-07)
- [x] **Medium | Data** — RESOLVED: "Green Buildings" → "Global Benchmark" (GB), "Net Zero Homes" → BAT confirmed by Ari/CLASP. Dropdown and comments updated. (2026-05-07)

---

## Overview / Front Page

- [x] **High | Content** — Fix lead statistic: replace "currently accounts for over 10%... could triple by 2050" with accurate framing — cooling is approximately 7% of emissions today and reaches approximately 10% under BAU by 2050 (does not triple).
- [x] **Medium | Content** — Remove comma: "By achieving sustainable cooling, we can prevent..." → "By achieving sustainable cooling we can prevent..."
- [ ] **Medium | UI** — Add a Sustainable Cooling Hierarchy narrative block (Passive Cooling → Low-energy/hybrid → Best energy efficiency → Rapid HFC phase-down), citing UNEP Global Cooling Watch 2025 as the source.
- [x] **Medium | UI** — Remove numbers from the four priority areas on the landing page to reduce visual confusion. Retain numbering in the sidebar navigation. (Patrick + Ari, 2026-04-22)
- [x] **Medium | UI** — Add color coding to the navigation sidebar — one color per pillar — to visually anchor each section. Exact color scheme to be confirmed with design. (Patrick + Ari, 2026-04-22)

---

## Emissions Pillar

- [ ] **High | Bug Fix** — Fix AC Stock section heading: correct "3.1 billion to 6.1 billion" to match actual chart values once the correct data is confirmed (see PENDING DECISIONS).
- [x] **High | Content** — Rename trajectory chart series label: "Projected (2050)" → "Projected BAU 2050".
- [x] **High | Content** — Add scope note directly below the emissions chart: "Residential AC, domestic refrigerators and ceiling fans only. Projected values show BAU 2050, not mitigation or pledge-aligned pathway. Commercial refrigeration and chillers are excluded."
- [x] **High | UI** — Split the appliance selector into three explicit options: AC, Domestic Refrigerators (domref), Ceiling Fans — with clear labels for each.
- [x] **High | Data** — Retire "Net Zero Appliances" (NZH) scenario from the emissions chart — CLASP is phasing it out. Keep only BAU, Global Benchmarks, and BAT. Removed from dropdown, timeline chart, scenario hints, and dropdown rebuild logic.
- [x] **High | UI** — Switch the stock/units chart from a line chart to a vertical column/bar chart. The current shading looks stacked but is not — this actively misleads users. (Patrick + Ari, 2026-04-22)
- [x] **High | Data** — ~~Use one data source per chart — do not mix CLASP and GCI in the same visualization.~~ DISMISSED — current combined approach validated.
- [x] **High | UI** — Label the data source directly on each chart (not only in methodology pages). Added source subtitle to timeline ECharts option; ApplianceGrowthChart and map already had source bars. (Patrick + Ari, 2026-04-22)
- [x] **Medium | Content** — Add inline one-line assumption descriptions below each scenario name on the chart (e.g. "BAU — no new policies", "Global Benchmarks — all countries match best MEPS", "BAT — average = best on market today"). (Patrick, 2026-04-22)
- [x] **Medium | Content** — Rename "Green Buildings" → "Global Benchmark" in dropdown (decision resolved). Note: the broader trajectory line rename (efficiency shift / refrigerant shift / grid decarbonization) is a separate data task still pending.
- [ ] **Medium | Data** — Review and reconcile GCI vs CLASP country-level emissions discrepancies (specifically China AC vs refrigerator ratio and US refrigerators vs ACs). Add a methodology note explaining why figures from different sources may differ.
- [ ] **Medium | Content** — Update the 2050 direct emissions trajectory to reflect HFC phasedown impact — current projection does not adequately account for it.
- [x] **High | Content** — Replace DECARB (73%) and IEA (460 Gt) stat cards with CLASP+GCI-only numbers: 60% indirect saving with BAT (CLASP Mepsy DB) and 80% direct saving under Kigali Implementation (GCI DB). Added explainer strip below cards.
- [ ] **Medium | Content** — Update "The Challenge" and "The Way Forward" body text with the revised copy from Textbausteine.
- [x] **Low | UI** — Add sector scope filter or flag to all visualizations in this pillar indicating which appliance categories are included.

---

## Product Efficiency (MEPS) Pillar

- [ ] **High | Data** — Replace outdated inverter share map data (e.g. Indonesia value from 2019) with current LBNL inverter share dataset.
- [ ] **High | UI** — Add LBNL inverter share table showing % inverter vs fixed-speed by country, including a SE Asia zoom-in view reflecting recent market shifts.
- [x] **High | UI** — Add product scope badge/label to each pillar section header explicitly stating which appliance categories are covered. Apply consistently across all pillars. (Ari/CLASP, 2026-04-22)
- [x] **High | Bug Fix** — Fix CSPF unit display: change W/W (power ratio) to Wh/Wh (energy ratio) across all charts and text. ISO CSPF is an energy metric, not a power metric. (Ari/CLASP, 2026-04-22)
- [ ] **High | UI** — Add a MEPS compliance/enforcement indicator to the stringency map — e.g. color overlay or second layer distinguishing "has MEPS" vs "enforces MEPS". Countries with MEPS on paper but no enforcement allow product dumping to continue. (Ari/CLASP, 2026-04-22)
- [ ] **High | Data** — Update MEPS data for Indonesia and Singapore (flagged in 2026-04-22 session). Also add Thailand, Vietnam, and Malaysia MEPS updates — all recently updated in the ASEAN region. (Patrick + Session 2, 2026-04-22)
- [ ] **Medium | Content** — Update inverter savings claim: note that while demand reduction of 25–44% is typical, recent testing shows up to 60% savings and a 5x efficiency potential exists (Global Cooling Prize).
- [ ] **Medium | Content** — Add a dedicated "Super-Efficient Fans" highlight: approximately 2 million sales in India, significant price reductions achieved, energy use approximately 50% of conventional fans.
- [ ] **Medium | Content** — Add "Recent MEPS Updates" highlight section covering: China refrigerator MEPS update, Nigeria room AC update, and ongoing regional MEPS work.
- [ ] **Medium | Content** — Add CLASP info box: "Bridging the Cooling Gap: Energy Efficiency as a Driver for Appliance Access" — covering how doubling efficiency in India, Indonesia, and Nigeria expands access by making cooling more affordable.
- [ ] **Medium | Content** — Add section on high-temperature and high-humidity operating conditions and its relevance to the 5x/Global Cooling Prize efficiency potential.
- [ ] **Medium | UI** — Retain the peak electricity load chart — do not replace with energy-only view. Peak load (grid stress, blackout risk) tells a different story than total energy. (Ari/CLASP, 2026-04-22)
- [ ] **Low | UI** — Clarify the meaning of "number of MEPS/labels per country" on the map, or consider removing the metric if the meaning cannot be made clear.
- [ ] **Low | Content** — Add at least one concrete U4E country assessment example to illustrate what assessments look like in practice.
- [ ] **Low | Content** — Explore demand flexibility / load shifting as a potential future extension of the peak load story. (Ari/CLASP, 2026-04-22 — follow-up item)

### AC MEPS Benchmarking — Data Errors & Methodology (Patrick/HEAT, 2026-05-04)

- [ ] **High | Bug Fix** — Fix SADC and EAC AC MEPS values: currently too low, must be aligned with U4E model regulations as the correct reference level. (Patrick/HEAT, 2026-05-04)
- [ ] **High | Bug Fix** — Fix U4E capacity range mismatch on MEPS benchmarking chart: chart uses 4.5–9.5 kW range but U4E model regulation covers 2.5–5 kW — this causes misleading comparisons and must be corrected. (Patrick/HEAT, 2026-05-04)
- [ ] **High | Bug Fix** — Fix U4E high-efficiency label value on chart: currently shown as 6.5, should be 7.6 or 8.0 depending on the correct capacity range applied. (Patrick/HEAT, 2026-05-04)
- [ ] **High | Data** — Fix Nigerian AC MEPS value: currently too low; should align with U4E levels by 2031. Conversion methodology from Nigerian standard to CSPF is not explained — must be corrected and documented. (Patrick/HEAT, 2026-05-04)
- [ ] **High | Content** — Add ASEAN Harmonization narrative section: cover Singapore (2nd revision underway, test procedures updated), Malaysia (1st MEPS in place, revision planned), Philippines (MEPS in development with CLASP/DOE support), Indonesia (ongoing updates with U4E/CLASP support). Reference regional momentum and ASEAN harmonization goal. (Patrick/HEAT, 2026-05-04)
- [ ] **Medium | Data** — Verify and fix Saudi Arabia AC MEPS value: likely too low, requires cross-check against current Saudi standards. (Patrick/HEAT, 2026-05-04)
- [ ] **Medium | Data** — Fix EER/CSPF conversion for variable-speed units (Australia, Saudi Arabia): show EER and CSPF as separate values or add a clear methodology note explaining the conversion approach. (Patrick/HEAT, 2026-05-04)
- [ ] **Medium | Data** — Verify India 2033 and China 2025 future MEPS levels: no official publication found for these forward values — must confirm source or remove until confirmed. (Patrick/HEAT, 2026-05-04)
- [ ] **Medium | Content** — Add methodology note on optional test methods (China, Brazil): clarify that benchmarking comparisons use mandatory ISO CSPF tests only, not optional national test methods. (Patrick/HEAT, 2026-05-04)
- [ ] **Medium | Content** — Explain Japan Top Runner approach in methodology: fundamentally different from standard MEPS — the target is set by the best performer, not a fixed floor. Must be clearly noted. (Patrick/HEAT, 2026-05-04)

### Domestic Refrigerator MEPS Benchmarking (Patrick/HEAT, 2026-05-04)

- [ ] **Medium | Content** — State EU EEI metric explicitly in domestic refrigerator methodology: multiple EEI equations exist and the specific one used must be named. (Patrick/HEAT, 2026-05-04)
- [ ] **Medium | Data** — Fix US domestic refrigerator MEPS levels: currently too low. Also add the 2030 MEPS update which is missing from the chart. (Patrick/HEAT, 2026-05-04)
- [ ] **Medium | Data** — Verify Singapore 2025 and Brazil domestic refrigerator levels: both appear too high — cross-check against current standards and correct if needed. (Patrick/HEAT, 2026-05-04)
- [ ] **Low | Data** — Verify South Korea domestic refrigerator levels: initial impression is too high — confirm against current KS standards. (Patrick/HEAT, 2026-05-04)

---

## Refrigerant Transition (Kigali) Pillar

- [x] **High | Content** — Remove the "Kigali Plus" trajectory line. Keep only BAU and Kigali Implementation.
- [ ] **High | Bug Fix** — Fix HFC emissions chart: all scenario lines (BAU, Kigali Implementation, Kigali+) must share identical values before the base year (~2025). Lines must not diverge in the historical period — there is only one observed history. (Patrick + Ari, 2026-04-22)
- [ ] **High | Data** — Add LBNL refrigerant market share data showing the R-410A → R-32 transition trend by key market.
- [ ] **High | UI** — Redesign the refrigerant bank chart with 3 toggle views: (1) tonnes / bank mass, (2) MtCO2e / climate impact, (3) GWP-weighted share (%). Add a methodology note explaining the bank calculation approach.
- [ ] **High | UI** — Add appliance scope label to the refrigerant bank chart header — specify which appliance categories are included (ACs only? ACs + refrigerators? All cooling + heating?). (Ari/CLASP, 2026-04-22)
- [ ] **High | Content** — Add workforce training & certification as an explicit item under "Technical Standards and QCR". Cover: certified technician counts (by country if available), training programs (NOU, U4E, industry), certification schemes for flammable refrigerants. Training is the enabling thread connecting leak prevention, recovery, and reclamation. (Ari + Patrick, 2026-04-22)
- [ ] **High | UI** — Replace the 3-box "Managing the Transition" layout with a 6-step lifecycle infographic: (1) Policy & Standards, (2) Technician Training, (3) Responsible Deployment, (4) Leak Prevention, (5) End-of-Life Recovery, (6) Reclamation & Destruction. Add a Technical Safeguards bar (Flammability, Toxicity, High Pressure, PFAS). Adapt draft infographic to CoolProgress L&F. (Ari + Patrick, 2026-04-22)
- [ ] **Medium | Content** — Add links to EIA fact sheets and other summaries of major regulations, including the EU F-Gas rule.
- [ ] **Medium | UI** — Add a dedicated section showing Kigali Amendment ratification status and phase-down schedules by country group (Article 5 and non-Article 5).
- [ ] **Medium | Data** — Ensure Kigali ratification count is kept current via API or automated update — do not leave as a hard-coded number. (Session 2, 2026-04-22)

---

## Access & Vulnerability Pillar

- [ ] **High | Bug Fix** — Fix population at risk over time chart: legend colors do not match graph colors.
- [ ] **High | Data** — Update heatmap to use percentage of population for color coding. Move absolute population numbers to tooltip/popup content only. (Per SEforAll/Giorgia, confirmed by Stefanie/HEAT.)
- [x] **High | Content** — Rename map title: "Cooling Access Gap by Country" → "Cooling Access Risk by Country".
- [ ] **High | Bug Fix** — Audit and fix all broken resource links in this section.
- [ ] **High | Data** — Show both total numbers AND percentages for population at risk figures (e.g. "India: 453M (32% of pop.)"). Align color thresholds with SEforALL methodology: Critical >50%, High 30–50%, Moderate 15–30%, Low <15%. (Session 2, 2026-04-22)
- [ ] **Medium | Data** — Change the data start year from 2015 to 2020 across relevant charts and visualizations.
- [ ] **Medium | Content** — Add a methodological note: for "non high-impact" countries, the SEforAll methodology estimates risks only in specific high-temperature regions, not at the national level.
- [ ] **Medium | Content** — Add gender dimension to vulnerability data — women have less access to cooling, greater indoor heat exposure (cooking), and different physiological heat tolerance. Add at minimum a qualitative note or reference. (Session 2, 2026-04-22)
- [ ] **Medium | Data** — Explore wet-bulb temperature / WBGT integration for vulnerability mapping. Dry-bulb maps overstate risk in arid regions and understate it in humid tropics. Highest-risk regions: India, Pakistan, Bangladesh, Persian Gulf, SE Asia. (Session 2, 2026-04-22)
- [ ] **Medium | UI** — Add cross-references or synergy callout boxes between Access & Vulnerability and other pillars (MEPS → affordability, Kigali → low-GWP access, Policy → financing). Avoid treating Access as an isolated "sad stats" page. (Manuel, 2026-04-22)
- [ ] **Medium | Content** — Include broader policy types in the Access pillar beyond MEPS: subsidies, financing, building codes, urban planning policies. (Manuel, 2026-04-22)
- [ ] **Medium | Content** — Add SEforAll "This Is Cool Solutions Platform" info box.
- [ ] **Medium | Content** — Add World Bank "Sustainable Cooling in Off-Grid Rural Areas" report to the resources list.
- [ ] **Low | UI** — Review and apply a traffic-light color scheme for risk levels (red = High, amber = Medium, green = Low) to make risk categories intuitively legible.
- [ ] **Low | UI** — Explore map overlays: vulnerability data + MEPS coverage or policy indicators. (Manuel, 2026-04-22)

---

## Plans and Commitments (Policy) Pillar

> **Renamed:** This pillar is now **"National Plans & Commitments"**. Remains as the last pillar.

- [x] **High | UI** — Rename pillar from "Policy Framework" to "National Plans & Commitments" in codebase: sidebar label, route title, config.ts, header, and any hardcoded strings.
- [ ] **High | Content** — Clarify and align the NDC narrative: reconcile "37 signatories with cooling in NDC", "134 countries reference cooling", and the NDC 3.0 picture into a single coherent message. Proposed framing: NDC 3.0s are due now and very few contain specific AC efficiency requirements.
- [ ] **High | Bug Fix** — Fix broken links: Cool Coalition Cooling Watch Report, CPR link (point to the CPR database, not the CPR homepage), and all links in "Resources on cooling policy". Full link audit required.
- [ ] **High | UI** — Replace CPR logo with the updated version in all locations on this page (see also General section for sitewide replacement).
- [x] **High | Content** — Change CPR attribution from "data partner" to "Data sources" or "data provided by" throughout.
- [ ] **High | Bug Fix** — Fix Policy map: color bar at the bottom of the map does not correspond to the legend colors shown above it.
- [x] **High | Content** — Update CPR callout text to: "Climate Policy Radar's database contains a range of relevant documents on cooling (e.g. NDCs, national policies). Compare and analyse cooling-related policies across countries."
- [ ] **Medium | Content** — Add a visible 3-layer framework to the section: Commitment layer (pledge signatures, Kigali ratification, NDC mentions) | Planning layer (NCAPs, national strategies, roadmaps) | Implementation layer (standards, market transition, refrigerant phase-down, finance). Make clear that implementation tracking lives in Pillars 2–3.
- [ ] **Medium | Content** — Add final policy coherence paragraph: "Ultimately, the effectiveness of the cooling transition depends on policy coherence, ensuring that NDCs, NCAPs, Kigali Amendment compliance, and the wider Global Cooling Pledge commitments function as a unified system. For full signatory progress against all 14 Global Cooling Pledge commitments, please refer to the Global Cooling Pledge progress tracker here [link TBD]."
- [ ] **Medium | Content** — Update all section body text with the revised copy provided in Textbausteine.
- [ ] **Medium | Content** — Add source cards: NDCs Cooling Guide (wedocs.unep.org), Cooler Finance (IFC report), World Bank Urban Heat Handbook, NCAP MENA Methodology.
- [ ] **Medium | Data** — Automate the Global Cooling Pledge signatory count via API. Do not leave as a hard-coded number in the codebase. (Session 2, 2026-04-22)
- [ ] **Medium | Content** — Archive NCAP PDFs locally and add Wayback Machine backup links for official NCAP documents to prevent link rot when ministry websites restructure. (Session 2, 2026-04-22)
- [ ] **Medium | UI** — Break up text-heavy intro paragraphs into shorter, more readable blocks across all sections.
- [ ] **Low | UI** — Evaluate embedding Global Cooling Pledge commitment details directly on the page rather than requiring a click-through to the Cool Coalition site.
- [ ] **Low | Content** — Add a note for Jamie/CPR indicating which NCAPs were sourced for the dashboard and their coverage.

---

## General / Cross-cutting

- [ ] **High | UI** — Replace CPR logo sitewide with the updated version provided by Jamie. Check all pages and components.
- [x] **Medium | UI** — Add color coding to the navigation sidebar — one color per pillar — to visually anchor each section. Confirm color scheme with design. (Patrick + Ari, 2026-04-22)
- [ ] **Medium | UI** — Audit text colors sitewide: replace light green and yellow text with higher-contrast alternatives to meet readability standards.
- [ ] **Medium | Content** — Add UNEP Global Cooling Watch 2025 as a primary source card on all relevant pillars (Emissions, MEPS, Refrigerant, Access, Policy).
- [ ] **Medium | Content** — Add partner videos as companion resources per pillar: Cold Chains (Access pillar), NDCs (Policy pillar), GCW 2025 (Emissions pillar), GCW 2023 (Emissions pillar), Urban Heat (Access pillar).
- [ ] **Medium | Content** — Add explicit data scope notes to all visualizations distinguishing residential appliance data from broader cooling-sector data, so coverage differences are not misread as data errors.
- [ ] **Medium | UI** — Add "See also" / cross-pillar connections to every pillar page so users can navigate between related content. The connections between pillars are currently invisible. (Session 2, 2026-04-22)
- [ ] **Low | Content** — Coordinate with Ari/CLASP (Jiayi returning from leave) to schedule a review of CLASP data as shown on the dashboard — timeline TBD.
- [ ] **Low | Content** — Add CLASP references under the Access pillar: "Net Zero Heroes" (Chapter 2, Figures 6, 7, 14) and "Bridging the Cooling Gap: Energy Efficiency as a Driver for Appliance Access".
- [ ] **Low | Content** — Establish a named owner and update cadence for Global Cooling Pledge signatory counts — do not leave these as hard-coded numbers in the codebase.

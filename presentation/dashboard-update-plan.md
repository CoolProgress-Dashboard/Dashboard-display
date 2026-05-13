# CoolProgress Dashboard — Update Plan
### Feedback Integration & Implementation Roadmap
*Sources: Noah/CCC · Jamie/CPR · Giorgia/SEforAll · Stefanie/HEAT · Ari/CLASP · Cool Coalition 2026-04-29 · Patrick/HEAT + Ari/CLASP + Manuel + Dietram 2026-04-22*

---

## Decisions Made

| # | Topic | Decision |
|---|-------|----------|
| 1 | Kigali Plus trajectory line | **Remove** — keep only BAU + Kigali Implementation (Noah/CCC) |
| 2 | AC stock heading vs chart data | **Verify & fix** — data verification task, not a conflict |
| 3 | Policy pillar name | **"National Plans & Commitments"** — stays as last pillar |
| 4 | Pillar ordering | **Keep as-is** — Emissions first (current order) |

---

## Open Conflict (to discuss today)

> **Kigali Amendment map — where does it live?**
> Currently only in Refrigerant Transition (Pillar 3). Should it also appear in National Plans & Commitments?
> - Option A: Keep in Pillar 3 only
> - **Option B (recommended):** Cross-reference/link from Policy → Pillar 3
> - Option C: Duplicate in both pillars (risk: data inconsistency)

---

## Summary of Changes by Pillar

| Pillar | High | Medium | Low | Total |
|--------|------|--------|-----|-------|
| Overview / Front Page | 1 | 4 | — | 5 |
| Emissions | 8 | 5 | 1 | 14 |
| Product Efficiency (MEPS) | 6 | 6 | 3 | 15 |
| Refrigerant Transition (Kigali) | 6 | 3 | — | 9 |
| Access & Vulnerability | 5 | 8 | 2 | 15 |
| National Plans & Commitments | 7 | 7 | 2 | 16 |
| General / Cross-cutting | 1 | 6 | 3 | 10 |
| **Total** | **34** | **39** | **11** | **84** |

---

## Pillar-by-Pillar Changes

---

### Overview / Front Page

**High priority**
- Fix lead statistic: cooling ≈ 7% of emissions today, reaches ≈ 10% under BAU by 2050 — it does **not** triple

**Medium priority**
- Remove comma: "By achieving sustainable cooling**,** we can prevent…" → no comma
- Add **Sustainable Cooling Hierarchy** narrative block (Passive → Low-energy → Best efficiency → Rapid HFC phase-down) citing UNEP GCW 2025
- Remove numbers from the four priority areas on landing page (keep numbers in sidebar)
- Add **color coding** to navigation sidebar — one color per pillar

---

### Emissions Pillar

**High priority — 8 items**
- Verify AC stock data: heading says 3.1B→6.1B, chart shows 1.5B→3B — fix whichever is wrong
- Rename chart series: "Projected (2050)" → **"Projected BAU 2050"**
- Add scope note below chart: *"Residential AC, domestic refrigerators and ceiling fans only. Projected values show BAU 2050. Commercial refrigeration and chillers excluded."*
- Split appliance selector into three explicit options: **AC / Domestic Refrigerators / Ceiling Fans**
- **Retire "Net Zero Appliances" scenario** (CLASP phasing out) — keep BAU + Global Benchmarks + BAT
- Switch stock/units chart from **line chart → vertical column chart** (current shading looks stacked but isn't — misleading)
- **One data source per chart** — do not mix CLASP and GCI in the same visualization
- **Label data source directly on each chart** (not only in methodology)

**Medium priority — 5 items**
- Add inline one-line scenario descriptions on chart (e.g. "BAU — no new policies")
- Replace "net zero homes / green buildings / best tech" labels with: efficiency shift / refrigerant shift / grid decarbonization *(pending scenario mapping confirmation)*
- Reconcile GCI vs CLASP discrepancies + add methodology note explaining source differences
- Update 2050 direct emissions trajectory to reflect HFC phasedown impact
- Update "The Challenge" and "The Way Forward" body text (Textbausteine copy)

**Low priority**
- Add sector scope filter/flag to all visualizations

---

### Product Efficiency (MEPS) Pillar

**High priority — 6 items**
- Replace outdated inverter share map data (Indonesia value is from 2019) with current **LBNL dataset**
- Add **LBNL inverter share table** (% inverter vs fixed-speed by country) + SE Asia zoom-in
- Add **product scope badge** to every section header — explicitly state which appliances are covered
- Fix **CSPF unit**: W/W (power ratio, wrong) → **Wh/Wh** (energy ratio, correct)
- Add **MEPS enforcement/compliance indicator** to stringency map — distinguish "has MEPS" from "enforces MEPS"
- Update MEPS data for **5 ASEAN countries**: Indonesia, Singapore, Thailand, Vietnam, Malaysia

**Medium priority — 6 items**
- Update inverter savings claim: up to 60% savings achievable, 5x efficiency potential (Global Cooling Prize)
- Add **Super-Efficient Fans** highlight: ~2M sales in India, 50% energy vs conventional fans
- Add **Recent MEPS Updates** section: China refrigerators, Nigeria room ACs, regional ASEAN work
- Add CLASP info box: *"Bridging the Cooling Gap: Energy Efficiency as a Driver for Appliance Access"*
- Add section on high-temperature/high-humidity conditions → relevance to 5x/GCP efficiency potential
- **Keep peak electricity load chart** — do not replace with energy-only (peak = grid stress story)

**Low priority — 3 items**
- Clarify or remove "number of MEPS/labels per country" metric on map
- Add one concrete U4E country assessment example
- Explore demand flexibility / load shifting as future extension of peak story

---

### Refrigerant Transition (Kigali) Pillar

**High priority — 6 items**
- ✅ **Remove Kigali Plus trajectory line** — keep BAU + Kigali Implementation only *(resolved)*
- Fix **historical line convergence bug**: all scenario lines must share identical values before ~2025 (only one observed history)
- Add **LBNL refrigerant market share data** — R-410A → R-32 transition by key market
- Redesign **refrigerant bank chart** with 3 toggle views: (1) tonnes, (2) MtCO2e, (3) GWP-weighted share (%) + methodology note
- Add **appliance scope label** to bank chart — specify which appliances are included
- Add **workforce training & certification** as explicit item under Technical Standards & QCR — certified technicians, training programs, certification schemes for flammable refrigerants

**Medium priority — 3 items**
- Replace 3-box "Managing the Transition" with **6-step lifecycle infographic**: Policy & Standards → Technician Training → Responsible Deployment → Leak Prevention → End-of-Life Recovery → Reclamation & Destruction (+ Technical Safeguards bar)
- Add dedicated **Kigali ratification & phase-down schedules** section (Article 5 vs non-Article 5)
- Add EIA fact sheets + EU F-Gas rule summary links
- Automate Kigali ratification count via API (no hard-coded numbers)

---

### Access & Vulnerability Pillar

**High priority — 5 items**
- Fix **population at risk chart bug**: legend colors don't match graph colors
- Update heatmap: use **% of population** for color coding — move absolute numbers to tooltips only
- Rename map title: "Cooling Access Gap by Country" → **"Cooling Access Risk by Country"**
- **Full audit and fix** of all broken resource links in this section
- Show **both totals and percentages** for at-risk figures (e.g. "India: 453M — 32% of population") aligned with SEforALL thresholds

**Medium priority — 8 items**
- Change data start year from 2015 → **2020**
- Add SEforAll methodology note: risks estimated by region for "non high-impact" countries, not nationally
- Add **gender dimension** — women have less cooling access and greater indoor heat exposure; add at minimum a qualitative note
- Explore **wet-bulb / WBGT integration** — dry-bulb maps understate risk in humid tropics; highest-risk zones: India, Pakistan, Bangladesh, Persian Gulf, SE Asia
- Add **cross-pillar synergy callouts** — connect Access to MEPS (affordability), Kigali (low-GWP access), Policy (financing)
- Include **broader policy types** in Access pillar: subsidies, financing, building codes, urban planning
- Add SEforAll "This Is Cool Solutions Platform" info box
- Add World Bank "Sustainable Cooling in Off-Grid Rural Areas" to resources

**Low priority — 2 items**
- Apply traffic-light color scheme for risk levels (red/amber/green)
- Explore vulnerability + MEPS/policy map overlays

---

### National Plans & Commitments Pillar
*(renamed from "Policy Framework")*

**High priority — 7 items**
- **Rename pillar** to "National Plans & Commitments" in codebase: sidebar, route title, config.ts, header
- Clarify NDC narrative: reconcile "37 signatories / 134 countries / NDC 3.0" into one coherent message — NDC 3.0s are due now and very few contain specific AC efficiency requirements
- **Full broken link audit**: Cool Coalition Cooling Watch Report, CPR database link, all links in "Resources on cooling policy"
- Replace **CPR logo** with updated version on this page
- Change CPR attribution from "data partner" → **"Data sources"** or "data provided by"
- Fix **Policy map color bar bug**: bottom color bar doesn't correspond to legend above
- Update CPR callout text: *"Climate Policy Radar's database contains a range of relevant documents on cooling (e.g. NDCs, national policies). Compare and analyse cooling-related policies across countries."*

**Medium priority — 7 items**
- Add visible **3-layer policy framework**: Commitment layer (pledges, Kigali, NDC mentions) | Planning layer (NCAPs, strategies) | Implementation layer (standards, market transition, finance)
- Add final **policy coherence paragraph** referencing the 14 Global Cooling Pledge commitments [link TBD]
- Update all body text (Textbausteine revised copy)
- Add source cards: NDCs Cooling Guide, Cooler Finance (IFC), World Bank Urban Heat Handbook, NCAP MENA Methodology
- **Automate Global Cooling Pledge signatory count** via API
- **Archive NCAP PDFs locally** + Wayback Machine backup links (prevents link rot when ministries restructure)
- Break up dense text blocks into shorter paragraphs

**Low priority — 2 items**
- Consider embedding GCP commitment details directly (avoid click-through)
- Note for Jamie/CPR on which NCAPs were sourced

---

### General / Cross-cutting

**High priority**
- Replace **CPR logo sitewide** with updated version (all pages and components)

**Medium priority — 6 items**
- Audit text colors: replace light green and yellow text with **higher-contrast** alternatives
- Add **UNEP Global Cooling Watch 2025** as primary source card on all relevant pillars
- Add **partner videos** per pillar: Cold Chains (Access), NDCs (Policy), GCW 2025 + GCW 2023 (Emissions), Urban Heat (Access)
- Add explicit **data scope notes** to all visualizations (residential vs broader sector)
- Add **"See also" / cross-pillar connections** to every pillar page — currently the links between pillars are invisible to users
- Add sidebar **color coding per pillar** (confirm color scheme with design)

**Low priority — 3 items**
- Coordinate CLASP data review with Ari (Jiayi returning from leave — timeline TBD)
- Add CLASP references under Access pillar: "Net Zero Heroes" + "Bridging the Cooling Gap"
- Establish named owner + update cadence for Global Cooling Pledge signatory count

---

## Implementation Notes

- **Do not implement** without stakeholder confirmation: Kigali map cross-reference decision (discussed today)
- **Do not rename** scenario labels until Green Buildings / Net Zero Homes → Global Benchmarks / BAT mapping is confirmed with Ari/CLASP
- **CPR logo**: replacement file must be received from Jamie before implementing
- **NCAP archiving**: coordinate with Jamie/CPR on which NCAPs to include
- **CLASP data review**: await Jiayi's availability before finalizing CLASP-sourced content

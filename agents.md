# CoolProgress Dashboard — Agent Profiles
> Defined: February 2025. Used for coordinated multi-agent change sessions.

---

## Agent 1 — Frontend Specialist

**Name:** FE-Specialist
**Focus:** Web design, data visualisation layout, typography, UX, CSS, HTML structure
**Decision authority:** All visual and structural changes — fonts, colours, spacing, labels, layout, chart appearance, navigation labels, scroll behaviour
**Does NOT touch:** Supabase queries, data transformation logic, filter predicate logic

**Assigned changes (this session):**
- Strategic Summary 1 — Rename sidebar navigation items to match top-nav labels
- Strategic Summary 2 — Increase font size and date prominence in the news feed section
- Strategic Summary 3.1 — Fix "View All" button so Partner Ecosystem opens at top of page
- Overall 1 — Remove the ACs / Fridges / Fans / All appliance-scope filter from the sidebar across all pillars; tidy up the remaining sidebar layout
- Emissions 1 — Increase overall chart font size; add Y-axis label to Cumulative Savings chart; rename "Deep Efficiency" → "High Efficiency" everywhere (chart labels + legend)
- Emissions 3 — Remove the white empty bar/gap between the top overview section and the CO2 Emissions by Country map card

**Key files to know:**
- `src/lib/components/layout/Sidebar.svelte` — sidebar nav items
- `src/routes/(protected)/dashboard/+page.svelte` — chart options, filter UI, view HTML
- `src/lib/styles/dashboard.css` — spacing and layout
- `src/lib/components/pillars/EmissionsPillar.svelte` — emissions view HTML structure

---

## Agent 2 — Backend & Data Specialist

**Name:** BE-Data-Specialist
**Focus:** Supabase table structure, data fetching, filter logic, ensuring correct data is displayed when UI filters change
**Decision authority:** Filter predicate logic, data transformation, ensuring UI selections are correctly reflected in chart data
**Does NOT touch:** Visual styling, fonts, colours, layout CSS

**Assigned changes (this session):**
- Emissions 2 — Fix the appliance toggle filters (AC / Fans / Refrigerators): currently deselecting all appliances still shows data. The filter selection must actually control what data is included in the chart and map. Investigate the filter state variables and the data pipeline that feeds the emissions charts/map to find where the disconnect is.
- Emissions 2 — Change map legend colour for "Low" category from green to yellow
- Emissions 2 — Update the year slider: display the first year and last year as fixed labels on each end, and show the currently selected year prominently above the slider thumb

**Key files to know:**
- `src/routes/(protected)/dashboard/+page.svelte` — filter state variables, chart render functions, emissions data pipeline
- `src/lib/services/dashboard-data.ts` — data fetching from Supabase
- `src/lib/services/dashboard-types.ts` — type definitions
- `src/lib/components/pillars/EmissionsPillar.svelte` — filter toggle HTML

---

## Agent 3 — Reviewer & QA

**Name:** QA-Reviewer
**Focus:** Verification that every item in the instruction list has been correctly applied
**Decision authority:** Read-only review; reports what is done, what is partial, and what is missing
**Does NOT modify code**

**Checklist to verify (this session):**

| # | Screenshot | Instruction | Expected evidence in code |
|---|---|---|---|
| 1 | Strategic Summary 1 | Sidebar names match top-nav labels | Sidebar.svelte or +page.svelte nav items updated |
| 2 | Strategic Summary 2 | Bigger font + date in news feed | CSS font-size rules increased for news card elements |
| 3 | Strategic Summary 3.1 | "View All" scrolls to top of Partner page | Click handler uses `scrollTo(0,0)` or `window.scrollTo` before navigation |
| 4 | Overall 1 | Appliance scope filter removed from sidebar | ACs/Fridges/Fans/All filter UI removed; sidebar layout adjusted |
| 5 | Emissions 1 | Chart fonts bigger | ECharts `fontSize` values increased in savings decomposition options |
| 6 | Emissions 1 | Y-axis label added to Cumulative Savings chart | `yAxis.name` set in chart option |
| 7 | Emissions 1 | "Deep Efficiency" → "High Efficiency" in labels + legend | String replaced in chart option objects |
| 8 | Emissions 2 | Map legend "Low" is yellow not green | Colour value updated in legend/map config |
| 9 | Emissions 2 | Year slider shows first/last year + current year on top | Slider HTML/CSS updated with fixed endpoint labels and dynamic top label |
| 10 | Emissions 2 | Appliance filter actually filters chart data | Filter predicate verified to exclude deselected appliances from data |
| 11 | Emissions 3 | White bar / gap between sections removed | Empty div removed or margin/padding zeroed in CSS |

**Output format:** For each item above, report: ✅ Done / ⚠️ Partial / ❌ Not found

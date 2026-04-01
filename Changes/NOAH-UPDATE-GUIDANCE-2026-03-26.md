# CoolProgress Dashboard — Noah Meeting Implementation Guidance
**Date**: 2026-03-26 | **Source**: CWC-GLO-CPROG meeting, Dietram Oppelt + Noah (Cool Coalition)

---

## Strategic Direction

Shift from a technical dashboard toward a **strategic public-facing narrative platform**.
- Not about changing analytical substance
- Reframe *how* the site tells the story
- From: "here are data layers and filters"
- To: "here is the cooling transition challenge, here is where progress is happening, here is how to engage"

---

## Implementation Plan — Phased

### PHASE 1 — Narrative Foundation (v0.2)
*Do this first. Everything else builds on it.*

#### 1.1 New Opening Layer (before any technical content)
Insert a new high-impact intro section **before** the current Overview pillar:

**Problem statement** (compact):
- ~3 billion more air conditioners are coming
- Cooling could represent a major share of total GHG emissions
- 1+ billion people lack access to cooling

**Opportunity case** (immediately after):
- Huge emissions savings possible if cooling is done right
- More people gain access to life-saving cooling
- Improved health and livelihoods
- Lower grid stress, fewer power plants needed

**Technical approach**: Rework the current `OverviewPillar.svelte` hero section. The current hero stats cards are the right format — update copy and add opportunity messaging after the problem stats.

#### 1.2 Four-Pillar Framework Introduction
After the problem/opportunity intro, show the **four solution pillars** visually (circular/systems graphic):

| Pillar | Current route equivalent |
|--------|--------------------------|
| **Access to cooling** | `/dashboard/access` |
| **Energy-efficient products (MEPS + labels)** | `/dashboard/meps` |
| **Better buildings & passive cooling** | NEW (not yet in dashboard) |
| **Climate-friendly refrigerants** | `/dashboard/kigali` |

**Note**: "Buildings/passive cooling" pillar does not currently exist. Do not add it now — flag it as a future pillar. Show the framework visually but link only the three existing pillars.

**Technical approach**: Add a new visual component in `OverviewPillar.svelte` — four cards/icons showing the framework. Three are clickable (link to existing pillars). Buildings is greyed out with "coming soon".

---

### PHASE 2 — Section-by-Section Story Rework (v0.3)
*Apply "story before data" pattern to each pillar.*

**Pattern for every section**:
1. Why does this issue matter?
2. What is the problem or opportunity?
3. What progress is being made?
4. What tools/resources exist?
5. Where can the user go deeper?

#### 2.1 MEPS / Product Efficiency Section

**Narrative framing to add at top of `MepsPillar.svelte`**:
- MEPS remove the least efficient products from the market (efficiency floor)
- Labels help consumers identify better models (demand driver)
- Together: support procurement, rebates, reduce energy bills, reduce grid stress

**Visual additions needed**:
- Example energy label image
- Links to U4E model regulations (pending permission — see Partner Validation below)
- Links to U4E country savings assessments (pending permission)

**Room AC inverter transition** — add as a progress story:
- Market shift from fixed-speed to inverter technology
- Performance-based MEPS deliver major savings
- Show actual market data from `ac_inverter_share` table (already in DB)
- `AcGrowthChart.svelte` and `InverterByCountryChart.svelte` are the right charts — improve narrative framing around them

**Regulatory timeline display rules** (apply to `MepsLevelChart.svelte`):
- **Solid line** = regulation already effective
- **Dotted/dashed line** = adopted but future effective date, or staged future level
- **Do NOT show** purely aspirational plans not yet legislated
- Important for staged standards (e.g., Nigeria: passed now, effective in later steps)

**Regional stories to add**:
- ASEAN: harmonized levels/roadmap, Austrian Energy Agency work
- Africa: regional MEPS/label harmonization (East, West, Southern Africa)

**Methodology note** (do NOT put on main interface — put in methodology section):
- MEPS stringency comparisons can be misleading: different metrics, test methods, climate zones, capacity classes
- Validate visual approach with LBNL before publishing

#### 2.2 Refrigerant Transition Section

**Introductory narrative to add at top of `KigaliPillar.svelte`**:
- Refrigerants are used in AC and refrigeration equipment
- They leak during operation, servicing, and end-of-life
- Many are extremely potent GHGs
Then: opportunity if transition done well → policy framework → market transition underway

**Two-stage transition framing** (update chart narrative):
- Stage 1: current high-GWP → low-GWP
- Stage 2: low-GWP → ultra-low-GWP
- Europe already far along — show as a progress story
- Use market share data showing actual change over time (not only modeled futures)

**Lifecycle refrigerant management** — add as new sub-section:
- Large refrigerant stocks already in equipment will otherwise be emitted
- Leak prevention + end-of-life capture = major mitigation opportunity
- Under-addressed: needs better policies, recycling systems, destruction facilities
- References: NRDC/EIA/ISD reports, TEAP/Montreal Protocol work
- This broadens from "replace refrigerant" to full systems view

**Safety/flammability/PFAS** — add short balanced note:
- Some low-GWP refrigerants are flammable; some raise PFAS concerns; CO2 = high pressure
- These can be managed safely with updated standards, building codes, technician training
- Frame as "additional considerations for responsible deployment" — NOT fear-based

**Country display** — simplify:
- Avoid strongly color-coded maps
- Clickable country view: Kigali implementation plan? Phase-down schedule? Links to docs?

#### 2.3 Access & Vulnerability Section

**Lead narrative for `AccessPillar.svelte`**:
- Open with: "Access to cooling is not a luxury — it is a human right."
- 1+ billion people lack access
- Direct implications: heat stroke, mortality, inability to sleep/study/work

**Add humidity subsection**:
- High heat + high humidity is especially dangerous
- At certain wet-bulb thresholds, the human body cannot cool itself through sweating
- Add: "Why humidity makes heat more dangerous" explanatory block

**Simplify the interface**:
- Fewer filters on the front-facing view
- Put deeper filtering behind external resource links
- Current filter system is too complex for public audience

**Map design**:
- Absolute numbers highlight large countries (India, China) — under-emphasizes severe vulnerability in West Africa
- Test: retain map but improve interpretation labels, add percentage view option
- Do NOT imply heat vulnerability is irrelevant in Global North — add a note

**Add solutions layer** (currently missing):
- How are access gaps being addressed?
- What interventions matter?
- How do the pledge and policy efforts link to access outcomes?

#### 2.4 Policy Framework Section

**Do not start with counts or maps** — first explain main policy frameworks:

**Structure for `PolicyPillar.svelte`**:
1. **Global Cooling Pledge** (most important — lead with this)
   - What it is, why it matters
   - Includes commitments: efficiency, refrigerants, access
   - How many countries signed, stages of implementation
   - Link to Cool Coalition progress reporting (use report cover as visual)
2. **NDCs** — cooling integration
3. **NCAPs** — National Cooling Action Plans
4. **Refrigerant caps / Kigali-related architecture** (brief — detail is in Kigali section)

**Country clickable interface**:
- Signed the pledge?
- Included cooling in NDC?
- Adopted an NCAP?

**Map colors**:
- Use neutral colors
- **Green/highlight** = information exists
- **Grey** = no data (NOT red — do not shame countries)
- Purpose: encourage action, not judge

**Scope**: Stay at cross-cutting enabling frameworks level. Do NOT duplicate MEPS or refrigerant policy detail from other sections.

---

### PHASE 3 — Cross-Cutting Design (v0.4)

| Recommendation | Implementation |
|----------------|---------------|
| Clickable country maps as gateways | All map clicks → country info panel, not ranking |
| Avoid simplistic performance rankings | Remove any color-coded MEPS stringency comparisons |
| Methodology section | Create dedicated `/methodology` page (route already exists) with per-pillar caveats |
| Curated stories above interactive dashboards | Add narrative card component above each chart group |
| Exemplar report covers as visual anchors | Add report cover images (Cool Coalition, IEA) linking to external resources |

---

## Partner Validation — Required Before Publishing

### Track 1: Efficiency — CLASP + U4E (+ LBNL)
**Validate before publishing MEPS section changes.**

Topics to confirm:
- Permission to link/display U4E model regulations
- Permission to link/display U4E country savings assessments
- MEPS country data accuracy and completeness
- Methodological differences in MEPS stringency comparisons
- Room AC inverter transition data available and shareable
- ASEAN and African regional harmonization stories: what can be shown?
- Regulatory timeline representation: what counts as "adopted" vs "effective" vs "planned"?

### Track 2: Access — SE4ALL
**Validate before publishing Access section changes.**

Topics to confirm:
- Permission for public display of `access_to_cooling_seeforall` data
- Map design: absolute numbers vs percentages — SE4ALL recommendation
- Humidity/wet-bulb framing: does SE4ALL have data or framing to use?
- Solutions layer: what interventions and progress stories can SE4ALL point to?
- Simplification of filters: do they agree?

### Track 3: Cross-cutting — Cool Coalition (Noah)
**Validate before publishing Policy and Overview changes.**

Topics to confirm:
- Permission to display pledge signatory data and implementation status
- Permission to use Cool Coalition progress report cover as visual anchor
- Four-pillar framework alignment with Cool Coalition messaging
- Noah written bullets (pending from him as of 2026-03-26)

**Suggested timeline**: All three tracks within next 2–3 weeks. Bring v0.2 narrative intro draft to meetings.

---

## Action Items

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Noah sends written bullets confirming alignment | Noah (Cool Coalition) | Pending |
| 2 | Build narrative intro layer (v0.2) — rework Overview opening | HEAT/Manuel | Next |
| 3 | Rework Overview into four-pillar framework (v0.3) | HEAT/Manuel | Queued |
| 4 | Section-by-section story rework (MEPS, Kigali, Access, Policy) | HEAT/Manuel | Queued |
| 5 | Schedule steering meeting: CLASP + U4E (+ LBNL) | Stefanie/Manuel | Pending |
| 6 | Schedule steering meeting: SE4ALL | Stefanie/Manuel | Pending |
| 7 | Schedule steering meeting: Cool Coalition (Noah) | Dietram/Manuel | Pending |
| 8 | Confirm permissions for U4E and SE4ALL linked resources | Team | Pending |
| 9 | Focus group validation before public launch | Team | Planned |

---

## Files to Modify (Technical Reference)

| File | Change |
|------|--------|
| `src/lib/components/pillars/OverviewPillar.svelte` | New problem/opportunity narrative, four-pillar framework visual |
| `src/lib/components/hero/HeroSection.svelte` | Update copy to lead with problem then opportunity |
| `src/lib/components/pillars/MepsPillar.svelte` | Narrative framing, U4E links, regional stories, regulatory timeline fix |
| `src/lib/components/charts/MepsLevelChart.svelte` | Solid vs dotted line for effective vs future regulations |
| `src/lib/components/pillars/KigaliPillar.svelte` | Intro narrative, lifecycle management section, safety note, two-stage framing |
| `src/lib/components/pillars/AccessPillar.svelte` | Human-right lead, humidity section, solutions layer, simplified filters |
| `src/lib/components/pillars/PolicyPillar.svelte` | GCP-led structure, neutral map colors, country clickable interface |
| `src/lib/components/shared/config.ts` | Update VIEW_META headlines/subheads for all pillars |
| `src/routes/methodology/+page.svelte` | Add per-pillar methodology caveats |

---

*Source: CWC-GLO-CPROG meeting 2026-03-26, Dietram Oppelt + Noah (Cool Coalition). Readout via ChatGPT.*
*Document created: 2026-04-01*

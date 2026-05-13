# CoolProgress Dashboard — U4E + CLASP Partner Discussion

**Date/Time**: April 22, 2026, 16:42 CEST
**Participants**: Patrick (HEAT), Ari (CLASP), Dietram (HEAT)

---

## Overall Summary

The team discussed the website's structural elements, focusing on numbering and color coding for clarity. They debated the organization of the pillars and priority areas, emphasizing a logical flow aligned with a theory of change. Significant attention was given to the policy framework section, with suggestions to rename it and reorganize content to better reflect commitments versus policies and to avoid siloed interpretations. Detailed feedback was given on the Emissions pillar — scenarios, chart types, data source labeling, and stock visualization.

---

![CoolProgress landing page — 5 pillars overview](screenshots/01-landing-page-pillars.png)

## 1. Website Structure — Numbering & Color Coding

### Feedback (Patrick + Ari)

- Numbers above the four priority areas may be removed to reduce confusion
- Numbering or lettering pillars is needed for structure
- Color coding pillars and navigation elements proposed to visually connect site sections
- Avoid siloed presentation — maps and policy elements should be integrated or cross-referenced

```
  CURRENT NAVIGATION (left sidebar)
  ┌─────────────────────────┐
  │  Strategic Summary       │
  │  1. Emissions        ?   │ ← numbers helpful here
  │  2. Product Efficiency   │
  │  3. Refrigerant Trans.   │
  │  4. Access & Vuln.       │
  │  5. Policy Framework     │
  │  Partner Ecosystem       │
  └─────────────────────────┘

  PROPOSED: Add color dots per pillar
  ┌─────────────────────────┐
  │  Strategic Summary       │
  │  🔴 1. Emissions         │ ← red = urgency
  │  ⚡ 2. Product Efficiency │ ← yellow = energy
  │  🔺 3. Refrigerant Trans. │ ← orange = transition
  │  🏠 4. Access & Vuln.     │ ← green = people
  │  📋 5. Policy Framework   │ ← blue = governance
  │  Partner Ecosystem       │
  └─────────────────────────┘
```

### Assessment: 7/10

Color coding is a strong UX improvement — it creates visual anchoring so users know where they are. Removing priority area numbers reduces clutter. Keeping pillar numbers aids verbal reference ("see Pillar 3").

### Action Items

- [ ] Remove numbers from priority areas on landing page
- [ ] Keep or refine numbering for pillars
- [ ] Explore color coding in navigation sidebar

---

## 2. Pillar Rename: "Policy Framework" → "Plans & Commitments"

### Feedback (Ari)

- "Policy Framework" is misleading — the content tracks commitments (NDC mentions, Global Cooling Pledge, Kigali ratification, NCAPs), not policy design
- Suggested: rename to "Plans and Commitments"
- Suggested: move to Pillar 1 position (theory of change: commit first → act second)

```
  WHAT'S ACTUALLY IN "POLICY FRAMEWORK"?

  ┌─────────────────────────────────────────┐
  │  Global Cooling Pledge    → commitment  │
  │  NDC cooling mentions     → commitment  │
  │  Kigali ratification      → commitment  │
  │  National Cooling Plans   → plan        │
  │  National Implementation  → plan        │
  └─────────────────────────────────────────┘
       ↑ These are plans & commitments,
         NOT a "policy framework"
```

### Assessment

**Rename: 7/10 — good direction, wording could sharpen**

| For | Against |
|-----|---------|
| Content genuinely is commitments, not policy design | "Plans and Commitments" sounds passive |
| Reduces confusion with Pillar 2 (MEPS = actual policy) | Loses the keyword "policy" (SEO, discoverability) |
| Clearer for non-expert users | |

Alternative names worth considering:
- "Commitments & Targets" — sharper, implies accountability
- "National Commitments" — country-level grounding
- "Policy Commitments" — keeps the keyword

**Reorder to Pillar 1: 5/10 — logical but risky**

| For | Against |
|-----|---------|
| Theory of change: pledge → implement → measure | Emissions is the hook — 2,401→6,009 Mt grabs attention |
| Mirrors UNFCCC/donor thinking | Users come for data first, policy second |
| | Commitments first risks "so what?" before stakes are clear |

```
  NARRATIVE FLOW COMPARISON

  ARI'S PROPOSAL (theory of change):
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ Plans &  │──>│Emissions │──>│ Product  │──>│Refriger- │──>│ Access & │
  │Commitm.  │   │          │   │Efficiency│   │  ants    │   │  Vuln.   │
  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
  "who pledged"  "the problem"  "action 1"     "action 2"     "who's left"

  DIETRAM'S RECOMMENDATION (impact narrative):
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │Emissions │──>│ Plans &  │──>│ Product  │──>│Refriger- │──>│ Access & │
  │          │   │Commitm.  │   │Efficiency│   │  ants    │   │  Vuln.   │
  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
  "the problem"  "who's acting" "how (demand)" "how (supply)" "who's left"
```

**Recommendation**: Keep Emissions as Pillar 1 (strongest lead), move Plans & Commitments to Pillar 2. This preserves theory of change while leading with the compelling data story.

### Action Items

- [ ] Decide on final name for "Policy Framework" pillar
- [ ] Decide on pillar ordering — Ari's (commitments first) vs. impact narrative (emissions first, commitments second)

---

![Emissions pillar — challenge statement and country map](screenshots/03-emissions-challenge-map.png)

![Emissions pillar — resources on cooling & climate](screenshots/04-emissions-resources.png)

## 3. Emissions Pillar — Scenarios

### Feedback (Ari)

- 4 scenarios currently exist for appliances
- **BAT (Best Available Technology)** recently reintroduced
- **Net Zero Appliances** scenario — likely to be retired soon, advises against using it
- Two meaningful policy scenarios to keep:
  1. **Global Benchmarks** — efficiency rises to match today's most stringent MEPS worldwide
  2. **BAT** — average efficiency aligns with best commercially available technology today

```
  SCENARIO STATUS (Ari's guidance)

  ┌────────────────────────┬──────────┬──────────────────────────────┐
  │ Scenario               │ Status   │ Meaning                      │
  ├────────────────────────┼──────────┼──────────────────────────────┤
  │ Business as Usual      │ ✅ KEEP  │ No new policies, BAU growth   │
  │ Global Benchmarks      │ ✅ KEEP  │ All countries match best MEPS │
  │ Best Available Tech    │ ✅ KEEP  │ Average = best on market today│
  │ Net Zero Appliances    │ ❌ RETIRE│ Being phased out by CLASP     │
  │ Green Buildings        │ ⚠️ CHECK │ Naming confusion (see below)  │
  │ Net Zero Homes         │ ⚠️ CHECK │ Naming confusion (see below)  │
  └────────────────────────┴──────────┴──────────────────────────────┘
```

![Emissions trajectory — scenario comparison chart](screenshots/05-emissions-trajectory-scenarios.png)

### Feedback (Patrick)

- Current chart labels ("Green Buildings", "Net Zero Homes") use MEPSY/CLASP internal terminology — not intuitive for dashboard users
- Aligns with Ari's guidance on retirement
- Each scenario needs a **short inline explanation** on the chart itself — users shouldn't need to navigate to CLASP or methodology page

```
  CURRENT CHART (confusing labels)        PROPOSED (self-explanatory)

  Mt CO2 |                                Mt CO2 |
  3500   | ___BAU___                       3500   | ___BAU (no new policies)___
         |    /                                   |    /
  2500   |   /  Green Bldgs?                2500  |   /  Global Benchmarks
         |  /   Net Zero Homes?                   |  /   (all match best MEPS)
  1500   | /____BAT___                      1500  | /____BAT (best on market)___
         |________________________                |________________________
         2020    2035    2050                      2020    2035    2050

  ❌ "What's Green Buildings?"             ✅ User gets it immediately
```

### Assessment: 8/10

Strong, actionable feedback. Retiring Net Zero Appliances simplifies the story. Inline scenario descriptions are a high-impact, low-effort UX win. The main risk: keeping too many lines on one chart dilutes the message. Three scenarios (BAU + Global Benchmarks + BAT) is the sweet spot.

### Action Items

- [ ] Retire Net Zero Appliances scenario from emissions chart
- [ ] Rename remaining scenarios with user-friendly labels
- [ ] Add one-line assumption text below each scenario name on the chart
- [ ] Confirm "Green Buildings" / "Net Zero Homes" mapping to Global Benchmarks / BAT

---

## 4. Emissions Pillar — Data Sources & Chart Design

### Feedback (Patrick + Ari)

**Data source mixing:**
- Don't combine CLASP and GCI data in the same graph — pick one source per chart
- Label data source **on the chart**, not just in methodology
- For scenario comparison chart: use CLASP data directly

**Stock/units visualization:**
- Combining stock across appliance types (ACs, refrigerators, fans) in one line chart is confusing
- Current chart has shading that **looks stacked but isn't** — actively misleading
- Fans data comes from CLASP (not yet fully included)
- **Recommendation: switch to vertical bar/column chart** for stock data

```
  CURRENT (misleading line chart)          PROPOSED (clear column chart)

  Units |  ___________                     Units |
  (M)   | /  ~~~~~~~~ shading             (M)   |  ┌──┐
        |/   looks stacked                       |  │AC│ ┌──┐
        | ___________  but ISN'T                 |  │  │ │Re│ ┌──┐
        |/                                       |  │  │ │fr│ │Fa│
        |________________________                |  │  │ │ig│ │ns│
        2020    2035    2050                      └──┴──┴─┴──┴─┴──┴──
                                                   2020  2030  2040  2050
  ❌ "Is this stacked? Where                ✅ Each appliance type
     do fans start?"                           clearly separated
```

### Assessment: 9/10

This is critical UX feedback. A chart that looks stacked but isn't will mislead users into wrong conclusions (e.g., reading fan stock as the gap between two lines). The column chart fix is simple to implement and eliminates ambiguity. One source per chart is also the right call — mixed sourcing creates attribution headaches.

### Action Items

- [ ] Switch stock/units chart from line to vertical column/bar chart
- [ ] One data source per chart — don't mix CLASP and GCI in same visualization
- [ ] Label data source directly on each chart (not just in methodology)
- [ ] Ari to follow up via email on best combined stock visualization approach

---

## 5. Emissions Pillar — Direct + Indirect Emissions

### Feedback (Ari + Patrick)

- Combining direct (refrigerant leaks) and indirect (electricity) emissions in one chart **works well** — both support this
- Country emissions map currently shows CLASP view (indirect only) with toggle note for GCI (direct + indirect)

```
  EMISSIONS BREAKDOWN

  ┌─────────────────────────────────────────────────────┐
  │                TOTAL COOLING EMISSIONS               │
  │                                                      │
  │  ┌─────────────────┐    ┌──────────────────────┐    │
  │  │    INDIRECT      │    │      DIRECT           │    │
  │  │  (electricity)   │    │  (refrigerant leaks)  │    │
  │  │                  │    │                        │    │
  │  │  Powering        │    │  HFC/HCFC releases    │    │
  │  │  compressors     │    │  from equipment        │    │
  │  │  on fossil grid  │    │  (1000s x CO2 potent) │    │
  │  └─────────────────┘    └──────────────────────┘    │
  │                                                      │
  │  ✅ Combining both in one chart = SUPPORTED          │
  └─────────────────────────────────────────────────────┘
```

### Assessment: 8/10

Combining makes the full climate impact visible — showing only indirect undersells the problem. The CLASP view toggle is a good interim solution while data alignment continues.

---

![Product Efficiency — peak electricity load chart](screenshots/06-product-efficiency-peak-load.png)

## 6. Product Efficiency Pillar — Scope Clarity & Technical Accuracy

### Feedback (Ari)

**Scope inconsistency across pillars:**
- Product scope varies between sections — sometimes narrow (ACs only), sometimes broad (all cooling appliances)
- Users need to know what they're looking at as they move between sections
- It's OK that scope differs between pillars — just **make it explicit where it changes**
- Each pillar/chart should clearly state its product scope upfront

```
  SCOPE PROBLEM — user moves across sections

  Pillar 1: Emissions          Pillar 2: Product Efficiency
  ┌─────────────────────┐      ┌─────────────────────────┐
  │ Scope: ACs + Refrig │      │ Scope: ACs + Refrig     │
  │ + Fans (partial)    │      │ + Fans + ... all cooling?│
  │                     │      │                          │
  │  ❓ "Wait, are fans │      │  ❓ "Is this the same   │
  │    included here    │      │     product set as       │
  │    or not?"         │      │     Emissions?"          │
  └─────────────────────┘      └─────────────────────────┘

  FIX: Add scope badge to every section header
  ┌─────────────────────────────────────────┐
  │  PRODUCT EFFICIENCY                      │
  │  Scope: Room ACs, Refrigerators, Fans   │ ← explicit
  │  ──────────────────────────────────────  │
  │  [chart content]                         │
  └─────────────────────────────────────────┘
```

**Peak electricity load chart — keep it (Ari):**
- The peak demand story is an important dimension — don't replace it with just energy consumption
- Cooling's share of peak load tells a different story than total energy: it's about grid stress, blackout risk, and infrastructure investment
- Dropping peak in favor of energy-only would lose a key policy argument

```
  WHY PEAK ≠ ENERGY (and you need both)

  ENERGY (TWh/year)              PEAK (GW at hottest hour)
  ┌────────────────────┐         ┌────────────────────┐
  │ ████████           │         │              ████  │
  │ ████████           │         │              ████  │
  │ ████████████████   │         │         █████████  │
  │ ████████████████   │         │    ████████████████│
  └────────────────────┘         └────────────────────┘
   Jan  Apr  Jul  Oct             Jan  Apr  Jul  Oct

  Energy = total annual load       Peak = worst-case grid stress
  "How much electricity?"          "Can the grid handle it?"
  Matters for: planning,           Matters for: blackouts,
  generation capacity              infrastructure investment,
                                   AC-driven demand spikes
```

**Demand flexibility (Ari question):**
- Ari asked whether Noah had raised anything on demand flexibility in relation to peak load
- Context: demand-side flexibility (smart thermostats, thermal storage, load shifting) is a natural extension of the peak story — if cooling can be shifted off-peak, the grid stress argument changes

```
  PEAK LOAD → DEMAND FLEXIBILITY (potential extension)

  Without flexibility:           With flexibility:
  GW |         ┌──┐              GW |      ┌──────────┐
     |         │  │                 |      │  shifted  │
     |    ┌────┤  ├──┐             |  ┌───┤  cooling  ├───┐
     |    │    │  │  │             |  │   │  off-peak │   │
     |────┘    │  │  └──           |──┘   └──────────┘   └──
     └────────────────────         └────────────────────────
      6am  noon  3pm  9pm           6am  noon  3pm  9pm

  Peak = concentrated             Peak = flattened
  Grid stress = HIGH              Grid stress = LOWER
```

### Assessment: 9/10

Strong call. Peak load is the chart that makes finance ministers and grid planners pay attention. Saudi Arabia at 60%+ of peak load from cooling alone (visible in the current chart) is a showstopper stat. Energy consumption charts are common — peak load charts are rare and differentiated. This is a competitive advantage for CoolProgress.

**MEPS compliance & enforcement gap (Ari):**
- Dashboard shows MEPS stringency maps — but what's missing is the **compliance and enforcement** dimension
- Countries can have MEPS on paper but no enforcement → product dumping continues
- This should be emphasized alongside the stringency data

```
  THE ENFORCEMENT GAP

  ┌─────────────────────────────────────────────────────┐
  │                                                      │
  │  MEPS ON PAPER          vs.       MEPS IN PRACTICE   │
  │                                                      │
  │  ┌─────────────┐                ┌─────────────┐     │
  │  │ Country has  │                │ Products on  │     │
  │  │ MEPS level 3 │    GAP ───>   │ market still │     │
  │  │ since 2020   │                │ at level 1   │     │
  │  └─────────────┘                └─────────────┘     │
  │                                                      │
  │  Reasons:                                            │
  │  - No testing labs                                   │
  │  - No market surveillance                            │
  │  - No penalties for non-compliance                   │
  │  - Product dumping from unregulated markets          │
  │                                                      │
  │  ┌──────────────────────────────────────────────┐   │
  │  │ PROPOSED: Add enforcement indicator to MEPS   │   │
  │  │ map — e.g., color overlay or second map layer │   │
  │  │ showing "has MEPS" vs "enforces MEPS"         │   │
  │  └──────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────┘
```

**MEPS data updates (Patrick):**
- Indonesia and Singapore have recent MEPS updates that need to be reflected in the dashboard
- Patrick flagged these as needing attention

### Assessment: 9/10

This is arguably the most important gap in the Product Efficiency pillar. A MEPS map without enforcement data flatters countries that legislate but don't enforce — creating a misleading picture of progress. Even a simple binary indicator (enforced/not enforced) or a traffic light (strong/weak/none) would transform the map from "who has standards" to "who actually implements them." Data availability will be the challenge — U4E and CLASP may be the best sources for enforcement intelligence.

**CSPF unit correction:**
- ISO CSPF is measured in **watt-hours per watt-hour** (Wh/Wh) — an energy ratio
- Dashboard currently shows/implies watts per watt (W/W) — a power ratio
- This is technically incorrect; CSPF is an energy efficiency metric, not power

```
  UNIT CORRECTION

  ❌ CURRENT:  CSPF = W/W   (power metric)
  ✅ CORRECT:  CSPF = Wh/Wh (energy metric)

  Why it matters:
  ┌──────────────────────────────────────────────┐
  │  CSPF = Cooling Seasonal Performance Factor  │
  │                                               │
  │  Total cooling energy delivered (Wh)          │
  │  ─────────────────────────────────────        │
  │  Total electrical energy consumed (Wh)        │
  │                                               │
  │  = Wh/Wh (dimensionless energy ratio)         │
  │  ≠ W/W   (instantaneous power ratio)          │
  │                                               │
  │  Think of it like fuel economy:                │
  │  "km per liter" not "km/h per liter/h"        │
  └──────────────────────────────────────────────┘
```

### Assessment: 8/10

**Scope clarity: 9/10** — This is a foundational UX issue. If a policymaker reads Emissions (ACs + refrigerators) then jumps to Product Efficiency (all cooling), they'll draw wrong comparisons. A simple scope badge per section solves it with zero design overhead.

**CSPF unit fix: 7/10** — Technically important and easy to fix, but most users won't notice the W/W vs Wh/Wh distinction. Still, for credibility with technical audiences (U4E, IEA, CLASP themselves), it must be correct. A small fix with outsized credibility impact.

### Action Items

- [ ] Add product scope labels to each pillar/section header
- [ ] Create a scope legend or consistency note (which appliances are covered where)
- [ ] Fix CSPF unit display from W/W to Wh/Wh across all charts and text
- [ ] Review all pillar pages for consistent product scope language

---

![Refrigerant Transition — HFC emissions scenarios](screenshots/07-refrigerant-hfc-scenarios.png)

## 7. Refrigerant Transition Pillar — Scenario Alignment

### Feedback (Patrick / Ari)

**Historical line convergence bug:**
- Before 2025, all three scenario lines (BAU, Kigali Implementation, Kigali+) must be fully aligned — they share the same historical data
- Currently the lines diverge too early, implying different histories which is incorrect
- Scenarios only diverge from present/future, not the past

```
  CURRENT (bug):                       CORRECT:

  Mt |                                 Mt |
  700|    ___BAU                        700|    ___BAU
     |   / __Kigali Impl               |  / __Kigali Impl
  400| _/./___Kigali+                   400|././___Kigali+
     |/./                                  |/  ← ALL lines identical
  300|/                                 300|     before 2025
     |________________________             |________________________
     2020  2025  2030  2040                2020  2025  2030  2040
                                                   ↑
     ❌ Lines diverge in                   ✅ Single historical line,
        historical period                     divergence starts ~2025
```

### Assessment: 9/10

This is a data integrity issue, not just cosmetic. If scenario lines diverge before the present, users will question the credibility of the projections. Historical data is observed — there's only one history. Easy fix: ensure all scenarios share identical values up to the base year, then branch. High priority.

### Action Items

- [ ] Fix HFC emissions chart: align all scenario lines before 2025 (single historical track)
- [ ] Verify base year alignment across all scenario charts (emissions, refrigerant, efficiency)

![Refrigerant bank — compound share over time](screenshots/08-refrigerant-bank-chart.png)

**Refrigerant bank — add appliance reference:**
- The "Global Refrigerant Bank" chart shows bank share by compound (HCFC-22, HFC-134a, HFC-32, etc.) but doesn't specify which appliances are included
- Need to clarify: is this ACs only? ACs + refrigerators? All cooling + heating?
- Same scope clarity issue as Pillar 2 — ties back to Ari's cross-pillar feedback

```
  CURRENT: "Global refrigerant bank      PROPOSED: add appliance scope
   share by compound"
                                          "Global refrigerant bank share
   ┌──────────────────────┐                by compound"
   │ HCFC-22  ████████    │               ┌──────────────────────────────┐
   │ HFC-134a ██████      │               │ Appliances: Room ACs,        │
   │ HFC-32   ████        │               │ commercial refrigeration,    │
   │ HFC-125  ███         │               │ mobile AC, industrial        │
   │ ...                  │               ├──────────────────────────────┤
   │                      │               │ HCFC-22  ████████           │
   │ ❌ Which appliances? │               │ HFC-134a ██████             │
   └──────────────────────┘               │ HFC-32   ████              │
                                          │ ...                         │
                                          │ ✅ Scope is clear            │
                                          └──────────────────────────────┘
```

![Managing the Transition — lifecycle & technical considerations](screenshots/09-managing-transition.png)

![Managing the Transition — detail view](screenshots/10-managing-transition-detail.png)

**Workforce training & certification (Ari + Patrick):**
- Technicians need to be trained and certified to work with flammable and toxic refrigerants (R-290 propane, R-717 ammonia, etc.)
- Currently partly covered under "leak prevention / end of life" — but workforce training is frequently called out as a standalone issue in the sector
- Both agreed it deserves explicit mention — suggested it fits under **"Technical Standards and QCR"** section
- Training is a prerequisite for safe refrigerant transition — without it, low-GWP adoption stalls

```
  REFRIGERANT TRANSITION — ENABLING CONDITIONS

  ┌─────────────────────────────────────────────────────┐
  │              SAFE TRANSITION TO LOW-GWP             │
  │                                                      │
  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
  │  │  Kigali     │  │  Safety      │  │  Workforce │ │
  │  │  Phase-down │  │  Standards   │  │  Training  │ │
  │  │  Schedule   │  │  (IEC 60335) │  │  & Certif. │ │
  │  └──────┬──────┘  └──────┬───────┘  └──────┬─────┘ │
  │         │                │                  │       │
  │         ▼                ▼                  ▼       │
  │  ┌─────────────────────────────────────────────┐   │
  │  │  Currently on dashboard:                     │   │
  │  │  ✅ Kigali ratification & phase-down         │   │
  │  │  ✅ Leak prevention & end of life            │   │
  │  │  ⚠️ Technical standards (partial)            │   │
  │  │  ❌ Workforce training (missing as explicit) │   │
  │  └─────────────────────────────────────────────┘   │
  │                                                      │
  │  PROPOSED: Add under "Technical Standards & QCR"     │
  │  - # certified technicians (by country if available) │
  │  - Training programs (NOU, U4E, industry)            │
  │  - Certification schemes for flammable refrigerants  │
  └─────────────────────────────────────────────────────┘
```

**Proposed infographic — "Managing the Refrigerant Transition":**

![Managing the Refrigerant Transition — v2 with standards & codes](screenshots/14-managing-refrigerant-transition-v2.png)

This infographic presents the expanded 6-step lifecycle with **Standards & Codes** mapped to each stage. Updated from initial draft (v1 in `screenshots/11-*`) to include specific ISO/EN/ASHRAE/EPA references per step. Already adapted to CoolProgress website L&F (navy/teal palette, clean icons, card layout). Key additions vs. current website: **Policy & Standards** (step 1), **Training & Certification** (step 2), **Responsible Deployment** (step 3) as explicit stages, plus Technical Safeguards bar.

```
  CURRENT WEBSITE (3 boxes)          PROPOSED INFOGRAPHIC (6 steps)

  ┌────────────┐ ┌──────────┐       01 Policy & Standards     ← NEW
  │    Leak    │ │End-of-   │       02 Technician Training    ← NEW
  │ Prevention │ │Life      │       03 Responsible Deployment ← NEW
  │            │ │Recovery  │       04 Leak Prevention        (existing)
  └────────────┘ └──────────┘       05 End-of-Life Recovery   (existing)
  ┌─────────────────────────┐       06 Reclamation & Destruct.(existing)
  │ Reclamation &           │
  │ Destruction             │       + TECHNICAL SAFEGUARDS bar:
  └─────────────────────────┘         Flammability | Toxicity |
                                      High Pressure | PFAS
  Missing: policy, training,
  responsible deployment              ✅ Complete lifecycle view
```

### Assessment: 9/10

The infographic is a major improvement — it tells the full lifecycle story from policy through to destruction. The 6-step flow directly addresses the workforce training gap and certification thread discussed earlier. The "Technical Safeguards" bar at the bottom cleanly separates safety considerations from the process flow. Key implementation task: match CoolProgress design system (teal/navy palette, card-based layout, icon consistency).

### Action Items

- [ ] Adapt infographic to CoolProgress website L&F (colors, fonts, icons)
- [ ] Replace current 3-box "Managing the Transition" section with 6-step layout
- [ ] Ensure Technical Safeguards bar matches existing card styling

---

**Certification & regulations for lifecycle management (Ari):**
- Technicians handle refrigerants across the entire lifecycle — installation, servicing, recovery, reclamation, destruction
- Each stage requires specific certifications and regulatory frameworks
- Without certification requirements, technicians vent refrigerants rather than recover them
- This connects leak prevention, end-of-life recovery, AND reclamation — it's the enabling thread

```
  REFRIGERANT LIFECYCLE — CERTIFICATION GAP

  Installation → Servicing → Recovery → Reclamation → Destruction
       │             │           │            │             │
       ▼             ▼           ▼            ▼             ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  At EVERY stage, a technician handles refrigerant.           │
  │  Without certification & regulation:                         │
  │                                                              │
  │  Stage              What happens              Climate impact │
  │  ─────────────────  ──────────────────────    ────────────── │
  │  Installation       Overcharging, leaks       Direct GHG     │
  │  Servicing          Venting during repair     Direct GHG     │
  │  Recovery           Skipped entirely          Direct GHG     │
  │  Reclamation        No facilities exist       Waste          │
  │  Destruction        Illegal dumping           Direct GHG     │
  │                                                              │
  │  ┌────────────────────────────────────────────────────┐     │
  │  │  CERTIFICATION is the thread that connects ALL      │     │
  │  │  three boxes: Leak Prevention + End-of-Life         │     │
  │  │  Recovery + Reclamation & Destruction                │     │
  │  └────────────────────────────────────────────────────┘     │
  └──────────────────────────────────────────────────────────────┘
```

### Assessment: 8/10

Workforce training is consistently one of the top barriers cited in Kigali Amendment implementation — NOUs, UNIDO, and U4E all flag it. Tucking it under "leak prevention" undersells it. Adding it explicitly under "Technical Standards and QCR" is the right home — it's a quality/compliance topic. Data availability will be the challenge (no global database of certified technicians), but even a qualitative indicator ("has national certification scheme: yes/no") adds value.

---

## 8. Access & Vulnerability Pillar — Synergies and Policy Integration

### Feedback (Manuel)

- Show the **synergy between access/vulnerability and product efficiency** — bring people and cooling technology topics together
- Don't treat access as isolated from the other pillars
- Policies should be represented here too — not just MEPS (product efficiency), but broader policies that affect access (subsidies, financing, building codes, urban planning)

```
  CURRENT: SILOED PILLARS

  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Product  │  │Refriger- │  │ Access & │  │ Policy   │
  │Efficiency│  │  ants    │  │  Vuln.   │  │Framework │
  │          │  │          │  │          │  │          │
  │  MEPS    │  │  Kigali  │  │  1.2bn   │  │  NDCs    │
  │  labels  │  │  HFCs    │  │  at risk │  │  NCAPs   │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
       ↑              ↑              ↑             ↑
       No connections shown between pillars

  PROPOSED: SHOW SYNERGIES

  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Product  │  │Refriger- │  │ Access & │  │ Policy   │
  │Efficiency│  │  ants    │  │  Vuln.   │  │Framework │
  │          │  │          │  │          │  │          │
  │  MEPS    │  │  Kigali  │  │  1.2bn   │  │  NDCs    │
  │  labels  │  │  HFCs    │  │  at risk │  │  NCAPs   │
  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
       │              │              │             │
       └──────┐  ┌────┘    ┌────────┘   ┌─────────┘
              ▼  ▼         ▼            ▼
       ┌──────────────────────────────────────┐
       │  SYNERGIES: How do efficient ACs     │
       │  reach vulnerable populations?        │
       │                                       │
       │  - Affordable efficient ACs (MEPS)    │
       │  - Low-GWP refrigerants (Kigali)      │
       │  - Subsidy/financing (policy)         │
       │  - Building codes (passive cooling)   │
       └──────────────────────────────────────┘
```

### Assessment: 8/10

Manuel is right that Access & Vulnerability risks becoming a "sad stats" page if it's not connected to solutions from other pillars. The synergy angle makes it actionable — showing policymakers that MEPS, refrigerant transitions, and financing policies all converge on the access question. The challenge is UX: how to cross-reference without cluttering. Options:

- **Cross-links**: "See also: how MEPS affect affordability → Pillar 2"
- **Synergy callout boxes**: highlight where two pillars intersect
- **Integrated maps**: overlay vulnerability data with MEPS/policy data

The broader policy point is also valid — MEPS is one policy lever, but subsidies, building codes, and urban planning policies directly affect who gets access to cooling. This could be a dedicated section within Access & Vulnerability.

### Action Items

- [ ] Add cross-references/synergy links between Access & Vulnerability and other pillars
- [ ] Include broader policy types (subsidies, financing, building codes) in Access pillar — not just MEPS
- [ ] Explore map overlays: vulnerability + MEPS coverage or policy indicators

---

## Consolidated Action Items

### Immediate (dashboard changes)

- [ ] Remove numbers from priority areas on landing page
- [ ] Add color coding to navigation sidebar
- [ ] Retire Net Zero Appliances scenario
- [ ] Rename scenarios with user-friendly labels + inline assumptions
- [ ] Switch stock chart from lines to column/bar chart
- [ ] Label data sources on each chart directly
- [ ] One source per chart — no CLASP/GCI mixing
- [ ] Add product scope labels to each pillar/section header
- [ ] Fix CSPF unit from W/W to Wh/Wh (energy metric, not power)
- [ ] Add MEPS enforcement/compliance indicator to stringency map
- [ ] Keep peak electricity load chart (don't replace with energy-only)
- [ ] Update MEPS data for Indonesia and Singapore
- [ ] Fix HFC emissions chart: all scenario lines must align before 2025
- [ ] Add appliance scope reference to refrigerant bank chart
- [ ] Add workforce training & certification as explicit item under Technical Standards & QCR
- [ ] Adapt 6-step refrigerant transition infographic to CoolProgress L&F
- [ ] Replace 3-box "Managing the Transition" with 6-step lifecycle layout

### Decisions Needed

- [ ] Final name for "Policy Framework" pillar (Plans & Commitments? Commitments & Targets?)
- [ ] Pillar ordering (Ari: commitments first vs. Dietram: emissions first, commitments second)
- [ ] Confirm scenario name mappings (Green Buildings → Global Benchmarks?)

### Follow-ups

- [ ] Ari: email on best stock visualization approach
- [ ] Patrick: align scenario chart with single CLASP data source

---

## Open Questions

- Should the policy framework section be renamed and placed first or last in the website structure?
- How to best integrate maps with policy framework content without creating silos?
- What is the optimal way to visually represent the hierarchy or equivalence of pillars and priority areas?

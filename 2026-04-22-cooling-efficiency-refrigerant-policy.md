# CoolProgress Dashboard — Cooling Efficiency, Refrigerant Transition & Policy Frameworks

**Date/Time**: April 22, 2026, 17:09 CEST (continued from 16:42 session)
**Participants**: Patrick (HEAT), Ari (CLASP), Manuel, Dietram (HEAT)
**Related**: [Part 1 — Website Structure & Policy Framework](2026-04-22-website-structure-policy-framework.md)

---

## Overall Summary

The meeting covered detailed discussions on product efficiency in cooling appliances, challenges and data related to refrigerant transition, policy frameworks including the Kigali Amendment and global cooling pledge, and issues of access and vulnerability to cooling. Emphasis was placed on harmonizing standards, compliance enforcement, and clear communication of data and scope. The importance of workforce training and certification in refrigerant handling was also highlighted.

---

## 1. Product Efficiency — Market Transitions & MEPS Harmonization

### Feedback

- Market transitions underway — inverter revolution driving significant energy savings in ACs
- MEPS harmonization across ASEAN region needs attention: Thailand, Vietnam, Singapore, Malaysia all have recent updates
- Need to track compliance enforcement alongside MEPS existence

```
  INVERTER REVOLUTION — WHY IT MATTERS

  FIXED-SPEED AC                    INVERTER AC
  ┌────────────────────┐            ┌────────────────────┐
  │                    │            │                    │
  │  ON ████████████   │            │  ████              │
  │  OFF              │            │    ████            │
  │  ON ████████████   │            │      ████████████  │
  │  OFF              │            │                    │
  │  ON ████████████   │            │  Continuous,       │
  │                    │            │  variable speed     │
  └────────────────────┘            └────────────────────┘
  Power: 100% or 0%                 Power: 30-100%
  Energy waste: HIGH                Energy waste: LOW
  Comfort: fluctuating              Comfort: stable

  Savings: 30-50% energy reduction
```

```
  ASEAN MEPS LANDSCAPE — UPDATES NEEDED

  Country     │ Status          │ Action
  ────────────┼─────────────────┼──────────────────────
  Thailand    │ Recently updated│ Reflect new levels
  Vietnam     │ Recently updated│ Reflect new levels
  Singapore   │ Recently updated│ Reflect new levels
  Malaysia    │ Recently updated│ Reflect new levels
  Indonesia   │ Flagged earlier │ Reflect new levels
  ────────────┴─────────────────┴──────────────────────
  
  ⚠️ Dashboard must track not just "has MEPS"
     but "enforces MEPS" (compliance gap)
```

### Assessment: 8/10

The inverter transition is the single biggest efficiency lever for room ACs globally. Tracking it alongside MEPS stringency tells the real story — a country can have strict MEPS but if the market hasn't shifted to inverters, the on-ground impact is limited. ASEAN is a critical region where rapid MEPS updates create both opportunity (leapfrogging) and confusion (different standards, labeling schemes). Harmonization tracking is high-value.

### Action Items

- [ ] Add ASEAN MEPS updates (Thailand, Vietnam, Singapore, Malaysia) to dashboard
- [ ] Track inverter market share alongside MEPS stringency where data available
- [ ] Add compliance enforcement indicator (see Part 1, Section 6)

---

## 2. Refrigerant Transition — GWP & Kigali

### Feedback

- GWP values and Kigali Amendment ratification tracking are core to this pillar
- Need for leak prevention, end-of-life recovery, and workforce certification (expanded in Part 1)
- Integration question: should Kigali Amendment map also appear in the Policy Framework section?

```
  KIGALI AMENDMENT — WHERE DOES IT LIVE?

  Currently:                        Question:
  ┌──────────────────────┐          Should Kigali map ALSO appear in
  │ Pillar 3: Refrigerant│          Policy Framework / Plans & Commitments?
  │ Transition           │
  │                      │          ┌─────────────────────────────┐
  │ ✅ Kigali ratif. map │          │ Pillar 5 (or 2): Policy     │
  │ ✅ Phase-down chart  │          │                             │
  │ ✅ HFC scenarios     │          │ NDC mentions    ✅          │
  └──────────────────────┘          │ Cooling Pledge  ✅          │
                                    │ NCAPs           ✅          │
                                    │ Kigali ratif.   ❓ cross-ref│
                                    └─────────────────────────────┘

  OPTIONS:
  A) Keep Kigali only in Pillar 3 (clean separation)
  B) Cross-reference: link from Policy to Pillar 3 Kigali map
  C) Duplicate map in both (risks inconsistency)
```

### Assessment: 7/10

Kigali is both a commitment (belongs in Policy/Commitments) AND a technical transition tracker (belongs in Refrigerant Transition). Option B (cross-reference) is the safest — avoids duplication while connecting the pillars. This ties back to Manuel's point about avoiding silos.

### Action Items

- [ ] Decide: cross-reference Kigali map from Policy pillar to Refrigerant Transition, or duplicate
- [ ] Ensure Kigali ratification count stays current via API/automated updates

---

## 3. Policy Frameworks — Global Cooling Pledge & NCAPs

### Feedback

- Global Cooling Pledge signatory count needs regular updating — should be API-driven for easy maintenance
- NDC cooling mentions tracked
- **NCAP documents are hard to track** — official website links frequently break or change
- Terminology matters: distinguish between commitments (pledges, ratifications), plans (NCAPs, NDCs), and implementation (actual policies enacted)

```
  POLICY CONTENT — WHAT'S WHAT?

  ┌──────────────────────────────────────────────────────┐
  │              POLICY FRAMEWORK CONTENT                  │
  │                                                        │
  │  COMMITMENTS (intentions)                              │
  │  ├── Global Cooling Pledge signatories (71 nations)   │
  │  ├── Kigali Amendment ratification                     │
  │  └── Paris Agreement / NDC cooling mentions            │
  │                                                        │
  │  PLANS (roadmaps)                                      │
  │  ├── National Cooling Action Plans (NCAPs)             │
  │  └── National Implementation Plans (Kigali)            │
  │                                                        │
  │  IMPLEMENTATION (actual policies)                      │
  │  ├── MEPS enacted (→ Pillar 2)                        │
  │  ├── Labeling schemes (→ Pillar 2)                    │
  │  └── Building codes with cooling provisions            │
  │                                                        │
  │  ⚠️ Dashboard should clearly separate these layers    │
  │     Not all "policies" are created equal               │
  └──────────────────────────────────────────────────────┘

  NCAP LINK ROT PROBLEM:
  ┌──────────────────────────────────────────┐
  │  Country publishes NCAP → link works ✅  │
  │  6 months later → ministry reshuffles    │
  │  website → link breaks ❌                │
  │                                          │
  │  FIX: Archive PDFs locally + Wayback     │
  │  Machine links as backup                  │
  └──────────────────────────────────────────┘
```

### Assessment: 8/10

The commitment/plan/implementation distinction is crucial — it's exactly the confusion the "Policy Framework" rename aims to solve. If the pillar becomes "Plans & Commitments," it should explicitly NOT include implementation tracking (that's Pillars 2-3). The NCAP link rot problem is real and frustrating — archiving PDFs is the pragmatic solution. API-driven pledge counts prevent stale data.

### Action Items

- [ ] Automate Global Cooling Pledge signatory count via API
- [ ] Archive NCAP PDFs locally to prevent link rot
- [ ] Add Wayback Machine backup links for official documents
- [ ] Clearly separate commitments vs. plans vs. implementation in pillar content

---

## 4. Access & Vulnerability — Population at Risk

### Feedback

- 1.2 billion people at high risk due to lack of cooling access
- Data presentation should show **both total numbers AND percentages**
- Align color coding with SEforALL methodology
- **Gender dimension** important but currently missing
- **Humidity factor** (wet-bulb heat stress) is a critical but under-represented dimension

```
  ACCESS & VULNERABILITY — DATA PRESENTATION

  CURRENT: just total numbers        PROPOSED: numbers + percentages
  
  ┌────────────────────┐             ┌──────────────────────────────┐
  │ India: 453M        │             │ India: 453M (32% of pop.)    │
  │ Sub-Saharan: 312M  │             │ Sub-Saharan: 312M (25%)      │
  │ Southeast Asia: 89M│             │ Southeast Asia: 89M (13%)    │
  └────────────────────┘             └──────────────────────────────┘
  
  ❌ "Is 453M a lot for India?"      ✅ "32% of India lacks cooling
     No context.                        access — that's 1 in 3"

  COLOR CODING: align with SEforALL
  ┌────────────────────────────────────┐
  │  🔴 Critical (>50% at risk)       │
  │  🟠 High (30-50%)                 │
  │  🟡 Moderate (15-30%)             │
  │  🟢 Low (<15%)                    │
  └────────────────────────────────────┘
```

```
  WET-BULB HEAT STRESS — THE HIDDEN DIMENSION

  Temperature alone ≠ heat danger

  Dry heat (40C, 20% RH)           Humid heat (35C, 80% RH)
  ┌────────────────────┐            ┌────────────────────┐
  │  Sweat evaporates  │            │  Sweat CAN'T       │
  │  → body cools      │            │  evaporate          │
  │  → survivable      │            │  → body overheats   │
  │                    │            │  → potentially fatal │
  └────────────────────┘            └────────────────────┘

  Wet-bulb temperature thresholds:
  26-28C  ⚠️  Stressful for heavy outdoor work
  30-32C  🔶  Dangerous, productivity drops
  34-35C  🔴  Extreme, potentially lethal

  Countries at highest risk:
  India, Pakistan, Bangladesh, Persian Gulf,
  SE Asia, eastern China, Brazil coastal zones

  → This data should inform the vulnerability mapping
```

### Assessment: 9/10

Showing percentages alongside totals is a basic data communication best practice — easy win. The SEforALL color alignment ensures consistency with the most recognized framework in the space. The gender and humidity dimensions are the two biggest gaps:

- **Gender**: women in many contexts have less access to cooling, more exposure to indoor heat (cooking), and different physiological heat tolerance. Even a qualitative note would improve the pillar.
- **Wet-bulb heat stress**: this is the real killer metric. Dry-bulb temperature maps overstate risk in arid regions and understate it in humid tropics. Incorporating wet-bulb or WBGT data would make CoolProgress the only dashboard connecting cooling access to actual survivability thresholds.

### Action Items

- [ ] Show both total numbers and percentages for population at risk
- [ ] Align color coding with SEforALL methodology
- [ ] Add gender dimension to vulnerability data (even qualitative initially)
- [ ] Explore wet-bulb temperature / WBGT integration for vulnerability mapping
- [ ] Share resources and papers on vulnerability for inclusion (follow-up)

---

## 5. Cross-Cutting — Data Integration Questions

### Open Questions

- How to best integrate refrigerant GWP considerations with energy efficiency labels and policies?
- What is the optimal way to present peak electricity demand data alongside energy consumption for cooling appliances?
- How to ensure continuous access to NCAP documents given broken or changed links on official websites?
- What are the implications of changing humidity levels on cooling vulnerability and how to represent this in future data updates?
- Should the Kigali Amendment map be included in the policy framework section for better clarity?

```
  THE BIG INTEGRATION CHALLENGE

  Currently, each pillar has its own data world:

  Emissions ←──?──→ Product Efficiency ←──?──→ Refrigerant
      ↑                                              ↑
      ?                                              ?
      ↓                                              ↓
  Access   ←──?──→ Policy Framework

  The "?" connections are where users get lost.

  IDEAL: Every pillar page has a "See also" sidebar
  showing how this pillar connects to others.

  Example for Refrigerant Transition:
  ┌──────────────────────────────────┐
  │ 📌 CONNECTIONS                   │
  │                                  │
  │ → Emissions: HFC direct GHG     │
  │   impact (Pillar 1)             │
  │ → Efficiency: GWP + efficiency   │
  │   labels (Pillar 2)             │
  │ → Policy: Kigali ratification    │
  │   status (Pillar 5)             │
  │ → Access: affordable low-GWP    │
  │   options (Pillar 4)            │
  └──────────────────────────────────┘
```

---

## Consolidated Action Items (Session 2)

### Immediate

- [ ] Add ASEAN MEPS updates (Thailand, Vietnam, Singapore, Malaysia, Indonesia)
- [ ] Automate Global Cooling Pledge signatory count via API
- [ ] Show both totals and percentages for vulnerability data
- [ ] Align vulnerability color coding with SEforALL
- [ ] Archive NCAP PDFs locally + Wayback Machine backups

### Decisions Needed

- [ ] Kigali map: cross-reference from Policy pillar or duplicate?
- [ ] Commitment vs. plan vs. implementation: how to visually separate in Policy pillar?

### Follow-ups

- [ ] Share vulnerability and efficiency papers for inclusion
- [ ] Explore wet-bulb / WBGT data sources for vulnerability mapping
- [ ] Explore gender dimension data sources

### Combined with Session 1

See [Part 1](2026-04-22-website-structure-policy-framework.md) for additional action items on:
- Website structure, numbering, color coding
- Emissions scenarios and chart design
- Product scope clarity and CSPF units
- Refrigerant lifecycle infographic
- Stock visualization redesign

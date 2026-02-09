# MEPS Harmonization Methodology: CSPF and EEI as Common Metrics

**Project**: CWC-GLO-CPROG / CoolProgress Dashboard
**Version**: 1.0
**Date**: 2026-02-08
**Author**: HEAT GmbH Research Team

---

## 1. Purpose

This document explains the methodology used to harmonize Minimum Energy Performance Standards (MEPS) for cooling appliances across countries that use different national metrics. The goal is to enable meaningful cross-country comparisons on the CoolProgress Dashboard.

---

## 2. Air Conditioners: CSPF as the Harmonization Metric

### 2.1 Why ISO CSPF?

ISO 16358-1 (Cooling Seasonal Performance Factor) provides the internationally agreed methodology for calculating seasonal cooling performance. Unlike steady-state metrics (EER), CSPF captures real-world performance by weighting efficiency across a range of operating temperatures and part-load conditions.

CSPF is expressed in W/W (or equivalently Wh/Wh) and represents the ratio of total cooling energy delivered to total electrical energy consumed over a cooling season.

### 2.2 National Metrics and Their Relationship to ISO CSPF

| National Metric | Countries Using It | Relationship to ISO CSPF |
|---|---|---|
| **CSPF (ISO 16358)** | China, Singapore, ASEAN, SADC, Brazil, South Korea | Direct equivalent (1:1) for countries using ISO test conditions |
| **APF (JIS C 9612)** | Japan | Combines cooling and heating seasons; cooling-only component: CSPF ~ APF x 0.85-0.95 |
| **ISEER (BIS IS 1391)** | India | Uses India-specific T1/T3 climate bins; ISO CSPF ~ ISEER x 0.92-0.98 |
| **EU SEER (EN 14825)** | EU-27, UK, Switzerland, Turkey | Includes standby power; ISO CSPF ~ EU SEER x 0.95 |
| **SEER2 (AHRI 210/240-2023)** | USA, Canada | Higher external static pressure test (M1); ISO CSPF ~ SEER2 x 0.293 x 1.1 |
| **SEER (AHRI 210/240)** | USA (legacy), some Latin American countries | ISO CSPF ~ SEER x 0.293 x 1.1; SEER ~ SEER2 x 1.05-1.07 |
| **EER (ISO 5151)** | Saudi Arabia, GCC, North Africa, Ghana, legacy systems | Steady-state only; CSPF ~ EER x 1.062 (fixed-speed), variable-speed 20-60% higher |
| **AEER** | Australia, New Zealand | Similar to CSPF methodology; CSPF ~ AEER x 1.05-1.1 |
| **NSEER** | Nigeria | Nigeria-specific seasonal metric; approximately equivalent to CSPF |

### 2.3 Conversion Formulas Applied

#### EER to CSPF (Fixed-Speed Units)
```
CSPF = 1.062 x EER
```
Source: Lawrence Berkeley National Laboratory, ASEAN AC Harmonization Study 2021

#### EER to CSPF (Variable-Speed / Inverter Units)
No simple linear conversion exists. Variable-speed units achieve 20-60% higher CSPF than their rated EER due to part-load efficiency gains. Actual ISO 16358 test data is required for accurate conversion. Where test data is unavailable, we apply a conservative 1.3x multiplier:
```
CSPF (variable-speed, approximate) = EER x 1.3
```

#### US SEER to ISO CSPF
```
ISO CSPF = SEER x 0.293 x 1.1
```
This accounts for the unit conversion from BTU/Wh to W/W (factor 0.293) and adjustment for different climate bin distributions (factor ~1.1). The LBNL conversion table provides more precise equivalents:

| US SEER | ISO CSPF |
|---|---|
| 13.0 | 3.8 |
| 14.0 | 4.1 |
| 15.0 | 4.4 |
| 16.0 | 4.7 |
| 18.0 | 5.3 |
| 20.0 | 5.9 |

#### SEER2 to SEER
```
SEER = SEER2 x 1.05 to 1.07
```
SEER2 values are 5-7% lower than SEER due to higher external static pressure testing conditions (0.5 inches vs 0.1 inches water column in the M1 test procedure).

#### EU SEER to ISO CSPF
```
ISO CSPF = EU SEER x 0.95
```
EU SEER includes standby and off-mode power consumption, which reduces the ratio compared to ISO CSPF. The climate bin distributions also differ (European reference conditions vs ISO T1).

#### India ISEER to ISO CSPF
```
ISO CSPF = ISEER x 0.92 to 0.98
```
ISEER uses India-specific climate bins (predominantly T1 and T3 conditions for hot-dry and hot-humid zones). The conversion factor varies by climate zone weighting. We apply a central estimate of 0.92 for conservative comparison.

Source: CLASP World's Best MEPS analysis

#### Japan APF to CSPF (Cooling Component)
```
CSPF (cooling) = APF x 0.85 to 0.95
```
APF combines both cooling and heating performance weighted by Japanese climate conditions. The cooling-only CSPF is derived by isolating the cooling season component. We apply 0.90 as a central estimate for wall-mounted units <=4kW.

#### Australia AEER to CSPF
```
CSPF = AEER x 1.05 to 1.1
```
AEER (Annual Energy Efficiency Ratio) uses Australian climate conditions. We apply a central estimate of 1.06.

### 2.4 Reference Conditions

All comparisons assume the following reference conditions unless stated otherwise:
- **Capacity**: 3.5 kW (12,000 BTU/h) nominal cooling
- **ISO T1 conditions**: Indoor 27C DB / 19C WB, Outdoor 35C DB / 24C WB
- **ISO T3 conditions**: Indoor 29C DB / 19C WB, Outdoor 46C DB / 24C WB (relevant for Middle East, parts of India)

### 2.5 U4E Benchmark Levels

The UNEP United for Efficiency (U4E) Model Regulation provides three benchmark tiers:

| Level | ISO CSPF | Description |
|---|---|---|
| Minimum MEPS | 5.1 W/W | Recommended floor for all countries |
| High Efficiency | 6.5 W/W | Target for advanced markets |
| Net-Zero 2050 Path | 8.5-9.0 W/W | Technology potential demonstrated by Global Cooling Prize finalists |

The IEA Net-Zero Pathway calls for a 50% increase in average AC efficiency by 2030 across all economies.

---

## 3. Refrigerators: EEI as Harmonization Metric

### 3.1 Why EEI?

The Energy Efficiency Index (EEI) provides a normalized comparison independent of refrigerator size. It expresses actual energy consumption as a percentage of a reference consumption level, which is typically calculated based on the refrigerator's adjusted volume and type.

Lower EEI values indicate higher efficiency. Most regulatory regimes define MEPS as maximum allowable EEI values.

### 3.2 National Metrics

| National Metric | Countries | Notes |
|---|---|---|
| **EEI** | EU, Australia/NZ, SADC, Saudi Arabia | Direct comparison possible |
| **kWh/yr** | USA, Japan, India, Kenya | Absolute consumption; size-dependent, harder to compare directly |
| **kWh/month** | South Korea, Brazil | Same as kWh/yr but monthly reporting convention |
| **TEEI (%)** | China | Total Energy Efficiency Index - similar concept to EU EEI, lower = better |
| **Star Rating** | India | Correlates to kWh/yr bands by volume category |

### 3.3 Cross-Comparison Limitations

Unlike ACs, refrigerator metrics are harder to harmonize because:
1. Volume-based standards vary in how "adjusted volume" is calculated (fresh vs frozen compartments, defrost type)
2. Climate class assumptions differ (SN/N/ST/T)
3. Test methods (IEC 62552 vs national variants) produce different results
4. Categories (fridge, fridge-freezer, chest freezer) have separate standards

For the CoolProgress Dashboard, we present refrigerator MEPS using the national metric alongside the EEI value where available. Where only kWh/yr figures exist, we note them without attempting forced conversion.

### 3.4 U4E Benchmark for Refrigerators

| Level | Threshold | Description |
|---|---|---|
| Minimum MEPS | <= 279 kWh/yr | Recommended floor for all countries |
| Intermediate | <= 223 kWh/yr | For economies already meeting minimum |

---

## 4. Fans: No Single Harmonization Metric

Fan efficiency metrics vary substantially by market and no international harmonization standard exists comparable to ISO 16358 for ACs. We present fan data using national metrics without conversion:

| Metric | Countries | Unit |
|---|---|---|
| Watts (max service value) | India | W |
| CFM/W | USA | Airflow per Watt |
| Efficiency Grade | China, EU | Categorical |

---

## 5. Limitations and Caveats

1. **Climate bin variations**: Different countries weight temperature distributions differently, affecting seasonal performance calculations. A CSPF of 5.0 in Singapore's tropical climate represents different real-world savings than 5.0 in Japan's temperate climate.

2. **Capacity range effects**: MEPS often vary by cooling capacity tier. Our primary comparison uses the 3.5 kW reference, but many countries have different requirements for larger systems.

3. **Fixed vs variable speed**: Some countries maintain separate standards. China's GB 21455-2019 unified both types; others still differentiate.

4. **Refrigerant allowances**: The EU allows a 10% SEER derating for units using low-GWP refrigerants (<150 GWP), recognizing the thermodynamic penalties of some climate-friendly alternatives.

5. **Conversion precision**: All cross-metric conversions are approximate. The factors used represent central estimates from published literature. Actual performance varies by unit design, installation, and operating conditions. Dashboard visualizations include a methodology note to this effect.

6. **Regional standards**: SADC, EAC, ECOWAS, and ASEAN regional standards are at various stages of adoption. Individual member states may have different implementation timelines.

---

## 6. Data Sources (Ranked by Authoritativeness)

### Tier 1: Primary Regulatory Sources
- IEA Policies Database (https://www.iea.org/policies)
- CLASP Policy Resource Center (https://cprc-clasp.ngo/policies)
- National government gazettes and regulatory bodies
- ISO Standards (ISO 16358-1:2013, ISO 5151)

### Tier 2: Technical Analysis Sources
- UNEP United for Efficiency / U4E (https://united4efficiency.org)
- Lawrence Berkeley National Laboratory (https://eta-publications.lbl.gov)
- CLASP Technical Reports (https://www.clasp.ngo)
- IEA-4E PEET (https://www.iea-4e.org/peet)
- ASEAN Centre for Energy (https://aseanenergy.org)

### Tier 3: Industry and Market Sources
- AHRI (Air-Conditioning, Heating, and Refrigeration Institute)
- JRAIA (Japan Refrigeration and Air Conditioning Industry Association)
- Eurovent
- TUV Rheinland regulatory updates

### Tier 4: Secondary/Synthesized Sources
- Academic literature (peer-reviewed conversion studies)
- Market research reports
- Industry news and analysis

---

## 7. Key References

1. ISO 16358-1:2013 - Air-cooled air conditioners and air-to-air heat pumps - Testing and calculating methods for seasonal performance factors
2. CLASP (2022). "World's Best MEPS: Tracking Leaders in Appliance Energy Efficiency Standards"
3. LBNL (2021). "Harmonizing Energy-Efficiency Standards for Room Air Conditioners in ASEAN"
4. U4E (2021). "Model Regulation Guidelines for Energy-Efficient and Climate-Friendly Air Conditioners"
5. IEA-4E PEET (2022). "Status of Room Air Conditioner Regulations"
6. AFREC RAC Handbook Phase 1 - MEPS implementation guide for Africa
7. Global Cooling Watch 2025 Assessment - UNEP Cool Coalition

---

*Document version: 1.0 | Last updated: 2026-02-08*

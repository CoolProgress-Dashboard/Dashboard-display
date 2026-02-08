// appliance-timeseries-data.ts - Multi-appliance stock, energy, and emissions timeseries
// =============================================================================
// DATA SOURCES:
//   CLASP (2005-2050): clasp_energy_consumption Supabase table - global aggregation
//   HEAT (2016-2050): global_model_subcool Supabase table - BAU/KIP scenarios
//   IEA Future of Cooling (2018): Historical AC stock 1990-2015
//   CCC Global Cooling Watch (2023): AC stock benchmarks
//   LBNL/OSTI: Fan energy efficiency studies
//   IEA Space Cooling tracker: Energy demand validation
//
// METHODOLOGY:
//   Stock 2005-2050: CLASP appliance_units_in_use, global sum per appliance per year
//   Stock 1990-2000: IEA/CCC chart readings (AC), back-extrapolation from CLASP 2005 (DomRef, Fans)
//   Energy 2005-2050: CLASP bau_final_energy_twh, global sum per appliance per year
//   Energy 1990-2000: Back-calculated from CLASP 2005 using IEA growth rates
//   Emissions 2005-2050: HEAT model (direct: BAU+KIP) + CLASP (indirect: BAU+GB) + IEA NZE grid
//   Emissions 1990-2000: IPCC SROC (CFC/HCFC direct), IEA electricity benchmarks (indirect)
//   Validation: IEA/OWID 2022 AC total ~1,750 Mt CO2e; LBNL 25 Mt fan savings benchmark
//
// NOTE ON AC STOCK DISCREPANCY:
//   IEA/CCC shows ~575M AC in 1990, ~2B in 2020, ~6.5B in 2050 (all AC types)
//   CLASP shows 416M in 2005, 1,155M in 2020, 3,197M in 2050 (specific types)
//   Dashboard uses IEA/CCC for pre-2005 and headline narrative, CLASP for 2005+ detail
//   AC stock values below use IEA/CCC series for consistency with existing dashboard
// =============================================================================

export type ApplianceType = 'AC' | 'DomRef' | 'Fans';
export type ScenarioType = 'BAU' | 'DECARB';

export interface ApplianceTimeseriesPoint {
  year: number;
  appliance: ApplianceType;
  stockMillions: number;
  energyTwh: number;
  indirectEmissionMt: number;
  directEmissionMt: number;
  totalEmissionMt: number;
  scenario: ScenarioType;
  isProjected: boolean;
  source: string;
  sourceUrl: string;
}

export interface ApplianceMilestone {
  year: number;
  label: string;
  description: string;
  appliance?: ApplianceType | 'All';
}

// ---- BAU Scenario Data ----
// Stock: IEA/CCC for AC (consistent with existing dashboard), CLASP for DomRef+Fans
// Energy: CLASP for 2005+, IEA-benchmarked estimates for 1990-2000
// Emissions: HEAT model (direct) + CLASP/IEA (indirect), IPCC SROC for pre-2005

const acBAU: ApplianceTimeseriesPoint[] = [
  // AC stock uses IEA/CCC series (broader scope, consistent with existing chart)
  // Energy uses CLASP 2005+ with IEA back-calculation for 1990-2000
  // Emissions: HEAT model (direct) + CLASP/IEA (indirect), validated against OWID/IEA benchmarks
  { year: 1990, appliance: 'AC', stockMillions: 573, energyTwh: 230, indirectEmissionMt: 200, directEmissionMt: 180, totalEmissionMt: 380, scenario: 'BAU', isProjected: false, source: 'IEA/CCC + IPCC SROC', sourceUrl: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 1995, appliance: 'AC', stockMillions: 700, energyTwh: 290, indirectEmissionMt: 280, directEmissionMt: 200, totalEmissionMt: 480, scenario: 'BAU', isProjected: false, source: 'IEA/CCC + IPCC SROC', sourceUrl: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2000, appliance: 'AC', stockMillions: 850, energyTwh: 350, indirectEmissionMt: 350, directEmissionMt: 220, totalEmissionMt: 570, scenario: 'BAU', isProjected: false, source: 'IEA/CCC + IPCC SROC', sourceUrl: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2005, appliance: 'AC', stockMillions: 1050, energyTwh: 429, indirectEmissionMt: 446, directEmissionMt: 240, totalEmissionMt: 686, scenario: 'BAU', isProjected: false, source: 'IEA stock / CLASP energy+indirect / Velders direct', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2010, appliance: 'AC', stockMillions: 1200, energyTwh: 645, indirectEmissionMt: 617, directEmissionMt: 270, totalEmissionMt: 887, scenario: 'BAU', isProjected: false, source: 'IEA stock / CLASP energy+indirect / Purohit direct', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2015, appliance: 'AC', stockMillions: 1500, energyTwh: 990, indirectEmissionMt: 880, directEmissionMt: 290, totalEmissionMt: 1170, scenario: 'BAU', isProjected: false, source: 'IEA stock / CLASP energy+indirect / HEAT direct', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2020, appliance: 'AC', stockMillions: 2000, energyTwh: 1422, indirectEmissionMt: 972, directEmissionMt: 314, totalEmissionMt: 1286, scenario: 'BAU', isProjected: false, source: 'IEA stock / HEAT model BAU (indirect 972 + direct 314)', sourceUrl: 'https://ourworldindata.org/air-conditioning-causes-around-greenhouse-gas-emissions-will-change-future' },
  { year: 2025, appliance: 'AC', stockMillions: 3100, energyTwh: 1972, indirectEmissionMt: 1338, directEmissionMt: 403, totalEmissionMt: 1741, scenario: 'BAU', isProjected: false, source: 'CCC stock / CLASP energy / HEAT model BAU', sourceUrl: 'https://www.cleancoolingcollaborative.org/the-challenge/' },
  { year: 2030, appliance: 'AC', stockMillions: 4000, energyTwh: 2629, indirectEmissionMt: 2156, directEmissionMt: 538, totalEmissionMt: 2694, scenario: 'BAU', isProjected: true, source: 'IEA stock / CLASP energy / HEAT model BAU', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2035, appliance: 'AC', stockMillions: 4500, energyTwh: 3339, indirectEmissionMt: 3299, directEmissionMt: 664, totalEmissionMt: 3963, scenario: 'BAU', isProjected: true, source: 'IEA stock / CLASP energy / HEAT model BAU', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2040, appliance: 'AC', stockMillions: 5000, energyTwh: 4402, indirectEmissionMt: 3686, directEmissionMt: 634, totalEmissionMt: 4320, scenario: 'BAU', isProjected: true, source: 'IEA stock / CLASP energy / HEAT model BAU', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2045, appliance: 'AC', stockMillions: 5800, energyTwh: 5188, indirectEmissionMt: 4045, directEmissionMt: 551, totalEmissionMt: 4596, scenario: 'BAU', isProjected: true, source: 'IEA stock / CLASP energy / HEAT model BAU', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2050, appliance: 'AC', stockMillions: 6542, energyTwh: 6095, indirectEmissionMt: 4359, directEmissionMt: 581, totalEmissionMt: 4940, scenario: 'BAU', isProjected: true, source: 'CCC stock / CLASP energy / HEAT model BAU', sourceUrl: 'https://www.clasp.ngo/' },
];

const domRefBAU: ApplianceTimeseriesPoint[] = [
  // DomRef stock+energy from CLASP (2005+) with IEA-benchmarked estimates (1990-2000)
  // Emissions: HEAT model (direct+indirect) for 2016+, IPCC/IEA for earlier years
  { year: 1990, appliance: 'DomRef', stockMillions: 650, energyTwh: 360, indirectEmissionMt: 250, directEmissionMt: 25, totalEmissionMt: 275, scenario: 'BAU', isProjected: false, source: 'IEA/LBNL + IPCC SROC', sourceUrl: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 1995, appliance: 'DomRef', stockMillions: 800, energyTwh: 380, indirectEmissionMt: 280, directEmissionMt: 20, totalEmissionMt: 300, scenario: 'BAU', isProjected: false, source: 'IEA/LBNL + IPCC SROC', sourceUrl: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2000, appliance: 'DomRef', stockMillions: 950, energyTwh: 400, indirectEmissionMt: 310, directEmissionMt: 18, totalEmissionMt: 328, scenario: 'BAU', isProjected: false, source: 'IEA/LBNL + IPCC SROC', sourceUrl: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2005, appliance: 'DomRef', stockMillions: 1065, energyTwh: 437, indirectEmissionMt: 330, directEmissionMt: 16, totalEmissionMt: 346, scenario: 'BAU', isProjected: false, source: 'CLASP + IPCC/IEA', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2010, appliance: 'DomRef', stockMillions: 1403, energyTwh: 561, indirectEmissionMt: 350, directEmissionMt: 15, totalEmissionMt: 365, scenario: 'BAU', isProjected: false, source: 'CLASP + IEA/HEAT', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2015, appliance: 'DomRef', stockMillions: 1855, energyTwh: 718, indirectEmissionMt: 365, directEmissionMt: 15, totalEmissionMt: 380, scenario: 'BAU', isProjected: false, source: 'CLASP + HEAT model', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2020, appliance: 'DomRef', stockMillions: 2284, energyTwh: 868, indirectEmissionMt: 381, directEmissionMt: 17, totalEmissionMt: 397, scenario: 'BAU', isProjected: false, source: 'CLASP + HEAT Global Model BAU', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2025, appliance: 'DomRef', stockMillions: 2684, energyTwh: 1012, indirectEmissionMt: 421, directEmissionMt: 19, totalEmissionMt: 440, scenario: 'BAU', isProjected: false, source: 'CLASP + HEAT model BAU', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2030, appliance: 'DomRef', stockMillions: 3059, energyTwh: 1151, indirectEmissionMt: 477, directEmissionMt: 23, totalEmissionMt: 500, scenario: 'BAU', isProjected: true, source: 'CLASP + HEAT model BAU', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2035, appliance: 'DomRef', stockMillions: 3287, energyTwh: 1236, indirectEmissionMt: 501, directEmissionMt: 23, totalEmissionMt: 524, scenario: 'BAU', isProjected: true, source: 'CLASP + HEAT model BAU', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2040, appliance: 'DomRef', stockMillions: 3470, energyTwh: 1305, indirectEmissionMt: 530, directEmissionMt: 21, totalEmissionMt: 551, scenario: 'BAU', isProjected: true, source: 'CLASP + HEAT model BAU', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2045, appliance: 'DomRef', stockMillions: 3667, energyTwh: 1379, indirectEmissionMt: 578, directEmissionMt: 21, totalEmissionMt: 599, scenario: 'BAU', isProjected: true, source: 'CLASP + HEAT model BAU', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2050, appliance: 'DomRef', stockMillions: 3876, energyTwh: 1458, indirectEmissionMt: 629, directEmissionMt: 20, totalEmissionMt: 649, scenario: 'BAU', isProjected: true, source: 'CLASP + HEAT model BAU', sourceUrl: 'https://www.clasp.ngo/' },
];

const fansBAU: ApplianceTimeseriesPoint[] = [
  // Fans stock+energy from CLASP (2005+) with LBNL/IEA estimates (1990-2000)
  // Fans have ZERO direct emissions (no refrigerant)
  // Emissions: LBNL/DOE estimates for indirect, validated against IEA cooling electricity benchmarks
  { year: 1990, appliance: 'Fans', stockMillions: 1600, energyTwh: 150, indirectEmissionMt: 80, directEmissionMt: 0, totalEmissionMt: 80, scenario: 'BAU', isProjected: false, source: 'LBNL/DOE estimate', sourceUrl: 'https://www.osti.gov/biblio/1172246' },
  { year: 1995, appliance: 'Fans', stockMillions: 1900, energyTwh: 175, indirectEmissionMt: 95, directEmissionMt: 0, totalEmissionMt: 95, scenario: 'BAU', isProjected: false, source: 'LBNL/DOE estimate', sourceUrl: 'https://www.osti.gov/biblio/1172246' },
  { year: 2000, appliance: 'Fans', stockMillions: 2150, energyTwh: 200, indirectEmissionMt: 110, directEmissionMt: 0, totalEmissionMt: 110, scenario: 'BAU', isProjected: false, source: 'LBNL/DOE estimate', sourceUrl: 'https://www.osti.gov/biblio/1172246' },
  { year: 2005, appliance: 'Fans', stockMillions: 2434, energyTwh: 232, indirectEmissionMt: 130, directEmissionMt: 0, totalEmissionMt: 130, scenario: 'BAU', isProjected: false, source: 'CLASP + LBNL/DOE', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2010, appliance: 'Fans', stockMillions: 2720, energyTwh: 261, indirectEmissionMt: 150, directEmissionMt: 0, totalEmissionMt: 150, scenario: 'BAU', isProjected: false, source: 'CLASP + LBNL/DOE', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2015, appliance: 'Fans', stockMillions: 3044, energyTwh: 298, indirectEmissionMt: 175, directEmissionMt: 0, totalEmissionMt: 175, scenario: 'BAU', isProjected: false, source: 'CLASP + IEA/LBNL', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2020, appliance: 'Fans', stockMillions: 3415, energyTwh: 344, indirectEmissionMt: 190, directEmissionMt: 0, totalEmissionMt: 190, scenario: 'BAU', isProjected: false, source: 'CLASP + IEA/LBNL', sourceUrl: 'https://www.iea.org/energy-system/buildings/space-cooling' },
  { year: 2025, appliance: 'Fans', stockMillions: 3819, energyTwh: 396, indirectEmissionMt: 220, directEmissionMt: 0, totalEmissionMt: 220, scenario: 'BAU', isProjected: false, source: 'CLASP + IEA/LBNL projection', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2030, appliance: 'Fans', stockMillions: 4146, energyTwh: 439, indirectEmissionMt: 260, directEmissionMt: 0, totalEmissionMt: 260, scenario: 'BAU', isProjected: true, source: 'CLASP + IEA/LBNL projection', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2035, appliance: 'Fans', stockMillions: 4378, energyTwh: 469, indirectEmissionMt: 300, directEmissionMt: 0, totalEmissionMt: 300, scenario: 'BAU', isProjected: true, source: 'CLASP + IEA/LBNL projection', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2040, appliance: 'Fans', stockMillions: 4545, energyTwh: 489, indirectEmissionMt: 340, directEmissionMt: 0, totalEmissionMt: 340, scenario: 'BAU', isProjected: true, source: 'CLASP + IEA/LBNL projection', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2045, appliance: 'Fans', stockMillions: 4708, energyTwh: 509, indirectEmissionMt: 380, directEmissionMt: 0, totalEmissionMt: 380, scenario: 'BAU', isProjected: true, source: 'CLASP + IEA/LBNL projection', sourceUrl: 'https://www.clasp.ngo/' },
  { year: 2050, appliance: 'Fans', stockMillions: 4871, energyTwh: 529, indirectEmissionMt: 420, directEmissionMt: 0, totalEmissionMt: 420, scenario: 'BAU', isProjected: true, source: 'CLASP + IEA/LBNL projection', sourceUrl: 'https://www.clasp.ngo/' },
];

// ---- DECARB Scenario Data ----
// Sources: CLASP GB for energy efficiency, IEA STEPS for grid decarbonization, HEAT MIT for HFC phase-down
// THREE-LAYER DECARB METHODOLOGY:
//   1. Direct emissions: HEAT MIT scenario (Kigali refrigerant phase-down)
//   2. Energy efficiency: CLASP GB/BAU ratio (appliance MEPS improvement)
//   3. Grid decarbonization: IEA STEPS trajectory (renewables 33%→67% by 2050)
//
// DECARB_indirect = BAU_indirect × CLASP_efficiency_ratio × IEA_grid_decarb_ratio
//
// CRITICAL: Neither HEAT nor CLASP model grid decarbonization.
//   HEAT uses near-static grid EFs (India: 976→948, China: 857→896 gCO2/kWh, 2020→2050)
//   CLASP also uses static grid factors (efficiency only)
//   IEA STEPS: renewables 33% (2024) → >50% (2035) → 67% (2050)
//   IEA Electricity 2025: global grid 445 gCO2/kWh (2024) → 400 (2027), -3.6%/yr
//
// IEA STEPS Grid Decarb Ratios (vs frozen/BAU assumption):
//   2025: 0.95, 2030: 0.80, 2035: 0.65, 2040: 0.55, 2045: 0.47, 2050: 0.40

// Emissions DECARB lookup — COMBINED three-layer approach:
//   Direct: HEAT MIT scenario (global_model_subcool, scenario='MIT')
//   Indirect: HEAT BAU indirect × CLASP GB/BAU ratio × IEA STEPS grid ratio
// Pre-2025: same as BAU (scenarios diverge from 2025)
const acDecarbEmissions: Record<number, { indirect: number; direct: number }> = {
  1990: { indirect: 200, direct: 180 }, 1995: { indirect: 280, direct: 200 },
  2000: { indirect: 350, direct: 220 }, 2005: { indirect: 446, direct: 240 },
  2010: { indirect: 617, direct: 270 }, 2015: { indirect: 880, direct: 290 },
  2020: { indirect: 972, direct: 314 },
  // 2025: 1338 × 1.00 × 0.95 = 1271
  2025: { indirect: 1271, direct: 323 },
  // 2030: 2156 × 0.835 × 0.80 = 1440
  2030: { indirect: 1440, direct: 341 },
  // 2035: 3299 × 0.765 × 0.65 = 1640
  2035: { indirect: 1640, direct: 368 },
  // 2040: 3686 × 0.743 × 0.55 = 1507
  2040: { indirect: 1507, direct: 60 },
  // 2045: 4045 × 0.737 × 0.47 = 1401
  2045: { indirect: 1401, direct: 43 },
  // 2050: 4359 × 0.735 × 0.40 = 1282
  2050: { indirect: 1282, direct: 30 },
};

const domRefDecarbEmissions: Record<number, { indirect: number; direct: number }> = {
  1990: { indirect: 250, direct: 25 }, 1995: { indirect: 280, direct: 20 },
  2000: { indirect: 310, direct: 18 }, 2005: { indirect: 330, direct: 16 },
  2010: { indirect: 350, direct: 15 }, 2015: { indirect: 365, direct: 15 },
  2020: { indirect: 381, direct: 17 },
  // 2025: 421 × 1.00 × 0.95 = 400
  2025: { indirect: 400, direct: 19 },
  // 2030: 477 × 0.911 × 0.80 = 347
  2030: { indirect: 347, direct: 21 },
  // 2035: 501 × 0.842 × 0.65 = 274
  2035: { indirect: 274, direct: 20 },
  // 2040: 530 × 0.789 × 0.55 = 230
  2040: { indirect: 230, direct: 17 },
  // 2045: 578 × 0.749 × 0.47 = 203
  2045: { indirect: 203, direct: 2 },
  // 2050: 629 × 0.723 × 0.40 = 182
  2050: { indirect: 182, direct: 1 },
};

const fansDecarbEmissions: Record<number, { indirect: number }> = {
  1990: { indirect: 80 }, 1995: { indirect: 95 }, 2000: { indirect: 110 },
  2005: { indirect: 103 }, 2010: { indirect: 112 }, 2015: { indirect: 126 },
  2020: { indirect: 147 },
  // CLASP GB indirect × IEA grid ratio
  2025: { indirect: 164 }, // 173 × 0.95
  2030: { indirect: 134 }, // 167 × 0.80
  2035: { indirect: 107 }, // 164 × 0.65
  2040: { indirect: 87 },  // 158 × 0.55
  2045: { indirect: 72 },  // 153 × 0.47
  2050: { indirect: 59 },  // 147 × 0.40
};

// CLASP Global Best energy reduction factors (GB/BAU ratio from database)
// Computed from clasp_energy_consumption: gb_final_energy_twh / bau_final_energy_twh
const energyDecarbFactor: Record<number, { ac: number; domRef: number; fans: number }> = {
  1990: { ac: 1, domRef: 1, fans: 1 }, 1995: { ac: 1, domRef: 1, fans: 1 },
  2000: { ac: 1, domRef: 1, fans: 1 }, 2005: { ac: 1, domRef: 1, fans: 1 },
  2010: { ac: 1, domRef: 1, fans: 1 }, 2015: { ac: 1, domRef: 1, fans: 1 },
  2020: { ac: 1, domRef: 1, fans: 1 }, 2025: { ac: 1, domRef: 1, fans: 1 },
  2030: { ac: 0.845, domRef: 0.909, fans: 0.893 },
  2035: { ac: 0.774, domRef: 0.838, fans: 0.842 },
  2040: { ac: 0.749, domRef: 0.782, fans: 0.819 },
  2045: { ac: 0.742, domRef: 0.740, fans: 0.811 },
  2050: { ac: 0.738, domRef: 0.711, fans: 0.809 },
};

const acDECARB: ApplianceTimeseriesPoint[] = acBAU.map(d => {
  const em = acDecarbEmissions[d.year];
  const ef = energyDecarbFactor[d.year];
  return {
    ...d,
    scenario: 'DECARB' as ScenarioType,
    energyTwh: Math.round(d.energyTwh * ef.ac),
    indirectEmissionMt: em.indirect,
    directEmissionMt: em.direct,
    totalEmissionMt: em.indirect + em.direct,
  };
});

const domRefDECARB: ApplianceTimeseriesPoint[] = domRefBAU.map(d => {
  const em = domRefDecarbEmissions[d.year];
  const ef = energyDecarbFactor[d.year];
  return {
    ...d,
    scenario: 'DECARB' as ScenarioType,
    energyTwh: Math.round(d.energyTwh * ef.domRef),
    indirectEmissionMt: em.indirect,
    directEmissionMt: em.direct,
    totalEmissionMt: em.indirect + em.direct,
  };
});

const fansDECARB: ApplianceTimeseriesPoint[] = fansBAU.map(d => {
  const em = fansDecarbEmissions[d.year];
  const ef = energyDecarbFactor[d.year];
  return {
    ...d,
    scenario: 'DECARB' as ScenarioType,
    energyTwh: Math.round(d.energyTwh * ef.fans),
    indirectEmissionMt: em.indirect,
    directEmissionMt: 0,
    totalEmissionMt: em.indirect,
  };
});

// Combined exports
export const applianceTimeseriesData: ApplianceTimeseriesPoint[] = [
  ...acBAU, ...domRefBAU, ...fansBAU,
  ...acDECARB, ...domRefDECARB, ...fansDECARB,
];

export const applianceMilestones: ApplianceMilestone[] = [
  { year: 1987, label: 'Montreal Protocol', description: 'International treaty to phase out ozone-depleting substances (CFCs, HCFCs) used as refrigerants.', appliance: 'All' },
  { year: 2016, label: 'Kigali Amendment', description: 'Amendment to phase down HFCs by 80-85% by 2047. Could avoid 0.5\u00B0C warming by 2100.', appliance: 'All' },
  { year: 2018, label: 'IEA Future of Cooling', description: 'Landmark IEA report projecting global AC stock to reach 5.6B by 2050.', appliance: 'AC' },
  { year: 2023, label: 'COP28 Global Cooling Pledge', description: '66 nations committed to reducing cooling emissions 68% by 2050 and raising AC efficiency 50%.', appliance: 'All' },
  { year: 2025, label: '3 Billion ACs', description: 'Global AC stock surpassed 3 billion units. CCC reports 3,099 million units installed worldwide.', appliance: 'AC' },
];

// Appliance display metadata
export const APPLIANCE_META: Record<ApplianceType, { label: string; icon: string; color: string; colorRgba: string }> = {
  AC: { label: 'Air Conditioners', icon: 'fa-solid fa-snowflake', color: '#3D6B6B', colorRgba: 'rgba(61, 107, 107,' },
  DomRef: { label: 'Refrigerators', icon: 'fa-solid fa-temperature-low', color: '#2196F3', colorRgba: 'rgba(33, 150, 243,' },
  Fans: { label: 'Fans', icon: 'fa-solid fa-fan', color: '#FF9800', colorRgba: 'rgba(255, 152, 0,' },
};

export type MetricKey = 'stock' | 'energy' | 'emissions';

export const METRIC_META: Record<MetricKey, { label: string; unit: string; yAxisLabel: string; field: keyof ApplianceTimeseriesPoint }> = {
  stock: { label: 'Stock (Units)', unit: 'M', yAxisLabel: 'Millions of units', field: 'stockMillions' },
  energy: { label: 'Energy (TWh)', unit: 'TWh', yAxisLabel: 'TWh', field: 'energyTwh' },
  emissions: { label: 'Emissions (Mt CO\u2082e)', unit: 'Mt', yAxisLabel: 'Mt CO\u2082e', field: 'totalEmissionMt' },
};

// Summary for subtitle - updated with real research data
export const applianceSummaries: Record<ApplianceType, Record<MetricKey, { today: string; by2050: string; highlight: string; highlightIcon: string }>> = {
  AC: {
    stock: { today: '3.1 billion', by2050: '6.5 billion', highlight: '10 ACs sold every second', highlightIcon: 'fa-solid fa-arrow-trend-up' },
    energy: { today: '1,972 TWh', by2050: '6,095 TWh', highlight: '3.1x growth in energy demand', highlightIcon: 'fa-solid fa-bolt' },
    emissions: { today: '1,741 Mt', by2050: '4,940 Mt', highlight: 'Largest cooling emitter', highlightIcon: 'fa-solid fa-smog' },
  },
  DomRef: {
    stock: { today: '2.7 billion', by2050: '3.9 billion', highlight: 'Most widespread cooling appliance', highlightIcon: 'fa-solid fa-house' },
    energy: { today: '1,012 TWh', by2050: '1,458 TWh', highlight: '65% energy savings possible', highlightIcon: 'fa-solid fa-leaf' },
    emissions: { today: '440 Mt', by2050: '649 Mt', highlight: 'Refrigerant transition key', highlightIcon: 'fa-solid fa-droplet' },
  },
  Fans: {
    stock: { today: '3.8 billion', by2050: '4.9 billion', highlight: 'Most units globally', highlightIcon: 'fa-solid fa-arrow-trend-up' },
    energy: { today: '396 TWh', by2050: '529 TWh', highlight: 'No direct emissions (no refrigerant)', highlightIcon: 'fa-solid fa-check-circle' },
    emissions: { today: '220 Mt', by2050: '420 Mt', highlight: 'Indirect emissions only', highlightIcon: 'fa-solid fa-plug' },
  },
};

// Helper to filter data
export function getApplianceData(
  appliance: ApplianceType | 'All',
  scenario: ScenarioType = 'BAU'
): ApplianceTimeseriesPoint[] {
  return applianceTimeseriesData.filter(d => {
    const matchAppliance = appliance === 'All' || d.appliance === appliance;
    const matchScenario = d.scenario === scenario;
    return matchAppliance && matchScenario;
  });
}

export function getYears(): number[] {
  return [...new Set(applianceTimeseriesData.map(d => d.year))].sort((a, b) => a - b);
}

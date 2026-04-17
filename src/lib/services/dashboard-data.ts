import type {
  AccessFilters,
  AccessForecastRecord,
  AccessRecord,
  AcGrowthRecord,
  AcInverterRecord,
  ApplianceTimeseriesRecord,
  ClaspEnergyRecord,
  CoolingMilestoneRecord,
  CountrySpotlightRecord,
  DashboardData,
  EmissionsFilters,
  EmissionsRecord,
  MepsLevelRecord,
  MepsTimelineRecord,
  NcapRecord,
  NdcFilters,
  NdcTrackerRecord,
  PeakLoadRecord,
  RefrigerantRecord,
  RegionRecord,
  SubcoolRecord
} from './dashboard-types';

const fetchTable = async <T>(
  url: string,
  key: string,
  table: string,
  columns = '*',
  filter = '',
  limit = 1000
): Promise<T[]> => {
  const allRecords: T[] = [];
  let offset = 0;
  const batchSize = 1000;

  while (true) {
    const endpoint = `${url}/rest/v1/${table}?select=${columns}${filter}&limit=${batchSize}&offset=${offset}`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Failed to fetch ${table}: ${response.status} ${body}`);
    }

    const batch: T[] = await response.json();
    allRecords.push(...batch);

    // Stop if we got fewer records than the batch size (no more pages)
    // or if we've reached the requested limit
    if (batch.length < batchSize || allRecords.length >= limit) {
      break;
    }
    offset += batchSize;
  }

  return allRecords;
};

export const createDefaultData = (): DashboardData => ({
  countries: [],
  pledge: [],
  kigali: [],
  meps: [],
  access: [],
  accessForecast: [],
  ndc: [],
  emissions: [],
  ndcTracker: [],
  ncap: [],
  claspEnergy: [],
  subcool: [],
  regions: [],
  refrigerants: [],
  acInverterShare: [],
  acGrowthData: [],
  coolingMilestones: [],
  applianceTimeseries: [],
  peakLoadData: [],
  countrySpotlights: [],
  mepsTimeline: [],
  mepsLevels: []
});

const safeFetch = async <T>(
  url: string,
  key: string,
  table: string,
  columns: string,
  filter = '',
  limit = 1000
): Promise<T[]> => {
  try {
    return await fetchTable<T>(url, key, table, columns, filter, limit);
  } catch (err) {
    console.error(`[Dashboard] Failed to load "${table}":`, err);
    return [];
  }
};

// Loads refrigerant bank data for the 4 chart years (small table — 48 rows).
export const loadRefrigerantBankData = async (
  url: string,
  key: string
): Promise<import('./dashboard-types').RefrigerantBankRecord[]> => {
  return safeFetch<import('./dashboard-types').RefrigerantBankRecord>(
    url, key, 'refrigerant_bank_data',
    'id,year,refrigerant,region,bank_tonnes',
    'year=in.(2015,2020,2025,2030)'
  );
};

// Loads only the columns needed for the Kigali direct-emissions chart.
// Fetches scenario_name + year + direct_emission_mt from global_model_subcool so
// the caller can aggregate globally without transferring all columns.
export const loadSubcoolGlobalSummary = async (
  url: string,
  key: string
): Promise<{ scenario_name: string; year: number; direct_emission_mt: number }[]> => {
  return safeFetch<{ scenario_name: string; year: number; direct_emission_mt: number }>(
    url, key, 'global_model_subcool', 'scenario_name,year,direct_emission_mt', '', 100000
  );
};

// Lightweight fetch for ApplianceGrowthChart aggregation only.
// Fetches far fewer columns than loadEmissionsHeavyData and filters HEAT to the
// two subsectors and two scenarios the chart actually needs, so it completes
// well before the full heavy-data load that powers the emissions map.
export const loadApplianceChartData = async (
  url: string,
  key: string
): Promise<{ clasp: ClaspEnergyRecord[]; subcool: SubcoolRecord[] }> => {
  const [clasp, subcool] = await Promise.all([
    // CLASP: 7 columns instead of 22 — stock, BAU energy/CO2, GB energy/CO2
    safeFetch<ClaspEnergyRecord>(
      url, key, 'clasp_energy_consumption',
      'appliance,year,appliance_units_in_use,bau_final_energy_twh,bau_co2_mt,gb_final_energy_twh,gb_co2_mt',
      '', 50000
    ),
    // HEAT: 4 columns instead of 11, filtered to the only 2 subsectors and
    // 2 scenarios used by buildApplianceTimeseries — dramatically smaller payload
    safeFetch<SubcoolRecord>(
      url, key, 'global_model_subcool',
      'subsector,year,scenario_name,direct_emission_mt',
      '&scenario_name=in.(BAU,KIP_PLUS)', 100000
    ),
  ]);
  return { clasp, subcool };
};

// Loads clasp_energy_consumption + global_model_subcool separately.
// These tables have 27k and 34k rows respectively — at Supabase's 1000-row cap
// that means 62 sequential HTTP requests (~7–30 s). Calling this lazily inside
// EmissionsPillar keeps the layout load fast.
export const loadEmissionsHeavyData = async (
  url: string,
  key: string
): Promise<{ claspEnergy: ClaspEnergyRecord[]; subcool: SubcoolRecord[] }> => {
  const [claspEnergy, subcool] = await Promise.all([
    safeFetch<ClaspEnergyRecord>(
      url,
      key,
      'clasp_energy_consumption',
      'id,country_code,country_name,year,appliance,bau_final_energy_twh,bau_co2_mt,gb_final_energy_twh,gb_co2_mt,gb_annual_co2_red_mt,gb_cumul_co2_red_mt,nzh_final_energy_twh,nzh_co2_mt,nzh_annual_co2_red_mt,nzh_cumul_co2_red_mt,bat_final_energy_twh,bat_co2_mt,bat_annual_co2_red_mt,bat_cumul_co2_red_mt,bat_co2_nzg_mt,bat_cumul_co2_red_nzg_mt,appliance_units_in_use,appliance_ownership_rate',
      '',
      50000
    ),
    safeFetch<SubcoolRecord>(
      url,
      key,
      'global_model_subcool',
      'id,scenario_id,scenario_name,country_code,country_name,subsector_id,subsector,year,indirect_emission_mt,direct_emission_mt,stock,unit_sales,ec_gwh',
      '',
      100000
    )
  ]);
  return { claspEnergy, subcool };
};

export const loadDashboardData = async (
  url: string,
  key: string
): Promise<DashboardData> => {
  // clasp_energy_consumption and global_model_subcool are intentionally excluded —
  // they require 60+ sequential requests. EmissionsPillar loads them lazily.
  const [countries, pledge, kigali, meps, access, accessForecast, emissions, ndcTracker, ncap, regions, refrigerants, acInverterShare, acGrowthData, coolingMilestones, applianceTimeseries, peakLoadData, countrySpotlights] =
    await Promise.all([
      safeFetch(url, key, 'countries', 'country_code,country_name,region'),
      safeFetch(url, key, 'global_cooling_pledge', 'country_code,country_name,signatory'),
      safeFetch(
        url,
        key,
        'kip',
        'country_code,country_name,kigali_party,montreal_protocol_party,group_type'
      ),
      safeFetch(
        url,
        key,
        'meps',
        'country_code,country_name,policy_name,equipment_type,requirement_type,policy_instrument,status,year_adopted,year_revised,region'
      ),
      safeFetch<AccessRecord>(
        url,
        key,
        'access_to_cooling_seeforall',
        'id,country_code,country_name,region,impact_category,population_category,impact_level,gender_type,year,population_without_cooling',
        '',
        5000
      ),
      safeFetch<AccessForecastRecord>(
        url,
        key,
        'access_to_cooling_forecast',
        'id,country_code,country_name,region,impact_category,population_category,impact_level,gender_type,year,population_without_cooling',
        '',
        10000
      ),
      safeFetch(
        url,
        key,
        'v_emissions_summary',
        'country_code,country_name,region,year,scenario_code,appliance_category,total_emissions,direct_emissions,indirect_emissions',
        '',
        10000
      ),
      safeFetch(
        url,
        key,
        'ndc_tracker_clasp',
        'country_code,country_name,continent,subregion,annex_status,ndc_type,category,mention_status,mention_value',
        '',
        15000
      ),
      safeFetch<NcapRecord>(
        url,
        key,
        'ncap',
        'id,country_code,country_name,year,long_term_goal,sectoral_targets,energy_consumed_twh,ghg_emissions_mtco2e,cooling_access_vulnerability,energy_efficiency_demand_reduction,refrigerant_management,remarks,policy_available_pdf'
      ),
      safeFetch<RegionRecord>(
        url,
        key,
        'regions',
        'id,country_code,region,subregion,continent'
      ),
      safeFetch<RefrigerantRecord>(
        url,
        key,
        'refrigerants',
        'id,refrigerant_code,gwp_100_ar6,gwp_source,ref_type,natural_refrigerant'
      ),
      safeFetch<AcInverterRecord>(
        url,
        key,
        'ac_inverter_share',
        'id,region,country_code,country_name,year_label,year_start,year_end,inverter_pct,non_inverter_pct,confidence,is_estimate,scope_notes,source_name,source_url'
      ),
      safeFetch<AcGrowthRecord>(url, key, 'ac_growth_data', 'id,year,stock_millions,is_projected,source'),
      safeFetch<CoolingMilestoneRecord>(url, key, 'cooling_milestones', 'id,year,label,description,appliance_type'),
      safeFetch<ApplianceTimeseriesRecord>(
        url,
        key,
        'appliance_timeseries',
        'id,year,appliance_type,scenario,stock_millions,energy_twh,indirect_emission_mt,direct_emission_mt,total_emission_mt,is_projected,source,source_url'
      ),
      safeFetch<PeakLoadRecord>(
        url,
        key,
        'peak_load_data',
        'id,country,country_code,baseline_year,baseline_percent,projected_year,projected_percent,source,is_global_avg'
      ),
      safeFetch<CountrySpotlightRecord>(
        url,
        key,
        'country_spotlights',
        'id,spotlight_id,name,region,flag_emoji,narrative,meps_status,dominant_refrigerant,key_challenge,source,stats'
      )
    ]);
  // meps_level_timeline and meps_levels tables do not yet exist in Supabase.
  // MepsLevelChart falls back to the bundled JSON files (src/lib/data/meps_timeline.json
  // and meps_levels.json) when these arrays are empty.
  const mepsTimeline: MepsTimelineRecord[] = [];
  const mepsLevels: MepsLevelRecord[] = [];

  return {
    countries,
    pledge,
    kigali,
    meps,
    access,
    accessForecast,
    emissions,
    ndcTracker,
    ncap,
    claspEnergy: [],  // loaded lazily by EmissionsPillar
    subcool: [],      // loaded lazily by EmissionsPillar
    regions,
    refrigerants,
    acInverterShare,
    acGrowthData,
    coolingMilestones,
    applianceTimeseries,
    peakLoadData,
    countrySpotlights,
    mepsTimeline,
    mepsLevels,
    ndc: []
  };
};

// =============================================================================
// buildApplianceTimeseries
// =============================================================================
// Combines two Supabase tables into a unified ApplianceTimeseriesRecord[]:
//
//  CLASP Mepsy  (clasp_energy_consumption)
//    • stock_millions      ← appliance_units_in_use   (global sum per appliance+year)
//    • energy_twh  BAU     ← bau_final_energy_twh     (global sum)
//    • energy_twh  DECARB  ← gb_final_energy_twh      (Green Buildings MEPS efficiency)
//    • indirect_mt BAU     ← bau_co2_mt               (global sum)
//    • indirect_mt DECARB  ← gb_co2_mt × IEA grid ratio
//      → GB removes appliance inefficiency; IEA STEPS ratio removes grid carbon on top
//
//  GCI / HEAT  (global_model_subcool)
//    • direct_mt   BAU     ← direct_emission_mt where scenario_name = 'BAU'
//    • direct_mt   DECARB  ← direct_emission_mt where scenario_name = 'KIP_PLUS'
//      (KIP_PLUS = full Kigali phase-down, most ambitious refrigerant scenario)
//    Subsector mapping: 'Split residential air conditioners' → AC
//                       'Domestic refrigeration'             → DomRef
//    Fans carry zero direct emissions (no refrigerant — not modelled by HEAT)
//
//  IEA STEPS grid decarbonisation ratios (vs frozen-BAU grid assumption)
//  Source: IEA Electricity 2025, Stated Policies Scenario
//  Applied to CLASP GB indirect emissions for DECARB scenario only (2025 onward)
//
//  Combination point: total_emission_mt = indirect_mt + direct_mt
//  The join key is (appliance_type, year); no country-level data is retained.
// =============================================================================

export const buildApplianceTimeseries = (
  claspEnergy: ClaspEnergyRecord[],
  subcool: SubcoolRecord[]
): ApplianceTimeseriesRecord[] => {

  // ── Name mappings ────────────────────────────────────────────────────────
  const CLASP_TO_TYPE: Record<string, string> = {
    'Air Conditioning':          'AC',
    'Refrigerator-Freezers':     'DomRef',
    'Ceiling and Portable Fans': 'Fans',
  };
  // HEAT models only refrigerant-bearing subsectors; Fans have no direct emissions
  const HEAT_TO_TYPE: Record<string, string> = {
    'Split residential air conditioners': 'AC',
    'Domestic refrigeration':             'DomRef',
  };

  // IEA STEPS grid decarbonisation ratios (2025–2050)
  // Pre-2025 ratio = 1.0 (BAU and DECARB are identical for historical years)
  const IEA_GRID_RATIO: Record<number, number> = {
    2025: 0.95, 2030: 0.80, 2035: 0.65, 2040: 0.55, 2045: 0.47, 2050: 0.40,
  };

  type AggKey = string; // `${type}_${year}`

  // ── Step 1: aggregate CLASP (stock, energy, indirect) ────────────────────
  const claspBau: Record<AggKey, { stock: number; energy: number; indirect: number }> = {};
  const claspGb:  Record<AggKey, { energy: number; indirect: number }> = {};

  for (const r of claspEnergy) {
    const type = CLASP_TO_TYPE[r.appliance];
    if (!type) continue;
    const k = `${type}_${r.year}`;
    if (!claspBau[k]) claspBau[k] = { stock: 0, energy: 0, indirect: 0 };
    claspBau[k].stock    += r.appliance_units_in_use  ?? 0;
    claspBau[k].energy   += r.bau_final_energy_twh    ?? 0;
    claspBau[k].indirect += r.bau_co2_mt              ?? 0;
    if (!claspGb[k])  claspGb[k]  = { energy: 0, indirect: 0 };
    claspGb[k].energy    += r.gb_final_energy_twh     ?? 0;
    claspGb[k].indirect  += r.gb_co2_mt               ?? 0;
  }

  // ── Step 2: aggregate HEAT/GCI (direct emissions only) ───────────────────
  const heatDirect: Record<AggKey, { bau: number; kipPlus: number }> = {};

  for (const r of subcool) {
    const type = HEAT_TO_TYPE[r.subsector ?? ''];
    if (!type) continue;
    const k = `${type}_${r.year}`;
    if (!heatDirect[k]) heatDirect[k] = { bau: 0, kipPlus: 0 };
    if (r.scenario_name === 'BAU')      heatDirect[k].bau     += r.direct_emission_mt ?? 0;
    if (r.scenario_name === 'KIP_PLUS') heatDirect[k].kipPlus += r.direct_emission_mt ?? 0;
  }

  // ── Step 3: build combined rows per appliance × year × scenario ──────────
  const TYPES = ['AC', 'DomRef', 'Fans'];
  const years = [...new Set(claspEnergy.map(r => r.year))].sort((a, b) => a - b);
  const rows: ApplianceTimeseriesRecord[] = [];
  let id = 1;

  for (const year of years) {
    for (const type of TYPES) {
      const k     = `${type}_${year}`;
      const clasp = claspBau[k];
      if (!clasp || clasp.stock === 0) continue;

      const gb        = claspGb[k]     ?? { energy: 0, indirect: 0 };
      const heat      = heatDirect[k]  ?? { bau: 0, kipPlus: 0 };
      const gridRatio = IEA_GRID_RATIO[year] ?? 1.0;
      const projected = year >= 2025;

      // BAU: CLASP BAU columns + HEAT BAU direct
      // appliance_units_in_use is in actual units → divide by 1,000,000 for "millions" field
      const bauIndirect = clasp.indirect;
      const bauDirect   = heat.bau;
      rows.push({
        id: id++,
        year,
        appliance_type: type,
        scenario: 'BAU',
        stock_millions:       Math.round(clasp.stock / 1_000_000),
        energy_twh:           Math.round(clasp.energy),
        indirect_emission_mt: Math.round(bauIndirect),
        direct_emission_mt:   Math.round(bauDirect),
        total_emission_mt:    Math.round(bauIndirect + bauDirect),
        is_projected: projected,
        source: 'CLASP Mepsy (stock/energy/indirect) + GCI/HEAT BAU (direct)',
        source_url: 'https://www.clasp.ngo/tools/mepsy/',
      });

      // DECARB: CLASP GB energy × IEA grid ratio + HEAT KIP_PLUS direct
      // Pre-2025 DECARB = BAU (scenarios haven't diverged yet)
      const decarbEnergy   = projected ? Math.round(gb.energy   * gridRatio) : Math.round(clasp.energy);
      const decarbIndirect = projected ? Math.round(gb.indirect * gridRatio) : Math.round(clasp.indirect);
      const decarbDirect   = projected ? heat.kipPlus : heat.bau;
      rows.push({
        id: id++,
        year,
        appliance_type: type,
        scenario: 'DECARB',
        stock_millions:       Math.round(clasp.stock / 1_000_000),
        energy_twh:           decarbEnergy,
        indirect_emission_mt: decarbIndirect,
        direct_emission_mt:   Math.round(decarbDirect),
        total_emission_mt:    Math.round(decarbIndirect + decarbDirect),
        is_projected: projected,
        source: projected
          ? 'CLASP GB efficiency × IEA STEPS grid ratio (indirect) + GCI/HEAT KIP_PLUS (direct)'
          : 'CLASP Mepsy (stock/energy/indirect) + GCI/HEAT BAU (direct)',
        source_url: 'https://www.clasp.ngo/tools/mepsy/',
      });
    }
  }

  return rows;
};

export const getEmissionsData = (
  data: DashboardData,
  filters: EmissionsFilters
): EmissionsRecord[] => {
  return data.emissions.filter(
    (record) =>
      record.scenario_code === filters.scenario &&
      record.year === filters.year &&
      (filters.appliance === 'all' || record.appliance_category === filters.appliance)
  );
};

export const getNdcRecord = (
  data: DashboardData,
  countryCode: string,
  filters: NdcFilters
): NdcTrackerRecord | undefined => {
  return data.ndcTracker.find(
    (record) =>
      record.country_code === countryCode &&
      record.ndc_type === filters.type &&
      record.category === filters.category
  );
};

export const getAccessData = (
  data: DashboardData,
  filters: AccessFilters
): AccessRecord[] => {
  return data.access.filter((record) => {
    // Year filter (required)
    if (record.year !== filters.year) return false;

    // Impact level filter (multi-select)
    if (
      filters.impactLevels.length > 0 &&
      record.impact_level &&
      !filters.impactLevels.includes(record.impact_level)
    ) {
      return false;
    }

    // Population category filter (multi-select)
    if (
      filters.populationCategories.length > 0 &&
      record.population_category &&
      !filters.populationCategories.includes(record.population_category)
    ) {
      return false;
    }

    // Region filter
    if (filters.region && record.region !== filters.region) {
      return false;
    }

    return true;
  });
};

export const getAccessDataBySource = (
  data: DashboardData,
  filters: AccessFilters,
  source: 'historical' | 'forecast'
): AccessRecord[] => {
  const sourceData = source === 'forecast' ? data.accessForecast : data.access;
  return sourceData.filter((record) => {
    // Global country filter
    if (filters.country && record.country_code !== filters.country) return false;
    if (record.year !== filters.year) return false;
    if (
      filters.impactLevels.length > 0 &&
      record.impact_level &&
      !filters.impactLevels.includes(record.impact_level)
    ) {
      return false;
    }
    if (
      filters.populationCategories.length > 0 &&
      record.population_category &&
      !filters.populationCategories.includes(record.population_category)
    ) {
      return false;
    }
    if (filters.region && record.region !== filters.region) {
      return false;
    }
    return true;
  });
};

export const getAccessKPIs = (filteredData: AccessRecord[]) => {
  const totalAtRisk = filteredData.reduce(
    (sum, r) => sum + (r.population_without_cooling || 0),
    0
  );
  const highImpactCountries = new Set(
    filteredData.filter((r) => r.impact_level === 'High').map((r) => r.country_code)
  ).size;
  const countriesCovered = new Set(filteredData.map((r) => r.country_code)).size;
  const regions = new Set(filteredData.map((r) => r.region).filter(Boolean)).size;

  return { totalAtRisk, highImpactCountries, countriesCovered, regions };
};

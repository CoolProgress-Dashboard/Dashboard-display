import type {
  AccessFilters,
  AccessForecastRecord,
  AccessRecord,
  ClaspEnergyRecord,
  DashboardData,
  EmissionsFilters,
  EmissionsRecord,
  NcapRecord,
  NdcFilters,
  NdcTrackerRecord,
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
  // For large tables, fetch all records with pagination
  if (limit > 1000) {
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
        throw new Error(`Failed to fetch ${table}: ${response.status}`);
      }

      const batch: T[] = await response.json();
      allRecords.push(...batch);

      if (batch.length < batchSize) {
        break; // No more records
      }
      offset += batchSize;
    }

    return allRecords;
  }

  // Standard fetch for smaller tables
  const endpoint = `${url}/rest/v1/${table}?select=${columns}${filter}`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${table}: ${response.status}`);
  }

  return response.json();
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
  refrigerants: []
});

export const loadDashboardData = async (
  url: string,
  key: string
): Promise<DashboardData> => {
  const [countries, pledge, kigali, meps, access, accessForecast, emissions, ndcTracker, ncap, claspEnergy, subcool, regions, refrigerants] =
    await Promise.all([
      fetchTable(url, key, 'countries', 'country_code,country_name,region'),
      fetchTable(url, key, 'global_cooling_pledge', 'country_code,country_name,signatory'),
      fetchTable(
        url,
        key,
        'kip',
        'country_code,country_name,kigali_party,montreal_protocol_party,group_type'
      ),
      fetchTable(
        url,
        key,
        'meps',
        'country_code,country_name,status,requirement_type,year_adopted,region'
      ),
      fetchTable<AccessRecord>(
        url,
        key,
        'access_to_cooling_seeforall',
        'id,country_code,country_name,region,impact_category,population_category,impact_level,gender_type,year,population_without_cooling',
        '',
        5000 // Fetch all access records (~3,696 records)
      ),
      // Access to Cooling Forecast data (2025-2030)
      fetchTable<AccessForecastRecord>(
        url,
        key,
        'access_to_cooling_forecast',
        'id,country_code,country_name,region,impact_category,population_category,impact_level,gender_type,year,population_without_cooling',
        '',
        5000 // Fetch all forecast records
      ),
      fetchTable(
        url,
        key,
        'v_emissions_summary',
        'country_code,country_name,region,year,scenario_code,appliance_category,total_emissions,direct_emissions,indirect_emissions'
      ),
      fetchTable(
        url,
        key,
        'ndc_tracker_clasp',
        'country_code,country_name,continent,subregion,annex_status,ndc_type,category,mention_status,mention_value',
        '',
        15000 // Fetch all NDC records (table has ~11,700 records)
      ),
      fetchTable<NcapRecord>(
        url,
        key,
        'ncap',
        'id,country_code,country_name,year,long_term_goal,sectoral_targets,energy_consumed_twh,ghg_emissions_mtco2e,cooling_access_vulnerability,energy_efficiency_demand_reduction,refrigerant_management,remarks,policy_available_pdf'
      ),
      // CLASP Energy Consumption data
      fetchTable<ClaspEnergyRecord>(
        url,
        key,
        'clasp_energy_consumption',
        'id,country_code,country_name,year,appliance,bau_final_energy_twh,bau_co2_mt,gb_final_energy_twh,gb_co2_mt,gb_annual_co2_red_mt,nzh_final_energy_twh,nzh_co2_mt,nzh_annual_co2_red_mt,bat_final_energy_twh,bat_co2_mt,bat_annual_co2_red_mt,appliance_units_in_use,appliance_ownership_rate',
        '',
        50000 // Large table with many records
      ),
      // Global Model Subcool data
      fetchTable<SubcoolRecord>(
        url,
        key,
        'global_model_subcool',
        'id,scenario_id,scenario_name,country_code,country_name,subsector_id,subsector,year,indirect_emission_mt,direct_emission_mt,stock,unit_sales,ec_gwh',
        '',
        100000 // Large table
      ),
      // Regions lookup
      fetchTable<RegionRecord>(
        url,
        key,
        'regions',
        'id,country_code,region,subregion,continent'
      ),
      // Refrigerants with GWP data
      fetchTable<RefrigerantRecord>(
        url,
        key,
        'refrigerants',
        'id,refrigerant_code,gwp_100_ar6,gwp_source,ref_type,natural_refrigerant'
      )
    ]);

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
    claspEnergy,
    subcool,
    regions,
    refrigerants,
    ndc: []
  };
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

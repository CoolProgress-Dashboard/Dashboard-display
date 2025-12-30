import type {
  DashboardData,
  EmissionsFilters,
  EmissionsRecord,
  NdcFilters,
  NdcTrackerRecord
} from './dashboard-types';

const fetchTable = async <T>(
  url: string,
  key: string,
  table: string,
  columns = '*',
  filter = ''
): Promise<T[]> => {
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
  ndc: [],
  emissions: [],
  ndcTracker: []
});

export const loadDashboardData = async (
  url: string,
  key: string
): Promise<DashboardData> => {
  const [countries, pledge, kigali, meps, access, emissions, ndcTracker] =
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
      fetchTable(
        url,
        key,
        'access_to_cooling_seeforall',
        'country_code,region,population_without_cooling',
        '&year=eq.2013'
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
        'country_code,country_name,continent,subregion,annex_status,ndc_type,category,mention_status,mention_value'
      )
    ]);

  return {
    countries,
    pledge,
    kigali,
    meps,
    access,
    emissions,
    ndcTracker,
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

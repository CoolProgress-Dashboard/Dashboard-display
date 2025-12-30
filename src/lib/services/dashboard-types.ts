export type Country = {
  country_code: string;
  country_name: string;
  region?: string | null;
};

export type Pledge = {
  country_code: string;
  country_name?: string | null;
  signatory: number;
};

export type Kigali = {
  country_code: string;
  country_name?: string | null;
  kigali_party: number;
  montreal_protocol_party: number;
  group_type?: string | null;
};

export type Meps = {
  country_code: string;
  country_name?: string | null;
  status?: string | null;
  requirement_type?: string | null;
  year_adopted?: number | null;
  region?: string | null;
};

export type AccessRecord = {
  country_code: string;
  region?: string | null;
  population_without_cooling: string | number | null;
  year?: number | null;
};

export type EmissionsRecord = {
  country_code: string;
  country_name?: string | null;
  region?: string | null;
  year: number;
  scenario_code: string;
  appliance_category: string;
  total_emissions?: number | null;
  direct_emissions?: number | null;
  indirect_emissions?: number | null;
};

export type NdcTrackerRecord = {
  country_code: string;
  country_name?: string | null;
  continent?: string | null;
  subregion?: string | null;
  annex_status?: string | null;
  ndc_type: string;
  category: string;
  mention_status?: string | null;
  mention_value?: number | null;
};

export type DashboardData = {
  countries: Country[];
  pledge: Pledge[];
  kigali: Kigali[];
  meps: Meps[];
  access: AccessRecord[];
  ndc: unknown[];
  emissions: EmissionsRecord[];
  ndcTracker: NdcTrackerRecord[];
};

export type EmissionsFilters = {
  scenario: string;
  year: number;
  appliance: string;
};

export type NdcFilters = {
  type: string;
  category: string;
};

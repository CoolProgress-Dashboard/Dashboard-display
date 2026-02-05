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
  policy_name?: string | null;
  equipment_type?: string | null;
  requirement_type?: string | null;
  policy_instrument?: string | null;
  status?: string | null;
  year_adopted?: number | null;
  year_revised?: number | null;
  region?: string | null;
};

export type AccessRecord = {
  id?: number;
  country_code: string;
  country_name?: string | null;
  region?: string | null;
  impact_category?: string | null;
  population_category?: string | null;
  impact_level?: string | null;
  gender_type?: string | null;
  year: number;
  population_without_cooling: number;
};

export type AccessFilters = {
  year: number;
  impactLevels: string[];
  populationCategories: string[];
  region: string;
  country: string;
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

export type NcapRecord = {
  id: number;
  country_code: string;
  country_name: string;
  year?: number | null;
  long_term_goal?: number | null;
  sectoral_targets?: number | null;
  energy_consumed_twh?: number | null;
  ghg_emissions_mtco2e?: number | null;
  cooling_access_vulnerability?: number | null;
  energy_efficiency_demand_reduction?: number | null;
  refrigerant_management?: number | null;
  remarks?: string | null;
  policy_available_pdf?: string | null;
};

export type DashboardData = {
  countries: Country[];
  pledge: Pledge[];
  kigali: Kigali[];
  meps: Meps[];
  access: AccessRecord[];
  accessForecast: AccessForecastRecord[];
  ndc: unknown[];
  emissions: EmissionsRecord[];
  ndcTracker: NdcTrackerRecord[];
  ncap: NcapRecord[];
  claspEnergy: ClaspEnergyRecord[];
  subcool: SubcoolRecord[];
  regions: RegionRecord[];
  refrigerants: RefrigerantRecord[];
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

// CLASP Energy Consumption data (for Fans, AC, Refrigerators)
export type ClaspEnergyRecord = {
  id: number;
  country_code: string;
  country_name: string;
  year: number;
  appliance: string; // "Air Conditioning", "Ceiling and Portable Fans", "Refrigerator-Freezers"
  // BAU scenario
  bau_final_energy_twh?: number | null;
  bau_primary_energy_twh?: number | null;
  bau_co2_mt?: number | null;
  // Green Buildings scenario
  gb_final_energy_twh?: number | null;
  gb_co2_mt?: number | null;
  gb_annual_co2_red_mt?: number | null;
  gb_cumul_co2_red_mt?: number | null;
  // Net Zero Homes scenario
  nzh_final_energy_twh?: number | null;
  nzh_co2_mt?: number | null;
  nzh_annual_co2_red_mt?: number | null;
  nzh_cumul_co2_red_mt?: number | null;
  // Best Available Technology scenario
  bat_final_energy_twh?: number | null;
  bat_co2_mt?: number | null;
  bat_annual_co2_red_mt?: number | null;
  bat_cumul_co2_red_mt?: number | null;
  // Stock info
  appliance_units_in_use?: number | null;
  appliance_ownership_rate?: number | null;
};

// Global Model Subcool data (for AC and Refrigeration with direct/indirect emissions)
export type SubcoolRecord = {
  id: number;
  scenario_id: number;
  scenario_name: string; // "BAU", "KIP"
  country_code: string;
  country_name: string;
  subsector_id: number;
  subsector: string; // "Split residential air conditioners", "Domestic refrigeration"
  year: number;
  indirect_emission_mt?: number | null;
  direct_emission_mt?: number | null;
  stock?: number | null;
  unit_sales?: number | null;
  sales_value?: number | null;
  ec_gwh?: number | null;
};

// Region mapping
export type RegionRecord = {
  id: number;
  country_code: string;
  region?: string | null;
  subregion?: string | null;
  continent?: string | null;
};

// Extended filters for new emissions view
export type EmissionsViewFilters = {
  year: number;
  scenario: string;
  dataSource: 'clasp' | 'subcool';
  appliances: string[];
  emissionType: 'total' | 'direct' | 'indirect';
  region: string;
};

// Access to Cooling Forecast data (2025-2030)
export type AccessForecastRecord = {
  id?: number;
  country_code: string;
  country_name?: string | null;
  region?: string | null;
  impact_category?: string | null;
  population_category?: string | null;
  impact_level?: string | null;
  gender_type?: string | null;
  year: number;
  population_without_cooling: number;
};

// Refrigerant data with GWP values
export type RefrigerantRecord = {
  id: number;
  refrigerant_code: string;
  gwp_100_ar6: number;
  gwp_source?: string | null;
  ref_type: string; // "HFC", "HCFC", "HFO", "NR"
  natural_refrigerant: boolean;
};

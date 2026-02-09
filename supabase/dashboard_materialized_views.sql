-- Dashboard materialized views for faster reads
-- Run in Supabase SQL editor. Refresh as part of your data update pipeline.

create materialized view if not exists mv_emissions_summary as
select
  country_code,
  country_name,
  region,
  year,
  scenario_code,
  appliance_category,
  total_emissions,
  direct_emissions,
  indirect_emissions
from v_emissions_summary;

create index if not exists mv_emissions_summary_year_scenario_idx
  on mv_emissions_summary (year, scenario_code, appliance_category);
create index if not exists mv_emissions_summary_country_idx
  on mv_emissions_summary (country_code);

create materialized view if not exists mv_clasp_energy_consumption as
select
  id,
  country_code,
  country_name,
  year,
  appliance,
  bau_final_energy_twh,
  bau_co2_mt,
  gb_final_energy_twh,
  gb_co2_mt,
  gb_annual_co2_red_mt,
  nzh_final_energy_twh,
  nzh_co2_mt,
  nzh_annual_co2_red_mt,
  bat_final_energy_twh,
  bat_co2_mt,
  bat_annual_co2_red_mt,
  appliance_units_in_use,
  appliance_ownership_rate
from clasp_energy_consumption;

create index if not exists mv_clasp_energy_year_appliance_idx
  on mv_clasp_energy_consumption (year, appliance, country_code);

create materialized view if not exists mv_global_model_subcool as
select
  id,
  scenario_id,
  scenario_name,
  country_code,
  country_name,
  subsector_id,
  subsector,
  year,
  indirect_emission_mt,
  direct_emission_mt,
  stock,
  unit_sales,
  ec_gwh
from global_model_subcool;

create index if not exists mv_subcool_year_scenario_idx
  on mv_global_model_subcool (year, scenario_name, country_code);

-- Refresh examples:
-- refresh materialized view concurrently mv_emissions_summary;
-- refresh materialized view concurrently mv_clasp_energy_consumption;
-- refresh materialized view concurrently mv_global_model_subcool;

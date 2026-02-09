/**
 * Static MEPS level data for immediate frontend use.
 * Generated from /data/meps_levels.json and /data/meps_timeline.json
 *
 * This module provides typed data constants so the dashboard can render
 * MEPS comparisons without waiting for the Supabase tables to be set up.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MepsLevel {
  country_code: string;
  country_name: string;
  appliance_type: 'AC' | 'Refrigerator' | 'Fan';
  metric_name: string;
  metric_value: number | null;
  cspf_equivalent: number | null;
  eei_equivalent?: number | null;
  year_adopted: number | null;
  year_revised: number | null;
  year_planned_update: number | null;
  is_mandatory: boolean;
  standard_name: string;
  requirement_level: string;
  notes: string;
  u4e_recommended: boolean;
}

export interface MepsTimelineEntry {
  country_code: string;
  country_name: string;
  appliance_type: string;
  year: number;
  meps_level_national: number;
  metric_name: string;
  meps_level_cspf_equiv: number;
  standard_version: string;
  is_projected: boolean;
  source: string;
}

// ---------------------------------------------------------------------------
// MEPS Levels - Current standards per country/appliance
// ---------------------------------------------------------------------------

export const MEPS_LEVELS: MepsLevel[] = [
  {
    country_code: "IN",
    country_name: "India",
    appliance_type: "AC",
    metric_name: "ISEER",
    metric_value: 3.30,
    cspf_equivalent: 3.04,
    year_adopted: 2022,
    year_revised: 2024,
    year_planned_update: 2027,
    is_mandatory: true,
    standard_name: "BEE S&L / BIS IS 1391",
    requirement_level: "minimum",
    notes: "1-star minimum. 5-star >= 5.00 ISEER. Proposed: 1-star = ISEER 5.0 by 2027, 6.3 by 2030, 7.4 by 2033. Most ambitious proposed trajectory globally.",
    u4e_recommended: false
  },
  {
    country_code: "CN",
    country_name: "China",
    appliance_type: "AC",
    metric_name: "CSPF",
    metric_value: 6.09,
    cspf_equivalent: 6.09,
    year_adopted: 2020,
    year_revised: null,
    year_planned_update: 2025,
    is_mandatory: true,
    standard_name: "GB 21455-2019",
    requirement_level: "minimum",
    notes: "World-leading. Unified fixed/variable speed. Grade 5 minimum for variable-speed split <=4.5kW. 2025 target: 7.64 CSPF.",
    u4e_recommended: true
  },
  {
    country_code: "US",
    country_name: "USA (South)",
    appliance_type: "AC",
    metric_name: "SEER2",
    metric_value: 14.3,
    cspf_equivalent: 4.2,
    year_adopted: 2023,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "DOE 10 CFR 430 (AHRI 210/240-2023 M1)",
    requirement_level: "minimum",
    notes: "Regional split: South/Southwest 14.3 SEER2 (<45k BTU), North 13.4 SEER2. SEER2 replaced SEER in 2023 with higher external static pressure test.",
    u4e_recommended: false
  },
  {
    country_code: "US",
    country_name: "USA (North)",
    appliance_type: "AC",
    metric_name: "SEER2",
    metric_value: 13.4,
    cspf_equivalent: 3.9,
    year_adopted: 2023,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "DOE 10 CFR 430 (AHRI 210/240-2023 M1)",
    requirement_level: "minimum",
    notes: "Northern region requirement for split AC <65k BTU.",
    u4e_recommended: false
  },
  {
    country_code: "EU",
    country_name: "European Union",
    appliance_type: "AC",
    metric_name: "EU SEER",
    metric_value: 5.4,
    cspf_equivalent: 5.1,
    year_adopted: 2014,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "EU Regulation 206/2012 (Tier 2)",
    requirement_level: "minimum",
    notes: "Applies to <=12kW cooling. Low-GWP refrigerant (<150 GWP) gets 10% relief to SEER 4.86. Average sold RACs at SEER 5.4. Under revision.",
    u4e_recommended: true
  },
  {
    country_code: "JP",
    country_name: "Japan",
    appliance_type: "AC",
    metric_name: "APF",
    metric_value: 5.8,
    cspf_equivalent: 5.2,
    year_adopted: 2022,
    year_revised: null,
    year_planned_update: 2027,
    is_mandatory: true,
    standard_name: "Top Runner Program / JIS C 9612:2013",
    requirement_level: "minimum",
    notes: "Wall-mount <=4kW: APF 5.8. 4-7.1kW: APF 4.9. 7.1-28kW: APF 4.4. Among world's most stringent. Dynamic targets updated periodically.",
    u4e_recommended: true
  },
  {
    country_code: "KR",
    country_name: "South Korea",
    appliance_type: "AC",
    metric_name: "CSPF",
    metric_value: 3.5,
    cspf_equivalent: 3.5,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "MOTIE Labelling / KS C 9306:2017",
    requirement_level: "minimum",
    notes: "Grade 5 threshold (~3.5 CSPF). Grade 1 highest (~5.5+ CSPF). Grade 4 became Grade 5 from Oct 2024. Standards updated regularly.",
    u4e_recommended: false
  },
  {
    country_code: "BR",
    country_name: "Brazil",
    appliance_type: "AC",
    metric_name: "CSPF",
    metric_value: 3.5,
    cspf_equivalent: 3.5,
    year_adopted: 2025,
    year_revised: null,
    year_planned_update: 2027,
    is_mandatory: true,
    standard_name: "Portaria 234/2020 (INMETRO/PBE)",
    requirement_level: "minimum",
    notes: "Class F minimum (3.50 CSPF). Class A >= 7.00 CSPF. First CSPF-based MEPS in Latin America. Manufacturer compliance Dec 2025, retail Jun 2027. Phase 2 from Jan 2026 effectively phases out fixed-speed.",
    u4e_recommended: false
  },
  {
    country_code: "SA",
    country_name: "Saudi Arabia",
    appliance_type: "AC",
    metric_name: "EER",
    metric_value: 7.2,
    cspf_equivalent: 3.0,
    year_adopted: 2025,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "SASO 2663:2025",
    requirement_level: "minimum",
    notes: "Star 3+ required for sale. T3 window <=24k BTU: EER 7.20. New standard adds SEER requirements alongside EER. HEAC incentive: 900 SAR/unit for EER >= 13.0. Effective Nov 2026.",
    u4e_recommended: false
  },
  {
    country_code: "ZA",
    country_name: "South Africa",
    appliance_type: "AC",
    metric_name: "CSPF",
    metric_value: 3.2,
    cspf_equivalent: 3.2,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: 2027,
    is_mandatory: true,
    standard_name: "SANS 941 / SADC HT 110:2023",
    requirement_level: "minimum",
    notes: "SADC harmonised Tier 1 (2024), Tier 2 (2027). 16 SADC countries adopted. Projected savings: 8 TWh electricity, 6.5 Mt CO2 by 2040.",
    u4e_recommended: false
  },
  {
    country_code: "AU",
    country_name: "Australia",
    appliance_type: "AC",
    metric_name: "AEER",
    metric_value: 3.1,
    cspf_equivalent: 3.3,
    year_adopted: 2019,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "GEMS 2019 / AS/NZS 3823.2",
    requirement_level: "minimum",
    notes: "Single split: 3.10 AEER. Multi-split <4kW: 3.66 AEER. Harmonized with New Zealand. Under review.",
    u4e_recommended: false
  },
  {
    country_code: "NZ",
    country_name: "New Zealand",
    appliance_type: "AC",
    metric_name: "AEER",
    metric_value: 3.1,
    cspf_equivalent: 3.3,
    year_adopted: 2019,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "GEMS 2019 (harmonized with Australia)",
    requirement_level: "minimum",
    notes: "Harmonized with Australia under GEMS Act.",
    u4e_recommended: false
  },
  {
    country_code: "SG",
    country_name: "Singapore",
    appliance_type: "AC",
    metric_name: "CSPF",
    metric_value: 6.09,
    cspf_equivalent: 6.09,
    year_adopted: 2025,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "NEA MEPS (ISO 16358)",
    requirement_level: "minimum",
    notes: "Effective April 2025. Matches China at global leadership. Leads ASEAN push for high-efficiency standards.",
    u4e_recommended: true
  },
  {
    country_code: "NG",
    country_name: "Nigeria",
    appliance_type: "AC",
    metric_name: "NSEER",
    metric_value: 3.0,
    cspf_equivalent: 3.0,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: 2026,
    is_mandatory: true,
    standard_name: "SON/NERC NSEER",
    requirement_level: "minimum",
    notes: "Largest AC market in Africa. Phased: +6% by 2026, +36% by 2029, +48% by 2031. Projected savings: 11.5 TWh/yr and 39 Mt CO2 over 15 years.",
    u4e_recommended: false
  },
  {
    country_code: "GH",
    country_name: "Ghana",
    appliance_type: "AC",
    metric_name: "EER",
    metric_value: 2.63,
    cspf_equivalent: 2.8,
    year_adopted: 2019,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "L.I. 2458 (Ghana Standards Authority)",
    requirement_level: "minimum",
    notes: "ECOWAS regional leader. Mandatory MEPS with Turn-in and rebate program. ECOFRIDGES financial mechanism in operation.",
    u4e_recommended: false
  },
  {
    country_code: "KE",
    country_name: "Kenya",
    appliance_type: "AC",
    metric_name: "CSPF",
    metric_value: 3.0,
    cspf_equivalent: 3.0,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "EAC-aligned / KEBS (EAS 1213:2025)",
    requirement_level: "minimum",
    notes: "EAC aligned with SADC. 100% registration compliance via EPRA. Star rating system; most units rated 1-2 stars, indicating room for tightening.",
    u4e_recommended: false
  },
  {
    country_code: "SADC",
    country_name: "SADC Region",
    appliance_type: "AC",
    metric_name: "CSPF",
    metric_value: 3.2,
    cspf_equivalent: 3.2,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: 2027,
    is_mandatory: true,
    standard_name: "SADC HT 110:2023",
    requirement_level: "minimum",
    notes: "16 Southern African countries. Tier 1 (2024), Tier 2 (2027). Regional harmonisation to reduce trade barriers.",
    u4e_recommended: false
  },
  {
    country_code: "ECOWAS",
    country_name: "ECOWAS Region",
    appliance_type: "AC",
    metric_name: "CSPF",
    metric_value: 2.8,
    cspf_equivalent: 2.8,
    year_adopted: 2019,
    year_revised: null,
    year_planned_update: 2026,
    is_mandatory: false,
    standard_name: "ECREEE Regional Standard (Ghana leads)",
    requirement_level: "proposed",
    notes: "Ghana (L.I. 2458) leads at EER 2.63 (~CSPF 2.8) since 2019. Regional harmonised standard under development via ECREEE with U4E support. ECOFRIDGES program active in Ghana and Senegal.",
    u4e_recommended: false
  },
  {
    country_code: "EAC",
    country_name: "EAC Region",
    appliance_type: "AC",
    metric_name: "CSPF",
    metric_value: 3.0,
    cspf_equivalent: 3.0,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: 2027,
    is_mandatory: true,
    standard_name: "EAS 1213:2025 (EAC aligned with SADC)",
    requirement_level: "minimum",
    notes: "7 EAC countries (Kenya, Tanzania, Uganda, Rwanda, Burundi, DRC, South Sudan). Aligned with SADC HT 110 Tier 1. Kenya leads enforcement via EPRA with 100% registration compliance.",
    u4e_recommended: false
  },
  // --- Refrigerators ---
  {
    country_code: "IN",
    country_name: "India",
    appliance_type: "Refrigerator",
    metric_name: "kWh/yr (Star Rating)",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: 2025,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "BEE S&L / IS 15750",
    requirement_level: "minimum",
    notes: "Star-rated system. Mandatory labelling from Jan 2026. kWh/yr thresholds by volume.",
    u4e_recommended: false
  },
  {
    country_code: "CN",
    country_name: "China",
    appliance_type: "Refrigerator",
    metric_name: "TEEI (%)",
    metric_value: 90.0,
    cspf_equivalent: null,
    year_adopted: 2025,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "GB 12021.2-2025",
    requirement_level: "minimum",
    notes: "Grade 5: TEEI 90%. Effective Jun 2026. 40% reduction vs prior standard. Most significant update in a decade.",
    u4e_recommended: false
  },
  {
    country_code: "US",
    country_name: "USA",
    appliance_type: "Refrigerator",
    metric_name: "kWh/yr",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: 2029,
    is_mandatory: true,
    standard_name: "DOE Final Rule (Jan 2024)",
    requirement_level: "minimum",
    notes: "Config-dependent kWh/yr limits. 10-15% more stringent than prior. Compliance from Jan 2029 (refrigerators) / Jan 2030 (freezers). First update in over a decade.",
    u4e_recommended: false
  },
  {
    country_code: "EU",
    country_name: "European Union",
    appliance_type: "Refrigerator",
    metric_name: "EEI",
    metric_value: 125.0,
    cspf_equivalent: null,
    year_adopted: 2021,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "EU Regulation 2019/2019",
    requirement_level: "minimum",
    notes: "EEI <= 125 for household. New A-G label from Mar 2021. Commercial: EEI < 80 from Sep 2023.",
    u4e_recommended: false
  },
  {
    country_code: "JP",
    country_name: "Japan",
    appliance_type: "Refrigerator",
    metric_name: "kWh/yr",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: 2021,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "Top Runner Program",
    requirement_level: "minimum",
    notes: "Category-based kWh/yr targets. 30.5% decrease target achieved. 55% cumulative reduction 1998-2004.",
    u4e_recommended: false
  },
  {
    country_code: "KR",
    country_name: "South Korea",
    appliance_type: "Refrigerator",
    metric_name: "kWh/month",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "MOTIE Labelling",
    requirement_level: "minimum",
    notes: "Grade 5 threshold. Mandatory. Standards updated every 3 years.",
    u4e_recommended: false
  },
  {
    country_code: "BR",
    country_name: "Brazil",
    appliance_type: "Refrigerator",
    metric_name: "kWh/month",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "INMETRO/PBE",
    requirement_level: "minimum",
    notes: "A-G class system. 2024/2025 regulatory agenda includes updates.",
    u4e_recommended: false
  },
  {
    country_code: "SA",
    country_name: "Saudi Arabia",
    appliance_type: "Refrigerator",
    metric_name: "EEI",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: 2025,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "SASO 2892:2025",
    requirement_level: "minimum",
    notes: "New 2025 edition with updated EEI-based thresholds.",
    u4e_recommended: false
  },
  {
    country_code: "ZA",
    country_name: "South Africa",
    appliance_type: "Refrigerator",
    metric_name: "EEI",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: 2027,
    is_mandatory: true,
    standard_name: "SANS 941 / SADC HT 111:2023",
    requirement_level: "minimum",
    notes: "SADC harmonised for refrigerators. Tier 1 (2024), Tier 2 (2027).",
    u4e_recommended: false
  },
  {
    country_code: "AU",
    country_name: "Australia",
    appliance_type: "Refrigerator",
    metric_name: "EEI",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "GEMS 2024 / AS/NZS 4474.2",
    requirement_level: "minimum",
    notes: "EEI-based. Commercial cabinets determination updated Oct 2024.",
    u4e_recommended: false
  },
  {
    country_code: "KE",
    country_name: "Kenya",
    appliance_type: "Refrigerator",
    metric_name: "kWh/yr",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "KEBS / EAS 1214:2025",
    requirement_level: "minimum",
    notes: "Formula: AEC_max = 0.163 x AV + 102 kWh/yr. EAC aligned with SADC. Strong enforcement via EPRA.",
    u4e_recommended: false
  },
  {
    country_code: "SADC",
    country_name: "SADC Region",
    appliance_type: "Refrigerator",
    metric_name: "EEI",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: 2027,
    is_mandatory: true,
    standard_name: "SADC HT 111:2023",
    requirement_level: "minimum",
    notes: "Regional harmonised standard for refrigerators. Tier 1 (2024), Tier 2 (2027). 16 member states.",
    u4e_recommended: false
  },
  {
    country_code: "EAC",
    country_name: "EAC Region",
    appliance_type: "Refrigerator",
    metric_name: "kWh/yr",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "EAS 1214:2025 (EAC aligned with SADC)",
    requirement_level: "minimum",
    notes: "Formula: AEC_max = 0.163 x AV + 102 kWh/yr. 7 EAC countries aligned with SADC HT 111. Kenya leads enforcement.",
    u4e_recommended: false
  },
  {
    country_code: "ECOWAS",
    country_name: "ECOWAS Region",
    appliance_type: "Refrigerator",
    metric_name: "kWh/yr",
    metric_value: null,
    cspf_equivalent: null,
    year_adopted: null,
    year_revised: null,
    year_planned_update: 2026,
    is_mandatory: false,
    standard_name: "ECREEE Regional Standard (proposed)",
    requirement_level: "proposed",
    notes: "Under development. Ghana ECOFRIDGES program as precursor: subsidised efficient fridges replacing old units. Senegal joining.",
    u4e_recommended: false
  },
  // --- Fans ---
  {
    country_code: "IN",
    country_name: "India",
    appliance_type: "Fan",
    metric_name: "Watts (max service value)",
    metric_value: 53.0,
    cspf_equivalent: null,
    year_adopted: 2024,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "BEE S&L / IS 374",
    requirement_level: "minimum",
    notes: "53W max service value. Mandatory star labelling since 2022. BLDC motors dominate 5-star category.",
    u4e_recommended: false
  },
  {
    country_code: "CN",
    country_name: "China",
    appliance_type: "Fan",
    metric_name: "W (Grade 3 max, 1400mm)",
    metric_value: 65.0,
    cspf_equivalent: null,
    year_adopted: 2017,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "GB 12021.6-2017",
    requirement_level: "minimum",
    notes: "Grade 3 minimum: ~65W max for 1400mm ceiling fan. Grade 1 (most efficient) ~40W. Covers ceiling and ventilation fans.",
    u4e_recommended: false
  },
  {
    country_code: "US",
    country_name: "USA",
    appliance_type: "Fan",
    metric_name: "CFM/W (min at high speed)",
    metric_value: 80.0,
    cspf_equivalent: null,
    year_adopted: 2020,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "DOE 10 CFR 430",
    requirement_level: "minimum",
    notes: "Standard ceiling fans: 80 CFM/W min at high speed. Large-diameter (>7ft): 25 CFM/W. ENERGY STAR: 140+ CFM/W (60% savings).",
    u4e_recommended: false
  },
  {
    country_code: "EU",
    country_name: "European Union",
    appliance_type: "Fan",
    metric_name: "W (max comfort fan)",
    metric_value: 125.0,
    cspf_equivalent: null,
    year_adopted: 2015,
    year_revised: null,
    year_planned_update: null,
    is_mandatory: true,
    standard_name: "EU Reg. 206/2012 + 327/2011",
    requirement_level: "minimum",
    notes: "Comfort fans <=125W scope under Reg 206/2012. Ventilation fans under Reg 327/2011 use specific energy (W/(m3/h)).",
    u4e_recommended: false
  }
];

// ---------------------------------------------------------------------------
// MEPS Timeline - Historical and projected levels
// ---------------------------------------------------------------------------

export const MEPS_TIMELINE: MepsTimelineEntry[] = [
  { country_code: "CN", country_name: "China", appliance_type: "AC", year: 2010, meps_level_national: 3.2, metric_name: "CSPF", meps_level_cspf_equiv: 3.2, standard_version: "GB 21455 (2010)", is_projected: false, source: "IEA Policies Database" },
  { country_code: "CN", country_name: "China", appliance_type: "AC", year: 2013, meps_level_national: 4.5, metric_name: "CSPF", meps_level_cspf_equiv: 4.5, standard_version: "GB 21455 (2013)", is_projected: false, source: "IEA Policies Database" },
  { country_code: "CN", country_name: "China", appliance_type: "AC", year: 2016, meps_level_national: 5.0, metric_name: "CSPF", meps_level_cspf_equiv: 5.0, standard_version: "GB 21455 (2016)", is_projected: false, source: "IEA Policies Database" },
  { country_code: "CN", country_name: "China", appliance_type: "AC", year: 2020, meps_level_national: 6.09, metric_name: "CSPF", meps_level_cspf_equiv: 6.09, standard_version: "GB 21455-2019", is_projected: false, source: "IEA Policies Database" },
  { country_code: "CN", country_name: "China", appliance_type: "AC", year: 2025, meps_level_national: 7.64, metric_name: "CSPF", meps_level_cspf_equiv: 7.64, standard_version: "GB 21455 (2025 target)", is_projected: true, source: "SAMR/CNIS" },
  { country_code: "IN", country_name: "India", appliance_type: "AC", year: 2018, meps_level_national: 2.7, metric_name: "ISEER", meps_level_cspf_equiv: 2.5, standard_version: "BEE 2018", is_projected: false, source: "BEE India" },
  { country_code: "IN", country_name: "India", appliance_type: "AC", year: 2022, meps_level_national: 3.3, metric_name: "ISEER", meps_level_cspf_equiv: 3.04, standard_version: "BEE 2022", is_projected: false, source: "BEE India / PIB" },
  { country_code: "IN", country_name: "India", appliance_type: "AC", year: 2024, meps_level_national: 3.3, metric_name: "ISEER", meps_level_cspf_equiv: 3.04, standard_version: "BEE 2024 (unchanged MEPS)", is_projected: false, source: "BEE India" },
  { country_code: "IN", country_name: "India", appliance_type: "AC", year: 2027, meps_level_national: 5.0, metric_name: "ISEER", meps_level_cspf_equiv: 4.6, standard_version: "BEE Proposed 2027", is_projected: true, source: "IECC Berkeley / BEE" },
  { country_code: "IN", country_name: "India", appliance_type: "AC", year: 2030, meps_level_national: 6.3, metric_name: "ISEER", meps_level_cspf_equiv: 5.8, standard_version: "BEE Proposed 2030", is_projected: true, source: "IECC Berkeley / BEE" },
  { country_code: "IN", country_name: "India", appliance_type: "AC", year: 2033, meps_level_national: 7.4, metric_name: "ISEER", meps_level_cspf_equiv: 6.8, standard_version: "BEE Proposed 2033", is_projected: true, source: "IECC Berkeley / BEE" },
  { country_code: "US", country_name: "USA (South)", appliance_type: "AC", year: 2006, meps_level_national: 13.0, metric_name: "SEER", meps_level_cspf_equiv: 3.8, standard_version: "DOE 2006", is_projected: false, source: "DOE" },
  { country_code: "US", country_name: "USA (South)", appliance_type: "AC", year: 2015, meps_level_national: 14.0, metric_name: "SEER", meps_level_cspf_equiv: 4.1, standard_version: "DOE 2015 Regional", is_projected: false, source: "DOE" },
  { country_code: "US", country_name: "USA (South)", appliance_type: "AC", year: 2023, meps_level_national: 14.3, metric_name: "SEER2", meps_level_cspf_equiv: 4.2, standard_version: "DOE SEER2 2023", is_projected: false, source: "DOE / AHRI" },
  { country_code: "US", country_name: "USA (North)", appliance_type: "AC", year: 2006, meps_level_national: 13.0, metric_name: "SEER", meps_level_cspf_equiv: 3.8, standard_version: "DOE 2006", is_projected: false, source: "DOE" },
  { country_code: "US", country_name: "USA (North)", appliance_type: "AC", year: 2023, meps_level_national: 13.4, metric_name: "SEER2", meps_level_cspf_equiv: 3.9, standard_version: "DOE SEER2 2023", is_projected: false, source: "DOE / AHRI" },
  { country_code: "EU", country_name: "European Union", appliance_type: "AC", year: 2013, meps_level_national: 4.6, metric_name: "EU SEER", meps_level_cspf_equiv: 4.4, standard_version: "EU 206/2012 Tier 1", is_projected: false, source: "European Commission" },
  { country_code: "EU", country_name: "European Union", appliance_type: "AC", year: 2014, meps_level_national: 5.4, metric_name: "EU SEER", meps_level_cspf_equiv: 5.1, standard_version: "EU 206/2012 Tier 2", is_projected: false, source: "European Commission" },
  { country_code: "JP", country_name: "Japan", appliance_type: "AC", year: 2010, meps_level_national: 5.2, metric_name: "APF", meps_level_cspf_equiv: 4.7, standard_version: "Top Runner 2010", is_projected: false, source: "METI Japan" },
  { country_code: "JP", country_name: "Japan", appliance_type: "AC", year: 2022, meps_level_national: 5.8, metric_name: "APF", meps_level_cspf_equiv: 5.2, standard_version: "Top Runner 2022", is_projected: false, source: "METI Japan" },
  { country_code: "JP", country_name: "Japan", appliance_type: "AC", year: 2027, meps_level_national: 6.2, metric_name: "APF", meps_level_cspf_equiv: 5.6, standard_version: "Top Runner 2027 (target)", is_projected: true, source: "METI Japan" },
  { country_code: "KR", country_name: "South Korea", appliance_type: "AC", year: 2020, meps_level_national: 3.2, metric_name: "CSPF", meps_level_cspf_equiv: 3.2, standard_version: "MOTIE 2020", is_projected: false, source: "KEMCO" },
  { country_code: "KR", country_name: "South Korea", appliance_type: "AC", year: 2024, meps_level_national: 3.5, metric_name: "CSPF", meps_level_cspf_equiv: 3.5, standard_version: "MOTIE 2024 (Grade 5)", is_projected: false, source: "KEMCO / Enviliance" },
  { country_code: "BR", country_name: "Brazil", appliance_type: "AC", year: 2020, meps_level_national: 2.6, metric_name: "EER", meps_level_cspf_equiv: 2.8, standard_version: "Portaria 234/2020 (Phase 1)", is_projected: false, source: "INMETRO" },
  { country_code: "BR", country_name: "Brazil", appliance_type: "AC", year: 2025, meps_level_national: 3.5, metric_name: "CSPF", meps_level_cspf_equiv: 3.5, standard_version: "Portaria 234/2020 (Phase 2, Class F)", is_projected: false, source: "INMETRO / CLASP" },
  { country_code: "SA", country_name: "Saudi Arabia", appliance_type: "AC", year: 2020, meps_level_national: 6.8, metric_name: "EER", meps_level_cspf_equiv: 2.8, standard_version: "SASO previous", is_projected: false, source: "SASO" },
  { country_code: "SA", country_name: "Saudi Arabia", appliance_type: "AC", year: 2025, meps_level_national: 7.2, metric_name: "EER", meps_level_cspf_equiv: 3.0, standard_version: "SASO 2663:2025", is_projected: false, source: "SASO / TUV Rheinland" },
  { country_code: "ZA", country_name: "South Africa", appliance_type: "AC", year: 2020, meps_level_national: 2.8, metric_name: "EER", meps_level_cspf_equiv: 3.0, standard_version: "SANS 941 (pre-SADC)", is_projected: false, source: "SABS" },
  { country_code: "ZA", country_name: "South Africa", appliance_type: "AC", year: 2024, meps_level_national: 3.2, metric_name: "CSPF", meps_level_cspf_equiv: 3.2, standard_version: "SADC HT 110:2023 Tier 1", is_projected: false, source: "SABS / U4E" },
  { country_code: "ZA", country_name: "South Africa", appliance_type: "AC", year: 2027, meps_level_national: 3.8, metric_name: "CSPF", meps_level_cspf_equiv: 3.8, standard_version: "SADC HT 110:2023 Tier 2", is_projected: true, source: "SABS / U4E" },
  { country_code: "AU", country_name: "Australia", appliance_type: "AC", year: 2010, meps_level_national: 2.9, metric_name: "AEER", meps_level_cspf_equiv: 3.1, standard_version: "GEMS 2010", is_projected: false, source: "GEMS Regulator" },
  { country_code: "AU", country_name: "Australia", appliance_type: "AC", year: 2019, meps_level_national: 3.1, metric_name: "AEER", meps_level_cspf_equiv: 3.3, standard_version: "GEMS 2019", is_projected: false, source: "GEMS Regulator" },
  { country_code: "SG", country_name: "Singapore", appliance_type: "AC", year: 2020, meps_level_national: 3.7, metric_name: "CSPF", meps_level_cspf_equiv: 3.7, standard_version: "NEA 2020", is_projected: false, source: "NEA Singapore" },
  { country_code: "SG", country_name: "Singapore", appliance_type: "AC", year: 2025, meps_level_national: 6.09, metric_name: "CSPF", meps_level_cspf_equiv: 6.09, standard_version: "NEA 2025", is_projected: false, source: "NEA Singapore / U4E" },
  { country_code: "NG", country_name: "Nigeria", appliance_type: "AC", year: 2024, meps_level_national: 3.0, metric_name: "NSEER", meps_level_cspf_equiv: 3.0, standard_version: "SON/NERC Baseline", is_projected: false, source: "U4E" },
  { country_code: "NG", country_name: "Nigeria", appliance_type: "AC", year: 2026, meps_level_national: 3.18, metric_name: "NSEER", meps_level_cspf_equiv: 3.18, standard_version: "Phase 1 (+6%)", is_projected: true, source: "U4E" },
  { country_code: "NG", country_name: "Nigeria", appliance_type: "AC", year: 2029, meps_level_national: 4.08, metric_name: "NSEER", meps_level_cspf_equiv: 4.08, standard_version: "Phase 2 (+36% cumulative)", is_projected: true, source: "U4E" },
  { country_code: "NG", country_name: "Nigeria", appliance_type: "AC", year: 2031, meps_level_national: 4.44, metric_name: "NSEER", meps_level_cspf_equiv: 4.44, standard_version: "Phase 3 (+48% cumulative)", is_projected: true, source: "U4E" },
  { country_code: "SADC", country_name: "SADC Region", appliance_type: "AC", year: 2024, meps_level_national: 3.2, metric_name: "CSPF", meps_level_cspf_equiv: 3.2, standard_version: "SADC HT 110:2023 Tier 1", is_projected: false, source: "U4E" },
  { country_code: "SADC", country_name: "SADC Region", appliance_type: "AC", year: 2027, meps_level_national: 3.8, metric_name: "CSPF", meps_level_cspf_equiv: 3.8, standard_version: "SADC HT 110:2023 Tier 2", is_projected: true, source: "U4E" },
  { country_code: "ASEAN", country_name: "ASEAN Region", appliance_type: "AC", year: 2020, meps_level_national: 3.08, metric_name: "CSPF", meps_level_cspf_equiv: 3.08, standard_version: "ASEAN SHINE Phase 1", is_projected: false, source: "ASEAN Centre for Energy" },
  { country_code: "ASEAN", country_name: "ASEAN Region", appliance_type: "AC", year: 2023, meps_level_national: 3.7, metric_name: "CSPF", meps_level_cspf_equiv: 3.7, standard_version: "ASEAN SHINE Phase 2", is_projected: false, source: "ASEAN Centre for Energy" },
  { country_code: "ASEAN", country_name: "ASEAN Region", appliance_type: "AC", year: 2030, meps_level_national: 6.09, metric_name: "CSPF", meps_level_cspf_equiv: 6.09, standard_version: "ASEAN SHINE Phase 4 (target)", is_projected: true, source: "ASEAN Centre for Energy" },
  { country_code: "U4E", country_name: "U4E Recommendation", appliance_type: "AC", year: 2021, meps_level_national: 5.1, metric_name: "ISO CSPF", meps_level_cspf_equiv: 5.1, standard_version: "U4E Model Regulation Minimum", is_projected: false, source: "UNEP U4E" },
  { country_code: "U4E", country_name: "U4E High Efficiency Target", appliance_type: "AC", year: 2021, meps_level_national: 6.5, metric_name: "ISO CSPF", meps_level_cspf_equiv: 6.5, standard_version: "U4E Model Regulation High Efficiency", is_projected: false, source: "UNEP U4E" },
  { country_code: "GCP", country_name: "Global Cooling Prize", appliance_type: "AC", year: 2021, meps_level_national: 8.75, metric_name: "ISO CSPF", meps_level_cspf_equiv: 8.75, standard_version: "Technology Potential (Net-Zero 2050)", is_projected: false, source: "Global Cooling Prize / RMI" },
  { country_code: "EAC", country_name: "EAC Region", appliance_type: "AC", year: 2024, meps_level_national: 3.0, metric_name: "CSPF", meps_level_cspf_equiv: 3.0, standard_version: "EAS 1213:2025 Tier 1 (aligned with SADC)", is_projected: false, source: "EAC / U4E" },
  { country_code: "EAC", country_name: "EAC Region", appliance_type: "AC", year: 2027, meps_level_national: 3.8, metric_name: "CSPF", meps_level_cspf_equiv: 3.8, standard_version: "EAS 1213:2025 Tier 2 (aligned with SADC)", is_projected: true, source: "EAC / U4E" },
  { country_code: "ECOWAS", country_name: "ECOWAS Region", appliance_type: "AC", year: 2019, meps_level_national: 2.8, metric_name: "CSPF", meps_level_cspf_equiv: 2.8, standard_version: "Ghana L.I. 2458 (regional baseline)", is_projected: false, source: "Ghana Energy Commission / CLASP" },
  { country_code: "ECOWAS", country_name: "ECOWAS Region", appliance_type: "AC", year: 2026, meps_level_national: 3.2, metric_name: "CSPF", meps_level_cspf_equiv: 3.2, standard_version: "ECREEE Regional Standard (proposed)", is_projected: true, source: "ECREEE / U4E" },
  // ---- Refrigerator Timeline (harmonized to EEI: lower = more stringent) ----
  // Reference: 400L frost-free combo at 24°C, SAE ≈ 274 kWh/yr
  // EEI = (MEPS max AEC / 274) × 100
  { country_code: "EU", country_name: "European Union", appliance_type: "Refrigerator", year: 2010, meps_level_national: 130, metric_name: "EEI", meps_level_cspf_equiv: 130, standard_version: "Reg 643/2009 Class A", is_projected: false, source: "European Commission" },
  { country_code: "EU", country_name: "European Union", appliance_type: "Refrigerator", year: 2012, meps_level_national: 113, metric_name: "EEI", meps_level_cspf_equiv: 113, standard_version: "Reg 643/2009 Tier 2 (Class A+)", is_projected: false, source: "European Commission" },
  { country_code: "EU", country_name: "European Union", appliance_type: "Refrigerator", year: 2021, meps_level_national: 125, metric_name: "EEI", meps_level_cspf_equiv: 125, standard_version: "Reg 2019/2016 Class F (rescaled)", is_projected: false, source: "European Commission" },
  { country_code: "EU", country_name: "European Union", appliance_type: "Refrigerator", year: 2026, meps_level_national: 100, metric_name: "EEI", meps_level_cspf_equiv: 100, standard_version: "Proposed Class E update", is_projected: true, source: "European Commission" },
  { country_code: "CN", country_name: "China", appliance_type: "Refrigerator", year: 2016, meps_level_national: 130, metric_name: "EEI", meps_level_cspf_equiv: 130, standard_version: "GB 12021.2-2015 Grade 5", is_projected: false, source: "SAMR/CNIS" },
  { country_code: "CN", country_name: "China", appliance_type: "Refrigerator", year: 2020, meps_level_national: 115, metric_name: "EEI", meps_level_cspf_equiv: 115, standard_version: "GB 12021.2-2015 (revised thresholds)", is_projected: false, source: "SAMR/CNIS" },
  { country_code: "CN", country_name: "China", appliance_type: "Refrigerator", year: 2026, meps_level_national: 90, metric_name: "EEI", meps_level_cspf_equiv: 90, standard_version: "GB 12021.2-2025 Grade 5 (TEEI 90%)", is_projected: false, source: "SAMR/CNIS" },
  { country_code: "IN", country_name: "India", appliance_type: "Refrigerator", year: 2018, meps_level_national: 140, metric_name: "EEI", meps_level_cspf_equiv: 140, standard_version: "BEE 1-Star (IS 15750)", is_projected: false, source: "BEE India" },
  { country_code: "IN", country_name: "India", appliance_type: "Refrigerator", year: 2022, meps_level_national: 120, metric_name: "EEI", meps_level_cspf_equiv: 120, standard_version: "BEE revised thresholds", is_projected: false, source: "BEE India" },
  { country_code: "IN", country_name: "India", appliance_type: "Refrigerator", year: 2026, meps_level_national: 102, metric_name: "EEI", meps_level_cspf_equiv: 102, standard_version: "BEE mandatory MEPS Jan 2026", is_projected: false, source: "BEE India" },
  { country_code: "US", country_name: "USA", appliance_type: "Refrigerator", year: 2001, meps_level_national: 225, metric_name: "EEI", meps_level_cspf_equiv: 225, standard_version: "DOE 10 CFR 430 (2001)", is_projected: false, source: "DOE" },
  { country_code: "US", country_name: "USA", appliance_type: "Refrigerator", year: 2014, meps_level_national: 190, metric_name: "EEI", meps_level_cspf_equiv: 190, standard_version: "DOE revised (2014)", is_projected: false, source: "DOE" },
  { country_code: "US", country_name: "USA", appliance_type: "Refrigerator", year: 2025, meps_level_national: 171, metric_name: "EEI", meps_level_cspf_equiv: 171, standard_version: "DOE proposed update", is_projected: true, source: "DOE / ENERGY STAR" },
  { country_code: "JP", country_name: "Japan", appliance_type: "Refrigerator", year: 2006, meps_level_national: 110, metric_name: "EEI", meps_level_cspf_equiv: 110, standard_version: "Top Runner 2006", is_projected: false, source: "METI Japan" },
  { country_code: "JP", country_name: "Japan", appliance_type: "Refrigerator", year: 2015, meps_level_national: 97, metric_name: "EEI", meps_level_cspf_equiv: 97, standard_version: "Top Runner 2015", is_projected: false, source: "METI Japan" },
  { country_code: "JP", country_name: "Japan", appliance_type: "Refrigerator", year: 2022, meps_level_national: 93, metric_name: "EEI", meps_level_cspf_equiv: 93, standard_version: "Top Runner 2022", is_projected: false, source: "METI Japan" },
  { country_code: "JP", country_name: "Japan", appliance_type: "Refrigerator", year: 2027, meps_level_national: 85, metric_name: "EEI", meps_level_cspf_equiv: 85, standard_version: "Top Runner 2027 (target)", is_projected: true, source: "METI Japan" },
  { country_code: "KR", country_name: "South Korea", appliance_type: "Refrigerator", year: 2015, meps_level_national: 115, metric_name: "EEI", meps_level_cspf_equiv: 115, standard_version: "KEMCO 2015", is_projected: false, source: "KEMCO" },
  { country_code: "KR", country_name: "South Korea", appliance_type: "Refrigerator", year: 2020, meps_level_national: 80, metric_name: "EEI", meps_level_cspf_equiv: 80, standard_version: "KEMCO 2020", is_projected: false, source: "KEMCO" },
  { country_code: "KR", country_name: "South Korea", appliance_type: "Refrigerator", year: 2025, meps_level_national: 65, metric_name: "EEI", meps_level_cspf_equiv: 65, standard_version: "KEMCO 2025 (target)", is_projected: true, source: "KEMCO" },
  { country_code: "BR", country_name: "Brazil", appliance_type: "Refrigerator", year: 2012, meps_level_national: 130, metric_name: "EEI", meps_level_cspf_equiv: 130, standard_version: "PROCEL/INMETRO", is_projected: false, source: "INMETRO" },
  { country_code: "BR", country_name: "Brazil", appliance_type: "Refrigerator", year: 2020, meps_level_national: 109, metric_name: "EEI", meps_level_cspf_equiv: 109, standard_version: "PROCEL updated", is_projected: false, source: "INMETRO" },
  { country_code: "BR", country_name: "Brazil", appliance_type: "Refrigerator", year: 2025, meps_level_national: 101, metric_name: "EEI", meps_level_cspf_equiv: 101, standard_version: "PROCEL 2025", is_projected: false, source: "INMETRO / CLASP" },
  { country_code: "AU", country_name: "Australia", appliance_type: "Refrigerator", year: 2010, meps_level_national: 140, metric_name: "EEI", meps_level_cspf_equiv: 140, standard_version: "GEMS 2010", is_projected: false, source: "GEMS Regulator" },
  { country_code: "AU", country_name: "Australia", appliance_type: "Refrigerator", year: 2019, meps_level_national: 120, metric_name: "EEI", meps_level_cspf_equiv: 120, standard_version: "GEMS 2019", is_projected: false, source: "GEMS Regulator" },
  { country_code: "AU", country_name: "Australia", appliance_type: "Refrigerator", year: 2024, meps_level_national: 109, metric_name: "EEI", meps_level_cspf_equiv: 109, standard_version: "GEMS 2024 / AS/NZS 4474.2", is_projected: false, source: "GEMS Regulator" },
  { country_code: "SG", country_name: "Singapore", appliance_type: "Refrigerator", year: 2015, meps_level_national: 128, metric_name: "EEI", meps_level_cspf_equiv: 128, standard_version: "NEA 2015", is_projected: false, source: "NEA Singapore" },
  { country_code: "SG", country_name: "Singapore", appliance_type: "Refrigerator", year: 2020, meps_level_national: 100, metric_name: "EEI", meps_level_cspf_equiv: 100, standard_version: "NEA 2020", is_projected: false, source: "NEA Singapore" },
  { country_code: "SG", country_name: "Singapore", appliance_type: "Refrigerator", year: 2025, meps_level_national: 80, metric_name: "EEI", meps_level_cspf_equiv: 80, standard_version: "NEA 2025", is_projected: false, source: "NEA Singapore / U4E" },
  { country_code: "SADC", country_name: "SADC Region", appliance_type: "Refrigerator", year: 2024, meps_level_national: 100, metric_name: "EEI", meps_level_cspf_equiv: 100, standard_version: "SADC HT 111:2023 Tier 1", is_projected: false, source: "U4E" },
  { country_code: "SADC", country_name: "SADC Region", appliance_type: "Refrigerator", year: 2027, meps_level_national: 80, metric_name: "EEI", meps_level_cspf_equiv: 80, standard_version: "SADC HT 111:2023 Tier 2", is_projected: true, source: "U4E" },
  { country_code: "EAC", country_name: "EAC Region", appliance_type: "Refrigerator", year: 2024, meps_level_national: 100, metric_name: "EEI", meps_level_cspf_equiv: 100, standard_version: "EAS 1214:2025 Tier 1", is_projected: false, source: "EAC / U4E" },
  { country_code: "EAC", country_name: "EAC Region", appliance_type: "Refrigerator", year: 2027, meps_level_national: 80, metric_name: "EEI", meps_level_cspf_equiv: 80, standard_version: "EAS 1214:2025 Tier 2", is_projected: true, source: "EAC / U4E" },
  { country_code: "ECOWAS", country_name: "ECOWAS Region", appliance_type: "Refrigerator", year: 2019, meps_level_national: 145, metric_name: "EEI", meps_level_cspf_equiv: 145, standard_version: "Ghana ECOFRIDGES baseline", is_projected: false, source: "Ghana Energy Commission" },
  { country_code: "ECOWAS", country_name: "ECOWAS Region", appliance_type: "Refrigerator", year: 2026, meps_level_national: 109, metric_name: "EEI", meps_level_cspf_equiv: 109, standard_version: "ECREEE regional proposed", is_projected: true, source: "ECREEE / U4E" },
  { country_code: "U4E_FRIDGE", country_name: "U4E Baseline", appliance_type: "Refrigerator", year: 2021, meps_level_national: 102, metric_name: "EEI", meps_level_cspf_equiv: 102, standard_version: "U4E Model Regulation Baseline", is_projected: false, source: "UNEP U4E" },
  { country_code: "U4E_FRIDGE_HE", country_name: "U4E High Efficiency", appliance_type: "Refrigerator", year: 2021, meps_level_national: 50, metric_name: "EEI", meps_level_cspf_equiv: 50, standard_version: "U4E Model Regulation High Efficiency", is_projected: false, source: "UNEP U4E" }
];

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Filter MEPS levels by appliance type */
export function getMepsLevelsByAppliance(type: 'AC' | 'Refrigerator' | 'Fan'): MepsLevel[] {
  return MEPS_LEVELS.filter(l => l.appliance_type === type);
}

/** Filter timeline by appliance type */
export function getTimelineByAppliance(type: string): MepsTimelineEntry[] {
  return MEPS_TIMELINE.filter(t => t.appliance_type === type);
}

/** Get timeline for a specific country */
export function getTimelineByCountry(countryCode: string): MepsTimelineEntry[] {
  return MEPS_TIMELINE.filter(t => t.country_code === countryCode);
}

/** Get AC MEPS levels sorted by CSPF equivalent (descending = most stringent first) */
export function getAcMepsRanked(): MepsLevel[] {
  return getMepsLevelsByAppliance('AC')
    .filter(l => l.cspf_equivalent !== null)
    .sort((a, b) => (b.cspf_equivalent ?? 0) - (a.cspf_equivalent ?? 0));
}

/** Get unique country codes present in the data */
export function getCountryCodes(): string[] {
  return Array.from(new Set(MEPS_LEVELS.map(l => l.country_code)));
}

/** Get all unique appliance types */
export function getApplianceTypes(): string[] {
  return Array.from(new Set(MEPS_LEVELS.map(l => l.appliance_type)));
}

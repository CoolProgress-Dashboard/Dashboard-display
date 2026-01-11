# Dashboard Changes Documentation
**Author:** MPG
**Last Updated:** January 2025

---

## Overview
This document tracks all modifications made to the Cooling Dashboard, including the new Emissions view, Access & Vulnerability view improvements, and general UI/UX enhancements.

---

## Table of Contents
1. [Emissions View (New)](#emissions-view-new)
2. [Access & Vulnerability View Improvements](#access--vulnerability-view-improvements)
3. [Chart Fixes and Enhancements](#chart-fixes-and-enhancements)
4. [Map Fixes](#map-fixes)
5. [UI/UX Improvements](#uiux-improvements)
6. [Technical Fixes](#technical-fixes)

---

## Emissions View (New)

### Overview
New emissions tracking view displaying CO2 emissions and energy consumption data from cooling appliances worldwide.

### Data Sources
Two distinct data sources available via toggle:

| Source | Description | Scenarios | Appliances |
|--------|-------------|-----------|------------|
| **CLASP (Indirect)** | Indirect emissions only (energy-related CO2) | BAU, GB, NZH, BAT | Air Conditioning, Ceiling and Portable Fans, Refrigerator-Freezers |
| **HEAT Modelling** | Direct (refrigerant) and indirect (energy) emissions (*Developed in collaboration with GIZ*) | BAU, KIP | Split Residential Air Conditioners, Domestic Refrigeration |

### Scenario Definitions

**CLASP Scenarios:**
- **BAU** - Business as Usual
- **GB** - Green Buildings
- **NZH** - Net Zero Homes
- **BAT** - Best Available Technology

**HEAT Scenarios:**
- **BAU** - Business as Usual
- **KIP** - Kigali Implementation Plan

### KPI Cards
1. **Total Emissions** - "Mt CO2 equivalent"
2. **Countries Covered** - "With emissions data"
3. **Avg per Country** - "Mt CO2 equivalent"
4. **Data Points** - "Records in selection"

### Features
- **Data Source Toggle**: Switch between CLASP (Indirect) and HEAT Modelling data
- **Year Slider**: 2020-2045 range for projections
- **Scenario Selection**: Dropdown with context-aware scenarios based on data source
- **Region Filter**: Filter by geographic region
- **Appliance Toggles**: Multi-select appliances to include
- **Emission Type Filter**: Total, Direct, or Indirect (HEAT Modelling only)

### Interactive Map
- Color-coded choropleth by emissions intensity
- 7-tier gradient scale from light to dark blue
- Hover tooltips showing country details
- Click to select country for detailed view

### Charts
1. **Regional Distribution** - Bar chart showing emissions by region
2. **Time Trend** - Line chart showing emissions over time (2020-2050)
3. **Appliance Breakdown** - Doughnut chart by appliance category
4. **Scenario Comparison** - Bar chart comparing different scenarios

### Technical Implementation

**New TypeScript Types:**
```typescript
export type ClaspEnergyRecord = {
  id: number;
  country_code: string;
  country_name: string;
  year: number;
  appliance: string;
  bau_co2_mt?: number | null;
  gb_co2_mt?: number | null;
  nzh_co2_mt?: number | null;
  bat_co2_mt?: number | null;
  // ... additional fields
};

export type SubcoolRecord = {
  id: number;
  scenario_name: string; // "BAU", "KIP"
  country_code: string;
  subsector: string;
  year: number;
  indirect_emission_mt?: number | null;
  direct_emission_mt?: number | null;
  // ... additional fields
};
```

**Data Fetching:**
```javascript
// CLASP Indirect Emissions (~50,000 records)
fetchTable<ClaspEnergyRecord>(
    url, key,
    'clasp_energy_consumption',
    'id,country_code,country_name,year,appliance,bau_co2_mt,gb_co2_mt,...',
    '',
    50000
)

// HEAT Modelling (~100,000 records)
fetchTable<SubcoolRecord>(
    url, key,
    'global_model_subcool',
    'id,scenario_name,country_code,subsector,year,indirect_emission_mt,direct_emission_mt,...',
    '',
    100000
)
```

### Country Detail Panel (New)
When a country is clicked on the map, a detailed panel displays:
- Country name and region
- Current data source and scenario
- Current year emissions total
- Trend indicator (change over time)

**Country-Specific Charts:**
1. **Emissions Over Time (Stacked Area)** - Disaggregated chart showing:
   - **For CLASP**: Stacked areas by appliance type (AC in blue, Fans in green, Refrigerators in orange)
   - **For HEAT**: Stacked areas by emission type (Direct/Refrigerants in red, Indirect/Energy in blue)
   - Legend showing each category
   - Interactive tooltips with breakdown and total
   - Dynamic title based on data source

2. **Current Year Breakdown** - Doughnut chart showing:
   - For CLASP: AC, Fans, Refrigerators distribution
   - For HEAT: Direct vs Indirect emissions distribution

Charts automatically update when filters change (year, scenario, data source, emission type).

### Map Fix Applied
**Problem:** Countries were not displaying on the emissions map.

**Solution:** Fixed country code extraction in map update function:
```javascript
// Before (broken):
const code = d.properties?.iso_a3 || d.id;

// After (fixed):
const code = d3.select(this).attr('data-code');
```

Also fixed CSS selector from `path.country` to `.emissions-path`.

### Tooltip Enhancement
Updated hover tooltips to show data from the correct source:
- CLASP: Shows total and breakdown by appliance type
- HEAT: Shows emission type (Direct/Indirect/Total) and breakdown by subsector

---

## Access & Vulnerability View Improvements

### Data Source Integration
- Integrated SEforALL Chilling Prospects 2025 data
- Source link: https://www.seforall.org/data-stories/chilling-prospects-2025
- Added SEforALL logo to source attribution

### "About This Data" Info Panel
- Added explanatory yellow info panel at the top of the Access view
- Panel explains:
  - Data covers 77 countries in the Global South
  - Definition of "at risk" populations (thermal comfort, food preservation, medical storage)
  - Risk level methodology
- **Location:** Moved above KPI cards for better visibility

### Updated Headlines and Labels
| Original | Updated |
|----------|---------|
| Generic headline | "Cooling Access Gap: Who's at Risk?" |
| "Impact Level" filter | "Risk Level" filter |
| "Population Category" filter | "Income Group" filter |
| Generic KPI labels | More descriptive labels with sublabels |

### KPI Cards Updated
1. **People at Risk** - "Without adequate cooling access"
2. **High-Risk Countries** - "Facing severe cooling gaps"
3. **Countries Analyzed** - "In current selection"
4. **Regions Covered** - "Geographic scope"

### Filter Tooltips Added
- High risk: "1+ billion lacking crucial cooling"
- Medium risk: "Limited sustainable options"
- Low risk: "Better access to cooling"
- Rural Poor: "309M at high risk globally"
- Urban Poor: "695M at high risk globally"
- Lower-Middle Income: "Limited affordable options"
- Middle-Income: "Better access to solutions"

---

## Chart Fixes and Enhancements

### Regional Distribution Chart (Top-Left)
**Problem:** Long region names were cut off on smaller screens.

**Solution:** Added abbreviations for display:
| Full Name | Abbreviation |
|-----------|--------------|
| Asia and Middle East | Asia & ME |
| Latin America and the Caribbean | LAC |
| Sub-Saharan Africa | SSA |
| North Africa | N. Africa |
| Pacific | Pacific |

- Tooltip still shows full region names on hover
- Removed label rotation for horizontal display

### All Four Bottom Charts
**Problem:** "Billions" axis label was being cut off.

**Solution:** Updated grid and axis settings:
```javascript
grid: { left: '12%', right: '4%', bottom: '18%', top: '12%', containLabel: false }
yAxis: {
    name: 'Billions',
    nameLocation: 'middle',
    nameGap: 35,
    nameTextStyle: { color: '#475569', fontSize: 11 }
}
```

### Category Doughnut Chart
- Improved legend visibility (fontSize: 11px)
- Better item spacing (itemGap: 8)
- Adjusted pie radius for more legend room

### Country Detail Charts (Sidebar)
**Problem:** Charts didn't expand on wider screens.

**Solution:**
1. Added module-level variables to store chart instances:
   - `accessCountryStackedChart`
   - `accessCountryPieChart`
2. Charts properly disposed before recreation
3. Added to window resize handler for responsive behavior

**Title Update:** Changed from "Population by Category Over Time" to "Population at Risk by Category Over Time"

---

## Map Fixes

### Map Duplication Issue
**Problem:** Map was repeating/duplicating on hot reload during development.

**Solution:** Added SVG cleanup before initialization:
```javascript
// Clear any existing SVG to prevent duplicates on hot reload
d3.select('#access-map-container').selectAll('svg').remove();
```

---

## UI/UX Improvements

### Filter Functionality Fixes
1. **Population Category Toggles:** Fixed HTML attribute mismatch
   - Changed `data-pop` to `data-category` in HTML

2. **Impact Level Toggles:** Fixed event handler
   - Changed `btn.dataset.level` to `btn.dataset.impact` in JavaScript

### Navigation Fix
- Added null checking to `switchView` function
- Added console logging for debugging

### Font Size Improvements (Country Detail Charts)
- Axis labels: 8px → 11px
- Tooltip text: 12px
- Pie chart labels: 8px → 11px with fontWeight 500

---

## Technical Fixes

### Files Modified

| File | Changes |
|------|---------|
| `src/routes/(protected)/dashboard/+page.svelte` | Main dashboard component - UI, charts, event handlers, Emissions view |
| `src/lib/services/dashboard-data.ts` | Data fetching, helper functions, CLASP and HEAT data loading |
| `src/lib/services/dashboard-types.ts` | TypeScript type definitions (ClaspEnergyRecord, SubcoolRecord, RegionRecord, EmissionsViewFilters) |
| `src/lib/styles/dashboard.css` | Styling (minimal changes) |

### Key Code Patterns
- **ECharts** for chart visualizations
- **D3.js** with TopoJSON for interactive maps
- **Supabase REST API** for data fetching with pagination
- **viewMeta object** for view-specific metadata

### Data Fetching
Access data fetches all records with pagination:
```javascript
fetchTable<AccessRecord>(
    url, key,
    'access_to_cooling_seeforall',
    'id,country_code,country_name,region,impact_category,population_category,impact_level,gender_type,year,population_without_cooling',
    '',
    5000 // Fetch all access records (~3,696 records)
)
```

---

## Future Considerations
- Consider adding more detailed country breakdown panels
- Potential for additional chart types (e.g., comparison views)
- Mobile responsiveness could be further improved
- Consider caching data for faster subsequent loads

---

## Changelog Summary

| Date | Change |
|------|--------|
| Jan 2025 | **NEW: Emissions View** - Added complete emissions tracking page |
| Jan 2025 | Added CLASP data integration - indirect emissions only (AC, Fans, Refrigerators) |
| Jan 2025 | Added HEAT Modelling data integration (GIZ collaboration) |
| Jan 2025 | Added emissions country detail panel with charts |
| Jan 2025 | Enhanced emissions map hover tooltips |
| Jan 2025 | Fixed emissions map country display issue |
| Jan 2025 | Added "About This Data" info panel |
| Jan 2025 | Updated headlines and filter labels for clarity |
| Jan 2025 | Fixed population category and impact level filters |
| Jan 2025 | Added country detail charts with time-series data |
| Jan 2025 | Fixed map duplication on hot reload |
| Jan 2025 | Made chart axis labels fully visible |
| Jan 2025 | Added region name abbreviations |
| Jan 2025 | Fixed country detail chart responsiveness |
| Jan 2025 | Updated source attribution to SEforALL |

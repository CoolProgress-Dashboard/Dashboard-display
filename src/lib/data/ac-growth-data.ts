// ac-growth-data.ts - Global AC Stock Growth Projection
// Sources:
//   - IEA Global air conditioner stock 1990-2050: https://www.iea.org/data-and-statistics/charts/global-air-conditioner-stock-1990-2050
//   - CCC The Challenge: https://www.cleancoolingcollaborative.org/the-challenge/
//   - IEA Future of Cooling (2018): https://www.iea.org/reports/the-future-of-cooling

export interface ACStockDataPoint {
  year: number;
  stockMillions: number;
  isProjected: boolean;
  source: string;
}

export interface ACMilestone {
  year: number;
  label: string;
  description: string;
}

// Global AC stock in millions of units
// 1990-2020: historical data from IEA
// 2025-2050: IEA baseline scenario projections and CCC data
export const acStockData: ACStockDataPoint[] = [
  {
    year: 1990,
    stockMillions: 573,
    isProjected: false,
    source: 'CCC / IEA: 573.49M units in 1990',
  },
  {
    year: 1995,
    stockMillions: 700,
    isProjected: false,
    source: 'IEA Future of Cooling, interpolated',
  },
  {
    year: 2000,
    stockMillions: 850,
    isProjected: false,
    source: 'IEA Future of Cooling',
  },
  {
    year: 2005,
    stockMillions: 1050,
    isProjected: false,
    source: 'IEA Future of Cooling, interpolated',
  },
  {
    year: 2010,
    stockMillions: 1200,
    isProjected: false,
    source: 'IEA Future of Cooling',
  },
  {
    year: 2015,
    stockMillions: 1500,
    isProjected: false,
    source: 'IEA Future of Cooling',
  },
  {
    year: 2020,
    stockMillions: 2000,
    isProjected: false,
    source: 'IEA: "1.6 billion" circa 2018, ~2B by 2020',
  },
  {
    year: 2024,
    stockMillions: 3099,
    isProjected: false,
    source: 'CCC: 3,098.96M units in 2024',
  },
  {
    year: 2025,
    stockMillions: 3300,
    isProjected: true,
    source: 'IEA baseline scenario, interpolated from CCC',
  },
  {
    year: 2030,
    stockMillions: 4000,
    isProjected: true,
    source: 'IEA baseline scenario',
  },
  {
    year: 2035,
    stockMillions: 4500,
    isProjected: true,
    source: 'IEA baseline scenario, interpolated',
  },
  {
    year: 2040,
    stockMillions: 5000,
    isProjected: true,
    source: 'IEA baseline scenario',
  },
  {
    year: 2045,
    stockMillions: 5800,
    isProjected: true,
    source: 'IEA baseline scenario, interpolated',
  },
  {
    year: 2050,
    stockMillions: 6542,
    isProjected: true,
    source: 'CCC: 6,542.38M units projected for 2050',
  },
];

// Key milestones in the cooling sector timeline
export const acMilestones: ACMilestone[] = [
  {
    year: 1987,
    label: 'Montreal Protocol',
    description:
      'International treaty to phase out ozone-depleting substances (CFCs, HCFCs) used as refrigerants. Ratified by 198 parties.',
  },
  {
    year: 2016,
    label: 'Kigali Amendment',
    description:
      'Amendment to the Montreal Protocol to phase down hydrofluorocarbons (HFCs) by 80-85% by 2047. Could avoid 0.5 degrees C warming by 2100.',
  },
  {
    year: 2018,
    label: 'IEA Future of Cooling',
    description:
      'Landmark IEA report projecting global AC stock to reach 5.6 billion by 2050, warning cooling energy demand could triple without action.',
  },
  {
    year: 2023,
    label: 'COP28 Global Cooling Pledge',
    description:
      '66 nations signed the Global Cooling Pledge at COP28 Dubai, committing to reduce cooling-related emissions 68% by 2050 and raise AC efficiency 50%.',
  },
  {
    year: 2024,
    label: '3 Billion ACs',
    description:
      'Global AC stock surpassed 3 billion units. CCC reports 3,099 million units installed worldwide.',
  },
];

// Summary statistics
export const acGrowthSummary = {
  totalStockToday: '3.1 billion',
  totalStock2050: '6.5 billion',
  growthFactor: '2.1x from today to 2050',
  growthFrom1990: '11.4x from 1990 to 2050',
  newUnitsNeeded: '~3.4 billion additional units by 2050',
  acsSoldPerSecond: 10,
  householdOwnership2050: '2/3 of global households',
  topThreeMarkets: 'China, India, and Indonesia (50% of 2050 total)',
};

// peak-load-data.ts - Share of Cooling in Peak Electricity Load by Country
// Sources:
//   - IEA Future of Cooling (2018): https://www.iea.org/reports/the-future-of-cooling
//   - IEA chart: https://www.iea.org/data-and-statistics/charts/share-of-cooling-in-electricity-system-peak-loads-in-selected-countries-region-baseline-and-cooling-scenario
//   - CCC The Challenge: https://www.cleancoolingcollaborative.org/the-challenge/
//   - IEA MENA electricity: https://www.iea.org/news/electricity-demand-is-surging-across-the-middle-east-and-north-africa

export interface PeakLoadEntry {
  country: string;
  countryCode: string;
  baselineYear: number;
  baselinePercent: number;
  projectedYear: number;
  projectedPercent: number;
  source: string;
}

// Share of cooling in electricity system peak loads
// Baseline values from IEA (2016-2018), projections from IEA/CCC (2050)
export const peakLoadData: PeakLoadEntry[] = [
  {
    country: 'Saudi Arabia',
    countryCode: 'SA',
    baselineYear: 2016,
    baselinePercent: 50,
    projectedYear: 2050,
    projectedPercent: 60,
    // SA: "Air conditioning accounts for a staggering 50-70% of electricity demand"
    source: 'IEA Future of Cooling; PMC/ASME research',
  },
  {
    country: 'India',
    countryCode: 'IN',
    baselineYear: 2016,
    baselinePercent: 10,
    projectedYear: 2050,
    projectedPercent: 45,
    // IEA: "The share jumps from just 10% today to 45% in 2050"
    source: 'IEA Future of Cooling',
  },
  {
    country: 'Indonesia',
    countryCode: 'ID',
    baselineYear: 2016,
    baselinePercent: 7,
    projectedYear: 2050,
    projectedPercent: 41,
    // CCC: Indonesia 40.7% by 2050
    source: 'CCC The Challenge; IEA',
  },
  {
    country: 'China',
    countryCode: 'CN',
    baselineYear: 2017,
    baselinePercent: 16,
    projectedYear: 2050,
    projectedPercent: 30,
    // IEA: "around 16% of peak electricity load in 2017"
    source: 'IEA Future of Cooling',
  },
  {
    country: 'Brazil',
    countryCode: 'BR',
    baselineYear: 2016,
    baselinePercent: 12,
    projectedYear: 2050,
    projectedPercent: 31,
    // CCC: Brazil 30.8% by 2050
    source: 'CCC The Challenge; IEA',
  },
  {
    country: 'USA',
    countryCode: 'US',
    baselineYear: 2016,
    baselinePercent: 23,
    projectedYear: 2050,
    projectedPercent: 28,
    // IEA: high current levels with moderate growth due to existing saturation
    source: 'IEA Future of Cooling',
  },
  {
    country: 'Mexico',
    countryCode: 'MX',
    baselineYear: 2016,
    baselinePercent: 10,
    projectedYear: 2050,
    projectedPercent: 24,
    // CCC: Mexico 24.3% by 2050
    source: 'CCC The Challenge; IEA',
  },
  {
    country: 'Japan',
    countryCode: 'JP',
    baselineYear: 2016,
    baselinePercent: 14,
    projectedYear: 2050,
    projectedPercent: 18,
    // High efficiency but saturated market; IEA global avg 14% baseline
    source: 'IEA Future of Cooling',
  },
  {
    country: 'Nigeria',
    countryCode: 'NG',
    baselineYear: 2016,
    baselinePercent: 3,
    projectedYear: 2050,
    projectedPercent: 22,
    // Very low base but rapid expected growth
    source: 'IEA Future of Cooling; SE4ALL',
  },
  {
    country: 'Middle East (avg)',
    countryCode: 'ME',
    baselineYear: 2016,
    baselinePercent: 40,
    projectedYear: 2050,
    projectedPercent: 50,
    // IEA MENA: "around 40% of projected demand increase from cooling"
    source: 'IEA Future of Cooling; IEA MENA analysis',
  },
];

// Global average baseline
export const globalBaselineAvg = {
  year: 2016,
  percent: 14,
  source: 'IEA: averaged across all countries, space cooling accounted for 14% of peak demand in 2016',
};

// Sorted helpers
export const peakLoadByBaseline = [...peakLoadData].sort(
  (a, b) => b.baselinePercent - a.baselinePercent
);

export const peakLoadByProjected = [...peakLoadData].sort(
  (a, b) => b.projectedPercent - a.projectedPercent
);

export const peakLoadByGrowth = [...peakLoadData].sort(
  (a, b) =>
    b.projectedPercent - b.baselinePercent - (a.projectedPercent - a.baselinePercent)
);

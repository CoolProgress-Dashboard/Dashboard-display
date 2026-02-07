// hero-stats.ts - CCC Impact Numbers for Hero Section
// Sources:
//   - Clean Cooling Collaborative: https://www.cleancoolingcollaborative.org/the-challenge/
//   - IEA Future of Cooling (2018): https://www.iea.org/reports/the-future-of-cooling
//   - SE4ALL Chilling Prospects (2025): https://www.seforall.org/data-stories/chilling-prospects-2025

export interface HeroStat {
  id: string;
  value: number;
  unit: string;
  label: string;
  description: string;
  source: string;
  sourceUrl: string;
}

export const heroStats: HeroStat[] = [
  {
    id: 'ac-per-second',
    value: 10,
    unit: '/sec',
    label: 'ACs sold every second',
    description:
      'Ten air conditioners are sold every second globally, projected to continue for the next 30 years as the world adds over 3 billion new units.',
    source: 'IEA Future of Cooling, 2018; CCC',
    sourceUrl: 'https://www.iea.org/reports/the-future-of-cooling',
  },
  {
    id: 'ghg-share',
    value: 7,
    unit: '%',
    label: 'of global GHG emissions',
    description:
      'Cooling equipment, most notably air conditioning, is responsible for more than 7% of the world\'s greenhouse gas emissions. Without intervention, this could roughly double by 2050.',
    source: 'Clean Cooling Collaborative',
    sourceUrl: 'https://www.cleancoolingcollaborative.org/the-challenge/',
  },
  {
    id: 'people-at-risk',
    value: 1.2,
    unit: 'billion',
    label: 'people at high risk from heat',
    description:
      'More than 1.2 billion people worldwide face high risk from heat-related threats to their lives and well-being due to lack of cooling access.',
    source: 'SE4ALL Chilling Prospects, 2025',
    sourceUrl: 'https://www.seforall.org/data-stories/chilling-prospects-2025',
  },
  {
    id: 'co2-savings',
    value: 100,
    unit: 'Gt CO2e',
    label: 'potential cumulative savings',
    description:
      'Clean, efficient cooling technologies can deliver up to 100 gigatons of cumulative CO2-equivalent emissions savings by 2050.',
    source: 'Clean Cooling Collaborative',
    sourceUrl: 'https://www.cleancoolingcollaborative.org/',
  },
  {
    id: 'electricity-share',
    value: 10,
    unit: '%',
    label: 'of global electricity use',
    description:
      'Air conditioners and electric fans currently account for about 10% of all global electricity consumption. Within buildings, cooling represents nearly 20% of total electricity use.',
    source: 'IEA Future of Cooling, 2018',
    sourceUrl: 'https://www.iea.org/reports/the-future-of-cooling',
  },
  {
    id: 'demand-tripling',
    value: 3,
    unit: 'x',
    label: 'cooling demand increase by 2050',
    description:
      'Without efficiency action, global energy demand for space cooling will more than triple by 2050, consuming as much electricity as all of China and India combined today.',
    source: 'IEA Future of Cooling, 2018',
    sourceUrl: 'https://www.iea.org/reports/the-future-of-cooling',
  },
  {
    id: 'heat-deaths',
    value: 12000,
    unit: '/year',
    label: 'heat wave deaths annually',
    description:
      'Heat waves kill an average of 12,000 people every year. Heat-related mortality increased 91% in Southeast Asia between 2004 and 2018.',
    source: 'Clean Cooling Collaborative',
    sourceUrl: 'https://www.cleancoolingcollaborative.org/the-challenge/',
  },
  {
    id: 'food-deaths',
    value: 420000,
    unit: '/year',
    label: 'deaths from spoiled food',
    description:
      'An estimated 420,000 people die each year after consuming food spoiled due to inadequate cold chain and lack of cooling infrastructure.',
    source: 'Clean Cooling Collaborative',
    sourceUrl: 'https://www.cleancoolingcollaborative.org/the-challenge/',
  },
];

// Formatted display helpers
export const getStatById = (id: string): HeroStat | undefined =>
  heroStats.find((s) => s.id === id);

export const formatStatValue = (stat: HeroStat): string => {
  if (stat.value >= 1000) {
    return stat.value.toLocaleString();
  }
  return String(stat.value);
};

// partner-data.ts - Partner Ecosystem for CoolProgress Dashboard
// Sources compiled from official partner websites and publications

export interface Partner {
  id: string;
  name: string;
  fullName: string;
  tagline: string;
  website: string;
  coolingUrl: string;
  logoPath: string;
  logoPlaceholder: string; // CSS class or icon name
  description: string;
  keyContribution: string;
  keyReport?: string;
  keyReportUrl?: string;
  category: 'data' | 'policy' | 'implementation' | 'funding' | 'research';
}

export const partners: Partner[] = [
  {
    id: 'clasp',
    name: 'CLASP',
    fullName: 'Collaborative Labeling and Appliance Standards Program',
    tagline: 'Improving the energy and environmental performance of appliances worldwide',
    website: 'https://www.clasp.ngo',
    coolingUrl: 'https://www.clasp.ngo/tools/worlds-best-meps/',
    logoPath: '/images/clasp-logo.png',
    logoPlaceholder: 'clasp',
    description:
      'CLASP works to improve the energy and environmental performance of appliances, equipment, and lighting globally through policy and market transformation.',
    keyContribution:
      'Tracks and benchmarks Minimum Energy Performance Standards (MEPS) for ACs across all major economies via the World\'s Best MEPS tool.',
    keyReport: 'World\'s Best MEPS',
    keyReportUrl: 'https://www.clasp.ngo/tools/worlds-best-meps/',
    category: 'data',
  },
  {
    id: 'cool-coalition',
    name: 'Cool Coalition',
    fullName: 'UNEP Cool Coalition',
    tagline: 'A unified front for clean and efficient cooling',
    website: 'https://coolcoalition.org',
    coolingUrl: 'https://coolcoalition.org/global-cooling-pledge/',
    logoPath: '/images/cool-coalition.png',
    logoPlaceholder: 'cool-coalition',
    description:
      'UNEP-hosted platform uniting 100+ governments, cities, businesses, and civil society to accelerate the transition to clean, efficient, and accessible cooling.',
    keyContribution:
      'Manages the Global Cooling Pledge (66 countries, COP28) aiming to reduce cooling-related emissions 68% by 2050 and increase average AC efficiency 50%.',
    keyReport: 'Global Cooling Pledge Progress Report 2024',
    keyReportUrl:
      'https://coolcoalition.org/wp-content/uploads/2024/11/2024-Global-Cooling-Pledge-Progress-Report.pdf',
    category: 'policy',
  },
  {
    id: 'u4e',
    name: 'U4E',
    fullName: 'United for Efficiency',
    tagline: 'Accelerating the global market transformation to energy-efficient products',
    website: 'https://united4efficiency.org',
    coolingUrl:
      'https://united4efficiency.org/wp-content/uploads/2021/11/U4E_AC_Model-Regulation_EN_2021-11-08.pdf',
    logoPath: '/images/u4e-logo.png',
    logoPlaceholder: 'u4e',
    description:
      'A UNEP-led initiative supporting developing countries and emerging economies in transitioning to energy-efficient lighting, appliances, and equipment.',
    keyContribution:
      'Developed Model Regulation Guidelines for ACs with recommended performance metrics (seasonal 5.1 Wh/Wh or greater) adopted in multiple countries.',
    keyReport: 'Model Regulation Guidelines for Air Conditioners',
    keyReportUrl:
      'https://united4efficiency.org/wp-content/uploads/2021/11/U4E_AC_Model-Regulation_EN_2021-11-08.pdf',
    category: 'policy',
  },
  {
    id: 'iea',
    name: 'IEA',
    fullName: 'International Energy Agency',
    tagline: 'Shaping a secure and sustainable energy future',
    website: 'https://www.iea.org',
    coolingUrl: 'https://www.iea.org/reports/the-future-of-cooling',
    logoPath: '/images/iea-logo.png',
    logoPlaceholder: 'iea',
    description:
      'The IEA provides authoritative analysis, data, and policy recommendations on the global energy sector, including comprehensive cooling demand projections.',
    keyContribution:
      'Published The Future of Cooling (2018), the definitive projection showing global AC stock growing from 1.6B to 5.6B by 2050 with energy demand tripling without action.',
    keyReport: 'The Future of Cooling',
    keyReportUrl: 'https://www.iea.org/reports/the-future-of-cooling',
    category: 'research',
  },
  {
    id: 'giz',
    name: 'GIZ Proklima',
    fullName: 'Deutsche Gesellschaft fuer Internationale Zusammenarbeit - Proklima',
    tagline: 'Promoting eco-friendly and sustainable cooling technologies worldwide',
    website: 'https://www.giz.de/en/worldwide/71271.html',
    coolingUrl: 'https://www.green-cooling-initiative.org/',
    logoPath: '/images/giz-logo.png',
    logoPlaceholder: 'giz',
    description:
      'GIZ Proklima has been at the forefront of ozone and climate protection for 30 years, implementing over 340 projects in 60+ countries through the Green Cooling Initiative.',
    keyContribution:
      'Trained 600,000+ RAC technicians in natural refrigerants. Achieved 120M+ tonnes CO2e savings across 60+ countries through policy advice, capacity building, and technology transfer.',
    keyReport: 'Green Cooling Initiative',
    keyReportUrl: 'https://www.green-cooling-initiative.org/',
    category: 'implementation',
  },
  {
    id: 'se4all',
    name: 'SE4ALL',
    fullName: 'Sustainable Energy for All',
    tagline: 'Action towards affordable, reliable, sustainable and modern energy for all',
    website: 'https://www.seforall.org',
    coolingUrl:
      'https://www.seforall.org/data-stories/chilling-prospects-2025',
    logoPath: '/images/seforall-logo.jpg',
    logoPlaceholder: 'se4all',
    description:
      'International organization working to achieve SDG7 (universal energy access) by 2030. Tracks global cooling access gaps through the Chilling Prospects series.',
    keyContribution:
      'Publishes the annual Chilling Prospects report tracking 1.12 billion people at high risk from lack of cooling access, with granular data on rural and urban gaps.',
    keyReport: 'Chilling Prospects 2025',
    keyReportUrl:
      'https://www.seforall.org/data-stories/chilling-prospects-2025',
    category: 'data',
  },
  {
    id: 'ccc',
    name: 'CCC',
    fullName: 'Clean Cooling Collaborative',
    tagline: 'Transforming the cooling sector for people and the planet',
    website: 'https://www.cleancoolingcollaborative.org',
    coolingUrl: 'https://www.cleancoolingcollaborative.org/the-challenge/',
    logoPath: '/images/ccc-logo.png',
    logoPlaceholder: 'ccc',
    description:
      'A philanthropic initiative coordinating funding and action across the cooling sector. Aims to reduce cumulative CO2 emissions by 100 Gt and expand access to clean cooling by 2050.',
    keyContribution:
      'Coordinated the Global Cooling Watch, mobilized 71 national governments for the Global Cooling Pledge at COP28, and has already exceeded 5 of its 20 indicator targets by mid-2024.',
    keyReport: 'Global Cooling Watch 2023',
    keyReportUrl:
      'https://www.cleancoolingcollaborative.org/report/global-cooling-watch-2023/',
    category: 'funding',
  },
  {
    id: 'climate-policy-radar',
    name: 'Climate Policy Radar',
    fullName: 'Climate Policy Radar',
    tagline: 'Open data and AI to map the world\'s climate laws and policies',
    website: 'https://www.climatepolicyradar.org',
    coolingUrl: 'https://app.climatepolicyradar.org/search',
    logoPath: '/images/climate-policy-radar-logo.png',
    logoPlaceholder: 'climate-policy-radar',
    description:
      'A nonprofit building open databases and AI-powered research tools covering 30,000+ national climate laws, policies, and UNFCCC submissions, enabling data-driven policy analysis.',
    keyContribution:
      'Tracks national cooling action plans (NCAPs) and climate policy instruments relevant to cooling, refrigerants, and energy efficiency via natural language search across all national governments.',
    keyReport: 'Climate Law and Policy Search',
    keyReportUrl: 'https://app.climatepolicyradar.org/search',
    category: 'research',
  },
];

export const getPartnerById = (id: string): Partner | undefined =>
  partners.find((p) => p.id === id);

export const getPartnersByCategory = (category: Partner['category']): Partner[] =>
  partners.filter((p) => p.category === category);

// Global Cooling Pledge summary
export const globalCoolingPledge = {
  name: 'Global Cooling Pledge',
  launchedAt: 'COP28 Dubai, December 2023',
  signatoryCountries: 71,
  nonStateActors: 60,
  targetEmissionReduction: '68% by 2050',
  targetEfficiencyIncrease: '50% average AC efficiency',
  countriesIncludingCoolingInNDCs: 37,
  countriesWithMEPS: 49, // 69% of signatories
  countriesWithBuildingCodes: 40, // 56% of signatories
  progressReportUrl:
    'https://coolcoalition.org/wp-content/uploads/2024/11/2024-Global-Cooling-Pledge-Progress-Report.pdf',
  source: 'Cool Coalition Global Cooling Pledge Progress Report, November 2024',
};

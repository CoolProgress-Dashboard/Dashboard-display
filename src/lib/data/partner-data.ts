// partner-data.ts - Partner Ecosystem for CoolProgress Dashboard
// Sources compiled from official partner websites and publications

export interface PartnerResource {
  label: string;
  url: string;
  icon: string; // FontAwesome class
  description?: string;
}

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
  resources?: PartnerResource[];
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
    resources: [
      { label: 'World\'s Best MEPS', url: 'https://www.clasp.ngo/tools/worlds-best-meps/', icon: 'fa-bolt', description: 'Compare AC efficiency standards across countries' },
      { label: 'Policy Resource Center (CPRC)', url: 'https://cprc-clasp.ngo/', icon: 'fa-database', description: 'Comprehensive policy database for cooling appliances' },
      { label: 'Country Savings Calculator', url: 'https://cprc-clasp.ngo/tools/country-savings', icon: 'fa-calculator', description: 'Model energy savings from MEPS adoption' },
      { label: 'NDC Appliance Toolkit', url: 'https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/', icon: 'fa-file-contract', description: 'Link appliance efficiency to NDC targets' },
    ],
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
    resources: [
      { label: 'Global Cooling Pledge', url: 'https://coolcoalition.org/global-cooling-pledge/', icon: 'fa-earth-americas', description: '71 nations committed to cooling transition' },
      { label: 'Pledge Progress Report 2024', url: 'https://coolcoalition.org/wp-content/uploads/2024/11/2024-Global-Cooling-Pledge-Progress-Report.pdf', icon: 'fa-file-pdf', description: 'Annual tracking of pledge implementation' },
      { label: 'Cool Coalition Resources', url: 'https://coolcoalition.org/resources/', icon: 'fa-folder-open', description: 'Policy briefs, case studies, and guidance documents' },
    ],
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
    resources: [
      { label: 'Country Assessments', url: 'https://united4efficiency.org/countries/', icon: 'fa-map', description: 'Country-level efficiency transition assessments' },
      { label: 'Model Regulation Guidelines', url: 'https://united4efficiency.org/resources/model-regulation-guidelines/', icon: 'fa-scale-balanced', description: 'Template MEPS regulations for developing countries' },
      { label: 'Policy Guides & Tools', url: 'https://united4efficiency.org/resources/', icon: 'fa-toolbox', description: 'Full resource library for policy makers' },
    ],
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
    resources: [
      { label: 'The Future of Cooling', url: 'https://www.iea.org/reports/the-future-of-cooling', icon: 'fa-chart-line', description: 'Definitive 2018 study on global cooling demand growth' },
      { label: 'Space Cooling Tracker', url: 'https://www.iea.org/energy-system/buildings/space-cooling', icon: 'fa-temperature-low', description: 'Real-time tracking of cooling energy demand' },
      { label: 'World Energy Outlook 2025', url: 'https://www.iea.org/reports/world-energy-outlook-2025', icon: 'fa-book-open', description: 'STEPS grid decarbonization projections used in DECARB' },
      { label: 'Electricity 2025', url: 'https://www.iea.org/reports/electricity-2025', icon: 'fa-bolt', description: 'Grid emission intensity trends and projections' },
    ],
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
    resources: [
      { label: 'Green Cooling Initiative', url: 'https://www.green-cooling-initiative.org/', icon: 'fa-leaf', description: 'Country data, policy tracker, and technology guidance' },
      { label: 'RAC Technician Training', url: 'https://www.giz.de/en/worldwide/71271.html', icon: 'fa-graduation-cap', description: '600,000+ technicians trained in natural refrigerants' },
    ],
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
    resources: [
      { label: 'Chilling Prospects 2025', url: 'https://www.seforall.org/data-stories/chilling-prospects-2025', icon: 'fa-temperature-high', description: '1.2 billion people at risk from lack of cooling' },
      { label: 'Cooling for All', url: 'https://www.seforall.org/cooling-for-all', icon: 'fa-people-group', description: 'Solutions for sustainable cooling access' },
      { label: 'Data Portal', url: 'https://www.seforall.org/data-and-evidence', icon: 'fa-database', description: 'Energy access and cooling data downloads' },
    ],
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
    resources: [
      { label: 'Global Cooling Watch', url: 'https://www.cleancoolingcollaborative.org/report/global-cooling-watch-2023/', icon: 'fa-chart-pie', description: 'Sector-wide progress tracker with 20 indicators' },
      { label: 'The Challenge', url: 'https://www.cleancoolingcollaborative.org/the-challenge/', icon: 'fa-exclamation-circle', description: 'Why cooling matters for climate and equity' },
    ],
  },
  {
    id: 'unep-ozone',
    name: 'UNEP Ozone',
    fullName: 'UNEP Ozone Secretariat',
    tagline: 'Protecting the ozone layer and phasing down climate-warming HFCs',
    website: 'https://ozone.unep.org',
    coolingUrl: 'https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016',
    logoPath: '/images/unep.png',
    logoPlaceholder: 'unep-ozone',
    description:
      'The UNEP Ozone Secretariat administers the Montreal Protocol and its Kigali Amendment, tracking ratification, compliance, and HFC phase-down progress for 198 parties.',
    keyContribution:
      'Maintains the definitive database on Kigali Amendment ratification, HFC baselines, and Article 7 consumption data for all parties.',
    keyReport: 'Kigali Amendment Status',
    keyReportUrl: 'https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016',
    category: 'policy',
    resources: [
      { label: 'Kigali Amendment', url: 'https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016', icon: 'fa-file-contract', description: 'Official amendment text and ratification status' },
      { label: 'OzonAction', url: 'https://www.unep.org/ozonaction/', icon: 'fa-leaf', description: 'Compliance assistance for developing countries' },
      { label: 'Country Profiles', url: 'https://ozone.unep.org/countries', icon: 'fa-earth-americas', description: 'Per-country ODS and HFC consumption data' },
    ],
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
    resources: [
      { label: 'Climate Law Search', url: 'https://app.climatepolicyradar.org/search', icon: 'fa-magnifying-glass', description: 'AI-powered search across 30,000+ climate laws' },
      { label: 'NCAP Finder', url: 'https://app.climatepolicyradar.org/search?q=national+cooling+action+plan', icon: 'fa-file-circle-check', description: 'Find National Cooling Action Plans by country' },
    ],
  },
  {
    id: 'heat',
    name: 'HEAT GmbH',
    fullName: 'HEAT GmbH - Climate Intelligence & Green Cooling',
    tagline: 'Developer of the CoolProgress Dashboard',
    website: 'https://www.heat-gmbh.de',
    coolingUrl: 'https://www.green-cooling-initiative.org/',
    logoPath: '/images/heat-logo.png',
    logoPlaceholder: 'heat',
    description:
      'HEAT GmbH develops climate intelligence tools and models for the global cooling transition. As the developer of CoolProgress, HEAT integrates data from all partners into a unified tracking platform.',
    keyContribution:
      'Built and maintains the CoolProgress Dashboard, integrating data from all partners into a unified global cooling transition tracking platform.',
    keyReport: 'CoolProgress Methodology',
    keyReportUrl: '/methodology',
    category: 'data',
    resources: [
      { label: 'CoolProgress Methodology', url: '/methodology', icon: 'fa-book', description: 'Three-layer DECARB pathway documentation' },
      { label: 'Green Cooling Initiative', url: 'https://www.green-cooling-initiative.org/', icon: 'fa-leaf', description: 'Global cooling sector data and policy tracker' },
    ],
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

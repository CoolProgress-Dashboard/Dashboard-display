// Dashboard configuration and constants extracted from monolithic +page.svelte
import type { DashboardData } from '$lib/services/dashboard-types';

export type Indicator = 'pledge' | 'kigali' | 'meps';

export type ViewMeta = {
  headline: string;
  subhead: string;
  insight: string;
  methodology?: string;
  sources: { name: string; url: string; logo?: string; logos?: string[]; logoLarge?: boolean }[];
};

export const VIEW_META: Record<string, ViewMeta> = {
  overview: {
    headline: 'Cooling emissions could triple by 2050. Or we cut them 73%.',
    subhead: 'The CoolProgress Dashboard tracks whether the world is on the sustainable cooling pathway.',
    insight:
      'Ten air conditioners are sold every second. Most are the least efficient models available. This creates a vicious cycle: rising heat drives demand, inefficient units strain power grids, grid stress increases emissions, and emissions drive more heat. By 2050, cooling could consume more electricity than China uses today \u2014 or we cut 73% through efficiency, Kigali, and clean grids.',
    sources: [
      { name: 'HEAT GmbH', url: 'https://www.heat-gmbh.de', logo: '/images/heat-logo.png' },
      { name: 'CLASP', url: 'https://www.clasp.ngo/', logo: '/images/clasp-logo.png' },
      { name: 'IEA', url: 'https://www.iea.org/reports/the-future-of-cooling', logo: '/images/iea-logo.png' }
    ]
  },
  emissions: {
    headline: 'Cooling emissions will triple by 2050 \u2014 unless we act now',
    subhead: 'AC alone will emit more than global aviation by 2035. Three interventions can cut 73% by mid-century.',
    insight:
      'Today\u2019s cooling sector emits 2,401 Mt CO\u2082e annually \u2014 more than the entire EU. On the current trajectory, that triples to 6,009 Mt by 2050. But three proven interventions \u2014 efficient appliances, low-GWP refrigerants, and clean grids \u2014 can cut 4,455 Mt per year. That is like taking every car in Europe and North America off the road.',
    methodology: 'Three-layer DECARB: HEAT GmbH (direct emissions, Kigali phase-down) + CLASP (efficiency scenarios) + IEA STEPS (grid decarbonization). See /methodology for details.',
    sources: [
      { name: 'HEAT GmbH', url: 'https://www.heat-gmbh.de', logo: '/images/heat-logo.png' },
      { name: 'Mepsy by CLASP', url: 'https://www.clasp.ngo/tools/mepsy/', logo: '/images/clasp-logo.png' },
      { name: 'IEA STEPS', url: 'https://www.iea.org/reports/world-energy-outlook-2025' }
    ]
  },
  meps: {
    headline: 'The 3x efficiency gap is the cheapest climate solution we are ignoring',
    subhead: 'Best-in-class ACs are 3x more efficient than the worst on sale today. MEPS can close this gap \u2014 saving 1,300 TWh per year.',
    insight:
      'The cheapest air conditioner in Lagos consumes three times the electricity of the best unit in Tokyo \u2014 for the same cooling. Without binding standards, manufacturers dump their least efficient models in the fastest-growing markets. Closing this gap saves 1,300 TWh annually: enough to power all of Africa. The tool already exists. It is called MEPS.',
    methodology: 'MEPS & Labels data: CLASP Policy Resource Center (CPRC). Efficiency metrics: CSPF, EER, AEC. Coverage: AC, Refrigerators, Fans across 80+ countries.',
    sources: [
      { name: 'CLASP Policy Resource Center', url: 'https://cprc-clasp.ngo/', logo: '/images/clasp-logo.png' },
      { name: 'HEAT GmbH (integration)', url: 'https://www.heat-gmbh.de', logo: '/images/heat-logo.png' }
    ]
  },
  kigali: {
    headline: '157 countries ratified Kigali. But ratification is not implementation.',
    subhead: 'The Kigali Amendment can prevent 0.5\u00B0C of warming \u2014 if countries convert commitments into refrigerant transitions on the ground.',
    insight:
      'HFCs are invisible, odorless \u2014 and thousands of times more potent than CO\u2082. A single service van leak can release the equivalent of driving a car for a year. 157 nations have signed the Kigali Amendment, but the real test is on the factory floor: converting production lines, training 15 million technicians, and building recovery infrastructure from scratch.',
    methodology: 'Kigali ratification and implementation data: UNEP Ozone Secretariat. HFC baselines and allowable emissions: KIP database. GWP values: IPCC AR6.',
    sources: [
      { name: 'UNEP Ozone Secretariat', url: 'https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment', logo: '/images/unep.png', logoLarge: true },
      { name: 'HEAT GmbH (integration)', url: 'https://www.heat-gmbh.de', logo: '/images/heat-logo.png' }
    ]
  },
  access: {
    headline: '1.2 billion people face dangerous heat without cooling',
    subhead: 'Cooling is health infrastructure. 420,000 die annually from food spoiled by broken cold chains. The access gap is a matter of climate equity.',
    insight:
      'A farmer in Senegal loses 40% of her harvest to heat spoilage. A hospital in Bihar stores vaccines in a room that hits 45\u00B0C. 1.2 billion people lack access to basic cooling \u2014 not luxury, but survival. The cruel irony: those most exposed to rising heat are the least able to afford protection. Closing this gap is the defining equity challenge of the climate crisis.',
    methodology: 'Cooling access data: SEforALL Chilling Prospects 2025. Risk levels by income group, region, and infrastructure. Dashboard integration: HEAT GmbH.',
    sources: [
      { name: 'SEforALL Chilling Prospects 2025', url: 'https://www.seforall.org/data-stories/chilling-prospects-2025', logo: '/images/seforall-logo.jpg', logoLarge: true },
      { name: 'HEAT GmbH (integration)', url: 'https://www.heat-gmbh.de', logo: '/images/heat-logo.png' }
    ]
  },
  policy: {
    headline: '71 countries pledged. Fewer than 30% of NDCs mention cooling.',
    subhead: 'The gap between political commitment and policy implementation is the central challenge of cooling governance.',
    insight:
      'At COP28, 71 nations signed the Global Cooling Pledge. Eighteen months later, fewer than 30% of NDCs even mention cooling. Only 20 countries have completed National Cooling Action Plans. The gap between a signature in Dubai and a regulation in Delhi is where climate ambition goes to die \u2014 unless we track it, fund it, and enforce it.',
    methodology: 'GCP signatories: Cool Coalition. NDC analysis: CLASP NDC Toolkit. NCAPs: Climate Policy Radar. Dashboard integration: HEAT GmbH.',
    sources: [
      { name: 'Cool Coalition Pledge', url: 'https://coolcoalition.org/global-cooling-pledge/', logo: '/images/unep.png', logoLarge: true },
      { name: 'CLASP NDC Toolkit', url: 'https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/', logo: '/images/clasp-logo.png' },
      { name: 'Climate Policy Radar', url: 'https://www.climatepolicyradar.org/', logo: '/images/climate-policy-radar-logo.jfif' }
    ]
  },
  partners: {
    headline: 'Partner Ecosystem',
    subhead: 'Organizations driving the global transition to clean, efficient, and accessible cooling',
    insight:
      'CoolProgress integrates authoritative data from leading global partners. HEAT GmbH provides the analytical backbone, CLASP the efficiency data, IEA the energy projections, and SEforALL the access tracking.',
    sources: [
      { name: 'HEAT GmbH', url: 'https://www.heat-gmbh.de', logo: '/images/heat-logo.png' },
      { name: 'Clean Cooling Collaborative', url: 'https://www.cleancoolingcollaborative.org/', logo: '/images/ccc-logo.png' },
      { name: 'Cool Coalition', url: 'https://coolcoalition.org/', logo: '/images/cool-coalition.png' },
      { name: 'CLASP', url: 'https://www.clasp.ngo/', logo: '/images/clasp-logo.png' }
    ]
  }
};

export const PILLAR_INFO: Record<string, { title: string; subtitle: string; body: string }> = {
  emissions: {
    title: 'Pillar 1: Emissions',
    subtitle: 'Tracking Total, Direct, and Indirect emissions to monitor national progress toward net zero',
    body: `<p>Pillar 1 tracks the sector\u2019s climate footprint by providing country-level data on Total, Direct, and Indirect emissions across three key appliance categories: Air Conditioners, Fans, and Refrigerators. This data distinguishes between direct emissions from high GWP refrigerant leaks and indirect emissions from electricity consumption. By analyzing these metrics at the national level, the dashboard enables targeted interventions to transition from high-GWP \u201Cbusiness as usual\u201D toward a sustainable cooling pathway.</p>
<p class="pillar-modal-insight"><strong>Strategic Insight:</strong> Business-as-usual trajectories indicate a doubling of cooling emissions by 2050. Integrated interventions in appliance efficiency and refrigerant management provide a pathway to mitigate up to 80% of these projected emissions.</p>`
  },
  meps: {
    title: 'Pillar 2: Product Efficiency',
    subtitle: 'Shielding global energy grids by ensuring every unit sold is a high-efficiency model',
    body: `<p>As the global cooling stock expands, Pillar 2 tracks the implementation of Minimum Energy Performance Standards (MEPS) and Energy Labels that act as the primary defense against runaway energy demand. By mandating that only high-efficiency units enter the market, MEPS eliminate the \u201Cenvironmental dumping\u201D of obsolete technology and shield global energy grids from overwhelming peak loads. This pillar monitors national progress in improving the average efficiency of air conditioners and refrigerators\u2014a critical step toward the Net Zero 2050 pathway that could save consumers over $800 billion in electricity costs by mid-century.</p>
<p class="pillar-modal-insight"><strong>Strategic Insight:</strong> Uneven MEPS adoption in fast-growing markets allows for the \u2018environmental dumping\u2019 of obsolete technology. Harmonizing these standards is critical to stabilizing markets, protecting energy grids, and ensuring equitable access to high-efficiency cooling.</p>`
  },
  kigali: {
    title: 'Pillar 3: Refrigerant Transition',
    subtitle: 'Defusing the \u201Cinvisible climate bomb\u201D by phasing out high-GWP refrigerants',
    body: `<p>Pillar 3 monitors global progress in defusing the \u201Cinvisible climate bomb\u201D by tracking the phase-down of high-GWP refrigerants. It focuses on the transition toward natural and low-GWP alternatives in alignment with the Kigali Amendment, providing critical data on refrigerant pathways for cooling appliances. Full implementation of the Kigali Amendment is estimated to prevent up to 0.5\u00B0C of global warming by 2100, while avoiding approximately 105 billion tonnes of CO\u2082 equivalent emissions by mid-century.</p>
<p>In addition to phasing down high-GWP refrigerants as quickly as possible, comprehensive climate strategies increasingly emphasize the role of Lifecycle Refrigerant Management (LRM) as a powerful driver for both environmental protection and industrial growth.</p>
<p class="pillar-modal-insight"><strong>Strategic Insight:</strong> Accelerating the transition to low-GWP refrigerants minimizes lifetime climate impact and prevents the long-term locking-in of potent greenhouse gas emissions.</p>
<p class="pillar-modal-links"><strong>For more information:</strong><br/>Lifecycle Refrigerant Management \u2014 <a href="https://www.ccacoalition.org/resources/guidance-sustainable-cooling-approaches-enhanced-ndcs" target="_blank" rel="noopener noreferrer">CCAC Guidance on Sustainable Cooling</a><br/>The Kigali Amendment \u2014 <a href="https://kigalisim.org/" target="_blank" rel="noopener noreferrer">kigalisim.org</a></p>`
  },
  access: {
    title: 'Pillar 4: Cooling Access & Vulnerability',
    subtitle: 'Ensuring cooling for all as a fundamental human right and a life-saving necessity',
    body: `<p>Pillar 4 provides a data-driven inventory of the \u201Ccooling gap\u201D based on the Sustainable Energy for All (SEforALL) Chilling Prospects publication. It tracks national and sub-national data for people globally at high risk due to a lack of basic cooling infrastructure for thermal safety, food security, and medical cold chains. By disaggregating populations into rural and urban poor and high/medium/low-risk groups, the dashboard identifies where heat exposure intersects with poverty and energy access gaps. This tracking serves as an evidence base for monitoring the scale of cooling vulnerability and assessing the progress of global efforts to provide life-saving cooling to the most exposed communities.</p>
<p class="pillar-modal-insight"><strong>Strategic Insight:</strong> Cooling is a life-saving necessity, yet a over 1 billion-person \u2018access gap\u2019 persists, representing a critical threat to health and food security. Closing this gap is a matter of climate equity, requiring integrated solutions to protect the health and livelihoods of the most vulnerable.</p>`
  },
  policy: {
    title: 'Pillar 5: Policy Framework',
    subtitle: 'Tracking the legal and political commitments that turn promises into law',
    body: `<p>Pillar 5 tracks the evolution of global cooling governance by monitoring the adoption and stringency of national and international commitments. It provides an inventory of the Global Cooling Pledge signatories and assesses the integration of cooling-specific targets into Nationally Determined Contributions (NDCs) and National Cooling Action Plans (NCAPs). This data identifies the transition of voluntary climate promises into binding domestic regulations and enforceable management standards.</p>`
  }
};

// CLASP scenarios and appliances
export const CLASP_SCENARIOS = ['BAU', 'GB', 'NZH', 'BAT'];
export const CLASP_SCENARIO_NAMES: Record<string, string> = {
  BAU: 'Business as Usual',
  GB: 'Green Buildings',
  NZH: 'Net Zero Homes',
  BAT: 'Best Available Tech'
};
export const CLASP_APPLIANCES = ['Air Conditioning', 'Ceiling and Portable Fans', 'Refrigerator-Freezers'];
export const CLASP_APPLIANCE_SHORT: Record<string, string> = {
  'Air Conditioning': 'AC',
  'Ceiling and Portable Fans': 'Fans',
  'Refrigerator-Freezers': 'Refrigerators'
};

// HEAT modelling scenarios and subsectors (in collaboration with GIZ)
export const HEAT_SCENARIOS = ['BAU', 'KIP', 'KIP_PLUS', 'MIT'];
export const HEAT_SCENARIO_NAMES: Record<string, string> = {
  BAU: 'Business as Usual',
  KIP: 'Kigali Implementation',
  KIP_PLUS: 'Kigali+',
  MIT: 'Maximum Intervention'
};
export const HEAT_SUBSECTORS = ['Split residential air conditioners', 'Domestic refrigeration'];
export const HEAT_SUBSECTOR_SHORT: Record<string, string> = {
  'Split residential air conditioners': 'AC',
  'Domestic refrigeration': 'Refrigeration'
};

export const EMISSIONS_YEARS = Array.from({ length: 2050 - 2020 + 1 }, (_, i) => 2020 + i);

export const ACCESS_HISTORICAL_YEARS = Array.from({ length: 2024 - 2013 + 1 }, (_, i) => 2013 + i);
export const ACCESS_FORECAST_YEARS = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => 2025 + i);
export const ACCESS_YEARS = Array.from({ length: 2024 - 2013 + 1 }, (_, i) => 2013 + i);
export const ACCESS_ALL_YEARS = Array.from({ length: 2050 - 2013 + 1 }, (_, i) => 2013 + i);
export const IMPACT_LEVELS = ['High', 'Medium', 'Low'];
export const POPULATION_CATEGORIES = ['Rural Poor', 'Urban Poor', 'Lower-Middle Income', 'Middle-Income'];

export const SCOPE_TO_APPLIANCE: Record<string, string> = {
  ac: 'SplitAC',
  fridge: 'DomRef',
  fan: 'all'
};

export const APPLIANCE_TO_SCOPE: Record<string, string> = {
  SplitAC: 'ac',
  DomRef: 'fridge',
  all: 'fan'
};

// Supabase configuration
export const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcG1ka2thdnRhZGd1Z3Jxb2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODcwMzAsImV4cCI6MjA3Nzg2MzAzMH0.hjYqzGqAQ_C7vVsAo-UcSICFEpzsKP5R5xGi8sh-etA';

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
    headline: 'The planet is warming. Cooling must not make it worse.',
    subhead: 'Tracking the global transition to sustainable, equitable cooling.',
    insight:
      'Cooling already accounts for roughly 10% of global electricity use. Efficiency, low-GWP refrigerants, and access planning can bend the curve by 2050.',
    sources: [
      { name: 'IEA Future of Cooling', url: '#' },
      { name: 'Cool Coalition Data Hub', url: '#' },
      { name: 'CLASP Policy Database', url: '#' }
    ]
  },
  emissions: {
    headline: 'We\u2019re stuck in a vicious cycle',
    subhead: 'Cooling produces 7% of global emissions and demand is set to triple. Bending the curve starts now.',
    insight:
      'Without intervention, cooling emissions could double by 2050. Efficiency and refrigerant transition can unlock 80% reductions.',
    methodology: 'CLASP: Indirect emissions (energy-related CO\u2082) under efficiency scenarios. HEAT: Direct + indirect emissions with Kigali scenarios (GIZ collaboration).',
    sources: [
      { name: 'Mepsy by CLASP', url: 'https://www.clasp.ngo/tools/mepsy/', logo: '/images/clasp-logo.png' },
      { name: 'Green Cooling Initiative', url: 'https://www.green-cooling-initiative.org/country-data#!total-emissions/all-sectors/absolute', logos: ['/images/heat-logo.png', '/images/giz-logo.png'] }
    ]
  },
  meps: {
    headline: 'Efficiency is the cheapest clean energy',
    subhead: 'The invisible climate solution hiding in plain sight.',
    insight:
      'MEPS adoption remains uneven, especially in fast-growing cooling markets. Harmonized standards can prevent dumping of low-efficiency units.',
    methodology: 'MEPS & Labels set efficiency requirements for cooling appliances. Tracking policy adoption for ACs, Refrigerators, and Fans.',
    sources: [
      { name: 'CLASP Policy Resource Center (CPRC)', url: 'https://www.clasp.ngo/tools/clasp-policy-resource-center/', logo: '/images/clasp-logo.png' }
    ]
  },
  kigali: {
    headline: 'Defusing the invisible climate bomb',
    subhead: 'The Kigali Amendment can prevent 0.5\u00B0C of warming by phasing down super-pollutant refrigerants.',
    insight:
      'Transition pathways vary by group. Early action on low-GWP refrigerants reduces lifetime climate impact.',
    methodology: 'Kigali Amendment tracks HFC phase-down. Article 5 (developing) and Non-Article 5 (developed) parties have different schedules.',
    sources: [
      { name: 'Kigali Amendment Tracker', url: '#' },
      { name: 'MLF Project Reports', url: '#' },
      { name: 'UNEP Ozone Secretariat', url: '#' }
    ]
  },
  access: {
    headline: '1.2 billion people are being left behind',
    subhead: 'Cooling is a life-saving necessity, yet access remains a luxury of the few.',
    insight:
      'Over 1 billion people face high risk from inadequate cooling access. Urban poor (695M) and rural poor (309M) are most vulnerable. Sustainable cooling solutions require passive design, efficient equipment, and climate-friendly refrigerants.',
    methodology: 'Tracking cooling access gaps across 77 countries. Risk levels based on income, infrastructure, and climate vulnerability.',
    sources: [
      { name: 'SEforALL Chilling Prospects 2025', url: 'https://www.seforall.org/data-stories/chilling-prospects-2025', logo: '/images/seforall-logo.jpg', logoLarge: true }
    ]
  },
  policy: {
    headline: 'Promises mean nothing without enforcement',
    subhead: 'Tracking the legal and political commitments that turn voluntary pledges into binding national law.',
    insight:
      'Global Cooling Pledge signatories are growing. NDC cooling mentions and National Cooling Action Plans (NCAPs) are critical for implementation.',
    methodology: 'GCP signatories committed to sustainable cooling. NDC tracking for cooling mentions under the Paris Agreement. NCAPs for comprehensive national cooling strategies.',
    sources: [
      { name: 'Cool Coalition Pledge', url: 'https://coolcoalition.org/global-cooling-pledge/', logo: '/images/unep.png', logoLarge: true },
      { name: 'Net Zero Appliances NDC Toolkit', url: 'https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/', logo: '/images/clasp-logo.png' },
      { name: 'Find NCAPs at Climate Policy Radar', url: 'https://www.climatepolicyradar.org/', logo: '/images/climate-policy-radar-logo.jfif' }
    ]
  },
  partners: {
    headline: 'Partner Ecosystem',
    subhead: 'Organizations driving the global transition to clean, efficient, and accessible cooling',
    insight:
      'The cooling transition requires coordinated action across data providers, policy shapers, implementers, funders, and researchers.',
    sources: [
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
export const HEAT_SCENARIOS = ['BAU', 'KIP'];
export const HEAT_SCENARIO_NAMES: Record<string, string> = {
  BAU: 'Business as Usual',
  KIP: 'Kigali Implementation'
};
export const HEAT_SUBSECTORS = ['Split residential air conditioners', 'Domestic refrigeration'];
export const HEAT_SUBSECTOR_SHORT: Record<string, string> = {
  'Split residential air conditioners': 'AC',
  'Domestic refrigeration': 'Refrigeration'
};

export const EMISSIONS_YEARS = Array.from({ length: 2045 - 2020 + 1 }, (_, i) => 2020 + i);

export const ACCESS_HISTORICAL_YEARS = Array.from({ length: 2024 - 2013 + 1 }, (_, i) => 2013 + i);
export const ACCESS_FORECAST_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
export const ACCESS_YEARS = Array.from({ length: 2024 - 2013 + 1 }, (_, i) => 2013 + i);
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

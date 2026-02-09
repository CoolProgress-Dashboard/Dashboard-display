// partner-news.ts - Curated cooling sector news for CoolProgress Dashboard
// Sources: Official partner websites, UN reports, verified press releases
// Last updated: 2026-02-09

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  sourceUrl: string;
  date: string;       // ISO or display format
  summary: string;
  category: 'Policy' | 'Data' | 'Events' | 'Partners';
  icon: string;        // FontAwesome icon class
  color: string;       // Accent color for category
}

export const partnerNews: NewsItem[] = [
  {
    id: 'gcw-2025',
    headline: 'Global Cooling Watch 2025: Demand could triple by 2050',
    source: 'UNEP',
    sourceUrl: 'https://www.unep.org/resources/global-cooling-watch-2025',
    date: 'Nov 2025',
    summary: 'Launched at COP30 in Belem, the report finds cooling demand could more than triple by 2050 under business as usual, but a sustainable pathway can slash emissions and save trillions.',
    category: 'Data',
    icon: 'fa-chart-line',
    color: '#3D6B6B'
  },
  {
    id: 'cop30-beat-heat',
    headline: 'Beat the Heat initiative launched at COP30 to accelerate local cooling action',
    source: 'Cool Coalition',
    sourceUrl: 'https://coolcoalition.org/cool-coalition-coordinates-action-ahead-of-cop30/',
    date: 'Nov 2025',
    summary: 'COP30 flagship effort by Brazil presidency and UNEP Cool Coalition to translate the Global Cooling Pledge into local action across cities worldwide.',
    category: 'Events',
    icon: 'fa-sun',
    color: '#E85A4F'
  },
  {
    id: 'pledge-ministerial-2',
    headline: '50+ ministers adopt new measures at second Global Cooling Pledge Ministerial',
    source: 'UNEP',
    sourceUrl: 'https://www.unep.org/technical-highlight/cop30-leaders-prioritise-addressing-extreme-heat-through-sustainable-cooling',
    date: 'Nov 2025',
    summary: 'Over 50 ministers reaffirmed commitments to cut cooling emissions 68% by 2050. 72 countries now signed the Pledge with interim milestones of 18% by 2030.',
    category: 'Policy',
    icon: 'fa-earth-americas',
    color: '#8BC34A'
  },
  {
    id: 'chilling-prospects-2025',
    headline: 'Chilling Prospects 2025: 1 billion+ lack adequate cooling access',
    source: 'SEforALL',
    sourceUrl: 'https://www.seforall.org/data-stories/chilling-prospects-2025',
    date: '2025',
    summary: 'Latest data maps cooling access gaps in the Global South, identifying populations at high risk for thermal comfort, food preservation, and health services.',
    category: 'Data',
    icon: 'fa-thermometer-half',
    color: '#d97706'
  },
  {
    id: 'china-fridge-meps',
    headline: 'China raises refrigerator MEPS - new standard takes effect June 2026',
    source: 'CLASP',
    sourceUrl: 'https://cprc-clasp.ngo/updates/china-raised-minimum-energy-performance-standards-refrigerators',
    date: 'May 2025',
    summary: 'China issued GB 12021.2-2025 with significantly tighter energy efficiency thresholds for refrigerators and freezers, raising Grade 1+ TEEI to 40%.',
    category: 'Policy',
    icon: 'fa-bolt',
    color: '#4A7F7F'
  },
  {
    id: 'brazil-ac-2026',
    headline: 'Brazil AC policy to eliminate most fixed-speed units by 2026',
    source: 'CLASP',
    sourceUrl: 'https://www.clasp.ngo/updates/brazils-latest-ac-policy-to-dramatically-cut-costs-and-emissions/',
    date: '2025',
    summary: 'Stricter MEPS requirements effective January 2026 will dramatically cut costs and emissions by pushing the market toward inverter-driven AC technology.',
    category: 'Policy',
    icon: 'fa-wind',
    color: '#1a6b5a'
  },
  {
    id: 'cool-coalition-2025-2026',
    headline: 'Cool Coalition Steering Committee sets path for 2025-2026',
    source: 'Cool Coalition',
    sourceUrl: 'https://coolcoalition.org/news/commitments-action-cool-coalition-steering-committee-sets-path-2025-2026',
    date: 'Dec 2024',
    summary: 'UK pledged $15M for sustainable cooling innovations. Brazil named Co-chair of Global Cooling Pledge Contact Group. Workplan focuses on NDC integration.',
    category: 'Partners',
    icon: 'fa-handshake',
    color: '#3D6B6B'
  },
  {
    id: 'kigali-171',
    headline: 'Kigali Amendment reaches 171 ratifications, boosting climate action',
    source: 'UNEP Ozone Secretariat',
    sourceUrl: 'https://ozone.unep.org/kigali-amendment-hits-milestone-100th-ratification-boosting-climate-action',
    date: 'Sep 2025',
    summary: '171 states and the EU have ratified the Kigali Amendment, on track to avoid up to 0.4C of warming by end of century through HFC phase-down.',
    category: 'Policy',
    icon: 'fa-flask',
    color: '#8BC34A'
  },
  {
    id: 'nigeria-marketplace',
    headline: 'Nigeria launches Cooling Marketplace to scale sustainable solutions',
    source: 'SEforALL',
    sourceUrl: 'https://www.seforall.org/news/nigeria-launches-a-cooling-marketplace-to-scale-sustainable-cooling-solutions',
    date: 'Dec 2025',
    summary: 'NCCC and SEforALL organized the first Cooling Marketplace in Lagos, focused on mobilizing finance for sustainable cooling for 125 million Nigerians at risk.',
    category: 'Events',
    icon: 'fa-store',
    color: '#f59e0b'
  },
  {
    id: 'cool-cities-lab',
    headline: 'Cool Cities Lab platform to launch March 2026 for urban heat mapping',
    source: 'WRI / Cool Coalition',
    sourceUrl: 'https://www.wri.org/update/wri-joins-new-beat-heat-initiative-cooling-solutions-cities-launched-cop30',
    date: 'Nov 2025',
    summary: 'New platform will allow cities to explore fine-grain heat metrics, identify vulnerable neighborhoods, and tailor action plans to reduce heat risks.',
    category: 'Data',
    icon: 'fa-city',
    color: '#0070C0'
  }
];

export const NEWS_LAST_UPDATED = '2026-02-09';

export const CATEGORY_META: Record<NewsItem['category'], { icon: string; color: string; label: string }> = {
  Policy: { icon: 'fa-landmark', color: '#8BC34A', label: 'Policy Updates' },
  Data: { icon: 'fa-chart-bar', color: '#3D6B6B', label: 'Data Releases' },
  Events: { icon: 'fa-calendar-check', color: '#E85A4F', label: 'Events' },
  Partners: { icon: 'fa-handshake', color: '#f59e0b', label: 'Partner Announcements' },
};

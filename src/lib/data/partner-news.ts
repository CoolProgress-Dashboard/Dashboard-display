// partner-news.ts - Cool News feed for the CoolProgress Dashboard
// Source: Christina Hayes / Clean Cooling Collaborative (CCC) weekly "Cooling Updates"
// digest, supplied most Fridays. Links verified from the supplied News/NEWS.docx.
// To refresh: paste the new digest into News/NEWS.docx and ask Claude to update this file.
// Digest date: 2026-09-11

export type NewsSection = 'headlines' | 'events' | 'reads';

export interface NewsLink {
  label: string;   // short outlet / source label shown on the source link
  url: string;     // real source URL from the supplied digest
}

export interface NewsItem {
  id: string;
  section: NewsSection;
  icon: string;        // FontAwesome icon relating to what the item is about
  color: string;       // pillar accent (or dark blue) used sparingly for icon + source
  date: string;        // ISO publication date (YYYY-MM-DD) of the source article/event
  headline: string;    // the key message, shown bold
  summary: string;     // supporting detail (may be empty for one-line reads)
  links: NewsLink[];   // one or more source links
}

export const SECTION_META: Record<NewsSection, { label: string; icon: string; color: string }> = {
  headlines: { label: 'Highlights', icon: 'fa-newspaper', color: '#0d9488' },
  events: { label: 'Upcoming events', icon: 'fa-calendar-check', color: '#E85A4F' },
  reads: { label: 'Other interesting reads', icon: 'fa-book-open', color: '#3D6B6B' }
};

export const partnerNews: NewsItem[] = [
  {
    id: 'summer-2026-hottest',
    section: 'headlines',
    icon: 'fa-temperature-arrow-up',
    color: '#ea580c',
    date: '2026-09-10',
    headline: 'Hottest summer on record in more countries than ever',
    summary:
      'Summer 2026 broke records across the US and France, and globally August 2026 became Earth’s hottest month ever recorded.',
    links: [
      { label: 'NOAA', url: 'https://www.ncei.noaa.gov/news/national-climate-202608' },
      { label: 'Le Monde', url: 'https://www.lemonde.fr/en/environment/article/2026/09/04/summer-2026-becomes-by-far-the-hottest-ever-recorded-in-france-beating-the-record-by-almost-1-c-in-a-single-season-is-huge_6757141_114.html' },
      { label: 'NPR', url: 'https://www.npr.org/2026/09/10/nx-s1-5964676/scientists-august-hottest' }
    ]
  },
  {
    id: 'carbon-brief-shoulder-seasons',
    section: 'headlines',
    icon: 'fa-calendar-week',
    color: '#d97706',
    date: '2026-09-10',
    headline: 'Extreme heat is creeping into the shoulder seasons',
    summary:
      'Carbon Brief finds heat events spreading beyond summer in over half the world: arriving earlier in western Europe, southern Africa and north-western India, and later across much of the US, eastern China and northern Africa.',
    links: [
      { label: 'Carbon Brief', url: 'https://www.carbonbrief.org/guest-post-how-extreme-heat-is-creeping-from-summer-into-autumn-and-spring' }
    ]
  },
  {
    id: 'un-el-nino-warning',
    section: 'headlines',
    icon: 'fa-hurricane',
    color: '#0891b2',
    date: '2026-09-03',
    headline: 'UN warns the current El Niño is turning “very strong”',
    summary:
      'Months of extreme heat, floods and drought are expected as it peaks around year-end, with a near-100% chance it persists through February 2027.',
    links: [
      { label: 'UN News', url: 'https://news.un.org/en/story/2026/09/1168265' }
    ]
  },
  {
    id: 'green-blue-infrastructure',
    section: 'headlines',
    icon: 'fa-tree',
    color: '#16a34a',
    date: '2026-08-05',
    headline: 'Green-blue infrastructure cools cities by up to 2.5 °C',
    summary:
      'A UK study of six infrastructure types found all were 1.81–2.49 °C cooler than built-up sites, with woodland up to 6 °C cooler on the hottest days.',
    links: [
      { label: 'ScienceDirect', url: 'https://www.sciencedirect.com/science/article/pii/S0160412026004101' }
    ]
  },
  {
    id: 'tree-shade-transpiration',
    section: 'headlines',
    icon: 'fa-seedling',
    color: '#2D7D5A',
    date: '2026-09-04',
    headline: 'Tree shade and soil moisture both drive urban cooling',
    summary:
      'New research quantifies the roles of tree-cast shadows and transpiration, showing why managing tree soil moisture sustains the cooling benefit.',
    links: [
      { label: 'Nature', url: 'https://www.nature.com/articles/s41598-026-68979-5' }
    ]
  },
  {
    id: 'nrdc-nashik-mou',
    section: 'headlines',
    icon: 'fa-file-signature',
    color: '#7c3aed',
    date: '2026-09-03',
    headline: 'Nashik signs a five-year heat-resilience plan with NRDC',
    summary:
      'The MOU aims to cut heat-related vulnerabilities, promote sustainable cooling and strengthen climate-responsive urban planning in the Indian city.',
    links: [
      { label: 'Times of India', url: 'https://timesofindia.indiatimes.com/city/nashik/nmc-nrdc-india-join-hands-to-tackle-urban-heat-in-nashik-city/amp_articleshow/133774879.cms' }
    ]
  },
  {
    id: 'unep-ozonaction-island-states',
    section: 'headlines',
    icon: 'fa-snowflake',
    color: '#0ea5e9',
    date: '2026-09-05',
    headline: 'Island states deepen cooperation on HFC controls',
    summary:
      'UNEP OzonAction convened Caribbean and Pacific ozone officers in Thailand to strengthen HFC licensing, quota systems and refrigeration and AC efficiency.',
    links: [
      { label: 'RefIndustry', url: 'https://refindustry.com/news/unep-strengthens-hfc-quota-and-rac-efficiency-cooperation-across-island-states/' }
    ]
  },
  {
    id: 'ac-in-a-warming-world',
    section: 'headlines',
    icon: 'fa-fan',
    color: '#0d9488',
    date: '2026-09-06',
    headline: 'Is air conditioning the answer to extreme heat?',
    summary:
      'A record-breaking summer prompted a wave of coverage debating the role, and the limits, of air conditioning in a warming world.',
    links: [
      { label: 'BBC World Service', url: 'https://www.bbc.co.uk/programmes/w3ct99hw' },
      { label: 'The Guardian', url: 'https://www.theguardian.com/environment/2026/sep/06/climate-crisis-air-conditioning-access' },
      { label: 'South China Morning Post', url: 'https://www.scmp.com/opinion/hong-kong-opinion/article/3365989/era-extreme-summers-its-time-look-beyond-air-conditioning' }
    ]
  },
  {
    id: 'wmo-air-quality',
    section: 'headlines',
    icon: 'fa-smog',
    color: '#6366f1',
    date: '2026-09-07',
    headline: 'Wildfires and heat threaten hard-won air-quality gains',
    summary:
      'The WMO warns that pollution from intensifying wildfires and heat waves could undermine global efforts to improve air quality and protect health.',
    links: [
      { label: 'Reuters', url: 'https://www.reuters.com/sustainability/cop/wildfires-heat-waves-threaten-undermine-air-quality-un-weather-agency-says-2026-09-07/' }
    ]
  },
  {
    id: 'southern-europe-mortality',
    section: 'headlines',
    icon: 'fa-heart-pulse',
    color: '#dc2626',
    date: '2026-09-07',
    headline: 'Southern Europe’s heat deaths are 26x more likely',
    summary:
      'New analysis finds 2022-like heat-mortality events roughly ten times more likely than the European average, with sharp regional and demographic disparities.',
    links: [
      { label: 'Nature', url: 'https://www.nature.com/articles/s44360-026-00193-z' }
    ]
  },
  {
    id: 'hera-thailand-women',
    section: 'headlines',
    icon: 'fa-people-group',
    color: '#db2777',
    date: '2026-07-01',
    headline: 'Extreme heat cuts Thai women’s earnings by half',
    summary:
      'A HERA report on the 11 million women in Thailand’s informal sector finds heat can halve earnings while driving severe health impacts.',
    links: [
      { label: 'HERA', url: 'https://heranow.org/resources/weathering-change-how-extreme-heat-is-reshaping-womens-lives-in-thailand/' }
    ]
  },
  {
    id: 'south-asia-cooling-roadshow',
    section: 'events',
    icon: 'fa-route',
    color: '#E85A4F',
    date: '2026-10-05',
    headline: 'South Asia Cooling Innovation Road Show · Oct 5–14',
    summary: 'Hosted by the World Bank Group, UK Government and the Cool Coalition.',
    links: [
      { label: 'Details', url: 'https://mailchi.mp/ifc/south-asia-cooling-2026?e=4e8e3f2254' }
    ]
  },
  {
    id: 'read-grist-adapting',
    section: 'reads',
    icon: 'fa-arrows-rotate',
    color: '#0891b2',
    date: '2026-09-08',
    headline: 'The world is adapting to extreme heat, but not nearly fast enough',
    summary: '',
    links: [{ label: 'Grist', url: 'https://grist.org/extreme-weather/the-world-is-adapting-to-extreme-heat-but-not-nearly-fast-enough/' }]
  },
  {
    id: 'read-designboom-passive',
    section: 'reads',
    icon: 'fa-house-chimney',
    color: '#7c3aed',
    date: '2026-09-05',
    headline: 'When the power goes out, how can architecture keep a house cool?',
    summary: '',
    links: [{ label: 'Design Boom', url: 'https://www.designboom.com/architecture/power-goes-out-keep-house-cooling-passive-survivability/' }]
  },
  {
    id: 'read-asiae-relentless-summer',
    section: 'reads',
    icon: 'fa-sun',
    color: '#ea580c',
    date: '2026-09-04',
    headline: '“People really die”: a relentless summer, avoiding the day and waiting for night',
    summary: '',
    links: [{ label: 'The Asia Business Daily', url: 'https://www.asiae.co.kr/en/visual-news/article/2026090420011553057' }]
  },
  {
    id: 'read-npr-body-temperature',
    section: 'reads',
    icon: 'fa-temperature-high',
    color: '#dc2626',
    date: '2026-09-07',
    headline: '‘Her body temperature was 106’: how heat is killing Americans in their homes',
    summary: '',
    links: [{ label: 'NPR', url: 'https://www.npr.org/2026/09/07/nx-s1-5644782/heat-deaths-manufactured-mobile-homes' }]
  },
  {
    id: 'read-guardian-wakeup-call',
    section: 'reads',
    icon: 'fa-bell',
    color: '#d97706',
    date: '2026-09-06',
    headline: 'The Guardian view on extreme heat: its scale should be a wake-up call',
    summary: '',
    links: [{ label: 'The Guardian', url: 'https://www.theguardian.com/commentisfree/2026/sep/06/the-guardian-view-on-extreme-heat-its-scale-should-be-a-wake-up-call-to-us-all' }]
  },
  {
    id: 'read-unece-urban-forests',
    section: 'reads',
    icon: 'fa-tree',
    color: '#16a34a',
    date: '2026-09-07',
    headline: 'UNECE guide helps cities finance urban forests to survive extreme heat',
    summary: '',
    links: [{ label: 'UNECE', url: 'https://unece.org/climate-change/press/unece-guide-helps-cities-finance-urban-forests-survive-extreme-heat' }]
  },
  {
    id: 'read-guardian-gb-cities',
    section: 'reads',
    icon: 'fa-city',
    color: '#0369a1',
    date: '2026-09-08',
    headline: 'Cities in Great Britain most vulnerable to extreme heat revealed',
    summary: '',
    links: [{ label: 'The Guardian', url: 'https://www.theguardian.com/environment/2026/sep/08/cities-great-britain-most-vulnerable-extreme-heat-revealed' }]
  },
  {
    id: 'read-latimes-socal-humidity',
    section: 'reads',
    icon: 'fa-droplet',
    color: '#0891b2',
    date: '2026-09-09',
    headline: 'Heat sets new records as oppressive humidity strangles Southern California',
    summary: '',
    links: [{ label: 'LA Times', url: 'https://www.latimes.com/california/story/2026-09-09/southern-california-braces-for-very-dangerous-unusual-heat-plus-oppressive-humidity' }]
  }
];

export const NEWS_LAST_UPDATED = '2026-09-11';

// Source attribution shown on the news page
export const NEWS_SOURCE = 'Clean Cooling Collaborative weekly Cooling Updates';

export const SECTION_ORDER: NewsSection[] = ['headlines', 'events', 'reads'];

// The single item teased in the sidebar Cool News widget (the lead headline)
export const FEATURED_NEWS: NewsItem = partnerNews[0];
export const NEWS_COUNT = partnerNews.length;

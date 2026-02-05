<script lang="ts">
  import { onMount } from 'svelte';
  import '$lib/styles/dashboard.css';
  import {
    createDefaultData,
    getAccessData,
    getAccessDataBySource,
    getAccessKPIs,
    getEmissionsData,
    getNdcRecord,
    loadDashboardData
  } from '$lib/services/dashboard-data';
  import type { AccessFilters, Country, DashboardData, EmissionsFilters, Meps, NdcFilters } from '$lib/services/dashboard-types';

  onMount(async () => {
    const loadScript = (src: string) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing && existing.dataset.loaded) {
          resolve();
          return;
        }
        const script = existing || document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
          script.dataset.loaded = 'true';
          resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        if (!existing) document.head.appendChild(script);
      });

    await Promise.all(
      ['https://d3js.org/d3.v7.min.js', 'https://d3js.org/topojson.v3.min.js'].map(loadScript)
    );

    const d3 = (window as any).d3;
    const topojson = (window as any).topojson;
    const echarts = await import('echarts');

    // =====================================================
    // CONFIGURATION
    // =====================================================
    const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcG1ka2thdnRhZGd1Z3Jxb2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODcwMzAsImV4cCI6MjA3Nzg2MzAzMH0.hjYqzGqAQ_C7vVsAo-UcSICFEpzsKP5R5xGi8sh-etA';

    const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
    const setText = (id: string, value: string | number) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value);
    };

        // Data storage
    let data: DashboardData = createDefaultData();

        type Indicator = 'pledge' | 'kigali' | 'meps';

        let currentView = 'overview';
        let currentIndicator: Indicator = 'pledge';
        let selectedRegion = '';
    let selectedCountry: Country | null = null;

    // Global country filter from sidebar
    let globalCountryFilter = '';

        // Emissions filters (enhanced)
    let emissionsScenario = 'BAU';
    let emissionsYear = 2030;
    let emissionsAppliance = 'all';
    let emissionsDataSource: 'clasp' | 'subcool' = 'clasp';
    let emissionsAppliances: string[] = ['Air Conditioning', 'Ceiling and Portable Fans', 'Refrigerator-Freezers'];
    let emissionsRegion = '';
    let emissionsType: 'total' | 'direct' | 'indirect' = 'total';

    // CLASP scenarios and appliances
    const CLASP_SCENARIOS = ['BAU', 'GB', 'NZH', 'BAT'];
    const CLASP_SCENARIO_NAMES: Record<string, string> = {
        'BAU': 'Business as Usual',
        'GB': 'Green Buildings',
        'NZH': 'Net Zero Homes',
        'BAT': 'Best Available Tech'
    };
    const CLASP_APPLIANCES = ['Air Conditioning', 'Ceiling and Portable Fans', 'Refrigerator-Freezers'];
    const CLASP_APPLIANCE_SHORT: Record<string, string> = {
        'Air Conditioning': 'AC',
        'Ceiling and Portable Fans': 'Fans',
        'Refrigerator-Freezers': 'Refrigerators'
    };

    // HEAT modelling scenarios and subsectors (in collaboration with GIZ)
    const HEAT_SCENARIOS = ['BAU', 'KIP'];
    const HEAT_SCENARIO_NAMES: Record<string, string> = {
        'BAU': 'Business as Usual',
        'KIP': 'Kigali Implementation'
    };
    const HEAT_SUBSECTORS = ['Split residential air conditioners', 'Domestic refrigeration'];
    const HEAT_SUBSECTOR_SHORT: Record<string, string> = {
        'Split residential air conditioners': 'AC',
        'Domestic refrigeration': 'Refrigeration'
    };

    const EMISSIONS_YEARS = Array.from({ length: 2045 - 2020 + 1 }, (_, i) => 2020 + i);

        // NDC Tracker filters
    let ndcType = 'NDC 3.0';
    let ndcCategory = 'Energy Efficiency';

    // Access & Vulnerability filters
    let accessDataSource: 'historical' | 'forecast' = 'historical';
    let accessYear = 2024;
    let accessImpactLevels: string[] = ['High', 'Medium', 'Low'];
    let accessPopCategories: string[] = ['Rural Poor', 'Urban Poor', 'Lower-Middle Income', 'Middle-Income'];
    let accessRegionFilter = '';

    const ACCESS_HISTORICAL_YEARS = Array.from({ length: 2024 - 2013 + 1 }, (_, i) => 2013 + i);
    const ACCESS_FORECAST_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

    // MEPS filters
    let mepsRegionFilter = '';
    let mepsEquipmentTypes: string[] = [];

    // Kigali filters
    let kigaliRegionFilter = '';
    let kigaliGroupTypes: string[] = [];

    const ACCESS_YEARS = Array.from({ length: 2024 - 2013 + 1 }, (_, i) => 2013 + i);
    const IMPACT_LEVELS = ['High', 'Medium', 'Low'];
    const POPULATION_CATEGORIES = ['Rural Poor', 'Urban Poor', 'Lower-Middle Income', 'Middle-Income'];

    const getAccessFilters = (): AccessFilters => ({
      year: accessYear,
      impactLevels: accessImpactLevels,
      populationCategories: accessPopCategories,
      region: accessRegionFilter,
      country: globalCountryFilter
    });

    const getEmissionsFilters = (): EmissionsFilters => ({
      scenario: emissionsScenario,
      year: emissionsYear,
      appliance: emissionsAppliance
    });

    const getNdcFilters = (): NdcFilters => ({
      type: ndcType,
      category: ndcCategory
    });

    const scopeToAppliance: Record<string, string> = {
      ac: 'SplitAC',
      fridge: 'DomRef',
      fan: 'all'
    };

    const applianceToScope: Record<string, string> = {
      SplitAC: 'ac',
      DomRef: 'fridge',
      all: 'fan'
    };

    const viewMeta: Record<
      string,
      { headline: string; subhead: string; insight: string; sources: { name: string; url: string; logo?: string; logos?: string[]; logoLarge?: boolean }[] }
    > = {
      overview: {
        headline: 'Why Cooling Matters',
        subhead: 'The Transition is Urgent. The Opportunity is Now.',
        insight:
          'Cooling already accounts for roughly 10% of global electricity use. Efficiency, low-GWP refrigerants, and access planning can bend the curve by 2050.',
        sources: [
          { name: 'IEA Future of Cooling', url: '#' },
          { name: 'Cool Coalition Data Hub', url: '#' },
          { name: 'CLASP Policy Database', url: '#' }
        ]
      },
      emissions: {
        headline: 'Pillar 1: Emissions',
        subhead: 'Total, Direct and Indirect Cooling Emissions',
        insight:
          'Without intervention, cooling emissions could double by 2050. Efficiency and refrigerant transition can unlock 80% reductions.',
        sources: [
          { name: 'Mepsy by CLASP', url: 'https://www.clasp.ngo/tools/mepsy/', logo: '/images/clasp-logo.png' },
          { name: 'Green Cooling Initiative', url: 'https://www.green-cooling-initiative.org/country-data#!total-emissions/all-sectors/absolute', logos: ['/images/heat-logo.png', '/images/giz-logo.jpg'] }
        ]
      },
      meps: {
        headline: 'Pillar 2: Product Efficiency',
        subhead: 'Driving Performance via Minimum Energy Performance Standards (MEPS)',
        insight:
          'MEPS adoption remains uneven, especially in fast-growing cooling markets. Harmonized standards can prevent dumping of low-efficiency units.',
        sources: [
          { name: 'CLASP Policy Resource Center (CPRC)', url: 'https://www.clasp.ngo/tools/clasp-policy-resource-center/', logo: '/images/clasp-logo.png' }
        ]
      },
      kigali: {
        headline: 'Pillar 3: Refrigerant Transition',
        subhead: 'Tracking Kigali Amendment Implementation',
        insight:
          'Transition pathways vary by group. Early action on low-GWP refrigerants reduces lifetime climate impact.',
        sources: [
          { name: 'Kigali Amendment Tracker', url: '#' },
          { name: 'MLF Project Reports', url: '#' },
          { name: 'UNEP Ozone Secretariat', url: '#' }
        ]
      },
      access: {
        headline: 'Pillar 4: Access & Vulnerability',
        subhead: 'Tracking populations lacking access to cooling',
        insight:
          'Over 1 billion people face high risk from inadequate cooling access. Urban poor (695M) and rural poor (309M) are most vulnerable. Sustainable cooling solutions require passive design, efficient equipment, and climate-friendly refrigerants.',
        sources: [
          { name: 'SEforALL Chilling Prospects 2025', url: 'https://www.seforall.org/data-stories/chilling-prospects-2025', logo: '/images/seforall-logo.jpg', logoLarge: true }
        ]
      },
      policy: {
        headline: 'Pillar 5: Policy Framework',
        subhead: 'Tracking National Commitments, Pledges and Action Plans',
        insight:
          'Global Cooling Pledge signatories are growing. NDC cooling mentions and National Cooling Action Plans (NCAPs) are critical for implementation.',
        sources: [
          { name: 'Cool Coalition Pledge', url: 'https://coolcoalition.org/global-cooling-pledge/', logo: '/images/unep.png', logoLarge: true },
          { name: 'Net Zero Appliances NDC Toolkit', url: 'https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/', logo: '/images/clasp-logo.png' },
          { name: 'Find NCAPs at Climate Policy Radar', url: 'https://www.climatepolicyradar.org/', logo: '/images/climate-policy-radar-logo.jfif' }
        ]
      }
    };

    const updateSidePanels = (view: string) => {
      const meta = viewMeta[view] ?? viewMeta.overview;
      byId('page-headline').textContent = meta.headline;
      byId('page-subhead').textContent = meta.subhead;
      byId('insight-text').textContent = meta.insight;
      byId('source-list').innerHTML = meta.sources
        .map(
          (source) => {
            let logosHtml = '';
            if (source.logos && source.logos.length > 0) {
              logosHtml = source.logos.map(logo => `<img src="${logo}" alt="" class="source-logo${source.logoLarge ? ' source-logo-lg' : ''}" />`).join('');
            } else if (source.logo) {
              logosHtml = `<img src="${source.logo}" alt="" class="source-logo${source.logoLarge ? ' source-logo-lg' : ''}" />`;
            }
            return `<a class="source-item" href="${source.url}" target="_blank" rel="noreferrer">${logosHtml}${source.name}<i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
          }
        )
        .join('');
    };

    const updateSidebarStats = () => {
      const setLabel = (n: number, text: string) => { const el = byId(`stat-label-${n}`); if (el) el.textContent = text; };
      const setVal = (n: number, text: string | number) => { const el = byId(`stat-val-${n}`); if (el) el.textContent = String(text); };

      if (currentView === 'emissions') {
        try {
          const totals = getEmissionsTotals();
          if (emissionsDataSource === 'clasp') {
            const t = totals as { total: number; byAppliance: Record<string, number>; countriesCount: number };
            setLabel(1, 'Countries Covered');
            setVal(1, t.countriesCount);
            setLabel(2, `Total CO\u2082 (Mt)`);
            setVal(2, t.total.toFixed(1));
            setLabel(3, 'Scenario');
            setVal(3, emissionsScenario);
            setLabel(4, 'Year');
            setVal(4, emissionsYear);
          } else {
            const t = totals as { total: number; direct: number; indirect: number; countriesCount: number };
            setLabel(1, 'Countries Covered');
            setVal(1, t.countriesCount);
            setLabel(2, `Total (Mt CO\u2082e)`);
            setVal(2, t.total.toFixed(1));
            setLabel(3, `Direct (Mt)`);
            setVal(3, t.direct.toFixed(1));
            setLabel(4, `Indirect (Mt)`);
            setVal(4, t.indirect.toFixed(1));
          }
        } catch {
          // Data not ready yet
        }
      } else {
        // Default stats
        const pledgeCount = data.pledge.filter(p => p.signatory === 1).length;
        const kigaliCount = data.kigali.filter(k => k.kigali_party === 1).length;
        const mepsCountries = new Set(data.meps.map(m => m.country_code)).size;
        setLabel(1, 'Total Countries');
        setVal(1, data.countries.length);
        setLabel(2, 'GCP Coverage');
        setVal(2, `${Math.round(pledgeCount / data.countries.length * 100)}%`);
        setLabel(3, 'Kigali Coverage');
        setVal(3, `${Math.round(kigaliCount / data.kigali.length * 100)}%`);
        setLabel(4, 'MEPS Coverage');
        setVal(4, `${Math.round(mepsCountries / data.countries.length * 100)}%`);
      }
    };

    const updateViewingBadges = () => {
      // Get country name from global filter
      let label = 'Global';
      if (globalCountryFilter) {
        const country = data.countries.find(c => c.country_code === globalCountryFilter);
        label = country?.country_name || globalCountryFilter;
      }
      const emissionsViewing = document.getElementById('emissions-viewing');
      if (emissionsViewing) {
        emissionsViewing.textContent = label;
      }
      const mepsViewing = document.getElementById('meps-viewing');
      if (mepsViewing) {
        mepsViewing.textContent = label;
      }
      const kigaliViewing = document.getElementById('kigali-viewing');
      if (kigaliViewing) {
        kigaliViewing.textContent = label;
      }
      const accessViewing = document.getElementById('access-viewing');
      if (accessViewing) {
        accessViewing.textContent = label;
      }
      const policyViewing = document.getElementById('policy-viewing');
      if (policyViewing) {
        policyViewing.textContent = label;
      }
      updateEmissionsChartSubtitle();
    };

    const updateEmissionsChartSubtitle = () => {
      const el = document.getElementById('emissions-chart-sub');
      if (!el) return;
      const scopeLabels: Record<string, string> = {
        SplitAC: 'AC',
        DomRef: 'Fridge',
        all: 'Fan'
      };
      const scope = scopeLabels[emissionsAppliance] ?? 'AC';
      const region = selectedRegion ? selectedRegion : 'Global';
      el.textContent = `${scope} • ${region}`;
    };

    const setApplianceScope = (scope: string) => {
      const mapped = scopeToAppliance[scope] ?? 'all';
      emissionsAppliance = mapped;
      document.querySelectorAll<HTMLButtonElement>('.scope-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.scope === scope);
      });
      const applianceSelect = document.querySelector<HTMLSelectElement>('#emissions-appliance');
      if (applianceSelect) {
        applianceSelect.value = mapped;
      }
      if (currentView === 'emissions') {
        updateEmissionsMap();
      }
    };

        // =====================================================
        // STATUS & UTILITIES
        // =====================================================
        function setStatus(msg: string, type = '') {
            const el = byId('status');
            el.textContent = msg;
            el.className = type;
            if (type === 'success') {
                setTimeout(() => el.style.display = 'none', 2000);
            }
        }

        // =====================================================
        // KPI UPDATES
        // =====================================================
        function updateKPIs() {
            const pledgeCount = data.pledge.filter(p => p.signatory === 1).length;
            const kigaliCount = data.kigali.filter(k => k.kigali_party === 1).length;
            const mepsCountries = new Set(data.meps.map(m => m.country_code)).size;

            // Overview KPIs (match 3-card layout)
            setText('kpi-climate', '10%');
            setText('kpi-capacity', '3.0 Bn');
            setText('kpi-access', '1.2 Bn');

            // MEPS KPIs
            const mandatoryMeps = data.meps.filter(m => m.requirement_type === 'Mandatory').length;
            const voluntaryMeps = data.meps.filter(m => m.requirement_type === 'Voluntary').length;
            setText('meps-total', mepsCountries);
            setText('meps-mandatory', new Set(data.meps.filter(m => m.requirement_type === 'Mandatory').map(m => m.country_code)).size);
            setText('meps-voluntary', new Set(data.meps.filter(m => m.requirement_type === 'Voluntary').map(m => m.country_code)).size);
            setText('meps-none', data.countries.length - mepsCountries);

            // Kigali KPIs
            const montrealCount = data.kigali.filter(k => k.montreal_protocol_party === 1).length;
            const a5Count = data.kigali.filter(k => k.group_type && k.group_type.includes('A5')).length;
            setText('kigali-parties', kigaliCount);
            setText('montreal-parties', montrealCount);
            setText('kigali-a5', a5Count);
            setText('kigali-non', data.kigali.length - kigaliCount);

            // Access KPIs
            const accessRegions = new Set(data.access.map(a => a.region)).size;
            const totalPop = data.access.reduce((sum, a) => sum + (parseFloat(a.population_without_cooling) || 0), 0);
            setText('access-high', new Set(data.access.map(a => a.country_code)).size);
            setText('access-total', data.access.length);
            setText('access-pop', (totalPop / 1e9).toFixed(2));
            setText('access-regions', accessRegions);

            // Policy KPIs
            const bothCount = data.countries.filter(c => {
                const hasPledge = data.pledge.find(p => p.country_code === c.country_code && p.signatory === 1);
                const hasKigali = data.kigali.find(k => k.country_code === c.country_code && k.kigali_party === 1);
                return hasPledge && hasKigali;
            }).length;
            const noneCount = data.countries.filter(c => {
                const hasPledge = data.pledge.find(p => p.country_code === c.country_code && p.signatory === 1);
                const hasKigali = data.kigali.find(k => k.country_code === c.country_code && k.kigali_party === 1);
                const hasMeps = data.meps.find(m => m.country_code === c.country_code);
                return !hasPledge && !hasKigali && !hasMeps;
            }).length;
            // Policy KPIs are now updated by updateNDCKPIs()

            // Summary Stats
            setText('stat-updated', new Date().toLocaleDateString());
            updateSidebarStats();
        }

        // =====================================================
        // GLOBAL COUNTRY FILTER
        // =====================================================
        function populateCountryFilter() {
            const select = byId<HTMLSelectElement>('country-filter');
            if (!select) return;

            // Sort countries alphabetically by name
            const sortedCountries = [...data.countries]
                .filter(c => c.country_name)
                .sort((a, b) => (a.country_name || '').localeCompare(b.country_name || ''));

            select.innerHTML = '<option value="">All Countries</option>';
            sortedCountries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.country_code;
                option.textContent = country.country_name || country.country_code;
                select.appendChild(option);
            });
        }

        function updateViewsForCountryFilter() {
            // Update the current view based on the global country filter
            switch (currentView) {
                case 'emissions':
                    updateEmissionsView();
                    break;
                case 'meps':
                    updateMepsView();
                    break;
                case 'kigali':
                    updateKigaliView();
                    break;
                case 'access':
                    updateAccessView();
                    break;
                case 'policy':
                    updatePolicyView();
                    break;
                case 'overview':
                default:
                    updateKPIs();
                    updateMap();
                    break;
            }
        }

        // =====================================================
        // MAP
        // =====================================================
        // Complete ISO 3166-1 numeric to alpha-3 mapping
        const countryIdToCode: Record<string, string> = {
            '4': 'AFG', '8': 'ALB', '12': 'DZA', '16': 'ASM', '20': 'AND',
            '24': 'AGO', '28': 'ATG', '31': 'AZE', '32': 'ARG', '36': 'AUS',
            '40': 'AUT', '44': 'BHS', '48': 'BHR', '50': 'BGD', '51': 'ARM',
            '52': 'BRB', '56': 'BEL', '60': 'BMU', '64': 'BTN', '68': 'BOL',
            '70': 'BIH', '72': 'BWA', '76': 'BRA', '84': 'BLZ', '90': 'SLB',
            '96': 'BRN', '100': 'BGR', '104': 'MMR', '108': 'BDI', '112': 'BLR',
            '116': 'KHM', '120': 'CMR', '124': 'CAN', '132': 'CPV', '140': 'CAF',
            '144': 'LKA', '148': 'TCD', '152': 'CHL', '156': 'CHN', '158': 'TWN',
            '170': 'COL', '174': 'COM', '178': 'COG', '180': 'COD', '184': 'COK',
            '188': 'CRI', '191': 'HRV', '192': 'CUB', '196': 'CYP', '203': 'CZE',
            '204': 'BEN', '208': 'DNK', '212': 'DMA', '214': 'DOM', '218': 'ECU',
            '222': 'SLV', '226': 'GNQ', '231': 'ETH', '232': 'ERI', '233': 'EST',
            '238': 'FLK', '242': 'FJI', '246': 'FIN', '250': 'FRA', '260': 'ATF',
            '262': 'DJI', '266': 'GAB', '268': 'GEO', '270': 'GMB', '275': 'PSE',
            '276': 'DEU', '288': 'GHA', '296': 'KIR', '300': 'GRC', '304': 'DNK',
            '308': 'GRD', '320': 'GTM', '324': 'GIN', '328': 'GUY', '332': 'HTI',
            '340': 'HND', '348': 'HUN', '352': 'ISL', '356': 'IND', '360': 'IDN',
            '364': 'IRN', '368': 'IRQ', '372': 'IRL', '376': 'ISR', '380': 'ITA',
            '384': 'CIV', '388': 'JAM', '392': 'JPN', '398': 'KAZ', '400': 'JOR',
            '404': 'KEN', '408': 'PRK', '410': 'KOR', '414': 'KWT', '417': 'KGZ',
            '418': 'LAO', '422': 'LBN', '426': 'LSO', '428': 'LVA', '430': 'LBR',
            '434': 'LBY', '440': 'LTU', '442': 'LUX', '450': 'MDG', '454': 'MWI',
            '458': 'MYS', '462': 'MDV', '466': 'MLI', '470': 'MLT', '478': 'MRT',
            '480': 'MUS', '484': 'MEX', '496': 'MNG', '498': 'MDA', '499': 'MNE',
            '504': 'MAR', '508': 'MOZ', '512': 'OMN', '516': 'NAM', '520': 'NRU',
            '524': 'NPL', '528': 'NLD', '540': 'NCL', '548': 'VUT', '554': 'NZL',
            '558': 'NIC', '562': 'NER', '566': 'NGA', '570': 'NIU', '578': 'NOR',
            '583': 'FSM', '584': 'MHL', '585': 'PLW', '586': 'PAK', '591': 'PAN',
            '598': 'PNG', '600': 'PRY', '604': 'PER', '608': 'PHL', '616': 'POL',
            '620': 'PRT', '624': 'GNB', '626': 'TLS', '630': 'USA', '634': 'QAT',
            '642': 'ROU', '643': 'RUS', '646': 'RWA', '659': 'KNA', '662': 'LCA',
            '670': 'VCT', '678': 'STP', '682': 'SAU', '686': 'SEN', '688': 'SRB',
            '690': 'SYC', '694': 'SLE', '702': 'SGP', '703': 'SVK', '704': 'VNM',
            '705': 'SVN', '706': 'SOM', '710': 'ZAF', '716': 'ZWE', '724': 'ESP',
            '728': 'SSD', '729': 'SDN', '732': 'ESH', '740': 'SUR', '748': 'SWZ',
            '752': 'SWE', '756': 'CHE', '760': 'SYR', '762': 'TJK', '764': 'THA',
            '768': 'TGO', '776': 'TON', '780': 'TTO', '784': 'ARE', '788': 'TUN',
            '792': 'TUR', '795': 'TKM', '798': 'TUV', '800': 'UGA', '804': 'UKR',
            '807': 'MKD', '818': 'EGY', '826': 'GBR', '834': 'TZA', '840': 'USA',
            '854': 'BFA', '858': 'URY', '860': 'UZB', '862': 'VEN', '882': 'WSM',
            '887': 'YEM', '894': 'ZMB'
        };

        // Helper to normalize TopoJSON ID (removes leading zeros)
        function normalizeId(id: string | number | null | undefined) {
            if (id === undefined || id === null) return '';
            const num = parseInt(id, 10);
            if (isNaN(num)) return String(id);
            return String(num);
        }

        function getOverviewEmissionColor(code: string | undefined, maxValue: number, emissions: Record<string, any>) {
            if (!code) return '#e2e8f0';

            if (selectedRegion) {
                const country = data.countries.find(c => c.country_code === code);
                if (!country || country.region !== selectedRegion) return '#e2e8f0';
            }

            const record = emissions[code];
            return getEmissionsColor(record ? record.total : 0, maxValue);
        }

        let mapSvg: any;

        async function initMap() {
            const container = document.getElementById('map-container');
            // Skip initialization if container doesn't exist (overview redesigned without map)
            if (!container) {
                console.log('Overview map container not found, skipping map initialization');
                return;
            }
            const width = container.clientWidth || 800;
            const height = container.clientHeight || 400;

            mapSvg = d3.select('#map-container')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');

            const projection = d3.geoNaturalEarth1()
                .scale(width / 6)
                .translate([width / 2, height / 1.8]);

            const path = d3.geoPath().projection(projection);

            try {
                const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
                const countries = topojson.feature(world, world.objects.countries);

                const countryEmissions = getCountryEmissions();
                const maxEmissions = Math.max(...Object.values(countryEmissions).map((e: any) => e.total), 1);

                mapSvg.selectAll('path')
                    .data(countries.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('class', 'country-path')
                    .attr('data-code', d => countryIdToCode[normalizeId(d.id)] || '')
                    .attr('fill', d => getOverviewEmissionColor(countryIdToCode[normalizeId(d.id)], maxEmissions, countryEmissions))
                    .on('mouseover', handleEmissionsHover)
                    .on('mouseout', handleOut)
                    .on('click', handleClick);

                updateLegend();
            } catch (error) {
                console.error('Map error:', error);
            }
        }

        function updateMap() {
            // Skip if map wasn't initialized
            if (!mapSvg) return;

            const countryEmissions = getCountryEmissions();
            const maxEmissions = Math.max(...Object.values(countryEmissions).map((e: any) => e.total), 1);

            mapSvg.selectAll('.country-path')
                .transition()
                .duration(300)
                .attr('fill', function() {
                    const code = d3.select(this).attr('data-code');
                    return getOverviewEmissionColor(code, maxEmissions, countryEmissions);
                });
            updateLegend();
        }

        function updateLegend() {
            const legendEl = document.getElementById('legend');
            // Skip if legend element doesn't exist
            if (!legendEl) return;

            legendEl.innerHTML = `
                <div class="legend-item">
                    <div class="legend-color" style="background:#86efac"></div>
                    Low
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#fde047"></div>
                    Medium
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#fb923c"></div>
                    High
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#ef4444"></div>
                    Very High
                </div>
            `;
        }

        // =====================================================
        // TOOLTIP & CLICK HANDLERS
        // =====================================================
        const tooltip = byId('tooltip');

        function handleHover(event: MouseEvent, d: any) {
            const normalizedId = normalizeId(d.id);
            const code = countryIdToCode[normalizedId];

            // If no mapping exists, show the TopoJSON ID for debugging
            if (!code) {
                tooltip.innerHTML = `<em>Unknown country (ID: ${d.id} / ${normalizedId})</em>`;
                tooltip.style.opacity = 1;
                tooltip.style.left = (event.pageX + 10) + 'px';
                tooltip.style.top = (event.pageY + 10) + 'px';
                return;
            }

            const country = data.countries.find(c => c.country_code === code);

            // If country not in database, show what we know
            if (!country) {
                tooltip.innerHTML = `<strong>Code: ${code}</strong><br><em>Not in database</em>`;
                tooltip.style.opacity = 1;
                tooltip.style.left = (event.pageX + 10) + 'px';
                tooltip.style.top = (event.pageY + 10) + 'px';
                return;
            }

            let info = `<strong>${country.country_name}</strong><br>`;
            const pledgeRec = data.pledge.find(p => p.country_code === code);
            const kigaliRec = data.kigali.find(k => k.country_code === code);
            const mepsRec = data.meps.find(m => m.country_code === code);

            info += pledgeRec && pledgeRec.signatory === 1 ? '✓ GCP Signatory<br>' : '✗ Not GCP Signatory<br>';
            info += kigaliRec && kigaliRec.kigali_party === 1 ? '✓ Kigali Party<br>' : '✗ Not Kigali Party<br>';
            info += mepsRec ? '✓ Has MEPS Policy' : '✗ No MEPS Policy';

            tooltip.innerHTML = info;
            tooltip.style.opacity = 1;
            tooltip.style.left = (event.pageX + 10) + 'px';
            tooltip.style.top = (event.pageY + 10) + 'px';
        }

        function handleOut() {
            tooltip.style.opacity = 0;
        }

        function handleClick(event: MouseEvent, d: any) {
            const code = countryIdToCode[normalizeId(d.id)];
            const country = data.countries.find(c => c.country_code === code);
            if (!country) return;

            selectedCountry = code;
            globalCountryFilter = code;

            // Sync the sidebar dropdown
            const countryFilter = document.getElementById('country-filter') as HTMLSelectElement | null;
            if (countryFilter) {
                countryFilter.value = code;
            }

            // Highlight country on all maps
            highlightCountryOnMaps(code);

            // Update country detail panel
            updateCountryDetail(code);

            // Update viewing badges to show selected country
            updateViewingBadges();

            // Refresh views with the country filter
            updateViewsForCountryFilter();
        }

        function updateCountryDetail(code: string) {
            const country = data.countries.find(c => c.country_code === code);
            if (!country) return;

            // For Access view, show SEforALL data
            if (currentView === 'access') {
                updateAccessCountryDetailInSidebar(code, country);
                return;
            }

            // For Emissions view, show emissions data with charts
            if (currentView === 'emissions') {
                updateEmissionsCountryDetail(code, country);
                return;
            }

            // For MEPS view, show MEPS-specific details
            if (currentView === 'meps') {
                updateMepsCountryDetail(code);
                return;
            }

            // For Kigali view, show Kigali-specific details
            if (currentView === 'kigali') {
                updateKigaliCountryDetail(code);
                return;
            }

            const pledgeRec = data.pledge.find(p => p.country_code === code);
            const kigaliRec = data.kigali.find(k => k.country_code === code);
            const mepsRec = data.meps.find(m => m.country_code === code);
            const ndcRec = getNdcRecord(data, code, getNdcFilters());

            const hasPledge = pledgeRec && pledgeRec.signatory === 1;
            const hasKigali = kigaliRec && kigaliRec.kigali_party === 1;
            const hasMeps = !!mepsRec;
            const ndcStatus = ndcRec?.mention_status ?? 'No data';
            const ndcBadgeClass =
                ndcStatus === 'Mentioned'
                    ? 'green'
                    : ndcStatus === 'Not mentioned'
                        ? 'red'
                        : ndcStatus === 'No NDC submitted'
                            ? 'gray'
                            : 'gray';

            const detailMarkup = `
                <h4>${country.country_name}</h4>
                <div class="detail-row">
                    <span class="label">Region</span>
                    <span class="value">${country.region || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Country Code</span>
                    <span class="value">${code}</span>
                </div>
                <div class="detail-row">
                    <span class="label">GCP Status</span>
                    <span class="badge ${hasPledge ? 'green' : 'red'}">${hasPledge ? 'Signatory' : 'Non-signatory'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Kigali Status</span>
                    <span class="badge ${hasKigali ? 'blue' : 'red'}">${hasKigali ? 'Party' : 'Non-party'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">MEPS Policy</span>
                    <span class="badge ${hasMeps ? 'amber' : 'red'}">${hasMeps ? 'Has MEPS' : 'No MEPS'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">NDC Status</span>
                    <span class="badge ${ndcBadgeClass}">${ndcStatus}</span>
                </div>
                ${kigaliRec && kigaliRec.group_type ? `
                <div class="detail-row">
                    <span class="label">Kigali Group</span>
                    <span class="value">${kigaliRec.group_type}</span>
                </div>` : ''}
            `;

            document.querySelectorAll<HTMLElement>('.country-detail').forEach((el) => {
                el.innerHTML = detailMarkup;
            });
        }

        function highlightCountryOnMaps(code: string) {
            // Add highlight class to selected country on all maps
            document.querySelectorAll('.country-path, .meps-path, .kigali-path, .access-path, .emissions-path').forEach(path => {
                const pathCode = path.getAttribute('data-code');
                if (pathCode === code) {
                    path.classList.add('country-selected');
                } else {
                    path.classList.remove('country-selected');
                }
            });
        }

        function clearCountryHighlights() {
            // Remove highlight from all countries
            document.querySelectorAll('.country-selected').forEach(path => {
                path.classList.remove('country-selected');
            });
        }

        function updateAccessCountryDetailInSidebar(code: string, country: any) {
            // Target only the Access view's country detail element
            const accessDetail = document.querySelector('#access-country-detail .country-detail') as HTMLElement;
            if (!accessDetail) return;

            // Get all years of data for this country
            const countryData = data.access.filter(r => r.country_code === code);

            // Aggregate by year (sum all categories)
            const yearlyTotals = ACCESS_YEARS.map(year => {
                const yearData = countryData.filter(r => r.year === year);
                const total = yearData.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
                return { year, total };
            });

            // Build stacked data by category over time
            const categoryColors: Record<string, string> = {
                'Rural Poor': '#ef4444',
                'Urban Poor': '#f97316',
                'Lower-Middle Income': '#fbbf24',
                'Middle-Income': '#22c55e'
            };

            const stackedData = POPULATION_CATEGORIES.map(cat => {
                return {
                    name: cat,
                    data: ACCESS_YEARS.map(year => {
                        const yearCatData = countryData.filter(r => r.year === year && r.population_category === cat);
                        return yearCatData.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
                    }),
                    color: categoryColors[cat]
                };
            });

            // Current year data with breakdown by category
            const currentYearData = countryData.filter(r => r.year === accessYear);
            const currentYearTotal = currentYearData.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);

            // Category breakdown for current year (for pie chart)
            const categoryBreakdown = POPULATION_CATEGORIES.map(cat => {
                const catTotal = currentYearData
                    .filter(r => r.population_category === cat)
                    .reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
                return { category: cat, value: catTotal, color: categoryColors[cat] };
            }).filter(cb => cb.value > 0);

            // Calculate change from first to last year
            const firstYear = yearlyTotals[0];
            const lastYear = yearlyTotals[yearlyTotals.length - 1];
            const change = lastYear.total - firstYear.total;
            const changePercent = firstYear.total > 0 ? ((change / firstYear.total) * 100).toFixed(1) : '0';
            const changeColor = change > 0 ? '#ef4444' : '#22c55e';
            const changeIcon = change > 0 ? 'fa-arrow-up' : 'fa-arrow-down';

            // Impact level for current year
            const impactLevels = [...new Set(currentYearData.map(r => r.impact_level).filter(Boolean))];
            const primaryImpact = impactLevels.includes('High') ? 'High' : impactLevels.includes('Medium') ? 'Medium' : impactLevels[0] || 'N/A';
            const impactColor = primaryImpact === 'High' ? '#ef4444' : primaryImpact === 'Medium' ? '#f97316' : '#22c55e';

            // Set the HTML content with improved layout
            accessDetail.innerHTML = `
                <h4>${country.country_name}</h4>
                <div class="detail-row">
                    <span class="label">Region</span>
                    <span class="value">${country.region || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Impact Level</span>
                    <span class="badge" style="background: ${impactColor}; color: white;">${primaryImpact}</span>
                </div>
                <div class="detail-row">
                    <span class="label">${accessYear} Population at Risk</span>
                    <span class="value" style="font-weight: 600; color: #f97316;">${(currentYearTotal / 1e6).toFixed(1)}M</span>
                </div>
                <div class="detail-row">
                    <span class="label">Change (2013-2024)</span>
                    <span class="value" style="color: ${changeColor}">
                        <i class="fa-solid ${changeIcon}" style="font-size: 0.65rem;"></i>
                        ${Math.abs(Number(changePercent))}%
                    </span>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0.75rem 0;">
                <div style="font-size: 0.7rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">
                    <i class="fa-solid fa-chart-area" style="margin-right: 0.3rem;"></i>
                    Population at Risk by Category Over Time
                </div>
                <div class="access-stacked-chart" style="width: 100%; height: 180px; background: #fafafa; border-radius: 4px;"></div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0.75rem 0;">
                <div style="font-size: 0.7rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">
                    <i class="fa-solid fa-chart-pie" style="margin-right: 0.3rem;"></i>
                    ${accessYear} Distribution
                </div>
                <div class="access-pie-chart" style="width: 100%; height: 160px; background: #fafafa; border-radius: 4px;"></div>
            `;

            // Render charts after DOM update
            setTimeout(() => {
                const stackedContainer = accessDetail.querySelector('.access-stacked-chart') as HTMLElement;
                const pieContainer = accessDetail.querySelector('.access-pie-chart') as HTMLElement;

                // Dispose existing charts before creating new ones
                if (accessCountryStackedChart) {
                    accessCountryStackedChart.dispose();
                    accessCountryStackedChart = null;
                }
                if (accessCountryPieChart) {
                    accessCountryPieChart.dispose();
                    accessCountryPieChart = null;
                }

                // Render stacked area chart
                if (stackedContainer) {
                    accessCountryStackedChart = echarts.init(stackedContainer);
                    accessCountryStackedChart.setOption({
                        grid: { top: 15, right: 15, bottom: 30, left: 50 },
                        legend: { show: false },
                        xAxis: {
                            type: 'category',
                            data: ACCESS_YEARS.map(String),
                            axisLabel: { fontSize: 11, interval: 2, fontWeight: 500 },
                            axisLine: { lineStyle: { color: '#cbd5e1' } },
                            axisTick: { show: false },
                            boundaryGap: false
                        },
                        yAxis: {
                            type: 'value',
                            axisLabel: {
                                fontSize: 11,
                                fontWeight: 500,
                                formatter: (v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : String(v)
                            },
                            splitLine: { lineStyle: { color: '#f1f5f9' } }
                        },
                        series: stackedData.map((cat, idx) => ({
                            name: cat.name,
                            type: 'line',
                            stack: 'total',
                            smooth: true,
                            symbol: 'none',
                            lineStyle: { width: 0 },
                            areaStyle: {
                                opacity: 0.8,
                                color: cat.color
                            },
                            emphasis: { focus: 'series' },
                            data: cat.data
                        })),
                        tooltip: {
                            trigger: 'axis',
                            textStyle: { fontSize: 12 },
                            axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
                            formatter: (params: any) => {
                                let total = 0;
                                let html = `<strong style="font-size:13px">${params[0].axisValue}</strong><br/>`;
                                params.forEach((p: any) => {
                                    if (p.value > 0) {
                                        html += `<span style="display:inline-block;width:10px;height:10px;background:${p.color};border-radius:50%;margin-right:5px;"></span>${p.seriesName}: ${(p.value / 1e6).toFixed(2)}M<br/>`;
                                        total += p.value;
                                    }
                                });
                                html += `<strong>Total: ${(total / 1e6).toFixed(2)}M</strong>`;
                                return html;
                            }
                        }
                    });
                }

                // Render pie/doughnut chart
                if (pieContainer && categoryBreakdown.length > 0) {
                    accessCountryPieChart = echarts.init(pieContainer);
                    accessCountryPieChart.setOption({
                        tooltip: {
                            trigger: 'item',
                            textStyle: { fontSize: 12 },
                            formatter: (params: any) => `<strong style="font-size:13px">${params.name}</strong><br/>${(params.value / 1e6).toFixed(2)}M (${params.percent}%)`
                        },
                        legend: { show: false },
                        series: [{
                            type: 'pie',
                            radius: ['35%', '65%'],
                            center: ['50%', '50%'],
                            avoidLabelOverlap: true,
                            itemStyle: {
                                borderRadius: 4,
                                borderColor: '#fff',
                                borderWidth: 2
                            },
                            label: {
                                show: true,
                                position: 'outside',
                                fontSize: 11,
                                fontWeight: 500,
                                formatter: (params: any) => {
                                    const shortName = params.name
                                        .replace('Rural Poor', 'Rural')
                                        .replace('Urban Poor', 'Urban')
                                        .replace('Lower-Middle Income', 'Lower-Mid')
                                        .replace('Middle-Income', 'Middle');
                                    return `${shortName}\n${params.percent}%`;
                                }
                            },
                            labelLine: { show: true, length: 8, length2: 8 },
                            emphasis: {
                                label: { show: true, fontSize: 13, fontWeight: 'bold' },
                                itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
                            },
                            data: categoryBreakdown.map(c => ({
                                name: c.category,
                                value: c.value,
                                itemStyle: { color: c.color }
                            }))
                        }]
                    });
                } else if (pieContainer) {
                    pieContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 0.75rem;">No data for selected year</div>';
                }
            }, 100);
        }

        function updateEmissionsCountryDetail(code: string, country: any) {
            // Target the Emissions view's country detail element
            const emissionsDetail = document.querySelector('#emissions-country-detail .country-detail') as HTMLElement;
            if (!emissionsDetail) return;

            // Get country region from regions data
            const regionData = data.regions.find(r => r.country_code === code);
            const region = regionData?.region || country.region || 'N/A';

            // Colors for appliances/subsectors and emission types
            const applianceColors: Record<string, string> = {
                'Air Conditioning': '#3b82f6',
                'Ceiling and Portable Fans': '#22c55e',
                'Refrigerator-Freezers': '#f97316',
                'Split residential air conditioners': '#3b82f6',
                'Domestic refrigeration': '#f97316'
            };
            const emissionTypeColors: Record<string, string> = {
                'Direct': '#ef4444',
                'Indirect': '#3b82f6'
            };

            let years: number[] = [];
            let stackedSeriesData: { name: string; data: number[]; color: string }[] = [];
            let currentYearBreakdown: { name: string; value: number; color: string }[] = [];
            let currentYearTotal = 0;
            let dataSourceLabel = '';
            let scenarioLabel = '';

            if (emissionsDataSource === 'clasp') {
                dataSourceLabel = 'CLASP (Indirect)';
                scenarioLabel = CLASP_SCENARIO_NAMES[emissionsScenario] || emissionsScenario;

                // Get all country data across all years
                const countryClaspData = data.claspEnergy.filter(r =>
                    r.country_code === code &&
                    (emissionsAppliances.length === 0 || emissionsAppliances.includes(r.appliance))
                );

                // Get unique years (filtered to 2020-2045)
                const yearSet = new Set<number>();
                countryClaspData.forEach(r => {
                    if (r.year >= 2020 && r.year <= 2045) yearSet.add(r.year);
                });
                years = Array.from(yearSet).sort((a, b) => a - b);

                // Build stacked data by appliance
                const appliancesToShow = emissionsAppliances.length > 0 ? emissionsAppliances : CLASP_APPLIANCES;
                appliancesToShow.forEach(appliance => {
                    const appData = years.map(year => {
                        const records = countryClaspData.filter(r => r.year === year && r.appliance === appliance);
                        return records.reduce((sum, r) => sum + getClaspCO2(r, emissionsScenario), 0);
                    });
                    // Only add if there's data
                    if (appData.some(v => v > 0)) {
                        stackedSeriesData.push({
                            name: CLASP_APPLIANCE_SHORT[appliance] || appliance,
                            data: appData,
                            color: applianceColors[appliance] || '#64748b'
                        });
                    }
                });

                // Current year breakdown by appliance
                const currentYearClaspData = countryClaspData.filter(r => r.year === emissionsYear);
                const applianceMap = new Map<string, number>();
                currentYearClaspData.forEach(r => {
                    const co2 = getClaspCO2(r, emissionsScenario);
                    applianceMap.set(r.appliance, (applianceMap.get(r.appliance) || 0) + co2);
                });
                currentYearBreakdown = Array.from(applianceMap.entries())
                    .filter(([_, val]) => val > 0)
                    .map(([name, value]) => ({
                        name: CLASP_APPLIANCE_SHORT[name] || name,
                        value,
                        color: applianceColors[name] || '#64748b'
                    }));
                currentYearTotal = currentYearClaspData.reduce((sum, r) => sum + getClaspCO2(r, emissionsScenario), 0);

            } else {
                dataSourceLabel = 'HEAT Modelling';
                scenarioLabel = HEAT_SCENARIO_NAMES[emissionsScenario] || emissionsScenario;

                // Get all country data across all years for selected scenario
                const countrySubcoolData = data.subcool.filter(r =>
                    r.country_code === code &&
                    r.scenario_name === emissionsScenario
                );

                // Get unique years (filtered to 2020-2045)
                const yearSet = new Set<number>();
                countrySubcoolData.forEach(r => {
                    if (r.year >= 2020 && r.year <= 2045) yearSet.add(r.year);
                });
                years = Array.from(yearSet).sort((a, b) => a - b);

                // Build stacked data by direct/indirect emissions
                const directData = years.map(year => {
                    const records = countrySubcoolData.filter(r => r.year === year);
                    return records.reduce((sum, r) => sum + (r.direct_emission_mt || 0), 0);
                });
                const indirectData = years.map(year => {
                    const records = countrySubcoolData.filter(r => r.year === year);
                    return records.reduce((sum, r) => sum + (r.indirect_emission_mt || 0), 0);
                });

                if (directData.some(v => v > 0)) {
                    stackedSeriesData.push({
                        name: 'Direct (Refrigerants)',
                        data: directData,
                        color: emissionTypeColors['Direct']
                    });
                }
                if (indirectData.some(v => v > 0)) {
                    stackedSeriesData.push({
                        name: 'Indirect (Energy)',
                        data: indirectData,
                        color: emissionTypeColors['Indirect']
                    });
                }

                // Current year breakdown by emission type
                const currentYearSubcoolData = countrySubcoolData.filter(r => r.year === emissionsYear);
                const directTotal = currentYearSubcoolData.reduce((sum, r) => sum + (r.direct_emission_mt || 0), 0);
                const indirectTotal = currentYearSubcoolData.reduce((sum, r) => sum + (r.indirect_emission_mt || 0), 0);

                if (directTotal > 0) {
                    currentYearBreakdown.push({ name: 'Direct', value: directTotal, color: emissionTypeColors['Direct'] });
                }
                if (indirectTotal > 0) {
                    currentYearBreakdown.push({ name: 'Indirect', value: indirectTotal, color: emissionTypeColors['Indirect'] });
                }
                currentYearTotal = directTotal + indirectTotal;
            }

            // Calculate trend (first vs last available year total)
            let changePercent = '0';
            let changeColor = '#64748b';
            let changeIcon = 'fa-minus';
            if (years.length >= 2) {
                const firstYearTotal = stackedSeriesData.reduce((sum, s) => sum + (s.data[0] || 0), 0);
                const lastYearTotal = stackedSeriesData.reduce((sum, s) => sum + (s.data[s.data.length - 1] || 0), 0);
                const change = lastYearTotal - firstYearTotal;
                if (firstYearTotal > 0) {
                    changePercent = ((change / firstYearTotal) * 100).toFixed(1);
                }
                changeColor = change > 0 ? '#ef4444' : change < 0 ? '#22c55e' : '#64748b';
                changeIcon = change > 0 ? 'fa-arrow-up' : change < 0 ? 'fa-arrow-down' : 'fa-minus';
            }

            // Chart title based on data source
            const chartTitle = emissionsDataSource === 'clasp'
                ? 'Emissions by Appliance Over Time'
                : 'Direct vs Indirect Emissions Over Time';

            // Set the HTML content
            emissionsDetail.innerHTML = `
                <h4>${country.country_name}</h4>
                <div class="detail-row">
                    <span class="label">Region</span>
                    <span class="value">${region}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Data Source</span>
                    <span class="badge blue">${dataSourceLabel}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Scenario</span>
                    <span class="value">${scenarioLabel}</span>
                </div>
                <div class="detail-row">
                    <span class="label">${emissionsYear} Emissions</span>
                    <span class="value" style="font-weight: 600; color: #ef4444;">${currentYearTotal.toFixed(2)} Mt CO2</span>
                </div>
                <div class="detail-row">
                    <span class="label">Trend</span>
                    <span class="value" style="color: ${changeColor}">
                        <i class="fa-solid ${changeIcon}" style="font-size: 0.65rem;"></i>
                        ${Math.abs(Number(changePercent))}%
                    </span>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0.75rem 0;">
                <div style="font-size: 0.7rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">
                    <i class="fa-solid fa-chart-area" style="margin-right: 0.3rem;"></i>
                    ${chartTitle}
                </div>
                <div class="emissions-line-chart" style="width: 100%; height: 180px; background: #fafafa; border-radius: 4px;"></div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0.75rem 0;">
                <div style="font-size: 0.7rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">
                    <i class="fa-solid fa-chart-pie" style="margin-right: 0.3rem;"></i>
                    ${emissionsYear} Breakdown
                </div>
                <div class="emissions-pie-chart" style="width: 100%; height: 160px; background: #fafafa; border-radius: 4px;"></div>
            `;

            // Render charts after DOM update
            setTimeout(() => {
                const lineContainer = emissionsDetail.querySelector('.emissions-line-chart') as HTMLElement;
                const pieContainer = emissionsDetail.querySelector('.emissions-pie-chart') as HTMLElement;

                // Dispose existing charts before creating new ones
                if (emissionsCountryLineChart) {
                    emissionsCountryLineChart.dispose();
                    emissionsCountryLineChart = null;
                }
                if (emissionsCountryPieChart) {
                    emissionsCountryPieChart.dispose();
                    emissionsCountryPieChart = null;
                }

                // Render stacked area chart
                if (lineContainer && years.length > 0 && stackedSeriesData.length > 0) {
                    emissionsCountryLineChart = echarts.init(lineContainer);
                    emissionsCountryLineChart.setOption({
                        grid: { top: 30, right: 10, bottom: 28, left: 50 },
                        legend: {
                            show: true,
                            top: 0,
                            left: 'center',
                            itemWidth: 14,
                            itemHeight: 10,
                            textStyle: { fontSize: 11, color: '#475569', fontWeight: 500 },
                            itemGap: 10
                        },
                        xAxis: {
                            type: 'category',
                            data: years.map(String),
                            axisLabel: { fontSize: 11, interval: 'auto', fontWeight: 500, color: '#475569' },
                            axisLine: { lineStyle: { color: '#cbd5e1' } },
                            axisTick: { show: false },
                            boundaryGap: false
                        },
                        yAxis: {
                            type: 'value',
                            axisLabel: {
                                fontSize: 11,
                                fontWeight: 500,
                                color: '#475569',
                                formatter: (v: number) => v >= 1 ? `${v.toFixed(1)}` : v >= 0.001 ? `${(v * 1000).toFixed(0)}k` : String(v)
                            },
                            splitLine: { lineStyle: { color: '#e2e8f0' } },
                            name: 'Mt CO2',
                            nameLocation: 'middle',
                            nameGap: 35,
                            nameTextStyle: { fontSize: 10, color: '#64748b', fontWeight: 500 }
                        },
                        series: stackedSeriesData.map((s, idx) => ({
                            name: s.name,
                            type: 'line',
                            stack: 'total',
                            smooth: true,
                            symbol: 'none',
                            color: s.color,
                            lineStyle: { width: 0 },
                            areaStyle: { opacity: 0.8 },
                            emphasis: { focus: 'series' },
                            data: s.data
                        })),
                        tooltip: {
                            trigger: 'axis',
                            textStyle: { fontSize: 11 },
                            axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
                            formatter: (params: any) => {
                                let total = 0;
                                let html = `<strong style="font-size:12px">${params[0].axisValue}</strong><br/>`;
                                params.forEach((p: any) => {
                                    if (p.value > 0) {
                                        html += `<span style="display:inline-block;width:8px;height:8px;background:${p.color};border-radius:50%;margin-right:4px;"></span>${p.seriesName}: ${p.value.toFixed(3)} Mt<br/>`;
                                        total += p.value;
                                    }
                                });
                                html += `<strong>Total: ${total.toFixed(3)} Mt</strong>`;
                                return html;
                            }
                        }
                    });
                } else if (lineContainer) {
                    lineContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 0.75rem;">No data available</div>';
                }

                // Render pie/doughnut chart
                if (pieContainer && currentYearBreakdown.length > 0) {
                    emissionsCountryPieChart = echarts.init(pieContainer);
                    emissionsCountryPieChart.setOption({
                        tooltip: {
                            trigger: 'item',
                            textStyle: { fontSize: 12 },
                            formatter: (params: any) => `<strong>${params.name}</strong><br/>${params.value.toFixed(3)} Mt CO2 (${params.percent}%)`
                        },
                        legend: { show: false },
                        series: [{
                            type: 'pie',
                            radius: ['35%', '65%'],
                            center: ['50%', '50%'],
                            avoidLabelOverlap: true,
                            itemStyle: {
                                borderRadius: 4,
                                borderColor: '#fff',
                                borderWidth: 2
                            },
                            label: {
                                show: true,
                                position: 'outside',
                                fontSize: 11,
                                fontWeight: 500,
                                color: '#475569',
                                formatter: (params: any) => `${params.name}\n${params.percent}%`
                            },
                            labelLine: { show: true, length: 10, length2: 10 },
                            emphasis: {
                                label: { show: true, fontSize: 14, fontWeight: 'bold' },
                                itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
                            },
                            data: currentYearBreakdown.map(c => ({
                                name: c.name,
                                value: c.value,
                                itemStyle: { color: c.color }
                            }))
                        }]
                    });
                } else if (pieContainer) {
                    pieContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 0.75rem;">No data for selected year</div>';
                }
            }, 100);
        }

        // =====================================================
        // CHARTS
        // =====================================================
        const charts: Record<string, any> = {};
        let accessCountryChart: echarts.ECharts | null = null;
        let accessCountryStackedChart: echarts.ECharts | null = null;
        let accessCountryPieChart: echarts.ECharts | null = null;
        let emissionsCountryLineChart: echarts.ECharts | null = null;
        let emissionsCountryPieChart: echarts.ECharts | null = null;

        const getChartEl = (id: string) => document.getElementById(id) as HTMLDivElement | null;

        const initChart = (id: string) => {
            const el = getChartEl(id);
            if (!el) return null;
            return echarts.init(el);
        };

        const setChart = (id: string, option: any) => {
            const el = getChartEl(id);
            if (!el) return;
            if (!charts[id]) {
                charts[id] = echarts.init(el);
            } else if (charts[id].getDom && charts[id].getDom() !== el) {
                charts[id].dispose();
                charts[id] = echarts.init(el);
            }
            charts[id].setOption(option, true);
        };

        const resizeCharts = () => {
            Object.values(charts).forEach((chart) => chart && chart.resize && chart.resize());
            if (accessCountryChart) accessCountryChart.resize();
            if (accessCountryStackedChart) accessCountryStackedChart.resize();
            if (accessCountryPieChart) accessCountryPieChart.resize();
            if (emissionsCountryLineChart) emissionsCountryLineChart.resize();
            if (emissionsCountryPieChart) emissionsCountryPieChart.resize();
        };

        const baseGrid = {
            left: '3%',
            right: '3%',
            bottom: '8%',
            containLabel: true
        };

        const axisLabel = { color: '#475569' };
        const axisLine = { lineStyle: { color: '#e2e8f0' } };
        const splitLine = { lineStyle: { color: '#e2e8f0' } };

        const categoryAxis = (labels: string[]) => ({
            type: 'category',
            data: labels,
            axisLabel,
            axisLine,
            axisTick: { alignWithLabel: true }
        });

        const valueAxis = () => ({
            type: 'value',
            axisLabel,
            axisLine,
            splitLine
        });

        function initCharts() {
            // Regional Signatories Chart
            const regionData = {};
            data.countries.forEach(c => {
                if (c.region) {
                    regionData[c.region] = regionData[c.region] || { total: 0, signatories: 0 };
                    regionData[c.region].total++;
                    const pledge = data.pledge.find(p => p.country_code === c.country_code);
                    if (pledge && pledge.signatory === 1) regionData[c.region].signatories++;
                }
            });

            const labels = Object.keys(regionData).sort();
            setChart('chart-region', {
                tooltip: { trigger: 'axis' },
                legend: { textStyle: { color: '#475569' } },
                grid: baseGrid,
                xAxis: categoryAxis(labels),
                yAxis: valueAxis(),
                series: [
                    {
                        name: 'Signatories',
                        type: 'bar',
                        stack: 'total',
                        data: labels.map(r => regionData[r].signatories),
                        itemStyle: { color: '#22c55e' }
                    },
                    {
                        name: 'Non-signatories',
                        type: 'bar',
                        stack: 'total',
                        data: labels.map(r => regionData[r].total - regionData[r].signatories),
                        itemStyle: { color: '#475569' }
                    }
                ]
            });

            // Protocol Distribution Chart
            const kigaliCount = data.kigali.filter(k => k.kigali_party === 1).length;
            const pledgeOnly = data.countries.filter(c => {
                const hasPledge = data.pledge.find(p => p.country_code === c.country_code && p.signatory === 1);
                const hasKigali = data.kigali.find(k => k.country_code === c.country_code && k.kigali_party === 1);
                return hasPledge && !hasKigali;
            }).length;
            const kigaliOnly = data.countries.filter(c => {
                const hasPledge = data.pledge.find(p => p.country_code === c.country_code && p.signatory === 1);
                const hasKigali = data.kigali.find(k => k.country_code === c.country_code && k.kigali_party === 1);
                return !hasPledge && hasKigali;
            }).length;
            const both = data.countries.filter(c => {
                const hasPledge = data.pledge.find(p => p.country_code === c.country_code && p.signatory === 1);
                const hasKigali = data.kigali.find(k => k.country_code === c.country_code && k.kigali_party === 1);
                return hasPledge && hasKigali;
            }).length;

            setChart('chart-protocol', {
                tooltip: { trigger: 'item' },
                legend: { bottom: 0, textStyle: { color: '#475569' } },
                series: [
                    {
                        type: 'pie',
                        radius: ['45%', '70%'],
                        label: { show: false },
                        data: [
                            { value: both, name: 'Both GCP + Kigali', itemStyle: { color: '#22c55e' } },
                            { value: pledgeOnly, name: 'GCP Only', itemStyle: { color: '#3b82f6' } },
                            { value: kigaliOnly, name: 'Kigali Only', itemStyle: { color: '#f59e0b' } },
                            {
                                value: data.countries.length - both - pledgeOnly - kigaliOnly,
                                name: 'Neither',
                                itemStyle: { color: '#475569' }
                            }
                        ]
                    }
                ]
            });

            // MEPS regional trend chart (2020-2050)
            const mepsYears = ['2020', '2025', '2030', '2035', '2040', '2045', '2050'];
            setChart('chart-meps-region', {
                tooltip: { trigger: 'axis' },
                grid: baseGrid,
                xAxis: categoryAxis(mepsYears),
                yAxis: valueAxis(),
                legend: { bottom: 0, textStyle: { color: '#475569' } },
                series: [
                    {
                        name: 'Developed Regions',
                        type: 'line',
                        data: [3.2, 3.5, 3.8, 4.1, 4.4, 4.6, 4.8],
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: { color: '#22c55e', width: 3 },
                        itemStyle: { color: '#22c55e' }
                    },
                    {
                        name: 'Developing Asia',
                        type: 'line',
                        data: [2.0, 2.3, 2.7, 3.1, 3.5, 3.9, 4.2],
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: { color: '#f59e0b', width: 3 },
                        itemStyle: { color: '#f59e0b' }
                    },
                    {
                        name: 'Africa & LatAm',
                        type: 'line',
                        data: [1.2, 1.5, 1.9, 2.3, 2.8, 3.2, 3.6],
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: { color: '#ef4444', width: 3 },
                        itemStyle: { color: '#ef4444' }
                    }
                ]
            });

            // Refrigerant transition market share (2020-2050)
            const refrigerantYears = ['2020', '2025', '2030', '2035', '2040', '2045', '2050'];
            setChart('chart-kigali-transition', {
                tooltip: { trigger: 'axis' },
                grid: baseGrid,
                legend: { bottom: 0, textStyle: { color: '#475569' } },
                xAxis: categoryAxis(refrigerantYears),
                yAxis: valueAxis(),
                series: [
                    {
                        name: 'R410A (GWP >2000)',
                        type: 'line',
                        data: [75, 55, 35, 20, 10, 5, 2],
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: { color: '#ef4444', width: 3 },
                        itemStyle: { color: '#ef4444' }
                    },
                    {
                        name: 'R32 (GWP ~675)',
                        type: 'line',
                        data: [20, 35, 45, 50, 45, 35, 25],
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: { color: '#f59e0b', width: 3 },
                        itemStyle: { color: '#f59e0b' }
                    },
                    {
                        name: 'R290 (GWP <5)',
                        type: 'line',
                        data: [5, 10, 20, 30, 45, 60, 73],
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: { color: '#22c55e', width: 3 },
                        itemStyle: { color: '#22c55e' }
                    }
                ]
            });

            // Access risk chart
            const accessYears = ['2020', '2025', '2030', '2035', '2040', '2045', '2050'];
            setChart('chart-access-risk', {
                tooltip: { trigger: 'axis' },
                legend: { bottom: 0, textStyle: { color: '#475569' } },
                grid: baseGrid,
                xAxis: categoryAxis(accessYears),
                yAxis: valueAxis(),
                series: [
                    {
                        name: 'Urban Poor',
                        type: 'bar',
                        data: [0.3, 0.35, 0.4, 0.38, 0.35, 0.3, 0.25],
                        itemStyle: { color: '#ef4444' }
                    },
                    {
                        name: 'Rural Poor',
                        type: 'bar',
                        data: [0.8, 0.75, 0.7, 0.62, 0.55, 0.45, 0.35],
                        itemStyle: { color: '#f97316' }
                    }
                ]
            });

            // Policy Timeline Chart
            const yearData = {};
            data.meps.forEach(m => {
                if (m.year_adopted) {
                    yearData[m.year_adopted] = (yearData[m.year_adopted] || 0) + 1;
                }
            });
            const years = Object.keys(yearData).sort();
            let cumulative = 0;
            const cumulativeData = years.map(y => {
                cumulative += yearData[y];
                return cumulative;
            });
            setChart('chart-policy-timeline', {
                tooltip: { trigger: 'axis' },
                grid: baseGrid,
                xAxis: categoryAxis(years),
                yAxis: valueAxis(),
                series: [
                    {
                        name: 'Cumulative MEPS Policies',
                        type: 'line',
                        data: cumulativeData,
                        smooth: true,
                        lineStyle: { color: '#22c55e' },
                        areaStyle: { color: 'rgba(34, 197, 94, 0.15)' },
                        itemStyle: { color: '#22c55e' }
                    }
                ]
            });

            // Global Cooling Pledge Signatories
            setChart('chart-policy-pledge', {
                tooltip: { trigger: 'axis' },
                grid: baseGrid,
                xAxis: categoryAxis(['COP26', 'COP27', 'COP28', 'COP29', 'Today']),
                yAxis: valueAxis(),
                series: [
                    {
                        name: 'Signatories',
                        type: 'line',
                        data: [0, 15, 64, 72, 75],
                        smooth: true,
                        lineStyle: { color: '#6366f1', width: 3 },
                        itemStyle: { color: '#6366f1' },
                        areaStyle: { color: 'rgba(99, 102, 241, 0.15)' }
                    }
                ]
            });
        }

        // =====================================================
        // EMISSIONS (Enhanced with CLASP and Subcool data)
        // =====================================================
        let emissionsMapSvg: any;

        function getFilteredEmissions() {
            return getEmissionsData(data, getEmissionsFilters());
        }

        // Get region for a country code
        function getCountryRegion(code: string): string {
            const regionRec = data.regions.find(r => r.country_code === code);
            return regionRec?.region || '';
        }

        // Get CLASP data filtered by current selections
        function getFilteredClaspData() {
            return data.claspEnergy.filter(r => {
                // Global country filter from sidebar
                if (globalCountryFilter && r.country_code !== globalCountryFilter) return false;
                if (r.year !== emissionsYear) return false;
                if (emissionsAppliances.length > 0 && !emissionsAppliances.includes(r.appliance)) return false;
                if (emissionsRegion) {
                    const region = getCountryRegion(r.country_code);
                    if (region !== emissionsRegion) return false;
                }
                return true;
            });
        }

        // Get CO2 value based on scenario from CLASP record
        function getClaspCO2(record: any, scenario: string): number {
            switch (scenario) {
                case 'BAU': return record.bau_co2_mt || 0;
                case 'GB': return record.gb_co2_mt || 0;
                case 'NZH': return record.nzh_co2_mt || 0;
                case 'BAT': return record.bat_co2_mt || 0;
                default: return record.bau_co2_mt || 0;
            }
        }

        // Get Subcool data filtered by current selections
        function getFilteredSubcoolData() {
            return data.subcool.filter(r => {
                // Global country filter from sidebar
                if (globalCountryFilter && r.country_code !== globalCountryFilter) return false;
                if (r.year !== emissionsYear) return false;
                if (r.scenario_name !== emissionsScenario) return false;
                if (emissionsRegion) {
                    const region = getCountryRegion(r.country_code);
                    if (region !== emissionsRegion) return false;
                }
                return true;
            });
        }

        // Aggregate CLASP emissions by country
        function getClaspEmissionsByCountry(): Record<string, { name: string; total: number; byAppliance: Record<string, number> }> {
            const filtered = getFilteredClaspData();
            const result: Record<string, { name: string; total: number; byAppliance: Record<string, number> }> = {};

            filtered.forEach(r => {
                const co2 = getClaspCO2(r, emissionsScenario);
                if (!result[r.country_code]) {
                    result[r.country_code] = { name: r.country_name, total: 0, byAppliance: {} };
                }
                result[r.country_code].total += co2;
                result[r.country_code].byAppliance[r.appliance] = (result[r.country_code].byAppliance[r.appliance] || 0) + co2;
            });

            return result;
        }

        // Aggregate Subcool emissions by country
        function getSubcoolEmissionsByCountry(): Record<string, { name: string; total: number; direct: number; indirect: number; bySubsector: Record<string, { direct: number; indirect: number }> }> {
            const filtered = getFilteredSubcoolData();
            const result: Record<string, { name: string; total: number; direct: number; indirect: number; bySubsector: Record<string, { direct: number; indirect: number }> }> = {};

            filtered.forEach(r => {
                const direct = r.direct_emission_mt || 0;
                const indirect = r.indirect_emission_mt || 0;

                if (!result[r.country_code]) {
                    result[r.country_code] = { name: r.country_name, total: 0, direct: 0, indirect: 0, bySubsector: {} };
                }
                result[r.country_code].total += direct + indirect;
                result[r.country_code].direct += direct;
                result[r.country_code].indirect += indirect;

                if (!result[r.country_code].bySubsector[r.subsector]) {
                    result[r.country_code].bySubsector[r.subsector] = { direct: 0, indirect: 0 };
                }
                result[r.country_code].bySubsector[r.subsector].direct += direct;
                result[r.country_code].bySubsector[r.subsector].indirect += indirect;
            });

            return result;
        }

        // Get emissions totals for KPIs
        function getEmissionsTotals() {
            if (emissionsDataSource === 'clasp') {
                const byCountry = getClaspEmissionsByCountry();
                let total = 0;
                const byAppliance: Record<string, number> = {};
                CLASP_APPLIANCES.forEach(a => byAppliance[a] = 0);

                Object.values(byCountry).forEach(c => {
                    total += c.total;
                    Object.entries(c.byAppliance).forEach(([app, val]) => {
                        byAppliance[app] = (byAppliance[app] || 0) + val;
                    });
                });

                return { total, byAppliance, countriesCount: Object.keys(byCountry).length };
            } else {
                const byCountry = getSubcoolEmissionsByCountry();
                let total = 0, direct = 0, indirect = 0;
                const bySubsector: Record<string, { direct: number; indirect: number }> = {};

                Object.values(byCountry).forEach(c => {
                    total += c.total;
                    direct += c.direct;
                    indirect += c.indirect;
                    Object.entries(c.bySubsector).forEach(([sub, val]) => {
                        if (!bySubsector[sub]) bySubsector[sub] = { direct: 0, indirect: 0 };
                        bySubsector[sub].direct += val.direct;
                        bySubsector[sub].indirect += val.indirect;
                    });
                });

                return { total, direct, indirect, bySubsector, countriesCount: Object.keys(byCountry).length };
            }
        }

        // Update emissions KPIs with new data
        function updateNewEmissionsKPIs() {
            const totals = getEmissionsTotals();

            if (emissionsDataSource === 'clasp') {
                const t = totals as { total: number; byAppliance: Record<string, number>; countriesCount: number };
                setText('emissions-kpi-total', t.total.toFixed(1));
                setText('emissions-kpi-ac', (t.byAppliance['Air Conditioning'] || 0).toFixed(1));
                setText('emissions-kpi-fans', (t.byAppliance['Ceiling and Portable Fans'] || 0).toFixed(1));
                setText('emissions-kpi-fridge', (t.byAppliance['Refrigerator-Freezers'] || 0).toFixed(1));
                setText('emissions-kpi-countries', t.countriesCount);
            } else {
                const t = totals as { total: number; direct: number; indirect: number; bySubsector: Record<string, { direct: number; indirect: number }>; countriesCount: number };
                setText('emissions-kpi-total', t.total.toFixed(1));
                const acData = t.bySubsector['Split residential air conditioners'] || { direct: 0, indirect: 0 };
                const refData = t.bySubsector['Domestic refrigeration'] || { direct: 0, indirect: 0 };
                setText('emissions-kpi-ac', (acData.direct + acData.indirect).toFixed(1));
                setText('emissions-kpi-fridge', (refData.direct + refData.indirect).toFixed(1));
                setText('emissions-kpi-fans', '-'); // Subcool doesn't have fans
                setText('emissions-kpi-countries', t.countriesCount);
            }
        }

        // Get emissions value for map coloring
        function getEmissionsMapValue(countryCode: string): number {
            if (emissionsDataSource === 'clasp') {
                const byCountry = getClaspEmissionsByCountry();
                return byCountry[countryCode]?.total || 0;
            } else {
                const byCountry = getSubcoolEmissionsByCountry();
                const country = byCountry[countryCode];
                if (!country) return 0;
                if (emissionsType === 'direct') return country.direct;
                if (emissionsType === 'indirect') return country.indirect;
                return country.total;
            }
        }

        function getCountryEmissions() {
            const filtered = getFilteredEmissions();
            const countryEmissions: Record<
                string,
                {
                    name?: string | null;
                    region?: string | null;
                    total: number;
                    direct: number;
                    indirect: number;
                }
            > = {};

            filtered.forEach(e => {
                if (!countryEmissions[e.country_code]) {
                    countryEmissions[e.country_code] = {
                        name: e.country_name,
                        region: e.region,
                        total: 0,
                        direct: 0,
                        indirect: 0
                    };
                }
                countryEmissions[e.country_code].total += e.total_emissions || 0;
                countryEmissions[e.country_code].direct += e.direct_emissions || 0;
                countryEmissions[e.country_code].indirect += e.indirect_emissions || 0;
            });

            return countryEmissions;
        }

        function updateEmissionsKPIs() {
            const countryEmissions = getCountryEmissions();
            const countries = Object.keys(countryEmissions);

            let totalEmissions = 0;
            let directEmissions = 0;
            let indirectEmissions = 0;

            countries.forEach(code => {
                totalEmissions += countryEmissions[code].total;
                directEmissions += countryEmissions[code].direct;
                indirectEmissions += countryEmissions[code].indirect;
            });

            setText('emissions-countries', countries.length);
            setText('emissions-total', totalEmissions.toFixed(2));
            setText('emissions-direct', directEmissions.toFixed(2));
            setText('emissions-indirect', indirectEmissions.toFixed(2));
        }

        function getEmissionsColor(value: number, maxValue: number) {
            if (!value || value === 0) return '#e2e8f0';

            // Logarithmic scale for better visualization
            const logValue = Math.log10(value + 1);
            const logMax = Math.log10(maxValue + 1);
            const ratio = logValue / logMax;

            // Color gradient from light green (low) to red (very high)
            if (ratio < 0.25) return '#86efac';  // Low - light green
            if (ratio < 0.5) return '#fde047';   // Medium - yellow
            if (ratio < 0.75) return '#fb923c';  // High - orange
            return '#ef4444';                     // Very High - red
        }

        async function initEmissionsMap() {
            const container = byId('emissions-map-container');
            if (!container) return;

            // Clear any existing SVG to prevent duplicates on hot reload
            d3.select('#emissions-map-container').selectAll('svg').remove();

            // Use fallback width since container might be hidden initially
            const width = container.clientWidth || 800;
            const height = container.clientHeight || 400;

            emissionsMapSvg = d3.select('#emissions-map-container')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');

            const projection = d3.geoNaturalEarth1()
                .scale(width / 6)
                .translate([width / 2, height / 1.8]);

            const path = d3.geoPath().projection(projection);

            try {
                const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
                const countries = topojson.feature(world, world.objects.countries);

                const countryEmissions = getCountryEmissions();
                const maxEmissions = Math.max(...Object.values(countryEmissions).map(e => e.total), 1);

                emissionsMapSvg.selectAll('path')
                    .data(countries.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('class', 'country-path emissions-path')
                    .attr('data-code', d => countryIdToCode[normalizeId(d.id)] || '')
                    .attr('fill', d => {
                        const code = countryIdToCode[normalizeId(d.id)];
                        const emissions = countryEmissions[code];
                        return getEmissionsColor(emissions ? emissions.total : 0, maxEmissions);
                    })
                    .on('mouseover', handleEmissionsHover)
                    .on('mouseout', handleOut)
                    .on('click', handleClick);

                updateEmissionsLegend();
                updateEmissionsProgress();
                updateViewingBadges();
            } catch (error) {
                console.error('Emissions map error:', error);
            }
        }

        function updateEmissionsMap() {
            const countryEmissions = getCountryEmissions();
            const maxEmissions = Math.max(...Object.values(countryEmissions).map(e => e.total), 1);

            emissionsMapSvg.selectAll('.emissions-path')
                .transition()
                .duration(300)
                .attr('fill', function() {
                    const code = d3.select(this).attr('data-code');
                    const emissions = countryEmissions[code];
                    return getEmissionsColor(emissions ? emissions.total : 0, maxEmissions);
                });

            updateEmissionsLegend();
            updateEmissionsProgress();
            updateViewingBadges();
            updateEmissionsKPIs();
            updateEmissionsCharts();
        }

        function updateEmissionsLegend() {
            byId('emissions-legend').innerHTML = `
                <div class="legend-item">
                    <div class="legend-color" style="background:#166534"></div>
                    High
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#65a30d"></div>
                    Medium
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#fbbf24"></div>
                    Low
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#ef4444"></div>
                    Critical
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#e2e8f0"></div>
                    No Data
                </div>
            `;
        }

        function updateEmissionsProgress() {
            const countryEmissions = getCountryEmissions();
            const values = Object.values(countryEmissions);
            const total = values.length;

            const setWidth = (id: string, pct: number) => {
                const el = document.getElementById(id);
                if (el) el.style.width = `${pct}%`;
            };

            if (!total) {
                setWidth('progress-high', 0);
                setWidth('progress-medium', 0);
                setWidth('progress-low', 0);
                setWidth('progress-critical', 0);
                return;
            }

            const maxEmissions = Math.max(...values.map(v => v.total), 1);
            const counts = { high: 0, medium: 0, low: 0, critical: 0 };

            values.forEach((v) => {
                const logValue = Math.log10(v.total + 1);
                const logMax = Math.log10(maxEmissions + 1);
                const ratio = logMax ? logValue / logMax : 0;

                if (ratio < 0.25) counts.high += 1;
                else if (ratio < 0.5) counts.medium += 1;
                else if (ratio < 0.75) counts.low += 1;
                else counts.critical += 1;
            });

            setWidth('progress-high', (counts.high / total) * 100);
            setWidth('progress-medium', (counts.medium / total) * 100);
            setWidth('progress-low', (counts.low / total) * 100);
            setWidth('progress-critical', (counts.critical / total) * 100);
        }

        // Populate emissions region dropdown
        function populateEmissionsRegionFilter() {
            const select = document.getElementById('emissions-region-select') as HTMLSelectElement;
            if (!select) return;

            const regions = new Set<string>();
            data.regions.forEach(r => {
                if (r.region) regions.add(r.region);
            });

            select.innerHTML = '<option value="">All Regions</option>';
            Array.from(regions).sort().forEach(r => {
                const opt = document.createElement('option');
                opt.value = r;
                opt.textContent = r;
                select.appendChild(opt);
            });
        }

        // Main update function for emissions view
        function updateEmissionsView() {
            updateNewEmissionsKPIs();
            updateNewEmissionsMap();
            updateEmissionsCharts();
            // Refresh country detail if a country is selected
            if (selectedCountry) {
                const country = data.countries.find(c => c.country_code === selectedCountry);
                if (country) {
                    updateEmissionsCountryDetail(selectedCountry, country);
                }
            }
        }

        // Update emissions map with new data
        function updateNewEmissionsMap() {
            if (!emissionsMapSvg) return;

            // Get all emissions by country (unfiltered by country for map display)
            let countryValues: Record<string, number> = {};
            if (emissionsDataSource === 'clasp') {
                const unfilteredClasp = data.claspEnergy.filter(r => {
                    if (r.year !== emissionsYear) return false;
                    if (emissionsAppliances.length > 0 && !emissionsAppliances.includes(r.appliance)) return false;
                    if (emissionsRegion) {
                        const region = getCountryRegion(r.country_code);
                        if (region !== emissionsRegion) return false;
                    }
                    return true;
                });
                unfilteredClasp.forEach(r => {
                    const co2 = getClaspCO2(r, emissionsScenario);
                    if (!countryValues[r.country_code]) countryValues[r.country_code] = 0;
                    countryValues[r.country_code] += co2;
                });
            } else {
                const unfilteredSubcool = data.subcool.filter(r => {
                    if (r.year !== emissionsYear) return false;
                    if (r.scenario_name !== emissionsScenario) return false;
                    if (emissionsRegion) {
                        const region = getCountryRegion(r.country_code);
                        if (region !== emissionsRegion) return false;
                    }
                    return true;
                });
                unfilteredSubcool.forEach(r => {
                    const direct = r.direct_emission_mt || 0;
                    const indirect = r.indirect_emission_mt || 0;
                    if (!countryValues[r.country_code]) countryValues[r.country_code] = 0;
                    if (emissionsType === 'direct') countryValues[r.country_code] += direct;
                    else if (emissionsType === 'indirect') countryValues[r.country_code] += indirect;
                    else countryValues[r.country_code] += direct + indirect;
                });
            }

            const maxValue = Math.max(...Object.values(countryValues), 0.1);

            // Update map colors using proper country code mapping
            emissionsMapSvg.selectAll('.emissions-path')
                .transition()
                .duration(300)
                .attr('fill', function() {
                    const code = d3.select(this).attr('data-code');
                    if (!code) return '#e2e8f0';
                    const value = countryValues[code] || 0;
                    return getEmissionsColor(value, maxValue);
                });

            // Update legend
            updateNewEmissionsLegend(maxValue);
        }

        // Update emissions legend
        function updateNewEmissionsLegend(maxValue: number) {
            const container = document.getElementById('emissions-legend');
            if (!container) return;

            const thresholds = [0.25, 0.5, 0.75, 1.0];
            const colors = ['#86efac', '#fde047', '#fb923c', '#ef4444'];
            const labels = ['Low', 'Medium', 'High', 'Very High'];

            container.innerHTML = thresholds.map((t, i) => {
                const val = Math.pow(10, t * Math.log10(maxValue + 1)) - 1;
                return `<div class="legend-item">
                    <div class="legend-color" style="background:${colors[i]}"></div>
                    ${labels[i]} (${val < 1 ? val.toFixed(2) : val.toFixed(0)}+)
                </div>`;
            }).join('') + `<div class="legend-item">
                <div class="legend-color" style="background:#e2e8f0"></div>
                No Data
            </div>`;
        }

        // Render emissions charts
        function updateEmissionsCharts() {
            const container = document.getElementById('emissions-charts-container');
            if (!container) return;

            container.innerHTML = `
                <div class="card-panel">
                    <h3>Emissions by Category</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                        <div>
                            <h4 style="font-size: 0.9rem; color: #475569; margin-bottom: 0.5rem;">By Appliance/Subsector</h4>
                            <div id="chart-emissions-category" class="chart-surface" style="height: 280px;"></div>
                        </div>
                        <div>
                            <h4 style="font-size: 0.9rem; color: #475569; margin-bottom: 0.5rem;">Top 10 Countries</h4>
                            <div id="chart-emissions-top-countries" class="chart-surface" style="height: 280px;"></div>
                        </div>
                    </div>
                </div>
                <div class="card-panel">
                    <h3>Emissions Trajectory</h3>
                    <p class="chart-subtitle">Scenario comparison over time</p>
                    <div id="chart-emissions-timeline" class="chart-surface" style="height: 320px;"></div>
                </div>
            `;

            setTimeout(() => {
                renderEmissionsCategoryChart();
                renderEmissionsTopCountriesChart();
                renderNewEmissionsTimeline();
            }, 50);
        }

        // Render category doughnut chart
        function renderEmissionsCategoryChart() {
            const chartData: { name: string; value: number }[] = [];

            if (emissionsDataSource === 'clasp') {
                const totals = getEmissionsTotals() as { byAppliance: Record<string, number> };
                Object.entries(totals.byAppliance).forEach(([app, val]) => {
                    if (val > 0) {
                        chartData.push({ name: CLASP_APPLIANCE_SHORT[app] || app, value: +val.toFixed(2) });
                    }
                });
            } else {
                const totals = getEmissionsTotals() as { bySubsector: Record<string, { direct: number; indirect: number }> };
                Object.entries(totals.bySubsector).forEach(([sub, val]) => {
                    const total = val.direct + val.indirect;
                    if (total > 0) {
                        chartData.push({ name: HEAT_SUBSECTOR_SHORT[sub] || sub, value: +total.toFixed(2) });
                    }
                });
            }

            setChart('chart-emissions-category', {
                tooltip: { trigger: 'item', formatter: '{b}: {c} Mt ({d}%)' },
                legend: { bottom: 5, textStyle: { fontSize: 11 } },
                series: [{
                    type: 'pie',
                    radius: ['35%', '60%'],
                    center: ['50%', '45%'],
                    data: chartData,
                    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
                    label: { show: false },
                    emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } }
                }]
            });
        }

        // Render top countries bar chart
        function renderEmissionsTopCountriesChart() {
            let countryData: { name: string; value: number }[] = [];

            if (emissionsDataSource === 'clasp') {
                const byCountry = getClaspEmissionsByCountry();
                countryData = Object.entries(byCountry)
                    .map(([code, data]) => ({ name: data.name || code, value: +data.total.toFixed(2) }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 10);
            } else {
                const byCountry = getSubcoolEmissionsByCountry();
                countryData = Object.entries(byCountry)
                    .map(([code, data]) => ({ name: data.name || code, value: +data.total.toFixed(2) }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 10);
            }

            setChart('chart-emissions-top-countries', {
                tooltip: { trigger: 'axis', formatter: '{b}: {c} Mt' },
                grid: { left: '3%', right: '8%', bottom: '3%', top: '3%', containLabel: true },
                xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
                yAxis: {
                    type: 'category',
                    data: countryData.map(d => d.name).reverse(),
                    axisLabel: { fontSize: 10 }
                },
                series: [{
                    type: 'bar',
                    data: countryData.map(d => d.value).reverse(),
                    itemStyle: { color: '#3b82f6' }
                }]
            });
        }

        // Render timeline chart comparing scenarios
        function renderNewEmissionsTimeline() {
            const years = [2020, 2025, 2030, 2035, 2040, 2045];
            const series: any[] = [];

            if (emissionsDataSource === 'clasp') {
                CLASP_SCENARIOS.forEach((scenario, idx) => {
                    const yearTotals = years.map(y => {
                        const filtered = data.claspEnergy.filter(r =>
                            r.year === y && emissionsAppliances.includes(r.appliance)
                        );
                        let total = 0;
                        filtered.forEach(r => {
                            total += getClaspCO2(r, scenario);
                        });
                        return +total.toFixed(1);
                    });

                    series.push({
                        name: CLASP_SCENARIO_NAMES[scenario],
                        type: 'line',
                        smooth: true,
                        data: yearTotals,
                        lineStyle: { width: scenario === emissionsScenario ? 3 : 1.5 },
                        symbol: scenario === emissionsScenario ? 'circle' : 'none',
                        symbolSize: 6
                    });
                });
            } else {
                HEAT_SCENARIOS.forEach((scenario, idx) => {
                    const yearTotals = years.map(y => {
                        const filtered = data.subcool.filter(r =>
                            r.year === y && r.scenario_name === scenario
                        );
                        let total = 0;
                        filtered.forEach(r => {
                            total += (r.direct_emission_mt || 0) + (r.indirect_emission_mt || 0);
                        });
                        return +total.toFixed(1);
                    });

                    series.push({
                        name: HEAT_SCENARIO_NAMES[scenario],
                        type: 'line',
                        smooth: true,
                        data: yearTotals,
                        lineStyle: { width: scenario === emissionsScenario ? 3 : 1.5 },
                        symbol: scenario === emissionsScenario ? 'circle' : 'none',
                        symbolSize: 6
                    });
                });
            }

            setChart('chart-emissions-timeline', {
                tooltip: { trigger: 'axis' },
                legend: { bottom: 0, textStyle: { fontSize: 11 } },
                grid: { left: '12%', right: '4%', bottom: '15%', top: '10%' },
                xAxis: {
                    type: 'category',
                    data: years.map(String),
                    axisLabel: { fontSize: 11 }
                },
                yAxis: {
                    type: 'value',
                    name: 'Mt CO2',
                    nameLocation: 'middle',
                    nameGap: 40,
                    axisLabel: { fontSize: 10 }
                },
                series
            });
        }

        // =====================================================
        // MEPS MAP
        // =====================================================
        let mepsMapSvg: any;

        function isMepsRecord(r: Meps) {
            return r.policy_instrument?.includes('MEPS') || r.policy_instrument?.includes('Minimum Performance Standard');
        }

        function isLabelRecord(r: Meps) {
            return r.policy_instrument?.includes('Label');
        }

        const REGION_MAP: Record<string, string> = {
            // Asia
            'Eastern Asia': 'Asia',
            'South-eastern Asia': 'Asia',
            'Southern Asia': 'Asia',
            'Central Asia': 'Asia',
            'East Asia & Pacific': 'Asia',
            'South Asia': 'Asia',
            'East Asia': 'Asia',
            'Southeast Asia': 'Asia',
            'Asia': 'Asia',
            // Africa
            'Sub-Saharan Africa': 'Africa',
            'Northern Africa': 'Africa',
            'North Africa': 'Africa',
            'Africa': 'Africa',
            // Americas
            'Latin America': 'Americas',
            'Latin America & Caribbean': 'Americas',
            'Northern America': 'Americas',
            'North America': 'Americas',
            'Central America': 'Americas',
            'South America': 'Americas',
            'Caribbean': 'Americas',
            'Americas': 'Americas',
            // Europe
            'EU': 'Europe',
            'Non-EU': 'Europe',
            'Europe & Central Asia': 'Europe',
            'Western Europe': 'Europe',
            'Eastern Europe': 'Europe',
            'Europe': 'Europe',
            // Middle East
            'Middle East & North Africa': 'Middle East',
            'Middle East': 'Middle East',
            // Oceania
            'Australia and New Zealand': 'Oceania',
            'Polynesia': 'Oceania',
            'Melanesia': 'Oceania',
            'Micronesia': 'Oceania',
            'Oceania': 'Oceania',
            'Pacific': 'Oceania'
        };

        function getMergedRegion(region: string | undefined): string {
            if (!region) return 'Other';
            return REGION_MAP[region] || 'Other';
        }

        function getMepsStatus(code: string | undefined) {
            if (!code) return { level: 'none', label: 'No Data' };

            // Use map-filtered data (respects equipment/region/status filters but NOT country filter)
            const records = getMapFilteredMeps().filter(m => m.country_code === code);

            if (selectedRegion) {
                const country = data.countries.find(c => c.country_code === code);
                if (!country || country.region !== selectedRegion) {
                    return { level: 'none', label: 'No Data' };
                }
            }

            if (!records.length) {
                return { level: 'critical', label: 'No Policies' };
            }

            const hasMeps = records.some(r => isMepsRecord(r));
            const hasLabel = records.some(r => isLabelRecord(r));

            if (hasMeps && hasLabel) {
                return { level: 'both', label: 'MEPS & Labels' };
            }
            if (hasMeps) {
                return { level: 'meps', label: 'MEPS Only' };
            }
            if (hasLabel) {
                return { level: 'labels', label: 'Labels Only' };
            }

            return { level: 'limited', label: 'Other Policies' };
        }

        function getMepsColor(level: string) {
            switch (level) {
                case 'both':
                    return '#166534'; // Dark green - has both MEPS & Labels
                case 'meps':
                    return '#2563eb'; // Blue - MEPS only
                case 'labels':
                    return '#f59e0b'; // Amber - Labels only
                case 'limited':
                    return '#94a3b8'; // Slate - other policies
                case 'critical':
                    return '#ef4444'; // Red - no policies
                default:
                    return '#e2e8f0'; // Light gray - no data
            }
        }

        async function initMepsMap() {
            const container = document.getElementById('meps-map-container');
            if (!container) return;

            const width = container.clientWidth || 800;
            const height = container.clientHeight || 400;

            mepsMapSvg = d3.select('#meps-map-container')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');

            const projection = d3.geoNaturalEarth1()
                .scale(width / 6)
                .translate([width / 2, height / 1.8]);

            const path = d3.geoPath().projection(projection);

            try {
                const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
                const countries = topojson.feature(world, world.objects.countries);

                mepsMapSvg.selectAll('path')
                    .data(countries.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('class', 'country-path')
                    .attr('data-code', d => countryIdToCode[normalizeId(d.id)] || '')
                    .attr('fill', d => {
                        const code = countryIdToCode[normalizeId(d.id)];
                        const status = getMepsStatus(code);
                        return getMepsColor(status.level);
                    })
                    .on('mouseover', (event: MouseEvent, d: any) => {
                        const code = countryIdToCode[normalizeId(d.id)];
                        const country = data.countries.find(c => c.country_code === code);
                        const status = getMepsStatus(code);
                        // Use raw data for tooltip (not filtered) so hover always shows full picture
                        const allRecs = data.meps.filter(m => m.country_code === code);
                        const mepsRecs = allRecs.filter(r => isMepsRecord(r));
                        const labelRecs = allRecs.filter(r => isLabelRecord(r));
                        const equips = [...new Set(allRecs.map(m => m.equipment_type).filter(Boolean))];
                        let tooltipHtml = `<strong>${country?.country_name || code || 'Unknown'}</strong><br>
                            <span style="color:${getMepsColor(status.level)};font-weight:600">${status.label}</span>`;
                        if (allRecs.length > 0) {
                            tooltipHtml += `<br><span style="color:#ddd;font-size:0.85em">`;
                            if (mepsRecs.length > 0) tooltipHtml += `MEPS: ${mepsRecs.length}`;
                            if (mepsRecs.length > 0 && labelRecs.length > 0) tooltipHtml += ` | `;
                            if (labelRecs.length > 0) tooltipHtml += `Labels: ${labelRecs.length}`;
                            tooltipHtml += `</span>`;
                            if (equips.length > 0) tooltipHtml += `<br><span style="font-size:0.8em">${equips.join(', ')}</span>`;
                        }
                        tooltip.innerHTML = tooltipHtml;
                        tooltip.style.opacity = 1;
                        tooltip.style.left = (event.pageX + 10) + 'px';
                        tooltip.style.top = (event.pageY + 10) + 'px';
                    })
                    .on('mouseout', handleOut)
                    .on('click', handleClick);

                updateMepsLegend();
                updateMepsProgress();
                updateViewingBadges();
            } catch (error) {
                console.error('MEPS map error:', error);
            }
        }

        function updateMepsMap() {
            if (!mepsMapSvg) return;

            mepsMapSvg.selectAll('.country-path')
                .transition()
                .duration(300)
                .attr('fill', function() {
                    const code = d3.select(this).attr('data-code');
                    const status = getMepsStatus(code);
                    return getMepsColor(status.level);
                });

            updateMepsLegend();
            updateMepsProgress();
        }

        function updateMepsLegend() {
            const legend = document.getElementById('meps-legend');
            if (!legend) return;
            legend.innerHTML = `
                <div class="legend-item">
                    <div class="legend-color" style="background:#166534"></div>
                    MEPS & Labels
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#2563eb"></div>
                    MEPS Only
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#f59e0b"></div>
                    Labels Only
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#ef4444"></div>
                    No Policies
                </div>
            `;
        }

        function updateMepsProgress() {
            const setWidth = (id: string, pct: number) => {
                const el = document.getElementById(id);
                if (el) el.style.width = `${pct}%`;
            };

            const codes = new Set(data.countries.map(c => c.country_code));
            const total = codes.size;
            const counts = { both: 0, meps: 0, labels: 0, critical: 0 };

            codes.forEach((code) => {
                const status = getMepsStatus(code);
                if (status.level === 'both') counts.both += 1;
                else if (status.level === 'meps') counts.meps += 1;
                else if (status.level === 'labels') counts.labels += 1;
                else if (status.level === 'critical') counts.critical += 1;
            });

            if (!total) {
                setWidth('meps-progress-both', 0);
                setWidth('meps-progress-meps', 0);
                setWidth('meps-progress-labels', 0);
                setWidth('meps-progress-critical', 0);
                return;
            }

            setWidth('meps-progress-both', (counts.both / total) * 100);
            setWidth('meps-progress-meps', (counts.meps / total) * 100);
            setWidth('meps-progress-labels', (counts.labels / total) * 100);
            setWidth('meps-progress-critical', (counts.critical / total) * 100);
        }

        // =====================================================
        // MEPS ENHANCED FUNCTIONS
        // =====================================================

        // Filtered for KPIs/charts — includes country filter
        function getFilteredMeps() {
            return data.meps.filter(m => {
                if (globalCountryFilter && m.country_code !== globalCountryFilter) return false;
                if (mepsRegionFilter && m.region !== mepsRegionFilter) return false;
                // Equipment type filter — if none selected, nothing passes
                if (!mepsEquipmentTypes.includes(m.equipment_type || '')) return false;
                return true;
            });
        }

        // Filtered for MAP — never filters by selected country so all countries stay visible
        function getMapFilteredMeps() {
            return data.meps.filter(m => {
                if (mepsRegionFilter && m.region !== mepsRegionFilter) return false;
                // Equipment type filter — if none selected, nothing passes
                if (!mepsEquipmentTypes.includes(m.equipment_type || '')) return false;
                return true;
            });
        }

        function getMepsKPIs() {
            const filtered = getFilteredMeps();
            const countriesWithMeps = new Set(filtered.map(m => m.country_code)).size;
            const totalPolicies = filtered.length;
            const mepsCount = filtered.filter(r => isMepsRecord(r)).length;
            const labelsCount = filtered.filter(r => isLabelRecord(r)).length;
            return { countriesWithMeps, totalPolicies, mepsCount, labelsCount };
        }

        function initMepsFilters() {
            // Populate region filter
            const regionSelect = document.getElementById('meps-region-filter') as HTMLSelectElement;
            if (regionSelect) {
                const regions = new Set(data.meps.map(m => m.region).filter(Boolean));
                regionSelect.innerHTML = '<option value="">All Regions</option>';
                Array.from(regions).sort().forEach(r => {
                    const opt = document.createElement('option');
                    opt.value = r as string;
                    opt.textContent = r as string;
                    regionSelect.appendChild(opt);
                });
            }

            // Populate equipment type toggles (hardcoded 3 categories)
            const toggleContainer = document.getElementById('meps-equipment-toggles');
            if (toggleContainer) {
                const equipTypes = ['Air Conditioning', 'Domestic Refrigeration', 'Fans'];
                mepsEquipmentTypes = [...equipTypes]; // Select all by default
                toggleContainer.innerHTML = '';
                equipTypes.forEach(et => {
                    const btn = document.createElement('button');
                    btn.className = 'toggle-btn active';
                    btn.type = 'button';
                    btn.dataset.equipment = et;
                    btn.textContent = et;
                    btn.addEventListener('click', () => {
                        btn.classList.toggle('active');
                        if (btn.classList.contains('active')) {
                            if (!mepsEquipmentTypes.includes(et)) {
                                mepsEquipmentTypes.push(et);
                            }
                        } else {
                            mepsEquipmentTypes = mepsEquipmentTypes.filter(e => e !== et);
                        }
                        updateMepsView();
                    });
                    toggleContainer.appendChild(btn);
                });
            }
        }

        function updateMepsKPIs() {
            const kpis = getMepsKPIs();
            const setEl = (id: string, val: string | number) => {
                const el = document.getElementById(id);
                if (el) el.textContent = String(val);
            };
            setEl('meps-kpi-countries', kpis.countriesWithMeps);
            setEl('meps-kpi-policies', kpis.totalPolicies);
            setEl('meps-kpi-equipment', kpis.mepsCount);
            setEl('meps-kpi-regions', kpis.labelsCount);
        }

        let selectedMepsCountry = '';

        function updateMepsCharts() {
            // If a country is selected, show country-specific charts
            if (selectedMepsCountry) {
                const records = data.meps.filter(m => m.country_code === selectedMepsCountry);
                updateMepsCountryCharts(selectedMepsCountry, records);
            } else {
                // Show global charts
                updateMepsGlobalCharts();
            }
        }

        function updateMepsCountryDetail(code: string) {
            selectedMepsCountry = code;
            const container = document.querySelector('#meps-country-detail .country-detail') as HTMLElement;
            if (!container) return;

            const country = data.countries.find(c => c.country_code === code);
            const allRecords = data.meps.filter(m => m.country_code === code);
            const regionRec = data.regions.find(r => r.country_code === code);

            if (!country) {
                container.innerHTML = `<h4>Unknown Country</h4><p class="side-muted">No data available for ${code}</p>`;
                return;
            }

            const region = regionRec?.region || country.region || 'N/A';
            const mepsRecs = allRecords.filter(r => isMepsRecord(r));
            const labelRecs = allRecords.filter(r => isLabelRecord(r));
            const status = getMepsStatus(code);

            let html = `<h4>${country.country_name}</h4>
                <div class="detail-row">
                    <span class="label">Region</span>
                    <span class="value">${region}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status</span>
                    <span class="badge" style="background:${getMepsColor(status.level)}20;color:${getMepsColor(status.level)};border:1px solid ${getMepsColor(status.level)}40">${status.label}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Total Policies</span>
                    <span class="value">${allRecords.length}</span>
                </div>
                <div class="detail-row">
                    <span class="label">MEPS</span>
                    <span class="value" style="color:#2563eb;font-weight:600">${mepsRecs.length}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Labels</span>
                    <span class="value" style="color:#f59e0b;font-weight:600">${labelRecs.length}</span>
                </div>`;

            container.innerHTML = html;

            // Update the charts below the map to show country-specific data
            updateMepsCountryCharts(code, allRecords);
        }

        function updateMepsCountryCharts(code: string, records: Meps[]) {
            const country = data.countries.find(c => c.country_code === code);
            const countryName = country?.country_name || code;
            const equipTypes = ['Air Conditioning', 'Domestic Refrigeration', 'Fans'];
            const equipShort: Record<string, string> = { 'Air Conditioning': 'AC', 'Domestic Refrigeration': 'Fridge', 'Fans': 'Fans' };
            const equipColors: Record<string, string> = { 'Air Conditioning': '#2563eb', 'Domestic Refrigeration': '#16a34a', 'Fans': '#a855f7' };

            // Update chart titles for country view
            const setTitle = (id: string, text: string) => { const el = document.getElementById(id); if (el) el.textContent = text; };
            setTitle('meps-chart2-title', `${countryName}: Policy Timeline`);
            setTitle('meps-chart2-subtitle', 'When MEPS and Labels were introduced');
            setTitle('meps-chart3-title', `${countryName}: Policy Details`);
            setTitle('meps-chart3-subtitle', 'Complete breakdown by appliance, instrument and status');

            // Hide chart 1 container (Region chart) in country view — timeline takes full width
            const chart1Card = document.getElementById('chart-meps-by-region')?.closest('.card-panel') as HTMLElement | null;
            if (chart1Card) chart1Card.style.display = 'none';
            // Make the charts grid single-column so timeline spans full width
            const chartsGrid = chart1Card?.parentElement as HTMLElement | null;
            if (chartsGrid) chartsGrid.style.gridTemplateColumns = '1fr';

            // ── Chart 2: Policy Timeline ──
            // Shapes: circle = MEPS, diamond = Labels
            // Colors: blue = AC, green = Fridge, purple = Fans
            // Category Y-axis: ['Labels', 'MEPS']
            const timelineEvents: { year: number; name: string; equip: string; isMeps: boolean }[] = [];
            records.forEach(r => {
                const year = r.year_adopted || r.year_revised;
                if (!year) return;
                const name = r.policy_name || r.equipment_type || 'Policy';
                const equip = r.equipment_type || '';
                const hasMeps = isMepsRecord(r);
                const hasLabel = isLabelRecord(r);
                if (hasMeps) timelineEvents.push({ year, name, equip, isMeps: true });
                if (hasLabel) timelineEvents.push({ year, name, equip, isMeps: false });
            });

            const allEventYears = timelineEvents.map(e => e.year).filter(Boolean);
            const minYear = allEventYears.length ? Math.min(...allEventYears) : 2000;
            const maxYear = allEventYears.length ? Math.max(...allEventYears) : 2025;

            // Jitter: spread overlapping points at same (year, category)
            const jitterMap: Record<string, number> = {};
            const getJitter = (year: number, catIdx: number) => {
                const key = `${year}_${catIdx}`;
                const idx = jitterMap[key] || 0;
                jitterMap[key] = idx + 1;
                if (idx === 0) return 0;
                const sign = idx % 2 === 1 ? 1 : -1;
                return sign * Math.ceil(idx / 2) * 0.12;
            };

            const yCategories = ['Labels', 'MEPS'];

            // Build one series per appliance+type combination
            const tlSeries: any[] = [];
            equipTypes.forEach(et => {
                const short = equipShort[et];
                const color = equipColors[et];
                // MEPS for this appliance (circle) — category index 1
                const mepsData = timelineEvents
                    .filter(e => e.equip === et && e.isMeps)
                    .map(e => ({ value: [e.year, 1 + getJitter(e.year, 1)], name: e.name }));
                if (mepsData.length > 0) {
                    tlSeries.push({
                        name: `${short} MEPS`,
                        type: 'scatter',
                        symbolSize: 14,
                        symbol: 'circle',
                        color: color,
                        data: mepsData,
                        label: { show: false }
                    });
                }
                // Labels for this appliance (diamond) — category index 0
                const labelData = timelineEvents
                    .filter(e => e.equip === et && !e.isMeps)
                    .map(e => ({ value: [e.year, 0 + getJitter(e.year, 0)], name: e.name }));
                if (labelData.length > 0) {
                    tlSeries.push({
                        name: `${short} Label`,
                        type: 'scatter',
                        symbolSize: 14,
                        symbol: 'diamond',
                        color: color,
                        data: labelData,
                        label: { show: false }
                    });
                }
            });

            setChart('chart-meps-timeline', {
                tooltip: {
                    trigger: 'item',
                    formatter: (params: any) => {
                        const d = params.data;
                        return `<strong>${d.name}</strong><br>Year: ${d.value[0]}<br>${params.seriesName}`;
                    }
                },
                legend: {
                    data: tlSeries.map(s => s.name),
                    top: 0,
                    textStyle: { fontSize: 10 },
                    itemWidth: 14,
                    itemHeight: 10
                },
                grid: { left: 70, right: 20, bottom: 35, top: '22%' },
                xAxis: {
                    type: 'value',
                    min: minYear - 1,
                    max: maxYear + 1,
                    axisLabel: { fontSize: 12, fontWeight: 'bold' as const, color: '#1e293b', formatter: (v: number) => String(Math.round(v)) },
                    axisLine: { show: true, lineStyle: { color: '#cbd5e1' } },
                    axisTick: { show: true, lineStyle: { color: '#cbd5e1' } },
                    splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.2 } }
                },
                yAxis: {
                    type: 'value',
                    min: -0.6,
                    max: 1.6,
                    splitNumber: 1,
                    axisLabel: { show: false },
                    axisTick: { show: false },
                    axisLine: { show: false },
                    splitLine: { show: false }
                },
                series: [
                    // Invisible helper series to hold the markLines
                    {
                        type: 'scatter',
                        data: [],
                        silent: true,
                        markLine: {
                            silent: true,
                            symbol: 'none',
                            animation: false,
                            data: [
                                {
                                    yAxis: 0,
                                    label: {
                                        show: true,
                                        formatter: 'Labels',
                                        position: 'start',
                                        fontSize: 13,
                                        fontWeight: 'bold',
                                        color: '#0f172a',
                                        padding: [0, 8, 0, 0]
                                    },
                                    lineStyle: { color: '#0f172a', opacity: 0.25, type: 'solid', width: 1 }
                                },
                                {
                                    yAxis: 1,
                                    label: {
                                        show: true,
                                        formatter: 'MEPS',
                                        position: 'start',
                                        fontSize: 13,
                                        fontWeight: 'bold',
                                        color: '#0f172a',
                                        padding: [0, 8, 0, 0]
                                    },
                                    lineStyle: { color: '#0f172a', opacity: 0.25, type: 'solid', width: 1 }
                                }
                            ]
                        }
                    },
                    ...tlSeries
                ]
            });

            // ── Chart 3: Full-width Policy Details as enriched HTML ──
            const chart3El = document.getElementById('chart-meps-equipment');
            if (chart3El) {
                if (charts['chart-meps-equipment']) {
                    charts['chart-meps-equipment'].dispose();
                    delete charts['chart-meps-equipment'];
                }
                chart3El.style.overflow = 'auto';

                let html = `<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1.25rem;">`;
                equipTypes.forEach(et => {
                    const appRecs = records.filter(r => r.equipment_type === et);
                    const color = equipColors[et];
                    const meps = appRecs.filter(r => isMepsRecord(r));
                    const labels = appRecs.filter(r => isLabelRecord(r));
                    const mandatory = appRecs.filter(r => r.requirement_type === 'Mandatory').length;
                    const voluntary = appRecs.filter(r => r.requirement_type === 'Voluntary').length;
                    const adoptedYears = appRecs.map(r => r.year_adopted).filter(Boolean) as number[];
                    const revisedYears = appRecs.map(r => r.year_revised).filter(Boolean) as number[];
                    const firstAdopted = adoptedYears.length ? Math.min(...adoptedYears) : null;
                    const lastRevised = revisedYears.length ? Math.max(...revisedYears) : null;

                    html += `<div style="border:1px solid #e2e8f0;border-radius:0.5rem;padding:1rem;border-top:3px solid ${color};">`;
                    html += `<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
                        <span style="font-weight:700;font-size:0.95rem;color:${color}">${et}</span>
                        <span style="margin-left:auto;font-size:0.75rem;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:10px;">${appRecs.length} ${appRecs.length === 1 ? 'policy' : 'policies'}</span>
                    </div>`;

                    if (appRecs.length === 0) {
                        html += `<div style="color:#94a3b8;font-size:0.8rem;font-style:italic;">No policies for this appliance</div>`;
                    } else {
                        // Summary stats row
                        html += `<div style="display:flex;gap:0.75rem;margin-bottom:0.75rem;flex-wrap:wrap;">
                            <div style="font-size:0.75rem;color:#334155;"><span style="color:#2563eb;font-weight:700;">${meps.length}</span> MEPS</div>
                            <div style="font-size:0.75rem;color:#334155;"><span style="color:#f59e0b;font-weight:700;">${labels.length}</span> Labels</div>
                            <div style="font-size:0.75rem;color:#334155;"><span style="font-weight:600;">${mandatory}</span> Mandatory</div>
                            <div style="font-size:0.75rem;color:#334155;"><span style="font-weight:600;">${voluntary}</span> Voluntary</div>
                        </div>`;

                        // Timeline info
                        if (firstAdopted || lastRevised) {
                            html += `<div style="font-size:0.72rem;color:#64748b;margin-bottom:0.6rem;">`;
                            if (firstAdopted) html += `First adopted: <strong>${firstAdopted}</strong>`;
                            if (firstAdopted && lastRevised) html += ` &middot; `;
                            if (lastRevised) html += `Last revised: <strong>${lastRevised}</strong>`;
                            html += `</div>`;
                        }

                        // Policy list
                        appRecs.forEach(r => {
                            const name = r.policy_name || 'Unnamed Policy';
                            const truncName = name.length > 80 ? name.substring(0, 77) + '...' : name;
                            const hasMep = isMepsRecord(r);
                            const hasLbl = isLabelRecord(r);
                            const borderColor = hasMep ? '#2563eb' : '#f59e0b';
                            const typeBadges: string[] = [];
                            if (hasMep) typeBadges.push(`<span style="font-size:0.65rem;background:#dbeafe;color:#2563eb;padding:1px 5px;border-radius:3px;font-weight:600;">MEPS</span>`);
                            if (hasLbl) typeBadges.push(`<span style="font-size:0.65rem;background:#fef3c7;color:#d97706;padding:1px 5px;border-radius:3px;font-weight:600;">Label</span>`);
                            const reqBadge = r.requirement_type ? `<span style="font-size:0.65rem;background:#f1f5f9;color:#475569;padding:1px 5px;border-radius:3px;">${r.requirement_type}</span>` : '';

                            html += `<div style="border-left:3px solid ${borderColor};padding:0.35rem 0.5rem;margin-bottom:0.4rem;background:#fafafa;border-radius:0 4px 4px 0;">
                                <div style="font-size:0.78rem;color:#1e293b;line-height:1.4;">${truncName}</div>
                                <div style="display:flex;gap:0.4rem;align-items:center;margin-top:0.2rem;flex-wrap:wrap;">
                                    ${typeBadges.join('')}
                                    ${reqBadge}
                                    ${r.year_adopted ? `<span style="font-size:0.65rem;color:#64748b;">${r.year_adopted}${r.year_revised && r.year_revised !== r.year_adopted ? ' (rev. ' + r.year_revised + ')' : ''}</span>` : ''}
                                    ${r.status ? `<span style="font-size:0.62rem;color:#94a3b8;">${r.status}</span>` : ''}
                                </div>
                            </div>`;
                        });
                    }

                    html += `</div>`;
                });
                html += `</div>`;

                chart3El.innerHTML = html;
            }
        }

        function updateMepsGlobalCharts() {
            const filtered = getFilteredMeps();

            // Reset chart titles for global view
            const setTitle = (id: string, text: string) => { const el = document.getElementById(id); if (el) el.textContent = text; };
            setTitle('meps-chart1-title', 'MEPS & Labels by Region');
            setTitle('meps-chart1-subtitle', 'Countries with MEPS vs Labels per region');
            setTitle('meps-chart2-title', 'Policy Adoption Timeline');
            setTitle('meps-chart2-subtitle', 'Cumulative MEPS & Labels adoption over time');
            setTitle('meps-chart3-title', 'Equipment Type Coverage');
            setTitle('meps-chart3-subtitle', 'Countries with MEPS vs Labels by appliance');

            // Restore chart 1 container and grid layout for global view
            const chart1Card = document.getElementById('chart-meps-by-region')?.closest('.card-panel') as HTMLElement | null;
            if (chart1Card) chart1Card.style.display = '';
            const chartsGrid = chart1Card?.parentElement as HTMLElement | null;
            if (chartsGrid) chartsGrid.style.gridTemplateColumns = '';

            // Clear HTML content from chart1 if it was used for policy list
            const chart1El = document.getElementById('chart-meps-by-region');
            if (chart1El && !charts['chart-meps-by-region']) {
                chart1El.innerHTML = '';
                chart1El.style.overflow = '';
            }

            // Clear HTML content from chart3 if it was used for policy details
            const chart3El = document.getElementById('chart-meps-equipment');
            if (chart3El && !charts['chart-meps-equipment']) {
                chart3El.innerHTML = '';
                chart3El.style.overflow = '';
            }

            // Chart 1: Countries with MEPS vs Labels by Region (grouped bar) — merged regions
            const regionStats: Record<string, { meps: Set<string>; labels: Set<string> }> = {};
            filtered.forEach(m => {
                const r = getMergedRegion(m.region);
                if (!regionStats[r]) regionStats[r] = { meps: new Set(), labels: new Set() };
                if (isMepsRecord(m)) regionStats[r].meps.add(m.country_code);
                if (isLabelRecord(m)) regionStats[r].labels.add(m.country_code);
            });
            const desiredOrder = ['Asia', 'Africa', 'Americas', 'Europe', 'Middle East', 'Oceania'];
            const regionNames = desiredOrder.filter(r => regionStats[r]);

            setChart('chart-meps-by-region', {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    formatter: (params: any) => {
                        let tip = `<strong>${params[0].axisValue}</strong>`;
                        params.forEach((p: any) => { tip += `<br>${p.marker} ${p.seriesName}: ${p.value} countries`; });
                        return tip;
                    }
                },
                legend: { data: ['MEPS', 'Labels'], top: 5, textStyle: { fontSize: 11 } },
                grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
                xAxis: {
                    type: 'category',
                    data: regionNames,
                    axisLabel: { rotate: 30, fontSize: 10, interval: 0 }
                },
                yAxis: { type: 'value', name: 'Countries', nameTextStyle: { fontSize: 11 } },
                series: [
                    {
                        name: 'MEPS',
                        type: 'bar',
                        data: regionNames.map(r => regionStats[r].meps.size),
                        color: '#2563eb',
                        barGap: '10%'
                    },
                    {
                        name: 'Labels',
                        type: 'bar',
                        data: regionNames.map(r => regionStats[r].labels.size),
                        color: '#f59e0b'
                    }
                ]
            });

            // Chart 2: Policy Adoption Timeline (MEPS vs Labels over time)
            const yearMeps: Record<number, number> = {};
            const yearLabels: Record<number, number> = {};
            filtered.forEach(m => {
                if (m.year_adopted) {
                    if (isMepsRecord(m)) yearMeps[m.year_adopted] = (yearMeps[m.year_adopted] || 0) + 1;
                    if (isLabelRecord(m)) yearLabels[m.year_adopted] = (yearLabels[m.year_adopted] || 0) + 1;
                }
            });
            const allYears = [...new Set([...Object.keys(yearMeps), ...Object.keys(yearLabels)].map(Number))].sort((a, b) => a - b);
            let cumMeps = 0, cumLabels = 0;
            const cumMepsData = allYears.map(y => { cumMeps += (yearMeps[y] || 0); return cumMeps; });
            const cumLabelsData = allYears.map(y => { cumLabels += (yearLabels[y] || 0); return cumLabels; });

            setChart('chart-meps-timeline', {
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                        let tip = `<strong>${params[0].axisValue}</strong>`;
                        params.forEach((p: any) => { tip += `<br>${p.marker} ${p.seriesName}: ${p.value}`; });
                        return tip;
                    }
                },
                legend: { data: ['MEPS', 'Labels'], top: 5, textStyle: { fontSize: 11 } },
                grid: { left: '3%', right: '4%', bottom: '10%', top: '15%', containLabel: true },
                xAxis: {
                    type: 'category',
                    data: allYears.map(String),
                    axisLabel: { fontSize: 10, interval: 'auto' }
                },
                yAxis: { type: 'value', name: 'Cumulative', nameTextStyle: { fontSize: 11 } },
                series: [
                    {
                        name: 'MEPS',
                        type: 'line',
                        data: cumMepsData,
                        smooth: true,
                        areaStyle: { opacity: 0.2 },
                        color: '#2563eb'
                    },
                    {
                        name: 'Labels',
                        type: 'line',
                        data: cumLabelsData,
                        smooth: true,
                        areaStyle: { opacity: 0.2 },
                        color: '#f59e0b'
                    }
                ]
            });

            // Chart 3: Equipment Type Coverage (MEPS vs Labels per appliance)
            const equipTypes = ['Air Conditioning', 'Domestic Refrigeration', 'Fans'];
            const equipMeps = equipTypes.map(et => new Set(filtered.filter(r => r.equipment_type === et && isMepsRecord(r)).map(r => r.country_code)).size);
            const equipLabels = equipTypes.map(et => new Set(filtered.filter(r => r.equipment_type === et && isLabelRecord(r)).map(r => r.country_code)).size);

            setChart('chart-meps-equipment', {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    formatter: (params: any) => {
                        let tip = `<strong>${params[0].axisValue}</strong>`;
                        params.forEach((p: any) => { tip += `<br>${p.marker} ${p.seriesName}: ${p.value} countries`; });
                        return tip;
                    }
                },
                legend: { data: ['MEPS', 'Labels'], top: 5, textStyle: { fontSize: 11 } },
                grid: { left: '3%', right: '8%', bottom: '3%', top: '15%', containLabel: true },
                xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
                yAxis: {
                    type: 'category',
                    data: equipTypes.slice().reverse(),
                    axisLabel: { fontSize: 10 }
                },
                series: [
                    {
                        name: 'MEPS',
                        type: 'bar',
                        data: equipMeps.slice().reverse(),
                        color: '#2563eb',
                        barGap: '10%'
                    },
                    {
                        name: 'Labels',
                        type: 'bar',
                        data: equipLabels.slice().reverse(),
                        color: '#f59e0b'
                    }
                ]
            });

        }

        function updateMepsView() {
            updateMepsKPIs();
            updateMepsMap();
            updateMepsCharts();
            // Update viewing pill
            const viewingEl = document.getElementById('meps-viewing');
            if (viewingEl) {
                viewingEl.textContent = mepsRegionFilter || 'Global';
            }
        }

        // =====================================================
        // KIGALI / REFRIGERANT TRANSITION MAP
        // =====================================================
        let kigaliMapSvg: any;

        function getKigaliStatus(code: string | undefined) {
            if (!code) return { level: 'critical', label: 'Critical' };

            if (selectedRegion) {
                const country = data.countries.find(c => c.country_code === code);
                if (!country || country.region !== selectedRegion) {
                    return { level: 'low', label: 'Low/None' };
                }
            }

            const record = data.kigali.find(k => k.country_code === code);
            if (!record) {
                return { level: 'low', label: 'Low/None' };
            }

            if (record.kigali_party === 1) {
                if (record.group_type && record.group_type.includes('A5')) {
                    return { level: 'medium', label: 'Medium/Partial' };
                }
                return { level: 'high', label: 'High/Active' };
            }

            return { level: 'critical', label: 'Critical' };
        }

        function getKigaliColor(level: string) {
            switch (level) {
                case 'high':
                    return '#166534';
                case 'medium':
                    return '#65a30d';
                case 'low':
                    return '#fbbf24';
                case 'critical':
                    return '#ef4444';
                default:
                    return '#e2e8f0';
            }
        }

        async function initKigaliMap() {
            const container = document.getElementById('kigali-map-container');
            if (!container) return;

            const width = container.clientWidth || 800;
            const height = container.clientHeight || 400;

            kigaliMapSvg = d3.select('#kigali-map-container')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');

            const projection = d3.geoNaturalEarth1()
                .scale(width / 6)
                .translate([width / 2, height / 1.8]);

            const path = d3.geoPath().projection(projection);

            try {
                const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
                const countries = topojson.feature(world, world.objects.countries);

                kigaliMapSvg.selectAll('path')
                    .data(countries.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('class', 'country-path')
                    .attr('data-code', d => countryIdToCode[normalizeId(d.id)] || '')
                    .attr('fill', d => {
                        const code = countryIdToCode[normalizeId(d.id)];
                        const status = getKigaliStatus(code);
                        return getKigaliColor(status.level);
                    })
                    .on('mouseover', (event: MouseEvent, d: any) => {
                        const code = countryIdToCode[normalizeId(d.id)];
                        const country = data.countries.find(c => c.country_code === code);
                        const status = getKigaliStatus(code);
                        tooltip.innerHTML = `
                            <strong>${country?.country_name || code || 'Unknown'}</strong><br>
                            <span style="color: var(--text-secondary)">GWP Level: ${status.label}</span>
                        `;
                        tooltip.style.opacity = 1;
                        tooltip.style.left = (event.pageX + 10) + 'px';
                        tooltip.style.top = (event.pageY + 10) + 'px';
                    })
                    .on('mouseout', handleOut)
                    .on('click', handleClick);

                updateKigaliLegend();
                updateKigaliProgress();
                updateViewingBadges();
            } catch (error) {
                console.error('Kigali map error:', error);
            }
        }

        function updateKigaliMap() {
            if (!kigaliMapSvg) return;

            kigaliMapSvg.selectAll('.country-path')
                .transition()
                .duration(300)
                .attr('fill', function() {
                    const code = d3.select(this).attr('data-code');
                    const status = getKigaliStatus(code);
                    return getKigaliColor(status.level);
                });

            updateKigaliLegend();
            updateKigaliProgress();
        }

        function updateKigaliLegend() {
            const legend = document.getElementById('kigali-legend');
            if (!legend) return;
            legend.innerHTML = `
                <div class="legend-item">
                    <div class="legend-color" style="background:#166534"></div>
                    High/Active
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#65a30d"></div>
                    Medium/Partial
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#fbbf24"></div>
                    Low/None
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#ef4444"></div>
                    Critical
                </div>
            `;
        }

        function updateKigaliProgress() {
            const setWidth = (id: string, pct: number) => {
                const el = document.getElementById(id);
                if (el) el.style.width = `${pct}%`;
            };

            const codes = new Set(data.countries.map(c => c.country_code));
            const total = codes.size;
            const counts = { high: 0, medium: 0, low: 0, critical: 0 };

            codes.forEach((code) => {
                const status = getKigaliStatus(code);
                if (status.level === 'high') counts.high += 1;
                else if (status.level === 'medium') counts.medium += 1;
                else if (status.level === 'low') counts.low += 1;
                else if (status.level === 'critical') counts.critical += 1;
            });

            if (!total) {
                setWidth('kigali-progress-high', 0);
                setWidth('kigali-progress-medium', 0);
                setWidth('kigali-progress-low', 0);
                setWidth('kigali-progress-critical', 0);
                return;
            }

            setWidth('kigali-progress-high', (counts.high / total) * 100);
            setWidth('kigali-progress-medium', (counts.medium / total) * 100);
            setWidth('kigali-progress-low', (counts.low / total) * 100);
            setWidth('kigali-progress-critical', (counts.critical / total) * 100);
        }

        // =====================================================
        // KIGALI ENHANCED FUNCTIONS
        // =====================================================

        function getFilteredKigali() {
            return data.kigali.filter(k => {
                // Global country filter from sidebar
                if (globalCountryFilter && k.country_code !== globalCountryFilter) return false;
                // Region filter
                if (kigaliRegionFilter) {
                    const country = data.countries.find(c => c.country_code === k.country_code);
                    if (!country || country.region !== kigaliRegionFilter) return false;
                }
                // Group type filter
                if (kigaliGroupTypes.length > 0 && k.group_type && !kigaliGroupTypes.includes(k.group_type)) return false;
                return true;
            });
        }

        function getKigaliKPIs() {
            const filtered = getFilteredKigali();
            const kigaliParties = filtered.filter(k => k.kigali_party === 1).length;
            const montrealParties = filtered.filter(k => k.montreal_protocol_party === 1).length;
            const article5 = filtered.filter(k => k.group_type && k.group_type.includes('Article 5')).length;
            const nonArticle5 = filtered.filter(k => k.group_type && k.group_type.includes('Non-Article')).length;
            return { kigaliParties, montrealParties, article5, nonArticle5, total: filtered.length };
        }

        function initKigaliFilters() {
            // Populate region filter
            const regionSelect = document.getElementById('kigali-region-filter') as HTMLSelectElement;
            if (regionSelect) {
                const regions = new Set<string>();
                data.kigali.forEach(k => {
                    const country = data.countries.find(c => c.country_code === k.country_code);
                    if (country?.region) regions.add(country.region);
                });
                regionSelect.innerHTML = '<option value="">All Regions</option>';
                Array.from(regions).sort().forEach(r => {
                    const opt = document.createElement('option');
                    opt.value = r;
                    opt.textContent = r;
                    regionSelect.appendChild(opt);
                });
            }

            // Populate group type toggles
            const toggleContainer = document.getElementById('kigali-group-toggles');
            if (toggleContainer) {
                const groupTypes = new Set(data.kigali.map(k => k.group_type).filter(Boolean));
                kigaliGroupTypes = Array.from(groupTypes) as string[]; // Select all by default
                toggleContainer.innerHTML = '';
                Array.from(groupTypes).sort().forEach(gt => {
                    const btn = document.createElement('button');
                    btn.className = 'toggle-btn active';
                    btn.type = 'button';
                    btn.dataset.group = gt as string;
                    btn.textContent = gt as string;
                    btn.addEventListener('click', () => {
                        btn.classList.toggle('active');
                        if (btn.classList.contains('active')) {
                            if (!kigaliGroupTypes.includes(gt as string)) {
                                kigaliGroupTypes.push(gt as string);
                            }
                        } else {
                            kigaliGroupTypes = kigaliGroupTypes.filter(g => g !== gt);
                        }
                        updateKigaliView();
                    });
                    toggleContainer.appendChild(btn);
                });
            }
        }

        function updateKigaliKPIs() {
            const kpis = getKigaliKPIs();
            const setEl = (id: string, val: string | number) => {
                const el = document.getElementById(id);
                if (el) el.textContent = String(val);
            };
            setEl('kigali-kpi-parties', kpis.kigaliParties);
            setEl('kigali-kpi-montreal', kpis.montrealParties);
            setEl('kigali-kpi-article5', kpis.article5);
            setEl('kigali-kpi-non-article5', kpis.nonArticle5);
        }

        function updateKigaliCharts() {
            const filtered = getFilteredKigali();

            // Chart 1: Kigali by Region (bar chart)
            const regionCounts: Record<string, { parties: number, nonParties: number }> = {};
            filtered.forEach(k => {
                const country = data.countries.find(c => c.country_code === k.country_code);
                const r = country?.region || 'Unknown';
                if (!regionCounts[r]) regionCounts[r] = { parties: 0, nonParties: 0 };
                if (k.kigali_party === 1) {
                    regionCounts[r].parties += 1;
                } else {
                    regionCounts[r].nonParties += 1;
                }
            });
            const regionData = Object.entries(regionCounts).sort((a, b) => (b[1].parties + b[1].nonParties) - (a[1].parties + a[1].nonParties));

            setChart('chart-kigali-region', {
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { data: ['Kigali Parties', 'Non-Parties'], bottom: 0, textStyle: { fontSize: 10 } },
                grid: { left: '3%', right: '4%', bottom: '18%', top: '5%', containLabel: true },
                xAxis: {
                    type: 'category',
                    data: regionData.map(d => d[0]),
                    axisLabel: { rotate: 30, fontSize: 10, interval: 0 }
                },
                yAxis: { type: 'value', name: 'Countries', nameTextStyle: { fontSize: 11 } },
                series: [
                    { name: 'Kigali Parties', type: 'bar', stack: 'total', data: regionData.map(d => d[1].parties), itemStyle: { color: '#22c55e' } },
                    { name: 'Non-Parties', type: 'bar', stack: 'total', data: regionData.map(d => d[1].nonParties), itemStyle: { color: '#ef4444' } }
                ]
            });

            // Chart 2: Group Type Breakdown (doughnut)
            const groupCounts: Record<string, number> = {};
            filtered.forEach(k => {
                const g = k.group_type || 'Unknown';
                groupCounts[g] = (groupCounts[g] || 0) + 1;
            });
            const groupData = Object.entries(groupCounts).map(([name, value]) => ({ name, value }));
            const groupColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

            setChart('chart-kigali-groups', {
                tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                legend: { bottom: 5, textStyle: { fontSize: 10 } },
                series: [{
                    type: 'pie',
                    radius: ['35%', '60%'],
                    center: ['50%', '45%'],
                    data: groupData.map((d, i) => ({ ...d, itemStyle: { color: groupColors[i % groupColors.length] } })),
                    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
                    label: { show: false },
                    emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } }
                }]
            });

            // Chart 3: Refrigerant GWP chart
            renderRefrigerantGWPChart();
        }

        function renderRefrigerantGWPChart() {
            if (!data.refrigerants || data.refrigerants.length === 0) return;

            // Color mapping by refrigerant type
            const typeColors: Record<string, string> = {
                'HFC': '#ef4444',   // Red - High GWP
                'HCFC': '#f59e0b',  // Amber - Medium GWP
                'HFO': '#3b82f6',   // Blue - Low GWP
                'NR': '#22c55e'     // Green - Natural (lowest GWP)
            };

            // Sort refrigerants by GWP (descending) for visual impact
            const sortedRefrigerants = [...data.refrigerants]
                .filter(r => r.gwp_100_ar6 !== null && r.gwp_100_ar6 !== undefined)
                .sort((a, b) => b.gwp_100_ar6 - a.gwp_100_ar6);

            // Take top 25 for readability
            const topRefrigerants = sortedRefrigerants.slice(0, 25);

            const chartData = topRefrigerants.map(r => ({
                value: r.gwp_100_ar6,
                name: r.refrigerant_code,
                itemStyle: { color: typeColors[r.ref_type] || '#94a3b8' },
                refType: r.ref_type,
                isNatural: r.natural_refrigerant
            }));

            setChart('chart-refrigerant-gwp', {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    formatter: function(params: any) {
                        const item = params[0];
                        const refData = chartData.find(d => d.name === item.name);
                        return `<strong>${item.name}</strong><br/>
                                GWP (100-year): ${item.value.toLocaleString()}<br/>
                                Type: ${refData?.refType || 'Unknown'}<br/>
                                ${refData?.isNatural ? '<span style="color: #22c55e;">✓ Natural refrigerant</span>' : ''}`;
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '20%',
                    top: '8%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: chartData.map(d => d.name),
                    axisLabel: {
                        rotate: 45,
                        fontSize: 9,
                        interval: 0
                    },
                    axisTick: { alignWithLabel: true }
                },
                yAxis: {
                    type: 'log',
                    name: 'GWP (log scale)',
                    nameLocation: 'middle',
                    nameGap: 50,
                    nameTextStyle: { color: '#475569', fontSize: 11 },
                    axisLabel: {
                        formatter: (value: number) => {
                            if (value >= 1000) return (value / 1000) + 'k';
                            return value;
                        }
                    },
                    min: 1
                },
                series: [{
                    type: 'bar',
                    data: chartData,
                    barMaxWidth: 30,
                    label: {
                        show: false
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.3)'
                        }
                    }
                }]
            });
        }

        function updateKigaliCountryDetail(code: string) {
            const container = document.querySelector('#kigali-country-detail .country-detail') as HTMLElement;
            if (!container) return;

            const country = data.countries.find(c => c.country_code === code);
            const kigaliRecord = data.kigali.find(k => k.country_code === code);
            const regionData = data.regions.find(r => r.country_code === code);

            if (!country) {
                container.innerHTML = `<h4>Unknown Country</h4><p class="side-muted">No data available for ${code}</p>`;
                return;
            }

            const region = regionData?.region || country.region || 'N/A';
            const isKigaliParty = kigaliRecord?.kigali_party === 1;
            const isMontrealParty = kigaliRecord?.montreal_protocol_party === 1;
            const groupType = kigaliRecord?.group_type || 'N/A';

            let html = `<h4>${country.country_name}</h4>
                <div class="detail-row">
                    <span class="label">Region</span>
                    <span class="value">${region}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Kigali Amendment</span>
                    <span class="badge ${isKigaliParty ? 'green' : 'red'}">${isKigaliParty ? 'Party' : 'Non-Party'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Montreal Protocol</span>
                    <span class="badge ${isMontrealParty ? 'blue' : 'red'}">${isMontrealParty ? 'Party' : 'Non-Party'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Group Type</span>
                    <span class="value">${groupType}</span>
                </div>`;

            container.innerHTML = html;
        }

        function updateKigaliView() {
            updateKigaliKPIs();
            updateKigaliMap();
            updateKigaliCharts();
            // Update viewing pill
            const viewingEl = document.getElementById('kigali-viewing');
            if (viewingEl) {
                viewingEl.textContent = kigaliRegionFilter || 'Global';
            }
        }

        // =====================================================
        // ACCESS MAP
        // =====================================================
        let accessMapSvg: any;

        // 7-tier threshold-based color scale
        const ACCESS_THRESHOLDS = [1e6, 5e6, 20e6, 50e6, 200e6, 500e6];
        const ACCESS_COLORS = ['#fef9c3', '#fde68a', '#fbbf24', '#f97316', '#ef4444', '#dc2626', '#991b1b'];
        const ACCESS_LABELS = ['<1M', '1-5M', '5-20M', '20-50M', '50-200M', '200-500M', '>500M'];

        function getAccessTotalsFiltered(): Record<string, number> {
            const filtered = getAccessDataBySource(data, getAccessFilters(), accessDataSource);
            const totals: Record<string, number> = {};
            filtered.forEach((record) => {
                const value = record.population_without_cooling || 0;
                if (!totals[record.country_code]) {
                    totals[record.country_code] = 0;
                }
                totals[record.country_code] += value;
            });
            return totals;
        }

        function getAccessColorByValue(value: number): string {
            if (value <= 0) return '#e2e8f0';
            for (let i = 0; i < ACCESS_THRESHOLDS.length; i++) {
                if (value < ACCESS_THRESHOLDS[i]) return ACCESS_COLORS[i];
            }
            return ACCESS_COLORS[ACCESS_COLORS.length - 1];
        }

        function getAccessLevel(value: number, maxValue: number) {
            if (value <= 0) return { level: 'low', label: 'Low Gap' };
            const logValue = Math.log10(value + 1);
            const logMax = Math.log10(maxValue + 1);
            const ratio = logMax ? logValue / logMax : 0;
            if (ratio < 0.25) return { level: 'low', label: 'Low Gap' };
            if (ratio < 0.5) return { level: 'medium', label: 'Medium Gap' };
            if (ratio < 0.75) return { level: 'high', label: 'High Gap' };
            return { level: 'critical', label: 'Critical Gap' };
        }

        function getAccessColor(level: string) {
            switch (level) {
                case 'low':
                    return '#22c55e';
                case 'medium':
                    return '#f97316';
                case 'high':
                    return '#dc2626';
                case 'critical':
                    return '#991b1b';
                default:
                    return '#e2e8f0';
            }
        }

        function updateAccessKPIs() {
            const filtered = getAccessDataBySource(data, getAccessFilters(), accessDataSource);
            const kpis = getAccessKPIs(filtered);
            setText('access-kpi-total', (kpis.totalAtRisk / 1e9).toFixed(2) + 'B');
            setText('access-kpi-high-impact', kpis.highImpactCountries);
            setText('access-kpi-countries', kpis.countriesCovered);
            setText('access-kpi-regions', kpis.regions);
        }

        function populateAccessRegionFilter() {
            const select = document.getElementById('access-region-filter') as HTMLSelectElement;
            if (!select) return;
            const regions = [...new Set(data.access.map(r => r.region).filter(Boolean))].sort();
            select.innerHTML = '<option value="">All Regions</option>';
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region as string;
                option.textContent = region as string;
                select.appendChild(option);
            });
        }

        function handleAccessClick(event: MouseEvent, d: any) {
            // handleClick will call updateCountryDetail which handles Access view
            handleClick(event, d);
        }

        async function initAccessMap() {
            const container = document.getElementById('access-map-container');
            if (!container) return;

            // Clear any existing SVG to prevent duplicates on hot reload
            d3.select('#access-map-container').selectAll('svg').remove();

            const width = container.clientWidth || 800;
            const height = container.clientHeight || 400;

            accessMapSvg = d3.select('#access-map-container')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');

            const projection = d3.geoNaturalEarth1()
                .scale(width / 6)
                .translate([width / 2, height / 1.8]);

            const path = d3.geoPath().projection(projection);

            try {
                const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
                const countries = topojson.feature(world, world.objects.countries);
                const accessTotals = getAccessTotalsFiltered();

                accessMapSvg.selectAll('path')
                    .data(countries.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('class', 'country-path access-path')
                    .attr('data-code', d => countryIdToCode[normalizeId(d.id)] || '')
                    .attr('fill', d => {
                        const code = countryIdToCode[normalizeId(d.id)];
                        if (!code) return '#e2e8f0';
                        const country = data.countries.find(c => c.country_code === code);
                        if (selectedRegion && country?.region !== selectedRegion) {
                            return '#e2e8f0';
                        }
                        const value = accessTotals[code];
                        if (value === undefined || value <= 0) return '#e2e8f0';
                        return getAccessColorByValue(value);
                    })
                    .on('mouseover', (event: MouseEvent, d: any) => {
                        const code = countryIdToCode[normalizeId(d.id)];
                        if (!code) return;
                        const country = data.countries.find(c => c.country_code === code);
                        const accessTotals = getAccessTotalsFiltered();
                        const value = accessTotals[code] || 0;
                        const valueLabel = value ? `${(value / 1e6).toFixed(1)}M` : 'No data';

                        tooltip.innerHTML = `
                            <strong>${country?.country_name || code}</strong><br>
                            <span style="color: var(--text-secondary)">Year: ${accessYear}</span><br>
                            Population at Risk: ${valueLabel}
                        `;
                        tooltip.style.opacity = 1;
                        tooltip.style.left = (event.pageX + 10) + 'px';
                        tooltip.style.top = (event.pageY + 10) + 'px';
                    })
                    .on('mouseout', handleOut)
                    .on('click', handleAccessClick);

                updateAccessLegend();
                updateAccessProgress();
                updateAccessKPIs();
                updateViewingBadges();
            } catch (error) {
                console.error('Access map error:', error);
            }
        }

        function updateAccessMap() {
            if (!accessMapSvg) return;
            // Use unfiltered-by-country data for map display so all countries stay visible
            const mapFilters: AccessFilters = {
                year: accessYear,
                impactLevels: accessImpactLevels,
                populationCategories: accessPopCategories,
                region: accessRegionFilter,
                country: ''
            };
            const mapData = getAccessDataBySource(data, mapFilters, accessDataSource);
            const accessTotals: Record<string, number> = {};
            mapData.forEach((record) => {
                const value = record.population_without_cooling || 0;
                if (!accessTotals[record.country_code]) {
                    accessTotals[record.country_code] = 0;
                }
                accessTotals[record.country_code] += value;
            });

            accessMapSvg.selectAll('.access-path')
                .transition()
                .duration(300)
                .attr('fill', function() {
                    const code = d3.select(this).attr('data-code');
                    if (!code) return '#e2e8f0';
                    const country = data.countries.find(c => c.country_code === code);
                    if (selectedRegion && country?.region !== selectedRegion) {
                        return '#e2e8f0';
                    }
                    const value = accessTotals[code];
                    if (value === undefined || value <= 0) return '#e2e8f0';
                    return getAccessColorByValue(value);
                });

            updateAccessLegend();
            updateAccessProgress();
            updateViewingBadges();
        }

        function updateAccessLegend() {
            const legend = document.getElementById('access-legend');
            if (!legend) return;
            legend.innerHTML = ACCESS_COLORS.map((color, i) => `
                <div class="legend-item">
                    <div class="legend-color" style="background:${color}"></div>
                    ${ACCESS_LABELS[i]}
                </div>
            `).join('');
        }

        function updateAccessProgress() {
            const setWidth = (id: string, pct: number) => {
                const el = document.getElementById(id);
                if (el) el.style.width = `${pct}%`;
            };

            const accessTotals = getAccessTotalsFiltered();
            const values = Object.values(accessTotals);
            const total = values.length;
            const counts = { low: 0, medium: 0, high: 0, critical: 0 };
            const maxValue = Math.max(...values, 1);

            values.forEach((value) => {
                const level = getAccessLevel(value, maxValue).level;
                if (level === 'low') counts.low += 1;
                else if (level === 'medium') counts.medium += 1;
                else if (level === 'high') counts.high += 1;
                else counts.critical += 1;
            });

            if (!total) {
                setWidth('access-progress-low', 0);
                setWidth('access-progress-medium', 0);
                setWidth('access-progress-high', 0);
                setWidth('access-progress-critical', 0);
                return;
            }

            setWidth('access-progress-low', (counts.low / total) * 100);
            setWidth('access-progress-medium', (counts.medium / total) * 100);
            setWidth('access-progress-high', (counts.high / total) * 100);
            setWidth('access-progress-critical', (counts.critical / total) * 100);
        }

        // Access Charts
        function updateAccessCharts() {
            const container = document.getElementById('access-charts-container');
            if (!container) return;

            container.innerHTML = `
                <div class="charts-grid-2col">
                    <div class="card-panel">
                        <h3>Population at Risk by Region</h3>
                        <p class="chart-subtitle">Year: ${accessYear}</p>
                        <div class="chart-container" style="height: 280px;">
                            <div id="chart-access-regional" class="chart-surface"></div>
                        </div>
                    </div>
                    <div class="card-panel">
                        <h3>Trend Over Time</h3>
                        <p class="chart-subtitle">2013-2024</p>
                        <div class="chart-container" style="height: 280px;">
                            <div id="chart-access-trend" class="chart-surface"></div>
                        </div>
                    </div>
                </div>
                <div class="charts-grid-2col">
                    <div class="card-panel">
                        <h3>By Population Category</h3>
                        <p class="chart-subtitle">Current selection</p>
                        <div class="chart-container" style="height: 280px;">
                            <div id="chart-access-category" class="chart-surface"></div>
                        </div>
                    </div>
                    <div class="card-panel">
                        <h3>By Impact Level</h3>
                        <p class="chart-subtitle">Distribution</p>
                        <div class="chart-container" style="height: 280px;">
                            <div id="chart-access-impact" class="chart-surface"></div>
                        </div>
                    </div>
                </div>
            `;

            requestAnimationFrame(() => {
                renderAccessRegionalChart();
                renderAccessTrendChart();
                renderAccessCategoryChart();
                renderAccessImpactChart();
            });
        }

        function renderAccessRegionalChart() {
            const filtered = getAccessDataBySource(data, getAccessFilters(), accessDataSource);
            const regionTotals: Record<string, number> = {};
            filtered.forEach(r => {
                if (r.region) {
                    regionTotals[r.region] = (regionTotals[r.region] || 0) + (r.population_without_cooling || 0);
                }
            });

            // Abbreviate long region names for display
            const regionAbbrev: Record<string, string> = {
                'Asia and Middle East': 'Asia & ME',
                'Latin America and the Caribbean': 'LAC',
                'Sub-Saharan Africa': 'SSA',
                'North Africa': 'N. Africa',
                'Pacific': 'Pacific'
            };

            const regions = Object.keys(regionTotals).sort((a, b) => regionTotals[b] - regionTotals[a]);
            const displayNames = regions.map(r => regionAbbrev[r] || r);
            const values = regions.map(r => +(regionTotals[r] / 1e9).toFixed(2));

            setChart('chart-access-regional', {
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                        const idx = params[0].dataIndex;
                        return `${regions[idx]}: ${params[0].value}B`;
                    }
                },
                grid: { left: '12%', right: '4%', bottom: '18%', top: '12%', containLabel: false },
                xAxis: {
                    type: 'category',
                    data: displayNames,
                    axisLabel: { color: '#475569', rotate: 0, fontSize: 11 },
                    axisLine: { lineStyle: { color: '#e2e8f0' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Billions',
                    nameLocation: 'middle',
                    nameGap: 35,
                    nameTextStyle: { color: '#475569', fontSize: 11 },
                    axisLabel: { color: '#475569', fontSize: 10 },
                    splitLine: { lineStyle: { color: '#e2e8f0' } }
                },
                series: [{
                    name: 'Population at Risk',
                    type: 'bar',
                    data: values,
                    itemStyle: { color: '#ef4444' }
                }]
            });
        }

        function renderAccessTrendChart() {
            const years = ACCESS_YEARS;
            const baseFilters = getAccessFilters();

            const yearlyTotals = years.map(year => {
                const yearFiltered = data.access.filter(r => {
                    if (r.year !== year) return false;
                    if (baseFilters.impactLevels.length > 0 && r.impact_level && !baseFilters.impactLevels.includes(r.impact_level)) return false;
                    if (baseFilters.populationCategories.length > 0 && r.population_category && !baseFilters.populationCategories.includes(r.population_category)) return false;
                    if (baseFilters.region && r.region !== baseFilters.region) return false;
                    return true;
                });
                return yearFiltered.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0) / 1e9;
            });

            setChart('chart-access-trend', {
                tooltip: { trigger: 'axis', formatter: '{b}: {c}B' },
                grid: { left: '12%', right: '4%', bottom: '12%', top: '12%', containLabel: false },
                xAxis: {
                    type: 'category',
                    data: years.map(String),
                    axisLabel: { color: '#475569', fontSize: 10 },
                    axisLine: { lineStyle: { color: '#e2e8f0' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Billions',
                    nameLocation: 'middle',
                    nameGap: 35,
                    nameTextStyle: { color: '#475569', fontSize: 11 },
                    axisLabel: { color: '#475569', fontSize: 10 },
                    splitLine: { lineStyle: { color: '#e2e8f0' } }
                },
                series: [{
                    name: 'Population at Risk',
                    type: 'line',
                    data: yearlyTotals.map(v => +v.toFixed(2)),
                    smooth: true,
                    lineStyle: { color: '#ef4444', width: 3 },
                    areaStyle: { color: 'rgba(239, 68, 68, 0.15)' },
                    itemStyle: { color: '#ef4444' },
                    markLine: {
                        data: [{ xAxis: String(accessYear) }],
                        lineStyle: { color: '#1d4ed8', type: 'dashed' },
                        label: { formatter: 'Selected' }
                    }
                }]
            });
        }

        function renderAccessCategoryChart() {
            const filtered = getAccessDataBySource(data, getAccessFilters(), accessDataSource);
            const categoryTotals: Record<string, number> = {};
            POPULATION_CATEGORIES.forEach(cat => categoryTotals[cat] = 0);

            filtered.forEach(r => {
                if (r.population_category && categoryTotals[r.population_category] !== undefined) {
                    categoryTotals[r.population_category] += r.population_without_cooling || 0;
                }
            });

            const categoryColors: Record<string, string> = {
                'Rural Poor': '#ef4444',
                'Urban Poor': '#f97316',
                'Lower-Middle Income': '#fbbf24',
                'Middle-Income': '#22c55e'
            };

            setChart('chart-access-category', {
                tooltip: { trigger: 'item', formatter: '{b}: {c}B ({d}%)' },
                legend: {
                    bottom: 5,
                    textStyle: { color: '#475569', fontSize: 11 },
                    itemWidth: 12,
                    itemHeight: 12,
                    itemGap: 8
                },
                series: [{
                    name: 'By Category',
                    type: 'pie',
                    radius: ['30%', '55%'],
                    center: ['50%', '42%'],
                    data: POPULATION_CATEGORIES.map(cat => ({
                        value: +(categoryTotals[cat] / 1e9).toFixed(2),
                        name: cat,
                        itemStyle: { color: categoryColors[cat] }
                    }))
                }]
            });
        }

        function renderAccessImpactChart() {
            const filtered = getAccessDataBySource(data, getAccessFilters(), accessDataSource);
            const impactTotals: Record<string, number> = { High: 0, Medium: 0, Low: 0 };

            filtered.forEach(r => {
                if (r.impact_level && impactTotals[r.impact_level] !== undefined) {
                    impactTotals[r.impact_level] += r.population_without_cooling || 0;
                }
            });

            const impactColors: Record<string, string> = { High: '#dc2626', Medium: '#f97316', Low: '#22c55e' };

            setChart('chart-access-impact', {
                tooltip: { trigger: 'axis', formatter: '{b}: {c}B' },
                grid: { left: '12%', right: '4%', bottom: '12%', top: '12%', containLabel: false },
                xAxis: {
                    type: 'category',
                    data: IMPACT_LEVELS,
                    axisLabel: { color: '#475569', fontSize: 11 },
                    axisLine: { lineStyle: { color: '#e2e8f0' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Billions',
                    nameLocation: 'middle',
                    nameGap: 35,
                    nameTextStyle: { color: '#475569', fontSize: 11 },
                    axisLabel: { color: '#475569', fontSize: 10 },
                    splitLine: { lineStyle: { color: '#e2e8f0' } }
                },
                series: [{
                    name: 'Population at Risk',
                    type: 'bar',
                    data: IMPACT_LEVELS.map(level => ({
                        value: +(impactTotals[level] / 1e9).toFixed(2),
                        itemStyle: { color: impactColors[level] }
                    }))
                }]
            });
        }

        function updateAccessView() {
            updateAccessMap();
            updateAccessCharts();
            updateAccessKPIs();
        }

        function handleEmissionsHover(event: MouseEvent, d: any) {
            const code = countryIdToCode[normalizeId(d.id)];
            if (!code) {
                tooltip.innerHTML = `<em>Unknown country</em>`;
                tooltip.style.opacity = 1;
                tooltip.style.left = (event.pageX + 10) + 'px';
                tooltip.style.top = (event.pageY + 10) + 'px';
                return;
            }

            // Get emissions for hovered country (ignoring globalCountryFilter so tooltip works for all countries)
            let tooltipContent = '';
            const country = data.countries.find(c => c.country_code === code);
            const countryName = country?.country_name || code;

            if (emissionsDataSource === 'clasp') {
                const countryRecords = data.claspEnergy.filter(r =>
                    r.country_code === code &&
                    r.year === emissionsYear &&
                    (emissionsAppliances.length === 0 || emissionsAppliances.includes(r.appliance))
                );
                if (countryRecords.length === 0) {
                    tooltipContent = `<strong>${countryName}</strong><br><em>No CLASP (Indirect) data available</em>`;
                } else {
                    const scenarioName = CLASP_SCENARIO_NAMES[emissionsScenario] || emissionsScenario;
                    let total = 0;
                    let breakdown = '';
                    const byAppliance: Record<string, number> = {};
                    countryRecords.forEach(r => {
                        const co2 = getClaspCO2(r, emissionsScenario);
                        total += co2;
                        byAppliance[r.appliance] = (byAppliance[r.appliance] || 0) + co2;
                    });
                    Object.entries(byAppliance).forEach(([app, val]) => {
                        if (val > 0) {
                            breakdown += `${CLASP_APPLIANCE_SHORT[app] || app}: ${val.toFixed(3)} Mt<br>`;
                        }
                    });
                    tooltipContent = `
                        <strong>${countryName}</strong><br>
                        <span style="color: #64748b; font-size: 0.85em;">CLASP (Indirect) | ${scenarioName} | ${emissionsYear}</span><br>
                        <strong>Indirect: ${total.toFixed(3)} Mt CO2</strong><br>
                        ${breakdown}
                    `;
                }
            } else {
                const countryRecords = data.subcool.filter(r =>
                    r.country_code === code &&
                    r.year === emissionsYear &&
                    r.scenario_name === emissionsScenario
                );
                if (countryRecords.length === 0) {
                    tooltipContent = `<strong>${countryName}</strong><br><em>No HEAT Modelling data available</em>`;
                } else {
                    const scenarioName = HEAT_SCENARIO_NAMES[emissionsScenario] || emissionsScenario;
                    let direct = 0, indirect = 0;
                    const bySubsector: Record<string, { direct: number; indirect: number }> = {};
                    countryRecords.forEach(r => {
                        direct += r.direct_emission_mt || 0;
                        indirect += r.indirect_emission_mt || 0;
                        if (!bySubsector[r.subsector]) bySubsector[r.subsector] = { direct: 0, indirect: 0 };
                        bySubsector[r.subsector].direct += r.direct_emission_mt || 0;
                        bySubsector[r.subsector].indirect += r.indirect_emission_mt || 0;
                    });
                    const total = direct + indirect;
                    const typeLabel = emissionsType === 'direct' ? 'Direct' : emissionsType === 'indirect' ? 'Indirect' : 'Total';
                    const displayValue = emissionsType === 'direct' ? direct : emissionsType === 'indirect' ? indirect : total;
                    let breakdown = '';
                    Object.entries(bySubsector).forEach(([sub, vals]) => {
                        const subVal = emissionsType === 'direct' ? vals.direct : emissionsType === 'indirect' ? vals.indirect : (vals.direct + vals.indirect);
                        if (subVal > 0) {
                            breakdown += `${HEAT_SUBSECTOR_SHORT[sub] || sub}: ${subVal.toFixed(3)} Mt<br>`;
                        }
                    });
                    tooltipContent = `
                        <strong>${countryName}</strong><br>
                        <span style="color: #64748b; font-size: 0.85em;">HEAT Modelling | ${scenarioName} | ${emissionsYear}</span><br>
                        <strong>${typeLabel}: ${displayValue.toFixed(3)} Mt CO2</strong><br>
                        ${breakdown}
                    `;
                }
            }

            tooltip.innerHTML = tooltipContent;
            tooltip.style.opacity = 1;
            tooltip.style.left = (event.pageX + 10) + 'px';
            tooltip.style.top = (event.pageY + 10) + 'px';
        }

        function initEmissionsCharts() {
            // Timeline chart - emissions over years by region
            initEmissionsTimeline();
        }

        function initEmissionsTimeline() {
            const scenarioSelect = document.getElementById('emissions-timeline-scenario') as HTMLSelectElement | null;
            const scenario = scenarioSelect ? scenarioSelect.value : 'BAU';

            // Get all years
            const years = [...new Set(data.emissions.map(e => e.year))].sort((a, b) => a - b);

            // Get emissions by region for each year
            const regions = [...new Set(data.emissions.map(e => e.region).filter(Boolean))];
            const regionColors = {
                'Asia': '#ef4444',
                'Africa': '#f59e0b',
                'Europe': '#3b82f6',
                'North America': '#22c55e',
                'South America': '#8b5cf6',
                'Oceania': '#ec4899',
                'Latin America and the Caribbean': '#14b8a6',
                'Middle East': '#f97316'
            };

            const datasets = regions.map((region, idx) => {
                const yearData = years.map(year => {
                    const filtered = data.emissions.filter(e =>
                        e.scenario_code === scenario &&
                        e.year === year &&
                        e.region === region
                    );
                    return filtered.reduce((sum, e) => sum + (e.total_emissions || 0), 0);
                });

                return {
                    label: region,
                    data: yearData,
                    borderColor: regionColors[region] || `hsl(${idx * 45}, 70%, 50%)`,
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 2
                };
            });

            // Filter out regions with no data
            const filteredDatasets = datasets.filter(d => d.data.some(v => v > 0));

            setChart('chart-emissions-timeline', {
                tooltip: { trigger: 'axis' },
                legend: { right: 0, top: 'middle', textStyle: { color: '#475569' } },
                grid: { ...baseGrid, right: '18%' },
                xAxis: categoryAxis(years.map(String)),
                yAxis: valueAxis(),
                series: filteredDatasets.map((dataset) => ({
                    name: dataset.label,
                    type: 'line',
                    data: dataset.data,
                    smooth: true,
                    lineStyle: { color: dataset.borderColor },
                    itemStyle: { color: dataset.borderColor }
                }))
            });
        }

        function updateEmissionsCharts() {
            initEmissionsTimeline();
        }

        function populateEmissionsYears() {
            const years = [...new Set(data.emissions.map(e => e.year))].sort((a, b) => a - b);
            const select = document.getElementById('emissions-year') as HTMLSelectElement | null;
            if (!select) return;
            select.innerHTML = '';
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = String(year);
                option.textContent = String(year);
                if (year === 2024) option.selected = true;
                select.appendChild(option);
            });
            // Set default to first available year if 2024 not available
            if (!years.includes(2024) && years.length > 0) {
                emissionsYear = years[years.length - 1];
                select.value = String(emissionsYear);
            }
        }

        // =====================================================
        // NDC TRACKER
        // =====================================================
        let ndcMapSvg: any;

        function getFilteredNDC() {
            const filters = getNdcFilters();
            return data.ndcTracker.filter(n =>
                n.ndc_type === filters.type &&
                n.category === filters.category
            );
        }

        function populatePolicyNDCFilters() {
            // Populate NDC Type dropdown
            const typeSelect = document.getElementById('policy-ndc-type') as HTMLSelectElement | null;
            if (typeSelect) {
                typeSelect.innerHTML = '';
                // Get unique NDC types from data
                const types = [...new Set(data.ndcTracker.map(n => n.ndc_type).filter(Boolean))].sort();
                types.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type === 'Other' ? 'Previous NDC' : type;
                    if (type === ndcType) option.selected = true;
                    typeSelect.appendChild(option);
                });
            }

            // Populate NDC Category dropdown (excluding Kigali Amendment)
            const categorySelect = document.getElementById('policy-ndc-category') as HTMLSelectElement | null;
            if (categorySelect) {
                categorySelect.innerHTML = '';
                // Use predefined categories that exclude Kigali Amendment
                ndcCategories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    // Provide user-friendly labels
                    const labels: Record<string, string> = {
                        'Energy Efficiency': 'Energy Efficiency',
                        'Air Conditioners': 'Air Conditioners',
                        'Refrigerators & freezers': 'Refrigerators & Freezers',
                        'Appliance MEPS': 'MEPS',
                        'Appliance Labels': 'Labels',
                        'Doubling EE': 'Doubling EE Target'
                    };
                    option.textContent = labels[cat] ?? cat;
                    if (cat === ndcCategory) option.selected = true;
                    categorySelect.appendChild(option);
                });
            }
        }

        function getCountryNDCStatus() {
            const filtered = getFilteredNDC();
            const countryStatus: Record<
                string,
                {
                    name?: string | null;
                    continent?: string | null;
                    subregion?: string | null;
                    status?: string | null;
                    value?: number | null;
                }
            > = {};

            filtered.forEach(n => {
                countryStatus[n.country_code] = {
                    name: n.country_name,
                    continent: n.continent,
                    subregion: n.subregion,
                    status: n.mention_status,
                    value: n.mention_value
                };
            });

            return countryStatus;
        }

        function updateNDCKPIs() {
            // Total unique countries in NDC tracker
            const totalCountries = new Set(data.ndcTracker.map(n => n.country_code)).size;

            // Countries with NDC 3.0 submitted (not "No NDC submitted")
            const ndc30Submitted = new Set(
                data.ndcTracker
                    .filter(n => n.ndc_type === 'NDC 3.0' && n.mention_status !== 'No NDC submitted')
                    .map(n => n.country_code)
            ).size;

            // Countries mentioning Energy Efficiency in current NDC type filter
            const eeMentioned = new Set(
                data.ndcTracker
                    .filter(n => n.ndc_type === ndcType && n.category === 'Energy Efficiency' && n.mention_value === 1)
                    .map(n => n.country_code)
            ).size;

            // Countries mentioning Air Conditioners in current NDC type filter
            const acMentioned = new Set(
                data.ndcTracker
                    .filter(n => n.ndc_type === ndcType && n.category === 'Air Conditioners' && n.mention_value === 1)
                    .map(n => n.country_code)
            ).size;

            setText('ndc-total-countries', totalCountries);
            setText('ndc-submitted', ndc30Submitted);
            setText('ndc-ee-mentioned', eeMentioned);
            setText('ndc-ac-mentioned', acMentioned);
        }

        function getNDCColor(status: string | null | undefined) {
            if (status === 'Mentioned') return '#1d4ed8';
            if (status === 'Not mentioned') return '#3b82f6';
            if (status === 'No NDC submitted') return '#93c5fd';
            return '#e2e8f0';
        }

        function updateNDCProgress() {
            const setWidth = (id: string, pct: number) => {
                const el = document.getElementById(id);
                if (el) el.style.width = `${pct}%`;
            };

            const countryStatus = getCountryNDCStatus();
            const values = Object.values(countryStatus);
            const total = values.length;
            const counts = { mentioned: 0, not: 0, noNdc: 0, noData: 0 };

            values.forEach((status) => {
                if (!status?.status) counts.noData += 1;
                else if (status.status === 'Mentioned') counts.mentioned += 1;
                else if (status.status === 'Not mentioned') counts.not += 1;
                else if (status.status === 'No NDC submitted') counts.noNdc += 1;
                else counts.noData += 1;
            });

            if (!total) {
                setWidth('ndc-progress-mentioned', 0);
                setWidth('ndc-progress-not', 0);
                setWidth('ndc-progress-no-ndc', 0);
                setWidth('ndc-progress-no-data', 0);
                return;
            }

            setWidth('ndc-progress-mentioned', (counts.mentioned / total) * 100);
            setWidth('ndc-progress-not', (counts.not / total) * 100);
            setWidth('ndc-progress-no-ndc', (counts.noNdc / total) * 100);
            setWidth('ndc-progress-no-data', (counts.noData / total) * 100);
        }

        async function initNDCMap() {
            const container = byId('ndc-map-container');
            const width = container.clientWidth || 800;
            const height = container.clientHeight || 400;

            ndcMapSvg = d3.select('#ndc-map-container')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');

            const projection = d3.geoNaturalEarth1()
                .scale(width / 6)
                .translate([width / 2, height / 1.8]);

            const path = d3.geoPath().projection(projection);

            try {
                const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
                const countries = topojson.feature(world, world.objects.countries);

                ndcMapSvg.selectAll('path')
                    .data(countries.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('class', 'country-path ndc-path')
                    .attr('data-code', d => countryIdToCode[normalizeId(d.id)] || '')
                    .attr('fill', d => {
                        const code = countryIdToCode[normalizeId(d.id)];
                        if (!code) return '#e2e8f0';
                        const country = data.countries.find(c => c.country_code === code);
                        if (selectedRegion && country?.region !== selectedRegion) {
                            return '#e2e8f0';
                        }
                        // Initialize with GCP view (first tab)
                        const pledge = data.pledge.find(p => p.country_code === code);
                        if (!pledge) return '#e2e8f0';
                        return pledge.signatory === 1 ? '#22c55e' : '#94a3b8';
                    })
                    .on('mouseover', handlePolicyHover)
                    .on('mouseout', handleOut)
                    .on('click', handleClick);

                // Initialize with GCP legend
                updatePolicyLegend('gcp');
                updateNDCProgress();
                updatePolicyKPIs();
            } catch (error) {
                console.error('Policy map error:', error);
            }
        }

        function handlePolicyHover(event: MouseEvent, d: any) {
            const code = countryIdToCode[normalizeId(d.id)];
            if (!code) {
                tooltip.innerHTML = `<em>Unknown country</em>`;
                tooltip.style.opacity = 1;
                tooltip.style.left = (event.pageX + 10) + 'px';
                tooltip.style.top = (event.pageY + 10) + 'px';
                return;
            }

            const country = data.countries.find(c => c.country_code === code);
            const countryName = country?.country_name || code;
            const region = country?.region || 'N/A';

            if (policyMapType === 'gcp') {
                const pledge = data.pledge.find(p => p.country_code === code);
                const statusColor = pledge?.signatory === 1 ? '#22c55e' : '#94a3b8';
                const statusText = pledge?.signatory === 1 ? 'Signatory' : 'Non-Signatory';
                tooltip.innerHTML = `
                    <strong>${countryName}</strong><br>
                    <span style="color: var(--text-secondary)">Global Cooling Pledge</span><br>
                    Status: <span style="color: ${statusColor}">${statusText}</span><br>
                    Region: ${region}
                `;
            } else if (policyMapType === 'ndc') {
                const record = getNdcRecord(data, code, getNdcFilters());
                if (!record) {
                    tooltip.innerHTML = `<strong>${countryName}</strong><br><em>No NDC data</em>`;
                } else {
                    const statusColor =
                        record.mention_status === 'Mentioned' ? '#22c55e' :
                        record.mention_status === 'Not mentioned' ? '#ef4444' : '#94a3b8';
                    tooltip.innerHTML = `
                        <strong>${countryName}</strong><br>
                        <span style="color: var(--text-secondary)">${ndcType} | ${ndcCategory}</span><br>
                        Status: <span style="color: ${statusColor}">${record.mention_status}</span><br>
                        Region: ${region}
                    `;
                }
            } else {
                // NCAP tooltip
                const ncapRecord = data.ncap.find(n => n.country_code === code);
                if (ncapRecord) {
                    tooltip.innerHTML = `
                        <strong>${countryName}</strong><br>
                        <span style="color: var(--text-secondary)">National Cooling Action Plan</span><br>
                        Status: <span style="color: #8b5cf6">Has NCAP</span><br>
                        ${ncapRecord.year ? 'Year: ' + ncapRecord.year + '<br>' : ''}
                        Region: ${region}
                    `;
                } else {
                    tooltip.innerHTML = `
                        <strong>${countryName}</strong><br>
                        <span style="color: var(--text-secondary)">National Cooling Action Plan</span><br>
                        Status: <span style="color: #94a3b8">No NCAP</span><br>
                        Region: ${region}
                    `;
                }
            }

            tooltip.style.opacity = 1;
            tooltip.style.left = (event.pageX + 10) + 'px';
            tooltip.style.top = (event.pageY + 10) + 'px';
        }

        function updateNDCMap() {
            const countryStatus = getCountryNDCStatus();

            ndcMapSvg.selectAll('.ndc-path')
                .transition()
                .duration(300)
                .attr('fill', function() {
                    const code = d3.select(this).attr('data-code');
                    if (!code) return '#e2e8f0';
                    const country = data.countries.find(c => c.country_code === code);
                    if (selectedRegion && country?.region !== selectedRegion) {
                        return '#e2e8f0';
                    }
                    const status = countryStatus[code];
                    return getNDCColor(status ? status.status : null);
                });

            updateNDCLegend();
            updateNDCKPIs();
            updateNDCProgress();
        }

        function updateNDCLegend() {
            byId('ndc-legend').innerHTML = `
                <div class="legend-item">
                    <div class="legend-color" style="background:#1d4ed8"></div>
                    High / Active
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#3b82f6"></div>
                    Medium / Partial
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#93c5fd"></div>
                    Low / None
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#e2e8f0"></div>
                    No Data
                </div>
            `;
        }

        function handleNDCHover(event: MouseEvent, d: any) {
            const code = countryIdToCode[normalizeId(d.id)];
            if (!code) {
                tooltip.innerHTML = `<em>Unknown country</em>`;
                tooltip.style.opacity = 1;
                tooltip.style.left = (event.pageX + 10) + 'px';
                tooltip.style.top = (event.pageY + 10) + 'px';
                return;
            }

            const record = getNdcRecord(data, code, getNdcFilters());

            if (!record) {
                tooltip.innerHTML = `<strong>${code}</strong><br><em>No NDC data</em>`;
            } else {
                const statusColor =
                    record.mention_status === 'Mentioned'
                        ? '#22c55e'
                        : record.mention_status === 'Not mentioned'
                            ? '#ef4444'
                            : '#94a3b8';
                tooltip.innerHTML = `
                    <strong>${record.country_name || code}</strong><br>
                    <span style="color: var(--text-secondary)">${ndcType} | ${ndcCategory}</span><br>
                    Status: <span style="color: ${statusColor}">${record.mention_status}</span><br>
                    Region: ${record.continent || 'N/A'}
                `;
            }

            tooltip.style.opacity = 1;
            tooltip.style.left = (event.pageX + 10) + 'px';
            tooltip.style.top = (event.pageY + 10) + 'px';
        }

        // NDC categories to display (excluding Kigali Amendment per user request)
        const ndcCategories = ['Energy Efficiency', 'Air Conditioners', 'Refrigerators & freezers',
                               'Appliance MEPS', 'Appliance Labels', 'Doubling EE'];

        // NDC type options (from database)
        const ndcTypeOptions = ['NDC 3.0', 'Other'];

        // Policy map type state
        let policyMapType = 'gcp';

        function updatePolicyMap(mapType: string) {
            policyMapType = mapType;

            // Update map colors based on selected type (all countries stay visible)
            ndcMapSvg.selectAll('.ndc-path')
                .transition()
                .duration(300)
                .attr('fill', function() {
                    const code = d3.select(this).attr('data-code');
                    if (!code) return '#e2e8f0';

                    const country = data.countries.find(c => c.country_code === code);
                    if (selectedRegion && country?.region !== selectedRegion) {
                        return '#e2e8f0';
                    }

                    if (mapType === 'gcp') {
                        // Global Cooling Pledge
                        const pledge = data.pledge.find(p => p.country_code === code);
                        if (!pledge) return '#e2e8f0';
                        return pledge.signatory === 1 ? '#22c55e' : '#94a3b8';
                    } else if (mapType === 'ndc') {
                        // NDC Cooling Mentions
                        const countryStatus = getCountryNDCStatus();
                        const status = countryStatus[code];
                        return getNDCColor(status ? status.status : null);
                    } else if (mapType === 'NCAP') {
                        // NCAP Status - countries with NCAP
                        const ncapCountry = data.ncap.find(n => n.country_code === code);
                        return ncapCountry ? '#8b5cf6' : '#e2e8f0';
                    }
                    return '#e2e8f0';
                })
                .attr('stroke', function() {
                    return '#cbd5e1';
                });

            // Update legend based on map type
            updatePolicyLegend(mapType);
            updatePolicyKPIs();
        }

        function updatePolicyLegend(mapType: string) {
            const legendEl = byId('ndc-legend');
            if (!legendEl) return;

            if (mapType === 'gcp') {
                legendEl.innerHTML = `
                    <div class="legend-item">
                        <div class="legend-color" style="background:#22c55e"></div>
                        Signatory
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background:#94a3b8"></div>
                        Non-Signatory
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background:#e2e8f0"></div>
                        No Data
                    </div>
                `;
            } else if (mapType === 'ndc') {
                legendEl.innerHTML = `
                    <div class="legend-item">
                        <div class="legend-color" style="background:#1d4ed8"></div>
                        Mentioned
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background:#3b82f6"></div>
                        Not Mentioned
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background:#93c5fd"></div>
                        No NDC Submitted
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background:#e2e8f0"></div>
                        No Data
                    </div>
                `;
            } else if (mapType === 'NCAP') {
                legendEl.innerHTML = `
                    <div class="legend-item">
                        <div class="legend-color" style="background:#8b5cf6"></div>
                        Has NCAP
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background:#e2e8f0"></div>
                        No NCAP
                    </div>
                `;
            }
        }

        function initNDCCharts() {
            // NDC Mentions by Category Chart (excluding Kigali Amendment)
            const mentionedCounts = ndcCategories.map(cat => {
                return data.ndcTracker.filter(n =>
                    n.ndc_type === ndcType &&
                    n.category === cat &&
                    n.mention_value === 1
                ).length;
            });

            const notMentionedCounts = ndcCategories.map(cat => {
                return data.ndcTracker.filter(n =>
                    n.ndc_type === ndcType &&
                    n.category === cat &&
                    n.mention_status === 'Not mentioned'
                ).length;
            });

            setChart('chart-ndc-categories', {
                tooltip: { trigger: 'axis' },
                legend: {
                    bottom: 0,
                    textStyle: { color: '#475569', fontSize: 11 }
                },
                grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
                xAxis: categoryAxis(ndcCategories),
                yAxis: valueAxis(),
                series: [
                    {
                        name: 'Mentioned',
                        type: 'bar',
                        stack: 'total',
                        data: mentionedCounts,
                        itemStyle: { color: '#22c55e' }
                    },
                    {
                        name: 'Not Mentioned',
                        type: 'bar',
                        stack: 'total',
                        data: notMentionedCounts,
                        itemStyle: { color: '#ef4444' }
                    }
                ]
            });

            // NDC Status by Region Chart
            const regions = [...new Set(data.ndcTracker.map(n => n.continent).filter(Boolean))];
            const regionMentioned = regions.map(region => {
                return data.ndcTracker.filter(n =>
                    n.ndc_type === ndcType &&
                    n.category === ndcCategory &&
                    n.continent === region &&
                    n.mention_value === 1
                ).length;
            });

            setChart('chart-ndc-regions', {
                tooltip: { trigger: 'axis' },
                legend: {
                    bottom: 0,
                    textStyle: { color: '#475569', fontSize: 11 }
                },
                grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
                xAxis: categoryAxis(regions),
                yAxis: valueAxis(),
                series: [
                    {
                        name: `Countries mentioning ${ndcCategory}`,
                        type: 'bar',
                        data: regionMentioned,
                        itemStyle: { color: '#3b82f6' }
                    }
                ]
            });

            // Initialize GCP and Policy charts
            initPolicyCharts();
        }

        function initPolicyCharts() {
            // Update Policy KPIs
            updatePolicyKPIs();

            // Initialize charts using the dynamic container approach
            // Start with GCP charts (default active tab)
            updatePolicyChartsForMapType('gcp');
        }

        function updatePolicyView() {
            updatePolicyKPIs();
            updatePolicyMap(policyMapType);
            updatePolicyChartsForMapType(policyMapType);
        }

        function updatePolicyKPIs() {
            // Filter by global country if set
            const filteredPledge = globalCountryFilter
                ? data.pledge.filter(p => p.country_code === globalCountryFilter)
                : data.pledge;
            const filteredNdcTracker = globalCountryFilter
                ? data.ndcTracker.filter(n => n.country_code === globalCountryFilter)
                : data.ndcTracker;
            const filteredNcap = globalCountryFilter
                ? data.ncap.filter(n => n.country_code === globalCountryFilter)
                : data.ncap;

            // GCP Signatories
            const gcpSignatories = filteredPledge.filter(p => p.signatory === 1).length;
            setText('policy-kpi-gcp', gcpSignatories);

            // NDC 3.0 Submitted
            const ndc30Submitted = new Set(
                filteredNdcTracker
                    .filter(n => n.ndc_type === 'NDC 3.0' && n.mention_status !== 'No NDC submitted')
                    .map(n => n.country_code)
            ).size;
            setText('policy-kpi-ndc', ndc30Submitted);

            // Cooling Mentioned (Energy Efficiency in NDC 3.0)
            const coolingMentioned = new Set(
                filteredNdcTracker
                    .filter(n => n.ndc_type === 'NDC 3.0' && n.category === 'Energy Efficiency' && n.mention_value === 1)
                    .map(n => n.country_code)
            ).size;
            setText('policy-kpi-cooling', coolingMentioned);

            // NCAP - count of countries with NCAPs
            const ncapCount = filteredNcap.length;
            setText('policy-kpi-NCAP', ncapCount);
        }

        function updateNDCCharts() {
            // Update categories chart (using ndcCategories which excludes Kigali Amendment)
            const mentionedCounts = ndcCategories.map(cat => {
                return data.ndcTracker.filter(n =>
                    n.ndc_type === ndcType &&
                    n.category === cat &&
                    n.mention_value === 1
                ).length;
            });

            const notMentionedCounts = ndcCategories.map(cat => {
                return data.ndcTracker.filter(n =>
                    n.ndc_type === ndcType &&
                    n.category === cat &&
                    n.mention_status === 'Not mentioned'
                ).length;
            });

            setChart('chart-ndc-categories', {
                tooltip: { trigger: 'axis' },
                legend: {
                    bottom: 0,
                    textStyle: { color: '#475569', fontSize: 11 }
                },
                grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
                xAxis: categoryAxis(ndcCategories),
                yAxis: valueAxis(),
                series: [
                    {
                        name: 'Mentioned',
                        type: 'bar',
                        stack: 'total',
                        data: mentionedCounts,
                        itemStyle: { color: '#22c55e' }
                    },
                    {
                        name: 'Not Mentioned',
                        type: 'bar',
                        stack: 'total',
                        data: notMentionedCounts,
                        itemStyle: { color: '#ef4444' }
                    }
                ]
            });

            // Update regions chart
            const regions = [...new Set(data.ndcTracker.map(n => n.continent).filter(Boolean))];
            const regionMentioned = regions.map(region => {
                return data.ndcTracker.filter(n =>
                    n.ndc_type === ndcType &&
                    n.category === ndcCategory &&
                    n.continent === region &&
                    n.mention_value === 1
                ).length;
            });

            setChart('chart-ndc-regions', {
                tooltip: { trigger: 'axis' },
                legend: {
                    bottom: 0,
                    textStyle: { color: '#475569', fontSize: 11 }
                },
                grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
                xAxis: categoryAxis(regions),
                yAxis: valueAxis(),
                series: [
                    {
                        name: `Countries mentioning ${ndcCategory}`,
                        type: 'bar',
                        data: regionMentioned,
                        itemStyle: { color: '#3b82f6' }
                    }
                ]
            });

            // NDC 3.0 vs Previous NDC comparison
            const ndc30Mentioned = ndcCategories.map(cat => {
                return new Set(data.ndcTracker.filter(n =>
                    n.ndc_type === 'NDC 3.0' &&
                    n.category === cat &&
                    n.mention_value === 1
                ).map(n => n.country_code)).size;
            });
            const prevNdcMentioned = ndcCategories.map(cat => {
                return new Set(data.ndcTracker.filter(n =>
                    n.ndc_type === 'Other' &&
                    n.category === cat &&
                    n.mention_value === 1
                ).map(n => n.country_code)).size;
            });

            setChart('chart-ndc-comparison', {
                tooltip: { trigger: 'axis' },
                legend: {
                    bottom: 0,
                    textStyle: { color: '#475569', fontSize: 11 }
                },
                grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
                xAxis: categoryAxis(ndcCategories),
                yAxis: valueAxis(),
                series: [
                    {
                        name: 'NDC 3.0',
                        type: 'bar',
                        data: ndc30Mentioned,
                        itemStyle: { color: '#3b82f6' }
                    },
                    {
                        name: 'Previous NDC',
                        type: 'bar',
                        data: prevNdcMentioned,
                        itemStyle: { color: '#94a3b8' }
                    }
                ]
            });

            // NDC Submission Status (pie chart)
            const submittedCount = new Set(data.ndcTracker.filter(n =>
                n.ndc_type === 'NDC 3.0' && n.mention_status !== 'No NDC submitted'
            ).map(n => n.country_code)).size;
            const notSubmittedCount = new Set(data.ndcTracker.filter(n =>
                n.ndc_type === 'NDC 3.0' && n.mention_status === 'No NDC submitted'
            ).map(n => n.country_code)).size;

            setChart('chart-ndc-submission', {
                tooltip: { trigger: 'item' },
                legend: {
                    bottom: 0,
                    textStyle: { color: '#475569', fontSize: 11 }
                },
                series: [{
                    name: 'NDC 3.0 Status',
                    type: 'pie',
                    radius: ['35%', '60%'],
                    center: ['50%', '45%'],
                    data: [
                        { value: submittedCount, name: 'NDC 3.0 Submitted', itemStyle: { color: '#22c55e' } },
                        { value: notSubmittedCount, name: 'Not Submitted', itemStyle: { color: '#ef4444' } }
                    ]
                }]
            });
        }

        function updatePolicyChartsForMapType(mapType: string) {
            const container = document.getElementById('policy-charts-container');
            if (!container) return;

            // Clear existing charts
            container.innerHTML = '';

            if (mapType === 'gcp') {
                // Create GCP chart structure
                container.innerHTML = `
                    <div class="charts-grid-2col">
                        <div class="card-panel">
                            <h3>Global Cooling Pledge by Region</h3>
                            <p class="chart-subtitle">Signatories vs Non-Signatories</p>
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-gcp-regions" class="chart-surface"></div>
                            </div>
                        </div>
                        <div class="card-panel">
                            <h3>GCP Signatories & NDC Cooling Mentions</h3>
                            <p class="chart-subtitle">Energy Efficiency in NDC 3.0</p>
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-gcp-ndc-overlap" class="chart-surface"></div>
                            </div>
                        </div>
                    </div>
                    <div class="charts-grid-2col">
                        <div class="card-panel">
                            <h3>GCP Signatories by Region</h3>
                            <p class="chart-subtitle">Regional distribution</p>
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-gcp-timeline" class="chart-surface"></div>
                            </div>
                        </div>
                        <div class="card-panel">
                            <h3>Policy Framework Coverage</h3>
                            <p class="chart-subtitle">GCP + NDC Status</p>
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-policy-coverage" class="chart-surface"></div>
                            </div>
                        </div>
                    </div>
                `;
                // Initialize GCP charts after DOM is ready
                requestAnimationFrame(() => updateGCPCharts());

            } else if (mapType === 'ndc') {
                // Create NDC chart structure
                container.innerHTML = `
                    <div class="charts-grid-2col">
                        <div class="card-panel">
                            <h3>NDC Cooling Mentions by Category</h3>
                            <p class="chart-subtitle">Excluding Kigali Amendment</p>
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-ndc-categories" class="chart-surface"></div>
                            </div>
                        </div>
                        <div class="card-panel">
                            <h3>NDC Status by Region</h3>
                            <p class="chart-subtitle">Countries mentioning cooling</p>
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-ndc-regions" class="chart-surface"></div>
                            </div>
                        </div>
                    </div>
                    <div class="charts-grid-2col">
                        <div class="card-panel">
                            <h3>NDC 3.0 vs Previous NDC</h3>
                            <p class="chart-subtitle">Comparison of cooling mentions</p>
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-ndc-comparison" class="chart-surface"></div>
                            </div>
                        </div>
                        <div class="card-panel">
                            <h3>NDC Submission Status</h3>
                            <p class="chart-subtitle">Countries by submission status</p>
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-ndc-submission" class="chart-surface"></div>
                            </div>
                        </div>
                    </div>
                `;
                // Initialize NDC charts after DOM is ready
                requestAnimationFrame(() => updateNDCCharts());

            } else if (mapType === 'NCAP') {
                // Create NCAP charts
                container.innerHTML = `
                    <div class="charts-grid-2col">
                        <div class="card-panel">
                            <h3>NCAPs by Region</h3>
                            <p class="chart-subtitle">Countries with National Cooling Action Plans</p>
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-ncap-regions" class="chart-surface"></div>
                            </div>
                        </div>
                        <div class="card-panel">
                            <h3>NCAP Development Timeline</h3>
                            <p class="chart-subtitle">NCAPs by year of adoption</p>
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-ncap-timeline" class="chart-surface"></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-panel">
                        <h3>Countries with NCAPs</h3>
                        <p class="chart-subtitle">List of countries that have developed National Cooling Action Plans</p>
                        <div id="ncap-countries-list" class="ncap-countries-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; padding: 1rem;"></div>
                    </div>
                `;
                // Initialize NCAP charts after DOM is ready
                requestAnimationFrame(() => updateNCAPCharts());
            }
        }

        function updateGCPCharts() {
            const regions = [...new Set(data.countries.map(c => c.region).filter(Boolean))];
            const gcpSignatories = regions.map(region => {
                const regionCountries = data.countries.filter(c => c.region === region).map(c => c.country_code);
                return data.pledge.filter(p => regionCountries.includes(p.country_code) && p.signatory === 1).length;
            });
            const gcpNonSignatories = regions.map(region => {
                const regionCountries = data.countries.filter(c => c.region === region).map(c => c.country_code);
                return data.pledge.filter(p => regionCountries.includes(p.country_code) && p.signatory === 0).length;
            });

            // GCP by Region Chart
            setChart('chart-gcp-regions', {
                tooltip: { trigger: 'axis' },
                legend: {
                    bottom: 0,
                    textStyle: { color: '#475569', fontSize: 11 }
                },
                grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
                xAxis: categoryAxis(regions),
                yAxis: valueAxis(),
                series: [
                    {
                        name: 'Signatories',
                        type: 'bar',
                        stack: 'total',
                        data: gcpSignatories,
                        itemStyle: { color: '#22c55e' }
                    },
                    {
                        name: 'Non-Signatories',
                        type: 'bar',
                        stack: 'total',
                        data: gcpNonSignatories,
                        itemStyle: { color: '#94a3b8' }
                    }
                ]
            });

            // GCP Signatories with NDC Cooling Mentions (pie chart)
            const gcpWithNDC = data.pledge.filter(p => {
                if (p.signatory !== 1) return false;
                return data.ndcTracker.some(n =>
                    n.country_code === p.country_code &&
                    n.ndc_type === 'NDC 3.0' &&
                    n.category === 'Energy Efficiency' &&
                    n.mention_value === 1
                );
            }).length;
            const gcpWithoutNDC = data.pledge.filter(p => p.signatory === 1).length - gcpWithNDC;

            setChart('chart-gcp-ndc-overlap', {
                tooltip: { trigger: 'item' },
                legend: {
                    bottom: 0,
                    textStyle: { color: '#475569', fontSize: 11 }
                },
                series: [{
                    name: 'GCP Signatories',
                    type: 'pie',
                    radius: ['35%', '60%'],
                    center: ['50%', '45%'],
                    data: [
                        { value: gcpWithNDC, name: 'With NDC Cooling', itemStyle: { color: '#22c55e' } },
                        { value: gcpWithoutNDC, name: 'Without NDC Cooling', itemStyle: { color: '#f59e0b' } }
                    ]
                }]
            });

            // GCP Adoption Timeline (bar chart by region showing total)
            setChart('chart-gcp-timeline', {
                tooltip: { trigger: 'axis' },
                legend: {
                    bottom: 0,
                    textStyle: { color: '#475569', fontSize: 11 }
                },
                grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
                xAxis: categoryAxis(regions),
                yAxis: valueAxis(),
                series: [{
                    name: 'GCP Signatories',
                    type: 'bar',
                    data: gcpSignatories,
                    itemStyle: { color: '#22c55e' }
                }]
            });

            // Update policy coverage chart
            updatePolicyCoverageChart();
        }

        function updateNCAPCharts() {
            // NCAP by Region Chart
            const regions = [...new Set(data.countries.map(c => c.region).filter(Boolean))];
            const ncapByRegion = regions.map(region => {
                const regionCountries = data.countries.filter(c => c.region === region).map(c => c.country_code);
                return data.ncap.filter(n => regionCountries.includes(n.country_code)).length;
            });

            setChart('chart-ncap-regions', {
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
                xAxis: categoryAxis(regions),
                yAxis: valueAxis(),
                series: [
                    {
                        name: 'Countries with NCAP',
                        type: 'bar',
                        data: ncapByRegion,
                        itemStyle: { color: '#8b5cf6' }
                    }
                ]
            });

            // NCAP Timeline Chart - by year
            const ncapYears = data.ncap
                .map(n => n.year)
                .filter((y): y is number => y !== null && y !== undefined)
                .sort((a, b) => a - b);

            const yearCounts: Record<number, number> = {};
            ncapYears.forEach(year => {
                yearCounts[year] = (yearCounts[year] || 0) + 1;
            });

            const years = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
            const counts = years.map(y => yearCounts[y]);

            setChart('chart-ncap-timeline', {
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
                xAxis: categoryAxis(years.map(String)),
                yAxis: valueAxis(),
                series: [
                    {
                        name: 'NCAPs Developed',
                        type: 'bar',
                        data: counts,
                        itemStyle: { color: '#a855f7' }
                    }
                ]
            });

            // Countries list
            const listEl = document.getElementById('ncap-countries-list');
            if (listEl) {
                const sortedNcap = [...data.ncap].sort((a, b) => a.country_name.localeCompare(b.country_name));
                listEl.innerHTML = sortedNcap.map(n => `
                    <div class="ncap-country-card" style="background: #f8fafc; border-radius: 8px; padding: 0.75rem; border-left: 3px solid #8b5cf6;">
                        <div style="font-weight: 600; color: #1e293b;">${n.country_name}</div>
                        <div style="font-size: 0.8rem; color: #64748b;">${n.year ? 'Adopted: ' + n.year : 'Year not specified'}</div>
                        ${n.policy_available_pdf ? '<a href="' + n.policy_available_pdf + '" target="_blank" style="font-size: 0.75rem; color: #8b5cf6;">View PDF</a>' : ''}
                    </div>
                `).join('');
            }
        }

        function updatePolicyCoverageChart() {
            const gcpCount = data.pledge.filter(p => p.signatory === 1).length;
            const ndcCoolingCount = new Set(
                data.ndcTracker.filter(n =>
                    n.ndc_type === ndcType &&
                    n.category === ndcCategory &&
                    n.mention_value === 1
                ).map(n => n.country_code)
            ).size;
            const bothCount = data.pledge.filter(p => {
                if (p.signatory !== 1) return false;
                const hasNdcMention = data.ndcTracker.some(n =>
                    n.country_code === p.country_code &&
                    n.ndc_type === ndcType &&
                    n.category === ndcCategory &&
                    n.mention_value === 1
                );
                return hasNdcMention;
            }).length;
            const neitherCount = data.countries.length - gcpCount - ndcCoolingCount + bothCount;

            setChart('chart-policy-coverage', {
                tooltip: { trigger: 'item' },
                legend: {
                    bottom: 0,
                    textStyle: { color: '#475569', fontSize: 11 }
                },
                series: [{
                    name: 'Policy Coverage',
                    type: 'pie',
                    radius: ['35%', '55%'],
                    center: ['50%', '40%'],
                    avoidLabelOverlap: false,
                    label: { show: false },
                    data: [
                        { value: bothCount, name: 'GCP + NDC', itemStyle: { color: '#22c55e' } },
                        { value: gcpCount - bothCount, name: 'GCP Only', itemStyle: { color: '#3b82f6' } },
                        { value: ndcCoolingCount - bothCount, name: 'NDC Only', itemStyle: { color: '#f59e0b' } },
                        { value: Math.max(0, neitherCount), name: 'Neither', itemStyle: { color: '#e2e8f0' } }
                    ]
                }]
            });
        }

        // =====================================================
        // VIEW NAVIGATION
        // =====================================================
        function switchView(view: string | undefined) {
            if (!view) return;
            console.log('Switching to view:', view);
            currentView = view;
            const container = document.querySelector<HTMLElement>('.main-container');
            if (container) {
                container.classList.toggle('overview-only', view === 'overview');
            }
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            const viewSection = document.getElementById(`view-${view}`);
            if (viewSection) {
                viewSection.classList.add('active');
            } else {
                console.error('View section not found:', `view-${view}`);
            }
            document.querySelectorAll<HTMLElement>('.nav-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === view);
            });
            updateSidePanels(view);
            updateSidebarStats();
            updateViewingBadges();
            updateApplianceScopeState(view);
            // Show/hide pillar info button
            const infoBtn = document.getElementById('pillar-info-btn') as HTMLElement | null;
            if (infoBtn) infoBtn.style.display = pillarInfo[view] ? '' : 'none';
            requestAnimationFrame(resizeCharts);
        }

        function updateApplianceScopeState(view: string) {
            // Disable appliance scope for Policy Framework and Access & Vulnerability views
            const disableScope = view === 'policy' || view === 'access';
            const scopeToggle = document.querySelector('.scope-toggle');
            const scopeLabel = document.querySelector('.scope-label');

            if (scopeToggle) {
                scopeToggle.classList.toggle('disabled', disableScope);
            }
            if (scopeLabel) {
                scopeLabel.classList.toggle('disabled', disableScope);
            }

            document.querySelectorAll<HTMLButtonElement>('.scope-btn').forEach(btn => {
                btn.disabled = disableScope;
            });
        }

        // =====================================================
        // EVENT HANDLERS
        // =====================================================
        // Pillar information content
        const pillarInfo: Record<string, { title: string; subtitle: string; body: string }> = {
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

        function openPillarModal() {
            const info = pillarInfo[currentView];
            if (!info) return;
            const overlay = document.getElementById('pillar-modal-overlay');
            const title = document.getElementById('pillar-modal-title');
            const subtitle = document.getElementById('pillar-modal-subtitle');
            const body = document.getElementById('pillar-modal-body');
            if (title) title.textContent = info.title;
            if (subtitle) subtitle.textContent = info.subtitle;
            if (body) body.innerHTML = info.body;
            if (overlay) overlay.classList.add('active');
        }

        function closePillarModal() {
            const overlay = document.getElementById('pillar-modal-overlay');
            if (overlay) overlay.classList.remove('active');
        }

        function setupEventHandlers() {
            console.log('Setting up event handlers...');

            // Pillar Information modal
            document.getElementById('pillar-info-btn')?.addEventListener('click', openPillarModal);
            document.getElementById('pillar-modal-close')?.addEventListener('click', closePillarModal);
            document.getElementById('pillar-modal-overlay')?.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).id === 'pillar-modal-overlay') closePillarModal();
            });

            // Navigation
            const navBtns = document.querySelectorAll<HTMLButtonElement>('.nav-btn');
            console.log('Found nav buttons:', navBtns.length);
            navBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    console.log('Nav button clicked:', btn.dataset.view);
                    switchView(btn.dataset.view);
                });
            });

            document.querySelectorAll<HTMLButtonElement>('.scope-btn').forEach((btn) => {
                btn.addEventListener('click', () => setApplianceScope(btn.dataset.scope ?? 'ac'));
            });

            // Overview carousel
            let carouselIdx = 0;
            const slides = document.querySelectorAll<HTMLElement>('.carousel-slide');
            const dots = document.querySelectorAll<HTMLButtonElement>('.carousel-dots .dot');
            const totalSlides = slides.length;

            function showSlide(idx: number) {
                carouselIdx = ((idx % totalSlides) + totalSlides) % totalSlides;
                slides.forEach((s, i) => {
                    s.classList.toggle('active', i === carouselIdx);
                    s.classList.toggle('exit', i !== carouselIdx);
                });
                dots.forEach((d, i) => d.classList.toggle('active', i === carouselIdx));
            }

            document.getElementById('carousel-prev')?.addEventListener('click', () => showSlide(carouselIdx - 1));
            document.getElementById('carousel-next')?.addEventListener('click', () => showSlide(carouselIdx + 1));
            dots.forEach((d) => {
                d.addEventListener('click', () => showSlide(Number(d.dataset.dot)));
            });

            // Auto-advance every 8 seconds, pause on hover
            let autoPlay = setInterval(() => showSlide(carouselIdx + 1), 15000);
            const carouselEl = document.querySelector('.overview-carousel');
            carouselEl?.addEventListener('mouseenter', () => clearInterval(autoPlay));
            carouselEl?.addEventListener('mouseleave', () => {
                autoPlay = setInterval(() => showSlide(carouselIdx + 1), 15000);
            });

            // Map indicator
            const mapIndicator = document.getElementById('map-indicator') as HTMLSelectElement | null;
            if (mapIndicator) {
                mapIndicator.addEventListener('change', () => {
                    currentIndicator = mapIndicator.value as Indicator;
                    updateMap();
                });
            }

            // Global country filter
            const countryFilter = document.getElementById('country-filter') as HTMLSelectElement | null;
            if (countryFilter) {
                countryFilter.addEventListener('change', () => {
                    globalCountryFilter = countryFilter.value;

                    // Mimic map click behavior - same as handleClick()
                    if (globalCountryFilter) {
                        selectedCountry = globalCountryFilter;
                        updateCountryDetail(globalCountryFilter);

                        // Highlight selected country on all maps
                        highlightCountryOnMaps(globalCountryFilter);
                    } else {
                        // Clear selection when "All Countries" is selected
                        selectedCountry = null;
                        selectedMepsCountry = '';
                        clearCountryHighlights();
                        // Reset country detail panel
                        const mepsDetail = document.querySelector('#meps-country-detail .country-detail') as HTMLElement;
                        if (mepsDetail) {
                            mepsDetail.innerHTML = `<h4>Select a country</h4><p class="side-muted">Click on a country in the map to see details.</p>`;
                        }
                    }

                    // Refresh views with new filter
                    updateViewsForCountryFilter();
                    updateViewingBadges();
                });
            }

            // Enhanced Emissions filters
            // Data source toggle (CLASP / Subcool)
            document.querySelectorAll<HTMLButtonElement>('#emissions-source-toggles .toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('#emissions-source-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    emissionsDataSource = (btn.dataset.source as 'clasp' | 'subcool') || 'clasp';

                    // Update scenario dropdown based on data source
                    const scenarioSelect = document.getElementById('emissions-scenario-select') as HTMLSelectElement;
                    if (scenarioSelect) {
                        scenarioSelect.innerHTML = '';
                        const scenarios = emissionsDataSource === 'clasp' ? CLASP_SCENARIOS : HEAT_SCENARIOS;
                        const names = emissionsDataSource === 'clasp' ? CLASP_SCENARIO_NAMES : HEAT_SCENARIO_NAMES;
                        scenarios.forEach(s => {
                            const opt = document.createElement('option');
                            opt.value = s;
                            opt.textContent = names[s] || s;
                            scenarioSelect.appendChild(opt);
                        });
                        emissionsScenario = scenarios[0];
                    }

                    // Show/hide appliance row vs emission type row
                    const appRow = document.getElementById('emissions-appliance-row');
                    const typeRow = document.getElementById('emissions-type-row');
                    if (appRow) appRow.style.display = emissionsDataSource === 'clasp' ? 'flex' : 'none';
                    if (typeRow) typeRow.style.display = emissionsDataSource === 'subcool' ? 'flex' : 'none';

                    updateEmissionsView();
                    updateSidebarStats();
                });
            });

            // Year slider
            const emissionsYearSlider = document.getElementById('emissions-year-slider') as HTMLInputElement | null;
            if (emissionsYearSlider) {
                emissionsYearSlider.addEventListener('input', () => {
                    emissionsYear = Number(emissionsYearSlider.value);
                    const display = document.getElementById('emissions-year-display');
                    if (display) display.textContent = String(emissionsYear);
                    updateEmissionsView();
                    updateSidebarStats();
                });
            }

            // Scenario dropdown
            const emissionsScenarioSelect = document.getElementById('emissions-scenario-select') as HTMLSelectElement | null;
            if (emissionsScenarioSelect) {
                emissionsScenarioSelect.addEventListener('change', () => {
                    emissionsScenario = emissionsScenarioSelect.value;
                    updateEmissionsView();
                    updateSidebarStats();
                });
            }

            // Region dropdown
            const emissionsRegionSelect = document.getElementById('emissions-region-select') as HTMLSelectElement | null;
            if (emissionsRegionSelect) {
                emissionsRegionSelect.addEventListener('change', () => {
                    emissionsRegion = emissionsRegionSelect.value;
                    updateEmissionsView();
                });
            }

            // Appliance toggles (CLASP)
            document.querySelectorAll<HTMLButtonElement>('#emissions-appliance-toggles .toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const appliance = btn.dataset.appliance;
                    if (!appliance) return;
                    btn.classList.toggle('active');
                    if (btn.classList.contains('active')) {
                        if (!emissionsAppliances.includes(appliance)) emissionsAppliances.push(appliance);
                    } else {
                        emissionsAppliances = emissionsAppliances.filter(a => a !== appliance);
                    }
                    updateEmissionsView();
                });
            });

            // All/None buttons for appliances
            const emissionsAppAll = document.getElementById('emissions-app-all');
            if (emissionsAppAll) {
                emissionsAppAll.addEventListener('click', () => {
                    emissionsAppliances = [...CLASP_APPLIANCES];
                    document.querySelectorAll('#emissions-appliance-toggles .toggle-btn').forEach(b => b.classList.add('active'));
                    updateEmissionsView();
                });
            }
            const emissionsAppNone = document.getElementById('emissions-app-none');
            if (emissionsAppNone) {
                emissionsAppNone.addEventListener('click', () => {
                    emissionsAppliances = [];
                    document.querySelectorAll('#emissions-appliance-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
                    updateEmissionsView();
                });
            }

            // Emission type toggles (Subcool)
            document.querySelectorAll<HTMLButtonElement>('#emissions-type-toggles .toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('#emissions-type-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    emissionsType = (btn.dataset.type as 'total' | 'direct' | 'indirect') || 'total';
                    updateEmissionsView();
                });
            });

            // NDC Tracker filters
            const ndcTypeFilter = document.getElementById('ndc-type-filter') as HTMLSelectElement | null;
            if (ndcTypeFilter) {
                ndcTypeFilter.addEventListener('change', () => {
                    ndcType = ndcTypeFilter.value;
                    updateNDCMap();
                    updateNDCCharts();
                });
            }

            const ndcCategoryFilter = document.getElementById('ndc-category-filter') as HTMLSelectElement | null;
            if (ndcCategoryFilter) {
                ndcCategoryFilter.addEventListener('change', () => {
                    ndcCategory = ndcCategoryFilter.value;
                    updateNDCMap();
                    updateNDCCharts();
                });
            }

            // Policy Framework map tabs
            document.querySelectorAll<HTMLButtonElement>('.policy-map-tab').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.policy-map-tab').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const mapType = btn.dataset.map ?? 'gcp';
                    updatePolicyMap(mapType);

                    // Show/hide NDC filters based on active tab
                    const ndcFilters = document.getElementById('policy-ndc-filters');
                    if (ndcFilters) {
                        ndcFilters.classList.toggle('visible', mapType === 'ndc');
                    }

                    // Dynamically create and populate charts for the active tab
                    updatePolicyChartsForMapType(mapType);
                });
            });

            // Policy NDC filter handlers
            const policyNdcType = document.getElementById('policy-ndc-type') as HTMLSelectElement | null;
            if (policyNdcType) {
                policyNdcType.addEventListener('change', () => {
                    ndcType = policyNdcType.value;
                    updatePolicyMap('ndc');
                    updatePolicyChartsForMapType('ndc');
                });
            }

            const policyNdcCategory = document.getElementById('policy-ndc-category') as HTMLSelectElement | null;
            if (policyNdcCategory) {
                policyNdcCategory.addEventListener('change', () => {
                    ndcCategory = policyNdcCategory.value;
                    updatePolicyMap('ndc');
                    updatePolicyChartsForMapType('ndc');
                });
            }

            // Access & Vulnerability filters
            // Data source toggle (Historical vs Forecast)
            document.querySelectorAll<HTMLButtonElement>('#access-source-toggles .toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const source = btn.dataset.source as 'historical' | 'forecast';
                    if (!source) return;

                    // Update toggle state
                    document.querySelectorAll('#access-source-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    accessDataSource = source;

                    // Update year slider range based on data source
                    const slider = document.getElementById('access-year-slider') as HTMLInputElement;
                    const yearDisplay = document.getElementById('access-year-display');
                    if (slider && yearDisplay) {
                        if (source === 'forecast') {
                            slider.min = '2025';
                            slider.max = '2030';
                            slider.value = '2025';
                            accessYear = 2025;
                            yearDisplay.textContent = '2025';
                        } else {
                            slider.min = '2013';
                            slider.max = '2024';
                            slider.value = '2024';
                            accessYear = 2024;
                            yearDisplay.textContent = '2024';
                        }
                    }

                    updateAccessView();
                });
            });

            const accessYearSlider = document.getElementById('access-year-slider') as HTMLInputElement | null;
            if (accessYearSlider) {
                accessYearSlider.addEventListener('input', () => {
                    accessYear = Number(accessYearSlider.value);
                    const yearDisplay = document.getElementById('access-year-display');
                    if (yearDisplay) yearDisplay.textContent = String(accessYear);
                    updateAccessView();
                });
            }

            // Impact/Risk level toggles
            document.querySelectorAll<HTMLButtonElement>('#access-impact-toggles .toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const level = btn.dataset.impact;
                    if (!level) return;
                    btn.classList.toggle('active');
                    if (btn.classList.contains('active')) {
                        if (!accessImpactLevels.includes(level)) {
                            accessImpactLevels = [...accessImpactLevels, level];
                        }
                    } else {
                        accessImpactLevels = accessImpactLevels.filter(l => l !== level);
                    }
                    updateAccessView();
                });
            });

            // Population category toggles
            document.querySelectorAll<HTMLButtonElement>('#access-pop-toggles .toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const cat = btn.dataset.category;
                    if (!cat) return;
                    btn.classList.toggle('active');
                    if (btn.classList.contains('active')) {
                        if (!accessPopCategories.includes(cat)) {
                            accessPopCategories = [...accessPopCategories, cat];
                        }
                    } else {
                        accessPopCategories = accessPopCategories.filter(c => c !== cat);
                    }
                    updateAccessView();
                });
            });

            // Population All/None buttons
            const accessPopAll = document.getElementById('access-pop-all');
            if (accessPopAll) {
                accessPopAll.addEventListener('click', () => {
                    accessPopCategories = [...POPULATION_CATEGORIES];
                    document.querySelectorAll<HTMLButtonElement>('#access-pop-toggles .toggle-btn').forEach(btn => {
                        btn.classList.add('active');
                    });
                    updateAccessView();
                });
            }

            const accessPopNone = document.getElementById('access-pop-none');
            if (accessPopNone) {
                accessPopNone.addEventListener('click', () => {
                    accessPopCategories = [];
                    document.querySelectorAll<HTMLButtonElement>('#access-pop-toggles .toggle-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    updateAccessView();
                });
            }

            // Access region filter
            const accessRegionFilterEl = document.getElementById('access-region-filter') as HTMLSelectElement | null;
            if (accessRegionFilterEl) {
                accessRegionFilterEl.addEventListener('change', () => {
                    accessRegionFilter = accessRegionFilterEl.value;
                    updateAccessView();
                });
            }

            // MEPS (Product Efficiency) filters
            const mepsRegionFilterEl = document.getElementById('meps-region-filter') as HTMLSelectElement | null;
            if (mepsRegionFilterEl) {
                mepsRegionFilterEl.addEventListener('change', () => {
                    mepsRegionFilter = mepsRegionFilterEl.value;
                    updateMepsView();
                });
            }

            // Equipment type All/None buttons (toggle handlers are set up in initMepsFilters)
            const mepsEquipAll = document.getElementById('meps-equip-all');
            if (mepsEquipAll) {
                mepsEquipAll.addEventListener('click', () => {
                    mepsEquipmentTypes = ['Air Conditioning', 'Domestic Refrigeration', 'Fans'];
                    document.querySelectorAll<HTMLButtonElement>('#meps-equipment-toggles .toggle-btn').forEach(btn => {
                        btn.classList.add('active');
                    });
                    updateMepsView();
                });
            }

            const mepsEquipNone = document.getElementById('meps-equip-none');
            if (mepsEquipNone) {
                mepsEquipNone.addEventListener('click', () => {
                    mepsEquipmentTypes = [];
                    document.querySelectorAll<HTMLButtonElement>('#meps-equipment-toggles .toggle-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    updateMepsView();
                });
            }

            // Kigali (Refrigerant Transition) filters
            const kigaliRegionFilterEl = document.getElementById('kigali-region-filter') as HTMLSelectElement | null;
            if (kigaliRegionFilterEl) {
                kigaliRegionFilterEl.addEventListener('change', () => {
                    kigaliRegionFilter = kigaliRegionFilterEl.value;
                    updateKigaliView();
                });
            }

            // Kigali group type All/None buttons (toggle handlers are set up in initKigaliFilters)
            const kigaliGroupAll = document.getElementById('kigali-group-all');
            if (kigaliGroupAll) {
                kigaliGroupAll.addEventListener('click', () => {
                    const allGroups = [...new Set(data.kigali.map(k => k.group_type).filter(Boolean))] as string[];
                    kigaliGroupTypes = allGroups;
                    document.querySelectorAll<HTMLButtonElement>('#kigali-group-toggles .toggle-btn').forEach(btn => {
                        btn.classList.add('active');
                    });
                    updateKigaliView();
                });
            }

            const kigaliGroupNone = document.getElementById('kigali-group-none');
            if (kigaliGroupNone) {
                kigaliGroupNone.addEventListener('click', () => {
                    kigaliGroupTypes = [];
                    document.querySelectorAll<HTMLButtonElement>('#kigali-group-toggles .toggle-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    updateKigaliView();
                });
            }
        }

        // =====================================================
        // INITIALIZATION
        // =====================================================
        async function init() {
            try {
                setStatus('Loading data from Supabase...');
                data = await loadDashboardData(SUPABASE_URL, SUPABASE_KEY);
                console.log('NDC Tracker data loaded:', data.ndcTracker.length, 'records');
                console.log('Sample NDC record:', data.ndcTracker[0]);
                console.log('Access data loaded:', data.access.length, 'records');
                console.log('Sample Access record:', data.access[0]);
                setStatus(`Loaded ${data.countries.length} countries, ${data.access.length} access records`, 'success');
                setText('last-updated', `Updated: ${new Date().toLocaleDateString()}`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                setStatus(`Error: ${message}`, 'error');
                console.error(error);
                return;
            }

            const container = document.querySelector<HTMLElement>('.main-container');
            if (container) {
                container.classList.toggle('overview-only', currentView === 'overview');
            }
            updateKPIs();
            updateViewingBadges();
            populateCountryFilter();
            await initMap();
            await initMepsMap();
            await initKigaliMap();
            await initAccessMap();

            // Initialize Access & Vulnerability
            populateAccessRegionFilter();
            updateAccessCharts();
            updateAccessKPIs();

            // Initialize Product Efficiency (MEPS)
            initMepsFilters();
            updateMepsView();

            // Initialize Refrigerant Transition (Kigali)
            initKigaliFilters();
            updateKigaliView();

            initCharts();

            // Initialize emissions (enhanced)
            populateEmissionsRegionFilter();
            await initEmissionsMap();
            updateEmissionsView();

            // Initialize NDC Tracker
            await initNDCMap();
            populatePolicyNDCFilters();
            initNDCCharts();
            updateNDCKPIs();

            setupEventHandlers();
            setApplianceScope('ac');
            updateSidePanels('overview');
            requestAnimationFrame(resizeCharts);
            window.addEventListener('resize', resizeCharts);
            console.log('Dashboard initialization complete!');
        }

        init().catch(err => console.error('Init error:', err));

  });
</script>

<svelte:head>
  <title>CoolProgress: Global Cooling Dashboard</title>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  />
</svelte:head>

<div class="dashboard-body">
  <div id="status">Loading dashboard data...</div>

  <div class="main-container">
    <!-- Left Sidebar -->
    <aside class="sidebar-left">
      <div class="sidebar-logo">
        <div class="logo-mark">
          <i class="fa-solid fa-snowflake"></i>
        </div>
        <div class="logo-text">COOL<span>PROGRESS</span></div>
      </div>

      <div class="sidebar-filters">
        <label class="filter-label" for="country-filter">Country Selected</label>
        <select id="country-filter" class="filter-select">
          <option value="">All Countries</option>
        </select>

        <label class="filter-label scope-label">Appliance Scope</label>
        <div class="scope-toggle">
          <button class="scope-btn active" data-scope="ac" type="button">ACs</button>
          <button class="scope-btn" data-scope="fridge" type="button">Fridges</button>
          <button class="scope-btn" data-scope="fan" type="button">Fans</button>
        </div>
      </div>

      <div class="nav-section">
        <h3>Navigation Pillars</h3>
        <button class="nav-btn nav-item active" data-view="overview" type="button">
          <span class="nav-icon"><i class="fa-solid fa-house"></i></span>
          <span>Strategic Summary</span>
        </button>
        <button class="nav-btn nav-item" data-view="emissions" type="button">
          <span class="nav-icon"><i class="fa-solid fa-smog"></i></span>
          <span>1. Emissions</span>
        </button>
        <button class="nav-btn nav-item" data-view="meps" type="button">
          <span class="nav-icon"><i class="fa-solid fa-bolt"></i></span>
          <span>2. Product Efficiency</span>
        </button>
        <button class="nav-btn nav-item" data-view="kigali" type="button">
          <span class="nav-icon"><i class="fa-solid fa-flask"></i></span>
          <span>3. Refrigerant Transition</span>
        </button>
        <button class="nav-btn nav-item" data-view="access" type="button">
          <span class="nav-icon"><i class="fa-solid fa-people-roof"></i></span>
          <span>4. Access &amp; Vulnerability</span>
        </button>
        <button class="nav-btn nav-item" data-view="policy" type="button">
          <span class="nav-icon"><i class="fa-solid fa-scale-balanced"></i></span>
          <span>5. Policy Framework</span>
        </button>
      </div>

    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="main-header">
        <div>
          <h1 id="page-headline">Why Cooling Matters</h1>
          <p id="page-subhead">The Transition is Urgent. The Opportunity is Now.</p>
        </div>
        <div class="header-actions">
          <div id="last-updated">Loading...</div>
          <button class="pillar-info-btn" type="button" id="pillar-info-btn">
            <i class="fa-solid fa-circle-info"></i>
            Pillar Information
          </button>
        </div>
      </header>
            <!-- Overview View -->
            <section id="view-overview" class="view-section active">
                <!-- Compact Hero Banner -->
                <div class="overview-hero compact">
                    <div class="overview-hero-content">
                        <h2>The Global Cooling Challenges</h2>
                        <p>One of the most significant yet overlooked drivers of climate change. The time to act is now.</p>
                    </div>
                </div>

                <!-- Horizontal KPIs -->
                <div class="overview-kpis-row">
                    <div class="kpi-tile kpi-ghg">
                        <p class="kpi-title">GHG Emissions</p>
                        <div class="kpi-value" id="kpi-climate">&gt;10%</div>
                        <p class="kpi-subtitle">of Global GHG</p>
                        <p class="kpi-note">Direct + indirect (MtCO<sub>2</sub>e)</p>
                    </div>
                    <div class="kpi-tile kpi-demand">
                        <p class="kpi-title">Cooling Demand</p>
                        <div class="kpi-value highlight-blue" id="kpi-capacity">3x</div>
                        <p class="kpi-subtitle">Increase by 2050</p>
                        <p class="kpi-note">Energy demand (TWh)</p>
                    </div>
                    <div class="kpi-tile kpi-vulnerable">
                        <p class="kpi-title">At-Risk Population</p>
                        <div class="kpi-value highlight-red" id="kpi-access">1.2B</div>
                        <p class="kpi-subtitle">People Vulnerable</p>
                        <p class="kpi-note">Without access to cooling</p>
                    </div>
                </div>

                <!-- Carousel -->
                <div class="overview-carousel">
                    <button class="carousel-arrow carousel-prev" type="button" id="carousel-prev">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>

                    <div class="carousel-viewport">
                        <!-- Slide 1: The Challenge -->
                        <div class="carousel-slide active" data-slide="0">
                            <div class="slide-inner challenge-slide">
                                <div class="slide-icon-col">
                                    <div class="slide-icon challenge-icon">
                                        <i class="fa-solid fa-triangle-exclamation"></i>
                                    </div>
                                    <div class="slide-label">1 / 4</div>
                                </div>
                                <div class="slide-body">
                                    <h3>The Challenge</h3>
                                    <p>Cooling currently accounts for over <strong>10% of global greenhouse gas emissions</strong>, a figure expected to <strong>double by 2050</strong> as heatwaves become more frequent and populations grow. Indirect emissions from energy consumption and direct emissions from high-GWP refrigerant leaks fuel a vicious cycle that leaves <strong>1.2 billion people</strong> vulnerable to life-threatening heat.</p>
                                    <p style="margin-top:0.5rem;">According to the <a href="https://wedocs.unep.org/items/507e8c47-db6c-424a-9b76-7805a6e1d669" target="_blank" rel="noopener noreferrer" style="color:#2563eb;font-weight:700;text-decoration:underline;"><strong>Global Cooling Watch 2025 report</strong></a> (COP30), cooling demand is expected to <strong>triple by mid-century</strong>.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Slide 2: Emissions Crisis -->
                        <div class="carousel-slide" data-slide="1">
                            <div class="slide-inner emissions-slide">
                                <div class="slide-icon-col">
                                    <div class="slide-icon emissions-icon">
                                        <i class="fa-solid fa-smog"></i>
                                    </div>
                                    <div class="slide-label">2 / 4</div>
                                </div>
                                <div class="slide-body">
                                    <h3>Emissions Crisis</h3>
                                    <p>Currently responsible for <strong>10% of global power demand</strong>, cooling emissions are accelerating on two fronts: <strong>indirect emissions</strong> from inefficient appliances and <strong>direct emissions</strong> from "super-pollutant" refrigerants with global warming potentials thousands of times greater than CO<sub>2</sub>.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Slide 3: Vulnerability Gap -->
                        <div class="carousel-slide" data-slide="2">
                            <div class="slide-inner vulnerability-slide">
                                <div class="slide-icon-col">
                                    <div class="slide-icon vulnerability-icon">
                                        <i class="fa-solid fa-heart-pulse"></i>
                                    </div>
                                    <div class="slide-label">3 / 4</div>
                                </div>
                                <div class="slide-body">
                                    <h3>Vulnerability Gap</h3>
                                    <p>Rising temperatures are driving a surge in heat-related deaths, yet access to cooling remains a luxury of the few. In the world's most heat-stressed regions, over <strong>1.2 billion people</strong> live without the basic cooling infrastructure needed to survive intensifying heatwaves.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Slide 4: The Path Forward -->
                        <div class="carousel-slide" data-slide="3">
                            <div class="slide-inner solution-slide">
                                <div class="slide-icon-col">
                                    <div class="slide-icon solution-icon">
                                        <i class="fa-solid fa-lightbulb"></i>
                                    </div>
                                    <div class="slide-label">4 / 4</div>
                                </div>
                                <div class="slide-body">
                                    <h3>The Path Forward</h3>
                                    <p>A comprehensive transition could cut cooling emissions by up to <strong>80%</strong> through three pillars:</p>
                                    <div class="slide-pillars">
                                        <div class="slide-pillar tech">
                                            <div class="pillar-col-icon"><i class="fa-solid fa-microchip"></i></div>
                                            <div class="pillar-col-title">Technology</div>
                                            <div class="pillar-col-desc">Super-efficient appliances and low-GWP refrigerants</div>
                                        </div>
                                        <div class="slide-pillar equity">
                                            <div class="pillar-col-icon"><i class="fa-solid fa-hand-holding-heart"></i></div>
                                            <div class="pillar-col-title">Equity</div>
                                            <div class="pillar-col-desc">Universal cooling access for vulnerable populations</div>
                                        </div>
                                        <div class="slide-pillar governance">
                                            <div class="pillar-col-icon"><i class="fa-solid fa-landmark"></i></div>
                                            <div class="pillar-col-title">Governance</div>
                                            <div class="pillar-col-desc">NCAPs and NDC commitments turned into enforceable law</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button class="carousel-arrow carousel-next" type="button" id="carousel-next">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>

                    <!-- Dots -->
                    <div class="carousel-dots" id="carousel-dots">
                        <button class="dot active" data-dot="0" type="button"></button>
                        <button class="dot" data-dot="1" type="button"></button>
                        <button class="dot" data-dot="2" type="button"></button>
                        <button class="dot" data-dot="3" type="button"></button>
                    </div>
                </div>

                <!-- CTA -->
                <div class="overview-cta compact-cta">
                    <div class="cta-content">
                        <h2>Explore the Pillars of Transition</h2>
                        <p>Track global progress on emissions, efficiency, refrigerants, access, and policy frameworks.</p>
                        <div class="cta-pointer">
                            <i class="fa-solid fa-arrow-left"></i>
                            <span>Use the navigation pane to explore each section</span>
                        </div>
                    </div>
                </div>

                <!-- Partner Logos -->
                <div class="overview-partners">
                    <span class="partners-label">Using data from</span>
                    <div class="partners-logos">
                        <img src="/images/clasp-logo.png" alt="CLASP" class="partner-logo" />
                        <img src="/images/unep.png" alt="UNEP" class="partner-logo" />
                        <img src="/images/giz-logo.jpg" alt="GIZ" class="partner-logo" />
                        <img src="/images/seforall-logo.jpg" alt="SEforALL" class="partner-logo" />
                        <img src="/images/climate-policy-radar-logo.jfif" alt="Climate Policy Radar" class="partner-logo" />
                        <img src="/images/heat-logo.png" alt="HEAT" class="partner-logo" />
                    </div>
                </div>
            </section>

            <!-- MEPS View -->
            <section id="view-meps" class="view-section">
                <div class="pillar-stack">
                    <!-- Info Panel -->
                    <div class="card-panel" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; padding: 1rem 1.25rem;">
                        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                            <i class="fa-solid fa-circle-info" style="color: #2563eb; font-size: 1.1rem; margin-top: 2px;"></i>
                            <div>
                                <div style="font-weight: 600; color: #1e40af; margin-bottom: 0.25rem;">About This Data</div>
                                <div style="font-size: 0.85rem; color: #1e3a8a; line-height: 1.5;">
                                    <strong>Minimum Energy Performance Standards (MEPS) &amp; Labels</strong> set efficiency requirements for cooling appliances.
                                    This data tracks MEPS and labeling policy adoption across countries for Air Conditioners, Domestic Refrigerators, and Fans.
                                    <em>Source: CLASP Global Policy &amp; Regulatory Compliance Platform (cprc-clasp.ngo)</em>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- KPI Cards -->
                    <div class="kpi-grid policy-kpis">
                        <div class="kpi-card blue">
                            <div class="kpi-value" id="meps-kpi-countries">-</div>
                            <div class="kpi-label">Countries</div>
                            <div class="kpi-sublabel">With MEPS or Labels</div>
                        </div>
                        <div class="kpi-card green">
                            <div class="kpi-value" id="meps-kpi-policies">-</div>
                            <div class="kpi-label">Total Policies</div>
                            <div class="kpi-sublabel">MEPS &amp; Labels tracked</div>
                        </div>
                        <div class="kpi-card" style="border-left: 4px solid #2563eb;">
                            <div class="kpi-value" id="meps-kpi-equipment" style="color:#2563eb">-</div>
                            <div class="kpi-label">MEPS</div>
                            <div class="kpi-sublabel">Performance standards</div>
                        </div>
                        <div class="kpi-card" style="border-left: 4px solid #f59e0b;">
                            <div class="kpi-value" id="meps-kpi-regions" style="color:#f59e0b">-</div>
                            <div class="kpi-label">Labels</div>
                            <div class="kpi-sublabel">Energy labels</div>
                        </div>
                    </div>

                    <!-- Filter Panel -->
                    <div class="card-panel filter-panel" style="padding: 1rem 1.25rem;">
                        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-end;">
                            <!-- Region Filter -->
                            <div class="filter-group" style="flex: 1; min-width: 180px;">
                                <label class="filter-label">Region</label>
                                <select id="meps-region-filter" class="filter-select">
                                    <option value="">All Regions</option>
                                </select>
                            </div>

                            <!-- Requirement Type Toggles -->
                            <div class="filter-group" style="flex: 2; min-width: 300px;">
                                <label class="filter-label">Equipment Type
                                    <button id="meps-equip-all" class="mini-btn" type="button">All</button>
                                    <button id="meps-equip-none" class="mini-btn" type="button">None</button>
                                </label>
                                <div class="toggle-group" id="meps-equipment-toggles">
                                    <!-- Will be populated dynamically -->
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Map and Country Detail -->
                    <div class="card-panel map-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-bolt"></i>
                                MEPS &amp; Labels Coverage
                            </div>
                            <span class="viewing-pill">Viewing: <strong id="meps-viewing">Global</strong></span>
                        </div>
                        <div id="meps-map-container" class="map-surface"></div>
                        <div class="legend legend-row">
                            <span class="legend-label">Policy Status:</span>
                            <div id="meps-legend" class="legend-items"></div>
                        </div>
                        <div class="progress-bar" id="meps-progress">
                            <span class="progress-segment" id="meps-progress-both" title="MEPS & Labels" style="background:#166534"></span>
                            <span class="progress-segment" id="meps-progress-meps" title="MEPS Only" style="background:#2563eb"></span>
                            <span class="progress-segment" id="meps-progress-labels" title="Labels Only" style="background:#f59e0b"></span>
                            <span class="progress-segment" id="meps-progress-critical" title="No Policies" style="background:#ef4444"></span>
                        </div>
                        <div id="meps-country-detail" class="country-card-inline">
                            <h3>Selected Country</h3>
                            <div class="country-detail">
                                <h4>Select a country</h4>
                                <p class="side-muted">Click on a country in the map to see MEPS details.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
                        <div class="card-panel">
                            <h3 id="meps-chart1-title">MEPS & Labels by Region</h3>
                            <p class="chart-subtitle" id="meps-chart1-subtitle">Countries with MEPS vs Labels per region</p>
                            <div id="chart-meps-by-region" class="chart-surface" style="height: 280px;"></div>
                        </div>
                        <div class="card-panel">
                            <h3 id="meps-chart2-title">Policy Adoption Timeline</h3>
                            <p class="chart-subtitle" id="meps-chart2-subtitle">Cumulative MEPS & Labels adoption over time</p>
                            <div id="chart-meps-timeline" class="chart-surface" style="height: 280px;"></div>
                        </div>
                    </div>

                    <div class="card-panel">
                        <h3 id="meps-chart3-title">Equipment Type Coverage</h3>
                        <p class="chart-subtitle" id="meps-chart3-subtitle">Countries with MEPS vs Labels by appliance</p>
                        <div id="chart-meps-equipment" class="chart-surface" style="height: 320px;"></div>
                    </div>
                </div>
            </section>

            <!-- Kigali View -->
            <section id="view-kigali" class="view-section">
                <div class="pillar-stack">
                    <!-- Info Panel -->
                    <div class="card-panel" style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-left: 4px solid #22c55e; padding: 1rem 1.25rem;">
                        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                            <i class="fa-solid fa-circle-info" style="color: #16a34a; font-size: 1.1rem; margin-top: 2px;"></i>
                            <div>
                                <div style="font-weight: 600; color: #166534; margin-bottom: 0.25rem;">About This Data</div>
                                <div style="font-size: 0.85rem; color: #14532d; line-height: 1.5;">
                                    The <strong>Kigali Amendment</strong> to the Montreal Protocol targets the phase-down of hydrofluorocarbons (HFCs) used in cooling.
                                    Countries are grouped into <strong>Article 5</strong> (developing) and <strong>Non-Article 5</strong> (developed) parties with different phase-down schedules.
                                    Data tracks ratification status and refrigerant transition progress.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- KPI Cards -->
                    <div class="kpi-grid policy-kpis">
                        <div class="kpi-card green">
                            <div class="kpi-value" id="kigali-kpi-parties">-</div>
                            <div class="kpi-label">Kigali Parties</div>
                            <div class="kpi-sublabel">Ratified the amendment</div>
                        </div>
                        <div class="kpi-card blue">
                            <div class="kpi-value" id="kigali-kpi-montreal">-</div>
                            <div class="kpi-label">Montreal Protocol</div>
                            <div class="kpi-sublabel">Protocol parties</div>
                        </div>
                        <div class="kpi-card amber">
                            <div class="kpi-value" id="kigali-kpi-article5">-</div>
                            <div class="kpi-label">Article 5 Countries</div>
                            <div class="kpi-sublabel">Developing nations</div>
                        </div>
                        <div class="kpi-card teal">
                            <div class="kpi-value" id="kigali-kpi-non-article5">-</div>
                            <div class="kpi-label">Non-Article 5</div>
                            <div class="kpi-sublabel">Developed nations</div>
                        </div>
                    </div>

                    <!-- Filter Panel -->
                    <div class="card-panel filter-panel" style="padding: 1rem 1.25rem;">
                        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-end;">
                            <!-- Region Filter -->
                            <div class="filter-group" style="flex: 1; min-width: 180px;">
                                <label class="filter-label">Region</label>
                                <select id="kigali-region-filter" class="filter-select">
                                    <option value="">All Regions</option>
                                </select>
                            </div>

                            <!-- Group Type Toggles -->
                            <div class="filter-group" style="flex: 2; min-width: 300px;">
                                <label class="filter-label">Group Type
                                    <button id="kigali-group-all" class="mini-btn" type="button">All</button>
                                    <button id="kigali-group-none" class="mini-btn" type="button">None</button>
                                </label>
                                <div class="toggle-group" id="kigali-group-toggles">
                                    <!-- Will be populated dynamically -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Map and Country Detail -->
                    <div class="card-panel map-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-flask"></i>
                                Kigali Amendment Ratification Status
                            </div>
                            <span class="viewing-pill">Viewing: <strong id="kigali-viewing">Global</strong></span>
                        </div>
                        <div id="kigali-map-container" class="map-surface"></div>
                        <div class="legend legend-row">
                            <span class="legend-label">Status:</span>
                            <div id="kigali-legend" class="legend-items"></div>
                        </div>
                        <div class="progress-bar" id="kigali-progress">
                            <span class="progress-segment high" id="kigali-progress-high" title="Kigali Party"></span>
                            <span class="progress-segment medium" id="kigali-progress-medium" title="Article 5"></span>
                            <span class="progress-segment low" id="kigali-progress-low" title="Montreal Only"></span>
                            <span class="progress-segment critical" id="kigali-progress-critical" title="Non-Party"></span>
                        </div>
                        <div id="kigali-country-detail" class="country-card-inline">
                            <h3>Selected Country</h3>
                            <div class="country-detail">
                                <h4>Select a country</h4>
                                <p class="side-muted">Click on a country in the map to see Kigali details.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
                        <div class="card-panel">
                            <h3>Kigali Status by Region</h3>
                            <p class="chart-subtitle">Party vs Non-Party breakdown</p>
                            <div id="chart-kigali-region" class="chart-surface" style="height: 280px;"></div>
                        </div>
                        <div class="card-panel">
                            <h3>Group Type Distribution</h3>
                            <p class="chart-subtitle">Article 5 and Non-Article 5 countries</p>
                            <div id="chart-kigali-groups" class="chart-surface" style="height: 280px;"></div>
                        </div>
                    </div>

                    <!-- Refrigerant GWP Chart -->
                    <div class="card-panel">
                        <h3>Refrigerant Global Warming Potential (GWP)</h3>
                        <p class="chart-subtitle">100-year GWP values by refrigerant type (AR6)</p>
                        <div id="chart-refrigerant-gwp" class="chart-surface" style="height: 350px;"></div>
                        <div style="display: flex; gap: 1.5rem; margin-top: 0.75rem; flex-wrap: wrap; justify-content: center;">
                            <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;">
                                <span style="width: 12px; height: 12px; background: #ef4444; border-radius: 2px;"></span>
                                HFC (High GWP)
                            </span>
                            <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;">
                                <span style="width: 12px; height: 12px; background: #f59e0b; border-radius: 2px;"></span>
                                HCFC (Medium GWP)
                            </span>
                            <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;">
                                <span style="width: 12px; height: 12px; background: #3b82f6; border-radius: 2px;"></span>
                                HFO (Low GWP)
                            </span>
                            <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;">
                                <span style="width: 12px; height: 12px; background: #22c55e; border-radius: 2px;"></span>
                                Natural (Low GWP)
                            </span>
                        </div>
                    </div>

                    <div class="card-panel">
                        <h3>Market Share: Refrigerant Transition (2020-2050)</h3>
                        <p class="chart-subtitle">AC • Global</p>
                        <div class="chart-container" style="height: 320px;">
                            <div id="chart-kigali-transition" class="chart-surface"></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Access View -->
            <section id="view-access" class="view-section">
                <div class="pillar-stack">
                    <!-- Info Panel -->
                    <div class="card-panel" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 1rem 1.25rem;">
                        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                            <i class="fa-solid fa-circle-info" style="color: #d97706; font-size: 1.1rem; margin-top: 2px;"></i>
                            <div>
                                <div style="font-weight: 600; color: #92400e; margin-bottom: 0.25rem;">About This Data</div>
                                <div style="font-size: 0.85rem; color: #78350f; line-height: 1.5;">
                                    This analysis tracks cooling access gaps across <strong>77 countries</strong> in the Global South.
                                    "At risk" populations lack adequate cooling for <strong>thermal comfort</strong>, <strong>food preservation</strong>, and <strong>medical storage</strong>.
                                    Risk levels are based on income, infrastructure access, and climate vulnerability.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- KPI Cards -->
                    <div class="kpi-grid policy-kpis">
                        <div class="kpi-card red">
                            <div class="kpi-value" id="access-kpi-total">-</div>
                            <div class="kpi-label">People at Risk</div>
                            <div class="kpi-sublabel">Without adequate cooling access</div>
                        </div>
                        <div class="kpi-card amber">
                            <div class="kpi-value" id="access-kpi-high-impact">-</div>
                            <div class="kpi-label">High-Risk Countries</div>
                            <div class="kpi-sublabel">Facing severe cooling gaps</div>
                        </div>
                        <div class="kpi-card blue">
                            <div class="kpi-value" id="access-kpi-countries">-</div>
                            <div class="kpi-label">Countries Analyzed</div>
                            <div class="kpi-sublabel">In current selection</div>
                        </div>
                        <div class="kpi-card green">
                            <div class="kpi-value" id="access-kpi-regions">-</div>
                            <div class="kpi-label">Regions Covered</div>
                            <div class="kpi-sublabel">Geographic scope</div>
                        </div>
                    </div>

                    <!-- Filter Controls -->
                    <div class="card-panel" id="access-filters-panel">
                        <div class="filter-row" style="gap: 1.5rem; flex-wrap: wrap; align-items: flex-end;">
                            <!-- Data Source Toggle -->
                            <div class="filter-group" style="flex: 1; min-width: 200px;">
                                <label class="filter-label">Data Source</label>
                                <div class="toggle-group" id="access-source-toggles">
                                    <button class="toggle-btn active" data-source="historical" type="button" title="SEforALL data (2013-2024)">Historical</button>
                                    <button class="toggle-btn" data-source="forecast" type="button" title="Forecast data (2025-2030)">Forecast</button>
                                </div>
                            </div>

                            <!-- Year Slider -->
                            <div class="filter-group" style="flex: 2; min-width: 200px;">
                                <label class="filter-label">Data Year</label>
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <input type="range" id="access-year-slider" min="2013" max="2024" value="2024" style="flex: 1;" />
                                    <span id="access-year-display" style="font-weight: 700; color: #1e3a5f; min-width: 45px;">2024</span>
                                </div>
                            </div>

                            <!-- Risk Level Toggle -->
                            <div class="filter-group" style="flex: 1; min-width: 180px;">
                                <label class="filter-label">Risk Level</label>
                                <div class="toggle-group" id="access-impact-toggles">
                                    <button class="toggle-btn active" data-impact="High" type="button" title="1+ billion lacking crucial cooling">High</button>
                                    <button class="toggle-btn active" data-impact="Medium" type="button" title="Limited sustainable options">Medium</button>
                                    <button class="toggle-btn active" data-impact="Low" type="button" title="Better access to cooling">Low</button>
                                </div>
                            </div>

                            <!-- Income Group Toggle -->
                            <div class="filter-group" style="flex: 2; min-width: 280px;">
                                <label class="filter-label">
                                    Income Group
                                    <span style="margin-left: 0.5rem;">
                                        <button class="mini-btn" id="access-pop-all" type="button">All</button>
                                        <button class="mini-btn" id="access-pop-none" type="button">None</button>
                                    </span>
                                </label>
                                <div class="toggle-group" id="access-pop-toggles">
                                    <button class="toggle-btn active" data-category="Rural Poor" type="button" title="309M at high risk globally">Rural Poor</button>
                                    <button class="toggle-btn active" data-category="Urban Poor" type="button" title="695M at high risk globally">Urban Poor</button>
                                    <button class="toggle-btn active" data-category="Lower-Middle Income" type="button" title="Limited affordable options">Lower-Middle</button>
                                    <button class="toggle-btn active" data-category="Middle-Income" type="button" title="Better access to solutions">Middle</button>
                                </div>
                            </div>

                            <!-- Region Dropdown -->
                            <div class="filter-group" style="flex: 1; min-width: 150px;">
                                <label class="filter-label" for="access-region-filter">Region</label>
                                <select id="access-region-filter" class="filter-select">
                                    <option value="">All Regions</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Map Card -->
                    <div class="card-panel map-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-earth-americas"></i>
                                Cooling Access Gap by Country
                            </div>
                            <span class="viewing-pill">Viewing: <strong id="access-viewing">Global</strong></span>
                        </div>
                        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; padding: 0 0.5rem;">
                            Population lacking sustainable cooling access (millions). Click a country for details.
                        </div>
                        <div id="access-map-container" class="map-surface"></div>
                        <div class="legend legend-row">
                            <span class="legend-label">Population at Risk:</span>
                            <div id="access-legend" class="legend-items"></div>
                        </div>
                        <div class="progress-bar access-progress">
                            <span class="progress-segment access-low" id="access-progress-low"></span>
                            <span class="progress-segment access-medium" id="access-progress-medium"></span>
                            <span class="progress-segment access-high" id="access-progress-high"></span>
                            <span class="progress-segment access-critical" id="access-progress-critical"></span>
                        </div>
                        <div class="country-card-inline" id="access-country-detail">
                            <h3>Selected Country</h3>
                            <div class="country-detail">
                                <h4>Select a country</h4>
                                <p class="side-muted">Click on a country to see detailed breakdown.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Dynamic Charts Container -->
                    <div id="access-charts-container"></div>
                </div>
            </section>

            <!-- Policy Framework View - NDC Tracker, GCP, NCAP -->
            <section id="view-policy" class="view-section">
                <div class="pillar-stack">
                    <!-- KPI Cards -->
                    <div class="kpi-grid policy-kpis">
                        <div class="kpi-card green">
                            <div class="kpi-value" id="policy-kpi-gcp">-</div>
                            <div class="kpi-label">GCP Signatories</div>
                            <div class="kpi-sublabel">Global Cooling Pledge</div>
                        </div>
                        <div class="kpi-card blue">
                            <div class="kpi-value" id="policy-kpi-ndc">-</div>
                            <div class="kpi-label">NDC 3.0 Submitted</div>
                            <div class="kpi-sublabel">Countries with new NDCs</div>
                        </div>
                        <div class="kpi-card amber">
                            <div class="kpi-value" id="policy-kpi-cooling">-</div>
                            <div class="kpi-label">Cooling Mentioned</div>
                            <div class="kpi-sublabel">In NDCs (Energy Efficiency)</div>
                        </div>
                        <div class="kpi-card purple">
                            <div class="kpi-value" id="policy-kpi-NCAP">-</div>
                            <div class="kpi-label">NCAPs Developed</div>
                            <div class="kpi-sublabel">National Cooling Action Plans</div>
                        </div>
                    </div>

                    <!-- Map Card -->
                    <div class="card-panel map-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-scale-balanced"></i>
                                Policy Framework Status by Country
                            </div>
                            <span class="viewing-pill">Viewing: <strong id="policy-viewing">Global</strong></span>
                        </div>
                        <div class="policy-tabs">
                            <button class="tab-btn policy-map-tab active" data-map="gcp" type="button">Global Cooling Pledge</button>
                            <button class="tab-btn policy-map-tab" data-map="ndc" type="button">NDC Cooling Mentions</button>
                            <button class="tab-btn policy-map-tab" data-map="NCAP" type="button">NCAP</button>
                        </div>
                        <!-- NDC Filters (shown when NDC tab is active) -->
                        <div class="policy-filters" id="policy-ndc-filters">
                            <div class="filter-row">
                                <div class="filter-group">
                                    <label for="policy-ndc-type">NDC Version</label>
                                    <select id="policy-ndc-type" class="filter-select">
                                        <!-- Options populated dynamically -->
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label for="policy-ndc-category">Category</label>
                                    <select id="policy-ndc-category" class="filter-select">
                                        <!-- Options populated dynamically -->
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div id="ndc-map-container" class="map-surface"></div>
                        <div class="legend legend-row">
                            <span class="legend-label">Status:</span>
                            <div id="ndc-legend" class="legend-items"></div>
                        </div>
                        <div class="progress-bar ndc-progress">
                            <span class="progress-segment ndc-mentioned" id="ndc-progress-mentioned"></span>
                            <span class="progress-segment ndc-not" id="ndc-progress-not"></span>
                            <span class="progress-segment ndc-no-ndc" id="ndc-progress-no-ndc"></span>
                            <span class="progress-segment ndc-no-data" id="ndc-progress-no-data"></span>
                        </div>
                        <div class="country-card-inline" id="policy-country-detail">
                            <h3>Selected Country</h3>
                            <div class="country-detail">
                                <h4>Select a country</h4>
                                <p class="side-muted">Click on a country in the map to see policy details.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Dynamic Charts Container - charts are injected here based on active tab -->
                    <div id="policy-charts-container"></div>
                </div>
            </section>

            <!-- Emissions View (Enhanced) -->
            <section id="view-emissions" class="view-section">
                <div class="pillar-stack">
                    <!-- Info Panel -->
                    <div class="card-panel" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; padding: 1rem 1.25rem;">
                        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                            <i class="fa-solid fa-circle-info" style="color: #2563eb; font-size: 1.1rem; margin-top: 2px;"></i>
                            <div>
                                <div style="font-weight: 600; color: #1e40af; margin-bottom: 0.25rem;">About This Data</div>
                                <div style="font-size: 0.85rem; color: #1e3a8a; line-height: 1.5;">
                                    <strong>CLASP Data:</strong> Indirect emissions only (energy-related CO2) from cooling appliances (AC, Fans, Refrigerators) under different efficiency scenarios.
                                    <strong>HEAT Modelling:</strong> Direct (refrigerant) and indirect (energy) emissions from AC and refrigeration with Kigali Protocol scenarios. <em>Developed in collaboration with GIZ.</em>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- KPI Cards -->
                    <div class="kpi-grid policy-kpis">
                        <div class="kpi-card red">
                            <div class="kpi-value" id="emissions-kpi-total">-</div>
                            <div class="kpi-label">Total CO2 Emissions</div>
                            <div class="kpi-sublabel">Mt CO2 equivalent</div>
                        </div>
                        <div class="kpi-card blue">
                            <div class="kpi-value" id="emissions-kpi-ac">-</div>
                            <div class="kpi-label">Air Conditioning</div>
                            <div class="kpi-sublabel">Mt CO2</div>
                        </div>
                        <div class="kpi-card amber">
                            <div class="kpi-value" id="emissions-kpi-fridge">-</div>
                            <div class="kpi-label">Refrigeration</div>
                            <div class="kpi-sublabel">Mt CO2</div>
                        </div>
                        <div class="kpi-card green">
                            <div class="kpi-value" id="emissions-kpi-fans">-</div>
                            <div class="kpi-label">Fans</div>
                            <div class="kpi-sublabel">Mt CO2</div>
                        </div>
                    </div>

                    <!-- Filter Controls -->
                    <div class="card-panel" id="emissions-filters-panel">
                        <div class="filter-row" style="gap: 1.5rem; flex-wrap: wrap; align-items: flex-end;">
                            <!-- Data Source Toggle -->
                            <div class="filter-group" style="flex: 1; min-width: 200px;">
                                <label class="filter-label">Data Source</label>
                                <div class="toggle-group" id="emissions-source-toggles">
                                    <button class="toggle-btn active" data-source="clasp" type="button" title="Indirect emissions only (energy-related CO2) by appliance">clasp</button>
                                    <button class="toggle-btn" data-source="subcool" type="button" title="Direct and indirect emissions with Kigali scenarios (GIZ collaboration)">HEAT Modelling</button>
                                </div>
                            </div>

                            <!-- Year Slider -->
                            <div class="filter-group" style="flex: 2; min-width: 200px;">
                                <label class="filter-label">Year</label>
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <input type="range" id="emissions-year-slider" min="2020" max="2045" value="2030" style="flex: 1;" />
                                    <span id="emissions-year-display" style="font-weight: 700; color: #1e3a5f; min-width: 45px;">2030</span>
                                </div>
                            </div>

                            <!-- Scenario Dropdown -->
                            <div class="filter-group" style="flex: 1; min-width: 150px;">
                                <label class="filter-label" for="emissions-scenario-select">Scenario</label>
                                <select id="emissions-scenario-select" class="filter-select">
                                    <option value="BAU">Business as Usual</option>
                                    <option value="GB">Green Buildings</option>
                                    <option value="NZH">Net Zero Homes</option>
                                    <option value="BAT">Best Available Tech</option>
                                </select>
                            </div>

                            <!-- Region Dropdown -->
                            <div class="filter-group" style="flex: 1; min-width: 150px;">
                                <label class="filter-label" for="emissions-region-select">Region</label>
                                <select id="emissions-region-select" class="filter-select">
                                    <option value="">All Regions</option>
                                </select>
                            </div>
                        </div>

                        <!-- Appliance Toggles (for CLASP) -->
                        <div class="filter-row" style="margin-top: 1rem;" id="emissions-appliance-row">
                            <div class="filter-group" style="flex: 1;">
                                <label class="filter-label">
                                    Appliances
                                    <span style="margin-left: 0.5rem;">
                                        <button class="mini-btn" id="emissions-app-all" type="button">All</button>
                                        <button class="mini-btn" id="emissions-app-none" type="button">None</button>
                                    </span>
                                </label>
                                <div class="toggle-group" id="emissions-appliance-toggles">
                                    <button class="toggle-btn active" data-appliance="Air Conditioning" type="button">AC</button>
                                    <button class="toggle-btn active" data-appliance="Ceiling and Portable Fans" type="button">Fans</button>
                                    <button class="toggle-btn active" data-appliance="Refrigerator-Freezers" type="button">Refrigerators</button>
                                </div>
                            </div>
                        </div>

                        <!-- Emission Type Toggles (for Subcool) -->
                        <div class="filter-row" style="margin-top: 1rem; display: none;" id="emissions-type-row">
                            <div class="filter-group" style="flex: 1;">
                                <label class="filter-label">Emission Type</label>
                                <div class="toggle-group" id="emissions-type-toggles">
                                    <button class="toggle-btn active" data-type="total" type="button">Total</button>
                                    <button class="toggle-btn" data-type="direct" type="button">Direct (Refrigerants)</button>
                                    <button class="toggle-btn" data-type="indirect" type="button">Indirect (Energy)</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Map Card -->
                    <div class="card-panel map-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-earth-americas"></i>
                                CO2 Emissions by Country
                            </div>
                            <span class="viewing-pill">Viewing: <strong id="emissions-viewing">Global</strong></span>
                        </div>
                        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; padding: 0 0.5rem;">
                            Cooling sector emissions in Mt CO2. Click a country for detailed breakdown.
                        </div>
                        <div id="emissions-map-container" class="map-surface"></div>
                        <div class="legend legend-row">
                            <span class="legend-label">Emissions (Mt CO2):</span>
                            <div id="emissions-legend" class="legend-items"></div>
                        </div>
                        <div class="progress-bar" id="emissions-progress">
                            <span class="progress-segment" id="emissions-progress-low" style="background: #166534;"></span>
                            <span class="progress-segment" id="emissions-progress-medium" style="background: #65a30d;"></span>
                            <span class="progress-segment" id="emissions-progress-high" style="background: #fbbf24;"></span>
                            <span class="progress-segment" id="emissions-progress-critical" style="background: #ef4444;"></span>
                        </div>
                        <div class="country-card-inline" id="emissions-country-detail">
                            <h3>Selected Country</h3>
                            <div class="country-detail">
                                <h4>Select a country</h4>
                                <p class="side-muted">Click on a country in the map to see emission details.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Container -->
                    <div id="emissions-charts-container"></div>
                </div>
            </section>
        </main>

        <!-- Right Sidebar -->
        <aside class="sidebar-right">
            <div class="side-card" id="data-sources">
                <h3>Authoritative Data Sources</h3>
                <p class="side-muted">Access original datasets and policy trackers.</p>
                <div class="source-list" id="source-list"></div>
            </div>

            <div class="side-card insight-card">
                <h3>
                    <i class="fa-solid fa-lightbulb"></i>
                    Strategic Insight
                </h3>
                <p id="insight-text" class="insight-text"></p>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="label" id="stat-label-1">Total Countries</span>
                        <span id="stat-val-1">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="label" id="stat-label-2">GCP Coverage</span>
                        <span id="stat-val-2">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="label" id="stat-label-3">Kigali Coverage</span>
                        <span id="stat-val-3">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="label" id="stat-label-4">MEPS Coverage</span>
                        <span id="stat-val-4">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">Data Updated</span>
                        <span id="stat-updated">-</span>
                    </div>
                </div>
            </div>
        </aside>
    </div>

    <div class="tooltip" id="tooltip"></div>

    <!-- Pillar Information Modal -->
    <div class="pillar-modal-overlay" id="pillar-modal-overlay">
        <div class="pillar-modal">
            <button class="pillar-modal-close" type="button" id="pillar-modal-close">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <h2 id="pillar-modal-title"></h2>
            <p class="pillar-modal-subtitle" id="pillar-modal-subtitle"></p>
            <div class="pillar-modal-body" id="pillar-modal-body"></div>
        </div>
    </div>
</div>

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

  // Layout components
  import { Sidebar, Header, RightPanel } from '$lib/components/layout';
  // Pillar view components
  import { OverviewPillar, EmissionsPillar, MepsPillar, KigaliPillar, AccessPillar, PolicyPillar, PartnersPillar } from '$lib/components/pillars';
  // Shared components
  import { PillarModal, VIEW_META, PILLAR_INFO,
    CLASP_SCENARIOS, CLASP_SCENARIO_NAMES, CLASP_APPLIANCES, CLASP_APPLIANCE_SHORT,
    HEAT_SCENARIOS, HEAT_SCENARIO_NAMES, HEAT_SUBSECTORS, HEAT_SUBSECTOR_SHORT,
    EMISSIONS_YEARS, ACCESS_HISTORICAL_YEARS, ACCESS_FORECAST_YEARS, ACCESS_YEARS,
    IMPACT_LEVELS, POPULATION_CATEGORIES, SCOPE_TO_APPLIANCE, APPLIANCE_TO_SCOPE,
    SUPABASE_URL, SUPABASE_KEY
  } from '$lib/components/shared';
  import type { Indicator } from '$lib/components/shared/config';

  // Reactive state for component props
  let currentViewState = 'overview';
  let activeScope = 'ac';
  let scopeDisabled = false;
  let headerHeadline = 'Why Cooling Matters';
  let headerSubhead = 'The Transition is Urgent. The Opportunity is Now.';
  let headerMethodology = '';
  let headerSources: { name: string; url: string }[] = [];
  let headerVisible = true;
  let showPillarInfoBtn = false;
  let pillarModalVisible = false;
  let insightText = '';

  function handleViewChange(view: string) {
    // Delegate to the onMount switchView function if available
    if (typeof (window as any).__dashboardSwitchView === 'function') {
      (window as any).__dashboardSwitchView(view);
    }
    currentViewState = view;
  }

  function handleScopeChange(scope: string) {
    if (typeof (window as any).__dashboardSetScope === 'function') {
      (window as any).__dashboardSetScope(scope);
    }
    activeScope = scope;
  }

  function handlePillarInfoClick() {
    pillarModalVisible = true;
  }

  function handlePillarModalClose() {
    pillarModalVisible = false;
  }

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
    // CONFIGURATION (imported from $lib/components/shared/config.ts)
    // =====================================================

    const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
    const setText = (id: string, value: string | number) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value);
    };

        // Data storage
    let data: DashboardData = createDefaultData();

        // Indicator type imported from config

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

    // CLASP/HEAT scenarios, appliances, emissions years: imported from config.ts

        // NDC Tracker filters
    let ndcType = 'NDC 3.0';
    let ndcCategory = 'Energy Efficiency';

    // Access & Vulnerability filters
    let accessDataSource: 'historical' | 'forecast' = 'historical';
    let accessYear = 2024;
    let accessImpactLevels: string[] = ['High', 'Medium', 'Low'];
    let accessPopCategories: string[] = ['Rural Poor', 'Urban Poor', 'Lower-Middle Income', 'Middle-Income'];
    let accessRegionFilter = '';

    // ACCESS_HISTORICAL_YEARS, ACCESS_FORECAST_YEARS: imported from config.ts

    // MEPS filters
    let mepsRegionFilter = '';
    let mepsEquipmentTypes: string[] = [];

    // Kigali filters
    let kigaliRegionFilter = '';
    let kigaliGroupTypes: string[] = [];

    // ACCESS_YEARS, IMPACT_LEVELS, POPULATION_CATEGORIES: imported from config.ts

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

    // scopeToAppliance, applianceToScope: imported as SCOPE_TO_APPLIANCE, APPLIANCE_TO_SCOPE from config.ts
    const scopeToAppliance = SCOPE_TO_APPLIANCE;
    const applianceToScope = APPLIANCE_TO_SCOPE;

    const viewMeta: Record<
      string,
      { headline: string; subhead: string; insight: string; entryStat?: string; sources: { name: string; url: string; logo?: string; logos?: string[]; logoLarge?: boolean }[] }
    > = {
      overview: {
        headline: 'The planet is warming. Cooling must not make it worse.',
        subhead: 'Tracking the global transition to sustainable, equitable cooling.',
        insight:
          'Cooling keeps food fresh, medicines viable, workers productive, and people alive during heat waves. Yet the way we cool today accelerates the very warming that makes cooling essential. By 2050, global cooling demand will triple. The choices we make now determine whether that growth locks in a climate disaster or powers a sustainable transition.',
        entryStat: '10 ACs sold every second -- 3 billion more units by 2050',
        sources: [
          { name: 'IEA Future of Cooling', url: 'https://www.iea.org/reports/the-future-of-cooling' },
          { name: 'Cool Coalition Data Hub', url: 'https://coolcoalition.org/' },
          { name: 'CLASP Policy Database', url: 'https://www.clasp.ngo/tools/clasp-policy-resource-center/' }
        ]
      },
      emissions: {
        headline: "We're stuck in a vicious cycle",
        subhead: 'Cooling produces 7% of global emissions and demand is set to triple. Bending the curve starts now.',
        insight:
          'Every air conditioner on a fossil-fueled grid adds CO\u2082. Every refrigerant leak releases gases thousands of times more potent. Without intervention, cooling emissions could double by 2040. Three simultaneous moves can bend the curve: ultra-low-GWP refrigerants, doubled efficiency, and grid decarbonization.',
        entryStat: '7% of global GHG emissions -- set to double by 2040',
        sources: [
          { name: 'Mepsy by CLASP', url: 'https://www.clasp.ngo/tools/mepsy/', logo: '/images/clasp-logo.png' },
          { name: 'Green Cooling Initiative', url: 'https://www.green-cooling-initiative.org/country-data#!total-emissions/all-sectors/absolute', logos: ['/images/heat-logo.png', '/images/giz-logo.png'] }
        ]
      },
      meps: {
        headline: 'Efficiency is the cheapest clean energy',
        subhead: 'The invisible climate solution hiding in plain sight.',
        insight:
          'Every year, millions of inefficient units flood markets with weak standards -- locking in 10-15 years of excess energy use. CLASP data shows best-available-technology MEPS could cut cooling energy consumption 40-50% by 2050, avoiding 1,300 TWh of annual electricity -- equivalent to India\'s total output.',
        entryStat: '3x efficiency gap between best and worst products on sale today',
        sources: [
          { name: 'CLASP Policy Resource Center (CPRC)', url: 'https://www.clasp.ngo/tools/clasp-policy-resource-center/', logo: '/images/clasp-logo.png' }
        ]
      },
      kigali: {
        headline: 'The refrigerant revolution',
        subhead: 'From HFCs to natural cooling -- the Kigali Amendment is rewriting the rules.',
        insight:
          'HFCs like R-410A (GWP 2,088) are potent greenhouse gases. Left unchecked, HFC growth alone adds 0.5\u00B0C of warming by 2100. The Kigali Amendment created a legally binding pathway to phase down HFC consumption by over 80%. Natural refrigerants -- R-290 (GWP 3), R-600a (GWP 3), R-744 (GWP 1) -- are the endgame.',
        entryStat: '157 parties ratified -- 95% of global HFC consumption covered',
        sources: [
          { name: 'UNEP Ozone Secretariat', url: 'https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016' },
          { name: 'MLF Project Database', url: 'https://www.multilateralfund.org/OurWork/default.aspx' },
          { name: 'Kigali Amendment Tracker', url: 'https://ozone.unep.org/' }
        ]
      },
      access: {
        headline: 'Cooling is an equity issue',
        subhead: 'More than 1.2 billion people face dangerous heat without adequate cooling.',
        insight:
          'Heat waves kill tens of thousands each year. 420,000 people die annually from food spoiled by broken cold chains. The access gap hits hardest in low-income urban settlements and rural communities across Sub-Saharan Africa and South Asia. Passive cooling, solar cold chains, and community cooling centers offer sustainable pathways to close the gap.',
        entryStat: '1.2 billion people at high risk -- 420,000 deaths/year from spoiled food',
        sources: [
          { name: 'SEforALL Chilling Prospects 2025', url: 'https://www.seforall.org/data-stories/chilling-prospects-2025', logo: '/images/seforall-logo.jpg', logoLarge: true }
        ]
      },
      policy: {
        headline: 'From pledge to action',
        subhead: '66+ countries signed the Global Cooling Pledge at COP28. Now comes the hard part.',
        insight:
          'The Global Cooling Pledge was the first time cooling received dedicated political attention at a UNFCCC COP. But fewer than 30% of NDCs explicitly mention cooling. Roughly 20 countries have NCAPs. Effective policy requires coherence: NDCs, NCAPs, Kigali compliance, MEPS, and finance mechanisms must reinforce each other.',
        entryStat: '<30% of NDCs mention cooling -- only ~20 countries have action plans',
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
      const entryStatEl = byId('entry-stat');
      if (entryStatEl) {
        if (meta.entryStat) {
          entryStatEl.textContent = meta.entryStat;
          entryStatEl.style.display = '';
        } else {
          entryStatEl.style.display = 'none';
        }
      }
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
      let isCountryView = false;
      if (globalCountryFilter) {
        const country = data.countries.find(c => c.country_code === globalCountryFilter);
        label = country?.country_name || globalCountryFilter;
        isCountryView = true;
      }
      const emissionsViewing = document.getElementById('emissions-viewing');
      if (emissionsViewing) {
        emissionsViewing.textContent = label;
      }
      // Update KPI box titles based on country selection
      const emissionsKpiTitle = document.getElementById('emissions-kpi-title');
      if (emissionsKpiTitle) {
        emissionsKpiTitle.innerHTML = isCountryView
          ? `<i class="fa-solid fa-flag"></i> ${label}`
          : `<i class="fa-solid fa-globe"></i> Global View`;
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
                    <div class="legend-color" style="background:#8BC34A"></div>
                    Low
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#E89B8C"></div>
                    Medium
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#E85A4F"></div>
                    High
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#E85A4F"></div>
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

            // For Policy view, show simplified country name only
            if (currentView === 'policy') {
                updatePolicyCountryDetail(code);
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

            // CCC Palette colors for population categories
            const categoryColors: Record<string, string> = {
                'Rural Poor': '#E85A4F',
                'Urban Poor': '#E89B8C',
                'Lower-Middle Income': '#8BC34A',
                'Middle-Income': '#3D6B6B'
            };

            // Build stacked data by category over time
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

            // Current year data with breakdown by category (for pie chart)
            const currentYearData = countryData.filter(r => r.year === accessYear);
            const categoryBreakdown = POPULATION_CATEGORIES.map(cat => {
                const catTotal = currentYearData
                    .filter(r => r.population_category === cat)
                    .reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
                return { category: cat, value: catTotal, color: categoryColors[cat] };
            }).filter(cb => cb.value > 0);

            // Calculate totals for stats
            const currentYearTotal = currentYearData.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
            const baselineYear = ACCESS_YEARS[0];
            const baselineData = countryData.filter(r => r.year === baselineYear);
            const baselineTotal = baselineData.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
            const changePercent = baselineTotal > 0 ? ((currentYearTotal - baselineTotal) / baselineTotal * 100).toFixed(1) : '0';
            const changeColor = Number(changePercent) > 0 ? '#E85A4F' : '#8BC34A';
            const changeIcon = Number(changePercent) > 0 ? 'fa-arrow-up' : 'fa-arrow-down';

            // Get region from country data
            const region = country.region || 'Global South';

            // Generate trend description
            const trendDirection = Number(changePercent) > 0 ? 'increased' : 'decreased';
            const dominantCategory = categoryBreakdown.reduce((max, c) => c.value > max.value ? c : max, { category: '', value: 0 }).category;
            const trendDescription = `Population without cooling access has ${trendDirection} by ${Math.abs(Number(changePercent))}% since ${baselineYear}.`;
            const breakdownDescription = dominantCategory ? `The largest vulnerable group is ${dominantCategory}, making up the majority of those at risk.` : '';

            // Set the HTML content matching Emissions view style
            accessDetail.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <h4 style="color: #92400e; font-size: 1.1rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-flag" style="color: #f59e0b;"></i>
                        ${country.country_name}
                        <span style="font-size: 0.75rem; font-weight: 400; color: #64748b; margin-left: 0.5rem;">${region}</span>
                    </h4>
                    <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap;">
                        <span style="font-size: 0.8rem; color: #E85A4F; font-weight: 600;">
                            <i class="fa-solid fa-users" style="margin-right: 0.25rem;"></i>
                            ${(currentYearTotal / 1e6).toFixed(1)}M at risk
                        </span>
                        <span style="font-size: 0.8rem; color: ${changeColor}; font-weight: 500;">
                            <i class="fa-solid ${changeIcon}" style="margin-right: 0.25rem;"></i>
                            ${Math.abs(Number(changePercent))}% since ${baselineYear}
                        </span>
                    </div>
                </div>
                <div class="country-charts-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1rem;">
                    <div class="chart-box" style="background: #fafafa; border-radius: 8px; padding: 0.75rem;">
                        <div style="font-size: 0.75rem; font-weight: 600; color: #92400e; margin-bottom: 0.5rem;">
                            <i class="fa-solid fa-chart-area" style="margin-right: 0.3rem; color: #f59e0b;"></i>
                            Population at Risk Over Time
                        </div>
                        <div class="access-stacked-chart" style="width: 100%; height: 200px;"></div>
                    </div>
                    <div class="chart-box" style="background: #fafafa; border-radius: 8px; padding: 0.75rem;">
                        <div style="font-size: 0.75rem; font-weight: 600; color: #92400e; margin-bottom: 0.5rem;">
                            <i class="fa-solid fa-chart-pie" style="margin-right: 0.3rem; color: #f59e0b;"></i>
                            ${accessYear} Category Breakdown
                        </div>
                        <div class="access-pie-chart" style="width: 100%; height: 200px;"></div>
                    </div>
                </div>
                <div class="country-insight" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 1rem; border-left: 3px solid #f59e0b;">
                    <div style="font-size: 0.8rem; font-weight: 600; color: #92400e; margin-bottom: 0.5rem;">
                        <i class="fa-solid fa-lightbulb" style="color: #f59e0b; margin-right: 0.35rem;"></i>
                        Analysis for ${country.country_name}
                    </div>
                    <p style="font-size: 0.85rem; color: #78350f; line-height: 1.6; margin: 0;">
                        ${trendDescription} ${breakdownDescription}
                        <span style="display: block; margin-top: 0.5rem; font-size: 0.75rem; color: #64748b;">
                            <em>Data source: SEforALL Chilling Prospects • Year: ${accessYear}</em>
                        </span>
                    </p>
                </div>
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
                            data: ACCESS_YEARS.map(String),
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
                                formatter: (v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : String(v)
                            },
                            splitLine: { lineStyle: { color: '#e2e8f0' } },
                            name: 'Population',
                            nameLocation: 'middle',
                            nameGap: 35,
                            nameTextStyle: { fontSize: 10, color: '#64748b', fontWeight: 500 }
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

            // Colors for appliances/subsectors and emission types - CCC Palette
            const applianceColors: Record<string, string> = {
                'Air Conditioning': '#3D6B6B',
                'Ceiling and Portable Fans': '#8BC34A',
                'Refrigerator-Freezers': '#E89B8C',
                'Split residential air conditioners': '#3D6B6B',
                'Domestic refrigeration': '#E89B8C'
            };
            const emissionTypeColors: Record<string, string> = {
                'Direct': '#E85A4F',
                'Indirect': '#3D6B6B'
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

            // Calculate trend relative to 2025 baseline
            const baselineYear = 2025;
            const baselineYearIndex = years.indexOf(baselineYear);
            let changePercent = '0';
            let changeColor = '#64748b';
            let changeIcon = 'fa-minus';
            let comparisonText = '';

            if (baselineYearIndex !== -1 && emissionsYear >= baselineYear) {
                // For future years, compare to 2025
                const baselineTotal = stackedSeriesData.reduce((sum, s) => sum + (s.data[baselineYearIndex] || 0), 0);
                const selectedYearIndex = years.indexOf(emissionsYear);
                const selectedYearTotal = selectedYearIndex !== -1
                    ? stackedSeriesData.reduce((sum, s) => sum + (s.data[selectedYearIndex] || 0), 0)
                    : currentYearTotal;
                const change = selectedYearTotal - baselineTotal;
                if (baselineTotal > 0) {
                    changePercent = ((change / baselineTotal) * 100).toFixed(1);
                }
                changeColor = change > 0 ? '#ef4444' : change < 0 ? '#22c55e' : '#64748b';
                changeIcon = change > 0 ? 'fa-arrow-up' : change < 0 ? 'fa-arrow-down' : 'fa-minus';
                comparisonText = 'vs 2025';
            } else if (years.length >= 2) {
                // For historical data, compare first to selected year
                const firstYearTotal = stackedSeriesData.reduce((sum, s) => sum + (s.data[0] || 0), 0);
                const change = currentYearTotal - firstYearTotal;
                if (firstYearTotal > 0) {
                    changePercent = ((change / firstYearTotal) * 100).toFixed(1);
                }
                changeColor = change > 0 ? '#ef4444' : change < 0 ? '#22c55e' : '#64748b';
                changeIcon = change > 0 ? 'fa-arrow-up' : change < 0 ? 'fa-arrow-down' : 'fa-minus';
                comparisonText = `vs ${years[0]}`;
            }

            // Chart titles based on data source
            const lineChartTitle = emissionsDataSource === 'clasp'
                ? 'Emissions by Appliance Over Time'
                : 'Direct vs Indirect Emissions Over Time';
            const pieChartTitle = `${emissionsYear} Breakdown`;

            // Generate trend description
            const trendDirection = Number(changePercent) > 0 ? 'increase' : Number(changePercent) < 0 ? 'decrease' : 'remain stable';
            const trendDescription = years.length >= 2
                ? `Emissions are projected to ${trendDirection} by ${Math.abs(Number(changePercent))}% from 2025 to ${emissionsYear} under the ${scenarioLabel} scenario.`
                : 'Insufficient data to calculate trend.';

            // Generate breakdown description
            const topSource = currentYearBreakdown.length > 0
                ? currentYearBreakdown.reduce((a, b) => a.value > b.value ? a : b)
                : null;
            const breakdownDescription = topSource
                ? `In ${emissionsYear}, ${topSource.name} accounts for the largest share of emissions at ${((topSource.value / currentYearTotal) * 100).toFixed(0)}% (${topSource.value.toFixed(2)} Mt CO2).`
                : 'No detailed breakdown available for the selected year.';

            // Set the HTML content with side-by-side charts and explanatory text
            emissionsDetail.innerHTML = `
                <div class="year-indicator" style="background: linear-gradient(135deg, #3D6B6B 0%, #4A7F7F 100%); color: white; padding: 0.5rem 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-calendar-day" style="font-size: 1.1rem;"></i>
                        <span style="font-size: 1.25rem; font-weight: 700;">${emissionsYear}</span>
                        <span style="font-size: 0.75rem; opacity: 0.9;">• ${scenarioLabel}</span>
                    </div>
                    <span style="font-size: 0.7rem; opacity: 0.85;"><i class="fa-solid fa-sliders" style="margin-right: 0.3rem;"></i>Use the year slider above to explore different projections</span>
                </div>
                <div class="country-header" style="margin-bottom: 1rem;">
                    <h4 style="color: #3D6B6B; font-size: 1.1rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-flag" style="color: #8BC34A;"></i>
                        ${country.country_name}
                        <span style="font-size: 0.75rem; font-weight: 400; color: #64748b; margin-left: 0.5rem;">${region}</span>
                    </h4>
                    <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap;">
                        <span style="font-size: 0.8rem; color: #E85A4F; font-weight: 600;">
                            <i class="fa-solid fa-cloud" style="margin-right: 0.25rem;"></i>
                            ${currentYearTotal.toFixed(2)} Mt CO2
                        </span>
                        <span style="font-size: 0.8rem; color: ${changeColor}; font-weight: 500;">
                            <i class="fa-solid ${changeIcon}" style="margin-right: 0.25rem;"></i>
                            ${Math.abs(Number(changePercent))}% ${comparisonText}
                        </span>
                    </div>
                </div>
                <div class="country-charts-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1rem;">
                    <div class="chart-box" style="background: #fafafa; border-radius: 8px; padding: 0.75rem;">
                        <div style="font-size: 0.75rem; font-weight: 600; color: #3D6B6B; margin-bottom: 0.5rem;">
                            <i class="fa-solid fa-chart-area" style="margin-right: 0.3rem; color: #8BC34A;"></i>
                            ${lineChartTitle}
                        </div>
                        <div class="emissions-line-chart" style="width: 100%; height: 200px;"></div>
                    </div>
                    <div class="chart-box" style="background: #fafafa; border-radius: 8px; padding: 0.75rem;">
                        <div style="font-size: 0.75rem; font-weight: 600; color: #3D6B6B; margin-bottom: 0.5rem;">
                            <i class="fa-solid fa-chart-pie" style="margin-right: 0.3rem; color: #8BC34A;"></i>
                            ${pieChartTitle}
                        </div>
                        <div class="emissions-pie-chart" style="width: 100%; height: 200px;"></div>
                    </div>
                </div>
                <div class="country-insight" style="background: linear-gradient(135deg, #EBF4F4 0%, #F5FAFA 100%); border-radius: 8px; padding: 1rem; border-left: 3px solid #8BC34A;">
                    <div style="font-size: 0.8rem; font-weight: 600; color: #2D5252; margin-bottom: 0.5rem;">
                        <i class="fa-solid fa-lightbulb" style="color: #8BC34A; margin-right: 0.35rem;"></i>
                        Analysis for ${country.country_name}
                    </div>
                    <p style="font-size: 0.85rem; color: #3D6B6B; line-height: 1.6; margin: 0;">
                        ${trendDescription} ${breakdownDescription}
                        <span style="display: block; margin-top: 0.5rem; font-size: 0.75rem; color: #64748b;">
                            <em>Data source: ${dataSourceLabel} • Scenario: ${scenarioLabel}</em>
                        </span>
                    </p>
                </div>
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

        // Show global aggregated emissions when no country is selected
        function showGlobalEmissionsDetail() {
            const emissionsDetail = document.querySelector('#emissions-country-detail .country-detail') as HTMLElement;
            if (!emissionsDetail) return;

            const dataSourceLabel = emissionsDataSource === 'clasp' ? 'CLASP' : 'HEAT Modelling';
            const scenarioLabel = emissionsDataSource === 'clasp'
                ? CLASP_SCENARIO_NAMES[emissionsScenario] || emissionsScenario
                : HEAT_SCENARIO_NAMES[emissionsScenario] || emissionsScenario;

            // Get global totals
            const totals = getEmissionsTotals();
            let globalTotal = 0;
            let globalBreakdown: { name: string; value: number; color: string }[] = [];

            const applianceColors: Record<string, string> = {
                'Air Conditioning': '#3D6B6B',
                'Ceiling and Portable Fans': '#8BC34A',
                'Refrigerator-Freezers': '#E89B8C',
                'AC': '#3D6B6B',
                'Fans': '#8BC34A',
                'Refrigerators': '#E89B8C'
            };

            if (emissionsDataSource === 'clasp') {
                const t = totals as { total: number; byAppliance: Record<string, number>; countriesCount: number };
                globalTotal = t.total;
                Object.entries(t.byAppliance).forEach(([app, val]) => {
                    if (val > 0) {
                        const shortName = CLASP_APPLIANCE_SHORT[app] || app;
                        globalBreakdown.push({
                            name: shortName,
                            value: val,
                            color: applianceColors[shortName] || applianceColors[app] || '#64748b'
                        });
                    }
                });
            } else {
                const t = totals as { total: number; direct: number; indirect: number; countriesCount: number };
                globalTotal = t.total;
                if (t.direct > 0) globalBreakdown.push({ name: 'Direct', value: t.direct, color: '#E85A4F' });
                if (t.indirect > 0) globalBreakdown.push({ name: 'Indirect', value: t.indirect, color: '#3D6B6B' });
            }

            const topSource = globalBreakdown.length > 0
                ? globalBreakdown.reduce((a, b) => a.value > b.value ? a : b)
                : null;

            const lineChartTitle = emissionsDataSource === 'clasp'
                ? 'Global Emissions by Appliance'
                : 'Global Direct vs Indirect Emissions';

            emissionsDetail.innerHTML = `
                <div class="year-indicator" style="background: linear-gradient(135deg, #3D6B6B 0%, #4A7F7F 100%); color: white; padding: 0.5rem 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-calendar-day" style="font-size: 1.1rem;"></i>
                        <span style="font-size: 1.25rem; font-weight: 700;">${emissionsYear}</span>
                        <span style="font-size: 0.75rem; opacity: 0.9;">• ${scenarioLabel}</span>
                    </div>
                    <span style="font-size: 0.7rem; opacity: 0.85;"><i class="fa-solid fa-sliders" style="margin-right: 0.3rem;"></i>Use the year slider above to explore different projections</span>
                </div>
                <div class="country-header" style="margin-bottom: 1rem;">
                    <h4 style="color: #3D6B6B; font-size: 1.1rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-globe" style="color: #8BC34A;"></i>
                        Global Overview
                    </h4>
                    <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap;">
                        <span style="font-size: 0.8rem; color: #E85A4F; font-weight: 600;">
                            <i class="fa-solid fa-cloud" style="margin-right: 0.25rem;"></i>
                            ${globalTotal.toFixed(1)} Mt CO2
                        </span>
                    </div>
                </div>
                <div class="country-charts-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1rem;">
                    <div class="chart-box" style="background: #fafafa; border-radius: 8px; padding: 0.75rem;">
                        <div style="font-size: 0.75rem; font-weight: 600; color: #3D6B6B; margin-bottom: 0.5rem;">
                            <i class="fa-solid fa-chart-pie" style="margin-right: 0.3rem; color: #8BC34A;"></i>
                            ${emissionsYear} Breakdown
                        </div>
                        <div class="emissions-pie-chart" style="width: 100%; height: 200px;"></div>
                    </div>
                    <div class="chart-box" style="background: #fafafa; border-radius: 8px; padding: 0.75rem;">
                        <div style="font-size: 0.75rem; font-weight: 600; color: #3D6B6B; margin-bottom: 0.5rem;">
                            <i class="fa-solid fa-ranking-star" style="margin-right: 0.3rem; color: #8BC34A;"></i>
                            Top Emitting Countries
                        </div>
                        <div class="emissions-bar-chart" style="width: 100%; height: 200px;"></div>
                    </div>
                </div>
                <div class="country-insight" style="background: linear-gradient(135deg, #EBF4F4 0%, #F5FAFA 100%); border-radius: 8px; padding: 1rem; border-left: 3px solid #8BC34A;">
                    <div style="font-size: 0.8rem; font-weight: 600; color: #2D5252; margin-bottom: 0.5rem;">
                        <i class="fa-solid fa-lightbulb" style="color: #8BC34A; margin-right: 0.35rem;"></i>
                        Global Analysis
                    </div>
                    <p style="font-size: 0.85rem; color: #3D6B6B; line-height: 1.6; margin: 0;">
                        Global cooling emissions total ${globalTotal.toFixed(1)} Mt CO2 in ${emissionsYear} under the ${scenarioLabel} scenario.
                        ${topSource ? `${topSource.name} accounts for the largest share at ${((topSource.value / globalTotal) * 100).toFixed(0)}% (${topSource.value.toFixed(1)} Mt CO2).` : ''}
                        <span style="display: block; margin-top: 0.5rem; font-size: 0.75rem; color: #64748b;">
                            <em>Data source: ${dataSourceLabel} • Scenario: ${scenarioLabel} • Click a country on the map for detailed breakdown</em>
                        </span>
                    </p>
                </div>
            `;

            // Render charts after DOM update
            setTimeout(() => {
                const pieContainer = emissionsDetail.querySelector('.emissions-pie-chart') as HTMLElement;
                const barContainer = emissionsDetail.querySelector('.emissions-bar-chart') as HTMLElement;

                // Dispose existing charts
                if (emissionsCountryPieChart) {
                    emissionsCountryPieChart.dispose();
                    emissionsCountryPieChart = null;
                }
                if (emissionsCountryLineChart) {
                    emissionsCountryLineChart.dispose();
                    emissionsCountryLineChart = null;
                }

                // Render pie chart
                if (pieContainer && globalBreakdown.length > 0) {
                    emissionsCountryPieChart = echarts.init(pieContainer);
                    emissionsCountryPieChart.setOption({
                        tooltip: { trigger: 'item', formatter: (params: any) => `${params.name}: ${params.value.toFixed(1)} Mt (${params.percent}%)` },
                        series: [{
                            type: 'pie',
                            radius: ['35%', '65%'],
                            center: ['50%', '50%'],
                            itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
                            label: { show: true, fontSize: 11, fontWeight: 500, color: '#475569', formatter: (p: any) => `${p.name}\n${p.percent}%` },
                            data: globalBreakdown.map(c => ({ name: c.name, value: c.value, itemStyle: { color: c.color } }))
                        }]
                    });
                }

                // Render top countries bar chart
                if (barContainer) {
                    let countryData: { name: string; value: number }[] = [];
                    if (emissionsDataSource === 'clasp') {
                        const byCountry = getClaspEmissionsByCountry();
                        countryData = Object.entries(byCountry)
                            .map(([code, data]) => ({ name: data.name || code, value: data.total }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 8);
                    } else {
                        const byCountry = getSubcoolEmissionsByCountry();
                        countryData = Object.entries(byCountry)
                            .map(([code, data]) => ({ name: data.name || code, value: data.total }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 8);
                    }

                    emissionsCountryLineChart = echarts.init(barContainer);
                    emissionsCountryLineChart.setOption({
                        tooltip: { trigger: 'axis', formatter: '{b}: {c} Mt' },
                        grid: { left: '3%', right: '8%', bottom: '3%', top: '3%', containLabel: true },
                        xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
                        yAxis: { type: 'category', data: countryData.map(d => d.name).reverse(), axisLabel: { fontSize: 10 } },
                        series: [{
                            type: 'bar',
                            data: countryData.map(d => d.value).reverse(),
                            itemStyle: { color: '#3D6B6B', borderRadius: [0, 4, 4, 0] }
                        }]
                    });
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
                            { value: pledgeOnly, name: 'GCP Only', itemStyle: { color: '#8BC34A' } },
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

            // CCC color gradient from green (low) to orange-red (very high)
            if (ratio < 0.25) return '#8BC34A';  // Low - CCC green
            if (ratio < 0.5) return '#E89B8C';   // Medium - CCC coral
            if (ratio < 0.75) return '#E85A4F';  // High - CCC orange-red
            return '#D94539';                     // Very High - CCC dark orange-red
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

            // Add background rect to capture ocean clicks
            emissionsMapSvg.append('rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', 'transparent')
                .style('cursor', 'pointer')
                .on('click', () => {
                    // Deselect country and show global view
                    selectedCountry = null;
                    globalCountryFilter = '';
                    const countrySelect = byId<HTMLSelectElement>('country-filter');
                    if (countrySelect) countrySelect.value = '';

                    // Clear visual selection on map
                    clearCountryHighlights();

                    updateViewingBadges();
                    updateEmissionsView();

                    // Show global aggregated view in country detail section
                    showGlobalEmissionsDetail();
                });

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
                    <div class="legend-color" style="background:#8BC34A"></div>
                    Low
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#E89B8C"></div>
                    Medium
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#E85A4F"></div>
                    High
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#E85A4F"></div>
                    Very High
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

        // Update the meta pills in KPI box header
        function updateEmissionsMetaPills() {
            const sourceEl = document.getElementById('emissions-meta-source');
            const yearEl = document.getElementById('emissions-meta-year');
            const scenarioEl = document.getElementById('emissions-meta-scenario');

            if (sourceEl) {
                sourceEl.innerHTML = `<i class="fa-solid fa-database"></i> ${emissionsDataSource === 'clasp' ? 'CLASP' : 'HEAT'}`;
            }
            if (yearEl) {
                yearEl.innerHTML = `<i class="fa-solid fa-calendar"></i> ${emissionsYear}`;
            }
            if (scenarioEl) {
                const scenarioName = emissionsDataSource === 'clasp'
                    ? CLASP_SCENARIO_NAMES[emissionsScenario] || emissionsScenario
                    : HEAT_SCENARIO_NAMES[emissionsScenario] || emissionsScenario;
                scenarioEl.innerHTML = `<i class="fa-solid fa-chart-line"></i> ${scenarioName}`;
            }
        }

        // Main update function for emissions view
        function updateEmissionsView() {
            updateNewEmissionsKPIs();
            updateNewEmissionsMap();
            updateEmissionsCharts();
            updateEmissionsMetaPills();
            // Refresh country detail if a country is selected, otherwise show global
            if (selectedCountry) {
                const country = data.countries.find(c => c.country_code === selectedCountry);
                if (country) {
                    updateEmissionsCountryDetail(selectedCountry, country);
                }
            } else {
                showGlobalEmissionsDetail();
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

        // Update emissions legend - CCC Palette
        function updateNewEmissionsLegend(maxValue: number) {
            const container = document.getElementById('emissions-legend');
            if (!container) return;

            const thresholds = [0.25, 0.5, 0.75, 1.0];
            const colors = ['#8BC34A', '#E89B8C', '#E85A4F', '#D94539'];
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
                    itemStyle: { color: '#8BC34A' }
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
                    return '#2D5252'; // CCC dark teal - has both MEPS & Labels
                case 'meps':
                    return '#3D6B6B'; // CCC teal - MEPS only
                case 'labels':
                    return '#8BC34A'; // CCC green - Labels only
                case 'limited':
                    return '#E89B8C'; // CCC coral - other policies
                case 'critical':
                    return '#E85A4F'; // CCC orange-red - no policies
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

            // Ocean click handler - deselect country and return to global view
            mepsMapSvg.append('rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', 'transparent')
                .style('cursor', 'pointer')
                .on('click', () => {
                    selectedCountry = null;
                    globalCountryFilter = '';
                    const countrySelect = byId<HTMLSelectElement>('country-filter');
                    if (countrySelect) countrySelect.value = '';
                    clearCountryHighlights();
                    updateViewingBadges();
                    updateMepsView();
                    showGlobalMepsDetail();
                });

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
                    <div class="legend-color" style="background:#2D5252"></div>
                    MEPS & Labels
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#3D6B6B"></div>
                    MEPS Only
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#8BC34A"></div>
                    Labels Only
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#E85A4F"></div>
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

            if (!country) {
                container.innerHTML = `<h4>Unknown Country</h4><p class="side-muted">No data available for ${code}</p>`;
                return;
            }

            let html = `<h4>${country.country_name}</h4>`;

            container.innerHTML = html;

            // Update the charts below the map to show country-specific data
            updateMepsCountryCharts(code, allRecords);
        }

        function updateMepsCountryCharts(code: string, records: Meps[]) {
            const country = data.countries.find(c => c.country_code === code);
            const countryName = country?.country_name || code;
            const equipTypes = ['Air Conditioning', 'Domestic Refrigeration', 'Fans'];
            const equipShort: Record<string, string> = { 'Air Conditioning': 'AC', 'Domestic Refrigeration': 'Fridge', 'Fans': 'Fans' };
            const equipColors: Record<string, string> = { 'Air Conditioning': '#3D6B6B', 'Domestic Refrigeration': '#8BC34A', 'Fans': '#E89B8C' };

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
                            <div style="font-size:0.75rem;color:#334155;"><span style="color:#4A7F7F;font-weight:700;">${meps.length}</span> MEPS</div>
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
                            const borderColor = hasMep ? '#4A7F7F' : '#f59e0b';
                            const typeBadges: string[] = [];
                            if (hasMep) typeBadges.push(`<span style="font-size:0.65rem;background:#EBF4F4;color:#4A7F7F;padding:1px 5px;border-radius:3px;font-weight:600;">MEPS</span>`);
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
                        color: '#4A7F7F',
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
                        color: '#4A7F7F'
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
                        color: '#4A7F7F',
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
            updateMepsKpiTitle();
            updateMepsMetaPills();
            // Update viewing pill
            const viewingEl = document.getElementById('meps-viewing');
            if (viewingEl) {
                viewingEl.textContent = mepsRegionFilter || 'Global';
            }
        }

        function updateMepsKpiTitle() {
            const titleEl = document.getElementById('meps-kpi-title');
            if (!titleEl) return;

            if (selectedCountry) {
                const country = data.countries.find(c => c.country_code === selectedCountry);
                titleEl.innerHTML = `<i class="fa-solid fa-flag"></i> ${country?.country_name || selectedCountry}`;
            } else {
                titleEl.innerHTML = `<i class="fa-solid fa-globe"></i> Global View`;
            }
        }

        function updateMepsMetaPills() {
            const regionPill = document.getElementById('meps-meta-region');
            const equipPill = document.getElementById('meps-meta-equipment');

            if (regionPill) {
                regionPill.innerHTML = `<i class="fa-solid fa-earth-americas"></i> ${mepsRegionFilter || 'All Regions'}`;
            }
            if (equipPill) {
                const activeEquip = mepsEquipmentTypes.length;
                const totalEquip = 3; // AC, Refrigeration, Fans
                const equipText = activeEquip === 0 || activeEquip === totalEquip ? 'All Equipment' : `${activeEquip}/${totalEquip} Equipment`;
                equipPill.innerHTML = `<i class="fa-solid fa-cogs"></i> ${equipText}`;
            }

            // Also update filter status bar tags
            updateMepsFilterStatusBar();
        }

        function updateMepsFilterStatusBar() {
            const regionTag = document.getElementById('meps-filter-region');
            const equipTag = document.getElementById('meps-filter-equipment');

            if (regionTag) {
                regionTag.innerHTML = `<i class="fa-solid fa-earth-americas"></i> ${mepsRegionFilter || 'All Regions'}`;
            }
            if (equipTag) {
                const activeEquip = mepsEquipmentTypes.length;
                const totalEquip = 3; // AC, Refrigeration, Fans
                const equipText = activeEquip === 0 || activeEquip === totalEquip ? 'All Equipment' : `${activeEquip}/${totalEquip} Equipment`;
                equipTag.innerHTML = `<i class="fa-solid fa-cogs"></i> ${equipText}`;
            }

            // Update status title based on country selection
            const statusTitle = document.getElementById('meps-status-title');
            if (statusTitle) {
                if (selectedCountry) {
                    const country = data.countries.find(c => c.country_code === selectedCountry);
                    statusTitle.textContent = country?.country_name || selectedCountry;
                } else {
                    statusTitle.textContent = 'Product Efficiency Analysis';
                }
            }
        }

        function showGlobalMepsDetail() {
            const container = document.querySelector('#meps-country-detail .country-detail') as HTMLElement;
            if (!container) return;

            container.innerHTML = `
                <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #8BC34A; margin-bottom: 0.75rem; display: block;"></i>
                    <h4 style="color: #3D6B6B; margin-bottom: 0.5rem;">Select a Country</h4>
                    <p style="font-size: 0.85rem;">Click on any country in the map above to view MEPS and labeling policy details.</p>
                </div>
            `;
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
                    return '#2D5252'; // CCC dark teal
                case 'medium':
                    return '#8BC34A'; // CCC green
                case 'low':
                    return '#E89B8C'; // CCC coral
                case 'critical':
                    return '#E85A4F'; // CCC orange-red
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

            // Add background rect to capture ocean clicks
            kigaliMapSvg.append('rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', 'transparent')
                .style('cursor', 'pointer')
                .on('click', () => {
                    selectedCountry = null;
                    globalCountryFilter = '';
                    const countrySelect = byId<HTMLSelectElement>('country-filter');
                    if (countrySelect) countrySelect.value = '';
                    clearCountryHighlights();
                    updateViewingBadges();
                    updateKigaliView();
                    showGlobalKigaliDetail();
                });

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
                    <div class="legend-color" style="background:#2D5252"></div>
                    High/Active
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#8BC34A"></div>
                    Medium/Partial
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#E89B8C"></div>
                    Low/None
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#E85A4F"></div>
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
            const groupColors = ['#3D6B6B', '#8BC34A', '#E89B8C', '#E85A4F', '#4A7F7F'];

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

            // Color mapping by refrigerant type - CCC Palette
            const typeColors: Record<string, string> = {
                'HFC': '#E85A4F',   // Orange-red - High GWP
                'HCFC': '#E89B8C',  // Coral - Medium GWP
                'HFO': '#3D6B6B',   // Teal - Low GWP
                'NR': '#8BC34A'     // Green - Natural (lowest GWP)
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

            if (!country) {
                container.innerHTML = `<h4>Unknown Country</h4><p class="side-muted">No data available for ${code}</p>`;
                return;
            }

            container.innerHTML = `<h4>${country.country_name}</h4>`;
        }

        function updatePolicyCountryDetail(code: string) {
            const container = document.querySelector('#policy-country-detail .country-detail') as HTMLElement;
            if (!container) return;

            const country = data.countries.find(c => c.country_code === code);

            if (!country) {
                container.innerHTML = `<h4>Unknown Country</h4><p class="side-muted">No data available for ${code}</p>`;
                return;
            }

            container.innerHTML = `<h4>${country.country_name}</h4>`;
        }

        function showGlobalKigaliDetail() {
            const container = document.querySelector('#kigali-country-detail .country-detail') as HTMLElement;
            if (!container) return;

            container.innerHTML = `
                <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #8BC34A; margin-bottom: 0.75rem; display: block;"></i>
                    <h4 style="color: #2D5252; margin-bottom: 0.5rem;">Select a Country</h4>
                    <p style="font-size: 0.85rem;">Click on any country in the map above to view Kigali Amendment and refrigerant transition details.</p>
                </div>
            `;
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

            // Also update filter status bar tags
            updateKigaliFilterStatusBar();
        }

        function updateKigaliFilterStatusBar() {
            const regionTag = document.getElementById('kigali-filter-region');
            const groupTag = document.getElementById('kigali-filter-groups');

            if (regionTag) {
                regionTag.innerHTML = `<i class="fa-solid fa-earth-americas"></i> ${kigaliRegionFilter || 'All Regions'}`;
            }
            if (groupTag) {
                const groupFilter = (document.getElementById('kigali-group-filter') as HTMLSelectElement)?.value || '';
                groupTag.innerHTML = `<i class="fa-solid fa-users"></i> ${groupFilter || 'All Groups'}`;
            }

            // Update status title based on country selection
            const statusTitle = document.getElementById('kigali-status-title');
            if (statusTitle) {
                if (selectedCountry) {
                    const country = data.countries.find(c => c.country_code === selectedCountry);
                    statusTitle.textContent = country?.country_name || selectedCountry;
                } else {
                    statusTitle.textContent = 'Kigali Amendment Tracker';
                }
            }
        }

        // =====================================================
        // ACCESS MAP
        // =====================================================
        let accessMapSvg: any;

        // 7-tier threshold-based color scale
        const ACCESS_THRESHOLDS = [1e6, 5e6, 20e6, 50e6, 200e6, 500e6];
        // CCC Palette - consistent 4-tier scale: green -> coral -> orange-red -> dark red
        const ACCESS_COLORS = ['#8BC34A', '#8BC34A', '#E89B8C', '#E89B8C', '#E85A4F', '#D94539', '#D94539'];
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
                    return '#8BC34A'; // CCC green
                case 'medium':
                    return '#E89B8C'; // CCC coral
                case 'high':
                    return '#E85A4F'; // CCC orange-red
                case 'critical':
                    return '#D94539'; // CCC dark orange
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

            // Ocean click handler - deselect country and return to global view
            accessMapSvg.append('rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', 'transparent')
                .style('cursor', 'pointer')
                .on('click', () => {
                    selectedCountry = null;
                    globalCountryFilter = '';
                    const countrySelect = byId<HTMLSelectElement>('country-filter');
                    if (countrySelect) countrySelect.value = '';
                    clearCountryHighlights();
                    updateViewingBadges();
                    updateAccessView();
                    showGlobalAccessDetail();
                });

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
                    <div class="card-panel chart-card">
                        <div class="chart-card-header">
                            <h3><i class="fa-solid fa-chart-bar" style="color: #E85A4F; margin-right: 0.5rem;"></i>Population at Risk by Region</h3>
                            <p class="chart-subtitle">Year: ${accessYear}</p>
                        </div>
                        <div class="chart-card-body">
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-access-regional" class="chart-surface"></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-panel chart-card">
                        <div class="chart-card-header">
                            <h3><i class="fa-solid fa-chart-line" style="color: #E85A4F; margin-right: 0.5rem;"></i>Trend Over Time</h3>
                            <p class="chart-subtitle">2013-2024</p>
                        </div>
                        <div class="chart-card-body">
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-access-trend" class="chart-surface"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="charts-grid-2col">
                    <div class="card-panel chart-card">
                        <div class="chart-card-header">
                            <h3><i class="fa-solid fa-chart-pie" style="color: #E89B8C; margin-right: 0.5rem;"></i>By Population Category</h3>
                            <p class="chart-subtitle">Current selection</p>
                        </div>
                        <div class="chart-card-body">
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-access-category" class="chart-surface"></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-panel chart-card">
                        <div class="chart-card-header">
                            <h3><i class="fa-solid fa-ranking-star" style="color: #E89B8C; margin-right: 0.5rem;"></i>By Impact Level</h3>
                            <p class="chart-subtitle">Distribution</p>
                        </div>
                        <div class="chart-card-body">
                            <div class="chart-container" style="height: 280px;">
                                <div id="chart-access-impact" class="chart-surface"></div>
                            </div>
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
                        lineStyle: { color: '#3D6B6B', type: 'dashed' },
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

            // CCC Palette colors for population categories
            const categoryColors: Record<string, string> = {
                'Rural Poor': '#E85A4F',
                'Urban Poor': '#E89B8C',
                'Lower-Middle Income': '#8BC34A',
                'Middle-Income': '#3D6B6B'
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

            const impactColors: Record<string, string> = { High: '#E85A4F', Medium: '#E89B8C', Low: '#8BC34A' };

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
            updateAccessKpiTitle();
            updateAccessMetaPills();
        }

        function updateAccessKpiTitle() {
            const titleEl = document.getElementById('access-kpi-title');
            if (!titleEl) return;

            if (selectedCountry) {
                const country = data.countries.find(c => c.country_code === selectedCountry);
                titleEl.innerHTML = `<i class="fa-solid fa-flag"></i> ${country?.country_name || selectedCountry}`;
            } else {
                titleEl.innerHTML = `<i class="fa-solid fa-globe"></i> Global View`;
            }
        }

        function updateAccessMetaPills() {
            const sourcePill = document.getElementById('access-meta-source');
            const yearPill = document.getElementById('access-meta-year');
            const regionPill = document.getElementById('access-meta-region');

            if (sourcePill) {
                sourcePill.innerHTML = `<i class="fa-solid fa-database"></i> ${accessDataSource === 'historical' ? 'Historical' : 'Forecast'}`;
            }
            if (yearPill) {
                yearPill.innerHTML = `<i class="fa-solid fa-calendar"></i> ${accessYear}`;
            }
            if (regionPill) {
                regionPill.innerHTML = `<i class="fa-solid fa-earth-americas"></i> ${accessRegionFilter || 'All Regions'}`;
            }

            // Also update filter status bar tags
            updateAccessFilterStatusBar();
        }

        function updateAccessFilterStatusBar() {
            const yearTag = document.getElementById('access-filter-year');
            const regionTag = document.getElementById('access-filter-region');
            const riskTag = document.getElementById('access-filter-risk');

            if (yearTag) {
                yearTag.innerHTML = `<i class="fa-solid fa-calendar"></i> ${accessYear}`;
            }
            if (regionTag) {
                regionTag.innerHTML = `<i class="fa-solid fa-earth-americas"></i> ${accessRegionFilter || 'All Regions'}`;
            }
            if (riskTag) {
                // Get the current risk level filter if any
                const riskFilter = (document.getElementById('access-risk-filter') as HTMLSelectElement)?.value || '';
                riskTag.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i> ${riskFilter || 'All Risk Levels'}`;
            }

            // Update status title based on country selection
            const statusTitle = document.getElementById('access-status-title');
            if (statusTitle) {
                if (selectedCountry) {
                    const country = data.countries.find(c => c.country_code === selectedCountry);
                    statusTitle.textContent = country?.country_name || selectedCountry;
                } else {
                    statusTitle.textContent = 'Cooling Access Gap Analysis';
                }
            }
        }

        function showGlobalAccessDetail() {
            const container = document.querySelector('#access-country-detail .country-detail') as HTMLElement;
            if (!container) return;

            container.innerHTML = `
                <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #f59e0b; margin-bottom: 0.75rem; display: block;"></i>
                    <h4 style="color: #92400e; margin-bottom: 0.5rem;">Select a Country</h4>
                    <p style="font-size: 0.85rem;">Click on any country in the map above to view cooling access gap details and population breakdown.</p>
                </div>
            `;
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
            // CCC Palette for regions
            const regionColors = {
                'Asia': '#E85A4F',
                'Africa': '#E89B8C',
                'Europe': '#3D6B6B',
                'North America': '#8BC34A',
                'South America': '#4A7F7F',
                'Oceania': '#7CB342',
                'Latin America and the Caribbean': '#2D5252',
                'Middle East': '#D88676'
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
            if (status === 'Mentioned') return '#2D5252'; // CCC dark teal - best status
            if (status === 'Not mentioned') return '#E89B8C'; // CCC coral
            if (status === 'No NDC submitted') return '#E85A4F'; // CCC orange-red
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

            // Ocean click handler - deselect country and return to global view
            ndcMapSvg.append('rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', 'transparent')
                .style('cursor', 'pointer')
                .on('click', () => {
                    selectedCountry = null;
                    globalCountryFilter = '';
                    const countrySelect = byId<HTMLSelectElement>('country-filter');
                    if (countrySelect) countrySelect.value = '';
                    clearCountryHighlights();
                    updateViewingBadges();
                    updatePolicyKPIs();
                    showGlobalPolicyDetail();
                });

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
                        // Initialize with GCP view (first tab) - CCC palette
                        const pledge = data.pledge.find(p => p.country_code === code);
                        if (!pledge) return '#e2e8f0';
                        return pledge.signatory === 1 ? '#2D5252' : '#E89B8C';
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
                const statusColor = pledge?.signatory === 1 ? '#2D5252' : '#E89B8C';
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
                        record.mention_status === 'Mentioned' ? '#2D5252' :
                        record.mention_status === 'Not mentioned' ? '#E89B8C' : '#E85A4F';
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
                        Status: <span style="color: #3D6B6B">Has NCAP</span><br>
                        ${ncapRecord.year ? 'Year: ' + ncapRecord.year + '<br>' : ''}
                        Region: ${region}
                    `;
                } else {
                    tooltip.innerHTML = `
                        <strong>${countryName}</strong><br>
                        <span style="color: var(--text-secondary)">National Cooling Action Plan</span><br>
                        Status: <span style="color: #E89B8C">No NCAP</span><br>
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
            // This function is used when NDC view is directly selected
            // Uses the same CCC palette as updatePolicyLegend('ndc')
            byId('ndc-legend').innerHTML = `
                <div class="legend-item">
                    <div class="legend-color" style="background:#2D5252"></div>
                    Mentioned
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#E89B8C"></div>
                    Not Mentioned
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#E85A4F"></div>
                    No NDC Submitted
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
                        ? '#2D5252'
                        : record.mention_status === 'Not mentioned'
                            ? '#E89B8C'
                            : '#E85A4F';
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
                        // Global Cooling Pledge - CCC palette
                        const pledge = data.pledge.find(p => p.country_code === code);
                        if (!pledge) return '#e2e8f0';
                        return pledge.signatory === 1 ? '#2D5252' : '#E89B8C'; // CCC dark teal / coral
                    } else if (mapType === 'ndc') {
                        // NDC Cooling Mentions
                        const countryStatus = getCountryNDCStatus();
                        const status = countryStatus[code];
                        return getNDCColor(status ? status.status : null);
                    } else if (mapType === 'NCAP') {
                        // NCAP Status - countries with NCAP - CCC palette
                        const ncapCountry = data.ncap.find(n => n.country_code === code);
                        return ncapCountry ? '#3D6B6B' : '#E89B8C'; // CCC teal / coral
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
                        <div class="legend-color" style="background:#2D5252"></div>
                        Signatory
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background:#E89B8C"></div>
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
                        <div class="legend-color" style="background:#2D5252"></div>
                        Mentioned
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background:#E89B8C"></div>
                        Not Mentioned
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background:#E85A4F"></div>
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
                        <div class="legend-color" style="background:#3D6B6B"></div>
                        Has NCAP
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background:#E89B8C"></div>
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
                        itemStyle: { color: '#8BC34A' }
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
            updatePolicyKpiTitle();
            updatePolicyMetaPills();
        }

        function updatePolicyKpiTitle() {
            const titleEl = document.getElementById('policy-kpi-title');
            if (!titleEl) return;

            if (selectedCountry) {
                const country = data.countries.find(c => c.country_code === selectedCountry);
                titleEl.innerHTML = `<i class="fa-solid fa-flag"></i> ${country?.country_name || selectedCountry}`;
            } else {
                titleEl.innerHTML = `<i class="fa-solid fa-globe"></i> Global View`;
            }
        }

        function updatePolicyMetaPills() {
            const tabPill = document.getElementById('policy-meta-tab');
            if (tabPill) {
                const tabNames: Record<string, string> = {
                    'gcp': 'Global Cooling Pledge',
                    'ndc': 'NDC Cooling Mentions',
                    'NCAP': 'National Cooling Action Plans'
                };
                tabPill.innerHTML = `<i class="fa-solid fa-file-contract"></i> ${tabNames[policyMapType] || policyMapType}`;
            }

            // Also update filter status bar tags
            updatePolicyFilterStatusBar();
        }

        function updatePolicyFilterStatusBar() {
            const tabTag = document.getElementById('policy-filter-tab');
            const regionTag = document.getElementById('policy-filter-region');

            const tabNames: Record<string, string> = {
                'gcp': 'Global Cooling Pledge',
                'ndc': 'NDC Cooling Mentions',
                'NCAP': 'National Cooling Action Plans'
            };

            if (tabTag) {
                tabTag.innerHTML = `<i class="fa-solid fa-file-contract"></i> ${tabNames[policyMapType] || policyMapType}`;
            }
            if (regionTag) {
                const regionFilter = (document.getElementById('ndc-region-filter') as HTMLSelectElement)?.value || '';
                regionTag.innerHTML = `<i class="fa-solid fa-earth-americas"></i> ${regionFilter || 'All Regions'}`;
            }

            // Update status title based on country selection
            const statusTitle = document.getElementById('policy-status-title');
            if (statusTitle) {
                if (selectedCountry) {
                    const country = data.countries.find(c => c.country_code === selectedCountry);
                    statusTitle.textContent = country?.country_name || selectedCountry;
                } else {
                    statusTitle.textContent = 'Policy Framework Analysis';
                }
            }
        }

        function showGlobalPolicyDetail() {
            const container = document.querySelector('#policy-country-detail .country-detail') as HTMLElement;
            if (!container) return;

            container.innerHTML = `
                <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #22c55e; margin-bottom: 0.75rem; display: block;"></i>
                    <h4 style="color: #166534; margin-bottom: 0.5rem;">Select a Country</h4>
                    <p style="font-size: 0.85rem;">Click on any country in the map above to view policy framework details including GCP, NDC, and NCAP status.</p>
                </div>
            `;
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
                        itemStyle: { color: '#8BC34A' }
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
                        itemStyle: { color: '#8BC34A' }
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
                        <div class="card-panel chart-card">
                            <div class="chart-card-header">
                                <h3><i class="fa-solid fa-chart-bar" style="color: #8BC34A; margin-right: 0.5rem;"></i>Global Cooling Pledge by Region</h3>
                                <p class="chart-subtitle">Signatories vs Non-Signatories</p>
                            </div>
                            <div class="chart-card-body">
                                <div class="chart-container" style="height: 280px;">
                                    <div id="chart-gcp-regions" class="chart-surface"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card-panel chart-card">
                            <div class="chart-card-header">
                                <h3><i class="fa-solid fa-circle-nodes" style="color: #8BC34A; margin-right: 0.5rem;"></i>GCP Signatories & NDC Cooling Mentions</h3>
                                <p class="chart-subtitle">Energy Efficiency in NDC 3.0</p>
                            </div>
                            <div class="chart-card-body">
                                <div class="chart-container" style="height: 280px;">
                                    <div id="chart-gcp-ndc-overlap" class="chart-surface"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="charts-grid-2col">
                        <div class="card-panel chart-card">
                            <div class="chart-card-header">
                                <h3><i class="fa-solid fa-chart-pie" style="color: #3D6B6B; margin-right: 0.5rem;"></i>GCP Signatories by Region</h3>
                                <p class="chart-subtitle">Regional distribution</p>
                            </div>
                            <div class="chart-card-body">
                                <div class="chart-container" style="height: 280px;">
                                    <div id="chart-gcp-timeline" class="chart-surface"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card-panel chart-card">
                            <div class="chart-card-header">
                                <h3><i class="fa-solid fa-layer-group" style="color: #3D6B6B; margin-right: 0.5rem;"></i>Policy Framework Coverage</h3>
                                <p class="chart-subtitle">GCP + NDC Status</p>
                            </div>
                            <div class="chart-card-body">
                                <div class="chart-container" style="height: 280px;">
                                    <div id="chart-policy-coverage" class="chart-surface"></div>
                                </div>
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
                        <div class="card-panel chart-card">
                            <div class="chart-card-header">
                                <h3><i class="fa-solid fa-tags" style="color: #3D6B6B; margin-right: 0.5rem;"></i>NDC Cooling Mentions by Category</h3>
                                <p class="chart-subtitle">Excluding Kigali Amendment</p>
                            </div>
                            <div class="chart-card-body">
                                <div class="chart-container" style="height: 280px;">
                                    <div id="chart-ndc-categories" class="chart-surface"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card-panel chart-card">
                            <div class="chart-card-header">
                                <h3><i class="fa-solid fa-earth-americas" style="color: #3D6B6B; margin-right: 0.5rem;"></i>NDC Status by Region</h3>
                                <p class="chart-subtitle">Countries mentioning cooling</p>
                            </div>
                            <div class="chart-card-body">
                                <div class="chart-container" style="height: 280px;">
                                    <div id="chart-ndc-regions" class="chart-surface"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="charts-grid-2col">
                        <div class="card-panel chart-card">
                            <div class="chart-card-header">
                                <h3><i class="fa-solid fa-code-compare" style="color: #8BC34A; margin-right: 0.5rem;"></i>NDC 3.0 vs Previous NDC</h3>
                                <p class="chart-subtitle">Comparison of cooling mentions</p>
                            </div>
                            <div class="chart-card-body">
                                <div class="chart-container" style="height: 280px;">
                                    <div id="chart-ndc-comparison" class="chart-surface"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card-panel chart-card">
                            <div class="chart-card-header">
                                <h3><i class="fa-solid fa-file-circle-check" style="color: #8BC34A; margin-right: 0.5rem;"></i>NDC Submission Status</h3>
                                <p class="chart-subtitle">Countries by submission status</p>
                            </div>
                            <div class="chart-card-body">
                                <div class="chart-container" style="height: 280px;">
                                    <div id="chart-ndc-submission" class="chart-surface"></div>
                                </div>
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
                        <div class="card-panel chart-card">
                            <div class="chart-card-header">
                                <h3><i class="fa-solid fa-chart-bar" style="color: #3D6B6B; margin-right: 0.5rem;"></i>NCAPs by Region</h3>
                                <p class="chart-subtitle">Countries with National Cooling Action Plans</p>
                            </div>
                            <div class="chart-card-body">
                                <div class="chart-container" style="height: 280px;">
                                    <div id="chart-ncap-regions" class="chart-surface"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card-panel chart-card">
                            <div class="chart-card-header">
                                <h3><i class="fa-solid fa-clock-rotate-left" style="color: #3D6B6B; margin-right: 0.5rem;"></i>NCAP Development Timeline</h3>
                                <p class="chart-subtitle">NCAPs by year of adoption</p>
                            </div>
                            <div class="chart-card-body">
                                <div class="chart-container" style="height: 280px;">
                                    <div id="chart-ncap-timeline" class="chart-surface"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-panel chart-card">
                        <div class="chart-card-header">
                            <h3><i class="fa-solid fa-list-check" style="color: #8BC34A; margin-right: 0.5rem;"></i>Countries with NCAPs</h3>
                            <p class="chart-subtitle">List of countries that have developed National Cooling Action Plans</p>
                        </div>
                        <div class="chart-card-body">
                            <div id="ncap-countries-list" class="ncap-countries-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; padding: 1rem;"></div>
                        </div>
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
                        { value: gcpCount - bothCount, name: 'GCP Only', itemStyle: { color: '#8BC34A' } },
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
            // Sync reactive state for Svelte components
            currentViewState = view;
            headerHeadline = viewMeta[view]?.headline ?? viewMeta.overview.headline;
            headerSubhead = viewMeta[view]?.subhead ?? viewMeta.overview.subhead;
            headerMethodology = viewMeta[view]?.methodology ?? '';
            headerSources = viewMeta[view]?.sources ?? [];
            insightText = viewMeta[view]?.insight ?? viewMeta.overview.insight;
            showPillarInfoBtn = !!pillarInfo[view];
            // Hide header story-box for pillar views (story is now inside each pillar card)
            const pillarViews = ['emissions', 'meps', 'kigali', 'access', 'policy'];
            headerVisible = !pillarViews.includes(view);
            scopeDisabled = view === 'policy' || view === 'access' || view === 'partners';

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
            if (infoBtn) infoBtn.style.display = pillarInfo[view] ? 'inline-flex' : 'none';
            requestAnimationFrame(resizeCharts);
        }

        // Window bridges are exposed in init() after all functions are defined

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
        // pillarInfo: imported as PILLAR_INFO from config.ts
        const pillarInfo = PILLAR_INFO;

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

            // Overview carousel - no auto-rotation, user-controlled
            let carouselIdx = 0;
            const slides = document.querySelectorAll<HTMLElement>('.carousel-slide');
            const tabs = document.querySelectorAll<HTMLButtonElement>('.carousel-tab');
            const totalSlides = slides.length;

            function showSlide(idx: number) {
                carouselIdx = ((idx % totalSlides) + totalSlides) % totalSlides;
                slides.forEach((s, i) => {
                    s.classList.toggle('active', i === carouselIdx);
                    s.classList.toggle('exit', i !== carouselIdx);
                });
                tabs.forEach((t, i) => t.classList.toggle('active', i === carouselIdx));
            }

            document.getElementById('carousel-prev')?.addEventListener('click', () => showSlide(carouselIdx - 1));
            document.getElementById('carousel-next')?.addEventListener('click', () => showSlide(carouselIdx + 1));
            tabs.forEach((t) => {
                t.addEventListener('click', () => showSlide(Number(t.dataset.slide)));
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
        // Expose switchView and setApplianceScope to bridge with Svelte component handlers
        (window as any).__dashboardSwitchView = switchView;
        (window as any).__dashboardSetScope = setApplianceScope;

        async function init() {
            try {
                setStatus('Loading data from Supabase...');
                data = await loadDashboardData(SUPABASE_URL, SUPABASE_KEY);

                // Log loaded table sizes for debugging
                const tables = {
                    countries: data.countries.length,
                    pledge: data.pledge.length,
                    kigali: data.kigali.length,
                    meps: data.meps.length,
                    access: data.access.length,
                    accessForecast: data.accessForecast.length,
                    emissions: data.emissions.length,
                    ndcTracker: data.ndcTracker.length,
                    ncap: data.ncap.length,
                    claspEnergy: data.claspEnergy.length,
                    subcool: data.subcool.length,
                    regions: data.regions.length,
                    refrigerants: data.refrigerants.length
                };
                console.log('Dashboard data loaded:', tables);
                const emptyTables = Object.entries(tables).filter(([, v]) => v === 0).map(([k]) => k);
                if (emptyTables.length > 0) {
                    console.warn('Tables with no data:', emptyTables);
                }

                if (data.countries.length === 0) {
                    setStatus('Warning: No country data loaded. Check browser console for details.', 'error');
                } else {
                    setStatus(`Loaded ${data.countries.length} countries, ${data.access.length} access records`, 'success');
                }
                const updatedText = `Updated: ${new Date().toLocaleDateString()}`;
                setText('last-updated', updatedText);
                // Also fill all pillar story card updated labels
                document.querySelectorAll('.last-updated-label').forEach(el => { el.textContent = updatedText; });
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                setStatus(`Error: ${message}`, 'error');
                console.error('Dashboard load error:', error);
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
            showGlobalAccessDetail();

            // Initialize Product Efficiency (MEPS)
            initMepsFilters();
            updateMepsView();
            showGlobalMepsDetail();

            // Initialize Refrigerant Transition (Kigali)
            initKigaliFilters();
            updateKigaliView();
            showGlobalKigaliDetail();

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
            showGlobalPolicyDetail();

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

  <div class="main-container" class:overview-only={currentViewState === 'overview'}>
    <!-- Left Sidebar (Component) -->
    <Sidebar
      currentView={currentViewState}
      onViewChange={handleViewChange}
      onScopeChange={handleScopeChange}
      {scopeDisabled}
      {activeScope}
    />

    <!-- Main Content -->
    <main class="main-content">
      <Header
        headline={headerHeadline}
        subhead={headerSubhead}
        methodology={headerMethodology}
        sources={headerSources}
        visible={headerVisible}
        showPillarInfo={showPillarInfoBtn}
        onPillarInfoClick={handlePillarInfoClick}
      />

      <!-- Pillar Views (Components) -->
      <OverviewPillar active={currentViewState === 'overview'} onNavigate={handleViewChange} />
      <EmissionsPillar active={currentViewState === 'emissions'} onPillarInfoClick={handlePillarInfoClick} />
      <MepsPillar active={currentViewState === 'meps'} onPillarInfoClick={handlePillarInfoClick} />
      <KigaliPillar active={currentViewState === 'kigali'} onPillarInfoClick={handlePillarInfoClick} />
      <AccessPillar active={currentViewState === 'access'} onPillarInfoClick={handlePillarInfoClick} />
      <PolicyPillar active={currentViewState === 'policy'} onPillarInfoClick={handlePillarInfoClick} />
      <PartnersPillar active={currentViewState === 'partners'} />
    </main>

    <!-- Right Sidebar (Component) -->
    <RightPanel {insightText} />
  </div>

  <div class="tooltip" id="tooltip"></div>

  <!-- Pillar Information Modal (Component) -->
  <PillarModal
    currentView={currentViewState}
    visible={pillarModalVisible}
    onClose={handlePillarModalClose}
  />
</div>

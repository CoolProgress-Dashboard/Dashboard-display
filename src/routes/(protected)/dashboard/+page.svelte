<script lang="ts">
  import { onMount } from 'svelte';
  import '$lib/styles/dashboard.css';
  import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
  import {
    createDefaultData,
    getEmissionsData,
    getNdcRecord,
    loadDashboardData
  } from '$lib/services/dashboard-data';
  import type { Country, DashboardData, EmissionsFilters, NdcFilters } from '$lib/services/dashboard-types';

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
    const SUPABASE_URL = PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = PUBLIC_SUPABASE_ANON_KEY;

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

        // Emissions filters
    let emissionsScenario = 'BAU';
    let emissionsYear = 2024;
    let emissionsAppliance = 'all';

        // NDC Tracker filters
    let ndcType = 'NDC 3.0';
    let ndcCategory = 'Energy Efficiency';

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
      { headline: string; subhead: string; insight: string; sources: { name: string; url: string }[] }
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
          { name: 'IEA Emissions Outlook', url: '#' },
          { name: 'UNEP Cooling Reports', url: '#' },
          { name: 'Cool Coalition Tracker', url: '#' }
        ]
      },
      meps: {
        headline: 'Pillar 2: Product Efficiency',
        subhead: 'Driving Performance via Minimum Energy Performance Standards (MEPS)',
        insight:
          'MEPS adoption remains uneven, especially in fast-growing cooling markets. Harmonized standards can prevent dumping of low-efficiency units.',
        sources: [
          { name: 'U4E Model Regulations', url: '#' },
          { name: 'CLASP Policy Database', url: '#' },
          { name: 'SEforAll Efficiency Hub', url: '#' }
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
        subhead: 'Closing the Gap for the 1.2 Billion at Risk',
        insight:
          'Cooling access gaps are most acute in rapidly urbanizing regions. Targeted finance and resilient grids are critical.',
        sources: [
          { name: 'SEforAll Chilling Prospects', url: '#' },
          { name: 'Heat Action Plans', url: '#' },
          { name: 'World Bank Cooling Data', url: '#' }
        ]
      },
      policy: {
        headline: 'Pillar 5: Policy & Pledge',
        subhead: 'Tracking National Commitments and Action Plans',
        insight:
          'Global Cooling Pledge signatories are growing, but implementation hinges on national policy frameworks and NCAP delivery.',
        sources: [
          { name: 'Cool Coalition Pledge Tracker', url: '#' },
          { name: 'NDC Appliance Toolkit', url: '#' },
          { name: 'NCAP Repository', url: '#' }
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
          (source) =>
            `<a class=\"source-item\" href=\"${source.url}\" target=\"_blank\" rel=\"noreferrer\">${source.name}<i class=\"fa-solid fa-arrow-up-right-from-square\"></i></a>`
        )
        .join('');
    };

    const updateViewingBadges = () => {
      const label = selectedRegion ? selectedRegion : 'Global';
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
            setText('stat-countries', data.countries.length);
            setText('stat-gcp', `${Math.round(pledgeCount/data.countries.length*100)}%`);
            setText('stat-kigali', `${Math.round(kigaliCount/data.kigali.length*100)}%`);
            setText('stat-meps', `${Math.round(mepsCountries/data.countries.length*100)}%`);
            setText('stat-updated', new Date().toLocaleDateString());
        }

        // =====================================================
        // REGION FILTER
        // =====================================================
        function populateRegionFilter() {
            const regions = [...new Set(data.countries.map(c => c.region).filter(Boolean))].sort();
            const select = byId<HTMLSelectElement>('region-filter');
            const flags: Record<string, string> = {
                Africa: '🇳🇬',
                Asia: '🇨🇳',
                Europe: '🇪🇺',
                'North America': '🇺🇸',
                'South America': '🇧🇷',
                Oceania: '🇦🇺',
                'Latin America and the Caribbean': '🌎',
                'Middle East': '🕌'
            };

            select.innerHTML = '<option value=\"\">Global View</option>';
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = String(region);
                option.textContent = `${flags[String(region)] ?? '🌍'} ${region}`;
                select.appendChild(option);
            });
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
            const container = byId('map-container');
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
            byId('legend').innerHTML = `
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
            updateCountryDetail(code);
        }

        function updateCountryDetail(code: string) {
            const country = data.countries.find(c => c.country_code === code);
            if (!country) return;

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

        // =====================================================
        // CHARTS
        // =====================================================
        const charts: Record<string, any> = {};

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
        // EMISSIONS
        // =====================================================
        let emissionsMapSvg: any;

        function getFilteredEmissions() {
            return getEmissionsData(data, getEmissionsFilters());
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

            // Color gradient from green (low) to yellow to red (high)
            if (ratio < 0.25) return '#166534';  // High potential
            if (ratio < 0.5) return '#65a30d';   // Medium
            if (ratio < 0.75) return '#fbbf24';  // Low
            return '#ef4444';                     // Critical
        }

        async function initEmissionsMap() {
            const container = byId('emissions-map-container');
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

        // =====================================================
        // MEPS MAP
        // =====================================================
        let mepsMapSvg: any;

        function getMepsStatus(code: string | undefined) {
            if (!code) return { level: 'critical', label: 'Critical' };

            if (selectedRegion) {
                const country = data.countries.find(c => c.country_code === code);
                if (!country || country.region !== selectedRegion) {
                    return { level: 'none', label: 'No Data' };
                }
            }

            const records = data.meps.filter(m => m.country_code === code);
            if (!records.length) {
                return { level: 'critical', label: 'Critical' };
            }

            const hasMandatory = records.some(r => r.requirement_type === 'Mandatory');
            if (hasMandatory) {
                return { level: 'high', label: 'High/Active' };
            }

            const hasVoluntary = records.some(r => r.requirement_type === 'Voluntary');
            if (hasVoluntary) {
                return { level: 'medium', label: 'Medium/Partial' };
            }

            return { level: 'low', label: 'Low/None' };
        }

        function getMepsColor(level: string) {
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
                        tooltip.innerHTML = `
                            <strong>${country?.country_name || code || 'Unknown'}</strong><br>
                            <span style="color: var(--text-secondary)">MEPS Status: ${status.label}</span>
                        `;
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

        function updateMepsProgress() {
            const setWidth = (id: string, pct: number) => {
                const el = document.getElementById(id);
                if (el) el.style.width = `${pct}%`;
            };

            const codes = new Set(data.countries.map(c => c.country_code));
            const total = codes.size;
            const counts = { high: 0, medium: 0, low: 0, critical: 0 };

            codes.forEach((code) => {
                const status = getMepsStatus(code);
                if (status.level === 'high') counts.high += 1;
                else if (status.level === 'medium') counts.medium += 1;
                else if (status.level === 'low') counts.low += 1;
                else if (status.level === 'critical') counts.critical += 1;
            });

            if (!total) {
                setWidth('meps-progress-high', 0);
                setWidth('meps-progress-medium', 0);
                setWidth('meps-progress-low', 0);
                setWidth('meps-progress-critical', 0);
                return;
            }

            setWidth('meps-progress-high', (counts.high / total) * 100);
            setWidth('meps-progress-medium', (counts.medium / total) * 100);
            setWidth('meps-progress-low', (counts.low / total) * 100);
            setWidth('meps-progress-critical', (counts.critical / total) * 100);
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
        // ACCESS MAP
        // =====================================================
        let accessMapSvg: any;

        function getAccessTotals() {
            const totals: Record<string, number> = {};
            data.access.forEach((record) => {
                const value = parseFloat(String(record.population_without_cooling)) || 0;
                if (!totals[record.country_code]) {
                    totals[record.country_code] = 0;
                }
                totals[record.country_code] += value;
            });
            return totals;
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

        async function initAccessMap() {
            const container = document.getElementById('access-map-container');
            if (!container) return;

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
                const accessTotals = getAccessTotals();
                const maxValue = Math.max(...Object.values(accessTotals), 1);

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
                        if (value === undefined) return '#e2e8f0';
                        const level = getAccessLevel(value, maxValue).level;
                        return getAccessColor(level);
                    })
                    .on('mouseover', (event: MouseEvent, d: any) => {
                        const code = countryIdToCode[normalizeId(d.id)];
                        if (!code) return;
                        const country = data.countries.find(c => c.country_code === code);
                        const accessTotals = getAccessTotals();
                        const maxValue = Math.max(...Object.values(accessTotals), 1);
                        const value = accessTotals[code] || 0;
                        const level = getAccessLevel(value, maxValue);
                        const valueLabel = value ? `${(value / 1e9).toFixed(2)} Bn` : 'No data';

                        tooltip.innerHTML = `
                            <strong>${country?.country_name || code}</strong><br>
                            <span style="color: var(--text-secondary)">Gap: ${level.label}</span><br>
                            Population without cooling: ${valueLabel}
                        `;
                        tooltip.style.opacity = 1;
                        tooltip.style.left = (event.pageX + 10) + 'px';
                        tooltip.style.top = (event.pageY + 10) + 'px';
                    })
                    .on('mouseout', handleOut)
                    .on('click', handleClick);

                updateAccessLegend();
                updateAccessProgress();
                updateViewingBadges();
            } catch (error) {
                console.error('Access map error:', error);
            }
        }

        function updateAccessMap() {
            if (!accessMapSvg) return;
            const accessTotals = getAccessTotals();
            const maxValue = Math.max(...Object.values(accessTotals), 1);

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
                    if (value === undefined) return '#e2e8f0';
                    const level = getAccessLevel(value, maxValue).level;
                    return getAccessColor(level);
                });

            updateAccessLegend();
            updateAccessProgress();
            updateViewingBadges();
        }

        function updateAccessLegend() {
            const legend = document.getElementById('access-legend');
            if (!legend) return;
            legend.innerHTML = `
                <div class="legend-item">
                    <div class="legend-color" style="background:#991b1b"></div>
                    Critical Gap
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#dc2626"></div>
                    High Gap
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#f97316"></div>
                    Medium Gap
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#22c55e"></div>
                    Low Gap
                </div>
            `;
        }

        function updateAccessProgress() {
            const setWidth = (id: string, pct: number) => {
                const el = document.getElementById(id);
                if (el) el.style.width = `${pct}%`;
            };

            const accessTotals = getAccessTotals();
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

        function handleEmissionsHover(event: MouseEvent, d: any) {
            const code = countryIdToCode[normalizeId(d.id)];
            if (!code) {
                tooltip.innerHTML = `<em>Unknown country</em>`;
                tooltip.style.opacity = 1;
                tooltip.style.left = (event.pageX + 10) + 'px';
                tooltip.style.top = (event.pageY + 10) + 'px';
                return;
            }

            const countryEmissions = getCountryEmissions();
            const emissions = countryEmissions[code];

            if (!emissions) {
                tooltip.innerHTML = `<strong>${code}</strong><br><em>No emissions data</em>`;
            } else {
                tooltip.innerHTML = `
                    <strong>${emissions.name}</strong><br>
                    <span style="color: var(--text-secondary)">Scenario: ${emissionsScenario} | Year: ${emissionsYear}</span><br>
                    Total: ${emissions.total.toFixed(4)} Mt CO2e<br>
                    Direct: ${emissions.direct.toFixed(4)} Mt<br>
                    Indirect: ${emissions.indirect.toFixed(4)} Mt
                `;
            }

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

                const countryStatus = getCountryNDCStatus();

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
                        const status = countryStatus[code];
                        return getNDCColor(status ? status.status : null);
                    })
                    .on('mouseover', handleNDCHover)
                    .on('mouseout', handleOut)
                    .on('click', handleClick);

                updateNDCLegend();
                updateNDCProgress();
            } catch (error) {
                console.error('NDC map error:', error);
            }
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

        function initNDCCharts() {
            // NDC Mentions by Category Chart
            const categories = ['Energy Efficiency', 'Air Conditioners', 'Refrigerators & freezers',
                               'Kigali Amendment', 'Appliance MEPS', 'Appliance Labels'];

            const mentionedCounts = categories.map(cat => {
                return data.ndcTracker.filter(n =>
                    n.ndc_type === ndcType &&
                    n.category === cat &&
                    n.mention_value === 1
                ).length;
            });

            const notMentionedCounts = categories.map(cat => {
                return data.ndcTracker.filter(n =>
                    n.ndc_type === ndcType &&
                    n.category === cat &&
                    n.mention_status === 'Not mentioned'
                ).length;
            });

            setChart('chart-ndc-categories', {
                tooltip: { trigger: 'axis' },
                legend: { textStyle: { color: '#475569' } },
                grid: baseGrid,
                xAxis: categoryAxis(categories),
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
                grid: baseGrid,
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
        }

        function updateNDCCharts() {
            // Update categories chart
            const categories = ['Energy Efficiency', 'Air Conditioners', 'Refrigerators & freezers',
                               'Kigali Amendment', 'Appliance MEPS', 'Appliance Labels'];

            const mentionedCounts = categories.map(cat => {
                return data.ndcTracker.filter(n =>
                    n.ndc_type === ndcType &&
                    n.category === cat &&
                    n.mention_value === 1
                ).length;
            });

            const notMentionedCounts = categories.map(cat => {
                return data.ndcTracker.filter(n =>
                    n.ndc_type === ndcType &&
                    n.category === cat &&
                    n.mention_status === 'Not mentioned'
                ).length;
            });

            setChart('chart-ndc-categories', {
                tooltip: { trigger: 'axis' },
                legend: { textStyle: { color: '#475569' } },
                grid: baseGrid,
                xAxis: categoryAxis(categories),
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
                grid: baseGrid,
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
        }

        // =====================================================
        // VIEW NAVIGATION
        // =====================================================
        function switchView(view: string | undefined) {
            if (!view) return;
            currentView = view;
            const container = document.querySelector<HTMLElement>('.main-container');
            if (container) {
                container.classList.toggle('overview-only', view === 'overview');
            }
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            byId(`view-${view}`).classList.add('active');
            document.querySelectorAll<HTMLElement>('.nav-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === view);
            });
            updateSidePanels(view);
            updateViewingBadges();
            requestAnimationFrame(resizeCharts);
        }

        // =====================================================
        // EVENT HANDLERS
        // =====================================================
        function setupEventHandlers() {
            // Navigation
            document.querySelectorAll<HTMLButtonElement>('.nav-btn').forEach(btn => {
                btn.addEventListener('click', () => switchView(btn.dataset.view));
            });

            document.querySelectorAll<HTMLButtonElement>('.scope-btn').forEach((btn) => {
                btn.addEventListener('click', () => setApplianceScope(btn.dataset.scope ?? 'ac'));
            });

            document.querySelectorAll<HTMLButtonElement>('.cta-btn').forEach((btn) => {
                btn.addEventListener('click', () => switchView(btn.dataset.view));
            });

            // Map indicator
            const mapIndicator = document.getElementById('map-indicator') as HTMLSelectElement | null;
            if (mapIndicator) {
                mapIndicator.addEventListener('change', () => {
                    currentIndicator = mapIndicator.value as Indicator;
                    updateMap();
                });
            }

            // Region filter
            const regionFilter = byId<HTMLSelectElement>('region-filter');
            regionFilter.addEventListener('change', () => {
                selectedRegion = regionFilter.value;
                updateMap();
                updateMepsMap();
                updateKigaliMap();
                updateAccessMap();
                updateViewingBadges();
            });

            // Emissions filters
            const emissionsScenarioSelect = document.getElementById('emissions-scenario') as HTMLSelectElement | null;
            if (emissionsScenarioSelect) {
                emissionsScenarioSelect.addEventListener('change', () => {
                    emissionsScenario = emissionsScenarioSelect.value;
                    updateEmissionsMap();
                });
            }

            const emissionsYearSelect = document.getElementById('emissions-year') as HTMLSelectElement | null;
            if (emissionsYearSelect) {
                emissionsYearSelect.addEventListener('change', () => {
                    emissionsYear = Number(emissionsYearSelect.value);
                    updateEmissionsMap();
                });
            }

            const emissionsApplianceSelect = document.getElementById('emissions-appliance') as HTMLSelectElement | null;
            if (emissionsApplianceSelect) {
                emissionsApplianceSelect.addEventListener('change', () => {
                    emissionsAppliance = emissionsApplianceSelect.value;
                    const scope = applianceToScope[emissionsAppliance] ?? 'ac';
                    document.querySelectorAll<HTMLButtonElement>('.scope-btn').forEach((btn) => {
                        btn.classList.toggle('active', btn.dataset.scope === scope);
                    });
                    updateEmissionsMap();
                });
            }

            // Timeline scenario selector
            const emissionsTimelineScenario = document.getElementById('emissions-timeline-scenario') as HTMLSelectElement | null;
            if (emissionsTimelineScenario) {
                emissionsTimelineScenario.addEventListener('change', () => {
                    initEmissionsTimeline();
                });
            }

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
        }

        // =====================================================
        // INITIALIZATION
        // =====================================================
        async function init() {
            try {
                setStatus('Loading data from Supabase...');
                data = await loadDashboardData(SUPABASE_URL, SUPABASE_KEY);
                setStatus(`Loaded ${data.countries.length} countries`, 'success');
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
            populateRegionFilter();
            await initMap();
            await initMepsMap();
            await initKigaliMap();
            await initAccessMap();
            initCharts();

            // Initialize emissions
            populateEmissionsYears();
            await initEmissionsMap();
            initEmissionsCharts();
            updateEmissionsKPIs();

            // Initialize NDC Tracker
            await initNDCMap();
            initNDCCharts();
            updateNDCKPIs();

            setupEventHandlers();
            setApplianceScope('ac');
            updateSidePanels('overview');
            requestAnimationFrame(resizeCharts);
            window.addEventListener('resize', resizeCharts);
        }

        init();

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
        <label class="filter-label" for="region-filter">Priority Region</label>
        <select id="region-filter" class="filter-select">
          <option value="">Global View</option>
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
          <span>5. Policy &amp; Pledge</span>
        </button>
      </div>

      <div class="sidebar-footer">
        <p>Aligned with Data from:</p>
        <p class="footer-strong">IEA • CLASP • U4E • Cool Coalition</p>
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
          <button class="download-btn" type="button">
            <i class="fa-solid fa-download"></i>
            Download Report
          </button>
        </div>
      </header>
            <!-- Overview View -->
            <section id="view-overview" class="view-section active">
                <div class="overview-grid">
                    <div class="overview-kpis">
                        <div class="kpi-tile">
                            <p class="kpi-title">Climate Impact</p>
                            <div class="kpi-value" id="kpi-climate">-</div>
                            <p class="kpi-subtitle">of Global Emissions</p>
                            <p class="kpi-note">Driven by indirect energy &amp; refrigerants.</p>
                        </div>
                        <div class="kpi-tile">
                            <p class="kpi-title">Installed Capacity</p>
                            <div class="kpi-value highlight-blue" id="kpi-capacity">-</div>
                            <p class="kpi-subtitle">AC Units by 2050</p>
                            <p class="kpi-note">Stock doubling from current ~1.5bn.</p>
                        </div>
                        <div class="kpi-tile">
                            <p class="kpi-title">Access Gap</p>
                            <div class="kpi-value highlight-red" id="kpi-access">-</div>
                            <p class="kpi-subtitle">People at High Risk</p>
                            <p class="kpi-note">Lack access to adequate cooling.</p>
                        </div>
                    </div>

                    <div class="overview-map-stack">
                        <div class="card-panel map-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-earth-africa"></i>
                                Global Cooling Emission Reduction Potential (2025-2050)
                            </div>
                        </div>
                            <div id="map-container" class="map-surface"></div>
                            <div class="legend legend-row" id="legend"></div>
                        </div>

                        <div class="card-panel country-card">
                            <h3>Selected Country</h3>
                            <div class="country-detail" id="country-detail">
                                <h4 id="detail-name">Select a country</h4>
                                <p class="side-muted">Click on a country in the map to see details.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="overview-cta">
                    <div class="cta-content">
                        <h2>Explore the 5 Pillars of Transition</h2>
                        <p>
                            This dashboard aggregates authoritative data from the Cool Coalition, IEA, and CLASP to
                            track global progress toward sustainable cooling.
                        </p>
                    </div>
                    <div class="cta-actions">
                        <button class="cta-btn primary" data-view="emissions" type="button">
                            Start with Emissions
                        </button>
                        <button class="cta-btn ghost" data-view="access" type="button">
                            View Access Gap
                        </button>
                    </div>
                </div>
            </section>

            <!-- MEPS View -->
            <section id="view-meps" class="view-section">
                <div class="pillar-stack">
                    <div class="card-panel map-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-bolt"></i>
                                AC MEPS Level (Global)
                            </div>
                            <span class="viewing-pill">Viewing: <strong id="meps-viewing">Global</strong></span>
                        </div>
                        <div id="meps-map-container" class="map-surface"></div>
                        <div class="legend legend-row">
                            <span class="legend-label">MEPS Status:</span>
                            <div id="meps-legend" class="legend-items"></div>
                        </div>
                        <div class="progress-bar" id="meps-progress">
                            <span class="progress-segment high" id="meps-progress-high"></span>
                            <span class="progress-segment medium" id="meps-progress-medium"></span>
                            <span class="progress-segment low" id="meps-progress-low"></span>
                            <span class="progress-segment critical" id="meps-progress-critical"></span>
                        </div>
                        <div class="country-card-inline">
                            <h3>Selected Country</h3>
                            <div class="country-detail">
                                <h4>Select a country</h4>
                                <p class="side-muted">Click on a country in the map to see details.</p>
                            </div>
                        </div>
                    </div>

                    <div class="card-panel">
                        <h3>Regional MEPS Level Trend (2020-2050)</h3>
                        <p class="chart-subtitle">AC • Global</p>
                        <div class="chart-container" style="height: 320px;">
                            <div id="chart-meps-region" class="chart-surface"></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Kigali View -->
            <section id="view-kigali" class="view-section">
                <div class="pillar-stack">
                    <div class="card-panel map-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-flask"></i>
                                Average AC Refrigerant GWP
                            </div>
                            <span class="viewing-pill">Viewing: <strong id="kigali-viewing">Global</strong></span>
                        </div>
                        <div id="kigali-map-container" class="map-surface"></div>
                        <div class="legend legend-row">
                            <span class="legend-label">GWP Level:</span>
                            <div id="kigali-legend" class="legend-items"></div>
                        </div>
                        <div class="progress-bar" id="kigali-progress">
                            <span class="progress-segment high" id="kigali-progress-high"></span>
                            <span class="progress-segment medium" id="kigali-progress-medium"></span>
                            <span class="progress-segment low" id="kigali-progress-low"></span>
                            <span class="progress-segment critical" id="kigali-progress-critical"></span>
                        </div>
                        <div class="country-card-inline">
                            <h3>Selected Country</h3>
                            <div class="country-detail">
                                <h4>Select a country</h4>
                                <p class="side-muted">Click on a country in the map to see details.</p>
                            </div>
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
                    <div class="card-panel map-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-people-roof"></i>
                                Cooling Access Gap (Global)
                            </div>
                            <span class="viewing-pill">Viewing: <strong id="access-viewing">Global</strong></span>
                        </div>
                        <div id="access-map-container" class="map-surface"></div>
                        <div class="legend legend-row">
                            <span class="legend-label">Cooling Access Gap:</span>
                            <div id="access-legend" class="legend-items"></div>
                        </div>
                        <div class="progress-bar access-progress">
                            <span class="progress-segment access-low" id="access-progress-low"></span>
                            <span class="progress-segment access-medium" id="access-progress-medium"></span>
                            <span class="progress-segment access-high" id="access-progress-high"></span>
                            <span class="progress-segment access-critical" id="access-progress-critical"></span>
                        </div>
                        <div class="country-card-inline">
                            <h3>Selected Country</h3>
                            <div class="country-detail">
                                <h4>Select a country</h4>
                                <p class="side-muted">Click on a country in the map to see details.</p>
                            </div>
                        </div>
                    </div>

                    <div class="card-panel">
                        <h3>Population at High Thermal Risk (Billions)</h3>
                        <p class="chart-subtitle">AC • Global</p>
                        <div class="chart-container" style="height: 320px;">
                            <div id="chart-access-risk" class="chart-surface"></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Policy View - NDC Tracker -->
            <section id="view-policy" class="view-section">
                <div class="pillar-stack">
                    <div class="card-panel map-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-scale-balanced"></i>
                                National Cooling Policy Status (NDC View)
                            </div>
                            <span class="viewing-pill">Viewing: <strong id="policy-viewing">Global</strong></span>
                        </div>
                        <div class="policy-tabs">
                            <button class="tab-btn active" type="button">NDC</button>
                            <button class="tab-btn" type="button">NCAP</button>
                            <button class="tab-btn" type="button">Kigali</button>
                            <button class="tab-btn" type="button">Building Code</button>
                        </div>
                        <div id="ndc-map-container" class="map-surface"></div>
                        <div class="legend legend-row">
                            <span class="legend-label">Pledge Status:</span>
                            <div id="ndc-legend" class="legend-items"></div>
                        </div>
                        <div class="progress-bar ndc-progress">
                            <span class="progress-segment ndc-mentioned" id="ndc-progress-mentioned"></span>
                            <span class="progress-segment ndc-not" id="ndc-progress-not"></span>
                            <span class="progress-segment ndc-no-ndc" id="ndc-progress-no-ndc"></span>
                            <span class="progress-segment ndc-no-data" id="ndc-progress-no-data"></span>
                        </div>
                        <div class="country-card-inline">
                            <h3>Selected Country</h3>
                            <div class="country-detail">
                                <h4>Select a country</h4>
                                <p class="side-muted">Click on a country in the map to see details.</p>
                            </div>
                        </div>
                    </div>

                    <div class="card-panel">
                        <h3>Global Cooling Pledge Signatories</h3>
                        <p class="chart-subtitle">AC • Global</p>
                        <div class="chart-container" style="height: 320px;">
                            <div id="chart-policy-pledge" class="chart-surface"></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Emissions View -->
            <section id="view-emissions" class="view-section">
                <div class="pillar-stack">
                    <div class="card-panel map-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-earth-americas"></i>
                                Global Cooling Emission Reduction Potential (2025-2050)
                            </div>
                            <span class="viewing-pill">Viewing: <strong id="emissions-viewing">Global</strong></span>
                        </div>
                        <div id="emissions-map-container" class="map-surface"></div>
                        <div class="legend legend-row">
                            <span class="legend-label">Emission Reduction Potential:</span>
                            <div id="emissions-legend" class="legend-items"></div>
                        </div>
                        <div class="progress-bar" id="emissions-progress">
                            <span class="progress-segment high" id="progress-high"></span>
                            <span class="progress-segment medium" id="progress-medium"></span>
                            <span class="progress-segment low" id="progress-low"></span>
                            <span class="progress-segment critical" id="progress-critical"></span>
                        </div>
                        <div class="country-card-inline">
                            <h3>Selected Country</h3>
                            <div class="country-detail">
                                <h4>Select a country</h4>
                                <p class="side-muted">Click on a country in the map to see details.</p>
                            </div>
                        </div>
                    </div>

                    <div class="card-panel">
                        <h3>Cooling Sector Emissions Trajectory</h3>
                        <p class="chart-subtitle" id="emissions-chart-sub">AC • Global</p>
                        <div class="chart-container" style="height: 320px;">
                            <div id="chart-emissions-timeline" class="chart-surface"></div>
                        </div>
                    </div>
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
                        <span class="label">Total Countries</span>
                        <span id="stat-countries">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">GCP Coverage</span>
                        <span id="stat-gcp">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">Kigali Coverage</span>
                        <span id="stat-kigali">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">MEPS Coverage</span>
                        <span id="stat-meps">-</span>
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
</div>

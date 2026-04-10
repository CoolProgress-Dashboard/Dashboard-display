<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { VIEW_META,
    CLASP_SCENARIOS, CLASP_SCENARIO_NAMES, CLASP_APPLIANCES, CLASP_APPLIANCE_SHORT,
    HEAT_SCENARIOS, HEAT_SCENARIO_NAMES, HEAT_SUBSECTOR_SHORT,
    SUPABASE_URL, SUPABASE_KEY
  } from '$lib/components/shared/config';
  import { SEQ, APPLIANCE, EMISSION_APPLIANCE, ACCESS_RISK, SCENARIO, EMISSION, SAVINGS, STATUS, CHROME, NO_DATA, YES, NO, rgba } from '$lib/components/shared/colors';
  import { loadDashboardData } from '$lib/services/dashboard-data';
  import AnimatedCounter from '$lib/components/hero/AnimatedCounter.svelte';
  import ApplianceGrowthChart from '$lib/components/charts/ApplianceGrowthChart.svelte';
  import { pillarContent } from '$lib/data/pillar-content';
  import { partners } from '$lib/data/partner-data';
  import PillarHeader from '$lib/components/shared/PillarHeader.svelte';
  import PillarInsight from '$lib/components/shared/PillarInsight.svelte';
  import FurtherReading from '$lib/components/shared/FurtherReading.svelte';
  import { globalCoolingPledge } from '$lib/data/partner-data';

  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;
  // Data props — passed from dashboard sub-route pages
  export let claspEnergy: any[] = [];
  export let subcool: any[] = [];
  export let countries: any[] = [];
  export let emissions: any[] = [];
  export let regions: any[] = [];
  export let emissionsYear: number = 2030;
  export let emissionsAppliances: string[] = ['Air Conditioning', 'Ceiling and Portable Fans', 'Refrigerator-Freezers'];

  // Exposed apply function — assigned after D3 init so reactive block can call it
  let _applyEmissionsCountry: ((code: string | null) => void) | null = null;

  // React to URL country changes (sidebar selection)
  // IMPORTANT: applyEmissionsCountry must NOT call goto() to avoid reactive loop
  $: {
    const _code = $page?.url?.searchParams?.get('country') ?? null;
    if (_applyEmissionsCountry) _applyEmissionsCountry(_code);
  }

  const meta = VIEW_META.emissions;
  const emissionsContent = pillarContent.emissions;

  // Animated stat cards data
  const emissionsStats = [
    {
      value: '2,401',
      label: 'Mt CO₂e from cooling today',
      context: 'Total cooling emissions in 2025: AC (1,741 Mt), Refrigeration (440 Mt), Fans (220 Mt). Sources: HEAT Global Cooling Model + CLASP.'
    },
    {
      value: '6,009',
      label: 'Mt CO₂e by 2050 under BAU',
      context: 'Business-as-usual trajectory: emissions triple as cooling demand in South Asia, Africa, and SE Asia surges without efficiency interventions.'
    },
    {
      value: '73%',
      label: 'reduction achievable (DECARB)',
      context: 'Three-layer DECARB pathway: energy efficiency (MEPS) + Kigali refrigerant transition + grid decarbonization = 1,554 Mt by 2050.'
    },
    {
      value: '460',
      label: 'Gt CO₂e cumulative savings potential',
      context: 'IEA Efficient Cooling Scenario: combining all interventions could avoid 460 Gt CO₂e cumulative emissions by 2060.'
    }
  ];

  // Chart highlights
  const chartHighlights = [
    {
      icon: 'fa-chart-area',
      title: 'Emissions Trajectory',
      description: 'BAU vs DECARB pathways with savings decomposition',
      color: '#C25B33'
    },
    {
      icon: 'fa-layer-group',
      title: 'Savings Decomposition',
      description: 'Split savings into efficiency (MEPS) vs grid decarbonization',
      color: '#52B788'
    },
    {
      icon: 'fa-earth-americas',
      title: 'Country Deep-Dive',
      description: 'Click any country to see direct, indirect, and appliance breakdown',
      color: '#2D7D5A'
    }
  ];

  // Partners: CCC first, HEAT last
  const emissionsPartnerIds = ['ccc', 'clasp', 'u4e', 'iea', 'cool-coalition', 'heat'];
  const emissionsPartners = emissionsPartnerIds
    .map(id => partners.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  let revealed = false;

  onMount(() => {
    const revealTimer = setTimeout(() => { revealed = true; }, 150);

    // =========================================================
    // EMISSIONS PILLAR — SELF-CONTAINED INITIALIZATION
    // All map, chart, and event-handler setup lives here so the
    // component is fully independent of the legacy page.
    // =========================================================

    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existing && existing.dataset.loaded) { resolve(); return; }
        const script = existing || document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => { script.dataset.loaded = 'true'; resolve(); };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        if (!existing) document.head.appendChild(script);
      });

    // ---- local state ----
    let emissionsMapSvg: any = null;
    let emissionsScenario = 'BAU';
    let localEmissionsYear = emissionsYear;
    let localEmissionsAppliances: string[] = [...emissionsAppliances];
    let emissionsDataSource: 'clasp' | 'subcool' = 'clasp';
    let emissionsRegion = '';
    let emissionsType: 'total' | 'direct' | 'indirect' = 'total';
    let selectedCountry: string | null = null;
    let localClaspEnergy: any[] = claspEnergy;
    let subcoolData: any[] = [];
    let regionsData: any[] = [];
    let countriesData: any[] = [];
    let emissionsCountryLineChart: any = null;
    let emissionsCountryPieChart: any = null;
    const charts: Record<string, any> = {};
    const chartObservers: Map<string, ResizeObserver> = new Map();

    // ---- cleanup tracking ----
    let d3: any = null;

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

    function normalizeId(id: string | number | null | undefined): string {
      if (id === undefined || id === null) return '';
      const num = parseInt(String(id), 10);
      if (isNaN(num)) return String(id);
      return String(num);
    }

    // ---- data helpers ----

    function getCountryRegion(code: string): string {
      const rec = regionsData.find((r: any) => r.country_code === code);
      return rec?.region || '';
    }

    function getClaspCO2(record: any, scenario: string): number {
      switch (scenario) {
        case 'BAU': return record.bau_co2_mt || 0;
        case 'GB':  return record.gb_co2_mt  || 0;
        case 'NZH': return record.nzh_co2_mt || 0;
        case 'BAT': return record.bat_co2_mt  || 0;
        default:    return record.bau_co2_mt  || 0;
      }
    }

    function getFilteredClaspData() {
      return localClaspEnergy.filter((r: any) => {
        if (r.year !== localEmissionsYear) return false;
        if (!(localEmissionsAppliances.length === 0 || localEmissionsAppliances.includes(r.appliance))) return false;
        if (emissionsRegion) {
          if (getCountryRegion(r.country_code) !== emissionsRegion) return false;
        }
        return true;
      });
    }

    function getFilteredSubcoolData() {
      return subcoolData.filter((r: any) => {
        if (r.year !== localEmissionsYear) return false;
        if (r.scenario_name !== emissionsScenario) return false;
        if (emissionsRegion) {
          if (getCountryRegion(r.country_code) !== emissionsRegion) return false;
        }
        return true;
      });
    }

    function getClaspEmissionsByCountry(): Record<string, { name: string; total: number; byAppliance: Record<string, number> }> {
      const filtered = getFilteredClaspData();
      const result: Record<string, { name: string; total: number; byAppliance: Record<string, number> }> = {};
      filtered.forEach((r: any) => {
        const co2 = getClaspCO2(r, emissionsScenario);
        if (!result[r.country_code]) result[r.country_code] = { name: r.country_name, total: 0, byAppliance: {} };
        result[r.country_code].total += co2;
        result[r.country_code].byAppliance[r.appliance] = (result[r.country_code].byAppliance[r.appliance] || 0) + co2;
      });
      return result;
    }

    function getSubcoolEmissionsByCountry(): Record<string, { name: string; total: number; direct: number; indirect: number; bySubsector: Record<string, { direct: number; indirect: number }> }> {
      const filtered = getFilteredSubcoolData();
      const result: Record<string, { name: string; total: number; direct: number; indirect: number; bySubsector: Record<string, { direct: number; indirect: number }> }> = {};
      filtered.forEach((r: any) => {
        const direct = r.direct_emission_mt || 0;
        const indirect = r.indirect_emission_mt || 0;
        if (!result[r.country_code]) result[r.country_code] = { name: r.country_name, total: 0, direct: 0, indirect: 0, bySubsector: {} };
        result[r.country_code].total += direct + indirect;
        result[r.country_code].direct += direct;
        result[r.country_code].indirect += indirect;
        if (!result[r.country_code].bySubsector[r.subsector]) result[r.country_code].bySubsector[r.subsector] = { direct: 0, indirect: 0 };
        result[r.country_code].bySubsector[r.subsector].direct += direct;
        result[r.country_code].bySubsector[r.subsector].indirect += indirect;
      });
      return result;
    }

    function getEmissionsTotals() {
      if (emissionsDataSource === 'clasp') {
        const byCountry = getClaspEmissionsByCountry();
        let total = 0;
        const byAppliance: Record<string, number> = {};
        CLASP_APPLIANCES.forEach((a: string) => (byAppliance[a] = 0));
        Object.values(byCountry).forEach((c) => {
          total += c.total;
          Object.entries(c.byAppliance).forEach(([app, val]) => {
            byAppliance[app] = (byAppliance[app] || 0) + (val as number);
          });
        });
        return { total, byAppliance, countriesCount: Object.keys(byCountry).length };
      } else {
        const byCountry = getSubcoolEmissionsByCountry();
        let total = 0, direct = 0, indirect = 0;
        const bySubsector: Record<string, { direct: number; indirect: number }> = {};
        Object.values(byCountry).forEach((c) => {
          total += c.total; direct += c.direct; indirect += c.indirect;
          Object.entries(c.bySubsector).forEach(([sub, val]) => {
            if (!bySubsector[sub]) bySubsector[sub] = { direct: 0, indirect: 0 };
            bySubsector[sub].direct += (val as any).direct;
            bySubsector[sub].indirect += (val as any).indirect;
          });
        });
        return { total, direct, indirect, bySubsector, countriesCount: Object.keys(byCountry).length };
      }
    }

    function getEmissionsColor(value: number, maxValue: number): string {
      if (!value || value === 0) return NO_DATA;
      const logValue = Math.log10(value + 1);
      const logMax = Math.log10(maxValue + 1);
      const ratio = logValue / logMax;
      if (ratio < 0.25) return ACCESS_RISK[0]; // very light cream
      if (ratio < 0.5)  return ACCESS_RISK[2]; // gold
      if (ratio < 0.75) return ACCESS_RISK[4]; // mid orange
      return ACCESS_RISK[6];                    // deep red
    }

    // ---- ECharts helpers ----

    const getChartEl = (id: string) => document.getElementById(id) as HTMLDivElement | null;

    function setChart(id: string, option: any, echartsLib: any) {
      const el = getChartEl(id);
      if (!el) return;
      let needsInit = !charts[id];
      if (!needsInit && charts[id].getDom && charts[id].getDom() !== el) {
        if (chartObservers.has(id)) { chartObservers.get(id)!.disconnect(); chartObservers.delete(id); }
        charts[id].dispose(); needsInit = true;
      }
      if (needsInit) {
        el.style.width = '';
        if (!el.style.height) el.style.height = el.style.minHeight || '280px';
        void el.offsetWidth;
        charts[id] = echartsLib.init(el);
        const obs = new ResizeObserver(() => {
          if (!charts[id]) return;
          const w = el.clientWidth;
          const h = el.clientHeight || parseInt(el.style.minHeight) || 280;
          if (w > 10 && h > 10) charts[id].resize({ width: w, height: h });
        });
        obs.observe(el);
        chartObservers.set(id, obs);
      }
      charts[id].setOption(option, true);
    }

    // ---- map coloring helpers ----

    function getCountryValuesForMap(): Record<string, number> {
      const countryValues: Record<string, number> = {};
      if (emissionsDataSource === 'clasp') {
        const data = localClaspEnergy.filter((r: any) => {
          if (r.year !== localEmissionsYear) return false;
          if (!localEmissionsAppliances.includes(r.appliance)) return false;
          if (emissionsRegion && getCountryRegion(r.country_code) !== emissionsRegion) return false;
          return true;
        });
        data.forEach((r: any) => {
          const co2 = getClaspCO2(r, emissionsScenario);
          countryValues[r.country_code] = (countryValues[r.country_code] || 0) + co2;
        });
      } else {
        const data = subcoolData.filter((r: any) => {
          if (r.year !== localEmissionsYear) return false;
          if (r.scenario_name !== emissionsScenario) return false;
          if (emissionsRegion && getCountryRegion(r.country_code) !== emissionsRegion) return false;
          return true;
        });
        data.forEach((r: any) => {
          const direct = r.direct_emission_mt || 0;
          const indirect = r.indirect_emission_mt || 0;
          if (!countryValues[r.country_code]) countryValues[r.country_code] = 0;
          if (emissionsType === 'direct') countryValues[r.country_code] += direct;
          else if (emissionsType === 'indirect') countryValues[r.country_code] += indirect;
          else countryValues[r.country_code] += direct + indirect;
        });
      }
      return countryValues;
    }

    // ---- map UI updates ----

    function updateEmissionsLegend() {
      const el = document.getElementById('emissions-legend');
      if (!el) return;
      el.innerHTML = `
        <div class="legend-item"><div class="legend-color" style="background:${ACCESS_RISK[0]}"></div>Low</div>
        <div class="legend-item"><div class="legend-color" style="background:${ACCESS_RISK[2]}"></div>Medium</div>
        <div class="legend-item"><div class="legend-color" style="background:${ACCESS_RISK[4]}"></div>High</div>
        <div class="legend-item"><div class="legend-color" style="background:${ACCESS_RISK[6]}"></div>Very High</div>
        <div class="legend-item"><div class="legend-color" style="background:${NO_DATA}"></div>No Data</div>
      `;
    }

    function updateNewEmissionsLegend(maxValue: number) {
      const container = document.getElementById('emissions-legend');
      if (!container) return;
      const thresholds = [0.25, 0.5, 0.75, 1.0];
      const colors = [ACCESS_RISK[0], ACCESS_RISK[2], ACCESS_RISK[4], ACCESS_RISK[6]];
      const labels = ['Low', 'Medium', 'High', 'Very High'];
      container.innerHTML = thresholds.map((t, i) => {
        const val = Math.pow(10, t * Math.log10(maxValue + 1)) - 1;
        return `<div class="legend-item">
          <div class="legend-color" style="background:${colors[i]}"></div>
          ${labels[i]} (${val < 1 ? val.toFixed(2) : val.toFixed(0)}+)
        </div>`;
      }).join('') + `<div class="legend-item"><div class="legend-color" style="background:${NO_DATA}"></div>No Data</div>`;
    }

    function updateEmissionsProgress() {
      const countryValues = getCountryValuesForMap();
      const values = Object.values(countryValues);
      const total = values.length;
      const setWidth = (id: string, pct: number) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${pct}%`;
      };
      if (!total) {
        ['emissions-progress-low', 'emissions-progress-medium', 'emissions-progress-high', 'emissions-progress-critical'].forEach(id => setWidth(id, 0));
        return;
      }
      const maxEmissions = Math.max(...values, 0.1);
      const counts = { high: 0, medium: 0, low: 0, critical: 0 };
      values.forEach((v) => {
        const logValue = Math.log10(v + 1);
        const logMax = Math.log10(maxEmissions + 1);
        const ratio = logMax ? logValue / logMax : 0;
        if (ratio < 0.25) counts.high += 1;
        else if (ratio < 0.5) counts.medium += 1;
        else if (ratio < 0.75) counts.low += 1;
        else counts.critical += 1;
      });
      setWidth('emissions-progress-low',      (counts.high     / total) * 100);
      setWidth('emissions-progress-medium',   (counts.medium   / total) * 100);
      setWidth('emissions-progress-high',     (counts.low      / total) * 100);
      setWidth('emissions-progress-critical', (counts.critical / total) * 100);
    }

    function updateNewEmissionsMap() {
      if (!emissionsMapSvg || !d3) return;
      const countryValues = getCountryValuesForMap();
      const maxValue = Math.max(...Object.values(countryValues), 0.1);
      emissionsMapSvg.selectAll('.emissions-path')
        .transition()
        .duration(300)
        .attr('fill', function(this: Element) {
          const code = d3.select(this).attr('data-code');
          if (!code) return NO_DATA;
          return getEmissionsColor(countryValues[code] || 0, maxValue);
        });
      updateNewEmissionsLegend(maxValue);
    }

    // ---- tooltip ----

    function handleOut() {
      const tt = document.getElementById('tooltip');
      if (tt) tt.style.opacity = '0';
    }

    function handleEmissionsHover(event: MouseEvent, d: any) {
      const tt = document.getElementById('tooltip');
      if (!tt) return;
      const code = countryIdToCode[normalizeId(d.id)];
      if (!code) {
        tt.innerHTML = `<em>Unknown country</em>`;
        tt.style.opacity = '1';
        tt.style.left = (event.pageX + 10) + 'px';
        tt.style.top  = (event.pageY + 10) + 'px';
        return;
      }
      const country = countriesData.find((c: any) => c.country_code === code);
      const countryName = country?.country_name || code;
      let tooltipContent = '';
      if (emissionsDataSource === 'clasp') {
        const countryRecords = localClaspEnergy.filter((r: any) =>
          r.country_code === code && r.year === localEmissionsYear &&
          (localEmissionsAppliances.length === 0 || localEmissionsAppliances.includes(r.appliance))
        );
        if (countryRecords.length === 0) {
          tooltipContent = `<strong>${countryName}</strong><br><em>No CLASP data available</em>`;
        } else {
          const scenarioName = CLASP_SCENARIO_NAMES[emissionsScenario] || emissionsScenario;
          let total = 0; let breakdown = '';
          const byAppliance: Record<string, number> = {};
          countryRecords.forEach((r: any) => {
            const co2 = getClaspCO2(r, emissionsScenario);
            total += co2;
            byAppliance[r.appliance] = (byAppliance[r.appliance] || 0) + co2;
          });
          Object.entries(byAppliance).forEach(([app, val]) => {
            if ((val as number) > 0)
              breakdown += `${(CLASP_APPLIANCE_SHORT as any)[app] || app}: ${(val as number).toFixed(3)} Mt<br>`;
          });
          tooltipContent = `<strong>${countryName}</strong><br>
            <span style="color:#64748b;font-size:0.85em">CLASP (Indirect) | ${scenarioName} | ${localEmissionsYear}</span><br>
            <strong>Indirect: ${total.toFixed(3)} Mt CO2</strong><br>${breakdown}`;
        }
      } else {
        const countryRecords = subcoolData.filter((r: any) =>
          r.country_code === code && r.year === localEmissionsYear && r.scenario_name === emissionsScenario
        );
        if (countryRecords.length === 0) {
          tooltipContent = `<strong>${countryName}</strong><br><em>No HEAT data available</em>`;
        } else {
          const scenarioName = HEAT_SCENARIO_NAMES[emissionsScenario] || emissionsScenario;
          let direct = 0, indirect = 0;
          const bySubsector: Record<string, { direct: number; indirect: number }> = {};
          countryRecords.forEach((r: any) => {
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
            const subVal = emissionsType === 'direct' ? (vals as any).direct : emissionsType === 'indirect' ? (vals as any).indirect : ((vals as any).direct + (vals as any).indirect);
            if (subVal > 0) breakdown += `${(HEAT_SUBSECTOR_SHORT as any)[sub] || sub}: ${subVal.toFixed(3)} Mt<br>`;
          });
          tooltipContent = `<strong>${countryName}</strong><br>
            <span style="color:#64748b;font-size:0.85em">HEAT | ${scenarioName} | ${localEmissionsYear}</span><br>
            <strong>${typeLabel}: ${displayValue.toFixed(3)} Mt CO2</strong><br>${breakdown}`;
        }
      }
      tt.innerHTML = tooltipContent;
      tt.style.opacity = '1';
      tt.style.left = (event.pageX + 10) + 'px';
      tt.style.top  = (event.pageY + 10) + 'px';
    }

    // ---- country click ----

    function clearCountryHighlights() {
      document.querySelectorAll('.country-selected').forEach(p => p.classList.remove('country-selected'));
    }

    function highlightCountryOnMap(code: string) {
      document.querySelectorAll('.emissions-path').forEach(path => {
        const pathCode = path.getAttribute('data-code');
        path.classList.toggle('country-selected', pathCode === code);
      });
    }

    function handleClick(_event: MouseEvent, d: any) {
      const code = countryIdToCode[normalizeId(d.id)];
      if (!code) return;
      selectedCountry = code;
      highlightCountryOnMap(code);
      const country = countriesData.find((c: any) => c.country_code === code);
      if (country) updateEmissionsCountryDetail(code, country);
      syncPanelVisibility();
      // Update the URL query param without navigation (mirrors legacy __dashboardSwitchView)
      const url = new URL(window.location.href);
      url.searchParams.set('country', code);
      goto(url.pathname + url.search, { replaceState: true, noScroll: true });
    }

    // ---- country detail panel ----

    function updateEmissionsCountryDetail(code: string, country: any) {
      const emissionsDetail = document.querySelector('#emissions-country-detail .country-detail') as HTMLElement;
      if (!emissionsDetail) return;
      const regionRec = regionsData.find((r: any) => r.country_code === code);
      const region = regionRec?.region || country.region || 'N/A';
      const applianceColors: Record<string, string> = {
        'Air Conditioning': EMISSION_APPLIANCE.AC,
        'Ceiling and Portable Fans': EMISSION_APPLIANCE.FANS,
        'Refrigerator-Freezers': EMISSION_APPLIANCE.FRIDGES,
        'Split residential air conditioners': EMISSION_APPLIANCE.AC,
        'Domestic refrigeration': EMISSION_APPLIANCE.FRIDGES
      };
      const emissionTypeColors: Record<string, string> = { 'Direct': EMISSION.DIRECT, 'Indirect': EMISSION.INDIRECT };
      let years: number[] = [];
      let stackedSeriesData: { name: string; data: number[]; color: string }[] = [];
      let currentYearBreakdown: { name: string; value: number; color: string }[] = [];
      let currentYearTotal = 0;
      let dataSourceLabel = '';
      let scenarioLabel = '';

      if (emissionsDataSource === 'clasp') {
        dataSourceLabel = 'CLASP (Indirect)';
        scenarioLabel = CLASP_SCENARIO_NAMES[emissionsScenario] || emissionsScenario;
        const countryClaspData = localClaspEnergy.filter((r: any) =>
          r.country_code === code &&
          (localEmissionsAppliances.length === 0 || localEmissionsAppliances.includes(r.appliance))
        );
        const yearSet = new Set<number>();
        countryClaspData.forEach((r: any) => { if (r.year >= 2020 && r.year <= 2050) yearSet.add(r.year); });
        years = Array.from(yearSet).sort((a, b) => a - b);
        const appliancesToShow = localEmissionsAppliances.length > 0 ? localEmissionsAppliances : CLASP_APPLIANCES;
        (appliancesToShow as string[]).forEach(appliance => {
          const appData = years.map(year => {
            const records = countryClaspData.filter((r: any) => r.year === year && r.appliance === appliance);
            return records.reduce((sum: number, r: any) => sum + getClaspCO2(r, emissionsScenario), 0);
          });
          if (appData.some(v => v > 0)) {
            stackedSeriesData.push({
              name: (CLASP_APPLIANCE_SHORT as any)[appliance] || appliance,
              data: appData,
              color: applianceColors[appliance] || '#64748b'
            });
          }
        });
        const currentYearClaspData = countryClaspData.filter((r: any) => r.year === localEmissionsYear);
        const applianceMap = new Map<string, number>();
        currentYearClaspData.forEach((r: any) => {
          const co2 = getClaspCO2(r, emissionsScenario);
          applianceMap.set(r.appliance, (applianceMap.get(r.appliance) || 0) + co2);
        });
        currentYearBreakdown = Array.from(applianceMap.entries())
          .filter(([, val]) => val > 0)
          .map(([name, value]) => ({
            name: (CLASP_APPLIANCE_SHORT as any)[name] || name,
            value,
            color: applianceColors[name] || '#64748b'
          }));
        currentYearTotal = currentYearClaspData.reduce((sum: number, r: any) => sum + getClaspCO2(r, emissionsScenario), 0);
      } else {
        dataSourceLabel = 'HEAT Modelling';
        scenarioLabel = HEAT_SCENARIO_NAMES[emissionsScenario] || emissionsScenario;
        const countrySubcoolData = subcoolData.filter((r: any) =>
          r.country_code === code && r.scenario_name === emissionsScenario
        );
        const yearSet = new Set<number>();
        countrySubcoolData.forEach((r: any) => { if (r.year >= 2020 && r.year <= 2050) yearSet.add(r.year); });
        years = Array.from(yearSet).sort((a, b) => a - b);
        const directData = years.map(year => {
          const records = countrySubcoolData.filter((r: any) => r.year === year);
          return records.reduce((sum: number, r: any) => sum + (r.direct_emission_mt || 0), 0);
        });
        const indirectData = years.map(year => {
          const records = countrySubcoolData.filter((r: any) => r.year === year);
          return records.reduce((sum: number, r: any) => sum + (r.indirect_emission_mt || 0), 0);
        });
        if (directData.some(v => v > 0))   stackedSeriesData.push({ name: 'Direct (Refrigerants)', data: directData,   color: emissionTypeColors['Direct'] });
        if (indirectData.some(v => v > 0)) stackedSeriesData.push({ name: 'Indirect (Energy)',     data: indirectData, color: emissionTypeColors['Indirect'] });
        const currentYearSubcoolData = countrySubcoolData.filter((r: any) => r.year === localEmissionsYear);
        const directTotal   = currentYearSubcoolData.reduce((sum: number, r: any) => sum + (r.direct_emission_mt   || 0), 0);
        const indirectTotal = currentYearSubcoolData.reduce((sum: number, r: any) => sum + (r.indirect_emission_mt || 0), 0);
        if (directTotal   > 0) currentYearBreakdown.push({ name: 'Direct',   value: directTotal,   color: emissionTypeColors['Direct'] });
        if (indirectTotal > 0) currentYearBreakdown.push({ name: 'Indirect', value: indirectTotal, color: emissionTypeColors['Indirect'] });
        currentYearTotal = directTotal + indirectTotal;
      }

      // Trend calculation
      const baselineYear = 2025;
      const baselineYearIndex = years.indexOf(baselineYear);
      let changePercent = '0'; let changeColor = '#64748b'; let changeIcon = 'fa-minus'; let comparisonText = '';
      if (baselineYearIndex !== -1 && localEmissionsYear >= baselineYear) {
        const baselineTotal = stackedSeriesData.reduce((sum, s) => sum + (s.data[baselineYearIndex] || 0), 0);
        const selectedYearIndex = years.indexOf(localEmissionsYear);
        const selectedYearTotal = selectedYearIndex !== -1
          ? stackedSeriesData.reduce((sum, s) => sum + (s.data[selectedYearIndex] || 0), 0)
          : currentYearTotal;
        const change = selectedYearTotal - baselineTotal;
        if (baselineTotal > 0) changePercent = ((change / baselineTotal) * 100).toFixed(1);
        changeColor = change > 0 ? '#ef4444' : change < 0 ? '#22c55e' : '#64748b';
        changeIcon  = change > 0 ? 'fa-arrow-up' : change < 0 ? 'fa-arrow-down' : 'fa-minus';
        comparisonText = 'vs 2025';
      } else if (years.length >= 2) {
        const firstYearTotal = stackedSeriesData.reduce((sum, s) => sum + (s.data[0] || 0), 0);
        const change = currentYearTotal - firstYearTotal;
        if (firstYearTotal > 0) changePercent = ((change / firstYearTotal) * 100).toFixed(1);
        changeColor = change > 0 ? '#ef4444' : change < 0 ? '#22c55e' : '#64748b';
        changeIcon  = change > 0 ? 'fa-arrow-up' : change < 0 ? 'fa-arrow-down' : 'fa-minus';
        comparisonText = `vs ${years[0]}`;
      }
      const lineChartTitle = emissionsDataSource === 'clasp' ? 'Emissions by Appliance Over Time' : 'Direct vs Indirect Emissions Over Time';
      const trendDirection = Number(changePercent) > 0 ? 'increase' : Number(changePercent) < 0 ? 'decrease' : 'remain stable';
      const trendDescription = years.length >= 2
        ? `Emissions are projected to ${trendDirection} by ${Math.abs(Number(changePercent))}% from 2025 to ${localEmissionsYear} under the ${scenarioLabel} scenario.`
        : 'Insufficient data to calculate trend.';
      const topSource = currentYearBreakdown.length > 0
        ? currentYearBreakdown.reduce((a, b) => a.value > b.value ? a : b)
        : null;
      const breakdownDescription = topSource
        ? `In ${localEmissionsYear}, ${topSource.name} accounts for the largest share at ${((topSource.value / currentYearTotal) * 100).toFixed(0)}% (${topSource.value.toFixed(2)} Mt CO2).`
        : 'No detailed breakdown available for the selected year.';

      const emissionTypeLabel = emissionsDataSource === 'clasp'
        ? 'Indirect (Energy)'
        : emissionsType === 'total' ? 'Total Emissions'
        : emissionsType === 'direct' ? 'Direct Emissions'
        : 'Indirect Emissions';
      const emissionTypeIcon = emissionsDataSource === 'clasp'
        ? 'fa-plug-circle-bolt'
        : emissionsType === 'total' ? 'fa-layer-group'
        : 'fa-arrows-split-up-and-left';

      emissionsDetail.innerHTML = `
        <div class="filter-status-bar">
          <div class="status-title">
            <i class="fa-solid fa-flag"></i>
            ${country.country_name}
            <span style="font-size:0.75rem;font-weight:400;opacity:0.8;">${region}</span>
          </div>
          <div class="status-filters">
            <span class="filter-tag"><i class="fa-solid fa-calendar"></i> ${localEmissionsYear}</span>
            <span class="filter-tag"><i class="fa-solid fa-flask"></i> ${scenarioLabel}</span>
            <span class="filter-tag"><i class="fa-solid ${emissionTypeIcon}"></i> ${emissionTypeLabel}</span>
            <span class="filter-tag" style="opacity:0.75;"><i class="fa-solid fa-sliders"></i> Adjust year slider to explore</span>
          </div>
        </div>
        <div style="padding:1rem;">
        <div class="country-header" style="margin-bottom:1rem;">
          <h4 style="color:#0369a1;font-size:1.1rem;margin:0;display:flex;align-items:center;gap:0.5rem;">
            <i class="fa-solid fa-flag" style="color:#52B788;"></i>
            ${country.country_name}
            <span style="font-size:0.75rem;font-weight:400;color:#64748b;margin-left:0.5rem;">${region}</span>
          </h4>
          <div style="display:flex;gap:0.75rem;margin-top:0.5rem;flex-wrap:wrap;">
            <span style="font-size:0.8rem;color:#C25B33;font-weight:600;">
              <i class="fa-solid fa-cloud" style="margin-right:0.25rem;"></i>${currentYearTotal.toFixed(2)} Mt CO2
            </span>
            <span style="font-size:0.8rem;color:${changeColor};font-weight:500;">
              <i class="fa-solid ${changeIcon}" style="margin-right:0.25rem;"></i>${Math.abs(Number(changePercent))}% ${comparisonText}
            </span>
          </div>
        </div>
        <div class="country-charts-grid">
          <div class="chart-box" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:8px;padding:0.75rem;">
            <div style="font-size:0.75rem;font-weight:600;color:#0369a1;margin-bottom:0.5rem;">
              <i class="fa-solid fa-chart-area" style="margin-right:0.3rem;color:#52B788;"></i>${lineChartTitle}
            </div>
            <div class="emissions-line-chart" style="width:100%;height:200px;"></div>
          </div>
          <div class="chart-box" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:8px;padding:0.75rem;">
            <div style="font-size:0.75rem;font-weight:600;color:#0369a1;margin-bottom:0.5rem;">
              <i class="fa-solid fa-chart-pie" style="margin-right:0.3rem;color:#52B788;"></i>${localEmissionsYear} Breakdown
            </div>
            <div class="emissions-pie-chart" style="width:100%;height:200px;"></div>
          </div>
        </div>
        <div class="country-insight" style="background:#ffffff;border:1px solid #f1f5f9;border-radius:8px;padding:1rem;border-left:3px solid #52B788;">
          <div style="font-size:0.8rem;font-weight:600;color:#2D5252;margin-bottom:0.5rem;">
            <i class="fa-solid fa-lightbulb" style="color:#52B788;margin-right:0.35rem;"></i>Analysis for ${country.country_name}
          </div>
          <p style="font-size:0.85rem;color:#1e293b;line-height:1.6;margin:0;">
            ${trendDescription} ${breakdownDescription}
            <span style="display:block;margin-top:0.5rem;font-size:0.75rem;color:#64748b;">
              <em>Data source: ${dataSourceLabel} • Scenario: ${scenarioLabel}</em>
            </span>
          </p>
        </div>
        </div>
      `;

      // Render charts after DOM update
      setTimeout(() => {
        import('echarts').then((echartsLib) => {
          const lineContainer = emissionsDetail.querySelector('.emissions-line-chart') as HTMLElement;
          const pieContainer  = emissionsDetail.querySelector('.emissions-pie-chart')  as HTMLElement;
          if (emissionsCountryLineChart) { emissionsCountryLineChart.dispose(); emissionsCountryLineChart = null; }
          if (emissionsCountryPieChart)  { emissionsCountryPieChart.dispose();  emissionsCountryPieChart = null; }
          if (lineContainer && years.length > 0 && stackedSeriesData.length > 0) {
            emissionsCountryLineChart = echartsLib.init(lineContainer);
            emissionsCountryLineChart.setOption({
              grid: { top: 30, right: 25, bottom: 32, left: 50 },
              legend: { show: true, top: 0, left: 'center', itemWidth: 14, itemHeight: 10, textStyle: { fontSize: 11, color: '#475569', fontWeight: 500 }, itemGap: 10 },
              xAxis: { type: 'category', data: years.map(String), axisLabel: { fontSize: 11, fontWeight: 500, color: '#475569' }, axisLine: { lineStyle: { color: '#cbd5e1' } }, axisTick: { show: false }, boundaryGap: false },
              yAxis: { type: 'value', axisLabel: { fontSize: 11, fontWeight: 500, color: '#475569', formatter: (v: number) => v >= 1 ? `${v.toFixed(1)}` : `${(v * 1000).toFixed(0)}k` }, splitLine: { lineStyle: { color: '#e2e8f0' } }, name: 'Mt CO2', nameLocation: 'middle', nameGap: 35, nameTextStyle: { fontSize: 10, color: '#64748b', fontWeight: 500 } },
              series: stackedSeriesData.map(s => ({ name: s.name, type: 'line', stack: 'total', smooth: true, symbol: 'none', color: s.color, lineStyle: { width: 0 }, areaStyle: { opacity: 0.8 }, emphasis: { focus: 'series' }, data: s.data })),
              tooltip: { trigger: 'axis', textStyle: { fontSize: 11 }, axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } }, formatter: (params: any) => { let total = 0; let html = `<strong style="font-size:12px">${params[0].axisValue}</strong><br/>`; params.forEach((p: any) => { if (p.value > 0) { html += `<span style="display:inline-block;width:8px;height:8px;background:${p.color};border-radius:50%;margin-right:4px;"></span>${p.seriesName}: ${p.value.toFixed(3)} Mt<br/>`; total += p.value; } }); html += `<strong>Total: ${total.toFixed(3)} Mt</strong>`; return html; } }
            });
          } else if (lineContainer) {
            lineContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:0.75rem;">No data available</div>';
          }
          if (pieContainer && currentYearBreakdown.length > 0) {
            emissionsCountryPieChart = echartsLib.init(pieContainer);
            emissionsCountryPieChart.setOption({
              tooltip: { trigger: 'item', textStyle: { fontSize: 12 }, formatter: (params: any) => `<strong>${params.name}</strong><br/>${params.value.toFixed(3)} Mt CO2 (${params.percent}%)` },
              legend: { show: false },
              series: [{ type: 'pie', radius: ['32%', '56%'], center: ['50%', '52%'], avoidLabelOverlap: true, itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }, label: { show: true, position: 'outside', fontSize: 13, fontWeight: 500, color: '#475569', overflow: 'break', formatter: (params: any) => `${params.name}\n${params.percent}%` }, labelLine: { show: true, length: 6, length2: 6 }, emphasis: { label: { show: true, fontSize: 15, fontWeight: 'bold' }, itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }, data: currentYearBreakdown.map(c => ({ name: c.name, value: c.value, itemStyle: { color: c.color } })) }]
            });
          } else if (pieContainer) {
            pieContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:0.75rem;">No data for selected year</div>';
          }
        });
      }, 100);
    }

    function syncPanelVisibility() {
      const chartsContainer = document.getElementById('emissions-charts-container');
      const countryDetail = document.getElementById('emissions-country-detail');
      if (chartsContainer) chartsContainer.style.display = selectedCountry ? 'none' : '';
      if (countryDetail) countryDetail.style.display = selectedCountry ? '' : 'none';
    }

    function showGlobalEmissionsDetail() {
      const emissionsDetail = document.querySelector('#emissions-country-detail .country-detail') as HTMLElement;
      if (!emissionsDetail) return;
      if (emissionsCountryPieChart)  { emissionsCountryPieChart.dispose();  emissionsCountryPieChart = null; }
      if (emissionsCountryLineChart) { emissionsCountryLineChart.dispose(); emissionsCountryLineChart = null; }
      const scenarioLabel = emissionsDataSource === 'clasp'
        ? CLASP_SCENARIO_NAMES[emissionsScenario] || emissionsScenario
        : HEAT_SCENARIO_NAMES[emissionsScenario]  || emissionsScenario;
      const totals = getEmissionsTotals();
      const globalTotal = (totals as { total: number }).total;
      emissionsDetail.innerHTML = `
        <div class="country-placeholder" style="text-align:center;padding:2.5rem 1.5rem;">
          <i class="fa-solid fa-map-location-dot" style="font-size:3rem;color:#52B788;margin-bottom:1rem;display:block;"></i>
          <h4 style="color:#0369a1;margin-bottom:0.75rem;font-size:1.1rem;">Select a Country</h4>
          <p style="font-size:0.9rem;color:#64748b;line-height:1.5;max-width:280px;margin:0 auto 1.25rem;">
            Click on any country in the map above to view detailed emissions breakdown and trends.
          </p>
          <div style="background:linear-gradient(135deg,#EBF4F4 0%,#F5FAFA 100%);border-radius:10px;padding:1rem;border-left:3px solid #52B788;">
            <div style="font-size:0.75rem;color:#64748b;margin-bottom:0.5rem;">
              <i class="fa-solid fa-globe" style="margin-right:0.35rem;"></i>Global Total (${localEmissionsYear} • ${scenarioLabel})
            </div>
            <div style="font-size:1.5rem;font-weight:700;color:#0369a1;">
              ${globalTotal.toFixed(1)} Mt CO<sub>2</sub>
            </div>
          </div>
        </div>
      `;
    }

    // ---- emissions charts container ----

    function updateEmissionsCharts(echartsLib: any) {
      const container = document.getElementById('emissions-charts-container');
      if (!container) return;
      const sourceLabel = emissionsDataSource === 'clasp' ? 'CLASP (Indirect)' : 'HEAT (Direct + Indirect)';
      const sourceIcon  = emissionsDataSource === 'clasp' ? 'fa-plug-circle-bolt' : 'fa-industry';
      const scenarioName = emissionsDataSource === 'clasp'
        ? ((CLASP_SCENARIO_NAMES as any)[emissionsScenario] || emissionsScenario)
        : ((HEAT_SCENARIO_NAMES  as any)[emissionsScenario] || emissionsScenario);
      let typeHtml = '';
      if (emissionsDataSource === 'subcool') {
        const typeLabel = emissionsType === 'total' ? 'Total' : emissionsType === 'direct' ? 'Direct only' : 'Indirect only';
        typeHtml = `<span class="filter-tag"><i class="fa-solid fa-arrows-split-up-and-left"></i> ${typeLabel}</span>`;
      } else {
        const appLabels = localEmissionsAppliances.map((a: string) => (CLASP_APPLIANCE_SHORT as any)[a] || a);
        typeHtml = appLabels.length ? `<span class="filter-tag"><i class="fa-solid fa-fan"></i> ${appLabels.join(' · ')}</span>` : '';
      }
      container.innerHTML = `
        <div class="filter-status-bar">
          <div class="status-title"><i class="fa-solid fa-chart-area"></i> Global Emissions — ${localEmissionsYear}</div>
          <div class="status-filters">
            <span class="filter-tag"><i class="fa-solid ${sourceIcon}"></i> ${sourceLabel}</span>
            <span class="filter-tag"><i class="fa-solid fa-calendar"></i> ${localEmissionsYear}</span>
            <span class="filter-tag"><i class="fa-solid fa-flask"></i> ${scenarioName}</span>
            ${typeHtml}
          </div>
        </div>
        <div class="emissions-chart-section">
          <h3>Emissions by Category</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
            <div>
              <h4 style="font-size:0.9rem;color:#475569;margin-bottom:0.5rem;">By Appliance/Subsector</h4>
              <div id="chart-emissions-category" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
            </div>
            <div>
              <h4 style="font-size:0.9rem;color:#475569;margin-bottom:0.5rem;">Top 10 Countries: Cumulative Savings to <span id="top-countries-year-label">${localEmissionsYear}</span></h4>
              <div id="chart-emissions-top-countries" class="chart-surface" style="width:100%;height:320px;min-height:320px;"></div>
            </div>
          </div>
        </div>
        <div class="emissions-chart-section" style="border-top:1px solid #e2e8f0;">
          <h3>Emissions Trajectory</h3>
          <p class="chart-subtitle">Scenario comparison over time</p>
          <div id="chart-emissions-timeline" class="chart-surface" style="width:100%;height:320px;min-height:320px;"></div>
        </div>
      `;
      setTimeout(() => {
        renderEmissionsCategoryChart(echartsLib);
        renderEmissionsTopCountriesChart(echartsLib);
        renderNewEmissionsTimeline(echartsLib);
      }, 50);
    }

    function renderEmissionsCategoryChart(echartsLib: any) {
      const PIE_COLORS: Record<string, string> = {
        'AC':           EMISSION_APPLIANCE.AC,
        'Fans':         EMISSION_APPLIANCE.FANS,
        'Refrigerators':EMISSION_APPLIANCE.FRIDGES,
        'Refrigeration':EMISSION_APPLIANCE.FRIDGES,
      };
      const chartData: { name: string; value: number; itemStyle: { color: string } }[] = [];
      if (emissionsDataSource === 'clasp') {
        const totals = getEmissionsTotals() as { byAppliance: Record<string, number> };
        Object.entries(totals.byAppliance).forEach(([app, val]) => {
          if ((val as number) > 0) {
            const name = (CLASP_APPLIANCE_SHORT as any)[app] || app;
            chartData.push({ name, value: +((val as number).toFixed(2)), itemStyle: { color: PIE_COLORS[name] ?? EMISSION_APPLIANCE.AC } });
          }
        });
      } else {
        const totals = getEmissionsTotals() as { bySubsector: Record<string, { direct: number; indirect: number }> };
        Object.entries(totals.bySubsector).forEach(([sub, val]) => {
          const total = (val as any).direct + (val as any).indirect;
          if (total > 0) {
            const name = (HEAT_SUBSECTOR_SHORT as any)[sub] || sub;
            chartData.push({ name, value: +total.toFixed(2), itemStyle: { color: PIE_COLORS[name] ?? EMISSION_APPLIANCE.AC } });
          }
        });
      }
      setChart('chart-emissions-category', {
        tooltip: { trigger: 'item', formatter: '{b}: {c} Mt ({d}%)' },
        legend: { bottom: 5, textStyle: { fontSize: 13 } },
        series: [{ type: 'pie', radius: ['35%', '60%'], center: ['50%', '45%'], data: chartData, itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }, label: { show: true, fontSize: 13, fontWeight: 500, formatter: (params: any) => `${params.name}\n${params.percent}%` }, emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } } }]
      }, echartsLib);
    }

    function renderEmissionsTopCountriesChart(echartsLib: any) {
      if (emissionsDataSource === 'clasp') {
        const targetYear = localEmissionsYear;
        const years = [2020, 2025, 2030, 2035, 2040, 2045, 2050].filter(y => y <= targetYear);
        const countrySavings: Record<string, { name: string; bauCumul: number; mepsSavings: number; deepEeSavings: number; batSavings: number; gridSavings: number; totalSavings: number }> = {};
        years.forEach(year => {
          const yearData = localClaspEnergy.filter((r: any) =>
            r.year === year && (localEmissionsAppliances.length === 0 || localEmissionsAppliances.includes(r.appliance))
          );
          const filtered = emissionsRegion ? yearData.filter((r: any) => getCountryRegion(r.country_code) === emissionsRegion) : yearData;
          filtered.forEach((r: any) => {
            const code = r.country_code;
            if (!countrySavings[code]) countrySavings[code] = { name: r.country_name || code, bauCumul: 0, mepsSavings: 0, deepEeSavings: 0, batSavings: 0, gridSavings: 0, totalSavings: 0 };
            const bau = r.bau_co2_mt || 0; const gb = r.gb_co2_mt || 0; const nzh = r.nzh_co2_mt || 0; const bat = r.bat_co2_mt || 0; const batNzg = r.bat_co2_nzg_mt || 0;
            countrySavings[code].bauCumul      += bau;
            countrySavings[code].mepsSavings   += Math.max(0, bau - gb);
            countrySavings[code].deepEeSavings += Math.max(0, gb  - nzh);
            countrySavings[code].batSavings    += Math.max(0, nzh - bat);
            countrySavings[code].gridSavings   += Math.max(0, bat - batNzg);
          });
        });
        Object.values(countrySavings).forEach(c => { c.totalSavings = c.mepsSavings + c.deepEeSavings + c.batSavings + c.gridSavings; });
        const top10 = Object.values(countrySavings).sort((a, b) => b.totalSavings - a.totalSavings).slice(0, 10).reverse();
        const countryNames = top10.map(c => c.name);
        setChart('chart-emissions-top-countries', {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (params: any) => { if (!params?.length) return ''; const country = params[0].name; let html = `<strong>${country}</strong><br/>`; let total = 0; params.forEach((p: any) => { if (p.value > 0.1) { html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${p.color};margin-right:4px;"></span>${p.seriesName}: ${p.value.toFixed(1)} Mt<br/>`; total += p.value; } }); html += `<strong>Total savings: ${total.toFixed(1)} Mt CO₂</strong>`; return html; } },
          legend: { bottom: 0, textStyle: { fontSize: 10 }, itemWidth: 12, itemHeight: 8 },
          grid: { left: '3%', right: '6%', bottom: '14%', top: '3%', containLabel: true },
          xAxis: { type: 'value', name: 'Mt CO₂ saved', nameLocation: 'middle', nameGap: 25, axisLabel: { fontSize: 10 } },
          yAxis: { type: 'category', data: countryNames, axisLabel: { fontSize: 10, width: 80, overflow: 'truncate' } },
          series: [
            { name: 'MEPS & Labels',   type: 'bar', stack: 'savings', data: top10.map(c => +c.mepsSavings.toFixed(1)),   itemStyle: { color: SAVINGS.MEPS,     borderRadius: 0 }, emphasis: { focus: 'series' } },
            { name: 'High Efficiency', type: 'bar', stack: 'savings', data: top10.map(c => +c.deepEeSavings.toFixed(1)), itemStyle: { color: SAVINGS.HIGH_EFF,  borderRadius: 0 }, emphasis: { focus: 'series' } },
            { name: 'Best Available',  type: 'bar', stack: 'savings', data: top10.map(c => +c.batSavings.toFixed(1)),    itemStyle: { color: SAVINGS.BAT,      borderRadius: 0 }, emphasis: { focus: 'series' } },
            { name: 'Grid Decarb',     type: 'bar', stack: 'savings', data: top10.map(c => +c.gridSavings.toFixed(1)),   itemStyle: { color: SAVINGS.GRID,     borderRadius: [0, 3, 3, 0] }, emphasis: { focus: 'series' } }
          ]
        }, echartsLib);
      } else {
        const byCountry = getSubcoolEmissionsByCountry();
        const countryData = Object.entries(byCountry)
          .map(([code, dd]) => ({ name: (dd as any).name || code, direct: +((dd as any).direct.toFixed(1)), indirect: +((dd as any).indirect.toFixed(1)), total: +((dd as any).total.toFixed(1)) }))
          .sort((a, b) => b.total - a.total).slice(0, 10).reverse();
        setChart('chart-emissions-top-countries', {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (params: any) => { if (!params?.length) return ''; const country = params[0].name; let html = `<strong>${country}</strong><br/>`; let total = 0; params.forEach((p: any) => { if (p.value > 0) { html += `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${p.color};margin-right:4px;"></span>${p.seriesName}: ${p.value.toFixed(1)} Mt<br/>`; total += p.value; } }); html += `<strong>Total: ${total.toFixed(1)} Mt CO₂</strong>`; return html; } },
          legend: { bottom: 0, textStyle: { fontSize: 10 }, itemWidth: 12, itemHeight: 8 },
          grid: { left: '3%', right: '6%', bottom: '14%', top: '3%', containLabel: true },
          xAxis: { type: 'value', name: 'Mt CO₂', nameLocation: 'middle', nameGap: 25, axisLabel: { fontSize: 10 } },
          yAxis: { type: 'category', data: countryData.map(d => d.name), axisLabel: { fontSize: 10, width: 80, overflow: 'truncate' } },
          series: [
            { name: 'Direct',   type: 'bar', stack: 'emissions', data: countryData.map(d => d.direct),   itemStyle: { color: EMISSION.DIRECT },                          emphasis: { focus: 'series' } },
            { name: 'Indirect', type: 'bar', stack: 'emissions', data: countryData.map(d => d.indirect), itemStyle: { color: EMISSION.INDIRECT, borderRadius: [0, 3, 3, 0] }, emphasis: { focus: 'series' } }
          ]
        }, echartsLib);
      }
    }

    function renderNewEmissionsTimeline(echartsLib: any) {
      const years = [2020, 2025, 2030, 2035, 2040, 2045, 2050];
      // 2020–2025 is historical: all scenarios use BAU values (no divergence yet)
      const HIST_IDX = 1; // index of 2025 — inclusive historical boundary
      const series: any[] = [];

      if (emissionsDataSource === 'clasp') {
        const bauTotals = years.map(y => {
          const filtered = localClaspEnergy.filter((r: any) =>
            r.year === y && (localEmissionsAppliances.length === 0 || localEmissionsAppliances.includes(r.appliance))
          );
          return +filtered.reduce((total: number, r: any) => total + getClaspCO2(r, 'BAU'), 0).toFixed(1);
        });
        const CLASP_LINE_COLORS: Record<string, string> = {
          BAU: SCENARIO.BAU,       // terracotta — worst
          GB:  SCENARIO.KIP,       // amber — better
          NZH: SCENARIO.NZH,       // mint — good
          BAT: SCENARIO.BAT,       // forest green — best
        };
        (CLASP_SCENARIOS as string[]).forEach((scenario) => {
          const yearTotals: (number | null)[] = years.map((y, i) => {
            if (scenario === 'BAU') {
              // BAU shows the full historical + projected line
              const filtered = localClaspEnergy.filter((r: any) =>
                r.year === y && (localEmissionsAppliances.length === 0 || localEmissionsAppliances.includes(r.appliance))
              );
              return +filtered.reduce((total: number, r: any) => total + getClaspCO2(r, scenario), 0).toFixed(1);
            }
            // Non-BAU: null before 2025 (not drawn), BAU value at 2025, scenario value after
            if (i < HIST_IDX) return null;
            if (i === HIST_IDX) return bauTotals[i];
            const filtered = localClaspEnergy.filter((r: any) =>
              r.year === y && (localEmissionsAppliances.length === 0 || localEmissionsAppliances.includes(r.appliance))
            );
            return +filtered.reduce((total: number, r: any) => total + getClaspCO2(r, scenario), 0).toFixed(1);
          });
          const lineColor = CLASP_LINE_COLORS[scenario] ?? SCENARIO.BAU;
          series.push({ name: (CLASP_SCENARIO_NAMES as any)[scenario], type: 'line', smooth: true, connectNulls: false, data: yearTotals, lineStyle: { width: scenario === emissionsScenario ? 3 : 1.5, color: lineColor }, itemStyle: { color: lineColor }, symbol: scenario === emissionsScenario ? 'circle' : 'none', symbolSize: 6 });
        });
      } else {
        const bauTotals = years.map(y => {
          const filtered = subcoolData.filter((r: any) => r.year === y && r.scenario_name === 'BAU');
          return +filtered.reduce((total: number, r: any) => total + (r.direct_emission_mt || 0) + (r.indirect_emission_mt || 0), 0).toFixed(1);
        });
        const HEAT_LINE_COLORS: Record<string, string> = {
          BAU:     SCENARIO.BAU,       // terracotta — worst
          KIP:     SCENARIO.KIP,       // amber — middle
          KIP_PLUS:SCENARIO.KIP_PLUS,  // forest green — best
        };
        (HEAT_SCENARIOS as string[]).forEach((scenario) => {
          const yearTotals: (number | null)[] = years.map((y, i) => {
            if (scenario === 'BAU') {
              const filtered = subcoolData.filter((r: any) => r.year === y && r.scenario_name === 'BAU');
              return +filtered.reduce((total: number, r: any) => total + (r.direct_emission_mt || 0) + (r.indirect_emission_mt || 0), 0).toFixed(1);
            }
            if (i < HIST_IDX) return null;
            if (i === HIST_IDX) return bauTotals[i];
            const filtered = subcoolData.filter((r: any) => r.year === y && r.scenario_name === scenario);
            return +filtered.reduce((total: number, r: any) => total + (r.direct_emission_mt || 0) + (r.indirect_emission_mt || 0), 0).toFixed(1);
          });
          const lineColor = HEAT_LINE_COLORS[scenario] ?? SCENARIO.BAU;
          series.push({ name: (HEAT_SCENARIO_NAMES as any)[scenario], type: 'line', smooth: true, connectNulls: false, data: yearTotals, lineStyle: { width: scenario === emissionsScenario ? 3 : 1.5, color: lineColor }, itemStyle: { color: lineColor }, symbol: scenario === emissionsScenario ? 'circle' : 'none', symbolSize: 6 });
        });
      }

      // Shade the historical period and add a separator at 2025
      if (series.length > 0) {
        series[0].markArea = {
          silent: true,
          itemStyle: { color: 'rgba(168, 213, 162, 0.10)' },
          label: { show: true, position: 'insideTopLeft', fontSize: 10, color: '#94a3b8', formatter: 'Historical' },
          data: [[{ xAxis: '2020' }, { xAxis: '2025' }]]
        };
        series[0].markLine = {
          silent: true,
          lineStyle: { color: '#94a3b8', type: 'dashed', width: 1.5 },
          label: { show: true, position: 'insideEndTop', fontSize: 10, color: '#64748b', formatter: '← Projected' },
          data: [{ xAxis: '2025' }]
        };
      }

      setChart('chart-emissions-timeline', {
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0, textStyle: { fontSize: 11 } },
        grid: { left: '12%', right: '4%', bottom: '15%', top: '10%' },
        xAxis: { type: 'category', data: years.map(String), axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', name: 'Mt CO2', nameLocation: 'middle', nameGap: 40, axisLabel: { fontSize: 10 } },
        series
      }, echartsLib);
    }

    // ---- main view update ----

    function updateEmissionsView(echartsLib: any) {
      updateNewEmissionsMap();
      updateEmissionsProgress();
      updateEmissionsCharts(echartsLib);
      if (selectedCountry) {
        const country = countriesData.find((c: any) => c.country_code === selectedCountry);
        if (country) updateEmissionsCountryDetail(selectedCountry, country);
      } else {
        showGlobalEmissionsDetail();
      }
      syncPanelVisibility();
    }

    // ---- region filter population ----

    function populateEmissionsRegionFilter() {
      const select = document.getElementById('emissions-region-select') as HTMLSelectElement | null;
      if (!select) return;
      const regions = new Set<string>();
      regionsData.forEach((r: any) => { if (r.region) regions.add(r.region); });
      select.innerHTML = '<option value="">All Regions</option>';
      Array.from(regions).sort().forEach(r => {
        const opt = document.createElement('option');
        opt.value = r; opt.textContent = r;
        select.appendChild(opt);
      });
    }

    // ---- async initialization ----

    async function initEmissionsMap(echartsLib: any) {
      const topojson = (window as any).topojson;
      d3 = (window as any).d3;
      const container = document.getElementById('emissions-map-container');
      if (!container) return;
      d3.select('#emissions-map-container').selectAll('svg').remove();
      const width  = container.clientWidth  || 800;
      const height = container.clientHeight || 400;
      emissionsMapSvg = d3.select('#emissions-map-container')
        .append('svg')
        .attr('width', '100%').attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
      // Ocean click = deselect
      emissionsMapSvg.append('rect')
        .attr('width', width).attr('height', height)
        .attr('fill', 'transparent').style('cursor', 'pointer')
        .on('click', () => {
          selectedCountry = null;
          clearCountryHighlights();
          showGlobalEmissionsDetail();
          syncPanelVisibility();
          const url = new URL(window.location.href);
          url.searchParams.delete('country');
          goto(url.pathname + url.search, { replaceState: true, noScroll: true });
        });
      const projection = d3.geoNaturalEarth1().scale(width / 6).translate([width / 2, height / 1.8]);
      const path = d3.geoPath().projection(projection);
      try {
        const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
        const countries = topojson.feature(world, world.objects.countries);
        const countryValues = getCountryValuesForMap();
        const maxValue = Math.max(...Object.values(countryValues), 0.1);
        emissionsMapSvg.selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('class', 'country-path emissions-path')
          .attr('data-code', (dd: any) => countryIdToCode[normalizeId(dd.id)] || '')
          .attr('fill', (dd: any) => {
            const code = countryIdToCode[normalizeId(dd.id)];
            return getEmissionsColor(countryValues[code] || 0, maxValue);
          })
          .on('mouseover', handleEmissionsHover)
          .on('mouseout', handleOut)
          .on('click', handleClick);
        updateNewEmissionsLegend(maxValue);
        updateEmissionsProgress();
      } catch (err) {
        console.error('Emissions map error:', err);
      }
    }

    // ---- event handler wiring ----

    function setupEmissionsEventHandlers(echartsLib: any) {
      // Source toggle (CLASP / HEAT)
      document.querySelectorAll<HTMLButtonElement>('#emissions-source-toggles .toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#emissions-source-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          emissionsDataSource = (btn.dataset.source as 'clasp' | 'subcool') || 'clasp';
          // Rebuild scenario dropdown for the new data source
          const scenarioSelect = document.getElementById('emissions-scenario-select') as HTMLSelectElement | null;
          if (scenarioSelect) {
            scenarioSelect.innerHTML = '';
            const scenarios = emissionsDataSource === 'clasp' ? CLASP_SCENARIOS : HEAT_SCENARIOS;
            const names     = emissionsDataSource === 'clasp' ? CLASP_SCENARIO_NAMES : HEAT_SCENARIO_NAMES;
            (scenarios as string[]).forEach(s => {
              const opt = document.createElement('option');
              opt.value = s; opt.textContent = (names as any)[s] || s;
              scenarioSelect.appendChild(opt);
            });
            emissionsScenario = (scenarios as string[])[0];
          }
          // Toggle appliance row vs emission-type row
          const appRow  = document.getElementById('emissions-appliance-row');
          const typeRow = document.getElementById('emissions-type-row');
          if (appRow)  appRow.style.display  = emissionsDataSource === 'clasp'   ? 'flex' : 'none';
          if (typeRow) typeRow.style.display  = emissionsDataSource === 'subcool' ? 'flex' : 'none';
          updateEmissionsView(echartsLib);
        });
      });

      // Year slider
      const emissionsYearSlider = document.getElementById('emissions-year-slider') as HTMLInputElement | null;
      const updateYearThumbDisplay = () => {
        if (!emissionsYearSlider) return;
        const display = document.getElementById('emissions-year-display');
        if (!display) return;
        display.textContent = String(emissionsYearSlider.value);
        const pct = (Number(emissionsYearSlider.value) - 2020) / (2050 - 2020);
        const thumbW = 16;
        const trackW = emissionsYearSlider.offsetWidth;
        display.style.left = trackW > 0
          ? (pct * (trackW - thumbW) + thumbW / 2) + 'px'
          : (pct * 100) + '%';
        display.style.transform = 'translateX(-50%)';
      };
      if (emissionsYearSlider) {
        emissionsYearSlider.addEventListener('input', () => {
          localEmissionsYear = Number(emissionsYearSlider.value);
          updateYearThumbDisplay();
          updateEmissionsView(echartsLib);
        });
        requestAnimationFrame(() => updateYearThumbDisplay());
      }

      // Scenario dropdown
      const emissionsScenarioSelect = document.getElementById('emissions-scenario-select') as HTMLSelectElement | null;
      if (emissionsScenarioSelect) {
        emissionsScenarioSelect.addEventListener('change', () => {
          emissionsScenario = emissionsScenarioSelect.value;
          updateEmissionsView(echartsLib);
        });
      }

      // Region dropdown
      const emissionsRegionSelect = document.getElementById('emissions-region-select') as HTMLSelectElement | null;
      if (emissionsRegionSelect) {
        emissionsRegionSelect.addEventListener('change', () => {
          emissionsRegion = emissionsRegionSelect.value;
          updateEmissionsView(echartsLib);
        });
      }

      // Appliance toggles (CLASP)
      document.querySelectorAll<HTMLButtonElement>('#emissions-appliance-toggles .toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const appliance = btn.dataset.appliance;
          if (!appliance) return;
          btn.classList.toggle('active');
          if (btn.classList.contains('active')) {
            if (!localEmissionsAppliances.includes(appliance)) localEmissionsAppliances.push(appliance);
          } else {
            localEmissionsAppliances = localEmissionsAppliances.filter(a => a !== appliance);
          }
          updateEmissionsView(echartsLib);
        });
      });

      // Emission type toggles (HEAT)
      document.querySelectorAll<HTMLButtonElement>('#emissions-type-toggles .toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#emissions-type-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          emissionsType = (btn.dataset.type as 'total' | 'direct' | 'indirect') || 'total';
          updateEmissionsView(echartsLib);
        });
      });
    }

    // ---- main async entry point ----

    async function initEmissions() {
      try {
        await Promise.all([
          loadScript('https://d3js.org/d3.v7.min.js'),
          loadScript('https://d3js.org/topojson.v3.min.js')
        ]);
        const echartsLib = await import('echarts');

        // Load data from props or fall back to fetching from API
        if (claspEnergy.length > 0) {
          localClaspEnergy = claspEnergy;
          subcoolData      = subcool;
          regionsData      = regions;
          countriesData    = countries;
        } else {
          try {
            const dashData = await loadDashboardData(SUPABASE_URL, SUPABASE_KEY);
            localClaspEnergy = dashData.claspEnergy;
            subcoolData      = dashData.subcool;
            regionsData      = dashData.regions;
            countriesData    = dashData.countries;
          } catch (err) {
            console.error('EmissionsPillar: failed to load dashboard data', err);
          }
        }

        // Setup filters, map, charts and event handlers
        populateEmissionsRegionFilter();
        await initEmissionsMap(echartsLib);
        updateEmissionsView(echartsLib);
        setupEmissionsEventHandlers(echartsLib);

        // Resize handler
        const handleResize = () => {
          Object.entries(charts).forEach(([id, chart]) => {
            if (!chart) return;
            const el = document.getElementById(id);
            if (!el) return;
            const w = el.clientWidth;
            const h = el.clientHeight || parseInt(el.style.minHeight) || 280;
            if (w > 10) chart.resize({ width: w, height: h });
          });
        };
        window.addEventListener('resize', handleResize);
      } catch (err) {
        console.error('EmissionsPillar init error:', err);
      }
    }

    initEmissions().then(() => {
      // Expose country-apply function for reactive URL sync
      // Does NOT call goto() — that's only for direct map clicks
      function applyEmissionsCountry(code: string | null) {
        if (!code) {
          selectedCountry = null;
          clearCountryHighlights();
          showGlobalEmissionsDetail();
          syncPanelVisibility();
          return;
        }
        selectedCountry = code;
        highlightCountryOnMap(code);
        const country = countriesData.find((c: any) => c.country_code === code);
        if (country) updateEmissionsCountryDetail(code, country);
        syncPanelVisibility();
      }
      _applyEmissionsCountry = applyEmissionsCountry;

      // Apply country from URL on initial load
      const _initialEmissionsCountry = new URLSearchParams(window.location.search).get('country');
      if (_initialEmissionsCountry) applyEmissionsCountry(_initialEmissionsCountry);
    });

    return () => {
      clearTimeout(revealTimer);
      // Dispose all ECharts instances
      Object.values(charts).forEach(c => { try { c?.dispose(); } catch { /* noop */ } });
      chartObservers.forEach(obs => obs.disconnect());
      if (emissionsCountryLineChart) { try { emissionsCountryLineChart.dispose(); } catch { /* noop */ } }
      if (emissionsCountryPieChart)  { try { emissionsCountryPieChart.dispose();  } catch { /* noop */ } }
    };
  });
</script>

<section id="view-emissions" class="view-section" class:active>
  <div class="pillar-stack">
    <!-- ═══ Ch01 THE CHALLENGE ═══ -->
    <div class="chapter-card" class:revealed style="border-top: none;">
      <span class="ep-eyebrow">The Challenge</span>
      <h2 class="ep-section-title">Cooling demand is rising — and so are the emissions that power it.</h2>
      <p class="ep-body">On a fossil-reliant grid, every air conditioner adds CO₂ to the atmosphere, while refrigerant leaks release gases hundreds to thousands of times more potent than carbon. This creates a vicious cycle: rising temperatures drive cooling demand, which accelerates emissions, further heating the planet. Without intervention, cooling-related emissions are on track to double by 2040 and potentially triple by 2050.</p>

      <div class="emissions-counters">
        {#each emissionsStats as stat, i}
          <div class="emissions-counter-wrapper" style="transition-delay: {200 + i * 100}ms">
            <AnimatedCounter
              value={stat.value}
              label={stat.label}
              context={stat.context}
              duration={1800 + i * 150}
            />
          </div>
        {/each}
      </div>
    </div>

    <!-- DATA: CO2 Emissions Map & Charts -->
    <div class="map-charts-connected">
    <div class="map-section">
    <div class="card-panel map-card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div class="card-title">
          <i class="fa-solid fa-earth-americas"></i>
          CO2 Emissions by Country
        </div>
        <a href="/methodology#emissions-map" style="font-size: 0.68rem; color: #0369a1; text-decoration: none; display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; white-space: nowrap;">
          <i class="fa-solid fa-book-open" style="font-size: 0.6rem;"></i> Methodology
        </a>
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
        <span class="progress-segment" id="emissions-progress-low" style="background: #F0F7F0;"></span>
        <span class="progress-segment" id="emissions-progress-medium" style="background: #A8D5A2;"></span>
        <span class="progress-segment" id="emissions-progress-high" style="background: #C25B33;"></span>
        <span class="progress-segment" id="emissions-progress-critical" style="background: #8B2500;"></span>
      </div>

      <!-- Filters Inside Map Card -->
      <div class="map-filters" id="emissions-filters-panel">
        <div class="filters-help" style="font-size: 0.8rem; color: #0369a1; margin-bottom: 0.75rem; padding: 0.5rem 0 0.5rem 0.75rem; background: transparent; border-left: 3px solid #0369a1;">
          <i class="fa-solid fa-sliders" style="margin-right: 0.5rem;"></i>
          <strong>Customize your view:</strong> These filters control all data displayed on the map, charts, and KPIs above. Adjust the source, year, scenario, and appliances to explore different emission projections.
        </div>
        <div class="filter-row" style="gap: 1rem; flex-wrap: nowrap; align-items: flex-start;">
          <!-- Data Source Toggle -->
          <div class="filter-group">
            <label class="filter-label">Source</label>
            <div class="toggle-group" id="emissions-source-toggles">
              <button class="toggle-btn active" data-source="clasp" type="button" title="Indirect emissions only (energy-related CO2) by appliance">CLASP</button>
              <button class="toggle-btn" data-source="subcool" type="button" title="Direct and indirect emissions with Kigali scenarios (GIZ collaboration)">HEAT</button>
            </div>
          </div>

          <!-- Year Slider -->
          <div class="filter-group" style="min-width: 180px;">
            <label class="filter-label">Year</label>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600; white-space: nowrap;">2020</span>
              <div style="flex: 1; position: relative; padding-top: 1.6rem;">
                <span id="emissions-year-display" style="position: absolute; top: 0; left: 33.33%; transform: translateX(-50%); font-size: 0.75rem; color: #64748b; font-weight: 600; white-space: nowrap; pointer-events: none;">2030</span>
                <input type="range" id="emissions-year-slider" min="2020" max="2050" value="2030" style="width: 100%; display: block;" />
              </div>
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600; white-space: nowrap;">2050</span>
            </div>
          </div>

          <!-- Scenario Dropdown -->
          <div class="filter-group">
            <label class="filter-label" for="emissions-scenario-select">Scenario</label>
            <select id="emissions-scenario-select" class="filter-select" style="min-width: 120px;">
              <option value="BAU">Business as Usual</option>
              <option value="GB">Green Buildings</option>
              <option value="NZH">Net Zero Homes</option>
              <option value="BAT">Best Available Tech</option>
            </select>
          </div>

          <!-- Appliance Toggles (for CLASP) -->
          <div class="filter-group" id="emissions-appliance-row">
            <label class="filter-label">Appliances</label>
            <div class="toggle-group" id="emissions-appliance-toggles">
              <button class="toggle-btn active" data-appliance="Air Conditioning" type="button">AC</button>
              <button class="toggle-btn active" data-appliance="Ceiling and Portable Fans" type="button">Fans</button>
              <button class="toggle-btn active" data-appliance="Refrigerator-Freezers" type="button">Refrigerators</button>
            </div>
          </div>

          <!-- Emission Type Toggles (for Subcool) - shown when HEAT selected -->
          <div class="filter-group" id="emissions-type-row" style="display: none;">
            <label class="filter-label">Type</label>
            <div class="toggle-group" id="emissions-type-toggles">
              <button class="toggle-btn active" data-type="total" type="button">Total</button>
              <button class="toggle-btn" data-type="direct" type="button">Direct</button>
              <button class="toggle-btn" data-type="indirect" type="button">Indirect</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    </div><!-- /map-section -->
    <div id="emissions-charts-container" class="charts-section"></div>
    <!-- Country Detail Section (inside connected block) -->
    <div class="country-card-inline" id="emissions-country-detail">
      <div class="country-detail">
        <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #0369a1; margin-bottom: 0.75rem; display: block;"></i>
          <h4 style="color: #0369a1; margin-bottom: 0.5rem;">Select a Country</h4>
          <p style="font-size: 0.85rem;">Click on any country in the map above to view detailed emission breakdowns and projections.</p>
        </div>
      </div>
    </div>
    </div><!-- /map-charts-connected -->

    <!-- ═══ THE WAY FORWARD ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="ep-eyebrow">The Way Forward</span>
      <h2 class="ep-section-title">Breaking the vicious cycle of heat, demand, and emissions.</h2>
      <p class="ep-body">Cooling-related climate impact is driven by two distinct streams: indirect emissions from the electricity used to power compressors and fans — currently responsible for roughly 70% of the sector's impact — and direct emissions from high-GWP refrigerant leaks, such as R-410A and R-22, during manufacturing, operation, maintenance and disposal. Tackling one without the other solves only half the problem, as air conditioning and refrigeration already account for over 1 GtCO₂e annually, particularly in fast-growing regions (e.g. South Asia, Africa, Southeast Asia) with fossil-heavy grids.</p>
      <p class="ep-body">Bending the emissions curve requires three simultaneous moves: shifting to ultra-low-GWP refrigerants, doubling equipment energy efficiency, and accelerating grid decarbonisation. According to the IEA Efficient Cooling Scenario, this integrated approach could avoid 460 GtCO₂e in cumulative emissions by 2060 — equivalent to eight years of current global energy-related output — and the data on this dashboard tracks our progress toward that critical trajectory.</p>

      <div class="cooling-pledge-badge">
        <div class="pledge-icon"><i class="fa-solid fa-handshake-angle"></i></div>
        <div class="pledge-content">
          <strong>Global Cooling Pledge Alignment</strong>
          <span>Target: {globalCoolingPledge.targetEmissionReduction} from BAU &middot; {globalCoolingPledge.signatoryCountries} signatory nations &middot; {globalCoolingPledge.targetEfficiencyIncrease}</span>
        </div>
        <a href={globalCoolingPledge.progressReportUrl} target="_blank" rel="noopener noreferrer" class="pledge-link">
          Progress Report <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    </div>

    <!-- Appliance Growth Chart -->
    <div class="ep-chart-wrapper">
      <div class="chart-card-header">
        <span class="ep-eyebrow" style="margin-bottom: 6px;">Appliance Growth</span>
        <h3 class="chart-card-title">Global Appliance Stock &amp; Emissions Trajectory</h3>
      </div>
      <div class="chart-card-body">
        <p class="chart-hint">Select an appliance type and metric to explore projected growth in stock, energy use, or emissions through 2050. Toggle the grid decarbonisation scenario to see its impact.</p>
        <ApplianceGrowthChart />
      </div>
    </div>

    <!-- ═══ RESOURCES ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="ep-eyebrow">Go Deeper</span>
      <h2 class="ep-section-title">Resources on Cooling &amp; Climate</h2>

      <div class="ep-resources-grid">
        <a href="https://www.unep.org/resources/report/global-cooling-watch-2025" target="_blank" rel="noopener noreferrer" class="ep-resource-card">
          <i class="fa-solid fa-arrow-up-right-from-square ep-resource-icon"></i>
          <div class="ep-resource-content">
            <strong class="ep-resource-title">UNEP Global Cooling Watch 2025</strong>
            <span class="ep-resource-desc">Report on the "Sustainable Cooling Pathway." Tracks global progress on the Global Cooling Pledge and provides the roadmap for reducing cooling emissions by 60–97%.</span>
          </div>
        </a>

        <a href="https://climateactiontracker.org" target="_blank" rel="noopener noreferrer" class="ep-resource-card">
          <i class="fa-solid fa-arrow-up-right-from-square ep-resource-icon"></i>
          <div class="ep-resource-content">
            <strong class="ep-resource-title">Climate Action Tracker (CAT)</strong>
            <span class="ep-resource-desc">Tool to track whether government climate action meets Paris Agreement goals. Provides a "thermometer" view of global warming based on current policies vs. required targets.</span>
          </div>
        </a>

        <a href="https://www.climatewatchdata.org" target="_blank" rel="noopener noreferrer" class="ep-resource-card">
          <i class="fa-solid fa-arrow-up-right-from-square ep-resource-icon"></i>
          <div class="ep-resource-content">
            <strong class="ep-resource-title">Climate Watch</strong>
            <span class="ep-resource-desc">Platform for visualising and comparing NDCs. Allows users to track historical emissions and see how countries are integrating cooling and HFC targets into climate roadmaps.</span>
          </div>
        </a>

        <a href="https://ozone.unep.org/topics/kigali-amendment" target="_blank" rel="noopener noreferrer" class="ep-resource-card">
          <i class="fa-solid fa-arrow-up-right-from-square ep-resource-icon"></i>
          <div class="ep-resource-content">
            <strong class="ep-resource-title">The Kigali Amendment (OzonAction)</strong>
            <span class="ep-resource-desc">Primary resource for tracking HFC phasedown schedules, country ratification status, and technical assistance for Article 5 countries.</span>
          </div>
        </a>

        <a href="https://www.iea.org/reports/the-future-of-cooling" target="_blank" rel="noopener noreferrer" class="ep-resource-card">
          <i class="fa-solid fa-arrow-up-right-from-square ep-resource-icon"></i>
          <div class="ep-resource-content">
            <strong class="ep-resource-title">IEA: The Future of Cooling</strong>
            <span class="ep-resource-desc">Essential for understanding the Efficient Cooling Scenario. Provides the data behind why doubling efficiency is necessary to mitigate the surge of 3 billion new AC units.</span>
          </div>
        </a>

        <a href="https://www.iea.org/reports/electricity-2026" target="_blank" rel="noopener noreferrer" class="ep-resource-card">
          <i class="fa-solid fa-arrow-up-right-from-square ep-resource-icon"></i>
          <div class="ep-resource-content">
            <strong class="ep-resource-title">IEA Electricity 2026 Report</strong>
            <span class="ep-resource-desc">Tracks the decarbonisation of the global power grid and how peak loads are affected by cooling.</span>
          </div>
        </a>

        <a href="https://cool-coalition.org/resources/beating-the-heat-handbook/" target="_blank" rel="noopener noreferrer" class="ep-resource-card">
          <i class="fa-solid fa-arrow-up-right-from-square ep-resource-icon"></i>
          <div class="ep-resource-content">
            <strong class="ep-resource-title">Cool Coalition: Beating the Heat Handbook</strong>
            <span class="ep-resource-desc">Practical guide for passive cooling strategies that can reduce indoor temperatures by 5–8°C.</span>
          </div>
        </a>

        <a href="https://www.ccacoalition.org/resources/guidance-sustainable-cooling-ndcs" target="_blank" rel="noopener noreferrer" class="ep-resource-card">
          <i class="fa-solid fa-arrow-up-right-from-square ep-resource-icon"></i>
          <div class="ep-resource-content">
            <strong class="ep-resource-title">CCAC: Guidance on Sustainable Cooling in NDCs</strong>
            <span class="ep-resource-desc">Framework for countries to integrate cooling into NDCs, ensuring HFC phasedowns and efficiency gains are anchored in Paris commitments.</span>
          </div>
        </a>
      </div>

      <!-- Data Partners -->
      <div class="emissions-partner-bar">
        <div class="emissions-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="emissions-partner-title">Data Partners</span>
        </div>
        <div class="emissions-partner-logos">
          {#each emissionsPartners as partner (partner.id)}
            <a href={partner.coolingUrl} target="_blank" rel="noopener noreferrer" class="emissions-partner-logo" title={partner.fullName}>
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>

      <div class="emissions-source-footer">
        Sources:
        <a href="https://www.clasp.ngo/tools/mepsy/" target="_blank" rel="noopener noreferrer">CLASP Mepsy (indirect)</a>
        &middot;
        <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH (direct)</a>
        &middot;
        <a href="https://www.iea.org/reports/world-energy-outlook-2025" target="_blank" rel="noopener noreferrer">IEA STEPS (grid)</a>
        &middot;
        <a href="/methodology">Methodology</a>
      </div>
    </div>
  </div>
</section>

<style>
  /* ===========================
     DESIGN SYSTEM — matching OverviewPillar
     =========================== */
  .ep-eyebrow {
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #0369a1;
    display: inline-block;
    margin-bottom: 16px;
  }

  .ep-section-title {
    font-size: 2.2rem;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.025em;
    line-height: 1.15;
    margin: 0 0 20px;
  }

  .ep-body {
    font-size: 1rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.78;
    margin: 0 0 16px;
    max-width: 900px;
  }

  /* Chart wrapper — replaces card-panel for chart sections */
  .ep-chart-wrapper {
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    padding: 56px 64px;
  }

  @media (max-width: 768px) {
    .ep-chart-wrapper {
      padding: 32px 20px;
    }
  }

  /* ===========================
     RESOURCE CARDS GRID
     =========================== */
  .ep-resources-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin: 0 0 32px;
  }

  .ep-resource-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 0;
    padding: 20px 0;
    text-decoration: none;
    color: inherit;
  }

  .ep-resource-card:hover .ep-resource-title {
    color: #0284c7;
  }

  .ep-resource-icon {
    color: #0369a1;
    font-size: 0.82rem;
    margin-top: 3px;
    flex-shrink: 0;
  }

  .ep-resource-content {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .ep-resource-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.3;
  }

  .ep-resource-desc {
    font-size: 0.8rem;
    color: #475569;
    line-height: 1.55;
  }

  @media (max-width: 900px) {
    .ep-resources-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ===========================
     ANIMATED COUNTERS
     =========================== */
  .emissions-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  .emissions-counter-wrapper {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .revealed .emissions-counter-wrapper {
    opacity: 1;
    transform: translateY(0);
  }

  .emissions-counters :global(.counter-card) {
    background: linear-gradient(135deg, #fdf6f0 0%, #fafaf5 100%);
    border: 1px solid rgba(194, 91, 51, 0.15);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: 100px;
    padding: 1rem 0.75rem;
  }

  .emissions-counters :global(.counter-card:hover) {
    background: linear-gradient(135deg, #faf0e8 0%, #fdf6f0 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(194, 91, 51, 0.12);
  }

  .emissions-counters :global(.counter-display) {
    font-size: 1.8rem;
    color: #C25B33;
  }

  .emissions-counters :global(.counter-label) {
    font-size: 0.72rem;
    color: #8B5E3C;
  }

  .emissions-counters :global(.counter-tooltip) {
    background: #0f172a !important;
    color: #ffffff !important;
    z-index: 99999;
    box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3);
    opacity: 1 !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }

  /* ===========================
     COOLING PLEDGE BADGE
     =========================== */
  .cooling-pledge-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 0;
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s;
  }

  .revealed .cooling-pledge-badge {
    opacity: 1;
    transform: translateY(0);
  }

  .pledge-icon {
    font-size: 1.4rem;
    color: #16a34a;
    flex-shrink: 0;
  }

  .pledge-content {
    flex: 1;
    min-width: 0;
  }

  .pledge-content strong {
    display: block;
    font-size: 0.78rem;
    color: #15803d;
    font-weight: 700;
    margin-bottom: 0.15rem;
  }

  .pledge-content span {
    font-size: 0.72rem;
    color: #4d7c0f;
    line-height: 1.4;
  }

  .pledge-link {
    font-size: 0.72rem;
    color: #16a34a;
    text-decoration: none;
    font-weight: 600;
    white-space: nowrap;
    padding: 0.35rem 0.75rem;
    border: 1px solid #86efac;
    border-radius: 6px;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .pledge-link:hover {
    background: #16a34a;
    color: white;
    border-color: #16a34a;
  }

  .pledge-link i {
    margin-left: 0.3rem;
    font-size: 0.65rem;
  }

  /* ===========================
     PARTNER LOGOS BAR
     =========================== */
  .emissions-partner-bar {
    padding: 0.75rem 0;
    margin: 0 0 0.75rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
  }

  .revealed .emissions-partner-bar {
    opacity: 1;
    transform: translateY(0);
  }

  .emissions-partner-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.6rem;
  }

  .emissions-partner-header > i {
    color: #0369a1;
    font-size: 0.8rem;
  }

  .emissions-partner-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #333;
  }

  .emissions-partner-logos {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .emissions-partner-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
    transition: opacity 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
  }

  .emissions-partner-logo:hover {
    opacity: 1;
    transform: translateY(-2px);
  }

  .emissions-partner-logo img {
    max-width: 80px;
    max-height: 32px;
    object-fit: contain;
  }

  /* ===========================
     SOURCE ATTRIBUTION FOOTER
     =========================== */
  .emissions-source-footer {
    text-align: center;
    font-size: 0.68rem;
    color: #94a3b8;
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transition: opacity 0.6s ease 1.1s;
  }

  .revealed .emissions-source-footer {
    opacity: 1;
  }

  .emissions-source-footer a {
    color: #64748b;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .emissions-source-footer a:hover {
    color: #0369a1;
    border-bottom-color: #0369a1;
  }

  .emissions-source-footer a:last-child {
    color: #0369a1;
    font-weight: 600;
  }

  /* ===========================
     RESPONSIVE
     =========================== */
  /* ===========================
     SAVINGS DECOMPOSITION GRID
     Two charts side-by-side, stacks at narrower widths.
     min-width: 0 prevents grid blowout from ECharts inline px widths.
     =========================== */
  .savings-charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .savings-chart-col {
    min-width: 0; /* critical: lets grid items shrink past ECharts inline width */
    overflow: hidden;
  }

  @media (max-width: 1100px) {
    .savings-charts-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 1024px) {
    .emissions-counters {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .emissions-counters {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .emissions-counters :global(.counter-display) {
      font-size: 1.4rem;
    }

    .emissions-partner-logos {
      gap: 1rem;
    }

    .emissions-partner-logo img {
      max-width: 60px;
      max-height: 26px;
    }

    .cooling-pledge-badge {
      flex-direction: column;
      text-align: center;
    }
  }

  @media (max-width: 600px) {
    .emissions-counters {
      grid-template-columns: 1fr 1fr;
    }

    .emissions-counters :global(.counter-card) {
      min-height: 85px;
      padding: 0.75rem 0.5rem;
    }

    .emissions-counters :global(.counter-display) {
      font-size: 1.2rem;
    }

    .emissions-counters :global(.counter-label) {
      font-size: 0.65rem;
    }
  }
</style>

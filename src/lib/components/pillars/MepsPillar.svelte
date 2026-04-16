<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { VIEW_META } from '$lib/components/shared/config';
  import { STATUS, CHROME, NO_DATA, rgba } from '$lib/components/shared/colors';
  import AnimatedCounter from '$lib/components/hero/AnimatedCounter.svelte';
  import { pillarContent } from '$lib/data/pillar-content';
  import { partners } from '$lib/data/partner-data';
  import PillarHeader from '$lib/components/shared/PillarHeader.svelte';
  import PillarInsight from '$lib/components/shared/PillarInsight.svelte';
  import FurtherReading from '$lib/components/shared/FurtherReading.svelte';
  import MepsLevelChart from '$lib/components/charts/MepsLevelChart.svelte';
  import MepsByRegionChart from '$lib/components/charts/MepsByRegionChart.svelte';
  import MepsEquipmentChart from '$lib/components/charts/MepsEquipmentChart.svelte';
  import InverterByRegionChart from '$lib/components/charts/InverterByRegionChart.svelte';
  import InverterByCountryChart from '$lib/components/charts/InverterByCountryChart.svelte';
  import PeakLoadChart from '$lib/components/charts/PeakLoadChart.svelte';
  import type { AcInverterRecord, Meps, Country } from '$lib/services/dashboard-types';

  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;
  export let mepsRegionData: Array<{ name: string; meps: number; labels: number; total: number }> = [];
  export let mepsEquipmentData: Array<{ type: string; meps: number; labels: number }> = [];
  export let mepsShowRegionCard: boolean = true;
  export let mepsEquipmentCountryHtml: string = '';
  export let acInverterShare: AcInverterRecord[] = [];
  // Props providing raw MEPS records and country list for the D3 choropleth maps
  export let mepsData: Meps[] = [];
  export let countries: Country[] = [];

  // Compute inverter share by region (average per region, latest reading per country)
  $: inverterRegionData = (() => {
    const latestByCountry = new Map<string, { region: string; pct: number; yearEnd: number }>();
    acInverterShare.forEach(r => {
      if (!r.country_code || r.inverter_pct == null) return;
      const existing = latestByCountry.get(r.country_code);
      const ye = r.year_end ?? 0;
      if (!existing || ye > existing.yearEnd) {
        latestByCountry.set(r.country_code, { region: r.region || 'Unknown', pct: r.inverter_pct, yearEnd: ye });
      }
    });
    const regionMap = new Map<string, { sum: number; count: number }>();
    latestByCountry.forEach(({ region, pct }) => {
      if (!regionMap.has(region)) regionMap.set(region, { sum: 0, count: 0 });
      const e = regionMap.get(region)!;
      e.sum += pct; e.count++;
    });
    return Array.from(regionMap.entries())
      .map(([name, { sum, count }]) => ({ name, avg: Math.round(sum / count) }))
      .filter(r => r.name !== 'Unknown')
      .sort((a, b) => b.avg - a.avg);
  })();

  // Compute inverter share by country (top 15, latest reading per country)
  $: inverterCountryData = (() => {
    const latestByCountry = new Map<string, { name: string; pct: number; yearEnd: number }>();
    acInverterShare.forEach(r => {
      if (!r.country_code || r.inverter_pct == null) return;
      const existing = latestByCountry.get(r.country_code);
      const ye = r.year_end ?? 0;
      if (!existing || ye > existing.yearEnd) {
        latestByCountry.set(r.country_code, { name: r.country_name || r.country_code, pct: r.inverter_pct, yearEnd: ye });
      }
    });
    return Array.from(latestByCountry.values()).sort((a, b) => b.pct - a.pct);
  })();

  const meta = VIEW_META.meps;
  const mepsContent = pillarContent.meps;

  // Animated stat cards data
  const mepsStats = [
    {
      value: '3x',
      label: 'efficiency gap between best and worst',
      context: 'The best split AC on the market today achieves a CSPF above 8.0, while many markets still allow units below 3.0. Source: CLASP.'
    },
    {
      value: '1,300',
      label: 'TWh annual savings potential',
      context: 'If every country adopted MEPS at best-available-technology level, we avoid 1,300 TWh of annual electricity consumption -- roughly India\'s entire output. Source: CLASP.'
    },
    {
      value: '40%',
      label: 'demand reduction achievable',
      context: 'CLASP modelling shows cooling energy consumption drops 40-50% by 2050 with universal adoption of best-available MEPS, without reducing comfort or access.'
    },
    {
      value: '80+',
      label: 'countries with some form of MEPS',
      context: 'Over 80 countries have cooling-related Minimum Energy Performance Standards, but standards vary enormously in stringency, scope, and enforcement.'
    }
  ];

  // Chart highlights
  const chartHighlights = [
    {
      icon: 'fa-chart-bar',
      title: 'MEPS & Labels by Region',
      description: 'See which regions lead in policy adoption',
      color: '#0369a1'
    },
    {
      icon: 'fa-clock-rotate-left',
      title: 'MEPS Levels Over Time',
      description: 'Track how efficiency standards have evolved across major economies',
      color: '#0284c7'
    },
    {
      icon: 'fa-cogs',
      title: 'Equipment Type Coverage',
      description: 'Compare policy coverage across AC, Fridges, and Fans',
      color: '#0369a1'
    }
  ];

  // Filter MEPS-relevant partners: CCC first, HEAT last
  const mepsPartnerIds = ['ccc', 'clasp', 'u4e', 'iea', 'giz', 'heat'];
  const mepsPartners = mepsPartnerIds
    .map(id => partners.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  let revealed = false;
  let activeMapView: 'coverage' | 'inverter' = 'coverage';
  let mepsHasCountry = false; // tracks whether a country is selected (for prompt visibility)

  // Country sync — exposed after D3 init
  let _applyMepsCountry: ((code: string | null) => void) | null = null;
  let _initInverterMapLazy: (() => void) | null = null;
  let _inverterMapReady = false;
  $: { const _c = $page?.url?.searchParams?.get('country') ?? null; if (_applyMepsCountry) _applyMepsCountry(_c); }
  $: if (activeMapView === 'inverter' && _initInverterMapLazy && !_inverterMapReady) {
    _inverterMapReady = true;
    _initInverterMapLazy();
  }

  onMount(() => {
    // Reveal animation timer
    const revealTimer = setTimeout(() => {
      revealed = true;
    }, 150);

    // =========================================================
    // MEPS PILLAR — D3 MAP & ECHARTS INITIALIZATION
    // Extracted from _page_legacy.svelte onMount closure.
    // All functions are self-contained within this onMount so
    // they close over the reactive Svelte props (mepsData,
    // countries, acInverterShare) and local state variables
    // declared below.
    // =========================================================

    // ---- Local state (mirrors legacy page-level variables) ----
    let mepsRegionFilter = '';
    let mepsEquipmentTypes: string[] = [];
    let selectedMepsCountry = '';
    let mepsMapSvg: any = null;

    // ---- ECharts instance registry ----
    const charts: Record<string, any> = {};
    const chartObservers: Map<string, ResizeObserver> = new Map();

    // ---- Tooltip element (shared map tooltip in the DOM) ----
    const tooltip = document.getElementById('tooltip') as HTMLElement | null;

    // ---- Script loader helper ----
    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existing && existing.dataset.loaded) { resolve(); return; }
        const script = (existing || document.createElement('script')) as HTMLScriptElement;
        script.src = src;
        script.async = true;
        script.onload = () => { script.dataset.loaded = 'true'; resolve(); };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        if (!existing) document.head.appendChild(script);
      });

    // ---- ISO numeric → alpha-3 mapping (same as legacy page) ----
    const countryIdToCode: Record<string, string> = {
      '4': 'AFG', '8': 'ALB', '12': 'DZA', '16': 'ASM', '20': 'AND',
      '24': 'AGO', '28': 'ATG', '31': 'AZE', '32': 'ARG', '36': 'AUS',
      '40': 'AUT', '44': 'BHS', '48': 'BHR', '50': 'BGD', '51': 'ARM',
      '56': 'BEL', '60': 'BMU', '64': 'BTN', '68': 'BOL', '70': 'BIH',
      '72': 'BWA', '76': 'BRA', '84': 'BLZ', '86': 'IOT', '90': 'SLB',
      '96': 'BRN', '100': 'BGR', '104': 'MMR', '108': 'BDI', '112': 'BLR',
      '116': 'KHM', '120': 'CMR', '124': 'CAN', '132': 'CPV', '140': 'CAF',
      '144': 'LKA', '148': 'TCD', '152': 'CHL', '156': 'CHN', '170': 'COL',
      '174': 'COM', '178': 'COG', '180': 'COD', '188': 'CRI', '191': 'HRV',
      '192': 'CUB', '196': 'CYP', '203': 'CZE', '204': 'BEN', '208': 'DNK',
      '214': 'DOM', '218': 'ECU', '222': 'SLV', '226': 'GNQ', '231': 'ETH',
      '232': 'ERI', '233': 'EST', '238': 'FLK', '242': 'FJI', '246': 'FIN',
      '250': 'FRA', '266': 'GAB', '268': 'GEO', '276': 'DEU', '288': 'GHA',
      '300': 'GRC', '320': 'GTM', '324': 'GIN', '328': 'GUY', '332': 'HTI',
      '340': 'HND', '348': 'HUN', '356': 'IND', '360': 'IDN', '364': 'IRN',
      '368': 'IRQ', '372': 'IRL', '376': 'ISR', '380': 'ITA', '384': 'CIV',
      '388': 'JAM', '392': 'JPN', '400': 'JOR', '398': 'KAZ', '404': 'KEN',
      '408': 'PRK', '410': 'KOR', '414': 'KWT', '417': 'KGZ', '418': 'LAO',
      '422': 'LBN', '426': 'LSO', '428': 'LVA', '430': 'LBR', '434': 'LBY',
      '440': 'LTU', '442': 'LUX', '450': 'MDG', '454': 'MWI', '458': 'MYS',
      '462': 'MDV', '466': 'MLI', '470': 'MLT', '484': 'MEX', '496': 'MNG',
      '504': 'MAR', '508': 'MOZ', '516': 'NAM', '524': 'NPL', '528': 'NLD',
      '540': 'NCL', '554': 'NZL', '558': 'NIC', '562': 'NER', '566': 'NGA',
      '578': 'NOR', '586': 'PAK', '591': 'PAN', '598': 'PNG', '600': 'PRY',
      '604': 'PER', '608': 'PHL', '616': 'POL', '620': 'PRT', '630': 'PRI',
      '634': 'QAT', '642': 'ROU', '643': 'RUS', '646': 'RWA', '682': 'SAU',
      '686': 'SEN', '694': 'SLE', '703': 'SVK', '705': 'SVN', '706': 'SOM',
      '710': 'ZAF', '716': 'ZWE', '724': 'ESP', '729': 'SDN', '740': 'SUR',
      '752': 'SWE', '756': 'CHE', '760': 'SYR', '762': 'TJK', '764': 'THA',
      '768': 'TGO', '780': 'TTO', '788': 'TUN', '792': 'TUR', '800': 'UGA',
      '804': 'UKR', '784': 'ARE', '826': 'GBR', '834': 'TZA', '840': 'USA',
      '854': 'BFA', '858': 'URY', '860': 'UZB', '862': 'VEN', '704': 'VNM',
      '887': 'YEM', '894': 'ZMB', '970': 'SSD', '275': 'PSE', '807': 'MKD',
      '499': 'MNE', '688': 'SRB', '478': 'MRT', '480': 'MUS'
    };

    function normalizeId(id: string | number | null | undefined): string {
      if (id === undefined || id === null) return '';
      const num = parseInt(String(id), 10);
      if (isNaN(num)) return String(id);
      return String(num);
    }

    // ---- Region merge map ----
    const REGION_MAP: Record<string, string> = {
      'Eastern Asia': 'Asia', 'South-eastern Asia': 'Asia', 'Southern Asia': 'Asia',
      'Central Asia': 'Asia', 'East Asia & Pacific': 'Asia', 'South Asia': 'Asia',
      'East Asia': 'Asia', 'Southeast Asia': 'Asia', 'Asia': 'Asia',
      'Sub-Saharan Africa': 'Africa', 'Northern Africa': 'Africa', 'North Africa': 'Africa', 'Africa': 'Africa',
      'Latin America': 'Americas', 'Latin America & Caribbean': 'Americas', 'Northern America': 'Americas',
      'North America': 'Americas', 'Central America': 'Americas', 'South America': 'Americas',
      'Caribbean': 'Americas', 'Americas': 'Americas',
      'EU': 'Europe', 'Non-EU': 'Europe', 'Europe & Central Asia': 'Europe',
      'Western Europe': 'Europe', 'Eastern Europe': 'Europe', 'Europe': 'Europe',
      'Middle East & North Africa': 'Middle East', 'Middle East': 'Middle East',
      'Australia and New Zealand': 'Oceania', 'Polynesia': 'Oceania', 'Melanesia': 'Oceania',
      'Micronesia': 'Oceania', 'Oceania': 'Oceania', 'Pacific': 'Oceania'
    };

    function getMergedRegion(region: string | undefined | null): string {
      if (!region) return 'Other';
      return REGION_MAP[region] || 'Other';
    }

    // ---- Policy record classification helpers ----
    function isMepsRecord(r: Meps): boolean {
      return !!(r.policy_instrument?.includes('MEPS') || r.policy_instrument?.includes('Minimum Performance Standard'));
    }

    function isLabelRecord(r: Meps): boolean {
      return !!(r.policy_instrument?.includes('Label'));
    }

    // ---- Filter helpers (operate on the mepsData prop) ----
    function getFilteredMeps(): Meps[] {
      return mepsData.filter(m => {
        if (mepsRegionFilter && m.region !== mepsRegionFilter) return false;
        if (!mepsEquipmentTypes.includes(m.equipment_type || '')) return false;
        return true;
      });
    }

    function getMapFilteredMeps(): Meps[] {
      return mepsData.filter(m => {
        if (mepsRegionFilter && m.region !== mepsRegionFilter) return false;
        if (!mepsEquipmentTypes.includes(m.equipment_type || '')) return false;
        return true;
      });
    }

    // ---- MEPS status / colour helpers ----
    function getMepsStatus(code: string | undefined): { level: string; label: string } {
      if (!code) return { level: 'none', label: 'No Data' };
      const records = getMapFilteredMeps().filter(m => m.country_code === code);
      if (!records.length) return { level: 'critical', label: 'No Policies' };
      const hasMeps = records.some(r => isMepsRecord(r));
      const hasLabel = records.some(r => isLabelRecord(r));
      if (hasMeps && hasLabel) return { level: 'both', label: 'MEPS & Labels' };
      if (hasMeps) return { level: 'meps', label: 'MEPS Only' };
      if (hasLabel) return { level: 'labels', label: 'Labels Only' };
      return { level: 'limited', label: 'Other Policies' };
    }

    function getMepsColor(level: string): string {
      switch (level) {
        case 'both':     return STATUS.ADVANCED;
        case 'meps':     return '#2563eb';
        case 'labels':   return STATUS.DEVELOPING;
        case 'limited':  return STATUS.MINIMAL;
        case 'critical': return '#e5e7eb';
        default:         return NO_DATA;
      }
    }

    // ---- ECharts helpers ----
    const getChartEl = (id: string) => document.getElementById(id) as HTMLDivElement | null;

    const setChart = (id: string, option: any) => {
      const el = getChartEl(id);
      if (!el) return;
      let needsInit = !charts[id];
      if (!needsInit && charts[id].getDom && charts[id].getDom() !== el) {
        if (chartObservers.has(id)) { chartObservers.get(id)!.disconnect(); chartObservers.delete(id); }
        charts[id].dispose();
        needsInit = true;
      }
      if (needsInit) {
        el.style.width = '';
        if (!el.style.height) el.style.height = el.style.minHeight || '280px';
        void el.offsetWidth;
        const echartsLib = (window as any).__echartsLib;
        if (!echartsLib) return;
        charts[id] = echartsLib.init(el);
      }
      charts[id].setOption(option, true);
      if (needsInit && !chartObservers.has(id)) {
        const obs = new ResizeObserver(() => {
          if (!charts[id]) return;
          const w = el.clientWidth;
          const h = el.clientHeight || parseInt(el.style.minHeight) || 280;
          if (w > 10 && h > 10) charts[id].resize({ width: w, height: h });
        });
        obs.observe(el);
        chartObservers.set(id, obs);
      }
    };

    // ---- Legend & progress bar updates ----
    function updateMepsLegend() {
      const legend = document.getElementById('meps-legend');
      if (!legend) return;
      legend.innerHTML = `
        <div class="legend-item"><div class="legend-color" style="background:${STATUS.ADVANCED}"></div>MEPS &amp; Labels</div>
        <div class="legend-item"><div class="legend-color" style="background:${STATUS.GOOD}"></div>MEPS Only</div>
        <div class="legend-item"><div class="legend-color" style="background:${STATUS.DEVELOPING}"></div>Labels Only</div>
      `;
    }

    function updateMepsProgress() {
      const setWidth = (id: string, pct: number) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${pct}%`;
      };
      const codes = new Set(countries.map(c => c.country_code));
      const total = codes.size;
      const counts = { both: 0, meps: 0, labels: 0, critical: 0 };
      codes.forEach(code => {
        const status = getMepsStatus(code);
        if (status.level === 'both') counts.both++;
        else if (status.level === 'meps') counts.meps++;
        else if (status.level === 'labels') counts.labels++;
        else if (status.level === 'critical') counts.critical++;
      });
      if (!total) {
        setWidth('meps-progress-both', 0); setWidth('meps-progress-meps', 0);
        setWidth('meps-progress-labels', 0); setWidth('meps-progress-critical', 0);
        return;
      }
      setWidth('meps-progress-both', (counts.both / total) * 100);
      setWidth('meps-progress-meps', (counts.meps / total) * 100);
      setWidth('meps-progress-labels', (counts.labels / total) * 100);
      setWidth('meps-progress-critical', (counts.critical / total) * 100);
    }

    // ---- Map colour update ----
    function updateMepsMap() {
      if (!mepsMapSvg) return;
      const d3Lib = (window as any).d3;
      if (!d3Lib) return;
      mepsMapSvg.selectAll('.country-path')
        .transition().duration(300)
        .attr('fill', function(this: any) {
          const code = d3Lib.select(this).attr('data-code');
          const status = getMepsStatus(code);
          return getMepsColor(status.level);
        });
      updateMepsLegend();
      updateMepsProgress();
    }

    // ---- KPI helpers ----
    function getMepsKPIs() {
      const filtered = getFilteredMeps();
      return {
        countriesWithMeps: new Set(filtered.map(m => m.country_code)).size,
        totalPolicies: filtered.length,
        mepsCount: filtered.filter(r => isMepsRecord(r)).length,
        labelsCount: filtered.filter(r => isLabelRecord(r)).length
      };
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

    // ---- Meta pills / filter status bar ----
    function updateMepsMetaPills() {
      const regionPill = document.getElementById('meps-meta-region');
      const equipPill = document.getElementById('meps-meta-equipment');
      if (regionPill) regionPill.innerHTML = `<i class="fa-solid fa-earth-americas"></i> ${mepsRegionFilter || 'All Regions'}`;
      if (equipPill) {
        const activeEquip = mepsEquipmentTypes.length;
        const totalEquip = 3;
        const equipText = activeEquip === 0 || activeEquip === totalEquip ? 'All Equipment' : `${activeEquip}/${totalEquip} Equipment`;
        equipPill.innerHTML = `<i class="fa-solid fa-cogs"></i> ${equipText}`;
      }
      updateMepsFilterStatusBar();
    }

    function updateMepsFilterStatusBar() {
      const regionTag = document.getElementById('meps-filter-region');
      const equipTag = document.getElementById('meps-filter-equipment');
      if (regionTag) regionTag.innerHTML = `<i class="fa-solid fa-earth-americas"></i> ${mepsRegionFilter || 'All Regions'}`;
      if (equipTag) {
        const activeEquip = mepsEquipmentTypes.length;
        const totalEquip = 3;
        const equipText = activeEquip === 0 || activeEquip === totalEquip ? 'All Equipment' : `${activeEquip}/${totalEquip} Equipment`;
        equipTag.innerHTML = `<i class="fa-solid fa-cogs"></i> ${equipText}`;
      }
      const statusTitle = document.getElementById('meps-status-title');
      if (statusTitle) statusTitle.textContent = 'Product Efficiency Analysis';
    }

    function updateMepsKpiTitle() {
      const titleEl = document.getElementById('meps-kpi-title');
      if (!titleEl) return;
      titleEl.innerHTML = `<i class="fa-solid fa-globe"></i> Global View`;
    }

    // ---- Global MEPS detail panel ----
    function showGlobalMepsDetail() {
      mepsHasCountry = false;
      const parentEl = document.getElementById('meps-country-detail') as HTMLElement | null;
      if (parentEl) parentEl.style.display = 'none';
    }

    // ---- Country detail panel ----
    function updateMepsCountryDetail(code: string) {
      selectedMepsCountry = code;
      const parentEl = document.getElementById('meps-country-detail') as HTMLElement | null;
      const container = parentEl?.querySelector('.country-detail') as HTMLElement | null;
      if (!container || !parentEl) return;

      // Show detail, hide prompt (via Svelte reactive variable)
      mepsHasCountry = true;
      parentEl.style.display = 'block';

      const country = countries.find(c => c.country_code === code);
      const allRecords = mepsData.filter(m => m.country_code === code);

      if (!country) {
        container.innerHTML = `<div style="padding:1rem;color:#64748b;">No data for ${code}</div>`;
        return;
      }

      const status = getMepsStatus(code);
      const statusColor = getMepsColor(status.level);
      const equipTypes = ['Air Conditioning', 'Domestic Refrigeration', 'Fans'];
      const equipColors: Record<string, string> = { 'Air Conditioning': '#2D7D5A', 'Domestic Refrigeration': '#52B788', 'Fans': '#D4A843' };
      const equipIcons: Record<string, string> = { 'Air Conditioning': 'fa-snowflake', 'Domestic Refrigeration': 'fa-temperature-low', 'Fans': 'fa-fan' };

      let html = `<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;padding:1rem 1.25rem;border-bottom:1px solid rgba(0,0,0,0.07);background:#fff;">
        <div style="display:flex;align-items:center;gap:1rem;">
          <div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#e0f2fe,#bae6fd);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="fa-solid fa-location-dot" style="color:#0284c7;font-size:1.1rem;"></i>
          </div>
          <div>
            <div style="display:flex;align-items:baseline;gap:0.5rem;">
              <span style="font-size:1.15rem;font-weight:800;color:#0f172a;letter-spacing:-0.01em;">${country.country_name}</span>
              <span style="font-size:0.75rem;font-weight:500;color:#64748b;background:#f1f5f9;padding:0.15rem 0.5rem;border-radius:999px;">${country.region || ''}</span>
            </div>
            <div style="margin-top:0.25rem;display:flex;align-items:center;gap:0.5rem;">
              <span style="font-size:0.8rem;font-weight:700;color:${statusColor};background:${statusColor}18;padding:0.15rem 0.6rem;border-radius:999px;border:1px solid ${statusColor}30;">${status.label}</span>
              <span style="font-size:0.78rem;color:#64748b;">${allRecords.length} ${allRecords.length === 1 ? 'policy' : 'policies'} on record</span>
            </div>
          </div>
        </div>
      </div>
      <div style="padding:1rem 1.25rem;">`;

      if (allRecords.length === 0) {
        html += `<div style="text-align:center;padding:2rem;color:#64748b;"><i class="fa-solid fa-circle-info" style="font-size:1.5rem;margin-bottom:0.5rem;display:block;color:#0284c7;"></i><strong style="display:block;margin-bottom:0.25rem;color:#0f172a;">No policies recorded</strong><span style="font-size:0.85rem;">This country has no MEPS or labelling policies in the database.</span></div>`;
      } else {
        html += `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem;">`;
        equipTypes.forEach(et => {
          const appRecs = allRecords.filter(r => r.equipment_type === et);
          if (appRecs.length === 0) return;
          const color = equipColors[et];
          const icon = equipIcons[et];
          const mepsR = appRecs.filter(r => isMepsRecord(r));
          const labelsR = appRecs.filter(r => isLabelRecord(r));
          const adoptedYears = appRecs.map(r => r.year_adopted).filter(Boolean) as number[];
          const firstAdopted = adoptedYears.length ? Math.min(...adoptedYears) : null;

          html += `<div style="border-top:2px solid ${color};padding-top:0.75rem;">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
              <i class="fa-solid ${icon}" style="color:${color};font-size:0.9rem;"></i>
              <span style="font-weight:700;font-size:0.9rem;color:#0f172a;">${et}</span>
              <span style="margin-left:auto;font-size:0.72rem;color:#64748b;background:#f1f5f9;padding:1px 7px;border-radius:10px;">${appRecs.length}</span>
            </div>
            <div style="display:flex;gap:0.4rem;margin-bottom:0.5rem;flex-wrap:wrap;">
              ${mepsR.length ? `<span style="font-size:0.7rem;background:#EBF4EE;color:#2D7D5A;padding:2px 7px;border-radius:4px;font-weight:600;">${mepsR.length} MEPS</span>` : ''}
              ${labelsR.length ? `<span style="font-size:0.7rem;background:#fef3d0;color:#D4A843;padding:2px 7px;border-radius:4px;font-weight:600;">${labelsR.length} Labels</span>` : ''}
              ${firstAdopted ? `<span style="font-size:0.7rem;color:#94a3b8;">Since ${firstAdopted}</span>` : ''}
            </div>`;
          appRecs.forEach(r => {
            const name = r.policy_name || 'Unnamed Policy';
            const truncName = name.length > 80 ? name.substring(0, 77) + '...' : name;
            const hasMep = isMepsRecord(r);
            const bColor = hasMep ? '#2D7D5A' : '#D4A843';
            html += `<div style="border-left:3px solid ${bColor};padding:0.3rem 0 0.3rem 0.6rem;margin-bottom:0.35rem;">
              <div style="font-size:0.77rem;color:#1e293b;line-height:1.4;">${truncName}</div>
              <div style="display:flex;gap:0.35rem;align-items:center;margin-top:0.15rem;flex-wrap:wrap;">
                ${hasMep ? `<span style="font-size:0.62rem;background:#EBF4EE;color:#2D7D5A;padding:1px 5px;border-radius:3px;font-weight:600;">MEPS</span>` : ''}
                ${isLabelRecord(r) ? `<span style="font-size:0.62rem;background:#fef3d0;color:#D4A843;padding:1px 5px;border-radius:3px;font-weight:600;">Label</span>` : ''}
                ${r.requirement_type ? `<span style="font-size:0.62rem;background:#f1f5f9;color:#475569;padding:1px 5px;border-radius:3px;">${r.requirement_type}</span>` : ''}
                ${r.year_adopted ? `<span style="font-size:0.62rem;color:#64748b;">${r.year_adopted}${r.year_revised && r.year_revised !== r.year_adopted ? ' (rev. ' + r.year_revised + ')' : ''}</span>` : ''}
              </div>
            </div>`;
          });
          html += `</div>`;
        });
        html += `</div>`;
      }
      html += `</div>`;
      container.innerHTML = html;
    }

    // ---- Country charts (timeline + policy details) ----
    function updateMepsCountryCharts(code: string, records: Meps[]) {
      const country = countries.find(c => c.country_code === code);
      const countryName = country?.country_name || code;
      const equipTypes = ['Air Conditioning', 'Domestic Refrigeration', 'Fans'];
      const equipShort: Record<string, string> = { 'Air Conditioning': 'AC', 'Domestic Refrigeration': 'Fridge', 'Fans': 'Fans' };
      const equipColors: Record<string, string> = { 'Air Conditioning': '#2D7D5A', 'Domestic Refrigeration': '#52B788', 'Fans': '#D4A843' };

      // Update chart title elements
      const chart2Title = document.getElementById('meps-chart2-title');
      if (chart2Title) {
        chart2Title.innerHTML = `<span style="background:linear-gradient(135deg,${STATUS.ADVANCED},${STATUS.GOOD});color:white;padding:0.25rem 0.6rem;border-radius:4px;margin-right:0.4rem;">${countryName}</span> Policy Timeline`;
      }
      const setTitle = (id: string, text: string) => { const el = document.getElementById(id); if (el) el.textContent = text; };
      setTitle('meps-chart2-subtitle', 'When MEPS and Labels were introduced');
      const chart3Title = document.getElementById('meps-chart3-title');
      if (chart3Title) {
        chart3Title.innerHTML = `<span style="background:linear-gradient(135deg,${STATUS.ADVANCED},${STATUS.GOOD});color:white;padding:0.25rem 0.6rem;border-radius:4px;margin-right:0.4rem;">${countryName}</span> Policy Details`;
      }
      setTitle('meps-chart3-subtitle', 'Complete breakdown by appliance, instrument and status');

      mepsShowRegionCard = false;

      // Build timeline scatter series
      const timelineEvents: { year: number; name: string; equip: string; isMeps: boolean }[] = [];
      records.forEach(r => {
        const year = r.year_adopted || r.year_revised;
        if (!year) return;
        const name = r.policy_name || r.equipment_type || 'Policy';
        const equip = r.equipment_type || '';
        if (isMepsRecord(r)) timelineEvents.push({ year, name, equip, isMeps: true });
        if (isLabelRecord(r)) timelineEvents.push({ year, name, equip, isMeps: false });
      });

      const allEventYears = timelineEvents.map(e => e.year).filter(Boolean);
      const minYear = allEventYears.length ? Math.min(...allEventYears) : 2000;
      const maxYear = allEventYears.length ? Math.max(...allEventYears) : 2025;

      const jitterMap: Record<string, number> = {};
      const getJitter = (year: number, catIdx: number) => {
        const key = `${year}_${catIdx}`;
        const idx = jitterMap[key] || 0;
        jitterMap[key] = idx + 1;
        if (idx === 0) return 0;
        const sign = idx % 2 === 1 ? 1 : -1;
        return sign * Math.ceil(idx / 2) * 0.12;
      };

      const tlSeries: any[] = [];
      equipTypes.forEach(et => {
        const short = equipShort[et];
        const color = equipColors[et];
        const mepsTimeData = timelineEvents
          .filter(e => e.equip === et && e.isMeps)
          .map(e => ({ value: [e.year, 1 + getJitter(e.year, 1)], name: e.name }));
        if (mepsTimeData.length > 0) {
          tlSeries.push({ name: `${short} MEPS`, type: 'scatter', symbolSize: 14, symbol: 'circle', color, data: mepsTimeData, label: { show: false } });
        }
        const labelData = timelineEvents
          .filter(e => e.equip === et && !e.isMeps)
          .map(e => ({ value: [e.year, 0 + getJitter(e.year, 0)], name: e.name }));
        if (labelData.length > 0) {
          tlSeries.push({ name: `${short} Label`, type: 'scatter', symbolSize: 14, symbol: 'diamond', color, data: labelData, label: { show: false } });
        }
      });

      setChart('chart-meps-timeline', {
        tooltip: { trigger: 'item', formatter: (params: any) => `<strong>${params.data.name}</strong><br>Year: ${params.data.value[0]}<br>${params.seriesName}` },
        legend: { data: tlSeries.map(s => s.name), top: 0, textStyle: { fontSize: 10 }, itemWidth: 14, itemHeight: 10 },
        grid: { left: 70, right: 20, bottom: 35, top: '22%' },
        xAxis: {
          type: 'value', min: minYear - 1, max: maxYear + 1,
          axisLabel: { fontSize: 12, fontWeight: 'bold' as const, color: '#1e293b', formatter: (v: number) => String(Math.round(v)) },
          axisLine: { show: true, lineStyle: { color: '#cbd5e1' } },
          axisTick: { show: true, lineStyle: { color: '#cbd5e1' } },
          splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.2 } }
        },
        yAxis: { type: 'value', min: -0.6, max: 1.6, splitNumber: 1, axisLabel: { show: false }, axisTick: { show: false }, axisLine: { show: false }, splitLine: { show: false } },
        series: [
          {
            type: 'scatter', data: [], silent: true,
            markLine: {
              silent: true, symbol: 'none', animation: false,
              data: [
                { yAxis: 0, label: { show: true, formatter: 'Labels', position: 'start', fontSize: 13, fontWeight: 'bold' as const, color: '#0f172a', padding: [0, 8, 0, 0] }, lineStyle: { color: '#0f172a', opacity: 0.25, type: 'solid', width: 1 } },
                { yAxis: 1, label: { show: true, formatter: 'MEPS', position: 'start', fontSize: 13, fontWeight: 'bold' as const, color: '#0f172a', padding: [0, 8, 0, 0] }, lineStyle: { color: '#0f172a', opacity: 0.25, type: 'solid', width: 1 } }
              ]
            }
          },
          ...tlSeries
        ]
      });

      // Build policy detail HTML cards and push to MepsEquipmentChart via prop
      let html = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;">`;
      equipTypes.forEach(et => {
        const appRecs = records.filter(r => r.equipment_type === et);
        const color = equipColors[et];
        const mepsR = appRecs.filter(r => isMepsRecord(r));
        const labelsR = appRecs.filter(r => isLabelRecord(r));
        const mandatory = appRecs.filter(r => r.requirement_type === 'Mandatory').length;
        const voluntary = appRecs.filter(r => r.requirement_type === 'Voluntary').length;
        const adoptedYears = appRecs.map(r => r.year_adopted).filter(Boolean) as number[];
        const revisedYears = appRecs.map(r => r.year_revised).filter(Boolean) as number[];
        const firstAdopted = adoptedYears.length ? Math.min(...adoptedYears) : null;
        const lastRevised = revisedYears.length ? Math.max(...revisedYears) : null;
        html += `<div style="border:none;border-top:1px solid rgba(0,0,0,0.06);padding:1rem 0;border-left:none;">`;
        html += `<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
          <span style="font-weight:700;font-size:0.95rem;color:${color}">${et}</span>
          <span style="margin-left:auto;font-size:0.75rem;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:10px;">${appRecs.length} ${appRecs.length === 1 ? 'policy' : 'policies'}</span>
        </div>`;
        if (appRecs.length === 0) {
          html += `<div style="color:#94a3b8;font-size:0.8rem;font-style:italic;">No policies for this appliance</div>`;
        } else {
          html += `<div style="display:flex;gap:0.75rem;margin-bottom:0.75rem;flex-wrap:wrap;">
            <div style="font-size:0.75rem;color:#334155;"><span style="color:${STATUS.ADVANCED};font-weight:700;">${mepsR.length}</span> MEPS</div>
            <div style="font-size:0.75rem;color:#334155;"><span style="color:${STATUS.DEVELOPING};font-weight:700;">${labelsR.length}</span> Labels</div>
            <div style="font-size:0.75rem;color:#334155;"><span style="font-weight:600;">${mandatory}</span> Mandatory</div>
            <div style="font-size:0.75rem;color:#334155;"><span style="font-weight:600;">${voluntary}</span> Voluntary</div>
          </div>`;
          if (firstAdopted || lastRevised) {
            html += `<div style="font-size:0.72rem;color:#64748b;margin-bottom:0.6rem;">`;
            if (firstAdopted) html += `First adopted: <strong>${firstAdopted}</strong>`;
            if (firstAdopted && lastRevised) html += ` &middot; `;
            if (lastRevised) html += `Last revised: <strong>${lastRevised}</strong>`;
            html += `</div>`;
          }
          appRecs.forEach(r => {
            const name = r.policy_name || 'Unnamed Policy';
            const truncName = name.length > 80 ? name.substring(0, 77) + '...' : name;
            const hasMep = isMepsRecord(r);
            const hasLbl = isLabelRecord(r);
            const borderColor = hasMep ? '#2D7D5A' : '#D4A843';
            const typeBadges: string[] = [];
            if (hasMep) typeBadges.push(`<span style="font-size:0.65rem;background:#EBF4EE;color:#2D7D5A;padding:1px 5px;border-radius:3px;font-weight:600;">MEPS</span>`);
            if (hasLbl) typeBadges.push(`<span style="font-size:0.65rem;background:#fef3d0;color:#D4A843;padding:1px 5px;border-radius:3px;font-weight:600;">Label</span>`);
            const reqBadge = r.requirement_type ? `<span style="font-size:0.65rem;background:#f1f5f9;color:#475569;padding:1px 5px;border-radius:3px;">${r.requirement_type}</span>` : '';
            html += `<div style="border-left:3px solid ${borderColor};padding:0.35rem 0 0.35rem 0.5rem;margin-bottom:0.4rem;background:transparent;border-radius:0;">
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
      mepsEquipmentCountryHtml = html;
    }

    // ---- Global chart update (region + equipment coverage charts) ----
    function updateMepsGlobalCharts() {
      const filtered = getFilteredMeps();

      const setTitle = (id: string, text: string) => { const el = document.getElementById(id); if (el) el.textContent = text; };
      setTitle('meps-chart2-title', 'Policy Adoption Timeline');
      setTitle('meps-chart2-subtitle', 'Cumulative MEPS & Labels adoption over time');
      setTitle('meps-chart3-title', 'Equipment Type Coverage');
      setTitle('meps-chart3-subtitle', 'Countries with MEPS vs Labels by appliance');

      mepsShowRegionCard = true;
      mepsEquipmentCountryHtml = '';

      const REGION_TOTALS: Record<string, number> = {
        'Asia': 49, 'Africa': 54, 'Americas': 35, 'Europe': 44, 'Middle East': 17, 'Oceania': 14
      };
      const regionStats: Record<string, { meps: Set<string>; labels: Set<string> }> = {};
      filtered.forEach(m => {
        const r = getMergedRegion(m.region);
        if (!regionStats[r]) regionStats[r] = { meps: new Set(), labels: new Set() };
        if (isMepsRecord(m)) regionStats[r].meps.add(m.country_code);
        if (isLabelRecord(m)) regionStats[r].labels.add(m.country_code);
      });
      const desiredOrder = ['Asia', 'Africa', 'Americas', 'Europe', 'Middle East', 'Oceania'];
      mepsRegionData = desiredOrder
        .filter(r => regionStats[r])
        .map(r => ({ name: r, meps: regionStats[r].meps.size, labels: regionStats[r].labels.size, total: REGION_TOTALS[r] || 1 }));

      // Cumulative timeline chart
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
        tooltip: { trigger: 'axis', formatter: (params: any) => { let tip = `<strong>${params[0].axisValue}</strong>`; params.forEach((p: any) => { tip += `<br>${p.marker} ${p.seriesName}: ${p.value}`; }); return tip; } },
        legend: { data: ['MEPS', 'Labels'], top: 5, textStyle: { fontSize: 11 } },
        grid: { left: '3%', right: '4%', bottom: '10%', top: '15%', containLabel: true },
        xAxis: { type: 'category', data: allYears.map(String), axisLabel: { fontSize: 10, interval: 'auto' } },
        yAxis: { type: 'value', name: 'Cumulative', nameTextStyle: { fontSize: 11 } },
        series: [
          { name: 'MEPS', type: 'line', data: cumMepsData, smooth: true, areaStyle: { opacity: 0.2 }, color: '#2D7D5A' },
          { name: 'Labels', type: 'line', data: cumLabelsData, smooth: true, areaStyle: { opacity: 0.2 }, color: '#D4A843' }
        ]
      });

      // Equipment coverage chart data
      const allMepsForEquipChart = mepsData.filter(m => {
        if (mepsRegionFilter && m.region !== mepsRegionFilter) return false;
        return true;
      });
      const equipTypes = ['Air Conditioning', 'Domestic Refrigeration', 'Fans'];
      mepsEquipmentData = equipTypes.map(et => ({
        type: et,
        meps: new Set(allMepsForEquipChart.filter(r => r.equipment_type === et && isMepsRecord(r)).map(r => r.country_code)).size,
        labels: new Set(allMepsForEquipChart.filter(r => r.equipment_type === et && isLabelRecord(r)).map(r => r.country_code)).size
      }));
    }

    // ---- Master MEPS update ----
    function updateMepsCharts() {
      if (selectedMepsCountry) {
        const records = mepsData.filter(m => m.country_code === selectedMepsCountry);
        updateMepsCountryCharts(selectedMepsCountry, records);
      } else {
        updateMepsGlobalCharts();
      }
    }

    function updateMepsView() {
      updateMepsKPIs();
      updateMepsMap();
      updateMepsCharts();
      updateMepsKpiTitle();
      updateMepsMetaPills();
      const viewingEl = document.getElementById('meps-viewing');
      if (viewingEl) viewingEl.textContent = mepsRegionFilter || 'Global';
    }

    // ---- Equipment type toggle filter initialisation ----
    function initMepsFilters() {
      const regionSelect = document.getElementById('meps-region-filter') as HTMLSelectElement | null;
      if (regionSelect) {
        const regions = new Set(mepsData.map(m => m.region).filter(Boolean));
        regionSelect.innerHTML = '<option value="">All Regions</option>';
        Array.from(regions).sort().forEach(r => {
          const opt = document.createElement('option');
          opt.value = r as string;
          opt.textContent = r as string;
          regionSelect.appendChild(opt);
        });
        regionSelect.addEventListener('change', () => {
          mepsRegionFilter = regionSelect.value;
          updateMepsView();
        });
      }

      const toggleContainer = document.getElementById('meps-equipment-toggles');
      if (toggleContainer) {
        const equipTypes = ['Air Conditioning', 'Domestic Refrigeration', 'Fans'];
        mepsEquipmentTypes = [...equipTypes];
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
              if (!mepsEquipmentTypes.includes(et)) mepsEquipmentTypes.push(et);
            } else {
              mepsEquipmentTypes = mepsEquipmentTypes.filter(e => e !== et);
            }
            updateMepsView();
          });
          toggleContainer.appendChild(btn);
        });
      }

      // "Select all" / "Select none" convenience buttons
      const mepsEquipAll = document.getElementById('meps-equip-all');
      if (mepsEquipAll) {
        mepsEquipAll.addEventListener('click', () => {
          mepsEquipmentTypes = ['Air Conditioning', 'Domestic Refrigeration', 'Fans'];
          document.querySelectorAll<HTMLButtonElement>('#meps-equipment-toggles .toggle-btn').forEach(btn => btn.classList.add('active'));
          updateMepsView();
        });
      }
      const mepsEquipNone = document.getElementById('meps-equip-none');
      if (mepsEquipNone) {
        mepsEquipNone.addEventListener('click', () => {
          mepsEquipmentTypes = [];
          document.querySelectorAll<HTMLButtonElement>('#meps-equipment-toggles .toggle-btn').forEach(btn => btn.classList.remove('active'));
          updateMepsView();
        });
      }
    }

    // ---- Map height constants: MEPS coverage is shorter (has appliance toggles above),
    //      Inverter is taller (fewer controls, needs the extra space). ----
    const MEPS_MAP_HEIGHT = 480;
    const INVERTER_MAP_HEIGHT = 450;
    const MAP_HEIGHT = INVERTER_MAP_HEIGHT; // fallback used when container is hidden at init

    // ---- MEPS choropleth D3 map ----
    async function initMepsMap(d3Lib: any, topojsonLib: any) {
      const container = document.getElementById('meps-map-container');
      if (!container) return;

      const width = container.clientWidth || 800;
      const height = container.clientHeight || MEPS_MAP_HEIGHT;

      mepsMapSvg = d3Lib.select('#meps-map-container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      const projection = d3Lib.geoNaturalEarth1()
        .fitExtent([[2, 2], [width - 2, height - 2]], { type: 'Sphere' });

      const path = d3Lib.geoPath().projection(projection);

      // Ocean click — deselect country and return to global view
      mepsMapSvg.append('rect')
        .attr('width', width).attr('height', height)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('click', () => {
          selectedMepsCountry = '';
          mepsMapSvg.selectAll('.country-path').classed('country-selected', false);
          showGlobalMepsDetail();
          updateMepsView();
          if (typeof (window as any).__dashboardClearCountry === 'function') {
            (window as any).__dashboardClearCountry();
          }
        });

      try {
        const world = await d3Lib.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
        const countriesGeo = topojsonLib.feature(world, world.objects.countries);
        countriesGeo.features = countriesGeo.features.filter((d: any) => d.properties?.name !== 'Antarctica' && countryIdToCode[normalizeId(d.id)] !== 'ATA');

        mepsMapSvg.selectAll('path')
          .data(countriesGeo.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('class', 'country-path')
          .attr('data-code', (d: any) => countryIdToCode[normalizeId(d.id)] || '')
          .attr('fill', (d: any) => {
            const code = countryIdToCode[normalizeId(d.id)];
            return getMepsColor(getMepsStatus(code).level);
          })
          .on('mouseover', (event: MouseEvent, d: any) => {
            const code = countryIdToCode[normalizeId(d.id)];
            const country = countries.find(c => c.country_code === code);
            const status = getMepsStatus(code);
            const allRecs = mepsData.filter(m => m.country_code === code);
            const mepsRecs = allRecs.filter(r => isMepsRecord(r));
            const labelRecs = allRecs.filter(r => isLabelRecord(r));
            const equips = [...new Set(allRecs.map(m => m.equipment_type).filter(Boolean))];
            let html = `<strong>${country?.country_name || code || 'Unknown'}</strong><br><span style="color:${getMepsColor(status.level)};font-weight:600">${status.label}</span>`;
            if (allRecs.length > 0) {
              html += `<br><span style="color:#ddd;font-size:0.85em">`;
              if (mepsRecs.length > 0) html += `MEPS: ${mepsRecs.length}`;
              if (mepsRecs.length > 0 && labelRecs.length > 0) html += ` | `;
              if (labelRecs.length > 0) html += `Labels: ${labelRecs.length}`;
              html += `</span>`;
              if (equips.length > 0) html += `<br><span style="font-size:0.8em">${equips.join(', ')}</span>`;
            }
            if (tooltip) {
              tooltip.innerHTML = html;
              (tooltip as any).style.opacity = 1;
              (tooltip as any).style.left = (event.pageX + 10) + 'px';
              (tooltip as any).style.top = (event.pageY + 10) + 'px';
            }
          })
          .on('mouseout', () => { if (tooltip) (tooltip as any).style.opacity = 0; })
          .on('click', (_event: MouseEvent, d: any) => {
            const code = countryIdToCode[normalizeId(d.id)];
            if (!code) return;
            const country = countries.find(c => c.country_code === code);
            if (!country) return;
            selectedMepsCountry = code;
            // Highlight selected country on map
            mepsMapSvg.selectAll('.country-path')
              .classed('country-selected', (pd: any) => countryIdToCode[normalizeId((pd as any).id)] === code);
            updateMepsCountryDetail(code);
            updateMepsView();
            if (typeof (window as any).__dashboardSetCountry === 'function') {
              (window as any).__dashboardSetCountry(code);
            }
          });

        updateMepsLegend();
        updateMepsProgress();
      } catch (error) {
        console.error('MEPS map error:', error);
      }
    }

    // ---- AC Inverter Share choropleth D3 map ----
    async function initInverterMap(d3Lib: any, topojsonLib: any) {
      const container = document.getElementById('inverter-map-container');
      if (!container) return;

      const width = container.clientWidth || 800;
      const height = container.clientHeight || MAP_HEIGHT;

      // Build latest-reading-per-country lookup from the acInverterShare prop
      const latestByCountry = new Map<string, { pct: number; nonPct: number | null; year: string; confidence: string; name: string; _yearEnd: number }>();
      acInverterShare.forEach((r: any) => {
        if (!r.country_code || r.inverter_pct == null) return;
        const existing = latestByCountry.get(r.country_code);
        const yearEnd = r.year_end ?? 0;
        if (!existing || yearEnd > existing._yearEnd) {
          latestByCountry.set(r.country_code, {
            pct: r.inverter_pct,
            nonPct: r.non_inverter_pct ?? null,
            year: r.year_label || String(r.year_end || ''),
            confidence: r.confidence || '',
            name: r.country_name || r.country_code,
            _yearEnd: yearEnd
          });
        }
      });

      function getInverterColor(pct: number | null): string {
        if (pct == null) return NO_DATA;
        if (pct >= 75) return STATUS.ADVANCED;   // forest green
        if (pct >= 50) return STATUS.GOOD;        // mint
        if (pct >= 25) return STATUS.DEVELOPING;  // amber
        return STATUS.NONE;                        // terracotta
      }

      const svg = d3Lib.select('#inverter-map-container')
        .append('svg')
        .attr('width', '100%').attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      const projection = d3Lib.geoNaturalEarth1()
        .fitSize([width, height], { type: 'Sphere' });

      const path = d3Lib.geoPath().projection(projection);

      try {
        const world = await d3Lib.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
        const countriesGeo = topojsonLib.feature(world, world.objects.countries);
        countriesGeo.features = countriesGeo.features.filter((d: any) => d.properties?.name !== 'Antarctica' && countryIdToCode[normalizeId(d.id)] !== 'ATA');

        svg.selectAll('path')
          .data(countriesGeo.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('fill', (d: any) => {
            const code = countryIdToCode[normalizeId(d.id)];
            const info = code ? latestByCountry.get(code) : null;
            return getInverterColor(info?.pct ?? null);
          })
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.4)
          .on('mouseover', (event: MouseEvent, d: any) => {
            const code = countryIdToCode[normalizeId(d.id)];
            const country = countries.find(c => c.country_code === code);
            const info = code ? latestByCountry.get(code) : null;
            let html = `<strong>${country?.country_name || info?.name || code || 'Unknown'}</strong><br>`;
            if (info) {
              html += `<span style="color:${STATUS.ADVANCED};font-weight:600">Inverter: ${info.pct.toFixed(1)}%</span>`;
              if (info.nonPct != null) html += `<br><span style="color:#ddd;font-size:0.85em">Non-inverter: ${info.nonPct.toFixed(1)}%</span>`;
              if (info.year) html += `<br><span style="font-size:0.8em">Year: ${info.year}</span>`;
              if (info.confidence) html += `<br><span style="font-size:0.8em">Confidence: ${info.confidence}</span>`;
            } else {
              html += `<span style="color:#aaa">No data available</span>`;
            }
            if (tooltip) {
              tooltip.innerHTML = html;
              (tooltip as any).style.opacity = 1;
              (tooltip as any).style.left = (event.pageX + 10) + 'px';
              (tooltip as any).style.top = (event.pageY + 10) + 'px';
            }
          })
          .on('mouseout', () => { if (tooltip) (tooltip as any).style.opacity = 0; });

        // Build inverter legend
        const legend = document.getElementById('inverter-legend');
        if (legend) {
          legend.innerHTML = `
            <div class="legend-item"><div class="legend-color" style="background:${getInverterColor(90)}"></div>&gt;75% Inverter</div>
            <div class="legend-item"><div class="legend-color" style="background:${getInverterColor(50)}"></div>~50%</div>
            <div class="legend-item"><div class="legend-color" style="background:${getInverterColor(15)}"></div>&lt;25% Inverter</div>
            <div class="legend-item"><div class="legend-color" style="background:${NO_DATA}"></div>No Data</div>
          `;
        }
      } catch (error) {
        console.error('Inverter map error:', error);
      }
    }

    // =========================================================
    // ASYNC INIT — load D3, TopoJSON, ECharts then run setup
    // =========================================================
    (async () => {
      try {
        await Promise.all(
          ['https://d3js.org/d3.v7.min.js', 'https://d3js.org/topojson.v3.min.js'].map(loadScript)
        );

        const d3Lib = (window as any).d3;
        const topojsonLib = (window as any).topojson;

        // Expose ECharts on window so setChart can find it
        const echartsModule = await import('echarts');
        (window as any).__echartsLib = echartsModule;

        // Initialise filters (populates equipment toggle buttons)
        initMepsFilters();

        // Render MEPS coverage map immediately (visible on load)
        await initMepsMap(d3Lib, topojsonLib);

        // If URL had a country selected before D3 loaded, apply map highlight now
        if (selectedMepsCountry && mepsMapSvg) {
          const _code = selectedMepsCountry;
          mepsMapSvg.selectAll('.country-path')
            .classed('country-selected', (pd: any) => countryIdToCode[normalizeId((pd as any).id)] === _code);
        }

        // Inverter map: lazy-init when user first switches to inverter tab
        _initInverterMapLazy = async () => {
          // Wait one animation frame so the container becomes visible before we read its dimensions
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
          const invContainer = document.getElementById('inverter-map-container');
          if (invContainer) invContainer.innerHTML = '';
          await initInverterMap(d3Lib, topojsonLib);
        };
        // If inverter tab is already active on mount, init immediately
        if (activeMapView === 'inverter') {
          _inverterMapReady = true;
          await initInverterMap(d3Lib, topojsonLib);
        }

        // Initial chart render (global view)
        updateMepsGlobalCharts();

        // Show placeholder in country detail panel
        showGlobalMepsDetail();

      } catch (err) {
        console.error('MepsPillar init error:', err);
      }
    })();

      // ── Country sync (URL ↔ map) ──────────────────────────────────────────
      function applyMepsCountry(code: string | null) {
        if (!code) {
          selectedMepsCountry = '';
          if (mepsMapSvg) mepsMapSvg.selectAll('.country-path').classed('country-selected', false);
          showGlobalMepsDetail();
          updateMepsView();
          return;
        }
        const country = countries.find(c => c.country_code === code);
        if (!country) return;
        selectedMepsCountry = code;
        // Highlight on map using data-code attribute (works after D3 has loaded)
        if (mepsMapSvg) {
          const d3Lib = (window as any).d3;
          if (d3Lib) {
            mepsMapSvg.selectAll('.country-path')
              .classed('country-selected', function(this: any) {
                return d3Lib.select(this).attr('data-code') === code;
              });
          }
        }
        updateMepsCountryDetail(code);
        updateMepsView();
      }
      _applyMepsCountry = applyMepsCountry;
      const _initMepsCountry = new URLSearchParams(window.location.search).get('country');
      if (_initMepsCountry) applyMepsCountry(_initMepsCountry);

    // =========================================================
    // CLEANUP — dispose ECharts instances and observers
    // =========================================================
    return () => {
      clearTimeout(revealTimer);
      chartObservers.forEach(obs => obs.disconnect());
      chartObservers.clear();
      Object.values(charts).forEach((chart: any) => {
        try { chart.dispose(); } catch (_) { /* ignore */ }
      });
      // Remove map SVGs to avoid duplicate renders on remount
      const mepsContainer = document.getElementById('meps-map-container');
      if (mepsContainer) mepsContainer.innerHTML = '';
      const inverterContainer = document.getElementById('inverter-map-container');
      if (inverterContainer) inverterContainer.innerHTML = '';
    };
  });
</script>

<section id="view-meps" class="view-section" class:active>
  <div class="pillar-stack">
    <!-- ═══ Ch01 THE CHALLENGE ═══ -->
    <div class="chapter-card" class:revealed style="border-top: none;">
      <span class="meps-eyebrow meps-eyebrow-xl">The Challenge</span>
      <h2 class="meps-section-title">Most of the global market still prioritises low-cost, inefficient cooling equipment.</h2>
      <p class="meps-body-text">To shift this trajectory, two tools must work in tandem: Minimum Energy Performance Standards (MEPS) that legally set a floor on efficiency, and Energy Labels that drive consumer demand toward top-performing products.</p>

      <div class="meps-explainer">
        <div class="meps-explainer-item">
          <div class="meps-explainer-icon"><i class="fa-solid fa-gauge-high"></i></div>
          <div>
            <strong>Minimum Energy Performance Standards (MEPS)</strong> set the efficiency floor: the least efficient product that can legally be sold. They remove inefficient equipment from the market entirely.
          </div>
        </div>
        <div class="meps-explainer-item">
          <div class="meps-explainer-icon"><i class="fa-solid fa-tag"></i></div>
          <div>
            <strong>Energy labels</strong> inform consumers and drive demand for better products. Labels without binding standards still leave the market open to the cheapest, least efficient units.
          </div>
        </div>
        <div class="meps-explainer-item">
          <div class="meps-explainer-icon"><i class="fa-solid fa-arrow-trend-up"></i></div>
          <div>
            <strong>Together</strong> they reduce energy bills, lower grid stress, support government procurement and rebates, and prevent locking in decades of energy waste from long-lived equipment.
          </div>
        </div>
      </div>

      <div class="meps-counters">
        {#each mepsStats as stat, i}
          <div class="meps-counter-wrapper" style="transition-delay: {200 + i * 100}ms">
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

    <!-- ═══ THE COST OF INACTION ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="meps-eyebrow">The Cost of Inaction</span>
      <h2 class="meps-section-title">Environmental Dumping</h2>
      <p class="meps-body-text">When standards are weak or nonexistent, it results in environmental dumping: manufacturers offload their least efficient models in unregulated markets. Every year, millions of these units are installed, locking in 10 to 15 years of excess energy consumption that no retrofit can resolve. With the efficiency gap between the best and worst products currently exceeding a factor of three, implementing robust MEPS and labels is the most effective way to prevent decades of energy waste and unnecessary grid stress.</p>
    </div>

    <!-- ═══ THE INVERTER REVOLUTION ═══ -->
    <div class="chapter-card meps-inverter-chapter" class:revealed>
      <span class="meps-eyebrow">The Story of Two Compressors</span>
      <h2 class="meps-section-title">The Inverter Revolution</h2>
      <p class="meps-body-text">For decades, the standard room air conditioner operated like a simple light switch: either 100% ON or OFF. When your room got too warm, the compressor would kick in with a massive surge of power, blast cold air until the target was reached, and then abruptly shut down. This "fixed-speed" cycle is notoriously inefficient — much like driving a car by flooring it and then slamming on the brakes repeatedly.</p>
      <p class="meps-body-text">The Inverter Revolution changed the game. Instead of a switch, an inverter acts like a dimmer. It uses a variable-speed drive to slow down or speed up the compressor based on the actual cooling need. Once the room is cool, the inverter keeps the compressor running at a low, ultra-efficient hum.</p>

      <div class="meps-inverter-stat-highlight">
        <div class="meps-inverter-stat-value">25–30%</div>
        <div class="meps-inverter-stat-label">energy savings over standard fixed-speed models</div>
        <div class="meps-inverter-stat-note">In high-performance units, savings can climb as high as 44%</div>
      </div>

      <p class="meps-body-text">By eliminating the wasteful start-stop cycles, inverter ACs typically achieve <strong>25–30% energy savings</strong> over standard fixed-speed models. In high-performance units, these savings can climb as high as 44%. For a typical household in a hot climate, this transition slashes electricity bills and reduces the "peak load" on national power grids.</p>
    </div>

    <!-- ═══ Ch02 GLOBAL COVERAGE ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="meps-eyebrow">Global Coverage</span>
      <h2 class="meps-section-title">Progress is real but deeply uneven across regions.</h2>
      <p class="meps-body-text">Over 80 countries now have some form of cooling-related efficiency standard, yet the gap between leaders and laggards is wider than ever. East Asia and the EU mandate inverter-class performance; large parts of South Asia, Africa, and Latin America still permit fixed-speed units that consume two to three times more energy. The map and charts below capture this patchwork — progress measured not in headlines, but in kilowatt-hours avoided and markets transformed.</p>

      <div class="meps-highlights-grid">
        {#each chartHighlights as highlight}
          <div class="meps-highlight-card">
            <div class="meps-highlight-icon" style="color: {highlight.color}">
              <i class="fa-solid {highlight.icon}"></i>
            </div>
            <div class="meps-highlight-text">
              <strong>{highlight.title}</strong>
              <span>{highlight.description}</span>
            </div>
          </div>
        {/each}
      </div>

      <div class="meps-regional-spotlights">
        <div class="meps-regional-card">
          <div class="meps-regional-icon" style="color: #D4A843">
            <i class="fa-solid fa-earth-asia"></i>
          </div>
          <div class="meps-regional-body">
            <strong class="meps-regional-title">ASEAN Harmonization</strong>
            <p>Southeast Asian economies are converging on shared MEPS frameworks through the ASEAN Economic Community. Thailand and Vietnam lead with mandatory inverter-class standards for room ACs. The Philippines updated its MEPS in 2023 to cover split ACs above 2 HP. Indonesia is implementing tiered efficiency labels linked to a future MEPS floor. CLASP and U4E are supporting the region toward common test protocols — a prerequisite for cross-border market harmonization that would allow manufacturers to produce to a single regional standard.</p>
          </div>
        </div>
        <div class="meps-regional-card">
          <div class="meps-regional-icon" style="color: #0369a1">
            <i class="fa-solid fa-earth-africa"></i>
          </div>
          <div class="meps-regional-body">
            <strong class="meps-regional-title">Africa — Bridging the Efficiency Gap</strong>
            <p>Africa is expected to see the world's fastest growth in cooling demand, making the standards set today decisive. Regional blocs and national governments are moving from fragmented rules to harmonised, high-ambition MEPS across all sub-regions. In West Africa, ECOWAS has adopted regional MEPS and shared compliance tools are emerging. East and Southern Africa have gazetted and approved regional MEPS and labels for ACs and refrigerators — including tiered requirements that tighten over time and alignment to UNEP-U4E best-practice guidance. North Africa is tightening and extending long-running national standards. Central Africa has initiated a regional MEPS development track.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- DATA: MEPS Stringency Chart -->
    <div class="meps-level-wrapper">
      <MepsLevelChart />
    </div>

    <!-- ═══ MAP INTRO ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="meps-eyebrow">Country & Regional View</span>
      <h2 class="meps-section-title">Explore the MEPS regulation of your country and region.</h2>
    </div>

    <!-- DATA: MEPS & Inverter Map -->
    <div class="card-panel map-card">
      <div class="card-header combined-map-header">
        <!-- Description highlight box — always on top -->
        <div class="map-view-description">
          <i class="fa-solid fa-sliders" style="margin-right: 0.5rem;"></i>
          Choose to see MEPS and levels of Refrigerators, Split ACs and Fans — or the share between variable and fixed speed AC.
        </div>
        <!-- Title + toggle buttons -->
        <div class="combined-map-header-top">
          <div class="card-title">
            {#if activeMapView === 'coverage'}
              <i class="fa-solid fa-bolt"></i> MEPS &amp; Labels Coverage
            {:else}
              <i class="fa-solid fa-snowflake"></i> AC Variable Speed Share
            {/if}
          </div>
          <div class="map-controls-row">
            <div class="map-view-toggle">
              <button type="button" class="map-toggle-btn" class:active={activeMapView === 'coverage'} on:click={() => activeMapView = 'coverage'}>
                <i class="fa-solid fa-bolt"></i> MEPS &amp; Labels
              </button>
              <button type="button" class="map-toggle-btn" class:active={activeMapView === 'inverter'} on:click={() => activeMapView = 'inverter'}>
                <i class="fa-solid fa-snowflake"></i> Variable Speed
              </button>
            </div>
          </div>
        </div>
        <!-- Equipment toggles — kept in DOM so JS can populate; hidden when inverter view active -->
        <div class="meps-map-toggles" style:display={activeMapView === 'coverage' ? '' : 'none'}>
          <div class="toggle-group" id="meps-equipment-toggles">
            <!-- Populated dynamically by initMepsFilters -->
          </div>
        </div>
      </div>

      <!-- MEPS Coverage map panel -->
      <div style:display={activeMapView === 'coverage' ? 'block' : 'none'}>
        <div id="meps-map-container" class="map-surface"></div>
        <div class="legend legend-row">
          <span class="legend-label">Policy Status:</span>
          <div id="meps-legend" class="legend-items"></div>
        </div>
        <div class="progress-bar" id="meps-progress">
          <span class="progress-segment" id="meps-progress-both" title="MEPS & Labels" style="background:#4A9088"></span>
          <span class="progress-segment" id="meps-progress-meps" title="MEPS Only" style="background:#2563eb"></span>
          <span class="progress-segment" id="meps-progress-labels" title="Labels Only" style="background:#D4A843"></span>
          <span class="progress-segment" id="meps-progress-critical" title="No Policies" style="background:#e5e7eb"></span>
        </div>
      </div>

      <!-- Inverter map panel -->
      <div style:display={activeMapView === 'inverter' ? 'block' : 'none'} style="padding-top: 1.5rem;">
        <div id="inverter-map-container" class="map-surface"></div>
        <div class="legend legend-row">
          <span class="legend-label">Inverter Share:</span>
          <div id="inverter-legend" class="legend-items"></div>
        </div>
      </div>
    </div>

    <!-- Country Detail (populated when clicking a country on the map) -->
    <div class="country-card-inline" id="meps-country-detail" style="display:none;">
      <div class="country-detail"></div>
    </div>

    <!-- Charts Grid — switches with the map toggle -->
    {#if activeMapView === 'coverage'}
      <div class="meps-country-select-prompt" id="meps-select-prompt" style:display={mepsHasCountry ? 'none' : 'flex'}>
        <i class="fa-solid fa-earth-americas meps-csp-icon"></i>
        <strong class="meps-csp-heading">Select a country on the map above</strong>
        <span class="meps-csp-sub">Explore its MEPS status and energy efficiency policy details</span>
      </div>
    {:else}
      <div class="meps-charts-section charts-section">
        <div class="inverter-chart-flat">
          <div class="chart-card-header">
            <h3><i class="fa-solid fa-snowflake" style="color: #0369a1; margin-right: 0.5rem;"></i>Inverter Share by Region</h3>
            <p class="chart-subtitle">Average share of variable-speed (inverter) ACs per region</p>
          </div>
          <div class="chart-card-body">
            <InverterByRegionChart data={inverterRegionData} />
          </div>
        </div>
        <div class="inverter-chart-flat">
          <div class="chart-card-header">
            <h3><i class="fa-solid fa-ranking-star" style="color: #0369a1; margin-right: 0.5rem;"></i>Top Countries — Inverter Penetration</h3>
            <p class="chart-subtitle">Countries with highest variable-speed AC market share (latest data)</p>
          </div>
          <div class="chart-card-body">
            <InverterByCountryChart data={inverterCountryData} />
          </div>
        </div>
      </div>
    {/if}

    <!-- ═══ Ch03 THE WAY FORWARD ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="meps-eyebrow meps-eyebrow-xl">The Way Forward</span>
      <h2 class="meps-section-title">Closing the Standards Gap: From Lock-in to Leapfrogging</h2>
      <p class="meps-body-text">Most of the global market remains trapped in a cycle of inefficiency. By the time a consumer buys a cooling unit, the climate impact is already largely determined by the market's "efficiency floor." Efficiency is measured by the Cooling Seasonal Performance Factor (CSPF) or Energy Efficiency Ratio (EER). While best-in-class split ACs achieve a CSPF above 8.0, many unregulated markets still permit units below 3.0. CLASP data suggests that if every nation adopted MEPS aligned with best available technology, we could cut cooling energy consumption by 40–50% by 2050 — avoiding over 1,300 TWh of annual electricity consumption.</p>
      <p class="meps-body-text">The primary barrier is a global patchwork of inconsistent standards. Over 80 countries have MEPS, but they vary wildly in stringency and enforcement. Closing this gap requires: (1) increasing MEPS stringency to match global benchmarks; (2) ensuring fans, refrigerators, and commercial chillers are covered; (3) strengthening capacity so standards exist in practice, not just on paper. Countries like Rwanda, Ghana, and Senegal are already demonstrating that nations can skip decades of incremental progress and move directly to high-efficiency standards by adopting U4E Model Regulation Guidelines.</p>
    </div>

    <!-- Peak Load Chart -->
    <div class="meps-chart-wrapper">
      <div class="chart-card-header">
        <span class="meps-eyebrow">Grid Impact</span>
        <h3 class="chart-card-title">Cooling as a Share of Peak Electricity Load</h3>
      </div>
      <div class="chart-card-body">
        <p class="chart-hint">This chart shows cooling's current and projected share of peak electricity demand by country. Hover over bars to see absolute values and growth projections.</p>
        <PeakLoadChart />
      </div>
    </div>

    <!-- ═══ RESOURCES ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="meps-eyebrow">Explore Global Standards and Initiatives</span>
      <h2 class="meps-section-title">Resources on Energy Efficiency Standards</h2>

      <div class="meps-resources-grid">
        <a href="https://united4efficiency.org/resources/model-regulation-guidelines/" target="_blank" rel="noopener noreferrer" class="meps-resource-card">
          <div class="meps-resource-icon"><i class="fa-solid fa-file-lines"></i></div>
          <div class="meps-resource-body">
            <strong class="meps-resource-title">U4E Model Regulation Guidelines</strong>
            <p class="meps-resource-desc">Ready-to-use regulatory templates for ACs and refrigerators designed specifically for developing and emerging economies.</p>
          </div>
        </a>
        <a href="https://cprc-clasp.ngo/" target="_blank" rel="noopener noreferrer" class="meps-resource-card">
          <div class="meps-resource-icon"><i class="fa-solid fa-globe"></i></div>
          <div class="meps-resource-body">
            <strong class="meps-resource-title">CLASP Policy Resource Center</strong>
            <p class="meps-resource-desc">Toolkits to compare MEPS and labelling requirements across countries and calculate carbon savings of shifting to higher standards.</p>
          </div>
        </a>
        <a href="https://www.iea.org/reports/energy-efficiency-2025" target="_blank" rel="noopener noreferrer" class="meps-resource-card">
          <div class="meps-resource-icon"><i class="fa-solid fa-chart-line"></i></div>
          <div class="meps-resource-body">
            <strong class="meps-resource-title">IEA: Energy Efficiency 2025/2026</strong>
            <p class="meps-resource-desc">Annual report providing the global benchmark for how efficiency is progressing across sectors, with latest CSPF and EER trend data.</p>
          </div>
        </a>
        <a href="https://www.iea.org/topics/energy-efficiency/policy-toolkit" target="_blank" rel="noopener noreferrer" class="meps-resource-card">
          <div class="meps-resource-icon"><i class="fa-solid fa-toolbox"></i></div>
          <div class="meps-resource-body">
            <strong class="meps-resource-title">IEA Energy Efficiency Policy Toolkit 2025</strong>
            <p class="meps-resource-desc">Interactive tool providing a "how-to" for implementing MEPS and labelling schemes, including quality infrastructure requirements.</p>
          </div>
        </a>
        <a href="https://www.aceee.org/research-report/b2401" target="_blank" rel="noopener noreferrer" class="meps-resource-card">
          <div class="meps-resource-icon"><i class="fa-solid fa-bolt"></i></div>
          <div class="meps-resource-body">
            <strong class="meps-resource-title">ACEEE: Grid-Interactive Efficient Buildings</strong>
            <p class="meps-resource-desc">Research on how high-efficiency cooling can reduce peak demand on the electrical grid.</p>
          </div>
        </a>
        <a href="https://superefficient.org/" target="_blank" rel="noopener noreferrer" class="meps-resource-card">
          <div class="meps-resource-icon"><i class="fa-solid fa-star"></i></div>
          <div class="meps-resource-body">
            <strong class="meps-resource-title">SEAD Initiative</strong>
            <p class="meps-resource-desc">Voluntary collaboration among governments to accelerate the market for highly efficient appliances. Shows which "Top Ten" products lead in efficiency.</p>
          </div>
        </a>
      </div>

      <div class="meps-partner-bar">
        <div class="meps-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="meps-partner-title">Data Partners</span>
        </div>
        <div class="meps-partner-logos">
          {#each mepsPartners as partner (partner.id)}
            <a href={partner.coolingUrl} target="_blank" rel="noopener noreferrer" class="meps-partner-logo" title={partner.fullName}>
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>

      <div class="meps-source-footer">
        Sources:
        <a href="https://cprc-clasp.ngo/" target="_blank" rel="noopener noreferrer">CLASP CPRC</a>
        &middot;
        <a href="https://united4efficiency.org/resources/model-regulation-guidelines/" target="_blank" rel="noopener noreferrer">U4E Model Regulations</a>
        &middot;
        <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
        &middot;
        <a href="/methodology">Methodology</a>
      </div>
    </div>
  </div>
</section>

<style>
  /* ===========================
     MEPS EXPLAINER ITEMS
     =========================== */
  .meps-explainer {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin: 0 0 1rem;
  }

  .meps-explainer-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 0;
    padding: 0.75rem 0;
    font-size: 0.82rem;
    color: #334155;
    line-height: 1.6;
  }

  .meps-explainer-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(3, 105, 161, 0.1);
    color: #0369a1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  /* ===========================
     ANIMATED COUNTER GRID
     Adapts the HeroSection counter pattern for a white/light background.
     =========================== */
  .meps-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  .meps-counter-wrapper {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .revealed .meps-counter-wrapper {
    opacity: 1;
    transform: translateY(0);
  }

  /* Override AnimatedCounter glassmorphic style for light background */
  .meps-counters :global(.counter-card) {
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-radius: 0;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: unset;
    padding: 1rem 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .meps-counters :global(.counter-card:hover) {
    background: transparent;
    transform: none;
    box-shadow: none;
  }

  .meps-counters :global(.counter-display) {
    font-size: 1.8rem;
    color: #0369a1;
  }

  .meps-counters :global(.counter-label) {
    font-size: 0.72rem;
    color: #0369a1;
  }

  .meps-counters :global(.counter-tooltip) {
    background: #0f172a !important;
    color: #ffffff !important;
    z-index: 99999;
    box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3);
    opacity: 1 !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }

  /* ===========================
     PARTNER LOGOS BAR
     Mirrors OverviewPillar partner-bar pattern.
     =========================== */
  .meps-partner-bar {
    padding: 0.75rem 0;
    margin: 0 0 0.75rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
  }

  .revealed .meps-partner-bar {
    opacity: 1;
    transform: translateY(0);
  }

  .meps-partner-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.6rem;
  }

  .meps-partner-header > i {
    color: #0369a1;
    font-size: 0.8rem;
  }

  .meps-partner-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #333;
  }

  .meps-partner-logos {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .meps-partner-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
    transition: opacity 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
  }

  .meps-partner-logo:hover {
    opacity: 1;
    transform: translateY(-2px);
  }

  .meps-partner-logo img {
    max-width: 80px;
    max-height: 32px;
    object-fit: contain;
  }

  /* ===========================
     SOURCE ATTRIBUTION FOOTER
     =========================== */
  .meps-source-footer {
    text-align: center;
    font-size: 0.68rem;
    color: #94a3b8;
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transition: opacity 0.6s ease 1.1s;
  }

  .revealed .meps-source-footer {
    opacity: 1;
  }

  .meps-source-footer a {
    color: #64748b;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .meps-source-footer a:hover {
    color: #0369a1;
    border-bottom-color: #0369a1;
  }

  .meps-source-footer a:last-child {
    color: #0369a1;
    font-weight: 600;
  }

  /* ===========================
     RESPONSIVE
     =========================== */
  @media (max-width: 1024px) {
    .meps-counters {
      grid-template-columns: repeat(2, 1fr);
    }

    .meps-highlights-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .meps-story-card {
      padding: 1.25rem;
    }

    .meps-headline {
      font-size: 1.1rem;
    }

    .meps-story-header {
      flex-direction: column;
      gap: 0.5rem;
    }

    .meps-counters {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .meps-counters :global(.counter-display) {
      font-size: 1.4rem;
    }

    .meps-partner-logos {
      gap: 1rem;
    }

    .meps-partner-logo img {
      max-width: 60px;
      max-height: 26px;
    }
  }

  @media (max-width: 600px) {
    .meps-counters {
      grid-template-columns: 1fr 1fr;
    }

    .meps-counters :global(.counter-card) {
      min-height: 85px;
      padding: 0.75rem 0.5rem;
    }

    .meps-counters :global(.counter-display) {
      font-size: 1.2rem;
    }

    .meps-counters :global(.counter-label) {
      font-size: 0.65rem;
    }
  }

  /* ===========================
     CHART HIGHLIGHTS GRID (inline icon + text)
     =========================== */
  .meps-highlights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    margin: 0 0 1.5rem;
  }

  .meps-highlight-card {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem 0.75rem 0;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  .meps-highlight-icon {
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 0.15rem;
    width: 18px;
    text-align: center;
  }

  .meps-highlight-text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .meps-highlight-text strong {
    font-size: 0.84rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.3;
  }

  .meps-highlight-text span {
    font-size: 0.76rem;
    color: #64748b;
    line-height: 1.5;
  }

  /* Regional spotlight cards */
  .meps-regional-spotlights {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 0.85rem;
  }

  .meps-regional-card {
    display: flex;
    gap: 0.75rem;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-radius: 0;
    padding: 1rem 0;
    align-items: flex-start;
  }

  .meps-regional-icon {
    font-size: 2rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
    opacity: 0.75;
  }

  .meps-regional-title {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.35rem;
  }

  .meps-regional-body p {
    font-size: 0.75rem;
    color: #475569;
    line-height: 1.65;
    margin: 0;
  }

  @media (max-width: 768px) {
    .meps-regional-spotlights {
      grid-template-columns: 1fr;
    }
  }

  /* Charts section - flat, no box */
  .meps-charts-section {
    background: transparent;
    padding: 1.25rem 0;
    border-radius: 0;
    border: none;
    box-sizing: border-box;
    max-width: 100%;
    overflow: hidden;
  }

  .meps-charts-section :global(.chart-card) {
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .meps-charts-section :global(.chart-card-body) {
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .meps-charts-section .inverter-chart-flat + .inverter-chart-flat {
    margin-top: 1.25rem;
    border-top: 1px solid #f1f5f9;
    padding-top: 1.25rem;
  }

  /* Inside the white charts section, individual chart blocks are flat (no nested card) */
  .meps-charts-section .inverter-chart-flat {
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  .card-subtitle-text {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.15rem;
  }

  /* ===========================
     DESIGN SYSTEM — NARRATIVE TYPOGRAPHY
     Matches OverviewPillar flow-eyebrow / flow-title pattern
     =========================== */
  :global(#view-meps .pillar-stack) {
    gap: 0;
  }

  :global(#view-meps .chapter-card) {
    padding-top: 40px;
    padding-bottom: 40px;
  }

  :global(#view-meps .map-card) {
    padding-left: 64px !important;
    padding-right: 64px !important;
  }

  .meps-level-wrapper {
    padding: 0 64px;
  }


  :global(#meps-country-detail) {
    padding-left: 64px !important;
    padding-right: 64px !important;
  }

  .meps-eyebrow {
    display: inline-block;
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #0369a1;
    margin-bottom: 16px;
  }

  .meps-eyebrow.meps-eyebrow-xl {
    font-size: 1.4rem;
    letter-spacing: 0.08em;
    margin-bottom: 14px;
  }

  .meps-country-select-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0.6rem;
    padding: 2.5rem 2rem;
    background: linear-gradient(160deg, #f0f9ff 0%, #dbeafe 100%);
    border-top: 1px solid #bae6fd;
    min-height: 140px;
  }

  .meps-csp-icon {
    font-size: 2.5rem;
    color: #0284c7;
    display: block;
    margin-bottom: 0.25rem;
  }

  .meps-csp-heading {
    font-size: 1.15rem;
    font-weight: 700;
    color: #0369a1;
    display: block;
    margin: 0;
  }

  .meps-csp-sub {
    font-size: 0.9rem;
    color: #0c4a6e;
    line-height: 1.6;
    max-width: 520px;
    display: block;
    margin: 0;
  }

  .meps-section-title {
    font-size: 2.2rem;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.025em;
    margin: 0 0 20px;
    line-height: 1.15;
  }

  .meps-body-text {
    font-size: 1rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.78;
    margin: 0 0 16px;
  }

  /* ===========================
     INVERTER REVOLUTION — STAT HIGHLIGHT
     =========================== */
  .meps-inverter-chapter {
    border-top: 1px solid rgba(0,0,0,0.06);
  }

  .meps-inverter-stat-highlight {
    background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
    border-radius: 16px;
    padding: 28px 36px;
    margin: 20px 0 24px;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    position: relative;
    overflow: hidden;
  }

  .meps-inverter-stat-highlight::before {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .meps-inverter-stat-value {
    font-size: 3rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1;
    color: #fff;
  }

  .meps-inverter-stat-label {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    line-height: 1.4;
  }

  .meps-inverter-stat-note {
    font-size: 0.8rem;
    font-weight: 500;
    color: rgba(255,255,255,0.7);
    margin-top: 2px;
  }

  /* ===========================
     RESOURCES GRID — 2-column card grid
     =========================== */
  .meps-resources-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin: 0 0 32px;
  }

  .meps-resource-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-radius: 0;
    padding: 20px 0;
    text-decoration: none;
    color: inherit;
  }

  .meps-resource-card:hover .meps-resource-title {
    color: #0284c7;
  }

  .meps-resource-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(3,105,161,0.10);
    color: #0369a1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .meps-resource-body {
    flex: 1;
    min-width: 0;
  }

  .meps-resource-title {
    display: block;
    font-size: 0.88rem;
    font-weight: 700;
    color: #0369a1;
    margin-bottom: 5px;
    line-height: 1.35;
  }

  .meps-resource-desc {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.55;
    margin: 0;
  }

  @media (max-width: 768px) {
    .meps-resources-grid {
      grid-template-columns: 1fr;
    }

    .meps-inverter-stat-value {
      font-size: 2.2rem;
    }

    .meps-section-title {
      font-size: 1.25rem;
    }
  }

  /* Combined map header */
  .combined-map-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .combined-map-header-top {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .map-controls-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .map-view-description {
    font-size: 0.8rem;
    color: #0369a1;
    padding: 0.5rem 0 0.5rem 0.75rem;
    background: transparent;
    border-radius: 0;
    border-left: 3px solid #0369a1;
  }

  /* Map view toggle buttons */
  .map-view-toggle {
    display: flex;
    gap: 0.35rem;
    flex-shrink: 0;
  }

  .map-toggle-btn {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.3rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #f8fafc;
    color: #64748b;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    white-space: nowrap;
  }

  .map-toggle-btn.active {
    background: #0369a1;
    color: #fff;
    border-color: #0369a1;
  }

  .map-toggle-btn:hover:not(.active) {
    background: #f1f5f9;
    color: #0369a1;
    border-color: #cbd5e1;
  }

  /* ===========================
     MAP HEIGHTS — each map gets its own explicit height so they appear
     visually balanced despite different amounts of surrounding content.
     A taller SVG viewBox = smaller-appearing countries (more white space around them).
     MEPS coverage (many colored countries → appears large) → taller container (520px) to reduce visual weight.
     Inverter/Variable Speed (sparse data) → shorter container (380px) to increase visual weight.
     Both heights must stay in sync with MEPS_MAP_HEIGHT / INVERTER_MAP_HEIGHT in JS.
     =========================== */
  #meps-map-container {
    height: 480px;
  }

  #inverter-map-container {
    height: 450px;
  }

  /* ===========================
     INVERTER / COVERAGE CHART FLAT WRAPPER
     Replaces the card-panel wrapper for inverter AND coverage tab charts
     so they sit directly on the section background without a box-in-box effect.
     =========================== */
  .inverter-chart-flat {
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-radius: 0;
    overflow: hidden;
  }

  /* Peak Load chart wrapper — clean divider, no card-panel box */
  .meps-chart-wrapper {
    border-top: 1px solid rgba(0,0,0,0.06);
    padding: 40px 48px;
  }
</style>

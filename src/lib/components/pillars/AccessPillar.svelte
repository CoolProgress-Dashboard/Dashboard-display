<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { VIEW_META } from '$lib/components/shared/config';
  import AnimatedCounter from '$lib/components/hero/AnimatedCounter.svelte';
  import { pillarContent } from '$lib/data/pillar-content';
  import { partners, globalCoolingPledge } from '$lib/data/partner-data';
  import PillarHeader from '$lib/components/shared/PillarHeader.svelte';
  import PillarInsight from '$lib/components/shared/PillarInsight.svelte';
  import FurtherReading from '$lib/components/shared/FurtherReading.svelte';
  import {
    ACCESS_ALL_YEARS,
    POPULATION_CATEGORIES
  } from '$lib/components/shared/config';
  import type { AccessRecord, AccessForecastRecord, Country } from '$lib/services/dashboard-types';
  import { SEQ, CAT, ACCESS_RISK, CHROME, NO_DATA, rgba } from '$lib/components/shared/colors';

  // -------------------------------------------------------
  // Props
  // -------------------------------------------------------
  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;
  /** Historical access records (data.access) */
  export let accessData: AccessRecord[] = [];
  /** Forecast access records (data.accessForecast) */
  export let accessForecast: AccessForecastRecord[] = [];
  /** Countries lookup (data.countries) */
  export let countries: Country[] = [];

  // Exposed apply function — assigned after D3 init so reactive block can call it
  let _applyCountry: ((code: string | null) => void) | null = null;

  // React to URL country changes (sidebar selection or map click propagation)
  $: {
    const _code = $page?.url?.searchParams?.get('country') ?? null;
    if (_applyCountry) _applyCountry(_code);
  }

  // -------------------------------------------------------
  // Static config / story content
  // -------------------------------------------------------
  const meta = VIEW_META.access;
  const accessContent = pillarContent.access;

  const accessStats = [
    {
      value: '1.2B',
      label: 'people lack adequate cooling',
      context: 'Over 1.2 billion people in low- and middle-income countries face dangerous heat without access to cooling. Source: SEforALL Chilling Prospects 2025.'
    },
    {
      value: '420K',
      label: 'deaths/year from food spoilage',
      context: 'An estimated 420,000 people die annually from unsafe food, much of it due to broken cold chains in developing countries. Source: WHO/SEforALL.'
    },
    {
      value: '80M',
      label: 'jobs lost to heat stress by 2030',
      context: 'Heat stress could reduce total working hours by 2.2% globally by 2030, equivalent to 80 million full-time jobs. Losses concentrate in cooling-poor regions. Source: ILO.'
    },
    {
      value: '40%',
      label: 'African food lost post-harvest',
      context: 'Up to 40% of food production in Africa is lost post-harvest due to lack of cold chain infrastructure. Cold chain access could prevent millions of tonnes of food waste.'
    }
  ];

  const chartHighlights = [
    {
      icon: 'fa-earth-americas',
      title: 'Cooling Access Map',
      description: 'Explore which countries face the largest cooling access gaps by population at risk',
      color: '#C25B33'
    },
    {
      icon: 'fa-chart-area',
      title: '2013\u20132050 Timeline',
      description: 'Unified historical and projected view of population at risk, stacked by income group',
      color: '#D4A843'
    },
    {
      icon: 'fa-map-location-dot',
      title: 'Country Deep-Dive',
      description: 'Click any country for detailed cooling gap breakdown by income group and risk level',
      color: '#2D7D5A'
    }
  ];

  const accessPartnerIds = ['ccc', 'se4all', 'cool-coalition', 'heat'];
  const accessPartners = accessPartnerIds
    .map(id => partners.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  // -------------------------------------------------------
  // Reveal animation state
  // -------------------------------------------------------
  let revealed = false;
  let showAdvancedFilters = false;

  // -------------------------------------------------------
  // ISO numeric → alpha-3 code mapping (complete)
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // onMount: load scripts, init map, timeline, event wiring
  // -------------------------------------------------------
  // Cast needed because Svelte's types don't allow async onMount + cleanup together,
  // but the runtime correctly handles this pattern.
  (onMount as (fn: () => Promise<() => void>) => void)(async () => {
    // ---- reveal animation ----
    const revealTimer = setTimeout(() => { revealed = true; }, 150);

    // ---- load D3 + TopoJSON from CDN ----
    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing && (existing as HTMLScriptElement & { dataset: DOMStringMap }).dataset.loaded) {
          resolve(); return;
        }
        const script = (existing || document.createElement('script')) as HTMLScriptElement;
        script.src = src;
        script.async = true;
        script.onload = () => { (script as any).dataset.loaded = 'true'; resolve(); };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        if (!existing) document.head.appendChild(script);
      });

    await Promise.all(
      ['https://d3js.org/d3.v7.min.js', 'https://d3js.org/topojson.v3.min.js'].map(loadScript)
    );

    const d3 = (window as any).d3;
    const topojson = (window as any).topojson;
    const echarts = await import('echarts');

    // -------------------------------------------------------
    // Filter state (local to this component)
    // -------------------------------------------------------
    let accessYear = 2024;
    let accessImpactLevels: string[] = ['High', 'Medium', 'Low'];
    let accessPopCategories: string[] = ['Rural Poor', 'Urban Poor', 'Lower-Middle Income', 'Middle-Income'];
    let accessRegions: string[] = ['Africa', 'Asia and the Middle East', 'Latin America and the Caribbean', 'Oceania'];
    let selectedCountry: string | null = null;

    // -------------------------------------------------------
    // Color / threshold config
    // -------------------------------------------------------
    const ACCESS_THRESHOLDS = [1e6, 5e6, 20e6, 50e6, 200e6, 500e6];
    const ACCESS_COLORS = [...ACCESS_RISK];
    const ACCESS_LABELS = ['<1M', '1-5M', '5-20M', '20-50M', '50-200M', '200-500M', '>500M'];

    // -------------------------------------------------------
    // Chart instances
    // -------------------------------------------------------
    const charts: Record<string, any> = {};
    const chartObservers: Map<string, ResizeObserver> = new Map();
    let accessMapSvg: any = null;
    let accessCountryStackedChart: any = null;
    let accessCountryPieChart: any = null;

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------
    function normalizeId(id: string | number | null | undefined): string {
      if (id === undefined || id === null) return '';
      const num = parseInt(String(id), 10);
      return isNaN(num) ? String(id) : String(num);
    }

    function getAccessColorByValue(value: number): string {
      if (value <= 0) return NO_DATA;
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
      if (ratio < 0.5)  return { level: 'medium', label: 'Medium Gap' };
      if (ratio < 0.75) return { level: 'high', label: 'High Gap' };
      return { level: 'critical', label: 'Critical Gap' };
    }

    /** Aggregate population_without_cooling by country for current filters */
    function getAccessTotalsFiltered(): Record<string, number> {
      // Map always shows 2024 historical data with tick-box region/impact/pop filters
      const mapFiltered = accessData.filter(r => {
        if (r.year !== 2024) return false;
        if (accessRegions.length > 0 && r.region && !accessRegions.includes(r.region)) return false;
        if (accessImpactLevels.length > 0 && r.impact_level && !accessImpactLevels.includes(r.impact_level)) return false;
        if (accessPopCategories.length > 0 && r.population_category && !accessPopCategories.includes(r.population_category)) return false;
        return true;
      });
      const totals: Record<string, number> = {};
      mapFiltered.forEach(r => {
        const v = r.population_without_cooling || 0;
        totals[r.country_code] = (totals[r.country_code] || 0) + v;
      });
      return totals;
    }

    // -------------------------------------------------------
    // Legend & progress bar
    // -------------------------------------------------------
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
      values.forEach(value => {
        const level = getAccessLevel(value, maxValue).level;
        if (level === 'low') counts.low++;
        else if (level === 'medium') counts.medium++;
        else if (level === 'high') counts.high++;
        else counts.critical++;
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

    // -------------------------------------------------------
    // "Viewing" badge inside this pillar
    // -------------------------------------------------------
    function updateAccessViewingBadge() {
      const el = document.getElementById('access-viewing');
      if (!el) return;
      if (selectedCountry) {
        const c = countries.find(c => c.country_code === selectedCountry);
        el.textContent = c?.country_name || selectedCountry;
      } else {
        el.textContent = 'Global';
      }
    }

    // -------------------------------------------------------
    // setChart helper (ECharts init + ResizeObserver)
    // -------------------------------------------------------
    function setChart(id: string, option: any) {
      const el = document.getElementById(id) as HTMLDivElement | null;
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
        charts[id] = echarts.init(el);
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
    }

    // -------------------------------------------------------
    // Tooltip (shared with the page-level tooltip if it exists,
    // but Access creates its own fallback if absent)
    // -------------------------------------------------------
    function getTooltip(): HTMLElement {
      return document.getElementById('tooltip') as HTMLElement;
    }

    function hideTooltip() {
      const tt = getTooltip();
      if (tt) tt.style.opacity = '0';
    }

    // -------------------------------------------------------
    // D3 Map: initAccessMap
    // -------------------------------------------------------
    async function initAccessMap() {
      const container = document.getElementById('access-map-container');
      if (!container) return;

      // Remove any existing SVG (prevents duplicates on hot reload)
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

      // Ocean click → reset to global view
      accessMapSvg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('click', () => {
          selectedCountry = null;
          updateAccessViewingBadge();
          showGlobalAccessDetail();
          syncAccessPanelVisibility();
          // Propagate reset to page-level global filter if available
          if (typeof (window as any).__dashboardClearCountry === 'function') {
            (window as any).__dashboardClearCountry();
          }
        });

      try {
        const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
        const worldCountries = topojson.feature(world, world.objects.countries);
        const accessTotals = getAccessTotalsFiltered();

        accessMapSvg.selectAll('path')
          .data(worldCountries.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('class', 'country-path access-path')
          .attr('data-code', (d: any) => countryIdToCode[normalizeId(d.id)] || '')
          .attr('fill', (d: any) => {
            const code = countryIdToCode[normalizeId(d.id)];
            if (!code) return NO_DATA;
            const value = accessTotals[code];
            if (value === undefined || value <= 0) return NO_DATA;
            return getAccessColorByValue(value);
          })
          .on('mouseover', (event: MouseEvent, d: any) => {
            const code = countryIdToCode[normalizeId(d.id)];
            if (!code) return;
            const country = countries.find(c => c.country_code === code);
            const totals = getAccessTotalsFiltered();
            const value = totals[code] || 0;
            const valueLabel = value ? `${(value / 1e6).toFixed(1)}M` : 'No data';
            const tt = getTooltip();
            if (!tt) return;
            tt.innerHTML = `
              <strong>${country?.country_name || code}</strong><br>
              <span style="color: var(--text-secondary)">Year: ${accessYear}</span><br>
              Population at Risk: ${valueLabel}
            `;
            tt.style.opacity = '1';
            tt.style.left = (event.pageX + 10) + 'px';
            tt.style.top = (event.pageY + 10) + 'px';
          })
          .on('mouseout', hideTooltip)
          .on('click', (event: MouseEvent, d: any) => {
            const code = countryIdToCode[normalizeId(d.id)];
            if (!code) return;
            const country = countries.find(c => c.country_code === code);
            if (!country) return;
            selectedCountry = code;
            updateAccessViewingBadge();
            highlightAccessCountry(code);
            updateAccessCountryDetail(code, country);
            syncAccessPanelVisibility();
            // Sync page-level global filter if available
            if (typeof (window as any).__dashboardSetCountry === 'function') {
              (window as any).__dashboardSetCountry(code);
            }
          });

        updateAccessLegend();
        updateAccessProgress();
        updateAccessViewingBadge();
      } catch (error) {
        console.error('Access map error:', error);
      }
    }

    // -------------------------------------------------------
    // updateAccessMap: re-color paths after filter change
    // -------------------------------------------------------
    function updateAccessMap() {
      if (!accessMapSvg) return;
      const accessTotals = getAccessTotalsFiltered();

      accessMapSvg.selectAll('.access-path')
        .transition()
        .duration(300)
        .attr('fill', function(this: any) {
          const code = d3.select(this).attr('data-code');
          if (!code) return NO_DATA;
          const value = accessTotals[code];
          if (value === undefined || value <= 0) return NO_DATA;
          return getAccessColorByValue(value);
        });

      updateAccessLegend();
      updateAccessProgress();
      updateAccessViewingBadge();
    }

    // -------------------------------------------------------
    // Highlight selected country on the access map
    // -------------------------------------------------------
    function highlightAccessCountry(code: string) {
      if (!accessMapSvg) return;
      accessMapSvg.selectAll('.access-path')
        .classed('country-selected', function(this: any) {
          return d3.select(this).attr('data-code') === code;
        });
    }

    // -------------------------------------------------------
    // renderAccessTimeline: unified 2013-2050 stacked area chart
    // -------------------------------------------------------
    function buildHistoricalRegionMap(): Record<string, string> {
      const map: Record<string, string> = {};
      for (const r of accessData) {
        if (r.country_code && r.region) map[r.country_code] = r.region;
      }
      return map;
    }

    function renderAccessTimeline() {
      const histRegionMap = buildHistoricalRegionMap();

      // Normalize forecast regions to match historical SEforALL taxonomy per country
      const normalizedForecast = accessForecast.map(r => ({
        ...r,
        region: (r.country_code && histRegionMap[r.country_code])
          ? histRegionMap[r.country_code]
          : r.region
      }));

      const allRecords = [...accessData, ...normalizedForecast];

      // Apply tick-box filters
      const filtered = allRecords.filter(r => {
        if (accessRegions.length > 0 && r.region && !accessRegions.includes(r.region)) return false;
        if (accessImpactLevels.length > 0 && r.impact_level && !accessImpactLevels.includes(r.impact_level)) return false;
        if (accessPopCategories.length > 0 && r.population_category && !accessPopCategories.includes(r.population_category)) return false;
        return true;
      });

      const years = Array.from(new Set(filtered.map(r => r.year))).sort((a, b) => a - b);
      const categories = ['Rural Poor', 'Urban Poor', 'Lower-Middle Income', 'Middle-Income'];
      const catColors: Record<string, string> = {
        'Rural Poor': '#C25B33',
        'Urban Poor': '#E07850',
        'Lower-Middle Income': '#D4A843',
        'Middle-Income': '#F5C44A'
      };

      const seriesData: Record<string, number[]> = {};
      categories.forEach(cat => { seriesData[cat] = []; });

      years.forEach(y => {
        categories.forEach(cat => {
          const catRecords = filtered.filter(r => r.year === y && r.population_category === cat);
          const total = catRecords.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
          seriesData[cat].push(Math.round(total / 1e6 * 10) / 10);
        });
      });

      // Only render categories that are active and have data
      const activeCats = categories.filter(cat =>
        accessPopCategories.includes(cat) && seriesData[cat].some(v => v > 0)
      );

      setChart('chart-access-timeline', {
        tooltip: {
          trigger: 'axis',
          formatter: function(params: any) {
            const yr = params[0].axisValue;
            const isProjected = Number(yr) > 2024;
            let html = `<strong>${yr}</strong>${isProjected ? ' <em style="color:#94a3b8">(projected)</em>' : ''}<br/>`;
            let total = 0;
            params.forEach((p: any) => {
              total += p.value;
              html += `${p.marker} ${p.seriesName}: <strong>${p.value.toFixed(0)}M</strong><br/>`;
            });
            html += `<hr style="margin:4px 0;border-color:#e2e8f0"/><strong>Total: ${total.toFixed(0)}M</strong>`;
            return html;
          }
        },
        legend: {
          data: activeCats,
          bottom: 0,
          textStyle: { fontSize: 10, color: '#475569' }
        },
        grid: { left: '3%', right: '4%', bottom: '14%', top: '8%', containLabel: true },
        xAxis: {
          type: 'category',
          data: years,
          axisLabel: { fontSize: 10, interval: 4 },
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          name: 'Population (millions)',
          nameTextStyle: { fontSize: 10, color: '#475569' },
          axisLabel: { fontSize: 10, formatter: '{value}M' }
        },
        series: activeCats.map((cat, idx) => ({
          name: cat,
          type: 'line',
          stack: 'total',
          areaStyle: { opacity: 0.6 },
          data: seriesData[cat],
          smooth: false,
          symbol: 'none',
          lineStyle: { color: catColors[cat], width: 1.5 },
          itemStyle: { color: catColors[cat] },
          markLine: idx === 0 ? {
            silent: true,
            symbol: 'none',
            data: [{
              xAxis: '2024',
              lineStyle: { color: '#94a3b8', type: 'dashed', width: 1.5 },
              label: {
                formatter: 'Historical | Projected',
                position: 'insideEndTop',
                fontSize: 9,
                color: '#94a3b8'
              }
            }]
          } : undefined
        }))
      });
    }

    // -------------------------------------------------------
    // updateAccessCharts: entry point for all chart refreshes
    // -------------------------------------------------------
    function updateAccessCharts() {
      renderAccessTimeline();
    }

    // -------------------------------------------------------
    // updateAccessView: full refresh (map + charts)
    // -------------------------------------------------------
    function updateAccessView() {
      updateAccessMap();
      updateAccessCharts();
    }

    // -------------------------------------------------------
    // Country detail panel
    // -------------------------------------------------------
    function updateAccessCountryDetail(code: string, country: Country) {
      const accessDetail = document.querySelector('#access-country-detail .country-detail') as HTMLElement | null;
      if (!accessDetail) return;

      const countryData = [...accessData, ...accessForecast].filter(r => r.country_code === code);

      const categoryColors: Record<string, string> = {
        'Rural Poor': '#C25B33',
        'Urban Poor': '#E07850',
        'Lower-Middle Income': '#D4A843',
        'Middle-Income': '#F5C44A'
      };

      // Build stacked data by category over 2013-2050 timeline
      const stackedData = POPULATION_CATEGORIES.map(cat => ({
        name: cat,
        data: ACCESS_ALL_YEARS.map(year => {
          const yearCatData = countryData.filter(r => r.year === year && r.population_category === cat);
          return yearCatData.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
        }),
        color: categoryColors[cat]
      }));

      // 2024 breakdown for pie chart
      const currentYearData = countryData.filter(r => r.year === 2024);
      const categoryBreakdown = POPULATION_CATEGORIES.map(cat => {
        const catTotal = currentYearData
          .filter(r => r.population_category === cat)
          .reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
        return { category: cat, value: catTotal, color: categoryColors[cat] };
      }).filter(cb => cb.value > 0);

      const currentYearTotal = currentYearData.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
      const baselineYear = 2013;
      const baselineTotal = countryData
        .filter(r => r.year === baselineYear)
        .reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
      const changePercent = baselineTotal > 0
        ? ((currentYearTotal - baselineTotal) / baselineTotal * 100).toFixed(1)
        : '0';
      const changeColor = Number(changePercent) > 0 ? '#C25B33' : '#2D7D5A';
      const changeIcon = Number(changePercent) > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
      const region = country.region || 'Global South';
      const trendDirection = Number(changePercent) > 0 ? 'increased' : 'decreased';
      const dominantCategory = categoryBreakdown.reduce(
        (max, c) => c.value > max.value ? c : max,
        { category: '', value: 0 }
      ).category;
      const trendDescription = `Population without cooling access has ${trendDirection} by ${Math.abs(Number(changePercent))}% since ${baselineYear}.`;
      const breakdownDescription = dominantCategory
        ? `The largest vulnerable group is ${dominantCategory}, making up the majority of those at risk.`
        : '';

      accessDetail.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <h4 style="color: #8B5E3C; font-size: 1.1rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-flag" style="color: #D4A843;"></i>
            ${country.country_name}
            <span style="font-size: 0.75rem; font-weight: 400; color: #64748b; margin-left: 0.5rem;">${region}</span>
          </h4>
          <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap;">
            <span style="font-size: 0.8rem; color: #C25B33; font-weight: 600;">
              <i class="fa-solid fa-users" style="margin-right: 0.25rem;"></i>
              ${(currentYearTotal / 1e6).toFixed(1)}M at risk
            </span>
            <span style="font-size: 0.8rem; color: ${changeColor}; font-weight: 500;">
              <i class="fa-solid ${changeIcon}" style="margin-right: 0.25rem;"></i>
              ${Math.abs(Number(changePercent))}% since ${baselineYear}
            </span>
          </div>
        </div>
        <div class="country-charts-grid">
          <div class="chart-box" style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 8px; padding: 0.75rem;">
            <div style="font-size: 0.75rem; font-weight: 600; color: #8B5E3C; margin-bottom: 0.5rem;">
              <i class="fa-solid fa-chart-area" style="margin-right: 0.3rem; color: #D4A843;"></i>
              Population at Risk Over Time
            </div>
            <div class="access-stacked-chart" style="width: 100%; height: 200px;"></div>
          </div>
          <div class="chart-box" style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 8px; padding: 0.75rem;">
            <div style="font-size: 0.75rem; font-weight: 600; color: #8B5E3C; margin-bottom: 0.5rem;">
              <i class="fa-solid fa-chart-pie" style="margin-right: 0.3rem; color: #D4A843;"></i>
              2024 Category Breakdown
            </div>
            <div class="access-pie-chart" style="width: 100%; height: 200px;"></div>
          </div>
        </div>
        <div class="country-insight" style="background: #ffffff; border-radius: 8px; padding: 1rem; border-left: 3px solid #D4A843; border: 1px solid #f1f5f9; border-left: 3px solid #D4A843;">
          <div style="font-size: 0.8rem; font-weight: 600; color: #8B5E3C; margin-bottom: 0.5rem;">
            <i class="fa-solid fa-lightbulb" style="color: #D4A843; margin-right: 0.35rem;"></i>
            Analysis for ${country.country_name}
          </div>
          <p style="font-size: 0.85rem; color: #6B4423; line-height: 1.6; margin: 0;">
            ${trendDescription} ${breakdownDescription}
            <span style="display: block; margin-top: 0.5rem; font-size: 0.75rem; color: #64748b;">
              <em>Data: SEforALL Chilling Prospects (historical) &bull; HEAT projection (2025-2050)</em>
            </span>
          </p>
        </div>
      `;

      // Render ECharts inside the newly-created DOM nodes
      setTimeout(() => {
        const stackedContainer = accessDetail.querySelector('.access-stacked-chart') as HTMLElement | null;
        const pieContainer = accessDetail.querySelector('.access-pie-chart') as HTMLElement | null;

        if (accessCountryStackedChart) { accessCountryStackedChart.dispose(); accessCountryStackedChart = null; }
        if (accessCountryPieChart) { accessCountryPieChart.dispose(); accessCountryPieChart = null; }

        if (stackedContainer) {
          accessCountryStackedChart = echarts.init(stackedContainer);
          accessCountryStackedChart.setOption({
            grid: { top: 30, right: 10, bottom: 28, left: 50 },
            legend: {
              show: true, top: 0, left: 'center',
              itemWidth: 14, itemHeight: 10,
              textStyle: { fontSize: 11, color: '#475569', fontWeight: 500 },
              itemGap: 10
            },
            xAxis: {
              type: 'category',
              data: ACCESS_ALL_YEARS.map(String),
              axisLabel: { fontSize: 10, interval: 4, fontWeight: 500, color: '#475569' },
              axisLine: { lineStyle: { color: '#cbd5e1' } },
              axisTick: { show: false },
              boundaryGap: false
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                fontSize: 11, fontWeight: 500, color: '#475569',
                formatter: (v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : String(v)
              },
              splitLine: { lineStyle: { color: '#e2e8f0' } },
              name: 'Population', nameLocation: 'middle', nameGap: 35,
              nameTextStyle: { fontSize: 10, color: '#64748b', fontWeight: 500 }
            },
            series: stackedData.map((cat, idx) => ({
              name: cat.name,
              type: 'line',
              stack: 'total',
              smooth: true,
              symbol: 'none',
              lineStyle: { width: 0 },
              areaStyle: { opacity: 0.8, color: cat.color },
              emphasis: { focus: 'series' },
              data: cat.data,
              ...(idx === 0 ? {
                markLine: {
                  silent: true,
                  symbol: 'none',
                  data: [{ xAxis: '2024', lineStyle: { color: '#94a3b8', type: 'dashed', width: 1 }, label: { show: false } }]
                }
              } : {})
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
              itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
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
                itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
              },
              data: categoryBreakdown.map(c => ({
                name: c.category,
                value: c.value,
                itemStyle: { color: c.color }
              }))
            }]
          });
        } else if (pieContainer) {
          pieContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:0.75rem;">No data for selected year</div>';
        }
      }, 100);
    }

    function showGlobalAccessDetail() {
      const container = document.querySelector('#access-country-detail .country-detail') as HTMLElement | null;
      if (!container) return;
      container.innerHTML = `
        <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #D4A843; margin-bottom: 0.75rem; display: block;"></i>
          <h4 style="color: #8B5E3C; margin-bottom: 0.5rem;">Select a Country</h4>
          <p style="font-size: 0.85rem;">Click on any country in the map above to view cooling access gap details and population breakdown.</p>
        </div>
      `;
    }

    function syncAccessPanelVisibility() {
      const timelineContainer = document.getElementById('access-timeline-container');
      const countryDetail = document.getElementById('access-country-detail');
      if (timelineContainer) timelineContainer.style.display = selectedCountry ? 'none' : '';
      if (countryDetail) countryDetail.style.display = selectedCountry ? '' : 'none';
    }

    // -------------------------------------------------------
    // Checkbox filter wiring
    // -------------------------------------------------------
    function wireAccessCheckboxes(
      containerId: string,
      stateSetter: (v: string[]) => void
    ) {
      document.querySelectorAll<HTMLInputElement>(`#${containerId} input[type="checkbox"]`).forEach(cb => {
        cb.addEventListener('change', () => {
          const checked: string[] = [];
          document.querySelectorAll<HTMLInputElement>(`#${containerId} input[type="checkbox"]:checked`)
            .forEach(c => checked.push(c.value));
          stateSetter(checked);
          updateAccessView();
          renderAccessTimeline();
        });
      });
    }

    wireAccessCheckboxes('access-region-checks', v => { accessRegions = v; });
    wireAccessCheckboxes('access-pop-checks', v => { accessPopCategories = v; });
    wireAccessCheckboxes('access-impact-checks', v => { accessImpactLevels = v; });

    // -------------------------------------------------------
    // Window resize: resize timeline chart
    // -------------------------------------------------------
    function onWindowResize() {
      Object.values(charts).forEach((chart: any) => {
        if (!chart || !chart.resize) return;
        const dom = chart.getDom ? chart.getDom() : null;
        if (!dom) return;
        const section = dom.closest('.view-section');
        if (section && !section.classList.contains('active')) return;
        const w = dom.clientWidth;
        const h = dom.clientHeight || parseInt(dom.style.minHeight) || 280;
        if (w > 10) chart.resize({ width: w, height: h });
      });
    }
    window.addEventListener('resize', onWindowResize);

    // -------------------------------------------------------
    // Register page-level callbacks so switchView can
    // re-render the timeline when switching to 'access'
    // -------------------------------------------------------
    (window as any).__accessRenderTimeline = () => {
      renderAccessTimeline();
    };
    (window as any).__accessUpdateView = () => {
      updateAccessView();
    };

    // -------------------------------------------------------
    // Initial render (data may already be available via props)
    // -------------------------------------------------------
    await initAccessMap();
    updateAccessCharts();
    showGlobalAccessDetail();
    syncAccessPanelVisibility();

      // Expose country-apply function for reactive URL sync
      function applyCountry(code: string | null) {
        if (!code) {
          selectedCountry = null;
          updateAccessViewingBadge();
          showGlobalAccessDetail();
          syncAccessPanelVisibility();
          return;
        }
        const country = countries.find(c => c.country_code === code);
        if (!country) return;
        selectedCountry = code;
        updateAccessViewingBadge();
        highlightAccessCountry(code);
        updateAccessCountryDetail(code, country);
        syncAccessPanelVisibility();
      }
      _applyCountry = applyCountry;

      // Apply country from URL on initial load
      const _initialCountry = new URLSearchParams(window.location.search).get('country');
      if (_initialCountry) applyCountry(_initialCountry);

    // -------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------
    return () => {
      clearTimeout(revealTimer);
      window.removeEventListener('resize', onWindowResize);
      delete (window as any).__accessRenderTimeline;
      delete (window as any).__accessUpdateView;
      Object.entries(charts).forEach(([id, chart]) => {
        if (chartObservers.has(id)) { chartObservers.get(id)!.disconnect(); chartObservers.delete(id); }
        chart.dispose();
      });
      if (accessCountryStackedChart) { accessCountryStackedChart.dispose(); accessCountryStackedChart = null; }
      if (accessCountryPieChart) { accessCountryPieChart.dispose(); accessCountryPieChart = null; }
      if (accessMapSvg) {
        d3.select('#access-map-container').selectAll('svg').remove();
        accessMapSvg = null;
      }
    };
  });
</script>

<section id="view-access" class="view-section" class:active>
  <div class="pillar-stack">
    <!-- ═══ Ch01 THE CHALLENGE ═══ -->
    <div class="chapter-card" class:revealed>
      <div class="chapter-label" style="background: rgba(45,125,90,0.10); color: #2D7D5A;">
        <span class="chapter-num" style="background: #2D7D5A; color: #fff;">01</span>
        <span class="chapter-title-text">The Challenge</span>
      </div>
      <h2 class="chapter-heading">Access to cooling is not a luxury — it is a human right.</h2>
      <p class="chapter-intro">{accessContent.storyHook}</p>

      <div class="access-counters">
        {#each accessStats as stat, i}
          <div class="access-counter-wrapper" style="transition-delay: {200 + i * 100}ms">
            <AnimatedCounter
              value={stat.value}
              label={stat.label}
              context={stat.context}
              duration={1800 + i * 150}
            />
          </div>
        {/each}
      </div>

      <p class="chapter-text">{accessContent.keyNarrative}</p>
    </div>

    <!-- DATA: Why Humidity Matters -->
    <!-- Humidity & Wet-Bulb Callout -->
    <aside class="card-panel access-humidity-card">
      <div class="access-humidity-header">
        <div class="access-humidity-icon"><i class="fa-solid fa-droplet"></i></div>
        <div>
          <h3 class="access-humidity-title">Why Humidity Makes Heat More Dangerous</h3>
          <p class="access-humidity-sub">Heat alone does not tell the full story. The combination of high heat and high humidity is what kills.</p>
        </div>
      </div>
      <p class="access-humidity-body">The human body cools itself by sweating. But sweating only works when the air can absorb that moisture. In high humidity, sweat cannot evaporate — and the body loses its ability to regulate temperature. At a wet-bulb temperature of around 35°C (a combination of roughly 46°C air temperature at 50% humidity, or lower temperatures at higher humidity), the human body cannot survive outdoors for more than a few hours, even in shade. This threshold is being crossed more frequently in South Asia, the Persian Gulf, and parts of sub-Saharan Africa.</p>
      <p class="access-humidity-note"><i class="fa-solid fa-circle-info"></i> The maps and data on this dashboard reflect heat risk. Humidity data is not yet integrated — areas with moderate temperature but high humidity may be more dangerous than the data suggests.</p>
    </aside>

    <!-- ═══ Ch02 WHO IS MOST AFFECTED ═══ -->
    <div class="chapter-card" class:revealed>
      <div class="chapter-label" style="background: rgba(45,125,90,0.10); color: #2D7D5A;">
        <span class="chapter-num" style="background: #2D7D5A; color: #fff;">02</span>
        <span class="chapter-title-text">Who Is Most Affected</span>
      </div>
      <h2 class="chapter-heading">Heat stress hits hardest where cooling is least affordable.</h2>

      <div class="access-highlights-grid">
        {#each chartHighlights as highlight}
          <div class="access-highlight-card">
            <div class="access-highlight-icon" style="color: {highlight.color}">
              <i class="fa-solid {highlight.icon}"></i>
            </div>
            <div class="access-highlight-text">
              <strong>{highlight.title}</strong>
              <span>{highlight.description}</span>
            </div>
          </div>
        {/each}
      </div>

      <div class="access-cool-coalition">
        <i class="fa-solid fa-people-group" style="color: #2D7D5A; margin-right: 0.5rem;"></i>
        <span>
          <strong>UNEP Cool Coalition</strong> unites 100+ governments, cities, and businesses for clean, efficient, accessible cooling.
          <a href="https://coolcoalition.org/" target="_blank" rel="noopener noreferrer">Learn more</a>
        </span>
      </div>
    </div>

    <!-- DATA: Solutions & Access Map -->
    <!-- Solutions Layer -->
    <div class="card-panel access-solutions-card">
      <div class="access-solutions-header">
        <div class="access-solutions-icon"><i class="fa-solid fa-lightbulb"></i></div>
        <div>
          <strong>How is the access gap being addressed?</strong>
          <span>Closing the gap sustainably requires going beyond individual air conditioners.</span>
        </div>
      </div>

      <div class="access-solutions-grid">
        <div class="access-solution-item">
          <div class="access-solution-icon" style="--sol-color: #2D7D5A;">
            <i class="fa-solid fa-house"></i>
          </div>
          <div class="access-solution-text">
            <strong>Passive Cooling</strong>
            <p>Cool roofs, shading, natural ventilation, and urban green spaces can reduce indoor temperatures by 5–8°C at near-zero operating cost — the first line of defence before mechanical cooling is needed.</p>
          </div>
        </div>

        <div class="access-solution-item">
          <div class="access-solution-icon" style="--sol-color: #5A8FC2;">
            <i class="fa-solid fa-city"></i>
          </div>
          <div class="access-solution-text">
            <strong>District &amp; Shared Cooling</strong>
            <p>Centralised district cooling systems and community cooling centers deliver thermal comfort more efficiently than millions of individual units — particularly viable in dense urban settlements.</p>
          </div>
        </div>

        <div class="access-solution-item">
          <div class="access-solution-icon" style="--sol-color: #D4A843;">
            <i class="fa-solid fa-solar-panel"></i>
          </div>
          <div class="access-solution-text">
            <strong>Solar Cold Chains</strong>
            <p>Solar-powered refrigeration for vaccines, medicines, and food is transforming rural access in off-grid communities across Africa and South Asia — decoupling cold storage from unreliable grid power.</p>
          </div>
        </div>

        <div class="access-solution-item">
          <div class="access-solution-icon" style="--sol-color: #C25B33;">
            <i class="fa-solid fa-scale-balanced"></i>
          </div>
          <div class="access-solution-text">
            <strong>Policy &amp; Finance</strong>
            <p>The Global Cooling Pledge, National Cooling Action Plans, and climate finance from the Green Climate Fund are directing resources toward equitable access — linking cooling to NDC commitments and SDG targets.</p>
          </div>
        </div>
      </div>

      <p class="access-solutions-note">
        <i class="fa-solid fa-arrow-right"></i>
        A rights-based approach recognises that access to cooling is essential for health, food security, and economic participation in a warming world — not a luxury reserved for wealthy households.
      </p>
    </div>

    <!-- Map Card with Filters Inside -->
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

      <!-- Tick-box filters -->
      <div class="access-checkboxes" id="access-filters-panel">
        <div class="checkbox-group">
          <span class="checkbox-label"><i class="fa-solid fa-earth-americas"></i> Region</span>
          <div class="checkbox-items" id="access-region-checks">
            <label class="tick-box" title="Sub-Saharan Africa and North Africa — largest high-risk population with significant infrastructure gaps."><input type="checkbox" value="Africa" checked /><span class="tick-mark"></span>Africa</label>
            <label class="tick-box" title="South Asia, East Asia, Southeast Asia, and Middle East — fastest growing cooling demand regions."><input type="checkbox" value="Asia and the Middle East" checked /><span class="tick-mark"></span>Asia &amp; Middle East</label>
            <label class="tick-box" title="Latin America and Caribbean — growing disparities between urban and rural cooling access."><input type="checkbox" value="Latin America and the Caribbean" checked /><span class="tick-mark"></span>Latin America</label>
            <label class="tick-box" title="Pacific Island nations and Australia/New Zealand — vulnerable small island states."><input type="checkbox" value="Oceania" checked /><span class="tick-mark"></span>Oceania</label>
          </div>
        </div>
        <button
          class="access-advanced-toggle"
          type="button"
          on:click={() => showAdvancedFilters = !showAdvancedFilters}
        >
          <i class="fa-solid {showAdvancedFilters ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
          {showAdvancedFilters ? 'Hide' : 'Show'} income &amp; risk filters
        </button>

        {#if showAdvancedFilters}
        <div class="checkbox-group">
          <span class="checkbox-label"><i class="fa-solid fa-users"></i> Income Group <i class="fa-solid fa-circle-info" style="font-size:0.7rem;color:#94a3b8;margin-left:0.3rem;" title="Hover over each filter for more information"></i></span>
          <div class="checkbox-items" id="access-pop-checks">
            <label class="tick-box" title="Likely subsistence farmers without access to an intact cold chain; may lack access to electricity and properly stored vaccines. Income: less than $2.15/day in rural areas."><input type="checkbox" value="Rural Poor" checked /><span class="tick-mark"></span>Rural Poor</label>
            <label class="tick-box" title="May have some access to electricity, but live in housing of poor quality; may have a refrigerator, but food often spoils due to intermittent power. Income: less than $2.15/day in urban/slum areas."><input type="checkbox" value="Urban Poor" checked /><span class="tick-mark"></span>Urban Poor</label>
            <label class="tick-box" title="May purchase an affordable but likely inefficient air conditioner or refrigerator, raising energy consumption and GHG emissions. Income: less than $10/day outside poverty."><input type="checkbox" value="Lower-Middle Income" checked /><span class="tick-mark"></span>Lower-Mid</label>
            <label class="tick-box" title="May be able to afford a more efficient air conditioner or minimize its use; may move to energy efficient housing and working environments. Income: between $10-$20/day."><input type="checkbox" value="Middle-Income" checked /><span class="tick-mark"></span>Middle</label>
          </div>
        </div>
        <div class="checkbox-group">
          <span class="checkbox-label"><i class="fa-solid fa-triangle-exclamation"></i> Risk Level <i class="fa-solid fa-circle-info" style="font-size:0.7rem;color:#94a3b8;margin-left:0.3rem;" title="Hover over each filter for more information"></i></span>
          <div class="checkbox-items" id="access-impact-checks">
            <label class="tick-box" title="HIGH RISK: Populations facing the most severe cooling vulnerability — lack of energy access, extreme poverty, high exposure to dangerous heat."><input type="checkbox" value="High" checked /><span class="tick-mark risk-high"></span>High</label>
            <label class="tick-box" title="MEDIUM RISK: Populations on the brink of purchasing inefficient cooling devices; at risk of locking into high-emissions solutions without access to efficient alternatives."><input type="checkbox" value="Medium" checked /><span class="tick-mark risk-medium"></span>Medium</label>
            <label class="tick-box" title="LOW RISK: Populations with growing access to cooling but still facing affordability and efficiency challenges."><input type="checkbox" value="Low" checked /><span class="tick-mark risk-low"></span>Low</label>
          </div>
        </div>
        {/if}
      </div>

      <!-- Global Timeline Chart (2013-2050) -->
      <div id="access-timeline-container" style="margin-top: 0.75rem; border-top: 1px solid #f1f5f9; padding-top: 0.25rem;">
        <div class="chart-card-header" style="padding: 0.75rem 1rem;">
          <h3 style="font-size: 0.88rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 0.4rem; margin: 0;">
            <i class="fa-solid fa-chart-area" style="color: #D4A843;"></i>
            Population at Risk: 2013&ndash;2050
          </h3>
          <p style="font-size: 0.72rem; color: #94a3b8; margin: 0.2rem 0 0;">
            Historical (SEforALL) &middot; Projected (HEAT methodology) &middot; Stacked by income group
          </p>
        </div>
        <div class="chart-card-body">
          <div id="chart-access-timeline" class="chart-surface" style="width: 100%; height: 400px; min-height: 400px;"></div>
        </div>
      </div>
    </div>

    <!-- Country Detail -->
    <div class="country-card-inline" id="access-country-detail">
      <div class="country-detail">
        <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #D4A843; margin-bottom: 0.75rem; display: block;"></i>
          <h4 style="color: #8B5E3C; margin-bottom: 0.5rem;">Select a Country</h4>
          <p style="font-size: 0.85rem;">Click on any country in the map above to view cooling access gap details and population breakdown.</p>
        </div>
      </div>
    </div>

    <!-- ═══ Ch03 THE WAY FORWARD ═══ -->
    <div class="chapter-card" class:revealed>
      <div class="chapter-label" style="background: rgba(90,143,194,0.10); color: #5A8FC2;">
        <span class="chapter-num" style="background: #5A8FC2; color: #fff;">03</span>
        <span class="chapter-title-text">The Way Forward</span>
      </div>
      <h2 class="chapter-heading">Sustainable cooling for all — fast enough to matter.</h2>
      <p class="story-call-to-insight">{accessContent.callToInsight}</p>

      <div class="access-pledge-badge">
        <div class="pledge-icon"><i class="fa-solid fa-handshake-angle"></i></div>
        <div class="pledge-content">
          <strong>Global Cooling Pledge Alignment</strong>
          <span>Target: {globalCoolingPledge.targetEmissionReduction} from BAU &middot; {globalCoolingPledge.signatoryCountries} signatory nations &middot; Expand sustainable cooling access</span>
        </div>
        <a href={globalCoolingPledge.progressReportUrl} target="_blank" rel="noopener noreferrer" class="pledge-link">Progress Report</a>
      </div>
    </div>

    <!-- ═══ LEARN MORE ═══ -->
    <div class="chapter-card" class:revealed>
      <div class="chapter-label" style="background: rgba(61,107,107,0.10); color: #3D6B6B;">
        <i class="fa-solid fa-books" style="margin-right: 0.2rem;"></i>
        <span class="chapter-title-text">Learn More</span>
      </div>
      <h2 class="chapter-heading">Go deeper on cooling access and vulnerability</h2>

      <div class="access-partner-bar">
        <div class="access-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="access-partner-title">Data Partners</span>
        </div>
        <div class="access-partner-logos">
          {#each accessPartners as partner (partner.id)}
            <a href={partner.coolingUrl} target="_blank" rel="noopener noreferrer" class="access-partner-logo" title={partner.fullName}>
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>

      <div class="access-source-footer">
        Sources:
        <a href="https://www.seforall.org/data-stories/chilling-prospects-2025" target="_blank" rel="noopener noreferrer">SEforALL Chilling Prospects</a>
        &middot;
        <a href="https://coolcoalition.org/" target="_blank" rel="noopener noreferrer">UNEP Cool Coalition</a>
        &middot;
        <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
        &middot;
        <a href="/methodology">Methodology</a>
      </div>
    </div>

    <!-- Source Attribution -->
    <div class="access-source" style="text-align: center; padding: 0.75rem; font-size: 0.7rem; color: #94a3b8;">
      Sources:
      <a href="https://www.seforall.org/data-stories/chilling-prospects-2025" target="_blank" rel="noopener noreferrer" style="color: #64748b;">SEforALL Chilling Prospects</a>
      &middot;
      <a href="https://coolcoalition.org/" target="_blank" rel="noopener noreferrer" style="color: #64748b;">UNEP Cool Coalition</a>
      &middot;
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer" style="color: #64748b;">HEAT GmbH</a>
      &middot;
      <a href="/methodology" style="color: #2D7D5A; font-weight: 600;">Methodology</a>
    </div>
  </div>
</section>

<style>
  /* ===========================
     ACCESS STORY CARD
     Warm/amber accent (access & vulnerability identity).
     =========================== */
  .access-story-card {
    border-left: 4px solid #D4A843;
    padding: 1.75rem;
    position: relative;
    overflow: visible;
  }

  .access-story-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(212, 168, 67, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .access-story-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .access-story-text { flex: 1; min-width: 0; }

  .access-headline {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 0 0 0.4rem;
    letter-spacing: -0.01em;
  }

  .access-subhead {
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
  }

  /* --- Human-right lead --- */
  .access-rights-lead {
    font-size: 1.05rem;
    font-weight: 700;
    color: #C25B33;
    line-height: 1.4;
    margin: 0 0 0.85rem;
    padding: 0.75rem 1rem;
    background: rgba(194, 91, 51, 0.06);
    border-left: 3px solid #C25B33;
    border-radius: 6px;
  }

  /* --- Advanced filter toggle --- */
  .access-advanced-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #2D7D5A;
    background: rgba(45, 125, 90, 0.06);
    border: 1px solid rgba(45, 125, 90, 0.2);
    border-radius: 999px;
    padding: 0.35rem 0.85rem;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s ease;
    margin-bottom: 0.5rem;
  }

  .access-advanced-toggle:hover {
    background: rgba(45, 125, 90, 0.12);
  }

  /* --- Humidity callout card --- */
  .access-humidity-card {
    padding: 1.4rem 1.6rem;
    border-left: 4px solid #5A8FC2;
    background: #f0f7ff;
  }

  .access-humidity-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.85rem;
  }

  .access-humidity-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(90, 143, 194, 0.15);
    color: #5A8FC2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .access-humidity-title { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 0.3rem; }
  .access-humidity-sub   { font-size: 0.82rem; color: #475569; margin: 0; line-height: 1.5; }

  .access-humidity-body {
    font-size: 0.83rem;
    color: #334155;
    line-height: 1.65;
    margin: 0 0 0.75rem;
  }

  .access-humidity-note {
    font-size: 0.78rem;
    color: #64748b;
    line-height: 1.55;
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    margin: 0;
    font-style: italic;
  }

  .access-humidity-note i { color: #5A8FC2; flex-shrink: 0; margin-top: 0.15rem; }

  /* --- Solutions layer card --- */
  .access-solutions-card {
    padding: 1.25rem 1.5rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .access-solutions-header {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1.1rem;
  }

  .access-solutions-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: color-mix(in srgb, #D4A843 12%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #D4A843;
    font-size: 1rem;
  }

  .access-solutions-header strong {
    display: block;
    font-size: 0.9rem;
    color: #1e293b;
    margin-bottom: 0.2rem;
  }

  .access-solutions-header span {
    font-size: 0.78rem;
    color: #64748b;
  }

  .access-solutions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.85rem;
    margin-bottom: 1rem;
  }

  .access-solution-item {
    display: flex;
    gap: 0.6rem;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.75rem 0.85rem;
  }

  .access-solution-icon {
    width: 30px;
    height: 30px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--sol-color) 10%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--sol-color);
    font-size: 0.85rem;
    margin-top: 0.1rem;
  }

  .access-solution-text strong {
    display: block;
    font-size: 0.82rem;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }

  .access-solution-text p {
    font-size: 0.75rem;
    color: #475569;
    line-height: 1.6;
    margin: 0;
  }

  .access-solutions-note {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.6;
    margin: 0;
    padding: 0.6rem 0.85rem;
    background: #fff;
    border-radius: 8px;
    border-left: 3px solid #C25B33;
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .access-solutions-note i {
    color: #C25B33;
    flex-shrink: 0;
    margin-top: 0.15rem;
  }

  @media (max-width: 680px) {
    .access-solutions-grid {
      grid-template-columns: 1fr;
    }
  }

  .access-story-hook {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    margin: 0 0 1.25rem;
    padding: 0.75rem 1rem;
    background: #faf8f0;
    border-radius: 10px;
    border-left: 3px solid #D4A843;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
  }

  .revealed .access-story-hook { opacity: 1; transform: translateY(0); }

  /* Animated counters */
  .access-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  .access-counter-wrapper {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .revealed .access-counter-wrapper { opacity: 1; transform: translateY(0); }

  .access-counters :global(.counter-card) {
    background: linear-gradient(135deg, #faf8f0 0%, #f5f0e0 100%);
    border: 1px solid rgba(212, 168, 67, 0.15);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: 100px;
    padding: 1rem 0.75rem;
  }

  .access-counters :global(.counter-card:hover) {
    background: linear-gradient(135deg, #f0e8d0 0%, #f5f0e040 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(212, 168, 67, 0.12);
  }

  .access-counters :global(.counter-display) { font-size: 1.8rem; color: #8B5E3C; }
  .access-counters :global(.counter-label) { font-size: 0.72rem; color: #D4A843; }
  .access-counters :global(.counter-tooltip) { background: #0f172a !important; color: #ffffff !important; z-index: 99999; box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3); opacity: 1 !important; -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }

  /* Narrative */
  .access-narrative {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
  }

  .revealed .access-narrative { opacity: 1; transform: translateY(0); }

  .access-narrative-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #8B5E3C;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .access-narrative-title i { color: #D4A843; font-size: 0.85rem; }

  .access-narrative p {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.7;
    margin: 0;
  }

  /* Chart highlights */
  .access-chart-highlights {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s;
  }

  .revealed .access-chart-highlights { opacity: 1; transform: translateY(0); }

  .access-highlights-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #8B5E3C;
    margin: 0 0 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .access-highlights-title i { color: #D4A843; font-size: 0.85rem; }

  .access-highlights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .access-highlight-card {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem;
    background: #fafbfc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .access-highlight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .access-highlight-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.1rem; }

  .access-highlight-text { display: flex; flex-direction: column; gap: 0.15rem; }
  .access-highlight-text strong { font-size: 0.78rem; font-weight: 700; color: #0f172a; }
  .access-highlight-text span { font-size: 0.72rem; color: #64748b; line-height: 1.4; }

  /* Cooling Pledge badge */
  .access-pledge-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #f0fdf4, #f0f7f4);
    border: 1px solid #86efac;
    border-radius: 12px;
    margin: 0 0 0.75rem;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s;
  }

  .revealed .access-pledge-badge { opacity: 1; transform: translateY(0); }

  .pledge-icon { font-size: 1.2rem; color: #16a34a; flex-shrink: 0; }
  .pledge-content { flex: 1; min-width: 0; }
  .pledge-content strong { display: block; font-size: 0.78rem; color: #15803d; margin-bottom: 0.15rem; }
  .pledge-content span { font-size: 0.72rem; color: #4ade80; }

  .pledge-link {
    font-size: 0.72rem;
    font-weight: 600;
    color: #15803d;
    text-decoration: none;
    white-space: nowrap;
    border-bottom: 1px dashed #86efac;
    transition: color 0.2s;
  }

  .pledge-link:hover { color: #166534; }

  /* Cool Coalition reference */
  .access-cool-coalition {
    display: flex;
    align-items: center;
    padding: 0.6rem 0.75rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    margin: 0 0 1rem;
    font-size: 0.75rem;
    color: #475569;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.85s, transform 0.6s ease 0.85s;
  }

  .revealed .access-cool-coalition { opacity: 1; transform: translateY(0); }

  .access-cool-coalition strong { color: #2D7D5A; }

  .access-cool-coalition a {
    color: #2D7D5A;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px dashed #2D7D5A;
  }

  .access-cool-coalition a:hover { color: #1A5E43; }

  /* Partner bar */
  .access-partner-bar {
    padding: 0.75rem 0;
    margin: 0 0 0.75rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
  }

  .revealed .access-partner-bar { opacity: 1; transform: translateY(0); }

  .access-partner-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.6rem; }
  .access-partner-header > i { color: #8B5E3C; font-size: 0.8rem; }
  .access-partner-title { font-size: 0.78rem; font-weight: 700; color: #333; }

  .access-partner-logos { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }

  .access-partner-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
    transition: opacity 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
  }

  .access-partner-logo:hover { opacity: 1; transform: translateY(-2px); }
  .access-partner-logo img { max-width: 80px; max-height: 32px; object-fit: contain; }

  /* Source footer */
  .access-source-footer {
    text-align: center;
    font-size: 0.68rem;
    color: #94a3b8;
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transition: opacity 0.6s ease 1.1s;
  }

  .revealed .access-source-footer { opacity: 1; }

  .access-source-footer a {
    color: #64748b;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .access-source-footer a:hover { color: #8B5E3C; border-bottom-color: #8B5E3C; }
  .access-source-footer a:last-child { color: #8B5E3C; font-weight: 600; }

  /* KPI panel */
  .kpi-panel { padding: 1rem 1.25rem; }

  /* Pill-style filters — matching Emissions green pill aesthetic */
  .access-checkboxes {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    padding: 1rem 1rem 0.875rem;
    border-top: 1px solid #e2e8f0;
    margin-top: 0.5rem;
    background: #ffffff;
    border-radius: 0 0 10px 10px;
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .checkbox-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    white-space: nowrap;
  }

  .checkbox-label i { font-size: 0.7rem; opacity: 0.7; }

  .checkbox-items {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  /* Pill button — unselected state: teal outline, light bg */
  .tick-box {
    display: inline-flex;
    align-items: center;
    gap: 0;
    font-size: 0.8rem;
    font-weight: 500;
    color: #3D6B6B;
    cursor: pointer;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    border: 1.5px solid #3D6B6B;
    background: transparent;
    transition: all 0.15s ease;
    user-select: none;
    white-space: nowrap;
    line-height: 1.4;
  }

  .tick-box:hover {
    background: rgba(61, 107, 107, 0.1);
    border-color: #2D5C5C;
    color: #2D5C5C;
  }

  /* Pill button — selected state: filled teal, white text */
  .tick-box:has(input:checked) {
    background: #3D6B6B;
    border-color: #3D6B6B;
    color: #ffffff;
    font-weight: 600;
  }

  .tick-box:has(input:checked):hover {
    background: #2D5C5C;
    border-color: #2D5C5C;
  }

  .tick-box input { display: none; }

  /* Hide tick mark — pills are self-indicating */
  .tick-mark { display: none; }

  /* Risk level pills retain colour-coded active states */
  .tick-box:has(input:checked) .tick-mark { display: none; }

  :global(.risk-dot) {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.2rem;
    vertical-align: middle;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .access-counters { grid-template-columns: repeat(2, 1fr); }
    .access-highlights-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .access-story-card { padding: 1.25rem; }
    .access-headline { font-size: 1.1rem; }
    .access-story-header { flex-direction: column; gap: 0.5rem; }
    .access-counters { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    .access-counters :global(.counter-display) { font-size: 1.4rem; }
    .access-partner-logos { gap: 1rem; }
    .access-partner-logo img { max-width: 60px; max-height: 26px; }
    .access-pledge-badge { flex-direction: column; text-align: center; gap: 0.5rem; }
  }

  @media (max-width: 600px) {
    .access-counters { grid-template-columns: 1fr 1fr; }
    .access-counters :global(.counter-card) { min-height: 85px; padding: 0.75rem 0.5rem; }
    .access-counters :global(.counter-display) { font-size: 1.2rem; }
    .access-counters :global(.counter-label) { font-size: 0.65rem; }
  }
</style>

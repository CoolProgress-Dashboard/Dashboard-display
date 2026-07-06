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
    ACCESS_ALL_YEARS
  } from '$lib/components/shared/config';
  import type { AccessRecord, AccessForecastRecord, AccessCountryPct, Country } from '$lib/services/dashboard-types';
  import { SEQ, CAT, CHROME, NO_DATA, rgba } from '$lib/components/shared/colors';

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
  /** SEforALL country-level high-risk % data (data.accessCountryPct) */
  export let accessCountryPct: AccessCountryPct[] = [];

  // PCT lookup keyed by country_code — rebuilt reactively whenever prop changes
  let pctLookup: Record<string, number> = {};
  $: pctLookup = Object.fromEntries(accessCountryPct.map(r => [r.country_code, r.pct_at_risk ?? 0]));

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
      value: '1B+',
      label: 'people at high risk of inadequate cooling',
      context: 'Just over 1 billion people are at high risk of a lack of access to crucial cooling solutions across 77 countries analyzed. Source: SEforALL Chilling Prospects 2025.'
    },
    {
      value: '2.83B',
      label: 'people at medium risk — the "double burden"',
      context: 'The medium-risk group faces a double burden: unaffordable quality cooling leaves them exposed to heat, while cheaper inefficient options risk locking in a high-emissions trajectory. Source: SEforALL Chilling Prospects 2025.'
    },
    {
      value: '1.05B',
      label: 'people forecast at high risk by 2030',
      context: 'Under a business-as-usual scenario, approximately 1.05 billion people will remain at high risk by 2030 — around 50 million more than in 2024 — as population growth outpaces access gains. Source: SEforALL Chilling Prospects 2025.'
    },
    {
      value: '512M',
      label: 'women among those at highest risk',
      context: 'Women make up 512 million of those at high risk — slightly more than men (492M). Women face compounded vulnerability through higher care burdens, poorly built homes, and intersecting inequalities in services and employment. Source: SEforALL Chilling Prospects 2025.'
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
      title: '2022\u20132030 Timeline',
      description: 'Historical and projected view of population at risk, stacked by risk level from 2022\u20132030',
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

    const [d3Mod, topojsonMod] = await Promise.all([
      import('d3'),
      import('topojson-client')
    ]);

    const d3 = d3Mod;
    const topojson = topojsonMod;
    const echarts = await import('echarts');

    // -------------------------------------------------------
    // Filter state (local to this component)
    // -------------------------------------------------------
    let accessYear = 2024;
    let accessImpactLevels: string[] = ['High', 'Medium', 'Low'];
    let selectedCountry: string | null = null;

    // -------------------------------------------------------
    // Color / threshold config — SEforALL % based system
    // -------------------------------------------------------
    const PCT_THRESHOLDS = [0.05, 0.30, 0.50]; // Low | Moderate | High | Critical
    const PCT_COLORS = [
      '#E0BE3C', // <5%   — yellow: low share, but not "no problem" (green would signal solved)
      '#E8914A', // 5-30% — Moderate (light orange)
      '#C5443A', // 30-50% — High (red, matches SEFORALL High)
      '#7F1D1D', // >50%   — Critical (dark red)
    ] as const;
    const PCT_LABELS = ['Under 5%', '5–30%', '30–50%', 'Over 50%'];

    const SEFORALL_RISK_COLORS: Record<string, string> = {
      'High':   '#C5443A',  // SEforALL red
      'Medium': '#C9921A',  // SEforALL amber
      'Low':    '#2D7D32',  // SEforALL green
    };

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

    function getColorByPct(pct: number): string {
      if (pct <= 0) return NO_DATA;
      if (pct < PCT_THRESHOLDS[0]) return PCT_COLORS[0];
      if (pct < PCT_THRESHOLDS[1]) return PCT_COLORS[1];
      if (pct < PCT_THRESHOLDS[2]) return PCT_COLORS[2];
      return PCT_COLORS[3];
    }

    /** Aggregate population_without_cooling by country for current filters */
    function getAccessTotalsFiltered(): Record<string, number> {
      // Map always shows 2024 historical data with tick-box region/impact/pop filters
      const mapFiltered = accessData.filter(r => {
        if (r.year !== 2024) return false;
        if (accessImpactLevels.length > 0 && r.impact_level && !accessImpactLevels.includes(r.impact_level)) return false;
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
      const swatches = PCT_COLORS.map((color, i) => `
        <div class="legend-item">
          <div class="legend-color" style="background:${color}"></div>
          ${PCT_LABELS[i]}
        </div>
      `).join('');
      const noData = `
        <div class="legend-item">
          <div class="legend-color" style="background:#E5E1D8;border:1px solid #cbd5e1;"></div>
          No data
        </div>
      `;
      legend.innerHTML = swatches + noData;
    }

    function updateAccessProgress() {
      const setWidth = (id: string, pct: number) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${pct}%`;
      };
      const pctValues = Object.values(pctLookup);
      const total = pctValues.length || 1;
      let counts = { low: 0, moderate: 0, high: 0, critical: 0 };
      pctValues.forEach(pct => {
        if (pct < PCT_THRESHOLDS[0]) counts.low++;
        else if (pct < PCT_THRESHOLDS[1]) counts.moderate++;
        else if (pct < PCT_THRESHOLDS[2]) counts.high++;
        else counts.critical++;
      });
      setWidth('access-progress-low', (counts.low / total) * 100);
      setWidth('access-progress-medium', (counts.moderate / total) * 100);
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
          highlightAccessCountry(null);
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
            return getColorByPct(pctLookup[code] ?? 0);
          })
          .on('mouseover', (event: MouseEvent, d: any) => {
            const code = countryIdToCode[normalizeId(d.id)];
            if (!code) return;
            const country = countries.find(c => c.country_code === code);
            const summary = accessCountryPct.find(r => r.country_code === code);
            const totalM = summary?.total_at_risk ? `${(summary.total_at_risk / 1e6).toFixed(1)}M` : 'No data';
            const pct = pctLookup[code] ?? 0;
            const tt = getTooltip();
            if (!tt) return;
            tt.innerHTML = `
              <strong>${country?.country_name || code}</strong><br>
              <span style="font-weight:600;">At risk: ${totalM}${pct > 0 ? ` (${(pct * 100).toFixed(1)}% of population)` : ''}</span><br>
              <span style="color:#94a3b8;font-size:0.8em;">Click for breakdown by risk level</span>
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

      accessMapSvg.selectAll('.access-path')
        .transition()
        .duration(300)
        .attr('fill', function(this: any) {
          const code = d3.select(this).attr('data-code');
          if (!code) return NO_DATA;
          return getColorByPct(pctLookup[code] ?? 0);
        });

      updateAccessLegend();
      updateAccessProgress();
      updateAccessViewingBadge();
    }

    // -------------------------------------------------------
    // Highlight selected country on the access map
    // -------------------------------------------------------
    function highlightAccessCountry(code: string | null) {
      if (!accessMapSvg) return;
      accessMapSvg.selectAll('.access-path')
        .classed('country-selected', function(this: any) {
          return code !== null && d3.select(this).attr('data-code') === code;
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

      const normalizedForecast = accessForecast.map(r => ({
        ...r,
        region: (r.country_code && histRegionMap[r.country_code])
          ? histRegionMap[r.country_code]
          : r.region
      }));

      // Range: 2022–2030 — SEforALL data only (AC-04: start 2022; no HEAT projections beyond 2030)
      const allRecords = [...accessData, ...normalizedForecast].filter(r => r.year >= 2022 && r.year <= 2030);

      // Apply risk level filter only
      const filtered = allRecords.filter(r => {
        if (accessImpactLevels.length > 0 && r.impact_level && !accessImpactLevels.includes(r.impact_level)) return false;
        return true;
      });

      const years = Array.from(new Set(filtered.map(r => r.year))).sort((a, b) => a - b);
      // Low first → High last so High renders on top of the stack
      const riskLevels = ['Low', 'Medium', 'High'];

      const seriesData: Record<string, number[]> = {};
      riskLevels.forEach(lvl => { seriesData[lvl] = []; });

      years.forEach(y => {
        riskLevels.forEach(lvl => {
          const records = filtered.filter(r => r.year === y && r.impact_level === lvl);
          const total = records.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
          seriesData[lvl].push(Math.round(total / 1e6 * 10) / 10);
        });
      });

      const activeRisks = riskLevels.filter(lvl =>
        accessImpactLevels.includes(lvl) && seriesData[lvl].some(v => v > 0)
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
          data: activeRisks.map(lvl => ({ name: lvl, itemStyle: { color: SEFORALL_RISK_COLORS[lvl] } })),
          bottom: 0,
          left: 'center',
          textStyle: { fontSize: 11, color: '#1e293b', fontWeight: 700 }
        },
        grid: { left: '3%', right: '6%', bottom: '14%', top: '14%', containLabel: true },
        xAxis: {
          type: 'category',
          data: years,
          axisLabel: {
            fontSize: 10, color: '#1e293b', fontWeight: 700,
            interval: 0,
            showMaxLabel: true,
            formatter: (val: string | number) => [2022, 2024, 2026, 2028, 2030].includes(Number(val)) ? String(val) : ''
          },
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          name: 'Population (millions)',
          nameTextStyle: { fontSize: 11, color: '#1e293b', fontWeight: 700 },
          axisLabel: { fontSize: 10, color: '#1e293b', fontWeight: 700, formatter: '{value}M' }
        },
        series: activeRisks.map((lvl, idx) => ({
          name: lvl,
          type: 'line',
          stack: 'total',
          areaStyle: { opacity: 0.7, color: SEFORALL_RISK_COLORS[lvl] },
          data: seriesData[lvl],
          smooth: false,
          symbol: 'none',
          lineStyle: { color: SEFORALL_RISK_COLORS[lvl], width: 1.5 },
          itemStyle: { color: SEFORALL_RISK_COLORS[lvl] },
          markLine: idx === 0 ? {
            silent: true,
            symbol: 'none',
            data: [{
              xAxis: '2024',
              lineStyle: { color: '#94a3b8', type: 'dashed', width: 1.5 },
              label: {
                formatter: 'Historical | Forecast',
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

      // Low first → High last so High renders on top of the stack
      const riskLevels = ['Low', 'Medium', 'High'];

      // 2022–2030 — SEforALL data only
      const CHART_YEARS = ACCESS_ALL_YEARS.filter((y: number) => y >= 2022 && y <= 2030);

      // Build stacked data by risk level over 2022–2030
      const stackedData = riskLevels.map(lvl => ({
        name: lvl,
        data: CHART_YEARS.map((year: number) => {
          const yearLvlData = countryData.filter(r => r.year === year && r.impact_level === lvl);
          return yearLvlData.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
        }),
        color: SEFORALL_RISK_COLORS[lvl]
      }));

      // 2024 breakdown for pie chart by risk level
      const currentYearData = countryData.filter(r => r.year === 2024);
      const categoryBreakdown = riskLevels.map(lvl => {
        const total = currentYearData
          .filter(r => r.impact_level === lvl)
          .reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
        return { category: lvl, value: total, color: SEFORALL_RISK_COLORS[lvl] };
      }).filter(cb => cb.value > 0);

      const currentYearTotal = currentYearData.reduce((sum, r) => sum + (r.population_without_cooling || 0), 0);
      const baselineYear = 2022;
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
      const dominantRisk = categoryBreakdown.reduce(
        (max, c) => c.value > max.value ? c : max,
        { category: '', value: 0 }
      ).category;
      const trendDescription = `Population without cooling access has ${trendDirection} by ${Math.abs(Number(changePercent))}% since ${baselineYear}.`;
      const breakdownDescription = dominantRisk
        ? `The highest concentration is in the <strong style="color:${SEFORALL_RISK_COLORS[dominantRisk] || '#C5443A'}">${dominantRisk} risk</strong> category.`
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
              ${(currentYearTotal / 1e6).toFixed(1)}M at risk${(() => {
                const s = accessCountryPct.find(r => r.country_code === code);
                return s?.pct_at_risk ? ` (${(s.pct_at_risk * 100).toFixed(1)}% of population)` : '';
              })()}
            </span>
            <span style="font-size: 0.8rem; color: ${changeColor}; font-weight: 500;">
              <i class="fa-solid ${changeIcon}" style="margin-right: 0.25rem;"></i>
              ${Math.abs(Number(changePercent))}% since ${baselineYear}
            </span>
          </div>
        </div>
        <div class="country-charts-grid">
          <div class="chart-box" style="background: transparent; border: none; border-top: 1px solid rgba(0,0,0,0.06); padding: 0.75rem 0;">
            <div style="font-size: 0.75rem; font-weight: 600; color: #8B5E3C; margin-bottom: 0.5rem;">
              <i class="fa-solid fa-chart-area" style="margin-right: 0.3rem; color: #D4A843;"></i>
              Population at Risk Over Time
            </div>
            <div class="access-stacked-chart" style="width: 100%; height: 200px;"></div>
          </div>
          <div class="chart-box" style="background: transparent; border: none; border-top: 1px solid rgba(0,0,0,0.06); padding: 0.75rem 0;">
            <div style="font-size: 0.75rem; font-weight: 600; color: #8B5E3C; margin-bottom: 0.5rem;">
              <i class="fa-solid fa-venus-mars" style="margin-right: 0.3rem; color: #D4A843;"></i>
              2024 Gender Breakdown
            </div>
            <div class="access-gender-chart" style="width: 100%; height: 200px;"></div>
          </div>
        </div>
        <div class="country-insight" style="background: transparent; border-radius: 0; padding: 1rem 0 1rem 1rem; border: none; border-left: 3px solid #D4A843;">
          <div style="font-size: 0.8rem; font-weight: 600; color: #8B5E3C; margin-bottom: 0.5rem;">
            <i class="fa-solid fa-lightbulb" style="color: #D4A843; margin-right: 0.35rem;"></i>
            Analysis for ${country.country_name}
          </div>
          <p style="font-size: 0.85rem; color: #6B4423; line-height: 1.6; margin: 0;">
            ${trendDescription} ${breakdownDescription}
            <span style="display: block; margin-top: 0.5rem; font-size: 0.75rem; color: #64748b;">
              <em>Data: SEforALL Chilling Prospects (historical)</em>
            </span>
          </p>
        </div>
      `;

      // Render ECharts inside the newly-created DOM nodes
      setTimeout(() => {
        const stackedContainer = accessDetail.querySelector('.access-stacked-chart') as HTMLElement | null;
        const genderContainer = accessDetail.querySelector('.access-gender-chart') as HTMLElement | null;

        if (accessCountryStackedChart) { accessCountryStackedChart.dispose(); accessCountryStackedChart = null; }
        if (accessCountryPieChart) { accessCountryPieChart.dispose(); accessCountryPieChart = null; }

        if (stackedContainer) {
          accessCountryStackedChart = echarts.init(stackedContainer);
          accessCountryStackedChart.setOption({
            grid: { top: 30, right: 30, bottom: 28, left: 70 },
            legend: {
              show: true, top: 0, left: 'center',
              itemWidth: 14, itemHeight: 10,
              textStyle: { fontSize: 12, color: '#1e293b', fontWeight: 700 },
              itemGap: 10
            },
            xAxis: {
              type: 'category',
              data: CHART_YEARS.map(String),
              axisLabel: { fontSize: 13, interval: 1, fontWeight: 700, color: '#1e293b' },
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
              name: 'Population', nameLocation: 'middle', nameGap: 55,
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
              itemStyle: { color: cat.color },
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

        const genderSummary = accessCountryPct.find(r => r.country_code === code);
        const femaleTotal = genderSummary?.female_at_risk ?? 0;
        const maleTotal = genderSummary?.male_at_risk ?? 0;

        if (genderContainer && (femaleTotal > 0 || maleTotal > 0)) {
          accessCountryPieChart = echarts.init(genderContainer);
          const genderSum = femaleTotal + maleTotal;
          const femalePct = genderSum > 0 ? ((femaleTotal / genderSum) * 100).toFixed(1) : '0';
          const malePct   = genderSum > 0 ? ((maleTotal   / genderSum) * 100).toFixed(1) : '0';
          accessCountryPieChart.setOption({
            tooltip: {
              trigger: 'item',
              textStyle: { fontSize: 12 },
              formatter: (params: any) => `<strong>${params.name}</strong><br/>${(params.value / 1e6).toFixed(2)}M (${params.percent}%)`
            },
            legend: {
              show: true,
              orient: 'horizontal',
              bottom: 0,
              left: 'center',
              itemWidth: 12, itemHeight: 10,
              textStyle: { fontSize: 11, color: '#1e293b', fontWeight: 600 },
              data: [
                { name: 'Female', icon: 'circle' },
                { name: 'Male',   icon: 'circle' }
              ],
              formatter: (name: string) => name
            },
            series: [{
              type: 'pie',
              radius: ['30%', '55%'],
              center: ['50%', '44%'],
              startAngle: 90,
              avoidLabelOverlap: false,
              itemStyle: { borderRadius: 3, borderColor: '#fff', borderWidth: 2 },
              label: {
                show: true, position: 'outside', fontSize: 11, fontWeight: 700,
                formatter: (params: any) => `${params.percent?.toFixed(1)}%`
              },
              labelLine: { show: true, length: 8, length2: 6 },
              data: [
                { name: 'Male',   value: maleTotal,   itemStyle: { color: '#06B6D4' } },
                { name: 'Female', value: femaleTotal, itemStyle: { color: '#7C3AED' } }
              ]
            }]
          });
        } else if (genderContainer) {
          genderContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:0.75rem;">No gender data available</div>';
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
      const filtersPanel = document.getElementById('access-filters-panel');
      const countryDetail = document.getElementById('access-country-detail');
      if (timelineContainer) timelineContainer.style.display = selectedCountry ? 'none' : '';
      if (filtersPanel) filtersPanel.style.display = selectedCountry ? 'none' : '';
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
          highlightAccessCountry(null);
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
    <div class="access-narrative-section" class:revealed>
      <span class="access-eyebrow">The Challenge</span>
      <h2 class="access-section-title">Access to cooling is not a luxury, it is a human right.</h2>
      <p class="access-body-text">As temperatures rise and the effects of extreme and prolonged heat stress become apparent, access to cooling becomes essential to address three interconnected needs: <strong>agriculture, food security and nutrition</strong>; <strong>health services</strong>; and <strong>human safety and comfort</strong>. Just over 1 billion people are at high risk of a lack of access to crucial cooling solutions across 77 countries analyzed by <a href="https://www.seforall.org/our-work/research-analysis/chilling-prospects-series" target="_blank" rel="noopener noreferrer" style="color:#0369a1;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(3,105,161,0.3);">SEforALL Chilling Prospects</a>.</p>

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

      <!-- 4-card impact grid -->
      <div class="access-impact-grid">
        <div class="access-impact-card">
          <div class="access-impact-icon"><i class="fa-solid fa-heart-crack"></i></div>
          <h4 class="access-impact-title">The Human Cost</h4>
          <p class="access-impact-body">Heat is now the leading weather-related cause of death. In the Global South, where data is often under-reported, the impact is most severe in dense informal settlements that act as heat traps — particularly for the elderly, young children, and outdoor workers.</p>
        </div>
        <div class="access-impact-card">
          <div class="access-impact-icon"><i class="fa-solid fa-briefcase"></i></div>
          <h4 class="access-impact-title">Economic Fragility</h4>
          <p class="access-impact-body">Heat stress is a direct threat to global labour. The ILO estimates that by 2030, the world could lose 2.2% of total working hours — equivalent to 80 million full-time jobs — due to extreme heat, concentrated in agriculture and construction across South Asia and Africa.</p>
        </div>
        <div class="access-impact-card">
          <div class="access-impact-icon"><i class="fa-solid fa-temperature-low"></i></div>
          <h4 class="access-impact-title">The Cold Chain Crisis</h4>
          <p class="access-impact-body">A lack of cooling leads to significant post-harvest food losses and breaks down the supply of life-saving medicines and vaccines. For rural communities, sustainable cooling is the foundation of food security and economic resilience.</p>
        </div>
        <div class="access-impact-card">
          <div class="access-impact-icon"><i class="fa-solid fa-person-dress"></i></div>
          <h4 class="access-impact-title">Gender &amp; Vulnerability</h4>
          <p class="access-impact-body">Women are more vulnerable to heat than men due to intersecting disparities: higher care burdens in crowded and poorly built homes; limited access to safe water and sanitation; and a higher likelihood of working in low-paid, strenuous and exploitative jobs. Of those at high risk, 512 million are women.</p>
        </div>
      </div>
    </div>

    <!-- DATA: Why Humidity Matters -->
    <!-- Humidity & Wet-Bulb Callout -->
    <aside class="access-humidity-card">
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
    <div class="access-narrative-section" style="border-top: 1px solid rgba(0,0,0,0.06);" class:revealed>
      <span class="access-eyebrow">Who Is Most Affected</span>
      <h2 class="access-section-title">Three groups face distinct but interconnected cooling risks.</h2>
      <p class="access-body-text">The Chilling Prospects framework identifies populations by their level of risk and the nature of the cooling challenge they face. Understanding each group is essential — because the solutions are different.</p>

      <div class="access-risk-groups">
        <div class="access-risk-group access-risk-high">
          <div class="access-risk-group-header">
            <span class="access-risk-badge" style="background:#C5443A;">HIGH RISK</span>
            <strong>1 billion+ people</strong>
          </div>
          <p>The rural and urban poor who cannot afford or access any cooling solution. This group faces the most severe and immediate threat from extreme heat — to their health, food security, and livelihoods. Over 309 million are among the rural poor; 695 million among the urban poor.</p>
        </div>
        <div class="access-risk-group access-risk-medium">
          <div class="access-risk-group-header">
            <span class="access-risk-badge" style="background:#C9921A;">MEDIUM RISK</span>
            <strong>2.83 billion people</strong>
          </div>
          <p>Lower-middle-income households who face a <strong>double burden</strong>: quality cooling solutions remain unaffordable, leaving them exposed to heat — but the cheaper, inefficient options available risk locking in a high-emissions trajectory for decades.</p>
        </div>
        <div class="access-risk-group access-risk-low">
          <div class="access-risk-group-header">
            <span class="access-risk-badge" style="background:#2D7D32;">LOW RISK</span>
            <strong>1.2 billion people</strong>
          </div>
          <p>Middle-income households who can access efficient cooling solutions today. As heat extremes increase globally, this group must be supported by policy and technology to make sustainable choices — or they will drive significant emissions growth.</p>
        </div>
      </div>

      <aside class="access-trajectory-callout">
        <i class="fa-solid fa-arrow-trend-up" style="color:#C5443A; font-size:1.1rem; flex-shrink:0;"></i>
        <p><strong>The trajectory is heading in the wrong direction.</strong> Under a business-as-usual scenario, 1.05 billion people will remain at high risk by 2030 — approximately 50 million more than in 2024. Population growth is outpacing progress on energy access and affordability, particularly in urban areas where the urban poor at high risk are projected to grow by 7% to 744 million people.</p>
      </aside>

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
        <i class="fa-solid fa-people-group" style="color: #0369a1; margin-right: 0.5rem;"></i>
        <span>
          <strong>UNEP Cool Coalition</strong> unites 100+ governments, cities, and businesses for clean, efficient, accessible cooling.
          <a href="https://coolcoalition.org/" target="_blank" rel="noopener noreferrer">Learn more</a>
        </span>
      </div>
    </div>

    <!-- Map Card with Filters Inside -->
    <div class="card-panel map-card">
      <div class="card-header" style="border-bottom: none;">
        <div class="card-title">
          <i class="fa-solid fa-earth-americas"></i>
          Cooling Access Risk by Country
          <span style="font-size:0.72rem;font-weight:500;color:#64748b;margin-left:0.5rem;letter-spacing:0;">Data: 2024</span>
        </div>
        <span class="viewing-pill">Viewing: <strong id="access-viewing">Global</strong></span>
      </div>
      <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; padding: 0 0.5rem;">
        Population lacking sustainable cooling access (millions). Click a country for details.
      </div>
      <p class="chart-hint">Hover over a country to see the population at risk and risk level breakdown. Click a country to explore income group and time-series detail.</p>
      <div id="access-map-container" class="map-surface"></div>
      <div class="legend legend-row">
        <span class="legend-label">Map — % of population at risk:</span>
        <div id="access-legend" class="legend-items"></div>
      </div>
      <div class="progress-bar access-progress">
        <span class="progress-segment access-low" id="access-progress-low"></span>
        <span class="progress-segment access-medium" id="access-progress-medium"></span>
        <span class="progress-segment access-high" id="access-progress-high"></span>
        <span class="progress-segment access-critical" id="access-progress-critical"></span>
      </div>

      <!-- Global Timeline Chart (2022-2030) -->
      <div id="access-timeline-container" style="margin-top: 0.5rem;">
        <div class="chart-card-header" style="padding: 0.75rem 1rem; border-bottom: none;">
          <h3 style="font-size: 0.88rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 0.4rem; margin: 0;">
            <i class="fa-solid fa-chart-area" style="color: #D4A843;"></i>
            Population at Risk: 2022&ndash;2030
          </h3>
          <p style="font-size: 0.72rem; color: #334155; font-weight: 600; margin: 0.2rem 0 0;">
            SEforALL Chilling Prospects data &middot; Stacked by risk level &middot; Forecast to 2030
          </p>
        </div>
        <div class="chart-card-body">
          <p class="chart-hint">Map shows high-risk population only. Use the filter below to adjust the timeline chart.</p>
          <div id="chart-access-timeline" class="chart-surface" style="width: 100%; height: 280px; min-height: 280px;"></div>
        </div>
      </div>

      <!-- Risk Level filter — below the timeline chart -->
      <div class="access-checkboxes" id="access-filters-panel">
        <div class="checkbox-group">
          <span class="checkbox-label"><i class="fa-solid fa-triangle-exclamation"></i> Risk Level <i class="fa-solid fa-circle-info" style="font-size:0.7rem;color:#94a3b8;margin-left:0.3rem;" title="Hover over each filter for more information"></i></span>
          <div class="checkbox-items" id="access-impact-checks">
            <label class="tick-box" title="HIGH RISK: Populations facing the most severe cooling vulnerability — lack of energy access, extreme poverty, high exposure to dangerous heat."><input type="checkbox" value="High" checked /><span class="tick-mark risk-high"></span>High</label>
            <label class="tick-box" title="MEDIUM RISK: Populations on the brink of purchasing inefficient cooling devices; at risk of locking into high-emissions solutions without access to efficient alternatives."><input type="checkbox" value="Medium" checked /><span class="tick-mark risk-medium"></span>Medium</label>
            <label class="tick-box" title="LOW RISK: Populations with growing access to cooling but still facing affordability and efficiency challenges."><input type="checkbox" value="Low" checked /><span class="tick-mark risk-low"></span>Low</label>
          </div>
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

    <!-- ═══ THE WAY FORWARD ═══ -->
    <!-- ═══ THE WAY FORWARD + SOLUTIONS ═══ -->
    <div class="access-narrative-section" style="border-top: 1px solid rgba(0,0,0,0.06);" class:revealed>
      <span class="access-eyebrow">The Way Forward</span>
      <h2 class="access-section-title">Sustainable Cooling for All: Fast Enough to Matter</h2>
      <p class="access-body-text">Closing the global cooling access gap sustainably requires a comprehensive and systemic shift. Economic growth alone will not be sufficient to bridge the gap for the poorest households. SEforALL organises sustainable cooling solutions into <strong>five approaches in order of priority</strong> — from protecting the most vulnerable today, to building systemic conditions for long-term impact — delivered across four solution types. Source: <a href="https://www.seforall.org/chilling-prospects-2020/sustainable-cooling-solutions" target="_blank" rel="noopener noreferrer" style="color:#0369a1;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(3,105,161,0.3);">SEforALL Sustainable Cooling Solutions</a></p>

      <!-- 5 approaches as a visual flow -->
      <div class="sol-approach-flow">
        <div class="sol-approach-step">
          <div class="sol-approach-num" style="background:#2D7D32;">1</div>
          <div class="sol-approach-icon" style="color:#2D7D32;"><i class="fa-solid fa-shield-halved"></i></div>
          <h4 class="sol-approach-title" style="color:#2D7D32;">Protect</h4>
          <p class="sol-approach-desc">Reduce vulnerability to heat with cooling solutions that are <strong>affordable, safe and reliable</strong> — prioritising people, businesses, and governments most at risk.</p>
        </div>
        <div class="sol-approach-arrow"><i class="fa-solid fa-arrow-right"></i></div>
        <div class="sol-approach-step">
          <div class="sol-approach-num" style="background:#0369a1;">2</div>
          <div class="sol-approach-icon" style="color:#0369a1;"><i class="fa-solid fa-leaf"></i></div>
          <h4 class="sol-approach-title" style="color:#0369a1;">Reduce</h4>
          <p class="sol-approach-desc">Lower demand for active cooling through <strong>passive design, urban planning, and nature-based solutions</strong> — water, trees, earth, and traditional low-tech approaches.</p>
        </div>
        <div class="sol-approach-arrow"><i class="fa-solid fa-arrow-right"></i></div>
        <div class="sol-approach-step">
          <div class="sol-approach-num" style="background:#7C3AED;">3</div>
          <div class="sol-approach-icon" style="color:#7C3AED;"><i class="fa-solid fa-rotate"></i></div>
          <h4 class="sol-approach-title" style="color:#7C3AED;">Shift</h4>
          <p class="sol-approach-desc">Change the approach to achieve emissions savings — <strong>renewable energy, natural refrigerants</strong>, and conservation measures that transform how cooling is delivered.</p>
        </div>
        <div class="sol-approach-arrow"><i class="fa-solid fa-arrow-right"></i></div>
        <div class="sol-approach-step">
          <div class="sol-approach-num" style="background:#B8860B;">4</div>
          <div class="sol-approach-icon" style="color:#B8860B;"><i class="fa-solid fa-gauge-high"></i></div>
          <h4 class="sol-approach-title" style="color:#B8860B;">Improve</h4>
          <p class="sol-approach-desc">Pure <strong>efficiency measures</strong> — delivering the same cooling with less energy through MEPS, energy labels, and best-available-technology standards.</p>
        </div>
        <div class="sol-approach-arrow"><i class="fa-solid fa-arrow-right"></i></div>
        <div class="sol-approach-step">
          <div class="sol-approach-num" style="background:#C25B33;">5</div>
          <div class="sol-approach-icon" style="color:#C25B33;"><i class="fa-solid fa-people-group"></i></div>
          <h4 class="sol-approach-title" style="color:#C25B33;">Leverage</h4>
          <p class="sol-approach-desc"><strong>Collective impact</strong> through cooperation, financing mechanisms, policy coherence, capacity building, and cross-sector partnerships.</p>
        </div>
      </div>

      <!-- 4 solution type cards -->
      <h3 class="sol-types-heading">Solutions are delivered across four types</h3>
      <div class="access-impact-grid">
        <div class="access-impact-card">
          <div class="access-impact-icon" style="background:rgba(3,105,161,0.1);color:#0369a1;"><i class="fa-solid fa-microchip"></i></div>
          <h4 class="access-impact-title">Technology</h4>
          <p class="access-impact-body"><strong>Nature-based &amp; passive:</strong> water, trees, plants, earth — traditional low-tech and modern high-tech approaches. <strong>Active:</strong> fans, air conditioners, refrigerators, and district cooling systems — varying in efficiency and refrigerant type.</p>
        </div>
        <div class="access-impact-card">
          <div class="access-impact-icon" style="background:rgba(22,163,74,0.1);color:#15803d;"><i class="fa-solid fa-briefcase"></i></div>
          <h4 class="access-impact-title">Services</h4>
          <p class="access-impact-body"><strong>Preparational:</strong> education, skills training, and project services (engineering, design, architecture). <strong>Operational:</strong> direct operation of cooling centres and district systems, management, and maintenance for optimal performance.</p>
        </div>
        <div class="access-impact-card">
          <div class="access-impact-icon" style="background:rgba(124,58,237,0.1);color:#7C3AED;"><i class="fa-solid fa-landmark"></i></div>
          <h4 class="access-impact-title">Policy</h4>
          <p class="access-impact-body"><strong>Regulatory:</strong> building codes and product standards. <strong>Information:</strong> voluntary labels, certifications, and awareness campaigns. <strong>Incentive:</strong> financial and non-financial incentives that shift market behaviour toward sustainable solutions.</p>
        </div>
        <div class="access-impact-card">
          <div class="access-impact-icon" style="background:rgba(184,134,11,0.1);color:#B8860B;"><i class="fa-solid fa-coins"></i></div>
          <h4 class="access-impact-title">Financial</h4>
          <p class="access-impact-body"><strong>Finance:</strong> loans enabling access to sustainable technology. <strong>Fiscal:</strong> tax credits, energy and carbon pricing, import duties and subsidy reform. <strong>Funding:</strong> grants and rebates that require no repayment — critical for reaching the poorest households.</p>
        </div>
      </div>

      <p class="access-body-text" style="margin-top: 1rem;">A rights-based approach to cooling recognises that access is a prerequisite for health, food security, and economic participation. By integrating these solutions into NDCs and national development plans, we can break the cycle of emissions and heat — ensuring that cooling is sustainable, equitable, and fast enough to matter.</p>

      <div class="sol-thisiscool">
        <i class="fa-solid fa-circle-check" style="color:#2D7D32; flex-shrink:0;"></i>
        <p>The <strong>#ThisIsCool</strong> solutions directory helps communities find the best sustainable cooling solutions matched to their specific context and needs. <a href="https://www.seforall.org/chilling-prospects-2020/sustainable-cooling-solutions" target="_blank" rel="noopener noreferrer">Explore solutions on SEforALL →</a></p>
      </div>

      <div class="access-pledge-badge">
        <div class="pledge-icon"><i class="fa-solid fa-handshake-angle"></i></div>
        <div class="pledge-content">
          <strong>Global Cooling Pledge Alignment</strong>
          <span>Target: {globalCoolingPledge.targetEmissionReduction} from BAU &middot; Expand sustainable cooling access</span>
        </div>
        <a href={globalCoolingPledge.progressReportUrl} target="_blank" rel="noopener noreferrer" class="pledge-link">Progress Report</a>
      </div>
    </div>

    <!-- ═══ RESOURCES ═══ -->
    <div class="access-narrative-section access-resources-section" style="border-top: 1px solid rgba(0,0,0,0.06);" class:revealed>
      <span class="access-eyebrow">Go Deeper</span>
      <h2 class="access-section-title">Resources on Cooling Access &amp; Vulnerability</h2>

      <div class="access-resources-grid">
        <a href="https://www.seforall.org/our-work/research-analysis/chilling-prospects-series" target="_blank" rel="noopener noreferrer" class="access-resource-card">
          <strong class="access-resource-title">Chilling Prospects Series (SEforALL)</strong>
          <span class="access-resource-desc">The definitive annual tracker of cooling access gaps across 77 countries — identifying who is at risk, where, and why. Includes the 2025 data release and all previous editions.</span>
        </a>
        <a href="https://thisiscool.seforall.org/solutions" target="_blank" rel="noopener noreferrer" class="access-resource-card">
          <strong class="access-resource-title">#ThisIsCool — Sustainable Cooling Solutions Tool</strong>
          <span class="access-resource-desc">SEforALL's interactive directory of sustainable cooling solutions. Find the best options matched to community context across Technology, Services, Policy, and Financial solution types.</span>
        </a>
        <a href="https://documents1.worldbank.org/curated/en/099053124150533090/pdf/P174321194a3b10131a1ee1c550a837e664.pdf" target="_blank" rel="noopener noreferrer" class="access-resource-card">
          <strong class="access-resource-title">World Bank: Sustainable Cooling in Off-Grid Rural Areas</strong>
          <span class="access-resource-desc">World Bank / ESMAP report on the nexus between energy access and clean cooling in off-grid rural communities — cold chains, solar cooling, and financing pathways for the most underserved populations.</span>
        </a>
        <a href="https://aseanenergy.org/publications/roadmap-for-extreme-heat-protection-through-passive-cooling-in-asean-region/" target="_blank" rel="noopener noreferrer" class="access-resource-card">
          <strong class="access-resource-title">UNEP/ASEAN: Roadmap for Extreme Heat Protection</strong>
          <span class="access-resource-desc">Technical roadmap for a "Passive First" design philosophy demonstrating 20–50% cooling energy savings from natural ventilation and reflective surfaces.</span>
        </a>
        <a href="https://www.unep.org/resources/report/beating-heat-sustainable-cooling-handbook-cities" target="_blank" rel="noopener noreferrer" class="access-resource-card">
          <strong class="access-resource-title">Cool Coalition: Beating the Heat Handbook</strong>
          <span class="access-resource-desc">Encyclopedia of 80 case studies covering cool roofs, green corridors, and shading strategies that reduce the urban heat island effect.</span>
        </a>
        <a href="https://www.green-cooling-initiative.org/news-media/publications/publication-detail/2025/08/27/climate-and-environmentally-friendly-solar-cooling-technology-solutions" target="_blank" rel="noopener noreferrer" class="access-resource-card">
          <strong class="access-resource-title">GIZ Proklima: Solar Cooling Solutions</strong>
          <span class="access-resource-desc">Technical guideline on the intersection of solar energy and passive architectural principles for rural and off-grid contexts.</span>
        </a>
        <a href="https://www.iea-dhc.org/" target="_blank" rel="noopener noreferrer" class="access-resource-card">
          <strong class="access-resource-title">IEA DHC: Thermal Networks Case Studies 2025/2026</strong>
          <span class="access-resource-desc">Factsheets on District Heating and Cooling showing how centralised networks replace thousands of individual AC units and reduce peak loads.</span>
        </a>
        <a href="https://www.unep.org/resources/report/district-energy-cities-unlocking-potential-energy-efficiency-and-renewable-energy" target="_blank" rel="noopener noreferrer" class="access-resource-card">
          <strong class="access-resource-title">UNEP: Sustainable District Cooling Guidelines</strong>
          <span class="access-resource-desc">Strategic guide for city planners on financing, designing, and regulating district cooling systems as part of a low-carbon urban transition.</span>
        </a>
      </div>

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
        <a href="https://www.seforall.org/our-work/research-analysis/chilling-prospects-series" target="_blank" rel="noopener noreferrer">SEforALL Chilling Prospects</a>
        &middot;
        <a href="https://coolcoalition.org/" target="_blank" rel="noopener noreferrer">UNEP Cool Coalition</a>
        &middot;
        <a href="https://www.heat-international.de/" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
        &middot;
        <a href="/methodology">Methodology</a>
      </div>
    </div>

  </div>
</section>

<style>
  /* ===========================
     DESIGN SYSTEM — narrative sections
     =========================== */
  .access-narrative-section {
    padding: 32px 64px;
  }

  .access-eyebrow {
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #0369a1;
    display: inline-block;
    margin-bottom: 16px;
  }

  .access-section-title {
    font-size: 2.2rem;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.025em;
    margin: 0 0 12px;
    line-height: 1.15;
  }

  .access-body-text {
    font-size: 1rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.78;
    margin: 0 0 16px;
  }

  /* ===========================
     IMPACT / STRATEGY 2×2 GRID CARDS
     =========================== */
  .access-impact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin: 28px 0 28px;
  }

  .access-impact-card {
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-radius: 0;
    padding: 28px 0;
  }

  .access-impact-card:hover {
    transform: none;
  }

  .access-impact-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: rgba(3,105,161,0.1);
    color: #0369a1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  .access-impact-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px;
    line-height: 1.3;
  }

  .access-impact-body {
    font-size: 0.85rem;
    font-weight: 500;
    color: #475569;
    line-height: 1.65;
    margin: 0;
  }

  @media (max-width: 768px) {
    .access-narrative-section { padding: 36px 24px; }
    .access-impact-grid { grid-template-columns: 1fr; }
    .access-resources-grid { grid-template-columns: 1fr; }
    .card-panel { padding-left: 24px; padding-right: 24px; }
    .country-card-inline { padding-left: 24px; padding-right: 24px; }
    .access-humidity-card { margin: 0 24px; padding: 1.2rem 0 1.2rem 1rem; }
  }

  /* ===========================
     RESOURCES SECTION
     =========================== */
  .access-resources-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin: 28px 0 36px;
  }

  .access-resource-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-radius: 0;
    padding: 24px 0;
    text-decoration: none;
  }

  .access-resource-card:hover {
    color: #0284c7;
  }

  .access-resource-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: #0369a1;
    line-height: 1.35;
  }

  .access-resource-desc {
    font-size: 0.8rem;
    color: #475569;
    line-height: 1.6;
  }

  /* ===========================
     ADVANCED FILTER TOGGLE
     =========================== */
  /* --- Advanced filter toggle --- */
  .access-advanced-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #0369a1;
    background: rgba(3, 105, 161, 0.06);
    border: 1px solid rgba(3, 105, 161, 0.2);
    border-radius: 999px;
    padding: 0.35rem 0.85rem;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s ease;
    margin-bottom: 0.5rem;
  }

  .access-advanced-toggle:hover {
    background: rgba(3, 105, 161, 0.12);
  }

  /* --- Humidity callout card --- */
  .access-humidity-card {
    margin: 0 64px;
    padding: 1.4rem 0 1.4rem 1.2rem;
    background: transparent;
    border-radius: 0;
    border: none;
    border-left: 4px solid #5A8FC2;
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

  .access-story-hook {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    margin: 0 0 1.25rem;
    padding: 0.75rem 0 0.75rem 1rem;
    background: transparent;
    border-radius: 0;
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
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-radius: 0;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: unset;
    padding: 1rem 0;
  }

  .access-counters :global(.counter-card:hover) {
    background: transparent;
    transform: none;
    box-shadow: none;
  }

  .access-counters :global(.counter-display) { font-size: 1.8rem; color: #8B5E3C; }
  /* AC-08: was #D4A843 (light amber, ~2.5:1 on white, fails WCAG AA);
     dark amber keeps the accent hue at >=4.5:1 for small text */
  .access-counters :global(.counter-label) { font-size: 0.72rem; color: #8A6D1C; }
  .access-counters :global(.counter-tooltip) { background: #0f172a !important; color: #ffffff !important; z-index: 99999; box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3); opacity: 1 !important; -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }

  /* Narrative */
  .access-narrative {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
  }

  .revealed .access-narrative { opacity: 1; transform: translateY(0); }

  /* Chart highlights */
  .access-chart-highlights {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s;
  }

  .revealed .access-chart-highlights { opacity: 1; transform: translateY(0); }

  .access-highlights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .access-highlight-card {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem 0;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-radius: 0;
  }

  .access-highlight-card:hover {
    opacity: 0.85;
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
    padding: 0.75rem 0;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-radius: 0;
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

  /* Risk groups (High / Medium / Low three-column) */
  .access-risk-groups {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin: 1rem 0;
  }

  .access-risk-group {
    border-radius: 8px;
    padding: 0.85rem 1rem;
    border-left: 4px solid transparent;
    background: #f8fafc;
    font-size: 0.78rem;
    color: #334155;
    line-height: 1.5;
  }

  .access-risk-group-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.45rem;
  }

  .access-risk-group-header strong {
    font-size: 0.82rem;
    color: #0f172a;
  }

  .access-risk-badge {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #fff;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    white-space: nowrap;
  }

  .access-risk-high  { border-left-color: #C5443A; }
  .access-risk-medium { border-left-color: #C9921A; }
  .access-risk-low   { border-left-color: #2D7D32; }

  /* Trajectory callout */
  .access-trajectory-callout {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    background: rgba(197,68,58,0.07);
    border-left: 3px solid #C5443A;
    border-radius: 6px;
    padding: 0.85rem 1rem;
    margin: 0.5rem 0 1rem;
    font-size: 0.78rem;
    color: #334155;
    line-height: 1.55;
  }

  .access-trajectory-callout p { margin: 0; }

  @media (max-width: 700px) {
    .access-risk-groups { grid-template-columns: 1fr; }
  }

  /* ═══ SOLUTIONS SECTION ═══ */

  /* 5-approach horizontal flow */
  .sol-approach-flow {
    display: flex;
    align-items: flex-start;
    gap: 0;
    margin: 1.25rem 0 2rem;
    flex-wrap: wrap;
  }

  .sol-approach-step {
    flex: 1;
    min-width: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 0.5rem;
  }

  .sol-approach-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    color: #fff;
    font-size: 0.8rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
    flex-shrink: 0;
  }

  .sol-approach-icon {
    font-size: 1.4rem;
    margin-bottom: 0.4rem;
  }

  .sol-approach-title {
    font-size: 0.88rem;
    font-weight: 800;
    margin: 0 0 0.4rem;
    letter-spacing: 0.01em;
  }

  .sol-approach-desc {
    font-size: 0.75rem;
    color: #475569;
    line-height: 1.55;
    margin: 0;
  }

  .sol-approach-arrow {
    display: flex;
    align-items: center;
    padding-top: 2.4rem;
    color: #cbd5e1;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .sol-types-heading {
    font-size: 0.92rem;
    font-weight: 700;
    color: #334155;
    margin: 0 0 0.75rem;
    padding-top: 0.25rem;
    border-top: 1px solid #f1f5f9;
  }

  .sol-thisiscool {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    margin-top: 1.25rem;
    font-size: 0.8rem;
    color: #334155;
    line-height: 1.55;
  }

  .sol-thisiscool p { margin: 0; }

  .sol-thisiscool a {
    color: #0369a1;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px solid rgba(3,105,161,0.3);
  }

  @media (max-width: 700px) {
    .sol-approach-flow { flex-direction: column; align-items: stretch; }
    .sol-approach-step { flex-direction: row; text-align: left; align-items: flex-start; gap: 0.75rem; padding: 0.5rem 0; }
    .sol-approach-arrow { display: none; }
    .sol-approach-num { margin-bottom: 0; }
    .sol-approach-icon { margin-bottom: 0; font-size: 1.1rem; }
  }

  /* Cool Coalition reference */
  .access-cool-coalition {
    display: flex;
    align-items: center;
    padding: 0.6rem 0;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-radius: 0;
    margin: 0 0 1rem;
    font-size: 0.75rem;
    color: #475569;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.85s, transform 0.6s ease 0.85s;
  }

  .revealed .access-cool-coalition { opacity: 1; transform: translateY(0); }

  .access-cool-coalition strong { color: #0369a1; }

  .access-cool-coalition a {
    color: #0369a1;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px dashed #0369a1;
  }

  .access-cool-coalition a:hover { color: #0284c7; }

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

  /* Align map card, country detail, and other full-width blocks to the 64px text margins */
  .card-panel {
    padding-left: 64px;
    padding-right: 64px;
  }

  .country-card-inline {
    padding-left: 64px;
    padding-right: 64px;
  }

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

  .access-source-footer a:hover { color: #0369a1; border-bottom-color: #0369a1; }
  .access-source-footer a:last-child { color: #0369a1; font-weight: 600; }

  /* KPI panel */
  .kpi-panel { padding: 1rem 1.25rem; }

  /* Pill-style filters — matching Emissions green pill aesthetic */
  .access-checkboxes {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    padding: 1rem 0 0.875rem;
    border-top: 1px solid rgba(0,0,0,0.06);
    margin-top: 0.5rem;
    background: transparent;
    border-radius: 0;
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

  /* Pill button — unselected state: blue outline, light bg */
  .tick-box {
    display: inline-flex;
    align-items: center;
    gap: 0;
    font-size: 0.8rem;
    font-weight: 500;
    color: #0369a1;
    cursor: pointer;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    border: 1.5px solid #0369a1;
    background: transparent;
    transition: all 0.15s ease;
    user-select: none;
    white-space: nowrap;
    line-height: 1.4;
  }

  .tick-box:hover {
    background: rgba(3, 105, 161, 0.1);
    border-color: #0284c7;
    color: #0284c7;
  }

  /* Pill button — selected state: filled blue, white text */
  .tick-box:has(input:checked) {
    background: #0369a1;
    border-color: #0369a1;
    color: #ffffff;
    font-weight: 600;
  }

  .tick-box:has(input:checked):hover {
    background: #0284c7;
    border-color: #0284c7;
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

  /* ===========================
     CHART HINT
     =========================== */
  .chart-hint {
    font-size: 0.78rem;
    color: #6b7280;
    margin: 0 0 8px 0;
    font-style: italic;
  }

</style>

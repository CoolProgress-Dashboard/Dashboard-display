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
  import { SEQ, SCENARIO, STATUS, CHROME, NO_DATA, YES, NO, rgba } from '$lib/components/shared/colors';

  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;

  // Data props — passed from parent (dashboard page) after Supabase load
  export let kigaliData: any[] = [];
  export let countries: any[] = [];
  export let refrigerants: any[] = [];

  const meta = VIEW_META.kigali;
  const kigaliContent = pillarContent.kigali;

  // Animated stat cards
  const kigaliStats = [
    {
      value: '172',
      label: 'Kigali parties ratified',
      context: '172 countries have ratified the Kigali Amendment, covering over 95% of global HFC consumption. Source: UNEP Ozone Secretariat (Feb 2026).'
    },
    {
      value: '0.5\u00B0C',
      label: 'warming avoided if fully implemented',
      context: 'Full Kigali implementation can avoid up to 0.5\u00B0C of global warming by 2100 by phasing down HFC production and consumption over 80%.'
    },
    {
      value: '80%',
      label: 'HFC phase-down target',
      context: 'Kigali requires parties to phase down HFC consumption by over 80% from baseline levels, with staggered timelines for developed and developing countries.'
    },
    {
      value: 'GWP 3',
      label: 'R-290 propane (natural refrigerant)',
      context: 'R-290 (propane) has a GWP of just 3, compared to 2,088 for R-410A. China and India already manufacture R-290 split ACs at scale.'
    }
  ];

  // Chart highlights - what each visualization shows
  const chartHighlights = [
    {
      icon: 'fa-temperature-arrow-up',
      title: 'GWP Comparison',
      description: 'See which refrigerants carry the highest climate impact',
      color: '#C25B33'
    },
    {
      icon: 'fa-chart-area',
      title: 'Transition Timeline',
      description: 'Track the shift from HFCs to natural refrigerants through 2050',
      color: '#2D7D5A'
    },
    {
      icon: 'fa-earth-americas',
      title: 'Country Compliance',
      description: 'Map Kigali ratification and implementation progress worldwide',
      color: '#52B788'
    },
    {
      icon: 'fa-chart-line',
      title: 'Direct Emissions Trend',
      description: 'Compare BAU, Kigali, and Mitigation scenarios for refrigerant emissions',
      color: '#2D7D5A'
    }
  ];

  // Kigali pillar partners: CCC (client) → UNEP Ozone → GIZ → HEAT (last)
  const kigaliPartnerIds = ['ccc', 'unep-ozone', 'giz', 'heat'];
  const kigaliPartners = kigaliPartnerIds
    .map(id => partners.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  let revealed = false;

  // Country sync — exposed after D3 init
  let _applyKigaliCountry: ((code: string | null) => void) | null = null;
  $: { const _c = $page?.url?.searchParams?.get('country') ?? null; if (_applyKigaliCountry) _applyKigaliCountry(_c); }

  onMount(() => {
    // ── Reveal animation ─────────────────────────────────────────────────────
    const revealTimer = setTimeout(() => { revealed = true; }, 150);

    // ── Script loader ─────────────────────────────────────────────────────────
    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing && (existing as HTMLScriptElement & { dataset: DOMStringMap }).dataset.loaded) {
          resolve();
          return;
        }
        const script = (existing as HTMLScriptElement) || document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => { (script as any).dataset.loaded = 'true'; resolve(); };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        if (!existing) document.head.appendChild(script);
      });

    // ── Async init ────────────────────────────────────────────────────────────
    // ECharts library reference — set once after dynamic import so all functions can use it
    let echartsLib: any = null;

    let kigaliMapSvg: any = null;
    let d3Lib: any = null;
    let kigaliMarketAppliance = 'ac';
    let kigaliMarketRegion = '';
    let kigaliRegionFilter = '';

    // ECharts instance registry and resize observers
    const charts: Record<string, any> = {};
    const chartObservers: Map<string, ResizeObserver> = new Map();
    let forceReinitCharts = false;

    // Complete ISO 3166-1 numeric → alpha-3 mapping (shared with legacy page)
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

    // ── Helpers ───────────────────────────────────────────────────────────────
    function normalizeId(id: string | number | null | undefined): string {
      if (id === undefined || id === null) return '';
      const num = parseInt(String(id), 10);
      if (isNaN(num)) return String(id);
      return String(num);
    }

    function findParentWidth(el: HTMLElement): number {
      let node: HTMLElement | null = el;
      while (node) {
        const rect = node.getBoundingClientRect();
        if (rect.width > 50) return rect.width;
        node = node.parentElement;
      }
      return 0;
    }

    function getChartEl(id: string): HTMLDivElement | null {
      return document.getElementById(id) as HTMLDivElement | null;
    }

    function setChart(id: string, option: any) {
      const el = getChartEl(id);
      if (!el) return;
      let needsInit = !charts[id];
      if (!needsInit && charts[id].getDom && charts[id].getDom() !== el) {
        if (chartObservers.has(id)) { chartObservers.get(id)!.disconnect(); chartObservers.delete(id); }
        charts[id].dispose();
        needsInit = true;
      }
      if (!needsInit && forceReinitCharts) {
        if (chartObservers.has(id)) { chartObservers.get(id)!.disconnect(); chartObservers.delete(id); }
        charts[id].dispose();
        delete charts[id];
        needsInit = true;
        el.removeAttribute('_echarts_instance_');
        el.innerHTML = '';
        el.style.position = '';
        el.style.overflow = '';
        void el.offsetWidth;
      }
      if (needsInit) {
        const section = el.closest('.view-section') as HTMLElement | null;
        const sectionActive = section?.classList.contains('active');
        if (sectionActive) {
          el.style.width = '';
          if (!el.style.height) el.style.height = el.style.minHeight || '280px';
          void el.offsetWidth;
          charts[id] = echartsLib!.init(el);
        } else {
          let w = 0;
          let h = el.clientHeight || el.offsetHeight || 0;
          if (section) w = (section as HTMLElement).clientWidth - 80;
          if (w < 50) { w = findParentWidth(el); if (w > 50) w -= 40; }
          if (w < 50) w = 600;
          if (h < 50) h = parseInt(el.style.minHeight) || parseInt(el.getAttribute('style')?.match(/min-height:\s*(\d+)/)?.[1] || '') || 280;
          charts[id] = echartsLib!.init(el, null, { width: Math.floor(w), height: Math.floor(h) });
        }
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

    function forceResizeViewCharts() {
      const section = document.getElementById('view-kigali');
      if (!section) return;
      section.querySelectorAll<HTMLElement>('.chart-surface').forEach(el => {
        const chartId = el.id;
        if (!chartId || !charts[chartId]) return;
        const w = el.clientWidth;
        const h = el.clientHeight || parseInt(el.style.minHeight) || 280;
        if (w > 10) charts[chartId].resize({ width: w, height: h });
      });
    }

    function clearCountryHighlights() {
      document.querySelectorAll('.country-selected').forEach(path => {
        path.classList.remove('country-selected');
      });
    }

    // ── Kigali status / colour helpers ────────────────────────────────────────
    function getKigaliStatus(code: string | undefined): { level: string; label: string } {
      if (!code) return { level: 'nodata', label: 'No Data' };
      const record = kigaliData.find((k: any) => k.country_code === code);
      if (!record) return { level: 'nodata', label: 'No Data' };
      return record.kigali_party === 1
        ? { level: 'ratified', label: 'Ratified' }
        : { level: 'notratified', label: 'Not Ratified' };
    }

    function getKigaliColor(level: string): string {
      switch (level) {
        case 'ratified':    return YES;
        case 'notratified': return '#e5e7eb';
        default:            return NO_DATA;
      }
    }

    // ── Filtered data helper ──────────────────────────────────────────────────
    function getFilteredKigali(): any[] {
      return kigaliData.filter((k: any) => {
        if (kigaliRegionFilter) {
          const country = countries.find((c: any) => c.country_code === k.country_code);
          if (!country || country.region !== kigaliRegionFilter) return false;
        }
        return true;
      });
    }

    function getKigaliKPIs() {
      const filtered = getFilteredKigali();
      const kigaliParties = filtered.filter((k: any) => k.kigali_party === 1).length;
      const montrealParties = filtered.filter((k: any) => k.montreal_protocol_party === 1).length;
      return { kigaliParties, montrealParties, total: filtered.length };
    }

    // ── KPI DOM updater ───────────────────────────────────────────────────────
    function updateKigaliKPIs() {
      const kpis = getKigaliKPIs();
      const setEl = (id: string, val: string | number) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(val);
      };
      setEl('kigali-kpi-parties', kpis.kigaliParties);
      setEl('kigali-kpi-montreal', kpis.montrealParties);
    }

    // ── Legend & progress bar ─────────────────────────────────────────────────
    function updateKigaliLegend() {
      const legend = document.getElementById('kigali-legend');
      if (!legend) return;
      legend.innerHTML = `
    <div class="legend-item"><div class="legend-color" style="background:#6BADA0"></div>Ratified</div>
    <div class="legend-item"><div class="legend-color" style="background:#e5e7eb;border:1px solid #cbd5e1;"></div>Not yet ratified</div>
    <div class="legend-item"><div class="legend-color" style="background:#E5E1D8"></div>No Data</div>
  `;
    }

    function updateKigaliProgress() {
      const setWidth = (id: string, pct: number) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${pct}%`;
      };
      const total = countries.length;
      let ratified = 0;
      let notRatified = 0;
      countries.forEach((c: any) => {
        const status = getKigaliStatus(c.country_code);
        if (status.level === 'ratified') ratified++;
        else if (status.level === 'notratified') notRatified++;
      });
      if (!total) {
        setWidth('kigali-progress-ratified', 0);
        setWidth('kigali-progress-notratified', 0);
        return;
      }
      setWidth('kigali-progress-ratified', (ratified / total) * 100);
      setWidth('kigali-progress-notratified', (notRatified / total) * 100);
    }

    // ── Map ───────────────────────────────────────────────────────────────────
    async function initKigaliMap() {
      const d3 = d3Lib;
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

      // Ocean background rect captures click → reset to global view
      kigaliMapSvg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('click', () => {
          clearCountryHighlights();
          updateKigaliView();
          showGlobalKigaliDetail();
          if (typeof (window as any).__dashboardClearCountry === 'function') {
            (window as any).__dashboardClearCountry();
          }
        });

      const projection = d3.geoNaturalEarth1()
        .scale(width / 6)
        .translate([width / 2, height / 1.8]);

      const path = d3.geoPath().projection(projection);

      // Tooltip element — reuse a shared one if it exists, else create a local one
      const tooltip: HTMLElement = (document.getElementById('tooltip') as HTMLElement) ||
        (() => {
          const t = document.createElement('div');
          t.id = 'kigali-tooltip';
          t.style.cssText = 'position:fixed;background:#1e293b;color:#fff;padding:8px 12px;border-radius:6px;font-size:0.8rem;pointer-events:none;z-index:99999;opacity:0;transition:opacity 0.15s;';
          document.body.appendChild(t);
          return t;
        })();

      try {
        const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
        const countriesGeo = (window as any).topojson.feature(world, world.objects.countries);

        kigaliMapSvg.selectAll('path')
          .data(countriesGeo.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('class', 'kigali-path country-path')
          .attr('data-code', (d: any) => countryIdToCode[normalizeId(d.id)] || '')
          .attr('fill', (d: any) => {
            const code = countryIdToCode[normalizeId(d.id)];
            return getKigaliColor(getKigaliStatus(code).level);
          })
          .on('mouseover', (event: MouseEvent, d: any) => {
            const code = countryIdToCode[normalizeId((d as any).id)];
            const country = countries.find((c: any) => c.country_code === code);
            const status = getKigaliStatus(code);
            tooltip.innerHTML = `
              <strong>${country?.country_name || code || 'Unknown'}</strong><br>
              <span style="color:${status.level === 'ratified' ? '#4ade80' : '#f87171'}">${status.label}</span>
            `;
            (tooltip.style as any).opacity = '1';
            tooltip.style.left = (event.pageX + 10) + 'px';
            tooltip.style.top = (event.pageY + 10) + 'px';
          })
          .on('mouseout', () => { (tooltip.style as any).opacity = '0'; })
          .on('click', (_event: MouseEvent, d: any) => {
            const code = countryIdToCode[normalizeId((d as any).id)];
            const country = countries.find((c: any) => c.country_code === code);
            if (!country) return;
            // Highlight on map
            kigaliMapSvg.selectAll('.kigali-path')
              .classed('country-selected', (pd: any) =>
                countryIdToCode[normalizeId((pd as any).id)] === code
              );
            // Show country detail
            updateKigaliCountryDetail(code);
            // Update viewing pill
            const viewingEl = document.getElementById('kigali-viewing');
            if (viewingEl) viewingEl.textContent = country.country_name || code;
            if (typeof (window as any).__dashboardSetCountry === 'function') {
              (window as any).__dashboardSetCountry(code);
            }
          });

        updateKigaliLegend();
        updateKigaliProgress();
      } catch (error) {
        console.error('Kigali map error:', error);
      }
    }

    function updateKigaliMap() {
      if (!kigaliMapSvg || !d3Lib) return;
      kigaliMapSvg.selectAll('.kigali-path')
        .transition()
        .duration(300)
        .attr('fill', function(this: any) {
          const code = d3Lib.select(this).attr('data-code');
          return getKigaliColor(getKigaliStatus(code).level);
        });
      updateKigaliLegend();
      updateKigaliProgress();
    }

    // ── Market share data ─────────────────────────────────────────────────────
    const MARKET_SHARE_DATA: Record<string, Record<string, { years: string[]; series: { name: string; data: number[]; color: string }[] }>> = {
      ac: {
        '': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R410A (GWP 2088)', data: [72, 52, 32, 18, 9, 4, 1],   color: '#C25B33' },
            { name: 'R32 (GWP 675)',    data: [22, 36, 42, 42, 35, 26, 18], color: '#D4A843' },
            { name: 'R290 (GWP 3)',     data: [4, 9, 20, 33, 48, 62, 73],   color: '#2D7D5A' },
            { name: 'R22 (HCFC)',       data: [2, 3, 6, 7, 8, 8, 8],        color: '#94a3b8' }
          ]
        },
        'China': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R410A (GWP 2088)', data: [65, 40, 20, 8, 3, 1, 0],    color: '#C25B33' },
            { name: 'R32 (GWP 675)',    data: [25, 38, 40, 35, 25, 15, 8],  color: '#D4A843' },
            { name: 'R290 (GWP 3)',     data: [8, 18, 35, 52, 68, 80, 88],  color: '#2D7D5A' },
            { name: 'R22 (HCFC)',       data: [2, 4, 5, 5, 4, 4, 4],        color: '#94a3b8' }
          ]
        },
        'India': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R410A (GWP 2088)', data: [55, 42, 28, 15, 7, 3, 1],   color: '#C25B33' },
            { name: 'R32 (GWP 675)',    data: [30, 40, 42, 38, 30, 20, 12], color: '#D4A843' },
            { name: 'R290 (GWP 3)',     data: [5, 12, 24, 40, 56, 70, 80],  color: '#2D7D5A' },
            { name: 'R22 (HCFC)',       data: [10, 6, 6, 7, 7, 7, 7],       color: '#94a3b8' }
          ]
        },
        'Europe': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R410A (GWP 2088)', data: [55, 25, 10, 3, 1, 0, 0],    color: '#C25B33' },
            { name: 'R32 (GWP 675)',    data: [35, 50, 48, 40, 30, 18, 8],  color: '#D4A843' },
            { name: 'R290 (GWP 3)',     data: [8, 22, 38, 53, 65, 78, 88],  color: '#2D7D5A' },
            { name: 'R22 (HCFC)',       data: [2, 3, 4, 4, 4, 4, 4],        color: '#94a3b8' }
          ]
        },
        'Africa': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R410A (GWP 2088)', data: [45, 48, 40, 28, 18, 10, 5], color: '#C25B33' },
            { name: 'R32 (GWP 675)',    data: [10, 22, 32, 38, 38, 32, 22], color: '#D4A843' },
            { name: 'R290 (GWP 3)',     data: [2, 5, 12, 22, 35, 50, 65],   color: '#2D7D5A' },
            { name: 'R22 (HCFC)',       data: [43, 25, 16, 12, 9, 8, 8],    color: '#94a3b8' }
          ]
        }
      },
      fridge: {
        '': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R134a (GWP 1430)', data: [52, 38, 25, 15, 8, 4, 2],   color: '#C25B33' },
            { name: 'R600a (GWP 3)',    data: [42, 55, 65, 72, 78, 83, 87], color: '#2D7D5A' },
            { name: 'R290 (GWP 3)',     data: [4, 5, 8, 11, 12, 11, 9],     color: '#52B788' },
            { name: 'HFC blends',       data: [2, 2, 2, 2, 2, 2, 2],        color: '#94a3b8' }
          ]
        },
        'China': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R134a (GWP 1430)', data: [30, 18, 10, 5, 2, 1, 0],    color: '#C25B33' },
            { name: 'R600a (GWP 3)',    data: [62, 74, 82, 87, 90, 92, 93], color: '#2D7D5A' },
            { name: 'R290 (GWP 3)',     data: [6, 6, 6, 6, 6, 5, 5],        color: '#52B788' },
            { name: 'HFC blends',       data: [2, 2, 2, 2, 2, 2, 2],        color: '#94a3b8' }
          ]
        },
        'India': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R134a (GWP 1430)', data: [60, 45, 30, 18, 10, 5, 2],  color: '#C25B33' },
            { name: 'R600a (GWP 3)',    data: [35, 48, 60, 70, 78, 84, 88], color: '#2D7D5A' },
            { name: 'R290 (GWP 3)',     data: [3, 5, 8, 10, 10, 9, 8],      color: '#52B788' },
            { name: 'HFC blends',       data: [2, 2, 2, 2, 2, 2, 2],        color: '#94a3b8' }
          ]
        },
        'Europe': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R134a (GWP 1430)', data: [15, 8, 3, 1, 0, 0, 0],      color: '#C25B33' },
            { name: 'R600a (GWP 3)',    data: [78, 85, 90, 93, 95, 96, 96], color: '#2D7D5A' },
            { name: 'R290 (GWP 3)',     data: [5, 5, 5, 4, 3, 2, 2],        color: '#52B788' },
            { name: 'HFC blends',       data: [2, 2, 2, 2, 2, 2, 2],        color: '#94a3b8' }
          ]
        },
        'Africa': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R134a (GWP 1430)', data: [72, 60, 45, 32, 20, 12, 6], color: '#C25B33' },
            { name: 'R600a (GWP 3)',    data: [22, 32, 44, 55, 66, 75, 82], color: '#2D7D5A' },
            { name: 'R290 (GWP 3)',     data: [3, 5, 8, 10, 11, 10, 9],     color: '#52B788' },
            { name: 'HFC blends',       data: [3, 3, 3, 3, 3, 3, 3],        color: '#94a3b8' }
          ]
        }
      }
    };

    // ── Chart render functions ────────────────────────────────────────────────
    function renderRefrigerantMarketShare() {
      const dataSet = MARKET_SHARE_DATA[kigaliMarketAppliance]?.[kigaliMarketRegion];
      if (!dataSet) return;

      setChart('chart-kigali-transition', {
        tooltip: {
          trigger: 'axis',
          formatter: function(params: any) {
            let html = `<strong>${params[0].axisValue}</strong><br/>`;
            params.forEach((p: any) => {
              html += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:4px;"></span>${p.seriesName}: <strong>${p.value}%</strong><br/>`;
            });
            return html;
          }
        },
        grid: { left: '3%', right: '4%', bottom: '18%', top: '8%', containLabel: true },
        legend: { bottom: 0, textStyle: { color: '#475569', fontSize: 10 }, padding: [5, 0, 0, 0] },
        xAxis: {
          type: 'category',
          data: dataSet.years,
          axisLabel: { fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          name: 'Market Share (%)',
          nameTextStyle: { color: '#475569', fontSize: 11 },
          max: 100,
          axisLabel: { formatter: '{value}%' }
        },
        series: dataSet.series.map((s: any) => ({
          name: s.name,
          type: 'line',
          stack: 'total',
          areaStyle: { opacity: 0.6 },
          data: s.data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: s.color, width: 2 },
          itemStyle: { color: s.color }
        }))
      });
    }

    function renderKigaliDirectEmissions() {
      const scenarioColors: Record<string, string> = {
        'BAU': SCENARIO.BAU,
        'KIP': SCENARIO.KIP,
        'KIP_PLUS': SCENARIO.KIP_PLUS
      };
      const scenarioNames: Record<string, string> = {
        'BAU': 'Business as Usual',
        'KIP': 'Kigali Implementation',
        'KIP_PLUS': 'Kigali+'
      };

      // Static fallback scenario data (UNEP/HEAT reference trajectories, global, Mt CO₂e)
      const STATIC_SCENARIO_DATA: { years: number[]; series: { name: string; data: (number | null)[]; color: string }[] } = {
        years: [2020, 2025, 2030, 2035, 2040, 2045, 2050],
        series: [
          { name: 'Business as Usual',    data: [1.8, 2.3, 3.1, 4.0, 5.0, 6.1, 7.4],             color: SCENARIO.BAU },
          { name: 'Kigali Implementation',data: [1.8, 2.2, 2.6, 2.7, 2.4, 1.9, 1.4],             color: SCENARIO.KIP },
          { name: 'Kigali+',              data: [null, 2.1, 1.9, 1.6, 1.2, 0.8, 0.4],            color: SCENARIO.KIP_PLUS }
        ]
      };

      let years: number[];
      let seriesData: { name: string; data: (number | null)[]; color: string }[];

      if (!refrigerants || refrigerants.length === 0) {
        // Use static reference data when live data is unavailable
        years = STATIC_SCENARIO_DATA.years;
        seriesData = STATIC_SCENARIO_DATA.series;
      } else {
        const scenarios = ['BAU', 'KIP', 'KIP_PLUS'];
        const allYears = Array.from(new Set(refrigerants.map((r: any) => r.year))).sort() as number[];
        years = allYears.filter((y: number) => y % 5 === 0 || y === allYears[0] || y === allYears[allYears.length - 1]);

        const rawData: Record<string, (number | null)[]> = {};
        scenarios.forEach((s: string) => { rawData[s] = []; });

        years.forEach((y: number) => {
          scenarios.forEach((s: string) => {
            const yearScenario = refrigerants.filter((r: any) => r.year === y && r.scenario_name === s);
            const totalDirect = yearScenario.reduce((sum: number, r: any) => sum + (r.direct_emission_mt || 0), 0);
            if (s === 'KIP_PLUS' && (y < 2025 || yearScenario.length === 0)) {
              rawData[s].push(null);
            } else {
              rawData[s].push(Math.round(totalDirect * 10) / 10);
            }
          });
        });

        const activeScenarios = scenarios.filter((s: string) => rawData[s].some((v: any) => v && v > 0));
        if (activeScenarios.length === 0) {
          // All data is zero/empty — fall back to static reference data
          years = STATIC_SCENARIO_DATA.years;
          seriesData = STATIC_SCENARIO_DATA.series;
        } else {
          seriesData = activeScenarios.map((s: string) => ({
            name: scenarioNames[s],
            data: rawData[s],
            color: scenarioColors[s]
          }));
        }
      }

      setChart('chart-kigali-direct-emissions', {
        tooltip: {
          trigger: 'axis',
          formatter: function(params: any) {
            let result = `<strong>${params[0].axisValue}</strong><br/>`;
            const bauVal = params.find((p: any) => p.seriesName === 'Business as Usual')?.value || 0;
            params.forEach((p: any) => {
              if (p.value == null) return;
              const pct = bauVal > 0 && p.seriesName !== 'Business as Usual'
                ? ` (${((1 - p.value / bauVal) * 100).toFixed(0)}% reduction)`
                : '';
              result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(1)} Mt CO\u2082e${pct}<br/>`;
            });
            return result;
          }
        },
        legend: {
          data: seriesData.map((s: any) => s.name),
          bottom: 0,
          textStyle: { fontSize: 11 },
          padding: [5, 0, 0, 0]
        },
        grid: { left: '14%', right: '4%', bottom: '18%', top: '8%', containLabel: false },
        xAxis: {
          type: 'category',
          data: years.map(String),
          axisLabel: { fontSize: 11, interval: 0 },
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          name: 'Direct Emissions (Mt CO\u2082e)',
          nameTextStyle: { fontSize: 11, color: '#475569' },
          nameGap: 55,
          axisLabel: { fontSize: 10 }
        },
        series: seriesData.map((s: any) => ({
          name: s.name,
          type: 'line',
          data: s.data,
          smooth: true,
          connectNulls: false,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { width: s.name === 'Kigali+' ? 3.5 : 2.5, color: s.color },
          itemStyle: { color: s.color },
          areaStyle: s.name === 'Business as Usual' ? { color: `${s.color}15` }
                   : s.name === 'Kigali+' ? { color: `${s.color}10` }
                   : undefined
        }))
      });
    }

    // ── updateKigaliCharts — called after filter changes ──────────────────────
    function updateKigaliCharts() {
      renderRefrigerantMarketShare();
      renderKigaliDirectEmissions();
    }

    // ── Country detail panels ─────────────────────────────────────────────────
    function showGlobalKigaliDetail() {
      const container = document.querySelector('#kigali-country-detail .country-detail') as HTMLElement;
      if (!container) return;
      container.innerHTML = `
        <div class="country-placeholder" style="text-align:center;padding:2rem;color:#64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size:2rem;color:#52B788;margin-bottom:0.75rem;display:block;"></i>
          <h4 style="color:#2D5A3D;margin-bottom:0.5rem;">Select a Country</h4>
          <p style="font-size:0.85rem;">Click on any country in the map above to view Kigali Amendment and refrigerant transition details.</p>
        </div>
      `;
    }

    function updateKigaliCountryDetail(code: string) {
      const container = document.querySelector('#kigali-country-detail .country-detail') as HTMLElement;
      if (!container) return;

      const country = countries.find((c: any) => c.country_code === code);
      if (!country) {
        container.innerHTML = `<h4>Unknown Country</h4><p class="side-muted">No data available for ${code}</p>`;
        return;
      }

      const kigaliRecord = kigaliData.find((k: any) => k.country_code === code);
      const kigaliStatus = kigaliRecord?.kigali_party === 1 ? 'Ratified' : 'Not Ratified';
      const groupType = kigaliRecord?.group_type || 'Unknown';
      const montrealStatus = kigaliRecord?.montreal_protocol_party === 1 ? 'Yes' : 'No';

      // Subcool (direct emissions) data from refrigerants prop
      const subcool2030BAU = refrigerants.filter((r: any) => r.country_code === code && r.year === 2030 && r.scenario_name === 'BAU');
      const subcool2030KIP = refrigerants.filter((r: any) => r.country_code === code && r.year === 2030 && r.scenario_name === 'KIP');
      const subcool2030KIPP = refrigerants.filter((r: any) => r.country_code === code && r.year === 2030 && r.scenario_name === 'KIP_PLUS');

      const bauDirect  = subcool2030BAU.reduce((s: number, r: any) => s + (r.direct_emission_mt || 0), 0);
      const kipDirect  = subcool2030KIP.reduce((s: number, r: any) => s + (r.direct_emission_mt || 0), 0);
      const kippDirect = subcool2030KIPP.reduce((s: number, r: any) => s + (r.direct_emission_mt || 0), 0);
      const bauIndirect = subcool2030BAU.reduce((s: number, r: any) => s + (r.indirect_emission_mt || 0), 0);

      const kipSavings  = bauDirect > 0 ? ((bauDirect - kipDirect) / bauDirect * 100).toFixed(1) : '0';
      const kippSavings = bauDirect > 0 ? ((bauDirect - kippDirect) / bauDirect * 100).toFixed(1) : '0';

      let timeline = '';
      if (groupType.includes('Non-Article')) {
        timeline = 'Freeze: 2019 \u00B7 40% by 2024 \u00B7 70% by 2029 \u00B7 80% by 2034 \u00B7 85% by 2036';
      } else if (groupType.includes('Group 1')) {
        timeline = 'Freeze: 2024 \u00B7 10% by 2029 \u00B7 30% by 2035 \u00B7 50% by 2040 \u00B7 80% by 2045';
      } else if (groupType.includes('Group 2')) {
        timeline = 'Freeze: 2028 \u00B7 10% by 2032 \u00B7 20% by 2037 \u00B7 30% by 2042 \u00B7 85% by 2047';
      }

      container.innerHTML = `
        <h4 style="margin:0 0 0.75rem;color:#2D5A3D;font-size:1rem;">${country.country_name}</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
          <div style="background:#f8fafb;border-radius:8px;padding:0.6rem 0.75rem;border-left:3px solid ${kigaliRecord?.kigali_party === 1 ? '#6BADA0' : '#94a3b8'};">
            <div style="font-size:0.68rem;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Kigali Status</div>
            <div style="font-size:0.9rem;font-weight:700;color:${kigaliRecord?.kigali_party === 1 ? '#6BADA0' : '#64748b'};">${kigaliStatus}</div>
          </div>
          <div style="background:#f8fafb;border-radius:8px;padding:0.6rem 0.75rem;border-left:3px solid #6BADA0;">
            <div style="font-size:0.68rem;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Group Type</div>
            <div style="font-size:0.9rem;font-weight:700;color:#1e293b;">${groupType}</div>
          </div>
        </div>
        ${timeline ? `
<div style="background:linear-gradient(135deg,#1A3D2B 0%,#2D5A3D 100%);border-radius:12px;padding:1rem 1.25rem;margin-bottom:0.75rem;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
  <div style="font-size:0.75rem;font-weight:700;color:#A8D5A2;margin-bottom:0.65rem;letter-spacing:0.5px;text-transform:uppercase;">
    <i class="fa-solid fa-clock-rotate-left" style="margin-right:0.4rem;"></i>Phase-Down Timeline
  </div>
  <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
    ${timeline.split('\u00B7').map((m: string) => `<span style="background:rgba(255,255,255,0.15);color:#fff;padding:0.3rem 0.7rem;border-radius:20px;font-size:0.8rem;font-weight:600;white-space:nowrap;border:1px solid rgba(255,255,255,0.2);">${m.trim()}</span>`).join('')}
  </div>
</div>` : ''}
        ${bauDirect > 0 ? `
        <div style="margin-bottom:0.75rem;">
          <div style="font-size:0.75rem;font-weight:700;color:#2D7D5A;margin-bottom:0.4rem;"><i class="fa-solid fa-chart-line" style="margin-right:0.3rem;"></i>Direct Emissions (2030 Projections)</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.4rem;">
            <div style="text-align:center;background:#fdf0ec;border-radius:6px;padding:0.4rem;">
              <div style="font-size:0.65rem;color:#C25B33;">BAU</div>
              <div style="font-size:0.85rem;font-weight:700;color:#991b1b;">${bauDirect.toFixed(2)} Mt</div>
            </div>
            <div style="text-align:center;background:#fefce8;border-radius:6px;padding:0.4rem;">
              <div style="font-size:0.65rem;color:#D4A843;">Kigali</div>
              <div style="font-size:0.85rem;font-weight:700;color:#92400e;">${kipDirect.toFixed(2)} Mt</div>
              <div style="font-size:0.6rem;color:#2D7D5A;">-${kipSavings}%</div>
            </div>
            <div style="text-align:center;background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border-radius:6px;padding:0.4rem;border:1px solid #bbf7d0;">
              <div style="font-size:0.65rem;color:#2D7D5A;font-weight:600;">Kigali+</div>
              <div style="font-size:0.85rem;font-weight:700;color:#2D7D5A;">${kippDirect.toFixed(2)} Mt</div>
              <div style="font-size:0.6rem;color:#2D7D5A;font-weight:600;">-${kippSavings}%</div>
            </div>
          </div>
        </div>
        <div style="font-size:0.72rem;color:#64748b;">
          <i class="fa-solid fa-bolt" style="color:#D4A843;margin-right:0.3rem;"></i>Indirect (electricity): ${bauIndirect.toFixed(2)} Mt (2030 BAU)
        </div>` : '<div style="font-size:0.75rem;color:#94a3b8;font-style:italic;">No Subcool model data available for this country.</div>'}
        <div style="margin-top:0.5rem;font-size:0.68rem;color:#94a3b8;">
          Montreal Protocol: ${montrealStatus} \u00B7 Source: UNEP Ozone Secretariat, HEAT Subcool Model
        </div>
      `;
    }

    // ── Filters initialisation ────────────────────────────────────────────────
    function initKigaliFilters() {
      // Market share appliance toggles (AC / Fridge)
      document.querySelectorAll<HTMLButtonElement>('.kigali-appliance-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          kigaliMarketAppliance = btn.dataset.appliance || 'ac';
          document.querySelectorAll<HTMLButtonElement>('.kigali-appliance-toggle').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'white';
            b.style.color = '#475569';
            b.style.borderColor = '#e2e8f0';
          });
          btn.classList.add('active');
          btn.style.background = '#3D6B6B';
          btn.style.color = 'white';
          btn.style.borderColor = '#3D6B6B';
          renderRefrigerantMarketShare();
          requestAnimationFrame(() => forceResizeViewCharts());
        });
      });

      // Market share region toggles (Global / China / India / Europe / Africa)
      document.querySelectorAll<HTMLButtonElement>('.kigali-region-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          kigaliMarketRegion = btn.dataset.region || '';
          document.querySelectorAll<HTMLButtonElement>('.kigali-region-toggle').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'white';
            b.style.color = '#475569';
            b.style.borderColor = '#e2e8f0';
          });
          btn.classList.add('active');
          btn.style.background = '#3D6B6B';
          btn.style.color = 'white';
          btn.style.borderColor = '#3D6B6B';
          renderRefrigerantMarketShare();
          requestAnimationFrame(() => forceResizeViewCharts());
        });
      });
    }

    // ── Main view update ──────────────────────────────────────────────────────
    function updateKigaliView() {
      updateKigaliKPIs();
      updateKigaliMap();
      updateKigaliCharts();
      const viewingEl = document.getElementById('kigali-viewing');
      if (viewingEl) viewingEl.textContent = kigaliRegionFilter || 'Global';
    }

    // ── Window resize handler ─────────────────────────────────────────────────
    const onWindowResize = () => forceResizeViewCharts();

    // ── Boot sequence ─────────────────────────────────────────────────────────
    let cleanupDone = false;

    (async () => {
      try {
        await Promise.all(
          ['https://d3js.org/d3.v7.min.js', 'https://d3js.org/topojson.v3.min.js'].map(loadScript)
        );
        // Assign shared closure references so all helper functions can use them
        d3Lib = (window as any).d3;
        echartsLib = await import('echarts');

        // Map (requires D3 + TopoJSON + kigali/countries data)
        await initKigaliMap();

        // Filters wires up DOM event listeners
        initKigaliFilters();

        // Initial render
        updateKigaliView();
        showGlobalKigaliDetail();

        // ── Country sync (URL ↔ map) ──────────────────────────────────────────
        function applyKigaliCountry(code: string | null) {
          if (!code) {
            clearCountryHighlights();
            updateKigaliView();
            showGlobalKigaliDetail();
            return;
          }
          const country = countries.find((c: any) => c.country_code === code);
          if (!country) return;
          if (kigaliMapSvg) {
            kigaliMapSvg.selectAll('.kigali-path')
              .classed('country-selected', (pd: any) =>
                countryIdToCode[normalizeId((pd as any).id)] === code
              );
          }
          updateKigaliCountryDetail(code);
          const viewingEl = document.getElementById('kigali-viewing');
          if (viewingEl) viewingEl.textContent = country.country_name || code;
        }
        _applyKigaliCountry = applyKigaliCountry;
        const _initKigaliCountry = new URLSearchParams(window.location.search).get('country');
        if (_initKigaliCountry) applyKigaliCountry(_initKigaliCountry);

        // Resize listener
        window.addEventListener('resize', onWindowResize);
      } catch (err) {
        console.error('KigaliPillar init error:', err);
      }
    })();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      if (cleanupDone) return;
      cleanupDone = true;
      clearTimeout(revealTimer);
      window.removeEventListener('resize', onWindowResize);
      // Disconnect all resize observers
      chartObservers.forEach(obs => obs.disconnect());
      chartObservers.clear();
      // Dispose ECharts instances
      Object.values(charts).forEach((c: any) => { try { c.dispose(); } catch (_) {} });
      // Remove Kigali map SVG
      if (kigaliMapSvg) {
        try { kigaliMapSvg.remove(); } catch (_) {}
        kigaliMapSvg = null;
      }
      // Remove locally created tooltip if any
      const localTooltip = document.getElementById('kigali-tooltip');
      if (localTooltip) localTooltip.remove();
    };
  });
</script>

<section id="view-kigali" class="view-section" class:active>
  <div class="pillar-stack">

    <!-- ═══════════════════════════════════════════════════
         CHAPTER 1 — THE CHALLENGE
         ═══════════════════════════════════════════════════ -->
    <div class="kigali-chapter-card" class:revealed>
      <div class="kigali-chapter-label problem-label">
        <span class="chapter-num">01</span>
        <span class="chapter-title-text">The Challenge</span>
      </div>
      <h2 class="kigali-chapter-heading">Refrigerants are leaking the climate away</h2>
      <p class="kigali-chapter-intro">Refrigerants are the gases that make air conditioners and refrigerators work. They circulate inside the equipment, absorbing and releasing heat. The problem: they leak — during manufacturing, servicing, and at end-of-life — and most of the gases used today are extremely potent greenhouse gases, thousands of times more warming than CO₂.</p>
      <p class="kigali-story-hook">{kigaliContent.storyHook}</p>
      <div class="kigali-problem-stats">
        <div class="kigali-problem-stat">
          <div class="kps-value">R-410A</div>
          <div class="kps-gwp">GWP 2,088</div>
          <div class="kps-label">The dominant AC refrigerant in most markets today — 2,088× more warming per kg than CO₂</div>
        </div>
        <div class="kigali-problem-stat">
          <div class="kps-value">R-22</div>
          <div class="kps-gwp">GWP 1,810</div>
          <div class="kps-label">Still installed in over 1.5 billion units worldwide — leaks from aging equipment are an immediate risk</div>
        </div>
        <div class="kigali-problem-stat kps-highlight">
          <div class="kps-value">+0.5°C</div>
          <div class="kps-gwp">by 2100</div>
          <div class="kps-label">HFC emissions under business-as-usual add this to global warming on top of CO₂ from electricity</div>
        </div>
      </div>
    </div>

    <!-- DATA 1: What BAU emissions look like — and what Kigali changes -->
    <div class="kigali-story-bridge">
      <div class="kigali-bridge-label">
        <span class="bridge-num">DATA</span>
        <i class="fa-solid fa-chart-area"></i>
        Without action, global HFC emissions triple by 2050
      </div>
      <div class="chart-card-header" style="padding: 1rem 1rem 0;">
        <p class="chart-subtitle">Global direct (refrigerant) emissions: BAU vs Kigali Implementation vs Kigali+</p>
        <a href="/methodology#direct-emissions" style="font-size: 0.68rem; color: #2D7D5A; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;">
          <i class="fa-solid fa-book-open" style="font-size: 0.6rem;"></i> Methodology
        </a>
      </div>
      <div class="chart-card-body">
        <div id="chart-kigali-direct-emissions" class="chart-surface" style="width: 100%; height: 300px; min-height: 300px;"></div>
      </div>
      <p class="kigali-chart-caption">Full Kigali implementation cuts direct refrigerant emissions by over 80% from BAU levels. Combining the phase-down with higher efficiency standards (Kigali+) delivers the deepest reductions — avoiding roughly 1 GtCO₂e per year by 2050.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════
         CHAPTER 2 — GLOBAL PROGRESS
         How far the world has come on ratification
         ═══════════════════════════════════════════════════ -->
    <div class="kigali-chapter-card" class:revealed>
      <div class="kigali-chapter-label progress-label">
        <span class="chapter-num">02</span>
        <span class="chapter-title-text">Global Progress</span>
      </div>
      <h2 class="kigali-chapter-heading">172 parties, 95% of global HFC consumption covered</h2>
      <p class="kigali-chapter-intro">As of February 2026, 172 countries have ratified the Kigali Amendment — but ratification is only the first step. The real test is whether national phase-down schedules translate into converted manufacturing lines, updated safety codes, and recovery infrastructure for legacy gases.</p>

      <!-- Animated stat cards -->
      <div class="kigali-counters">
        {#each kigaliStats as stat, i}
          <div class="kigali-counter-wrapper" style="transition-delay: {200 + i * 100}ms">
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

    <!-- Map under Chapter 2 -->
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
        <span class="progress-segment" id="kigali-progress-ratified" title="Ratified" style="background:#6BADA0;"></span>
        <span class="progress-segment" id="kigali-progress-notratified" title="Not yet ratified" style="background:#cbd5e1;"></span>
      </div>
      <div id="kigali-country-detail" class="country-card-inline">
        <h3>Selected Country</h3>
        <div class="country-detail">
          <h4>Select a country</h4>
          <p class="side-muted">Click on a country in the map to see Kigali details, refrigerant mix, and saving potential.</p>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════
         CHAPTER 3 — THE WAY FORWARD
         Solution: Kigali Amendment + transition plan + implementation
         ═══════════════════════════════════════════════════ -->
    <div class="kigali-chapter-card" class:revealed>
      <div class="kigali-chapter-label solution-label">
        <span class="chapter-num">03</span>
        <span class="chapter-title-text">The Way Forward</span>
      </div>
      <h2 class="kigali-chapter-heading">The Kigali Amendment: a legally binding phase-down</h2>
      <p class="kigali-chapter-intro">There are proven, climate-safe alternatives to high-GWP refrigerants. The Kigali Amendment to the Montreal Protocol, adopted in 2016, creates a legally binding schedule for countries to phase down the most harmful HFCs by over 80% — and sets out a clear pathway to natural refrigerants.</p>
      <p class="kigali-chapter-text">{kigaliContent.keyNarrative}</p>

      <!-- Transition pathway stepper -->
      <div class="kigali-stepper">
        <div class="kigali-step">
          <div class="kigali-step-dot current"></div>
          <div class="kigali-step-label">
            <span class="kigali-step-stage">Today</span>
            <span class="kigali-step-desc">High-GWP HFCs (R-410A, R-134a) dominate most markets</span>
          </div>
        </div>
        <div class="kigali-step-arrow"><i class="fa-solid fa-arrow-right"></i></div>
        <div class="kigali-step">
          <div class="kigali-step-dot transition"></div>
          <div class="kigali-step-label">
            <span class="kigali-step-stage">Transition</span>
            <span class="kigali-step-desc">Lower-GWP HFCs (R-32) and HFO blends (&lt;150 GWP)</span>
          </div>
        </div>
        <div class="kigali-step-arrow"><i class="fa-solid fa-arrow-right"></i></div>
        <div class="kigali-step">
          <div class="kigali-step-dot target"></div>
          <div class="kigali-step-label">
            <span class="kigali-step-stage">Target</span>
            <span class="kigali-step-desc">Natural refrigerants — R-290 (propane), CO₂, ammonia — near-zero climate impact</span>
          </div>
        </div>
      </div>

      <!-- Two-stage phase-down schedule -->
      <div class="kigali-stages-inner">
        <h3 class="kigali-stages-inner-title">
          <i class="fa-solid fa-layer-group"></i> The Phase-Down Schedule
        </h3>
        <p class="kigali-stages-intro">The Kigali Amendment creates staggered obligations based on development status — not a single global timetable.</p>
        <div class="kigali-stages-grid">
          <div class="kigali-stage-item">
            <div class="kigali-stage-label" style="background: #5A8FC2; color: #fff;">Non-Article 5 (Developed)</div>
            <ul class="kigali-stage-milestones">
              <li><strong>2019</strong> — Freeze at baseline</li>
              <li><strong>2024</strong> — Reduce to 60%</li>
              <li><strong>2029</strong> — Reduce to 30%</li>
              <li><strong>2036</strong> — Reduce to 15% (long-term)</li>
            </ul>
            <p class="kigali-stage-note">EU, USA, Japan, Australia, most OECD countries.</p>
          </div>
          <div class="kigali-stage-item">
            <div class="kigali-stage-label" style="background: #4A9088; color: #fff;">Article 5 Group 1 (Most Developing)</div>
            <ul class="kigali-stage-milestones">
              <li><strong>2024</strong> — Freeze at baseline</li>
              <li><strong>2029</strong> — Reduce to 90%</li>
              <li><strong>2035</strong> — Reduce to 70%</li>
              <li><strong>2045</strong> — Reduce to 20% (long-term)</li>
            </ul>
            <p class="kigali-stage-note">Most African, Latin American, Southeast Asian countries.</p>
          </div>
          <div class="kigali-stage-item">
            <div class="kigali-stage-label" style="background: #6BADA0; color: #fff;">Article 5 Group 2 (High-Baseline Developing)</div>
            <ul class="kigali-stage-milestones">
              <li><strong>2028</strong> — Freeze at baseline</li>
              <li><strong>2032</strong> — Reduce to 90%</li>
              <li><strong>2042</strong> — Reduce to 50%</li>
              <li><strong>2047</strong> — Reduce to 15% (long-term)</li>
            </ul>
            <p class="kigali-stage-note">India, Pakistan, Iran, Iraq, Gulf states.</p>
          </div>
        </div>
      </div>

      <!-- callToInsight conclusion -->
      <p class="story-call-to-insight">{kigaliContent.callToInsight}</p>
    </div>

    <!-- Market share transition: the solution in action -->
    <div class="kigali-story-bridge">
      <div class="kigali-bridge-label">
        <span class="bridge-num">DATA</span>
        <i class="fa-solid fa-chart-area"></i>
        The market is already shifting — refrigerant transitions through 2050
      </div>
      <div class="chart-card-header" style="padding: 1rem 1rem 0; display: flex; justify-content: space-between; align-items: flex-start;">
        <p class="chart-subtitle">Projected refrigerant market share by appliance type</p>
        <a href="/methodology#refrigerant-transition" style="font-size: 0.68rem; color: #2D7D5A; text-decoration: none; display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; white-space: nowrap;">
          <i class="fa-solid fa-book-open" style="font-size: 0.6rem;"></i> Methodology
        </a>
      </div>
      <div style="display: flex; gap: 0.75rem; padding: 0 0.75rem 0.5rem; flex-wrap: wrap; align-items: center;">
        <div style="display: flex; gap: 0.35rem;">
          <button class="toggle-btn kigali-appliance-toggle active" data-appliance="ac" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #3D6B6B; border-radius: 5px; background: #3D6B6B; color: white; cursor: pointer;">AC</button>
          <button class="toggle-btn kigali-appliance-toggle" data-appliance="fridge" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 5px; background: white; color: #475569; cursor: pointer;">Fridges</button>
        </div>
        <span style="color: #cbd5e1;">|</span>
        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;" id="kigali-region-toggles">
          <button class="toggle-btn kigali-region-toggle active" data-region="" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #3D6B6B; border-radius: 5px; background: #3D6B6B; color: white; cursor: pointer;">Global</button>
          <button class="toggle-btn kigali-region-toggle" data-region="China" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 5px; background: white; color: #475569; cursor: pointer;">China</button>
          <button class="toggle-btn kigali-region-toggle" data-region="India" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 5px; background: white; color: #475569; cursor: pointer;">India</button>
          <button class="toggle-btn kigali-region-toggle" data-region="Europe" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 5px; background: white; color: #475569; cursor: pointer;">Europe</button>
          <button class="toggle-btn kigali-region-toggle" data-region="Africa" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 5px; background: white; color: #475569; cursor: pointer;">Africa</button>
        </div>
      </div>
      <div class="chart-card-body">
        <div id="chart-kigali-transition" class="chart-surface" style="width: 100%; height: 300px; min-height: 300px;"></div>
        <div style="font-size: 0.68rem; color: #94a3b8; text-align: center; padding: 0.5rem;">
          Sources: UNEP Ozone Secretariat · IIR · JARN · HEAT GmbH modelling
        </div>
      </div>
      <p class="kigali-chart-caption">By 2035, natural refrigerants should lead new equipment sales in developed markets. China and India are already manufacturing R-290 split ACs at scale. The rate of adoption in developing markets will determine whether phase-down targets are met.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════
         LEARN MORE — Resources + further reading
         ═══════════════════════════════════════════════════ -->
    <div class="kigali-chapter-card kigali-learn-more-card" class:revealed>
      <div class="kigali-chapter-label resources-label">
        <i class="fa-solid fa-books" style="margin-right: 0.2rem;"></i>
        <span class="chapter-title-text">Learn More</span>
      </div>
      <h2 class="kigali-chapter-heading">Go deeper on the refrigerant transition</h2>

      <!-- Lifecycle Refrigerant Management -->
      <div class="card-panel kigali-lifecycle-card">
        <div class="kigali-lifecycle-header">
          <div class="kigali-lifecycle-icon"><i class="fa-solid fa-recycle"></i></div>
          <div>
            <h3 class="kigali-lifecycle-title">Beyond Phase-Down: Lifecycle Refrigerant Management</h3>
            <p class="kigali-lifecycle-sub">Phase-down stops new high-GWP gases entering the market. But large quantities are already installed in equipment worldwide — and most will leak or be vented unless actively managed.</p>
          </div>
        </div>
        <div class="kigali-lifecycle-grid">
          <div class="kigali-lifecycle-item">
            <i class="fa-solid fa-wrench"></i>
            <strong>Leak prevention</strong>
            <span>Regular maintenance, better fittings, and leak detection systems reduce emissions from equipment in use.</span>
          </div>
          <div class="kigali-lifecycle-item">
            <i class="fa-solid fa-box-archive"></i>
            <strong>End-of-life recovery</strong>
            <span>Capturing refrigerant when equipment is scrapped prevents venting. Requires collection infrastructure and trained technicians.</span>
          </div>
          <div class="kigali-lifecycle-item">
            <i class="fa-solid fa-industry"></i>
            <strong>Reclamation &amp; destruction</strong>
            <span>Recovered gases can be purified for reuse or destroyed. Destruction facilities remain scarce in many regions.</span>
          </div>
        </div>
        <p class="kigali-lifecycle-note">
          <i class="fa-solid fa-circle-info"></i>
          Lifecycle refrigerant management is under-addressed but offers major near-term mitigation potential.
          See: <a href="https://www.ccacoalition.org/resources/guidance-sustainable-cooling-approaches-enhanced-ndcs" target="_blank" rel="noopener noreferrer">CCAC Guidance on Sustainable Cooling</a>
          · <a href="https://kigalisim.org/" target="_blank" rel="noopener noreferrer">Kigali SIM</a>
        </p>
      </div>

      <!-- Safety & Deployment -->
      <aside class="card-panel kigali-safety-card">
        <div class="kigali-safety-header">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <strong>Responsible Deployment: What to Know</strong>
        </div>
        <p>Some low-GWP alternatives come with additional considerations. This is not a reason to avoid the transition — it is a reason to do it carefully and with the right support.</p>
        <ul class="kigali-safety-list">
          <li><strong>Flammability (A2L/A3 refrigerants):</strong> R-32 and R-290 are mildly or highly flammable. This requires updated building codes, installation standards, and technician training — all well-established in countries where these refrigerants are already widely used.</li>
          <li><strong>PFAS concerns (some HFOs):</strong> Certain HFO refrigerants contain per- and polyfluoroalkyl substances. Natural refrigerants (R-290, CO₂, ammonia) avoid this issue entirely.</li>
          <li><strong>High pressure (CO₂):</strong> R-744 operates at much higher pressures than conventional refrigerants, requiring specialized equipment and training.</li>
        </ul>
        <p class="kigali-safety-footer">These factors are manageable with proper standards, training, and technology selection. They are already addressed in markets that have moved furthest on the transition.</p>
      </aside>

      <!-- Cooling Pledge Badge -->
      <div class="kigali-pledge-badge">
        <div class="pledge-icon"><i class="fa-solid fa-handshake-angle"></i></div>
        <div class="pledge-content">
          <strong>Global Cooling Pledge Alignment</strong>
          <span>Target: {globalCoolingPledge.targetEmissionReduction} from BAU &middot; {globalCoolingPledge.signatoryCountries} signatory nations</span>
        </div>
        <a href={globalCoolingPledge.progressReportUrl} target="_blank" rel="noopener noreferrer" class="pledge-link">Progress Report</a>
      </div>

      <!-- Partner logos -->
      <div class="kigali-partner-bar">
        <div class="kigali-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="kigali-partner-title">Data Partners</span>
        </div>
        <div class="kigali-partner-logos">
          {#each kigaliPartners as partner (partner.id)}
            <a href={partner.coolingUrl} target="_blank" rel="noopener noreferrer" class="kigali-partner-logo" title={partner.fullName}>
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>
    </div>


    <!-- Source Attribution -->
    <div style="text-align: center; padding: 0.75rem; font-size: 0.7rem; color: #94a3b8;">
      Sources:
      <a href="https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016" target="_blank" rel="noopener noreferrer" style="color: #64748b;">UNEP Ozone Secretariat</a>
      &middot;
      <a href="https://iifiir.org" target="_blank" rel="noopener noreferrer" style="color: #64748b;">IIR</a>
      &middot;
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer" style="color: #64748b;">HEAT GmbH</a>
      &middot;
      <a href="https://www.multilateralfund.org/OurWork/default.aspx" target="_blank" rel="noopener noreferrer" style="color: #64748b;">MLF</a>
      &middot;
      <a href="/methodology" style="color: #2D7D5A; font-weight: 600;">Methodology</a>
    </div>
  </div>
</section>

<style>
  /* ═══════════════════════════════════════════════════════
     CHAPTER NARRATIVE CARDS — Storytelling layout
     ═══════════════════════════════════════════════════════ */

  .kigali-chapter-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem 1.75rem;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .kigali-chapter-card.revealed {
    opacity: 1;
  }

  /* All revealed-dependent children inside chapter cards become visible */
  .kigali-chapter-card.revealed .kigali-story-hook,
  .kigali-chapter-card.revealed .kigali-counter-wrapper,
  .kigali-chapter-card.revealed .kigali-narrative,
  .kigali-chapter-card.revealed .kigali-pledge-badge,
  .kigali-chapter-card.revealed .kigali-partner-bar,
  .kigali-chapter-card.revealed .kigali-source-footer {
    opacity: 1;
    transform: none;
  }

  /* Chapter label row */
  .kigali-chapter-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 999px;
    padding: 0.3rem 0.9rem 0.3rem 0.35rem;
    margin-bottom: 0.9rem;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .chapter-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    font-size: 0.65rem;
    font-weight: 900;
    flex-shrink: 0;
  }

  /* Chapter label color variants */
  .problem-label   { background: rgba(194, 91, 51, 0.10); color: #C25B33; }
  .problem-label   .chapter-num { background: #C25B33; color: #fff; }
  .solution-label  { background: rgba(90, 143, 194, 0.10); color: #5A8FC2; }
  .solution-label  .chapter-num { background: #5A8FC2; color: #fff; }
  .progress-label  { background: rgba(45, 125, 90, 0.10); color: #2D7D5A; }
  .progress-label  .chapter-num { background: #2D7D5A; color: #fff; }
  .implementation-label { background: rgba(107, 173, 160, 0.10); color: #4A9088; }
  .implementation-label .chapter-num { background: #4A9088; color: #fff; }
  .resources-label { background: rgba(61, 107, 107, 0.10); color: #3D6B6B; }
  .resources-label .chapter-num { background: #3D6B6B; color: #fff; }

  /* Strip version (no full card wrapper) */
  .kigali-chapter-label-strip {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.85rem;
    padding: 0.75rem 1rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    flex-wrap: wrap;
  }

  .kigali-chapter-strip-text {
    font-size: 0.78rem;
    color: #475569;
    margin: 0;
    flex: 1;
    min-width: 200px;
    line-height: 1.55;
  }

  /* Chapter heading */
  .kigali-chapter-heading {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 0 0 0.75rem;
    letter-spacing: -0.02em;
  }

  .kigali-chapter-intro,
  .kigali-chapter-text {
    font-size: 0.9rem;
    color: #475569;
    line-height: 1.7;
    margin: 0 0 0.85rem;
  }

  /* Problem stats strip */
  .kigali-problem-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .kigali-problem-stat {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 0.85rem 1rem;
    background: #fafafa;
  }

  .kigali-problem-stat.kps-highlight {
    background: rgba(194, 91, 51, 0.04);
    border-color: rgba(194, 91, 51, 0.2);
  }

  .kps-value {
    font-size: 1.2rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 0.1rem;
  }

  .kps-gwp {
    font-size: 0.8rem;
    font-weight: 700;
    color: #C25B33;
    margin-bottom: 0.35rem;
  }

  .kps-label {
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.5;
  }

  /* Story bridge — chart within narrative flow */
  .kigali-story-bridge {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0 0 0.85rem;
    overflow: hidden;
  }

  .kigali-bridge-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: #334155;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 0.65rem 1.25rem;
  }

  .bridge-num {
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    background: #5A8FC2;
    color: #fff;
    border-radius: 4px;
    padding: 0.1rem 0.4rem;
  }

  .kigali-chart-caption {
    font-size: 0.82rem;
    color: #64748b;
    font-style: italic;
    line-height: 1.6;
    margin: 0.35rem 1.25rem 0;
    padding-top: 0.45rem;
    border-top: 1px solid #f1f5f9;
  }

  /* Stages inside chapter 2 */
  .kigali-stages-inner {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid #f1f5f9;
  }

  .kigali-stages-inner-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #334155;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  @media (max-width: 768px) {
    .kigali-problem-stats { grid-template-columns: 1fr; }
  }

  /* ===========================
     KIGALI STORY CARD (legacy, kept for safety)
     =========================== */
  .kigali-story-card {
    border-left: 4px solid #2D7D5A;
    padding: 1.75rem;
    position: relative;
    overflow: visible;
  }

  .kigali-story-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(45, 125, 90, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ===========================
     HEADER
     =========================== */
  .kigali-story-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .kigali-story-text {
    flex: 1;
    min-width: 0;
  }

  .kigali-headline {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 0 0 0.4rem;
    letter-spacing: -0.01em;
  }

  .kigali-subhead {
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
  }

  /* ===========================
     STORY HOOK
     =========================== */
  /* --- Non-specialist intro --- */
  .kigali-intro-explainer {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 3px solid #5A8FC2;
    border-radius: 10px;
    padding: 0.9rem 1.1rem;
    margin: 0 0 1rem;
    font-size: 0.82rem;
    color: #334155;
    line-height: 1.65;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .kigali-intro-explainer p { margin: 0; }

  /* --- Transition stepper --- */
  .kigali-stepper {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin: 0 0 1rem;
    flex-wrap: wrap;
  }

  .kigali-step {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    flex: 1;
    min-width: 140px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 0.75rem;
  }

  .kigali-step-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 3px;
  }
  .kigali-step-dot.current    { background: #C25B33; }
  .kigali-step-dot.transition { background: #D4A843; }
  .kigali-step-dot.target     { background: #2D7D5A; }

  .kigali-step-label { display: flex; flex-direction: column; gap: 0.2rem; }
  .kigali-step-stage { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
  .kigali-step-desc  { font-size: 0.78rem; color: #334155; line-height: 1.4; }

  .kigali-step-arrow {
    color: #94a3b8;
    font-size: 0.7rem;
    margin-top: 1rem;
    flex-shrink: 0;
  }

  /* --- Two-stage phase-down explainer --- */
  .kigali-stages-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.25rem 1.4rem;
    margin-bottom: 0.85rem;
  }

  .kigali-stages-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
    color: #5A8FC2;
    font-size: 0.9rem;
  }

  .kigali-stages-header h3 {
    font-size: 0.9rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .kigali-stages-intro {
    font-size: 0.88rem;
    color: #475569;
    margin: 0 0 1rem;
    line-height: 1.6;
  }

  .kigali-stages-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .kigali-stage-item {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .kigali-stage-label {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.4rem 0.75rem;
    letter-spacing: 0.01em;
  }

  .kigali-stage-milestones {
    list-style: none;
    margin: 0;
    padding: 0.6rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .kigali-stage-milestones li {
    font-size: 0.8rem;
    color: #334155;
    line-height: 1.5;
  }

  .kigali-stage-milestones strong {
    color: #0f172a;
  }

  .kigali-stage-note {
    font-size: 0.78rem;
    color: #64748b;
    font-style: italic;
    margin: 0;
    padding: 0.4rem 0.75rem 0.6rem;
    border-top: 1px solid #f1f5f9;
  }

  @media (max-width: 768px) {
    .kigali-stages-grid {
      grid-template-columns: 1fr;
    }
  }

  /* --- Lifecycle card --- */
  .kigali-lifecycle-card { padding: 1.4rem 1.6rem; }

  .kigali-lifecycle-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .kigali-lifecycle-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(45, 125, 90, 0.1);
    color: #2D7D5A;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .kigali-lifecycle-title { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 0.3rem; }
  .kigali-lifecycle-sub   { font-size: 0.82rem; color: #475569; margin: 0; line-height: 1.55; }

  .kigali-lifecycle-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .kigali-lifecycle-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 0.85rem;
    font-size: 0.8rem;
    color: #334155;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    line-height: 1.5;
  }

  .kigali-lifecycle-item i { color: #2D7D5A; font-size: 0.9rem; margin-bottom: 0.1rem; }
  .kigali-lifecycle-item strong { font-size: 0.82rem; color: #1e293b; }
  .kigali-lifecycle-item span { color: #64748b; }

  .kigali-lifecycle-note {
    font-size: 0.78rem;
    color: #64748b;
    line-height: 1.55;
    margin: 0;
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
  }

  .kigali-lifecycle-note i { color: #5A8FC2; flex-shrink: 0; margin-top: 0.15rem; }
  .kigali-lifecycle-note a { color: #2D7D5A; }

  /* --- Safety aside --- */
  .kigali-safety-card {
    padding: 1.25rem 1.5rem;
    border-left: 4px solid #D4A843;
    background: #fffdf5;
  }

  .kigali-safety-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
    color: #92400e;
  }

  .kigali-safety-header i { color: #D4A843; }

  .kigali-safety-card p {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.6;
    margin: 0 0 0.75rem;
  }

  .kigali-safety-list {
    margin: 0 0 0.75rem;
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .kigali-safety-list li {
    font-size: 0.8rem;
    color: #475569;
    line-height: 1.55;
  }

  .kigali-safety-footer {
    font-size: 0.78rem;
    color: #64748b;
    font-style: italic;
    margin-bottom: 0 !important;
  }

  @media (max-width: 768px) {
    .kigali-lifecycle-grid { grid-template-columns: 1fr; }
    .kigali-stepper { flex-direction: column; }
    .kigali-step-arrow { transform: rotate(90deg); align-self: center; }
  }

  .kigali-story-hook {
    font-size: 0.9rem;
    color: #334155;
    line-height: 1.7;
    margin: 0.75rem 0 1rem;
    padding: 0.85rem 1.1rem;
    background: #f5faf5;
    border-radius: 10px;
    border-left: 3px solid #2D7D5A;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
  }

  .revealed .kigali-story-hook {
    opacity: 1;
    transform: translateY(0);
  }

  /* ===========================
     ANIMATED COUNTERS
     =========================== */
  .kigali-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  .kigali-counter-wrapper {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .revealed .kigali-counter-wrapper {
    opacity: 1;
    transform: translateY(0);
  }

  .kigali-counters :global(.counter-card) {
    background: linear-gradient(135deg, #f0f7f0 0%, #f5faf5 100%);
    border: 1px solid rgba(45, 125, 90, 0.15);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: 100px;
    padding: 1rem 0.75rem;
  }

  .kigali-counters :global(.counter-card:hover) {
    background: linear-gradient(135deg, #e5f2ec 0%, #edf7f7 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(45, 125, 90, 0.12);
  }

  .kigali-counters :global(.counter-display) {
    font-size: 1.8rem;
    color: #2D7D5A;
  }

  .kigali-counters :global(.counter-label) {
    font-size: 0.72rem;
    color: #2D7D5A;
  }

  .kigali-counters :global(.counter-tooltip) {
    background: #0f172a !important;
    color: #ffffff !important;
    z-index: 99999;
    box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3);
    opacity: 1 !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }

  /* ===========================
     KEY NARRATIVE
     =========================== */
  .kigali-narrative {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
  }

  .revealed .kigali-narrative {
    opacity: 1;
    transform: translateY(0);
  }

  .kigali-narrative-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #2D7D5A;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .kigali-narrative-title i {
    color: #52B788;
    font-size: 0.85rem;
  }

  .kigali-narrative p {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.7;
    margin: 0;
  }

  /* ===========================
     CHART HIGHLIGHTS
     =========================== */
  .kigali-chart-highlights {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s;
  }

  .revealed .kigali-chart-highlights {
    opacity: 1;
    transform: translateY(0);
  }

  .kigali-highlights-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #2D7D5A;
    margin: 0 0 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .kigali-highlights-title i {
    color: #52B788;
    font-size: 0.85rem;
  }

  .kigali-highlights-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }

  .kigali-highlight-card {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem;
    background: #fafbfc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .kigali-highlight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .kigali-highlight-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .kigali-highlight-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .kigali-highlight-text strong {
    font-size: 0.78rem;
    font-weight: 700;
    color: #0f172a;
  }

  .kigali-highlight-text span {
    font-size: 0.72rem;
    color: #64748b;
    line-height: 1.4;
  }

  /* ===========================
     COOLING PLEDGE BADGE
     =========================== */
  .kigali-pledge-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #f0fdf4, #f0f7f4);
    border: 1px solid #A8D5A2;
    border-radius: 12px;
    margin: 0 0 1rem;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s;
  }

  .revealed .kigali-pledge-badge {
    opacity: 1;
    transform: translateY(0);
  }

  .pledge-icon {
    font-size: 1.2rem;
    color: #2D7D5A;
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
    margin-bottom: 0.15rem;
  }

  .pledge-content span {
    font-size: 0.72rem;
    color: #4ade80;
  }

  .pledge-link {
    font-size: 0.72rem;
    font-weight: 600;
    color: #15803d;
    text-decoration: none;
    white-space: nowrap;
    border-bottom: 1px dashed #A8D5A2;
    transition: color 0.2s;
  }

  .pledge-link:hover {
    color: #166534;
  }

  /* ===========================
     PARTNER LOGOS BAR
     =========================== */
  .kigali-partner-bar {
    padding: 0.75rem 0;
    margin: 0 0 0.75rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
  }

  .revealed .kigali-partner-bar {
    opacity: 1;
    transform: translateY(0);
  }

  .kigali-partner-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.6rem;
  }

  .kigali-partner-header > i {
    color: #2D7D5A;
    font-size: 0.8rem;
  }

  .kigali-partner-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #333;
  }

  .kigali-partner-logos {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .kigali-partner-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
    transition: opacity 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
  }

  .kigali-partner-logo:hover {
    opacity: 1;
    transform: translateY(-2px);
  }

  .kigali-partner-logo img {
    max-width: 80px;
    max-height: 32px;
    object-fit: contain;
  }

  /* ===========================
     SOURCE FOOTER
     =========================== */
  .kigali-source-footer {
    text-align: center;
    font-size: 0.68rem;
    color: #94a3b8;
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transition: opacity 0.6s ease 1.1s;
  }

  .revealed .kigali-source-footer {
    opacity: 1;
  }

  .kigali-source-footer a {
    color: #64748b;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .kigali-source-footer a:hover {
    color: #2D7D5A;
    border-bottom-color: #2D7D5A;
  }

  .kigali-source-footer a:last-child {
    color: #2D7D5A;
    font-weight: 600;
  }



  /* ===========================
     RESPONSIVE
     =========================== */
  @media (max-width: 1024px) {
    .kigali-counters {
      grid-template-columns: repeat(2, 1fr);
    }

    .kigali-highlights-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .kigali-story-card {
      padding: 1.25rem;
    }

    .kigali-headline {
      font-size: 1.1rem;
    }

    .kigali-story-header {
      flex-direction: column;
      gap: 0.5rem;
    }

    .kigali-counters {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .kigali-counters :global(.counter-display) {
      font-size: 1.4rem;
    }

    .kigali-highlights-grid {
      grid-template-columns: 1fr;
    }

    .kigali-partner-logos {
      gap: 1rem;
    }

    .kigali-partner-logo img {
      max-width: 60px;
      max-height: 26px;
    }

    .kigali-pledge-badge {
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
    }
  }

  @media (max-width: 600px) {
    .kigali-counters {
      grid-template-columns: 1fr 1fr;
    }

    .kigali-counters :global(.counter-card) {
      min-height: 85px;
      padding: 0.75rem 0.5rem;
    }

    .kigali-counters :global(.counter-display) {
      font-size: 1.2rem;
    }

    .kigali-counters :global(.counter-label) {
      font-size: 0.65rem;
    }
  }

  /* ===========================
     MAP CARD — override global negative-margin connection hack
     since country-card-inline is now inside the map card
     =========================== */
  :global(#view-kigali .pillar-stack) {
    gap: 0.85rem;
  }

  :global(#view-kigali .pillar-stack .map-card) {
    margin-bottom: 0;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    border-bottom: 1px solid #e2e8f0;
  }

  /* country-card-inline inside map card: remove its own outer card styling */
  :global(#view-kigali .pillar-stack .map-card .country-card-inline) {
    border: none;
    border-radius: 0;
    box-shadow: none;
    padding: 1rem 0 0;
    background: transparent;
    margin-top: 0;
  }

  /* ===========================
     MAP FILTERS (light section inside map card)
     =========================== */
  .kigali-filter-section {
    padding: 0.75rem 0 0.25rem;
    border-top: 1px solid #e2e8f0;
    margin-top: 0.5rem;
  }

  .kigali-filter-btn {
    background: #2D7D5A;
    color: white;
    border: 2px solid #2D7D5A;
    border-radius: 999px;
    padding: 0.3rem 0.9rem;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .kigali-filter-btn--outline {
    background: transparent;
    color: #2D7D5A;
  }

  .kigali-filter-btn--outline:hover {
    background: rgba(45,125,90,0.08);
  }

  /* Override toggle-btn styles inside the group toggles to use teal outlined pills */
  :global(#kigali-group-toggles .toggle-btn) {
    background: transparent !important;
    border: 2px solid #2D7D5A !important;
    color: #2D7D5A !important;
    border-radius: 999px !important;
    padding: 0.3rem 0.9rem !important;
    font-size: 0.82rem !important;
    font-weight: 500 !important;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  :global(#kigali-group-toggles .toggle-btn.active) {
    background: #3D6B6B !important;
    color: white !important;
    font-weight: 600 !important;
  }

  :global(#kigali-group-toggles .toggle-btn:hover:not(.active)) {
    background: rgba(61,107,107,0.1) !important;
  }
</style>

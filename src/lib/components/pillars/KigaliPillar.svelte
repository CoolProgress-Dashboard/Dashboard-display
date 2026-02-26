<script lang="ts">
  import { onMount } from 'svelte';
  import { VIEW_META } from '$lib/components/shared/config';
  import AnimatedCounter from '$lib/components/hero/AnimatedCounter.svelte';
  import { pillarContent } from '$lib/data/pillar-content';
  import { partners, globalCoolingPledge } from '$lib/data/partner-data';

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
      color: '#E85A4F'
    },
    {
      icon: 'fa-chart-area',
      title: 'Transition Timeline',
      description: 'Track the shift from HFCs to natural refrigerants through 2050',
      color: '#3D6B6B'
    },
    {
      icon: 'fa-earth-americas',
      title: 'Country Compliance',
      description: 'Map Kigali ratification and implementation progress worldwide',
      color: '#8BC34A'
    },
    {
      icon: 'fa-chart-line',
      title: 'Direct Emissions Trend',
      description: 'Compare BAU, Kigali, and Mitigation scenarios for refrigerant emissions',
      color: '#4A7F7F'
    }
  ];

  // Kigali pillar partners: CCC (client) → UNEP Ozone → GIZ → HEAT (last)
  const kigaliPartnerIds = ['ccc', 'unep-ozone', 'giz', 'heat'];
  const kigaliPartners = kigaliPartnerIds
    .map(id => partners.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  let revealed = false;

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
    let kigaliGroupTypes: string[] = [];

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
      if (!code) return { level: 'critical', label: 'Critical' };
      const record = kigaliData.find((k: any) => k.country_code === code);
      if (!record) return { level: 'low', label: 'Low/None' };
      if (record.kigali_party === 1) {
        if (record.group_type && record.group_type.includes('A5')) {
          return { level: 'medium', label: 'Medium/Partial' };
        }
        return { level: 'high', label: 'High/Active' };
      }
      return { level: 'critical', label: 'Critical' };
    }

    function getKigaliColor(level: string): string {
      switch (level) {
        case 'high':     return '#2D5252'; // CCC dark teal
        case 'medium':   return '#8BC34A'; // CCC green
        case 'low':      return '#E89B8C'; // CCC coral
        case 'critical': return '#E85A4F'; // CCC orange-red
        default:         return '#e2e8f0';
      }
    }

    // ── Filtered data helper ──────────────────────────────────────────────────
    function getFilteredKigali(): any[] {
      return kigaliData.filter((k: any) => {
        if (kigaliRegionFilter) {
          const country = countries.find((c: any) => c.country_code === k.country_code);
          if (!country || country.region !== kigaliRegionFilter) return false;
        }
        if (kigaliGroupTypes.length > 0 && k.group_type && !kigaliGroupTypes.includes(k.group_type)) return false;
        return true;
      });
    }

    function getKigaliKPIs() {
      const filtered = getFilteredKigali();
      const kigaliParties = filtered.filter((k: any) => k.kigali_party === 1).length;
      const montrealParties = filtered.filter((k: any) => k.montreal_protocol_party === 1).length;
      const article5 = filtered.filter((k: any) =>
        k.group_type && (k.group_type.includes('A5') || k.group_type.includes('Article 5')) &&
        !k.group_type.toLowerCase().includes('non')
      ).length;
      const nonArticle5 = filtered.filter((k: any) =>
        k.group_type && k.group_type.toLowerCase().includes('non')
      ).length;
      return { kigaliParties, montrealParties, article5, nonArticle5, total: filtered.length };
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
      setEl('kigali-kpi-article5', kpis.article5);
      setEl('kigali-kpi-non-article5', kpis.nonArticle5);
    }

    // ── Legend & progress bar ─────────────────────────────────────────────────
    function updateKigaliLegend() {
      const legend = document.getElementById('kigali-legend');
      if (!legend) return;
      legend.innerHTML = `
        <div class="legend-item"><div class="legend-color" style="background:#2D5252"></div>High/Active</div>
        <div class="legend-item"><div class="legend-color" style="background:#8BC34A"></div>Medium/Partial</div>
        <div class="legend-item"><div class="legend-color" style="background:#E89B8C"></div>Low/None</div>
        <div class="legend-item"><div class="legend-color" style="background:#E85A4F"></div>Critical</div>
      `;
    }

    function updateKigaliProgress() {
      const setWidth = (id: string, pct: number) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${pct}%`;
      };
      const codes = new Set(countries.map((c: any) => c.country_code));
      const total = codes.size;
      const counts = { high: 0, medium: 0, low: 0, critical: 0 };
      codes.forEach((code: any) => {
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
              <span style="color:#94a3b8">Status: ${status.label}</span>
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
            { name: 'R410A (GWP 2088)', data: [72, 52, 32, 18, 9, 4, 1],   color: '#E85A4F' },
            { name: 'R32 (GWP 675)',    data: [22, 36, 42, 42, 35, 26, 18], color: '#f59e0b' },
            { name: 'R290 (GWP 3)',     data: [4, 9, 20, 33, 48, 62, 73],   color: '#22c55e' },
            { name: 'R22 (HCFC)',       data: [2, 3, 6, 7, 8, 8, 8],        color: '#94a3b8' }
          ]
        },
        'China': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R410A (GWP 2088)', data: [65, 40, 20, 8, 3, 1, 0],    color: '#E85A4F' },
            { name: 'R32 (GWP 675)',    data: [25, 38, 40, 35, 25, 15, 8],  color: '#f59e0b' },
            { name: 'R290 (GWP 3)',     data: [8, 18, 35, 52, 68, 80, 88],  color: '#22c55e' },
            { name: 'R22 (HCFC)',       data: [2, 4, 5, 5, 4, 4, 4],        color: '#94a3b8' }
          ]
        },
        'India': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R410A (GWP 2088)', data: [55, 42, 28, 15, 7, 3, 1],   color: '#E85A4F' },
            { name: 'R32 (GWP 675)',    data: [30, 40, 42, 38, 30, 20, 12], color: '#f59e0b' },
            { name: 'R290 (GWP 3)',     data: [5, 12, 24, 40, 56, 70, 80],  color: '#22c55e' },
            { name: 'R22 (HCFC)',       data: [10, 6, 6, 7, 7, 7, 7],       color: '#94a3b8' }
          ]
        },
        'Europe': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R410A (GWP 2088)', data: [55, 25, 10, 3, 1, 0, 0],    color: '#E85A4F' },
            { name: 'R32 (GWP 675)',    data: [35, 50, 48, 40, 30, 18, 8],  color: '#f59e0b' },
            { name: 'R290 (GWP 3)',     data: [8, 22, 38, 53, 65, 78, 88],  color: '#22c55e' },
            { name: 'R22 (HCFC)',       data: [2, 3, 4, 4, 4, 4, 4],        color: '#94a3b8' }
          ]
        },
        'Africa': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R410A (GWP 2088)', data: [45, 48, 40, 28, 18, 10, 5], color: '#E85A4F' },
            { name: 'R32 (GWP 675)',    data: [10, 22, 32, 38, 38, 32, 22], color: '#f59e0b' },
            { name: 'R290 (GWP 3)',     data: [2, 5, 12, 22, 35, 50, 65],   color: '#22c55e' },
            { name: 'R22 (HCFC)',       data: [43, 25, 16, 12, 9, 8, 8],    color: '#94a3b8' }
          ]
        }
      },
      fridge: {
        '': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R134a (GWP 1430)', data: [52, 38, 25, 15, 8, 4, 2],   color: '#E85A4F' },
            { name: 'R600a (GWP 3)',    data: [42, 55, 65, 72, 78, 83, 87], color: '#22c55e' },
            { name: 'R290 (GWP 3)',     data: [4, 5, 8, 11, 12, 11, 9],     color: '#8BC34A' },
            { name: 'HFC blends',       data: [2, 2, 2, 2, 2, 2, 2],        color: '#94a3b8' }
          ]
        },
        'China': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R134a (GWP 1430)', data: [30, 18, 10, 5, 2, 1, 0],    color: '#E85A4F' },
            { name: 'R600a (GWP 3)',    data: [62, 74, 82, 87, 90, 92, 93], color: '#22c55e' },
            { name: 'R290 (GWP 3)',     data: [6, 6, 6, 6, 6, 5, 5],        color: '#8BC34A' },
            { name: 'HFC blends',       data: [2, 2, 2, 2, 2, 2, 2],        color: '#94a3b8' }
          ]
        },
        'India': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R134a (GWP 1430)', data: [60, 45, 30, 18, 10, 5, 2],  color: '#E85A4F' },
            { name: 'R600a (GWP 3)',    data: [35, 48, 60, 70, 78, 84, 88], color: '#22c55e' },
            { name: 'R290 (GWP 3)',     data: [3, 5, 8, 10, 10, 9, 8],      color: '#8BC34A' },
            { name: 'HFC blends',       data: [2, 2, 2, 2, 2, 2, 2],        color: '#94a3b8' }
          ]
        },
        'Europe': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R134a (GWP 1430)', data: [15, 8, 3, 1, 0, 0, 0],      color: '#E85A4F' },
            { name: 'R600a (GWP 3)',    data: [78, 85, 90, 93, 95, 96, 96], color: '#22c55e' },
            { name: 'R290 (GWP 3)',     data: [5, 5, 5, 4, 3, 2, 2],        color: '#8BC34A' },
            { name: 'HFC blends',       data: [2, 2, 2, 2, 2, 2, 2],        color: '#94a3b8' }
          ]
        },
        'Africa': {
          years: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          series: [
            { name: 'R134a (GWP 1430)', data: [72, 60, 45, 32, 20, 12, 6], color: '#E85A4F' },
            { name: 'R600a (GWP 3)',    data: [22, 32, 44, 55, 66, 75, 82], color: '#22c55e' },
            { name: 'R290 (GWP 3)',     data: [3, 5, 8, 10, 11, 10, 9],     color: '#8BC34A' },
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
      if (!refrigerants || refrigerants.length === 0) return;

      const allYears = Array.from(new Set(refrigerants.map((r: any) => r.year))).sort() as number[];
      const years = allYears.filter((y: number) => y % 5 === 0 || y === allYears[0] || y === allYears[allYears.length - 1]);

      const scenarios = ['BAU', 'KIP', 'KIP_PLUS'];
      const scenarioColors: Record<string, string> = {
        'BAU': '#E85A4F',
        'KIP': '#f59e0b',
        'KIP_PLUS': '#16a34a'
      };
      const scenarioNames: Record<string, string> = {
        'BAU': 'Business as Usual',
        'KIP': 'Kigali Implementation',
        'KIP_PLUS': 'Kigali+'
      };

      const seriesData: Record<string, (number | null)[]> = {};
      scenarios.forEach((s: string) => { seriesData[s] = []; });

      years.forEach((y: number) => {
        scenarios.forEach((s: string) => {
          const yearScenario = refrigerants.filter((r: any) => r.year === y && r.scenario_name === s);
          const totalDirect = yearScenario.reduce((sum: number, r: any) => sum + (r.direct_emission_mt || 0), 0);
          if (s === 'KIP_PLUS' && (y < 2025 || yearScenario.length === 0)) {
            seriesData[s].push(null);
          } else {
            seriesData[s].push(Math.round(totalDirect * 10) / 10);
          }
        });
      });

      const activeScenarios = scenarios.filter((s: string) => seriesData[s].some((v: any) => v && v > 0));

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
          data: activeScenarios.map((s: string) => scenarioNames[s]),
          bottom: 0,
          textStyle: { fontSize: 11 },
          padding: [5, 0, 0, 0]
        },
        grid: { left: '4%', right: '4%', bottom: '18%', top: '8%', containLabel: true },
        xAxis: {
          type: 'category',
          data: years,
          axisLabel: { fontSize: 11, interval: 0 },
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          name: 'Direct Emissions (Mt CO\u2082e)',
          nameTextStyle: { fontSize: 11, color: '#475569' },
          axisLabel: { fontSize: 10 }
        },
        series: activeScenarios.map((s: string) => ({
          name: scenarioNames[s],
          type: 'line',
          data: seriesData[s],
          smooth: true,
          connectNulls: false,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { width: s === 'KIP_PLUS' ? 3.5 : 2.5, color: scenarioColors[s] },
          itemStyle: { color: scenarioColors[s] },
          areaStyle: s === 'BAU' ? { color: `${scenarioColors[s]}15` }
                   : s === 'KIP_PLUS' ? { color: `${scenarioColors[s]}10` }
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
          <i class="fa-solid fa-map-location-dot" style="font-size:2rem;color:#8BC34A;margin-bottom:0.75rem;display:block;"></i>
          <h4 style="color:#2D5252;margin-bottom:0.5rem;">Select a Country</h4>
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
        <h4 style="margin:0 0 0.75rem;color:#2D5252;font-size:1rem;">${country.country_name}</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
          <div style="background:#f8fafb;border-radius:8px;padding:0.6rem 0.75rem;border-left:3px solid ${kigaliRecord?.kigali_party === 1 ? '#22c55e' : '#ef4444'};">
            <div style="font-size:0.68rem;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Kigali Status</div>
            <div style="font-size:0.9rem;font-weight:700;color:${kigaliRecord?.kigali_party === 1 ? '#166534' : '#dc2626'};">${kigaliStatus}</div>
          </div>
          <div style="background:#f8fafb;border-radius:8px;padding:0.6rem 0.75rem;border-left:3px solid #3D6B6B;">
            <div style="font-size:0.68rem;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Group Type</div>
            <div style="font-size:0.9rem;font-weight:700;color:#1e293b;">${groupType}</div>
          </div>
        </div>
        ${timeline ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:0.5rem 0.75rem;margin-bottom:0.75rem;font-size:0.75rem;color:#92400e;"><i class="fa-solid fa-clock" style="margin-right:0.3rem;"></i>Phase-down timeline: ${timeline}</div>` : ''}
        ${bauDirect > 0 ? `
        <div style="margin-bottom:0.75rem;">
          <div style="font-size:0.75rem;font-weight:700;color:#3D6B6B;margin-bottom:0.4rem;"><i class="fa-solid fa-chart-line" style="margin-right:0.3rem;"></i>Direct Emissions (2030 Projections)</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.4rem;">
            <div style="text-align:center;background:#fef2f2;border-radius:6px;padding:0.4rem;">
              <div style="font-size:0.65rem;color:#dc2626;">BAU</div>
              <div style="font-size:0.85rem;font-weight:700;color:#991b1b;">${bauDirect.toFixed(2)} Mt</div>
            </div>
            <div style="text-align:center;background:#fefce8;border-radius:6px;padding:0.4rem;">
              <div style="font-size:0.65rem;color:#d97706;">Kigali</div>
              <div style="font-size:0.85rem;font-weight:700;color:#92400e;">${kipDirect.toFixed(2)} Mt</div>
              <div style="font-size:0.6rem;color:#16a34a;">-${kipSavings}%</div>
            </div>
            <div style="text-align:center;background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border-radius:6px;padding:0.4rem;border:1px solid #bbf7d0;">
              <div style="font-size:0.65rem;color:#16a34a;font-weight:600;">Kigali+</div>
              <div style="font-size:0.85rem;font-weight:700;color:#166534;">${kippDirect.toFixed(2)} Mt</div>
              <div style="font-size:0.6rem;color:#16a34a;font-weight:600;">-${kippSavings}%</div>
            </div>
          </div>
        </div>
        <div style="font-size:0.72rem;color:#64748b;">
          <i class="fa-solid fa-bolt" style="color:#f59e0b;margin-right:0.3rem;"></i>Indirect (electricity): ${bauIndirect.toFixed(2)} Mt (2030 BAU)
        </div>` : '<div style="font-size:0.75rem;color:#94a3b8;font-style:italic;">No Subcool model data available for this country.</div>'}
        <div style="margin-top:0.5rem;font-size:0.68rem;color:#94a3b8;">
          Montreal Protocol: ${montrealStatus} \u00B7 Source: UNEP Ozone Secretariat, HEAT Subcool Model
        </div>
      `;
    }

    // ── Filters initialisation ────────────────────────────────────────────────
    function initKigaliFilters() {
      // Region dropdown
      const regionSelect = document.getElementById('kigali-region-filter') as HTMLSelectElement | null;
      if (regionSelect) {
        const regions = new Set<string>();
        kigaliData.forEach((k: any) => {
          const c = countries.find((c: any) => c.country_code === k.country_code);
          if (c?.region) regions.add(c.region);
        });
        regionSelect.innerHTML = '<option value="">All Regions</option>';
        Array.from(regions).sort().forEach(r => {
          const opt = document.createElement('option');
          opt.value = r;
          opt.textContent = r;
          regionSelect.appendChild(opt);
        });
        regionSelect.addEventListener('change', () => {
          kigaliRegionFilter = regionSelect.value;
          updateKigaliView();
        });
      }

      // Group type toggles
      const toggleContainer = document.getElementById('kigali-group-toggles');
      if (toggleContainer) {
        const groupTypes = new Set(kigaliData.map((k: any) => k.group_type).filter(Boolean));
        kigaliGroupTypes = Array.from(groupTypes) as string[];
        toggleContainer.innerHTML = '';
        Array.from(groupTypes).sort().forEach((gt: any) => {
          const btn = document.createElement('button');
          btn.className = 'toggle-btn active';
          btn.type = 'button';
          btn.dataset.group = gt;
          btn.textContent = gt;
          btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) {
              if (!kigaliGroupTypes.includes(gt)) kigaliGroupTypes.push(gt);
            } else {
              kigaliGroupTypes = kigaliGroupTypes.filter((g: string) => g !== gt);
            }
            updateKigaliView();
          });
          toggleContainer.appendChild(btn);
        });
      }

      // All / None buttons
      const groupAll = document.getElementById('kigali-group-all');
      if (groupAll) {
        groupAll.addEventListener('click', () => {
          const allGroups = [...new Set(kigaliData.map((k: any) => k.group_type).filter(Boolean))] as string[];
          kigaliGroupTypes = allGroups;
          document.querySelectorAll<HTMLButtonElement>('#kigali-group-toggles .toggle-btn').forEach(b => b.classList.add('active'));
          updateKigaliView();
        });
      }
      const groupNone = document.getElementById('kigali-group-none');
      if (groupNone) {
        groupNone.addEventListener('click', () => {
          kigaliGroupTypes = [];
          document.querySelectorAll<HTMLButtonElement>('#kigali-group-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
          updateKigaliView();
        });
      }

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
    <!-- Story Card -->
    <div class="card-panel kigali-story-card" class:revealed>
      <!-- Header -->
      <div class="kigali-story-header">
        <div class="kigali-story-text">
          <h1 class="kigali-headline">{meta.headline}</h1>
          <p class="kigali-subhead">{meta.subhead}</p>
        </div>
        <div class="pillar-story-actions">
          <span class="last-updated-label"></span>
          {#if onPillarInfoClick}
            <button class="pillar-info-btn" type="button" on:click={onPillarInfoClick}>
              <i class="fa-solid fa-circle-info"></i> Pillar Information
            </button>
          {/if}
        </div>
      </div>

      <!-- Story hook narrative -->
      <p class="kigali-story-hook">{kigaliContent.storyHook}</p>

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

      <!-- Key narrative -->
      <div class="kigali-narrative">
        <h3 class="kigali-narrative-title">
          <i class="fa-solid fa-flask"></i>
          The Transition Pathway
        </h3>
        <p>{kigaliContent.keyNarrative}</p>
      </div>

      <!-- Chart highlights -->
      <div class="kigali-chart-highlights">
        <h3 class="kigali-highlights-title">
          <i class="fa-solid fa-chart-simple"></i>
          What the Data Shows
        </h3>
        <div class="kigali-highlights-grid">
          {#each chartHighlights as highlight}
            <div class="kigali-highlight-card">
              <div class="kigali-highlight-icon" style="color: {highlight.color}">
                <i class="fa-solid {highlight.icon}"></i>
              </div>
              <div class="kigali-highlight-text">
                <strong>{highlight.title}</strong>
                <span>{highlight.description}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Cooling Pledge Badge -->
      <div class="kigali-pledge-badge">
        <div class="pledge-icon"><i class="fa-solid fa-handshake-angle"></i></div>
        <div class="pledge-content">
          <strong>Global Cooling Pledge Alignment</strong>
          <span>Target: {globalCoolingPledge.targetEmissionReduction} from BAU &middot; {globalCoolingPledge.signatoryCountries} signatory nations</span>
        </div>
        <a href={globalCoolingPledge.progressReportUrl} target="_blank" rel="noopener noreferrer" class="pledge-link">Progress Report</a>
      </div>

      <!-- Partner logos bar -->
      <div class="kigali-partner-bar">
        <div class="kigali-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="kigali-partner-title">Data Partners</span>
        </div>
        <div class="kigali-partner-logos">
          {#each kigaliPartners as partner (partner.id)}
            <a
              href={partner.coolingUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="kigali-partner-logo"
              title={partner.fullName}
            >
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>

      <!-- Source attribution -->
      <div class="kigali-source-footer">
        Sources:
        <a href="https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016" target="_blank" rel="noopener noreferrer">UNEP Ozone Secretariat</a>
        &middot;
        <a href="https://iifiir.org" target="_blank" rel="noopener noreferrer">IIR</a>
        &middot;
        <a href="https://www.green-cooling-initiative.org/" target="_blank" rel="noopener noreferrer">GIZ Proklima</a>
        &middot;
        <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
        &middot;
        <a href="/methodology">Methodology</a>
      </div>
    </div>

    <!-- TREND CHARTS FIRST (before map) -->

    <!-- Market Share Transition Timeline -->
    <div class="card-panel chart-card">
      <div class="chart-card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h3><i class="fa-solid fa-chart-area" style="color: #3D6B6B; margin-right: 0.5rem;"></i>Market Share: Refrigerant Transition (2020–2050)</h3>
          <p class="chart-subtitle">Projected refrigerant market share by appliance type</p>
        </div>
        <a href="/methodology#refrigerant-transition" style="font-size: 0.68rem; color: #3D6B6B; text-decoration: none; display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; white-space: nowrap;">
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
        <div id="chart-kigali-transition" class="chart-surface" style="width: 100%; height: 340px; min-height: 340px;"></div>
        <div style="font-size: 0.68rem; color: #94a3b8; text-align: center; padding: 0.5rem;">
          Sources: UNEP Ozone Secretariat · IIR · JARN · HEAT GmbH modelling
        </div>
      </div>
    </div>

    <!-- Direct Emissions Trend (Subcool BAU vs KIP vs KIP+) -->
    <div class="card-panel chart-card">
      <div class="chart-card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h3><i class="fa-solid fa-chart-line" style="color: #4A7F7F; margin-right: 0.5rem;"></i>Direct Refrigerant Emissions by Scenario</h3>
          <p class="chart-subtitle">Global direct (refrigerant) emissions: BAU vs Kigali Implementation vs Kigali+</p>
        </div>
        <a href="/methodology#direct-emissions" style="font-size: 0.68rem; color: #3D6B6B; text-decoration: none; display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; white-space: nowrap;">
          <i class="fa-solid fa-book-open" style="font-size: 0.6rem;"></i> Methodology
        </a>
      </div>
      <div class="chart-card-body">
        <div id="chart-kigali-direct-emissions" class="chart-surface" style="width: 100%; height: 380px; min-height: 380px;"></div>
      </div>
    </div>

    <!-- KPI Cards (separated) -->
    <div class="card-panel kpi-panel">
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
        <span class="progress-segment high" id="kigali-progress-high" title="Kigali Party (Non-A5)"></span>
        <span class="progress-segment medium" id="kigali-progress-medium" title="Kigali Party (Article 5)"></span>
        <span class="progress-segment low" id="kigali-progress-low" title="Montreal Only"></span>
        <span class="progress-segment critical" id="kigali-progress-critical" title="Non-Party"></span>
      </div>
      <div id="kigali-country-detail" class="country-card-inline">
        <h3>Selected Country</h3>
        <div class="country-detail">
          <h4>Select a country</h4>
          <p class="side-muted">Click on a country in the map to see Kigali details, refrigerant mix, and saving potential.</p>
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
      <a href="/methodology" style="color: #3D6B6B; font-weight: 600;">Methodology</a>
    </div>
  </div>
</section>

<style>
  /* ===========================
     KIGALI STORY CARD
     Story-driven card with teal/green accent (Kigali pillar identity).
     =========================== */
  .kigali-story-card {
    border-left: 4px solid #3D6B6B;
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
    background: radial-gradient(circle, rgba(61, 107, 107, 0.06) 0%, transparent 70%);
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
  .kigali-story-hook {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    margin: 0 0 1.25rem;
    padding: 0.75rem 1rem;
    background: #f8fafb;
    border-radius: 10px;
    border-left: 3px solid #3D6B6B;
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
    background: linear-gradient(135deg, #f0f7f4 0%, #f5fafa 100%);
    border: 1px solid rgba(61, 107, 107, 0.15);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: 100px;
    padding: 1rem 0.75rem;
  }

  .kigali-counters :global(.counter-card:hover) {
    background: linear-gradient(135deg, #e5f2ec 0%, #edf7f7 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(61, 107, 107, 0.12);
  }

  .kigali-counters :global(.counter-display) {
    font-size: 1.8rem;
    color: #3D6B6B;
  }

  .kigali-counters :global(.counter-label) {
    font-size: 0.72rem;
    color: #4A7F7F;
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
    color: #3D6B6B;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .kigali-narrative-title i {
    color: #8BC34A;
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
    color: #3D6B6B;
    margin: 0 0 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .kigali-highlights-title i {
    color: #8BC34A;
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
    border: 1px solid #86efac;
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
    border-bottom: 1px dashed #86efac;
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
    color: #3D6B6B;
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
    color: #3D6B6B;
    border-bottom-color: #3D6B6B;
  }

  .kigali-source-footer a:last-child {
    color: #3D6B6B;
    font-weight: 600;
  }

  /* ===========================
     KPI PANEL (separated)
     =========================== */
  .kpi-panel {
    padding: 1rem 1.25rem;
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
</style>

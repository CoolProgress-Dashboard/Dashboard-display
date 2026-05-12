<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import AnimatedCounter from '$lib/components/hero/AnimatedCounter.svelte';
  import { partners, globalCoolingPledge } from '$lib/data/partner-data';
  import PillarHeader from '$lib/components/shared/PillarHeader.svelte';
  import PillarInsight from '$lib/components/shared/PillarInsight.svelte';
  import FurtherReading from '$lib/components/shared/FurtherReading.svelte';
  import type { NdcFilters } from '$lib/services/dashboard-types';
  import { STATUS, CHROME, NO_DATA, YES, NO, rgba } from '$lib/components/shared/colors';

  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;

  // Data props - passed from the parent dashboard page
  export let pledge: any[] = [];
  export let ndcTracker: any[] = [];
  export let ncap: any[] = [];
  export let countries: any[] = [];
  export let kigali: any[] = [];
  export let meps: any[] = [];

  // Animated stat cards
  const policyStats = [
    {
      value: '172',
      label: 'Countries that have ratified the Kigali Amendment (Montreal Protocol)',
      context: '172 countries have ratified the Kigali Amendment to the Montreal Protocol, creating a legally binding framework to phase down HFCs by over 80%. Source: UN Treaty Collection (Feb 2026).'
    },
    {
      value: '74',
      label: 'Global Cooling Pledge countries',
      context: '74 countries signed the Global Cooling Pledge at COP28 in Dubai, December 2023. 49 have MEPS, 37 include cooling in their NDCs.'
    },
    {
      value: '<30%',
      label: 'NDCs mentioning cooling',
      context: 'Fewer than 30% of all NDCs explicitly mention cooling, refrigerants, or the Kigali Amendment. The policy gap between awareness and integration remains significant.'
    },
    {
      value: '~25',
      label: 'NCAPs completed or in development',
      context: 'Roughly 25 countries have completed or are developing National Cooling Action Plans. These dedicated roadmaps link efficiency, refrigerant transition, and access goals.'
    }
  ];

  // Chart highlights
  const chartHighlights = [
    {
      icon: 'fa-file-contract',
      title: 'Kigali & GCP Status',
      description: 'Track ratification and pledge commitments by country',
      color: '#0369a1'
    },
    {
      icon: 'fa-clipboard-list',
      title: 'NDC Cooling Mentions',
      description: 'Which countries integrate cooling into climate targets',
      color: '#5A8FC2'
    },
    {
      icon: 'fa-file-shield',
      title: 'NCAPs & Building Codes',
      description: 'National action plans and sector-specific regulations',
      color: '#5A8FC2'
    }
  ];

  // Policy pillar partners: Cool Coalition → CLASP NDC → Climate Policy Radar → HEAT (last)
  const policyPartnerIds = ['cool-coalition', 'clasp', 'climate-policy-radar', 'heat'];
  const policyPartners = policyPartnerIds
    .map(id => partners.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  let revealed = false;

  // Exposed apply function — assigned after D3 init so reactive block can call it
  let _applyPolicyCountry: ((code: string | null) => void) | null = null;

  // React to URL country changes (sidebar selection)
  $: {
    const _code = $page?.url?.searchParams?.get('country') ?? null;
    if (_applyPolicyCountry) _applyPolicyCountry(_code);
  }

  onMount(() => {
    // ── Reveal animation ──────────────────────────────────────────────────
    const revealTimer = setTimeout(() => { revealed = true; }, 150);

    // ── Load D3 + TopoJSON from CDN, then boot policy logic ───────────────
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

    let cleanupDone = false;
    const cleanupFns: (() => void)[] = [];

    (async () => {
      await Promise.all(
        ['https://d3js.org/d3.v7.min.js', 'https://d3js.org/topojson.v3.min.js'].map(loadScript)
      );

      const d3 = (window as any).d3;
      const topojson = (window as any).topojson;
      const echarts = await import('echarts');

      if (cleanupDone) return;

      // ── ISO numeric → alpha-3 mapping (same as legacy) ──────────────────
      const countryIdToCode: Record<string, string> = {
        '4':'AFG','8':'ALB','12':'DZA','16':'ASM','20':'AND','24':'AGO','28':'ATG','31':'AZE',
        '32':'ARG','36':'AUS','40':'AUT','44':'BHS','48':'BHR','50':'BGD','51':'ARM','52':'BRB',
        '56':'BEL','60':'BMU','64':'BTN','68':'BOL','70':'BIH','72':'BWA','76':'BRA','84':'BLZ',
        '90':'SLB','96':'BRN','100':'BGR','104':'MMR','108':'BDI','112':'BLR','116':'KHM',
        '120':'CMR','124':'CAN','132':'CPV','140':'CAF','144':'LKA','148':'TCD','152':'CHL',
        '156':'CHN','158':'TWN','170':'COL','174':'COM','178':'COG','180':'COD','184':'COK',
        '188':'CRI','191':'HRV','192':'CUB','196':'CYP','203':'CZE','204':'BEN','208':'DNK',
        '212':'DMA','214':'DOM','218':'ECU','222':'SLV','226':'GNQ','231':'ETH','232':'ERI',
        '233':'EST','238':'FLK','242':'FJI','246':'FIN','250':'FRA','260':'ATF','262':'DJI',
        '266':'GAB','268':'GEO','270':'GMB','275':'PSE','276':'DEU','288':'GHA','296':'KIR',
        '300':'GRC','304':'DNK','308':'GRD','320':'GTM','324':'GIN','328':'GUY','332':'HTI',
        '340':'HND','348':'HUN','352':'ISL','356':'IND','360':'IDN','364':'IRN','368':'IRQ',
        '372':'IRL','376':'ISR','380':'ITA','384':'CIV','388':'JAM','392':'JPN','398':'KAZ',
        '400':'JOR','404':'KEN','408':'PRK','410':'KOR','414':'KWT','417':'KGZ','418':'LAO',
        '422':'LBN','426':'LSO','428':'LVA','430':'LBR','434':'LBY','440':'LTU','442':'LUX',
        '450':'MDG','454':'MWI','458':'MYS','462':'MDV','466':'MLI','470':'MLT','478':'MRT',
        '480':'MUS','484':'MEX','496':'MNG','498':'MDA','499':'MNE','504':'MAR','508':'MOZ',
        '512':'OMN','516':'NAM','520':'NRU','524':'NPL','528':'NLD','540':'NCL','548':'VUT',
        '554':'NZL','558':'NIC','562':'NER','566':'NGA','570':'NIU','578':'NOR','583':'FSM',
        '584':'MHL','585':'PLW','586':'PAK','591':'PAN','598':'PNG','600':'PRY','604':'PER',
        '608':'PHL','616':'POL','620':'PRT','624':'GNB','626':'TLS','630':'USA','634':'QAT',
        '642':'ROU','643':'RUS','646':'RWA','659':'KNA','662':'LCA','670':'VCT','678':'STP',
        '682':'SAU','686':'SEN','688':'SRB','690':'SYC','694':'SLE','702':'SGP','703':'SVK',
        '704':'VNM','705':'SVN','706':'SOM','710':'ZAF','716':'ZWE','724':'ESP','728':'SSD',
        '729':'SDN','732':'ESH','740':'SUR','748':'SWZ','752':'SWE','756':'CHE','760':'SYR',
        '762':'TJK','764':'THA','768':'TGO','776':'TON','780':'TTO','784':'ARE','788':'TUN',
        '792':'TUR','795':'TKM','798':'TUV','800':'UGA','804':'UKR','807':'MKD','818':'EGY',
        '826':'GBR','834':'TZA','840':'USA','854':'BFA','858':'URY','860':'UZB','862':'VEN',
        '882':'WSM','887':'YEM','894':'ZMB'
      };

      function normalizeId(id: string | number | null | undefined): string {
        if (id === undefined || id === null) return '';
        const num = parseInt(String(id), 10);
        if (isNaN(num)) return String(id);
        return String(num);
      }

      // ── Filter state ─────────────────────────────────────────────────────
      let ndcType = 'NDC 2.0';
      let ndcCategory = 'Energy Efficiency';
      let policyMapType = 'gcp';
      let selectedRegion = '';
      let selectedPolicyCountry: string | null = null;

      const getNdcFilters = (): NdcFilters => ({ type: ndcType, category: ndcCategory });

      // ── Tooltip (scoped to policy section) ───────────────────────────────
      const tooltip = document.getElementById('tooltip') as HTMLElement;

      // ── ECharts registry ─────────────────────────────────────────────────
      const charts: Record<string, any> = {};
      const chartObservers: Map<string, ResizeObserver> = new Map();

      function getChartEl(id: string): HTMLDivElement | null {
        return document.getElementById(id) as HTMLDivElement | null;
      }

      const axisLabelStyle = { color: '#1e293b', fontWeight: 700, fontSize: 11 };
      const axisLineStyle = { lineStyle: { color: '#e2e8f0' } };
      const splitLineStyle = { lineStyle: { color: '#e2e8f0' } };

      const categoryAxis = (labels: string[]) => ({
        type: 'category',
        data: labels,
        axisLabel: axisLabelStyle,
        axisLine: axisLineStyle,
        axisTick: { alignWithLabel: true }
      });

      const valueAxis = () => ({
        type: 'value',
        axisLabel: axisLabelStyle,
        axisLine: axisLineStyle,
        splitLine: splitLineStyle
      });

      function setChart(id: string, option: any) {
        const el = getChartEl(id);
        if (!el) return;

        let needsInit = !charts[id];
        if (!needsInit && charts[id].getDom && charts[id].getDom() !== el) {
          if (chartObservers.has(id)) { chartObservers.get(id)!.disconnect(); chartObservers.delete(id); }
          charts[id].dispose();
          needsInit = true;
        }

        if (needsInit) {
          const section = el.closest('.view-section') as HTMLElement | null;
          const sectionActive = section?.classList.contains('active');
          if (sectionActive) {
            el.style.width = '';
            if (!el.style.height) el.style.height = el.style.minHeight || '280px';
            void el.offsetWidth;
            charts[id] = echarts.init(el);
          } else {
            let w = 0;
            let h = el.clientHeight || el.offsetHeight || 0;
            if (section) w = section.clientWidth - 80;
            if (w < 50) w = 600;
            if (h < 50) h = parseInt(el.style.minHeight) || 280;
            charts[id] = echarts.init(el, null, { width: Math.floor(w), height: Math.floor(h) });
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

      function forceResizePolicyCharts() {
        const section = document.getElementById('view-policy');
        if (!section) return;
        const surfaces = section.querySelectorAll<HTMLElement>('.chart-surface');
        surfaces.forEach(el => {
          const chartId = el.id;
          if (!chartId || !charts[chartId]) return;
          const w = el.clientWidth;
          const h = el.clientHeight || parseInt(el.style.minHeight) || 280;
          if (w > 10) charts[chartId].resize({ width: w, height: h });
        });
      }

      function disposeChartContainer(container: HTMLElement) {
        container.querySelectorAll<HTMLElement>('.chart-surface').forEach(el => {
          if (el.id && charts[el.id]) {
            const existingChart = echarts.getInstanceByDom(el);
            if (existingChart) existingChart.dispose();
            if (chartObservers.has(el.id)) {
              chartObservers.get(el.id)!.disconnect();
              chartObservers.delete(el.id);
            }
            delete charts[el.id];
          }
        });
      }

      // ── Helpers ──────────────────────────────────────────────────────────
      function setText(id: string, value: string | number) {
        const el = document.getElementById(id);
        if (el) el.textContent = String(value);
      }

      // ── NDC data helpers ─────────────────────────────────────────────────
      const ndcCategories = [
        'Energy Efficiency', 'Kigali Amendment', 'Doubling EE',
        'Refrigerators & freezers', 'Air Conditioners', 'MEPS & Labels'
      ];

      function getFilteredNDC() {
        const filters = getNdcFilters();
        return ndcTracker.filter(n => n.ndc_type === filters.type && n.category === filters.category);
      }

      function getNDCColor(status: string | null | undefined): string {
        if (status === 'Mentioned') return '#6BADA0';
        if (status === 'Not mentioned') return '#D4A843';
        if (status === 'No NDC submitted') return '#e5e7eb';
        return '#E5E1D8';
      }

      function getCountryNDCStatus(): Record<string, { name?: string | null; continent?: string | null; subregion?: string | null; status?: string | null; value?: number | null }> {
        const filtered = getFilteredNDC();
        const countryStatus: Record<string, any> = {};
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

      function getNdcRecord(countryCode: string, filters: NdcFilters) {
        return ndcTracker.find(
          r => r.country_code === countryCode && r.ndc_type === filters.type && r.category === filters.category
        );
      }

      // ── Map SVG handle ───────────────────────────────────────────────────
      let ndcMapSvg: any;

      // ── D3 Mouse Handlers ────────────────────────────────────────────────
      function handleOut() {
        if (tooltip) tooltip.style.opacity = '0';
      }

      function handlePolicyHover(event: MouseEvent, d: any) {
        const code = countryIdToCode[normalizeId(d.id)];
        if (!tooltip) return;
        if (!code) {
          tooltip.innerHTML = `<em>Unknown country</em>`;
          tooltip.style.opacity = '1';
          tooltip.style.left = (event.pageX + 10) + 'px';
          tooltip.style.top = (event.pageY + 10) + 'px';
          return;
        }

        const country = countries.find((c: any) => c.country_code === code);
        const countryName = country?.country_name || code;
        const region = country?.region || 'N/A';

        if (policyMapType === 'gcp') {
          const pledgeRec = pledge.find((p: any) => p.country_code === code);
          const statusColor = pledgeRec?.signatory === 1 ? '#6BADA0' : '#94a3b8';
          const statusText = pledgeRec?.signatory === 1 ? 'Signatory' : 'Non-Signatory';
          tooltip.innerHTML = `
            <strong>${countryName}</strong><br>
            <span style="color: var(--text-secondary, #94a3b8)">Global Cooling Pledge</span><br>
            Status: <span style="color: ${statusColor}">${statusText}</span><br>
            Region: ${region}
          `;
        } else if (policyMapType === 'ndc') {
          const record = getNdcRecord(code, getNdcFilters());
          if (!record) {
            tooltip.innerHTML = `<strong>${countryName}</strong><br><em>No NDC data</em>`;
          } else {
            const statusColor =
              record.mention_status === 'Mentioned' ? '#6BADA0' :
              record.mention_status === 'Not mentioned' ? '#D4A843' : '#94a3b8';
            tooltip.innerHTML = `
              <strong>${countryName}</strong><br>
              <span style="color: var(--text-secondary, #94a3b8)">${ndcType} | ${ndcCategory}</span><br>
              Status: <span style="color: ${statusColor}">${record.mention_status}</span><br>
              Region: ${region}
            `;
          }
        } else if (policyMapType === 'kigali') {
          const kRec = kigali.find((k: any) => k.country_code === code);
          const isParty = kRec?.kigali_party === 1;
          tooltip.innerHTML = `
            <strong>${countryName}</strong><br>
            <span style="color: var(--text-secondary, #94a3b8)">Kigali Amendment</span><br>
            Status: <span style="color: ${isParty ? '#6BADA0' : '#94a3b8'}">${isParty ? 'Ratified' : 'Not yet ratified'}</span><br>
            Region: ${region}
          `;
        } else {
          // NCAP
          const ncapRecord = ncap.find((n: any) => n.country_code === code);
          if (ncapRecord) {
            tooltip.innerHTML = `
              <strong>${countryName}</strong><br>
              <span style="color: var(--text-secondary, #94a3b8)">National Cooling Action Plan</span><br>
              Status: <span style="color: #6BADA0">Has NCAP</span><br>
              ${ncapRecord.year ? 'Year: ' + ncapRecord.year + '<br>' : ''}
              Region: ${region}
            `;
          } else {
            tooltip.innerHTML = `
              <strong>${countryName}</strong><br>
              <span style="color: var(--text-secondary, #94a3b8)">National Cooling Action Plan</span><br>
              Status: <span style="color: #94a3b8">No NCAP yet</span><br>
              Region: ${region}
            `;
          }
        }

        tooltip.style.opacity = '1';
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY + 10) + 'px';
      }

      function handlePolicyClick(_event: MouseEvent, d: any) {
        const code = countryIdToCode[normalizeId(d.id)];
        const country = countries.find((c: any) => c.country_code === code);
        if (!country) return;
        selectedPolicyCountry = code;

        // Highlight the selected country on this map
        ndcMapSvg.selectAll('.ndc-path')
          .attr('stroke', function(this: any) {
            const pathCode = d3.select(this).attr('data-code');
            return pathCode === code ? '#0f172a' : '#cbd5e1';
          })
          .attr('stroke-width', function(this: any) {
            const pathCode = d3.select(this).attr('data-code');
            return pathCode === code ? 2 : 0.5;
          });

        // Update country detail panel
        updatePolicyCountryDetail(code);

        // Update the viewing badge
        const viewingEl = document.getElementById('policy-viewing');
        if (viewingEl) viewingEl.textContent = country.country_name || code;

        // Sync to URL so sidebar dropdown updates
        if (typeof (window as any).__dashboardSetCountry === 'function') {
          (window as any).__dashboardSetCountry(code);
        }
      }

      // ── Country detail panel ─────────────────────────────────────────────
      function showGlobalPolicyDetail() {
        const container = document.querySelector('#policy-country-detail .country-detail') as HTMLElement;
        if (!container) return;
        container.innerHTML = `
          <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
            <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #0369a1; margin-bottom: 0.75rem; display: block;"></i>
            <h4 style="color: #0369a1; margin-bottom: 0.5rem;">Select a Country</h4>
            <p style="font-size: 0.85rem;">Click on any country in the map above to view policy framework details including GCP, NDC, and NCAP status.</p>
          </div>
        `;
      }

      function updatePolicyCountryDetail(code: string) {
        const container = document.querySelector('#policy-country-detail .country-detail') as HTMLElement;
        if (!container) return;

        const country = countries.find((c: any) => c.country_code === code);
        if (!country) {
          container.innerHTML = `<p style="color:#94a3b8; font-size:0.85rem;">No data available for ${code}</p>`;
          return;
        }

        const pledgeRec = pledge.find((p: any) => p.country_code === code);
        const ndcRec = getNdcRecord(code, getNdcFilters());
        const ncapRec = ncap.find((n: any) => n.country_code === code);
        const hasNcap = !!ncapRec;

        const hasGCP = pledgeRec && pledgeRec.signatory === 1;
        const ndcStatus = ndcRec?.mention_status ?? 'No data';
        const ncapYear = ncapRec?.year ? ` (${ncapRec.year})` : '';

        const ndcBorder = ndcStatus === 'Mentioned' ? '#D4A843' : '#e2e8f0';
        const ndcBg     = ndcStatus === 'Mentioned' ? '#fef9ec' : '#f8fafc';
        const ndcIcon   = ndcStatus === 'Mentioned' ? '#D4A843' : '#94a3b8';
        const ndcTitle  = ndcStatus === 'Mentioned' ? '#8B6B00' : '#64748b';
        const ndcLabel  = ndcStatus === 'Mentioned' ? 'Cooling Mentioned' : ndcStatus === 'Not mentioned' ? 'Not yet mentioned' : (ndcStatus || 'No Data');

        container.innerHTML = `
          <div style="background: #0369a1; color: #fff; border-radius: 0; padding: 0.5rem 0.75rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700;">
            <i class="fa-solid fa-location-dot" style="font-size: 0.9rem;"></i>
            ${country.country_name || code}
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 0.6rem;">
            <div class="policy-status-box" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.25rem;padding:0.5rem 0;border:none;border-top:1px solid rgba(0,0,0,0.06);background:transparent;">
              <i class="fa-solid fa-handshake" style="color: ${hasGCP ? '#6BADA0' : '#94a3b8'}; font-size: 1.5rem;"></i>
              <div style="font-weight: 700; color: ${hasGCP ? '#4A9088' : '#64748b'};">GCP</div>
              <div style="font-size: 0.75rem; color: #64748b;">${hasGCP ? 'Signatory' : 'Not signed'}</div>
            </div>
            <div class="policy-status-box" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.25rem;padding:0.5rem 0;border:none;border-top:1px solid rgba(0,0,0,0.06);background:transparent;">
              <i class="fa-solid fa-file-lines" style="color: ${ndcIcon}; font-size: 1.5rem;"></i>
              <div style="font-weight: 700; color: ${ndcTitle};">NDC</div>
              <div style="font-size: 0.75rem; color: #64748b;">${ndcLabel}</div>
            </div>
            <div class="policy-status-box" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.25rem;padding:0.5rem 0;border:none;border-top:1px solid rgba(0,0,0,0.06);background:transparent;">
              <i class="fa-solid fa-file-shield" style="color: ${hasNcap ? '#5A8FC2' : '#94a3b8'}; font-size: 1.5rem;"></i>
              <div style="font-weight: 700; color: ${hasNcap ? '#3B5A8B' : '#94a3b8'};">NCAP</div>
              <div style="font-size: 0.75rem; color: #64748b;">${hasNcap ? 'Developed' + ncapYear : 'No NCAP yet'}</div>
            </div>
          </div>
          <div style="font-size: 0.7rem; color: #94a3b8; display: flex; justify-content: flex-end; gap: 0.75rem;">
            <a href="https://unfccc.int/NDCREG" target="_blank" rel="noopener noreferrer" style="color:#5A8FC2;text-decoration:none;"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.65rem;"></i> NDC Registry</a>
            <a href="https://www.coolcoalition.org" target="_blank" rel="noopener noreferrer" style="color:#5A8FC2;text-decoration:none;"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.65rem;"></i> Cool Coalition</a>
          </div>
        `;
      }

      // ── Legend ────────────────────────────────────────────────────────────
      function updatePolicyLegend(mapType: string) {
        const legendEl = document.getElementById('ndc-legend');
        if (!legendEl) return;

        if (mapType === 'kigali') {
          legendEl.innerHTML = `
            <div class="legend-item"><div class="legend-color" style="background:#6BADA0"></div>Ratified</div>
            <div class="legend-item"><div class="legend-color" style="background:#e5e7eb;border:1px solid #cbd5e1;"></div>Not yet ratified</div>
            <div class="legend-item"><div class="legend-color" style="background:#E5E1D8"></div>No Data</div>
          `;
        } else if (mapType === 'gcp') {
          legendEl.innerHTML = `
            <div class="legend-item"><div class="legend-color" style="background:#6BADA0"></div>Signatory</div>
            <div class="legend-item"><div class="legend-color" style="background:#e5e7eb"></div>Non-Signatory</div>
            <div class="legend-item"><div class="legend-color" style="background:#E5E1D8"></div>No Data</div>
          `;
        } else if (mapType === 'ndc') {
          legendEl.innerHTML = `
            <div class="legend-item"><div class="legend-color" style="background:#6BADA0"></div>Mentioned</div>
            <div class="legend-item"><div class="legend-color" style="background:#D4A843"></div>Not Mentioned</div>
            <div class="legend-item"><div class="legend-color" style="background:#e5e7eb;border:1px solid #cbd5e1;"></div>No NDC Yet</div>
            <div class="legend-item"><div class="legend-color" style="background:#E5E1D8"></div>No Data</div>
          `;
        } else if (mapType === 'NCAP') {
          legendEl.innerHTML = `
            <div class="legend-item"><div class="legend-color" style="background:#6BADA0"></div>Has NCAP</div>
            <div class="legend-item"><div class="legend-color" style="background:#e5e7eb;border:1px solid #cbd5e1;"></div>No NCAP yet</div>
          `;
        }
      }

      // ── NDC progress bar ──────────────────────────────────────────────────
      function updateNDCProgress() {
        const setWidth = (id: string, pct: number) => {
          const el = document.getElementById(id);
          if (el) el.style.width = `${pct}%`;
        };

        const countryStatus = getCountryNDCStatus();
        const values = Object.values(countryStatus);
        const total = values.length;
        const counts = { mentioned: 0, not: 0, noNdc: 0, noData: 0 };

        values.forEach((status: any) => {
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

      // ── NDC KPIs ──────────────────────────────────────────────────────────
      function updateNDCKPIs() {
        const totalCountries = new Set(ndcTracker.map((n: any) => n.country_code)).size;
        const ndc30Submitted = new Set(
          ndcTracker.filter((n: any) => n.ndc_type === 'NDC 3.0' && n.mention_status !== 'No NDC submitted').map((n: any) => n.country_code)
        ).size;
        const eeMentioned = new Set(
          ndcTracker.filter((n: any) => n.ndc_type === ndcType && n.category === 'Energy Efficiency' && n.mention_value === 1).map((n: any) => n.country_code)
        ).size;
        const acMentioned = new Set(
          ndcTracker.filter((n: any) => n.ndc_type === ndcType && n.category === 'Air Conditioners' && n.mention_value === 1).map((n: any) => n.country_code)
        ).size;

        setText('ndc-total-countries', totalCountries);
        setText('ndc-submitted', ndc30Submitted);
        setText('ndc-ee-mentioned', eeMentioned);
        setText('ndc-ac-mentioned', acMentioned);
      }

      // ── Map update ────────────────────────────────────────────────────────
      function updatePolicyMap(mapType: string) {
        policyMapType = mapType;
        if (!ndcMapSvg) return;

        // Transition fill colors only — stroke is handled separately so highlights aren't lost
        ndcMapSvg.selectAll('.ndc-path')
          .transition()
          .duration(300)
          .attr('fill', function(this: any) {
            const code = d3.select(this).attr('data-code');
            if (!code) return '#E5E1D8';

            const country = countries.find((c: any) => c.country_code === code);
            if (selectedRegion && country?.region !== selectedRegion) return '#E5E1D8';

            if (mapType === 'kigali') {
              const kRec = kigali.find((k: any) => k.country_code === code);
              if (!kRec) return '#E5E1D8';
              return kRec.kigali_party === 1 ? '#6BADA0' : '#e5e7eb';
            } else if (mapType === 'gcp') {
              const pledgeRec = pledge.find((p: any) => p.country_code === code);
              if (!pledgeRec) return '#E5E1D8';
              return pledgeRec.signatory === 1 ? '#6BADA0' : '#e5e7eb';
            } else if (mapType === 'ndc') {
              const countryStatus = getCountryNDCStatus();
              const status = countryStatus[code];
              return getNDCColor(status ? status.status : null);
            } else if (mapType === 'NCAP') {
              if (code === 'BRA') return '#e5e7eb';
              const ncapCountry = ncap.find((n: any) => n.country_code === code);
              return ncapCountry ? '#6BADA0' : '#e5e7eb';
            }
            return '#E5E1D8';
          });

        // Apply stroke synchronously (not inside transition) so the selected-country
        // highlight is never interpolated away during a fill-colour tab switch
        const _sel = selectedPolicyCountry;
        ndcMapSvg.selectAll('.ndc-path')
          .attr('stroke', function(this: any) {
            return d3.select(this).attr('data-code') === _sel ? '#0f172a' : '#cbd5e1';
          })
          .attr('stroke-width', function(this: any) {
            return d3.select(this).attr('data-code') === _sel ? 2 : 0.5;
          });

        updatePolicyLegend(mapType);
      }

      // ── Filter status bar ─────────────────────────────────────────────────
      function updatePolicyFilterStatusBar() {
        const tabTag = document.getElementById('policy-filter-tab');
        const regionTag = document.getElementById('policy-filter-region');

        const tabNames: Record<string, string> = {
          kigali: 'Kigali Amendment',
          gcp: 'Global Cooling Pledge',
          ndc: 'NDC Cooling Mentions',
          NCAP: 'National Cooling Action Plans'
        };

        if (tabTag) {
          tabTag.innerHTML = `<i class="fa-solid fa-file-contract"></i> ${tabNames[policyMapType] || policyMapType}`;
        }
        if (regionTag) {
          const regionFilter = (document.getElementById('ndc-region-filter') as HTMLSelectElement)?.value || '';
          regionTag.innerHTML = `<i class="fa-solid fa-earth-americas"></i> ${regionFilter || 'All Regions'}`;
        }
      }

      // ── NDC filter population ─────────────────────────────────────────────
      function populatePolicyNDCFilters() {
        const displayCategories = [
          'Energy Efficiency', 'Air Conditioners', 'Refrigerators & freezers',
          'Appliance MEPS', 'Appliance Labels', 'Doubling EE'
        ];

        const typeSelect = document.getElementById('policy-ndc-type') as HTMLSelectElement | null;
        if (typeSelect) {
          typeSelect.innerHTML = '';
          const types = [...new Set(ndcTracker.map((n: any) => n.ndc_type).filter(Boolean))]
            .filter((t: string) => t !== 'NDC 3.0')
            .sort() as string[];
          types.forEach((type: string) => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type === 'Other' ? 'Previous NDC' : type === 'NDC 2.0' ? 'Previous NDC (NDC 2.0)' : type;
            if (type === ndcType) option.selected = true;
            typeSelect.appendChild(option);
          });
        }

        const categorySelect = document.getElementById('policy-ndc-category') as HTMLSelectElement | null;
        if (categorySelect) {
          categorySelect.innerHTML = '';
          const labels: Record<string, string> = {
            'Energy Efficiency': 'Energy Efficiency',
            'Air Conditioners': 'Air Conditioners',
            'Refrigerators & freezers': 'Refrigerators & Freezers',
            'Appliance MEPS': 'MEPS',
            'Appliance Labels': 'Labels',
            'Doubling EE': 'Doubling EE Target'
          };
          displayCategories.forEach((cat: string) => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = labels[cat] ?? cat;
            if (cat === ndcCategory) option.selected = true;
            categorySelect.appendChild(option);
          });
        }
      }

      // ── Chart renderers ───────────────────────────────────────────────────

      function renderPolicyKigaliCharts() {
        const kigaliParties = kigali.filter((k: any) => k.kigali_party === 1).length;
        const nonParties = kigali.length - kigaliParties;
        const montrealParties = kigali.filter((k: any) => k.montreal_protocol_party === 1).length;

        setChart('chart-kigali-status', {
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '55%'],
            data: [
              { value: kigaliParties, name: 'Ratified', itemStyle: { color: '#6BADA0' } },
              { value: nonParties, name: 'Not yet ratified', itemStyle: { color: '#cbd5e1' } }
            ],
            label: { formatter: '{b}\n{c} countries', fontSize: 12 },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } }
          }]
        });

        const regions = [...new Set(countries.map((c: any) => c.region).filter(Boolean))] as string[];
        const regionData = regions.map(region => {
          const countryCodes = countries.filter((c: any) => c.region === region).map((c: any) => c.country_code);
          const ratified = kigali.filter((k: any) => countryCodes.includes(k.country_code) && k.kigali_party === 1).length;
          const total = kigali.filter((k: any) => countryCodes.includes(k.country_code)).length;
          return { region, ratified, notRatified: total - ratified };
        }).sort((a, b) => b.ratified - a.ratified);

        setChart('chart-kigali-regions', {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
          xAxis: { type: 'category', data: regionData.map(r => r.region), axisLabel: { rotate: 30, fontSize: 10 } },
          yAxis: { type: 'value', name: 'Countries' },
          series: [
            { name: 'Ratified', type: 'bar', stack: 'total', data: regionData.map(r => r.ratified), itemStyle: { color: '#6BADA0' } },
            { name: 'Not yet ratified', type: 'bar', stack: 'total', data: regionData.map(r => r.notRatified), itemStyle: { color: '#cbd5e1' } }
          ]
        });

        const groupTypes = [...new Set(kigali.map((k: any) => k.group_type).filter(Boolean))] as string[];
        const groupData = groupTypes.map(gt => ({
          name: gt,
          value: kigali.filter((k: any) => k.group_type === gt && k.kigali_party === 1).length
        })).sort((a, b) => b.value - a.value);
        const groupColors = ['#4A9088', '#6BADA0', '#D4A843', '#A0D0CA'];

        setChart('chart-kigali-groups', {
          tooltip: { trigger: 'item', formatter: '{b}: {c} parties ({d}%)' },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '55%'],
            data: groupData.map((g, i) => ({ ...g, itemStyle: { color: groupColors[i % groupColors.length] } })),
            label: { formatter: '{b}\n{c}', fontSize: 11 },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } }
          }]
        });

        setChart('chart-kigali-coverage', {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
          xAxis: { type: 'category', data: ['Montreal Protocol', 'Kigali Amendment'] },
          yAxis: { type: 'value', name: 'Countries', max: Math.max(montrealParties, kigaliParties) + 10 },
          series: [{
            type: 'bar',
            data: [
              { value: montrealParties, itemStyle: { color: '#6BADA0' } },
              { value: kigaliParties, itemStyle: { color: '#A0D0CA' } }
            ],
            barWidth: '40%',
            label: { show: true, position: 'top', formatter: '{c} parties', fontSize: 12 }
          }]
        });
      }

      function renderGCPProgressCharts() {
        // GCP Signatories by Region
        const gcpRegions = [...new Set(countries.map((c: any) => c.region).filter(Boolean))] as string[];
        const gcpByRegion = gcpRegions.map(region => {
          const regionCodes = countries.filter((c: any) => c.region === region).map((c: any) => c.country_code);
          const signatories = pledge.filter((p: any) => regionCodes.includes(p.country_code) && p.signatory === 1).length;
          return { region, signatories };
        }).filter(r => r.signatories > 0).sort((a, b) => b.signatories - a.signatories);

        setChart('chart-gcp-by-region', {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params: any) {
              const region = params[0].name;
              return `<strong>${region}</strong><br/>${params[0].marker} Signatories: <strong>${params[0].value}</strong>`;
            }
          },
          legend: { show: false },
          grid: { left: '3%', right: '8%', bottom: '5%', top: '5%', containLabel: true },
          xAxis: {
            type: 'value',
            axisLabel: { color: '#475569', fontSize: 10 },
            splitLine: { lineStyle: { color: '#f1f5f9' } }
          },
          yAxis: {
            type: 'category',
            data: gcpByRegion.map(r => r.region),
            axisLabel: { color: '#334155', fontSize: 11, fontWeight: 500 },
            axisLine: { show: false },
            axisTick: { show: false }
          },
          series: [
            {
              name: 'Signatories',
              type: 'bar',
              data: gcpByRegion.map(r => r.signatories),
              itemStyle: { color: '#6BADA0', borderRadius: [0, 4, 4, 0] },
              label: { show: true, position: 'right', color: '#334155', fontSize: 11, fontWeight: 700, formatter: (p: any) => String(p.value) }
            }
          ]
        });

        // NDC Evolution 2.0 vs 3.0
        const ndcEvolutionCategories = ['Energy Efficiency', 'Kigali Amendment', 'Doubling EE', 'Refrigerators & freezers', 'Air Conditioners', 'Appliance MEPS', 'Appliance Labels'];
        const categoryAbbrev: Record<string, string> = {
          'Energy Efficiency': 'Energy Eff.', 'Kigali Amendment': 'Kigali', 'Doubling EE': 'Doubling EE',
          'Refrigerators & freezers': 'Refrigerators', 'Air Conditioners': 'ACs', 'Appliance MEPS': 'MEPS', 'Appliance Labels': 'Labels'
        };
        const ndc20Mentions = ndcEvolutionCategories.map(cat =>
          new Set(ndcTracker.filter((n: any) => n.ndc_type === 'NDC 2.0' && n.category === cat && n.mention_value === 1).map((n: any) => n.country_code)).size
        );
        const ndc30Mentions = ndcEvolutionCategories.map(cat =>
          new Set(ndcTracker.filter((n: any) => n.ndc_type === 'NDC 3.0' && n.category === cat && n.mention_value === 1).map((n: any) => n.country_code)).size
        );

        setChart('chart-ndc-evolution', {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: { bottom: 0, textStyle: { color: '#475569', fontSize: 10 } },
          grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
          xAxis: { type: 'category', data: ndcEvolutionCategories.map(c => categoryAbbrev[c] || c), axisLabel: { color: '#475569', fontSize: 9, rotate: 25, interval: 0 } },
          yAxis: { type: 'value', name: 'Countries', nameTextStyle: { color: '#475569', fontSize: 11 }, axisLabel: { color: '#475569', fontSize: 10 } },
          series: [
            { name: 'NDC 2.0', type: 'bar', data: ndc20Mentions, itemStyle: { color: CHROME.TEXT_MUTED, borderRadius: [3, 3, 0, 0] }, barGap: '10%' },
            { name: 'NDC 3.0', type: 'bar', data: ndc30Mentions, itemStyle: { color: '#6BADA0', borderRadius: [3, 3, 0, 0] } }
          ]
        });

        // Policy Coverage Depth pie
        const totalCountries = countries.length;
        const coverageCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
        countries.forEach((c: any) => {
          let depth = 0;
          if (pledge.some((p: any) => p.country_code === c.country_code && p.signatory === 1)) depth++;
          if (ndcTracker.some((n: any) => n.country_code === c.country_code && n.ndc_type === 'NDC 3.0' && n.category === 'Energy Efficiency' && n.mention_value === 1)) depth++;
          if (ncap.some((n: any) => n.country_code === c.country_code)) depth++;
          coverageCount[depth]++;
        });
        const depthLabels = ['No Policy', '1 Instrument', '2 Instruments', 'All 3 (GCP+NDC+NCAP)'];
        const depthColors = ['#E5E1D8', '#D4A843', '#6BADA0', '#4A9088'];

        setChart('chart-policy-depth', {
          tooltip: {
            trigger: 'item',
            formatter: function(params: any) {
              return `<strong>${params.name}</strong><br/>${params.value} countries (${((params.value / totalCountries) * 100).toFixed(0)}%)`;
            }
          },
          series: [{
            type: 'pie', radius: ['40%', '70%'], center: ['50%', '48%'],
            data: depthLabels.map((label, i) => ({ value: coverageCount[i], name: label, itemStyle: { color: depthColors[i] } })),
            label: { formatter: '{b}\n{c}', fontSize: 11, color: '#334155' },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } }
          }]
        });
      }

      function updateNDCCharts() {
        const mentionedCounts = ndcCategories.map(cat =>
          ndcTracker.filter((n: any) => n.ndc_type === ndcType && n.category === cat && n.mention_value === 1).length
        );
        const ndcVersionLabel = ndcType === 'NDC 3.0' ? '(NDC 3.0)' : '(Previous NDC)';
        setChart('chart-ndc-categories', {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: { show: false },
          grid: { left: '3%', right: '8%', bottom: '5%', top: '5%', containLabel: true },
          xAxis: {
            type: 'value',
            axisLabel: { color: '#475569', fontSize: 10 },
            splitLine: { lineStyle: { color: '#f1f5f9' } }
          },
          yAxis: {
            type: 'category',
            data: ndcCategories,
            axisLabel: { color: '#334155', fontSize: 11, fontWeight: 500 },
            axisLine: { show: false },
            axisTick: { show: false }
          },
          series: [
            { name: `Mentioned ${ndcVersionLabel}`, type: 'bar', data: mentionedCounts, itemStyle: { color: '#6BADA0', borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', color: '#334155', fontSize: 11, fontWeight: 700, formatter: (p: any) => p.value > 0 ? String(p.value) : '' } }
          ]
        });

        const ndcRegions = [...new Set(ndcTracker.map((n: any) => n.continent).filter(Boolean))] as string[];
        const regionMentionedPrev = ndcRegions.map(region =>
          ndcTracker.filter((n: any) => n.ndc_type === 'Other' && n.category === ndcCategory && n.continent === region && n.mention_value === 1).length
        );
        const regionMentioned30 = ndcRegions.map(region =>
          ndcTracker.filter((n: any) => n.ndc_type === 'NDC 3.0' && n.category === ndcCategory && n.continent === region && n.mention_value === 1).length
        );

        setChart('chart-ndc-regions', {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: { bottom: 0, textStyle: { color: '#1e293b', fontWeight: 700, fontSize: 11 } },
          grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
          xAxis: categoryAxis(ndcRegions),
          yAxis: valueAxis(),
          series: [
            { name: 'Previous NDC', type: 'bar', data: regionMentionedPrev, itemStyle: { color: '#94a3b8', borderRadius: [3, 3, 0, 0] }, barGap: '10%' },
            { name: 'NDC 3.0', type: 'bar', data: regionMentioned30, itemStyle: { color: '#6BADA0', borderRadius: [3, 3, 0, 0] } }
          ]
        });

        const ndc30Mentioned = ndcCategories.map(cat =>
          new Set(ndcTracker.filter((n: any) => n.ndc_type === 'NDC 3.0' && n.category === cat && n.mention_value === 1).map((n: any) => n.country_code)).size
        );
        const prevNdcMentioned = ndcCategories.map(cat =>
          new Set(ndcTracker.filter((n: any) => n.ndc_type === 'Other' && n.category === cat && n.mention_value === 1).map((n: any) => n.country_code)).size
        );

        setChart('chart-ndc-comparison', {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: { bottom: 0, textStyle: { color: '#475569', fontSize: 11 } },
          grid: { left: '3%', right: '8%', bottom: '12%', top: '5%', containLabel: true },
          xAxis: {
            type: 'value',
            axisLabel: { color: '#475569', fontSize: 10 },
            splitLine: { lineStyle: { color: '#f1f5f9' } }
          },
          yAxis: {
            type: 'category',
            data: ndcCategories,
            axisLabel: { color: '#334155', fontSize: 11, fontWeight: 500 },
            axisLine: { show: false },
            axisTick: { show: false }
          },
          series: [
            { name: 'NDC 3.0', type: 'bar', data: ndc30Mentioned, itemStyle: { color: '#6BADA0', borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', color: '#334155', fontSize: 10, formatter: (p: any) => p.value > 0 ? String(p.value) : '' } },
            { name: 'Previous NDC (NDC 2.0)', type: 'bar', data: prevNdcMentioned, itemStyle: { color: CHROME.TEXT_MUTED, borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', color: '#334155', fontSize: 10, formatter: (p: any) => p.value > 0 ? String(p.value) : '' } }
          ]
        });

      }

      function updateNCAPCharts() {
        // Brazil excluded — NCAP process only recently initiated, data not yet confirmed
        const ncapFiltered = ncap.filter((n: any) => n.country_code !== 'BRA');

        const ncapYears = ncapFiltered.map((n: any) => n.year).filter((y: any): y is number => y !== null && y !== undefined).sort((a: number, b: number) => a - b);
        const yearCounts2: Record<number, number> = {};
        ncapYears.forEach((year: number) => { yearCounts2[year] = (yearCounts2[year] || 0) + 1; });
        const years2 = Object.keys(yearCounts2).map(Number).sort((a, b) => a - b);
        const counts2 = years2.map(y => yearCounts2[y]);

        setChart('chart-ncap-timeline', {
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
          xAxis: categoryAxis(years2.map(String)),
          yAxis: valueAxis(),
          series: [{ name: 'NCAPs Developed', type: 'bar', data: counts2, itemStyle: { color: '#5A8FC2' } }]
        });

        const listEl = document.getElementById('ncap-countries-list');
        if (listEl) {
          const sortedNcap = [...ncapFiltered].sort((a: any, b: any) => a.country_name.localeCompare(b.country_name));
          listEl.innerHTML = sortedNcap.map((n: any) => `
            <div class="ncap-country-card" style="background: transparent; border: none; border-top: 1px solid rgba(0,0,0,0.06); padding: 0.75rem 0 0.75rem 1rem; border-left: 3px solid #5A8FC2;">
              <div style="font-weight: 600; color: #1e293b;">${n.country_name}</div>
              <div style="font-size: 0.8rem; color: #64748b;">${n.year ? 'Adopted: ' + n.year : 'Year not specified'}</div>
            </div>
          `).join('');
        }
      }

      // ── Dynamic chart container builder ───────────────────────────────────
      function updatePolicyChartsForMapType(mapType: string) {
        const container = document.getElementById('policy-charts-container');
        if (!container) return;

        // Dispose any existing ECharts instances in the container
        disposeChartContainer(container);
        container.innerHTML = '';

        const cprBox = `
          <div style="padding:1.1rem 1.4rem;background:#f0f7ff;border-top:3px solid #0369a1;border-bottom:1px solid #bae0ff;margin-top:1rem;">
            <a href="https://www.climatepolicyradar.org/" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-bottom:0.65rem;">
              <img src="/images/cpr-logo-dark.png" alt="Climate Policy Radar" style="height:22px;width:auto;object-fit:contain;" />
            </a>
            <div style="font-size:0.9rem;font-weight:800;color:#0f172a;margin-bottom:0.3rem;letter-spacing:-0.01em;">Explore national climate policies on Climate Policy Radar</div>
            <p style="font-size:0.81rem;color:#334155;line-height:1.65;margin:0 0 0.6rem;">
              Climate Policy Radar's database covers NDCs, NCAPs, and national climate legislation across 200+ countries. Use it to go deeper on any country's cooling-related commitments.
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:0.6rem;align-items:center;">
              <a href="https://app.climatepolicyradar.org/?_gl=1*1orjtq2*_ga*MTk2OTA4ODMwNy4xNzc2MzQ2MzY4*_ga_ZD1WWE49TL*czE3NzYzNDYzNjckbzEkZzAkdDE3NzYzNDYzNjckajYwJGwwJGgw" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:0.35rem;background:#0369a1;color:#fff;font-size:0.78rem;font-weight:700;padding:0.38rem 0.9rem;border-radius:3px;text-decoration:none;">
                <i class="fa-solid fa-magnifying-glass" style="font-size:0.68rem;"></i> Search the Database
              </a>
              <a href="https://www.climatepolicyradar.org/" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:0.3rem;color:#0369a1;font-size:0.78rem;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(3,105,161,0.3);padding-bottom:1px;">
                <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.62rem;"></i> More about Climate Policy Radar
              </a>
            </div>
          </div>
        `;

        if (mapType === 'kigali') {
          const kigaliParties = kigali.filter((k: any) => k.kigali_party === 1).length;
          container.innerHTML = `
            <div class="policy-charts-flat">
              <div class="policy-chart-item">
                <p class="p-chart-eyebrow">Status</p>
                <h3 class="p-chart-title">Kigali Amendment Ratification</h3>
                <p class="p-chart-subtitle">${kigaliParties} of ${kigali.length} countries have ratified</p>
                <div id="chart-kigali-status" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
              <div class="policy-chart-item">
                <p class="p-chart-eyebrow">By Region</p>
                <h3 class="p-chart-title">Kigali Ratification by Region</h3>
                <p class="p-chart-subtitle">Parties vs non-parties by world region</p>
                <div id="chart-kigali-regions" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
              <div class="policy-chart-item">
                <p class="p-chart-eyebrow">Group Type</p>
                <h3 class="p-chart-title">Parties by Group Type</h3>
                <p class="p-chart-subtitle">Article 5 Group 1, Group 2, Non-Article 5</p>
                <div id="chart-kigali-groups" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
              <div class="policy-chart-item">
                <p class="p-chart-eyebrow">Treaty Coverage</p>
                <h3 class="p-chart-title">Montreal Protocol vs Kigali Amendment</h3>
                <p class="p-chart-subtitle">Total countries covered under each treaty</p>
                <div id="chart-kigali-coverage" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
            </div>
          `;
          requestAnimationFrame(() => {
            renderPolicyKigaliCharts();
            requestAnimationFrame(forceResizePolicyCharts);
          });

        } else if (mapType === 'gcp') {
          const gcpSignatoryCount = pledge.filter((p: any) => p.signatory === 1).length;
          container.innerHTML = `
            <div class="policy-charts-flat">
              <div class="policy-chart-item" style="grid-column: 1 / -1;">
                <p class="p-chart-eyebrow">By Region</p>
                <h3 class="p-chart-title">Global Cooling Pledge — Signatories by Region</h3>
                <p class="p-chart-subtitle">${gcpSignatoryCount} countries have signed the Global Cooling Pledge at COP28</p>
                <div id="chart-gcp-by-region" class="chart-surface" style="width:100%;height:320px;min-height:320px;"></div>
              </div>
            </div>
          `;
          requestAnimationFrame(() => {
            renderGCPProgressCharts();
            requestAnimationFrame(forceResizePolicyCharts);
          });

        } else if (mapType === 'ndc') {
          const claspNdcBox = `
            <div style="display:flex;align-items:flex-start;gap:1.25rem;padding:1.1rem 1.4rem;background:#f0fdf4;border-top:3px solid #2D7D5A;border-bottom:1px solid #bbf7d0;margin-bottom:0.5rem;">
              <a href="https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/" target="_blank" rel="noopener noreferrer" style="flex-shrink:0;display:flex;align-items:center;padding-top:2px;">
                <img src="/images/clasp-logo.png" alt="CLASP" style="height:28px;width:auto;object-fit:contain;opacity:0.9;" />
              </a>
              <div style="flex:1;min-width:0;">
                <div style="font-size:0.9rem;font-weight:800;color:#0f172a;margin-bottom:0.3rem;letter-spacing:-0.01em;">NDC data: CLASP NDC Appliance Efficiency Toolkit</div>
                <p style="font-size:0.81rem;color:#334155;line-height:1.65;margin:0 0 0.6rem;">
                  The NDC cooling mentions data shown in the charts and map above comes from CLASP's NDC Appliance Efficiency Toolkit — a resource tracking how countries integrate appliance efficiency into their Nationally Determined Contributions.
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:0.6rem;align-items:center;">
                  <a href="https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:0.35rem;background:#2D7D5A;color:#fff;font-size:0.78rem;font-weight:700;padding:0.38rem 0.9rem;border-radius:3px;text-decoration:none;">
                    <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.68rem;"></i> Open the Toolkit
                  </a>
                </div>
              </div>
            </div>
          `;
          container.innerHTML = claspNdcBox + `
            <div class="policy-charts-flat">
              <div class="policy-chart-item">
                <p class="p-chart-eyebrow">By Category</p>
                <h3 class="p-chart-title">NDC Cooling Mentions by Category</h3>
                <p class="p-chart-subtitle">Previous NDC (NDC 2.0) — by cooling topic</p>
                <div id="chart-ndc-categories" class="chart-surface" style="width:100%;height:300px;min-height:300px;"></div>
              </div>
              <div class="policy-chart-item">
                <p class="p-chart-eyebrow">By Region</p>
                <h3 class="p-chart-title">NDC Status by Region</h3>
                <p class="p-chart-subtitle">Previous NDC (NDC 2.0) — countries mentioning cooling by region</p>
                <div id="chart-ndc-regions" class="chart-surface" style="width:100%;height:300px;min-height:300px;"></div>
              </div>
              <div class="policy-chart-item" style="grid-column: 1 / -1;">
                <p class="p-chart-eyebrow">Trend</p>
                <h3 class="p-chart-title">NDC Cooling Mentions — All Categories</h3>
                <p class="p-chart-subtitle">Previous NDC (NDC 2.0) — countries with cooling mentions across all tracked categories</p>
                <div id="chart-ndc-comparison" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
            </div>
            <div class="policy-charts-flat" style="padding-top:0;">
              <div class="policy-chart-item" style="grid-column: 1 / -1;">
                ${cprBox}
              </div>
            </div>
          `;
          requestAnimationFrame(() => {
            updateNDCCharts();
            requestAnimationFrame(forceResizePolicyCharts);
          });

        } else if (mapType === 'NCAP') {
          const ncapCprBox = `
            <div style="display:flex;align-items:flex-start;gap:1.25rem;padding:1.1rem 1.4rem;background:#f0f7ff;border-top:3px solid #0369a1;border-bottom:1px solid #bae0ff;margin-bottom:0.5rem;">
              <a href="https://www.climatepolicyradar.org/" target="_blank" rel="noopener noreferrer" style="flex-shrink:0;display:flex;align-items:center;padding-top:2px;">
                <img src="/images/cpr-logo-dark.png" alt="Climate Policy Radar" style="height:28px;width:auto;object-fit:contain;" />
              </a>
              <div style="flex:1;min-width:0;">
                <div style="font-size:0.9rem;font-weight:800;color:#0f172a;margin-bottom:0.3rem;letter-spacing:-0.01em;">NCAP data: Climate Policy Radar</div>
                <p style="font-size:0.81rem;color:#334155;line-height:1.65;margin:0 0 0.6rem;">
                  The National Cooling Action Plan data shown in the map and charts above is tracked with the help of Climate Policy Radar — a tool that indexes national climate legislation, NDCs, and sectoral action plans across 200+ countries.
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:0.6rem;align-items:center;">
                  <a href="https://app.climatepolicyradar.org/?_gl=1*1orjtq2*_ga*MTk2OTA4ODMwNy4xNzc2MzQ2MzY4*_ga_ZD1WWE49TL*czE3NzYzNDYzNjckbzEkZzAkdDE3NzYzNDYzNjckajYwJGwwJGgw" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:0.35rem;background:#0369a1;color:#fff;font-size:0.78rem;font-weight:700;padding:0.38rem 0.9rem;border-radius:3px;text-decoration:none;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size:0.68rem;"></i> Search NCAPs
                  </a>
                  <a href="https://www.climatepolicyradar.org/" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:0.3rem;color:#0369a1;font-size:0.78rem;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(3,105,161,0.3);padding-bottom:1px;">
                    <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.62rem;"></i> More about Climate Policy Radar
                  </a>
                </div>
              </div>
            </div>
          `;
          container.innerHTML = ncapCprBox + `
            <div class="policy-charts-flat">
              <div class="policy-chart-item">
                <p class="p-chart-eyebrow">Timeline</p>
                <h3 class="p-chart-title">NCAP Development Over Time</h3>
                <p class="p-chart-subtitle">Number of National Cooling Action Plans adopted per year</p>
                <div id="chart-ncap-timeline" class="chart-surface" style="width:100%;height:300px;min-height:300px;"></div>
              </div>
              <div class="policy-chart-item">
                <p class="p-chart-eyebrow">Countries with NCAPs</p>
                <h3 class="p-chart-title">Countries with National Cooling Action Plans</h3>
                <p class="p-chart-subtitle">Tracked via Climate Policy Radar · Brazil excluded — NCAP process only recently initiated</p>
                <div id="ncap-countries-list" style="margin-top:0.5rem;max-height:320px;overflow-y:auto;scrollbar-width:thin;"></div>
              </div>
            </div>
            <div class="policy-charts-flat" style="padding-top:0;">
              <div class="policy-chart-item" style="grid-column: 1 / -1;">
                <p class="p-chart-eyebrow">Global North</p>
                <h3 class="p-chart-title">Equivalent Policies in High-Income Countries</h3>
                <p class="p-chart-subtitle">High-income countries address cooling through sector-specific regulations rather than dedicated NCAPs</p>
                <div style="display:flex;flex-direction:column;gap:0;padding:0.25rem 0 0;">
                  <div style="padding:0.9rem 0;border-bottom:1px solid rgba(0,0,0,0.06);">
                    <div style="font-size:0.78rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;margin-bottom:0.4rem;">United States</div>
                    <div style="font-size:0.8rem;color:#475569;line-height:1.65;">
                      <strong style="color:#1e293b;">AIM Act (2020)</strong> — 85% HFC phasedown by 2036, implementing Kigali commitments.<br>
                      <strong style="color:#1e293b;">DOE Appliance Standards</strong> — mandatory MEPS for AC and refrigeration.<br>
                      <strong style="color:#1e293b;">IRA (2022)</strong> — tax credits for efficient heat pumps and cooling appliances.
                    </div>
                  </div>
                  <div style="padding:0.9rem 0;border-bottom:1px solid rgba(0,0,0,0.06);">
                    <div style="font-size:0.78rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;margin-bottom:0.4rem;">European Union</div>
                    <div style="font-size:0.8rem;color:#475569;line-height:1.65;">
                      <strong style="color:#1e293b;">F-Gas Regulation (2024)</strong> — HFC phasedown ahead of Kigali schedule; ban on high-GWP refrigerants.<br>
                      <strong style="color:#1e293b;">Ecodesign Regulation</strong> — mandatory efficiency standards for cooling equipment.<br>
                      <strong style="color:#1e293b;">EPBD (2024)</strong> — near-zero energy requirements for buildings including cooling demand limits.
                    </div>
                  </div>
                  <div style="padding:0.9rem 0;">
                    <div style="font-size:0.78rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;margin-bottom:0.4rem;">Japan</div>
                    <div style="font-size:0.8rem;color:#475569;line-height:1.65;">
                      <strong style="color:#1e293b;">Top Runner Program</strong> — world's most advanced MEPS, best-performing products set the future standard.<br>
                      <strong style="color:#1e293b;">Fluorocarbon Emissions Control Act</strong> — mandatory refrigerant recovery and lifecycle management.<br>
                      <strong style="color:#1e293b;">Building Energy Efficiency Act</strong> — energy performance standards covering cooling systems.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
          requestAnimationFrame(() => {
            updateNCAPCharts();
            requestAnimationFrame(forceResizePolicyCharts);
          });
        }
      }

      // ── initNDCMap ────────────────────────────────────────────────────────
      async function initNDCMap() {
        const container = document.getElementById('ndc-map-container');
        if (!container) return;

        // Clear any existing SVG to prevent duplicates on hot reload
        d3.select('#ndc-map-container').selectAll('svg').remove();

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

        // Ocean click handler – deselect country and return to global view
        ndcMapSvg.append('rect')
          .attr('width', width)
          .attr('height', height)
          .attr('fill', 'transparent')
          .style('cursor', 'pointer')
          .on('click', () => {
            selectedPolicyCountry = null;
            ndcMapSvg.selectAll('.ndc-path')
              .attr('stroke', '#cbd5e1')
              .attr('stroke-width', 0.5);
            const viewingEl = document.getElementById('policy-viewing');
            if (viewingEl) viewingEl.textContent = 'Global';
            const statusTitle = document.getElementById('policy-status-title');
            if (statusTitle) statusTitle.textContent = 'National Plans & Commitments Analysis';
            showGlobalPolicyDetail();
            if (typeof (window as any).__dashboardClearCountry === 'function') {
              (window as any).__dashboardClearCountry();
            }
          });

        try {
          const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
          const worldCountries = topojson.feature(world, world.objects.countries);

          ndcMapSvg.selectAll('path')
            .data(worldCountries.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class', 'country-path ndc-path')
            .attr('data-code', (d: any) => countryIdToCode[normalizeId(d.id)] || '')
            .attr('stroke', '#cbd5e1')
            .attr('stroke-width', 0.5)
            .attr('fill', (d: any) => {
              const code = countryIdToCode[normalizeId(d.id)];
              if (!code) return '#E5E1D8';
              const country = countries.find((c: any) => c.country_code === code);
              if (selectedRegion && country?.region !== selectedRegion) return '#E5E1D8';
              // Initialize with GCP view (first active tab)
              const pledgeRec = pledge.find((p: any) => p.country_code === code);
              if (!pledgeRec) return '#E5E1D8';
              return pledgeRec.signatory === 1 ? '#6BADA0' : '#e5e7eb';
              // Note: Brazil excluded from NCAP view — NCAP only recently initiated
            })
            .on('mouseover', handlePolicyHover)
            .on('mouseout', handleOut)
            .on('click', handlePolicyClick);

          // Initialize with GCP legend and progress
          updatePolicyLegend('gcp');
          updateNDCProgress();
        } catch (error) {
          console.error('Policy map error:', error);
        }
      }

      // ── initNDCCharts (NDC tracker chart initialization) ──────────────────
      function initNDCCharts() {
        // Start with GCP charts (default active tab)
        updatePolicyChartsForMapType('gcp');
      }

      // ── Window resize handler ─────────────────────────────────────────────
      const onWindowResize = () => {
        requestAnimationFrame(forceResizePolicyCharts);
      };
      window.addEventListener('resize', onWindowResize);
      cleanupFns.push(() => window.removeEventListener('resize', onWindowResize));

      // ── ResizeObserver on the policy section ──────────────────────────────
      const policySection = document.getElementById('view-policy');
      let sectionObserver: ResizeObserver | null = null;
      if (policySection) {
        sectionObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            if (entry.contentRect.width > 0) {
              requestAnimationFrame(forceResizePolicyCharts);
            }
          }
        });
        sectionObserver.observe(policySection);
        cleanupFns.push(() => sectionObserver?.disconnect());
      }

      // ── Event handlers: policy map tabs ───────────────────────────────────
      const policyTabHandlers: Array<{ btn: HTMLButtonElement; handler: () => void }> = [];
      document.querySelectorAll<HTMLButtonElement>('.policy-map-tab').forEach(btn => {
        const handler = () => {
          document.querySelectorAll('.policy-map-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const mapType = btn.dataset.map ?? 'gcp';
          updatePolicyMap(mapType);

          const ndcFilters = document.getElementById('policy-ndc-filters');
          if (ndcFilters) ndcFilters.classList.toggle('visible', mapType === 'ndc');

          const ndcClaspSource = document.getElementById('ndc-clasp-source');
          if (ndcClaspSource) ndcClaspSource.style.display = mapType === 'ndc' ? 'flex' : 'none';

          updatePolicyChartsForMapType(mapType);
          updatePolicyFilterStatusBar();
        };
        btn.addEventListener('click', handler);
        policyTabHandlers.push({ btn, handler });
      });
      cleanupFns.push(() => {
        policyTabHandlers.forEach(({ btn, handler }) => btn.removeEventListener('click', handler));
      });

      // ── Event handlers: NDC filter dropdowns ──────────────────────────────
      const policyNdcTypeEl = document.getElementById('policy-ndc-type') as HTMLSelectElement | null;
      const ndcTypeHandler = () => {
        if (policyNdcTypeEl) {
          ndcType = policyNdcTypeEl.value;
          updatePolicyMap('ndc');
          updatePolicyChartsForMapType('ndc');
        }
      };
      if (policyNdcTypeEl) {
        policyNdcTypeEl.addEventListener('change', ndcTypeHandler);
        cleanupFns.push(() => policyNdcTypeEl.removeEventListener('change', ndcTypeHandler));
      }

      const policyNdcCategoryEl = document.getElementById('policy-ndc-category') as HTMLSelectElement | null;
      const ndcCategoryHandler = () => {
        if (policyNdcCategoryEl) {
          ndcCategory = policyNdcCategoryEl.value;
          updatePolicyMap('ndc');
          updatePolicyChartsForMapType('ndc');
        }
      };
      if (policyNdcCategoryEl) {
        policyNdcCategoryEl.addEventListener('change', ndcCategoryHandler);
        cleanupFns.push(() => policyNdcCategoryEl.removeEventListener('change', ndcCategoryHandler));
      }

      // ── Bootstrap ─────────────────────────────────────────────────────────
      try { await initNDCMap(); } catch (e) { console.error('PolicyPillar initNDCMap error:', e); }
      try { populatePolicyNDCFilters(); } catch (e) { console.error('PolicyPillar populatePolicyNDCFilters error:', e); }
      try { initNDCCharts(); } catch (e) { console.error('PolicyPillar initNDCCharts error:', e); }
      try { updateNDCKPIs(); } catch (e) { console.error('PolicyPillar updateNDCKPIs error:', e); }
      try { showGlobalPolicyDetail(); } catch (e) { console.error('PolicyPillar showGlobalPolicyDetail error:', e); }
      try { updatePolicyFilterStatusBar(); } catch (e) { console.error('PolicyPillar updatePolicyFilterStatusBar error:', e); }

      // Expose country-apply function for reactive URL sync
      function applyPolicyCountry(code: string | null) {
        if (!code) {
          selectedPolicyCountry = null;
          // Reset all map highlights
          if (ndcMapSvg) ndcMapSvg.selectAll('.ndc-path').attr('stroke', '#cbd5e1').attr('stroke-width', 0.5);
          const viewingEl = document.getElementById('policy-viewing');
          if (viewingEl) viewingEl.textContent = 'Global';
          showGlobalPolicyDetail();
          return;
        }
        const country = countries.find((c: any) => c.country_code === code);
        if (!country) return;
        selectedPolicyCountry = code;
        // Highlight on active map
        if (ndcMapSvg) {
          ndcMapSvg.selectAll('.ndc-path')
            .attr('stroke', function(this: any) { return d3.select(this).attr('data-code') === code ? '#0f172a' : '#cbd5e1'; })
            .attr('stroke-width', function(this: any) { return d3.select(this).attr('data-code') === code ? 2 : 0.5; });
        }
        updatePolicyCountryDetail(code);
        const viewingEl = document.getElementById('policy-viewing');
        if (viewingEl) viewingEl.textContent = country.country_name || code;
      }
      _applyPolicyCountry = applyPolicyCountry;

      // Apply country from URL on initial load
      const _initialPolicyCountry = new URLSearchParams(window.location.search).get('country');
      if (_initialPolicyCountry) applyPolicyCountry(_initialPolicyCountry);

    })();

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cleanupDone = true;
      clearTimeout(revealTimer);
      cleanupFns.forEach(fn => fn());
    };
  });
</script>

<section id="view-policy" class="view-section" class:active>
  <div class="pillar-stack">

    <!-- ═══ Section 1: THE LANDSCAPE ═══ -->
    <div class="chapter-card" class:revealed style="border-top: none;">
      <span class="ns-eyebrow">The Landscape</span>
      <h2 class="ns-title">Cooling has historically been invisible in climate policy — that is changing.</h2>
      <p class="ns-body">Historically, cooling was a "blind spot" in climate policy. That changed at COP28 with the launch of the <a href="https://www.coolcoalition.org/global-cooling-pledge/" target="_blank" rel="noopener noreferrer" style="color:#0369a1;font-weight:600;border-bottom:1px solid rgba(3,105,161,0.3);text-decoration:none;">Global Cooling Pledge</a> — a voluntary commitment by national governments to reduce cooling-related emissions by 68% by 2050 through three core areas: passive cooling, energy efficiency, and a rapid refrigerant transition. As of April 2026, 74 countries have signed on, signalling intention to integrate cooling into the heart of national climate strategies. An additional 235 subnational governments have also endorsed the Pledge.</p>
      <p class="ns-body">While many countries have signed the Pledge, very few have implemented the full regulatory framework required to reach the target emissions reduction. The gap between commitment and implementation remains the central challenge of global cooling governance.</p>
      <p class="ns-body" style="font-size:0.88rem;padding:0.7rem 0 0.7rem 1rem;border-left:3px solid #6BADA0;color:#334155;background:transparent;">
        <i class="fa-solid fa-circle-info" style="color:#6BADA0;margin-right:0.4rem;"></i>
        The <strong>Kigali Amendment</strong> — the legally binding framework for phasing down HFC refrigerants — is tracked in detail under <strong>Pillar 3: Refrigerant Transition</strong>. This pillar focuses on the broader policy framework: NDCs, NCAPs, and pledge commitments.
      </p>
    </div>

    <!-- ═══ POLICY INSTRUMENT EXPLAINERS ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="ns-eyebrow">Policy Instruments</span>
      <h2 class="ns-title">Understanding National Cooling Policy Instruments</h2>

      <!-- ── Global Cooling Pledge — featured block ── -->
      <div class="pledge-featured">
        <div class="pledge-featured-header">
          <div class="pledge-featured-icon"><i class="fa-solid fa-handshake-angle"></i></div>
          <div class="pledge-featured-meta">
            <strong>The Global Cooling Pledge</strong>
            <div class="pledge-featured-stats">
              <span><i class="fa-solid fa-flag" style="margin-right:0.35rem;opacity:0.7;"></i>74 countries</span>
              <span class="pledge-stat-sep">·</span>
              <span><i class="fa-solid fa-city" style="margin-right:0.35rem;opacity:0.7;"></i>235 subnational governments</span>
              <span class="pledge-stat-sep">·</span>
              <span>Launched COP28, December 2023</span>
            </div>
          </div>
        </div>
        <p class="pledge-featured-body">Launched at COP28 in Dubai, the Global Cooling Pledge is a voluntary commitment by national governments to collectively reduce cooling-related greenhouse gas emissions by at least 68% by 2050 relative to business-as-usual. Signatories commit to a package of 14 interconnected actions spanning five themes:</p>
        <div class="pledge-themes">
          <div class="pledge-theme"><i class="fa-solid fa-bolt" style="color:#d97706;"></i><span><strong>Efficiency</strong> — Double the average efficiency of new cooling appliances by 2030 and implement best-in-class MEPS and energy labels.</span></div>
          <div class="pledge-theme"><i class="fa-solid fa-snowflake" style="color:#0891b2;"></i><span><strong>Refrigerant transition</strong> — Accelerate the shift to low-GWP refrigerants, moving ahead of Kigali Amendment schedules where possible.</span></div>
          <div class="pledge-theme"><i class="fa-solid fa-leaf" style="color:#2D7D5A;"></i><span><strong>Passive cooling</strong> — Integrate nature-based solutions, building codes, and urban planning to reduce cooling demand at source.</span></div>
          <div class="pledge-theme"><i class="fa-solid fa-file-contract" style="color:#7c3aed;"></i><span><strong>Policy integration</strong> — Embed cooling in NDCs, NCAPs, and national budgets; support regional harmonisation of standards.</span></div>
          <div class="pledge-theme"><i class="fa-solid fa-coins" style="color:#b45309;"></i><span><strong>Finance & capacity</strong> — Mobilise public and private finance for sustainable cooling in developing economies; build technician and regulatory capacity.</span></div>
        </div>
        <a href="https://coolcoalition.org/global-cooling-pledge/commitments" target="_blank" rel="noopener noreferrer" class="pledge-commitments-link">
          <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;"></i>
          View the full list of 14 commitments on the Cool Coalition website
        </a>
      </div>

      <!-- ── Key policy documents ── -->
      <p class="ns-subhead-label">Key Policy Documents</p>
      <div class="policy-explainer-grid">
        <div class="policy-explainer-card">
          <div class="policy-explainer-icon"><i class="fa-solid fa-file-contract" style="color:#0369a1;"></i></div>
          <div>
            <strong>NDCs (Nationally Determined Contributions)</strong>
            <p>Under the Paris Agreement, countries submit NDCs outlining their climate targets and actions. Cooling-specific mentions in NDCs signal government recognition of the sector's importance. NDC 3.0s — the current submission round — are a key moment to embed concrete cooling efficiency requirements.</p>
          </div>
        </div>
        <div class="policy-explainer-card">
          <div class="policy-explainer-icon"><i class="fa-solid fa-map" style="color:#0369a1;"></i></div>
          <div>
            <strong>NCAPs (National Cooling Action Plans)</strong>
            <p>NCAPs are comprehensive national strategies addressing sustainable cooling across sectors — from energy efficiency standards and refrigerant management to access for vulnerable populations. They are the primary bridge between high-level pledges and on-the-ground implementation.</p>
          </div>
        </div>
        <div class="policy-explainer-card">
          <div class="policy-explainer-icon"><i class="fa-solid fa-clipboard-list" style="color:#0369a1;"></i></div>
          <div>
            <strong>KIPs (Kigali Implementation Plans)</strong>
            <p>KIPs are national plans detailing how Article 5 countries will implement their Kigali Amendment commitments to phase down HFC refrigerants, including timelines, financing, and technology transition pathways. Tracked in detail under Pillar 3.</p>
          </div>
        </div>
      </div>

      <div class="policy-counters">
        {#each policyStats as stat, i}
          <div class="policy-counter-wrapper" style="transition-delay: {200 + i * 100}ms">
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

    <!-- ═══ Section 2: WHERE THINGS STAND ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="ns-eyebrow">Where Things Stand</span>
      <h2 class="ns-title">Cooling Policy: From Pledges to Implementation</h2>
      <p class="ns-body">The Global Cooling Watch 2025 reports that 134 countries reference cooling in their national climate strategies — a broad signal of awareness. Of those, 74 have gone further by formally signing the Global Cooling Pledge, and 37 of those 74 signatories explicitly include cooling in their NDCs. Yet only 54 countries have enforceable regulations covering the three critical areas: passive cooling, high-efficiency standards (MEPS), and refrigerant transitions.</p>
      <p class="ns-body">NDC 3.0s — the latest round of updated climate commitments — are currently being submitted. Very few contain specific AC efficiency requirements, exposing a significant gap between political intent and policy depth.</p>
      <p class="ns-body">As of 2026, ~25 countries have finalised or are developing National Cooling Action Plans (NCAPs) — dedicated roadmaps that bridge high-level pledges and ground-level enforcement. Regional harmonisation efforts, such as ASEAN and ECOWAS efficiency standards, are also accelerating the transition beyond individual national efforts.</p>
      <p class="ns-body">Targeted climate finance from the Montreal Protocol's Multilateral Fund and the Green Climate Fund is helping close the gap between planning and implementation across developing economies.</p>
      <div class="policy-layers">
        <div class="policy-layer">
          <div class="policy-layer-badge commitment">Commitment</div>
          <div class="policy-layer-content">
            <strong>Pledge signatures · Kigali ratification · NDC mentions</strong>
            <p>Countries signal intent through international agreements and updated climate plans.</p>
          </div>
        </div>
        <div class="policy-layer-arrow"><i class="fa-solid fa-arrow-down"></i></div>
        <div class="policy-layer">
          <div class="policy-layer-badge planning">Planning</div>
          <div class="policy-layer-content">
            <strong>NCAPs · National strategies · Roadmaps</strong>
            <p>Dedicated national plans translate pledges into sector-specific targets and timelines.</p>
          </div>
        </div>
        <div class="policy-layer-arrow"><i class="fa-solid fa-arrow-down"></i></div>
        <div class="policy-layer">
          <div class="policy-layer-badge implementation">Implementation</div>
          <div class="policy-layer-content">
            <strong>Standards · Market transition · Finance · Refrigerant phase-down</strong>
            <p>On-the-ground enforcement and financing close the gap between plans and outcomes. Full implementation tracking lives in Pillars 2–3.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- DATA: Policy Maps & Charts -->
    <div class="card-panel map-card">
      <div class="card-header" style="border-bottom: none;">
        <div class="card-title">
          <i class="fa-solid fa-scale-balanced"></i>
          National Plans & Commitments Status by Country
        </div>
        <span class="viewing-pill">Viewing: <strong id="policy-viewing">Global</strong></span>
      </div>
      <!-- TABS: GCP → NDC → NCAP (Kigali is in Kigali pillar) -->
      <div class="policy-tabs">
        <button class="tab-btn policy-map-tab active" data-map="gcp" type="button">Global Cooling Pledge</button>
        <button class="tab-btn policy-map-tab" data-map="ndc" type="button">NDC Cooling Mentions</button>
        <button class="tab-btn policy-map-tab" data-map="NCAP" type="button">NCAP</button>
      </div>
      <div class="filters-help" style="font-size: 0.8rem; color: #0369a1; margin: 0.75rem 0; padding: 0.5rem 0 0.5rem 0.75rem; background: transparent; border-left: 3px solid #0369a1;">
        <i class="fa-solid fa-sliders" style="margin-right: 0.5rem;"></i>
        <strong>Switch tabs</strong> to explore different policy frameworks: GCP signatories, NDC cooling mentions, or National Cooling Action Plans.
      </div>
      <!-- NDC Filters -->
      <div class="policy-filters" id="policy-ndc-filters">
        <div class="filter-row" style="gap: 1rem;">
          <div class="filter-group">
            <label class="filter-label" for="policy-ndc-type">NDC Version</label>
            <select id="policy-ndc-type" class="filter-select">
              <!-- Options populated dynamically -->
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label" for="policy-ndc-category">Category</label>
            <select id="policy-ndc-category" class="filter-select">
              <!-- Options populated dynamically -->
            </select>
          </div>
        </div>
      </div>
      <!-- NDC-only source attribution — shown only when NDC tab is active -->
      <div id="ndc-clasp-source" style="display:none; align-items:center; gap:0.5rem; padding:0.45rem 0.75rem; background:#f0fdf4; border-left:3px solid #2D7D5A; border-radius:0 6px 6px 0; margin-bottom:0.5rem;">
        <span style="font-size:0.72rem; color:#334155; font-weight:500;">NDC data source:</span>
        <a href="https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/" target="_blank" rel="noopener noreferrer"
          style="display:inline-flex; align-items:center; gap:0.35rem; text-decoration:none; color:#0369a1; font-size:0.72rem; font-weight:600;">
          <img src="/images/clasp-logo.png" alt="CLASP" style="height:14px; width:auto; object-fit:contain; opacity:0.85;" />
          <span>CLASP NDC Appliance Efficiency Toolkit</span>
          <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.5rem; opacity:0.7;"></i>
        </a>
      </div>
      <p class="chart-hint">Hover over a country to see its pledge status, NDC cooling mentions, and NCAP progress. Click a country to explore details.</p>
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
    </div>

    <div class="country-card-inline" id="policy-country-detail">
      <div class="country-detail">
        <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #0369a1; margin-bottom: 0.75rem; display: block;"></i>
          <h4 style="color: #0369a1; margin-bottom: 0.5rem;">Select a Country</h4>
          <p style="font-size: 0.85rem;">Click on any country in the map above to view policy framework details including GCP, NDC, and NCAP status.</p>
        </div>
      </div>
    </div>

    <div class="charts-section" style="padding-top: 1.25rem;">
      <div id="policy-charts-container"></div>
    </div>

    <!-- ═══ Section 3: THE WAY FORWARD ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="ns-eyebrow">The Way Forward</span>
      <h2 class="ns-title">Turning Signals into Action</h2>
      <p class="ns-body">Effective cooling policy has transitioned from a secondary concern to a pillar of essential health and climate infrastructure, defined by three critical hallmarks: integrated governance that aligns Montreal Protocol refrigerant phase-downs with Paris Agreement NDCs, enforceable standards that mandate "passive-first" design and high-efficiency inverter technology, and a commitment to radical equity that prioritises affordable, nature-based cooling for the 1.2 billion people most vulnerable to extreme heat.</p>
      <p class="ns-body">Moving beyond voluntary pledges, the gold standard in 2026 is an enforceable National Cooling Action Plan (NCAP) that bridges the implementation gap by unifying building codes, energy standards, and refrigerant management into a single, funded roadmap. This dashboard tracks that structural integrity, mapping the journey from high-level political signals to the rigorous, multi-pillar regulations required to ensure global cooling is both sustainable and fast enough to matter.</p>

      <div class="policy-pledge-badge">
        <div class="pledge-icon"><i class="fa-solid fa-handshake-angle"></i></div>
        <div class="pledge-content">
          <strong>Global Cooling Pledge Alignment</strong>
          <span>
            {globalCoolingPledge.signatoryCountries} nations &middot;
            {globalCoolingPledge.countriesIncludingCoolingInNDCs} include cooling in NDCs &middot;
            {globalCoolingPledge.countriesWithMEPS} have MEPS &middot;
            {globalCoolingPledge.countriesWithBuildingCodes} have building codes
          </span>
        </div>
        <a href={globalCoolingPledge.progressReportUrl} target="_blank" rel="noopener noreferrer" class="pledge-link">Progress Report</a>
      </div>

      <div class="policy-cooling-watch-link">
        <i class="fa-solid fa-arrow-up-right-from-square" style="color: #0369a1; margin-right: 0.4rem;"></i>
        For the latest analysis of cooling policy commitments and implementation, see the Cool Coalition's
        <a href="https://www.coolcoalition.org/global-cooling-watch/" target="_blank" rel="noopener noreferrer"><strong>Cooling Watch Report</strong></a> ↗
      </div>

      <div class="policy-registry-note">
        <i class="fa-solid fa-circle-info" style="color: #0369a1; margin-right: 0.4rem;"></i>
        To view a country's full NDC, visit the
        <a href="https://unfccc.int/NDCREG" target="_blank" rel="noopener noreferrer"><strong>UNFCCC NDC Registry</strong></a>.
        NCAPs are tracked with the help of
        <a href="https://app.climatepolicyradar.org" target="_blank" rel="noopener noreferrer"><strong>Climate Policy Radar</strong></a> ↗
        and can also be found on the
        <a href="https://www.coolcoalition.org/ncap/" target="_blank" rel="noopener noreferrer"><strong>Cool Coalition NCAP tracker</strong></a>.
      </div>
      <p class="ns-body" style="margin-top:1rem;">Ultimately, the effectiveness of the cooling transition depends on policy coherence — ensuring that NDCs, NCAPs, Kigali Amendment compliance, and the wider Global Cooling Pledge commitments function as a unified system rather than parallel tracks. For full signatory progress against all 14 Global Cooling Pledge commitments, refer to the <a href="https://www.coolcoalition.org/global-cooling-pledge/" target="_blank" rel="noopener noreferrer" style="color:#0369a1;font-weight:600;border-bottom:1px solid rgba(3,105,161,0.3);text-decoration:none;">Global Cooling Pledge progress tracker</a>.</p>
    </div>

    <!-- ═══ KEY STATS BAR ═══ -->
    <div class="chapter-card ns-stat-bar" class:revealed>
      <div class="ns-stat-item">
        <span class="ns-stat-num">74</span>
        <span class="ns-stat-label">countries signed the Global Cooling Pledge</span>
      </div>
      <div class="ns-stat-divider"></div>
      <div class="ns-stat-item">
        <span class="ns-stat-num">134</span>
        <span class="ns-stat-label">countries reference cooling in national climate strategies (GCW 2025)</span>
      </div>
      <div class="ns-stat-divider"></div>
      <div class="ns-stat-item">
        <span class="ns-stat-num">54</span>
        <span class="ns-stat-label">countries have enforceable cooling regulations</span>
      </div>
    </div>

    <!-- ═══ RESOURCES ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="ns-eyebrow">Go Deeper</span>
      <h2 class="ns-title">Resources on Cooling Policy</h2>

      <div class="ns-resource-grid">
        <a href="https://www.unep.org/resources/report/global-cooling-watch-2025" target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>UNEP Global Cooling Watch 2025</strong>
          <p>Outlines the "Sustainable Cooling Pathway" delivering 64% reduction in sector emissions by 2050. Advocates for treating cooling as essential infrastructure.</p>
        </a>
        <a href="https://www.unep.org/resources/toolkits-manuals-and-guides/sustainable-cooling-policy-toolkit" target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>UNEP Sustainable Cooling Policy Toolkit 2026</strong>
          <p>Maps interventions across refrigerant management, energy efficiency, passive cooling, and cross-cutting policies.</p>
        </a>
        <a href="https://www.iea.org/reports/energy-efficiency-policy-toolkit-2025" target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>IEA Energy Efficiency Policy Toolkit 2025</strong>
          <p>How-to for implementing MEPS and labelling schemes, including quality infrastructure requirements.</p>
        </a>
        <a href="https://www.ccacoalition.org/resources/guidance-sustainable-cooling-enhanced-ndcs" target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>CCAC: Guidance on Sustainable Cooling for Enhanced NDCs</strong>
          <p>Roadmap for integrating Lifecycle Refrigerant Management into economy-wide climate targets for NDC 3.0.</p>
        </a>
        <a href="https://www.unep.org/resources/report/national-cooling-action-plan-methodology" target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>National Cooling Action Plan Methodology</strong>
          <p>Framework for governments to move from pledges to implementation, adapted for High-Ambient-Temperature regions.</p>
        </a>
        <a href={globalCoolingPledge.progressReportUrl} target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>Global Cooling Pledge Progress Report 2025</strong>
          <p>Accountability document providing overview of how 74 signatory countries are translating promises into policy.</p>
        </a>
        <a href="https://www.undp.org/publications/summary-national-cooling-action-plans" target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>UNDP: Summary of National Cooling Action Plans</strong>
          <p>Comparative analysis of how different nations structure cooling strategies and align NDCs into actionable roadmaps.</p>
        </a>
        <a href="https://www.green-cooling-initiative.org/ndcs" target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>Green Cooling Initiative: NDC Publications</strong>
          <p>Modular toolkits and sectoral guides to help countries quantify the mitigation potential of their cooling sectors.</p>
        </a>
        <a href="https://wedocs.unep.org/handle/20.500.11822/42705" target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>NDCs &amp; Cooling: A Guide for Practitioners</strong>
          <p>UNEP guide on integrating cooling into Nationally Determined Contributions, covering methodology and best practices.</p>
        </a>
        <a href="https://www.ifc.org/content/dam/ifc/doc/mgrt/cooler-finance.pdf" target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>Cooler Finance</strong>
          <p>IFC report on financing sustainable cooling — tools, mechanisms, and investment opportunities for the cooling sector.</p>
        </a>
        <a href="https://www.seforall.org/publications/national-cooling-action-plan-methodology" target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>NCAP Methodology for MENA</strong>
          <p>Methodological guidance for developing National Cooling Action Plans, with a focus on the MENA region.</p>
        </a>
        <a href="https://openknowledge.worldbank.org/handle/10986/37038" target="_blank" rel="noopener noreferrer" class="ns-resource-card">
          <strong>World Bank Urban Heat Handbook</strong>
          <p>Guidance for city planners on managing urban heat islands and integrating cooling into urban development strategies.</p>
        </a>
      </div>

      <div class="policy-partner-bar">
        <div class="policy-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="policy-partner-title">Data Sources</span>
        </div>
        <div class="policy-partner-logos">
          {#each policyPartners as partner (partner.id)}
            <a href={partner.coolingUrl} target="_blank" rel="noopener noreferrer" class="policy-partner-logo" title={partner.fullName}>
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>

      <div class="policy-source-footer">
        Sources:
        <a href="https://coolcoalition.org/global-cooling-pledge/" target="_blank" rel="noopener noreferrer">Cool Coalition</a>
        &middot;
        <a href="https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016" target="_blank" rel="noopener noreferrer">UNEP Ozone Secretariat</a>
        &middot;
        <a href="https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/" target="_blank" rel="noopener noreferrer">CLASP NDC Toolkit</a>
        &middot;
        <a href="https://www.climatepolicyradar.org/" target="_blank" rel="noopener noreferrer">Climate Policy Radar</a>
        &middot;
        <a href="/methodology">Methodology</a>
      </div>
    </div>

  </div>
</section>

<style>
  /* Reduce chapter-card padding for the policy pillar to close large gaps */
  :global(#view-policy .chapter-card) {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  /* ===========================
     NARRATIVE SYSTEM (design system tokens)
     =========================== */

  /* Eyebrow label */
  .ns-eyebrow {
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #0369a1;
    display: inline-block;
    margin-bottom: 16px;
  }

  /* Section title h2 */
  .ns-title {
    font-size: 2.2rem;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.025em;
    margin: 0 0 12px;
    line-height: 1.15;
  }

  /* Body paragraph */
  .ns-body {
    font-size: 1rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.78;
    margin: 0 0 16px;
    max-width: 100%;
  }

  /* Stat bar */
  .ns-stat-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 40px 48px !important;
    flex-wrap: wrap;
  }

  .ns-stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex: 1;
    min-width: 160px;
    padding: 0 24px;
  }

  .ns-stat-num {
    font-size: 2.6rem;
    font-weight: 900;
    color: #0369a1;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 8px;
  }

  .ns-stat-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #475569;
    line-height: 1.4;
  }

  .ns-stat-divider {
    width: 1px;
    height: 56px;
    background: rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  /* Resource grid */
  .ns-resource-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin: 0 0 32px;
  }

  .ns-resource-card {
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 0;
    padding: 24px 0;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ns-resource-card:hover strong {
    color: #0284c7;
  }

  .ns-resource-card strong {
    font-size: 0.9rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.3;
  }

  .ns-resource-card p {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.6;
    margin: 0;
  }

  /* ===========================
     POLICY EXPLAINER CARDS
     =========================== */
  .policy-explainer-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  .policy-explainer-card {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 24px 0;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 0;
  }

  .policy-explainer-card:hover {
    opacity: 0.85;
  }

  .policy-explainer-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .policy-explainer-card strong {
    display: block;
    font-size: 0.88rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.35rem;
  }

  .policy-explainer-card p {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.6;
    margin: 0;
  }

  /* ===========================
     PLEDGE FEATURED BLOCK
     =========================== */
  .pledge-featured {
    background: #f0f7ff;
    border: 1px solid #bae0ff;
    border-left: 4px solid #0369a1;
    border-radius: 8px;
    padding: 1.5rem 1.75rem;
    margin-bottom: 1.75rem;
  }

  .pledge-featured-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.9rem;
  }

  .pledge-featured-icon {
    font-size: 1.6rem;
    color: #0369a1;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .pledge-featured-meta strong {
    display: block;
    font-size: 1.05rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 0.3rem;
  }

  .pledge-featured-stats {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    color: #0369a1;
    font-weight: 600;
  }

  .pledge-stat-sep {
    color: #93c5fd;
  }

  .pledge-featured-body {
    font-size: 0.9rem;
    color: #1e293b;
    line-height: 1.7;
    margin: 0 0 1rem;
  }

  .pledge-themes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
    margin-bottom: 1.25rem;
  }

  .pledge-theme {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    font-size: 0.82rem;
    color: #334155;
    line-height: 1.5;
  }

  .pledge-theme i {
    flex-shrink: 0;
    margin-top: 0.15rem;
    width: 1rem;
    text-align: center;
  }

  .pledge-commitments-link {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: #0369a1;
    text-decoration: none;
    border-bottom: 1px solid rgba(3,105,161,0.3);
    padding-bottom: 1px;
    transition: border-color 0.15s;
  }

  .pledge-commitments-link:hover {
    border-color: #0369a1;
  }

  .ns-subhead-label {
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #64748b;
    margin: 0 0 0.5rem;
  }

  /* ===========================
     COUNTERS
     =========================== */
  .policy-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 0 1rem;
  }

  .policy-counter-wrapper {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .revealed .policy-counter-wrapper { opacity: 1; transform: translateY(0); }

  .policy-counters :global(.counter-card) {
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-radius: 0;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: unset;
    padding: 1rem 0;
  }

  .policy-counters :global(.counter-card:hover) {
    background: transparent;
    transform: none;
    box-shadow: none;
  }

  .policy-counters :global(.counter-display) { font-size: 1.8rem; color: #0369a1; }
  .policy-counters :global(.counter-label) { font-size: 0.72rem; color: #0369a1; }
  .policy-counters :global(.counter-tooltip) { background: #0f172a !important; color: #ffffff !important; z-index: 99999; box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3); opacity: 1 !important; -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }

  /* ===========================
     PLEDGE BADGE
     =========================== */
  .policy-pledge-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 0;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 0;
    margin: 1rem 0;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s;
  }

  .revealed .policy-pledge-badge { opacity: 1; transform: translateY(0); }

  .pledge-icon { font-size: 1.2rem; color: #0369a1; flex-shrink: 0; }
  .pledge-content { flex: 1; min-width: 0; }
  .pledge-content strong { display: block; font-size: 0.82rem; color: #0369a1; margin-bottom: 0.2rem; }
  .pledge-content span { font-size: 0.75rem; color: #475569; }

  .pledge-link {
    font-size: 0.75rem;
    font-weight: 600;
    color: #0369a1;
    text-decoration: none;
    white-space: nowrap;
    border-bottom: 1px dashed rgba(3, 105, 161, 0.4);
    transition: color 0.2s;
  }

  .pledge-link:hover { color: #0c4a6e; }

  /* ===========================
     COOLING WATCH / REGISTRY LINKS
     =========================== */
  .policy-cooling-watch-link {
    font-size: 0.88rem;
    color: #475569;
    line-height: 1.65;
    margin: 0.75rem 0 0.5rem;
    padding: 0.7rem 0 0.7rem 1rem;
    background: transparent;
    border-radius: 0;
    border-left: 3px solid #0369a1;
  }

  .policy-cooling-watch-link a {
    color: #0369a1;
    text-decoration: none;
    border-bottom: 1px solid rgba(3, 105, 161, 0.3);
    transition: color 0.2s;
  }

  .policy-cooling-watch-link a:hover { color: #0c4a6e; }

  .policy-registry-note {
    font-size: 0.85rem;
    color: #475569;
    line-height: 1.65;
    margin: 0.5rem 0 0;
    padding: 0.65rem 0 0.65rem 1rem;
    background: transparent;
    border-radius: 0;
    border-left: 3px solid rgba(0, 0, 0, 0.12);
  }

  .policy-registry-note a {
    color: #0369a1;
    text-decoration: none;
    border-bottom: 1px solid rgba(3, 105, 161, 0.25);
    transition: color 0.2s;
  }

  .policy-registry-note a:hover { color: #0c4a6e; }

  /* ===========================
     PARTNER BAR
     =========================== */
  .policy-partner-bar {
    padding: 1rem 0 0.75rem;
    margin: 1rem 0 0.75rem;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
  }

  .revealed .policy-partner-bar { opacity: 1; transform: translateY(0); }

  .policy-partner-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.6rem; }
  .policy-partner-header > i { color: #0369a1; font-size: 0.8rem; }
  .policy-partner-title { font-size: 0.78rem; font-weight: 700; color: #334155; }

  .policy-partner-logos { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }

  .policy-partner-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
    transition: opacity 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
  }

  .policy-partner-logo:hover { opacity: 1; transform: translateY(-2px); }
  .policy-partner-logo img { max-width: 80px; max-height: 32px; object-fit: contain; }

  /* ===========================
     SOURCE FOOTER
     =========================== */
  .policy-source-footer {
    text-align: center;
    font-size: 0.68rem;
    color: #94a3b8;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    opacity: 0;
    transition: opacity 0.6s ease 1.1s;
  }

  .revealed .policy-source-footer { opacity: 1; }

  .policy-source-footer a {
    color: #64748b;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .policy-source-footer a:hover { color: #0369a1; border-bottom-color: #0369a1; }
  .policy-source-footer a:last-child { color: #0369a1; font-weight: 600; }

  /* ===========================
     CHART ELEMENTS
     =========================== */
  .chart-hint {
    font-size: 0.78rem;
    color: #6b7280;
    margin: 0 0 8px 0;
    font-style: italic;
  }

  .policy-charts-flat {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    padding: 1.25rem 0;
    background: transparent;
  }

  .policy-chart-item { padding: 0; }

  /* Chart card design tokens (consistent with other pillars)
     These use :global because the elements are injected via innerHTML */
  :global(.p-chart-eyebrow) {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #0369a1;
    margin: 0 0 6px;
    display: block;
  }

  :global(.p-chart-title) {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px;
    line-height: 1.3;
  }

  :global(.p-chart-subtitle) {
    font-size: 0.78rem;
    color: #334155;
    font-weight: 600;
    margin: 0 0 0.6rem;
    line-height: 1.4;
  }

  /* Legacy h3 fallback */
  .policy-chart-item h3 {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.25rem;
  }

  .policy-chart-item .chart-subtitle {
    font-size: 0.78rem;
    color: #334155;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  /* ===========================
     COUNTRY DETAIL STATUS BOXES
     =========================== */
  .policy-status-box {
    text-align: center;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  /* ===========================
     WIDTH ALIGNMENT (64px margin system)
     =========================== */
  .card-panel {
    padding-left: 64px;
    padding-right: 64px;
  }

  .country-card-inline {
    padding-left: 64px;
    padding-right: 64px;
  }

  .charts-section {
    padding-left: 64px;
    padding-right: 64px;
  }

  /* ===========================
     RESPONSIVE
     =========================== */
  @media (max-width: 1024px) {
    .policy-counters { grid-template-columns: repeat(2, 1fr); }
    .policy-explainer-grid { grid-template-columns: 1fr; }
    .ns-resource-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .card-panel { padding-left: 24px; padding-right: 24px; }
    .country-card-inline { padding-left: 24px; padding-right: 24px; }
    .charts-section { padding-left: 24px; padding-right: 24px; }
    .policy-counters { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    .policy-counters :global(.counter-display) { font-size: 1.4rem; }
    .policy-partner-logos { gap: 1rem; }
    .policy-partner-logo img { max-width: 60px; max-height: 26px; }
    .policy-pledge-badge { flex-direction: column; text-align: center; gap: 0.5rem; }
    .ns-stat-bar { padding: 28px 24px !important; }
    .ns-stat-num { font-size: 2rem; }
    .ns-stat-divider { width: 100%; height: 1px; margin: 12px 0; }
  }

  @media (max-width: 600px) {
    .policy-counters { grid-template-columns: 1fr 1fr; }
    .policy-counters :global(.counter-card) { min-height: 85px; padding: 0.75rem 0.5rem; }
    .policy-counters :global(.counter-display) { font-size: 1.2rem; }
    .policy-counters :global(.counter-label) { font-size: 0.65rem; }
    .ns-title { font-size: 1.6rem; }
    .ns-resource-grid { grid-template-columns: 1fr; }
    .ns-resource-card { padding: 20px; }
    .pledge-themes { grid-template-columns: 1fr; }
    .pledge-featured-stats { flex-direction: column; align-items: flex-start; gap: 0.2rem; }
    .pledge-stat-sep { display: none; }
  }
</style>

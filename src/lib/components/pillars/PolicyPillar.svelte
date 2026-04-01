<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { VIEW_META } from '$lib/components/shared/config';
  import AnimatedCounter from '$lib/components/hero/AnimatedCounter.svelte';
  import { pillarContent } from '$lib/data/pillar-content';
  import { partners, globalCoolingPledge } from '$lib/data/partner-data';
  import PillarHeader from '$lib/components/shared/PillarHeader.svelte';
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

  const meta = VIEW_META.policy;
  const policyContent = pillarContent.policy;

  // Animated stat cards
  const policyStats = [
    {
      value: '172',
      label: 'Kigali Amendment parties',
      context: '172 countries have ratified the Kigali Amendment to the Montreal Protocol, creating a legally binding framework to phase down HFCs by over 80%. Source: UN Treaty Collection (Feb 2026).'
    },
    {
      value: '71',
      label: 'Global Cooling Pledge nations',
      context: '71 countries signed the Global Cooling Pledge at COP28 in Dubai, December 2023. 49 have MEPS, 37 include cooling in their NDCs.'
    },
    {
      value: '<30%',
      label: 'NDCs mention cooling',
      context: 'Fewer than 30% of all NDCs explicitly mention cooling, refrigerants, or the Kigali Amendment. The policy gap between awareness and integration remains significant.'
    },
    {
      value: '~20',
      label: 'NCAPs completed or in development',
      context: 'Roughly 20 countries have completed or are developing National Cooling Action Plans. These dedicated roadmaps link efficiency, refrigerant transition, and access goals.'
    }
  ];

  // Chart highlights
  const chartHighlights = [
    {
      icon: 'fa-file-contract',
      title: 'Kigali & GCP Status',
      description: 'Track ratification and pledge commitments by country',
      color: '#2D7D5A'
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

  // Policy pillar partners: CCC → UNFCCC → CLASP NDC → Climate Policy Radar → HEAT (last)
  const policyPartnerIds = ['ccc', 'cool-coalition', 'clasp', 'climate-policy-radar', 'heat'];
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
      let ndcType = 'NDC 3.0';
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

      const axisLabelStyle = { color: '#475569' };
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
        if (status === 'No NDC submitted') return '#E07868';
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
              record.mention_status === 'Not mentioned' ? '#D4A843' : '#E07868';
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
            Status: <span style="color: ${isParty ? '#6BADA0' : '#E07868'}">${isParty ? 'Ratified' : 'Not Ratified'}</span><br>
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
              Status: <span style="color: #E07868">No NCAP</span><br>
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
            <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #2D7D5A; margin-bottom: 0.75rem; display: block;"></i>
            <h4 style="color: #2D7D5A; margin-bottom: 0.5rem;">Select a Country</h4>
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
          <div style="background: #3D6B6B; color: #fff; border-radius: 8px 8px 0 0; padding: 0.5rem 0.75rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700;">
            <i class="fa-solid fa-location-dot" style="font-size: 0.9rem;"></i>
            ${country.country_name || code}
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 0.6rem;">
            <div class="policy-status-box" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.25rem;padding:0.75rem;border-radius:8px;border:1px solid ${hasGCP ? '#6BADA0' : '#e2e8f0'}; background: ${hasGCP ? '#f0faf6' : '#f8fafc'};">
              <i class="fa-solid fa-handshake" style="color: ${hasGCP ? '#6BADA0' : '#94a3b8'}; font-size: 1.5rem;"></i>
              <div style="font-weight: 700; color: ${hasGCP ? '#4A9088' : '#64748b'};">GCP</div>
              <div style="font-size: 0.75rem; color: #64748b;">${hasGCP ? 'Signatory' : 'Not signed'}</div>
            </div>
            <div class="policy-status-box" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.25rem;padding:0.75rem;border-radius:8px;border:1px solid ${ndcBorder}; background: ${ndcBg};">
              <i class="fa-solid fa-file-lines" style="color: ${ndcIcon}; font-size: 1.5rem;"></i>
              <div style="font-weight: 700; color: ${ndcTitle};">NDC</div>
              <div style="font-size: 0.75rem; color: #64748b;">${ndcLabel}</div>
            </div>
            <div class="policy-status-box" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.25rem;padding:0.75rem;border-radius:8px;border:1px solid ${hasNcap ? '#5A8FC2' : '#e2e8f0'}; background: ${hasNcap ? '#f0f0f7' : '#f8fafc'};">
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
            <div class="legend-item"><div class="legend-color" style="background:#E07868"></div>Not Ratified</div>
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
            <div class="legend-item"><div class="legend-color" style="background:#E07868"></div>No NDC Submitted</div>
            <div class="legend-item"><div class="legend-color" style="background:#E5E1D8"></div>No Data</div>
          `;
        } else if (mapType === 'NCAP') {
          legendEl.innerHTML = `
            <div class="legend-item"><div class="legend-color" style="background:#6BADA0"></div>Has NCAP</div>
            <div class="legend-item"><div class="legend-color" style="background:#E07868"></div>No NCAP</div>
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
              return kRec.kigali_party === 1 ? '#6BADA0' : '#E07868';
            } else if (mapType === 'gcp') {
              const pledgeRec = pledge.find((p: any) => p.country_code === code);
              if (!pledgeRec) return '#E5E1D8';
              return pledgeRec.signatory === 1 ? '#6BADA0' : '#e5e7eb';
            } else if (mapType === 'ndc') {
              const countryStatus = getCountryNDCStatus();
              const status = countryStatus[code];
              return getNDCColor(status ? status.status : null);
            } else if (mapType === 'NCAP') {
              const ncapCountry = ncap.find((n: any) => n.country_code === code);
              return ncapCountry ? '#6BADA0' : '#E07868';
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
          const types = [...new Set(ndcTracker.map((n: any) => n.ndc_type).filter(Boolean))].sort() as string[];
          types.forEach((type: string) => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type === 'Other' ? 'Previous NDC' : type;
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
              { value: nonParties, name: 'Not Ratified', itemStyle: { color: '#E07868' } }
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
            { name: 'Not Ratified', type: 'bar', stack: 'total', data: regionData.map(r => r.notRatified), itemStyle: { color: '#E07868' } }
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
          const nonSignatories = pledge.filter((p: any) => regionCodes.includes(p.country_code) && p.signatory !== 1).length;
          return { region, signatories, nonSignatories };
        }).sort((a, b) => b.signatories - a.signatories);

        setChart('chart-gcp-by-region', {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params: any) {
              const region = params[0].name;
              let html = `<strong>${region}</strong><br/>`;
              params.forEach((p: any) => { html += `${p.marker} ${p.seriesName}: <strong>${p.value}</strong><br/>`; });
              return html;
            }
          },
          legend: { bottom: 0, textStyle: { color: '#475569', fontSize: 11 } },
          grid: { left: '3%', right: '4%', bottom: '12%', top: '5%', containLabel: true },
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
              stack: 'total',
              data: gcpByRegion.map(r => r.signatories),
              itemStyle: { color: '#6BADA0', borderRadius: [0, 0, 0, 0] },
              label: { show: true, position: 'inside', color: '#fff', fontSize: 10, formatter: (p: any) => p.value > 0 ? String(p.value) : '' }
            },
            {
              name: 'Non-Signatories',
              type: 'bar',
              stack: 'total',
              data: gcpByRegion.map(r => r.nonSignatories),
              itemStyle: { color: '#E07868', borderRadius: [0, 4, 4, 0] },
              label: { show: true, position: 'inside', color: '#7f1d1d', fontSize: 10, formatter: (p: any) => p.value > 0 ? String(p.value) : '' }
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
        const notMentionedCounts = ndcCategories.map(cat =>
          ndcTracker.filter((n: any) => n.ndc_type === ndcType && n.category === cat && n.mention_status === 'Not mentioned').length
        );

        const ndcVersionLabel = ndcType === 'NDC 3.0' ? '(NDC 3.0)' : '(NDC 2.0)';
        setChart('chart-ndc-categories', {
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
            { name: `Mentioned ${ndcVersionLabel}`, type: 'bar', stack: 'total', data: mentionedCounts, itemStyle: { color: '#6BADA0', borderRadius: [0, 0, 0, 0] }, label: { show: true, position: 'inside', color: '#fff', fontSize: 10, formatter: (p: any) => p.value > 0 ? String(p.value) : '' } },
            { name: `Not Mentioned ${ndcVersionLabel}`, type: 'bar', stack: 'total', data: notMentionedCounts, itemStyle: { color: '#E07868', borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'inside', color: '#fff', fontSize: 10, formatter: (p: any) => p.value > 0 ? String(p.value) : '' } }
          ]
        });

        const ndcRegions = [...new Set(ndcTracker.map((n: any) => n.continent).filter(Boolean))] as string[];
        const regionMentioned = ndcRegions.map(region =>
          ndcTracker.filter((n: any) => n.ndc_type === ndcType && n.category === ndcCategory && n.continent === region && n.mention_value === 1).length
        );

        setChart('chart-ndc-regions', {
          tooltip: { trigger: 'axis' },
          legend: { bottom: 0, textStyle: { color: '#475569', fontSize: 11 } },
          grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
          xAxis: categoryAxis(ndcRegions),
          yAxis: valueAxis(),
          series: [{ name: `Countries mentioning ${ndcCategory}`, type: 'bar', data: regionMentioned, itemStyle: { color: '#6BADA0' } }]
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

        const submittedCount = new Set(ndcTracker.filter((n: any) => n.ndc_type === 'NDC 3.0' && n.mention_status !== 'No NDC submitted').map((n: any) => n.country_code)).size;
        const notSubmittedCount = new Set(ndcTracker.filter((n: any) => n.ndc_type === 'NDC 3.0' && n.mention_status === 'No NDC submitted').map((n: any) => n.country_code)).size;

        setChart('chart-ndc-submission', {
          tooltip: { trigger: 'item' },
          legend: { bottom: 0, textStyle: { color: '#475569', fontSize: 11 } },
          series: [{
            name: 'NDC 3.0 Status', type: 'pie', radius: ['35%', '60%'], center: ['50%', '45%'],
            data: [
              { value: submittedCount, name: 'NDC 3.0 Submitted', itemStyle: { color: '#6BADA0' } },
              { value: notSubmittedCount, name: 'Not Submitted', itemStyle: { color: '#E07868' } }
            ]
          }]
        });
      }

      function updateNCAPCharts() {
        const ncapRegions = [...new Set(countries.map((c: any) => c.region).filter(Boolean))] as string[];
        const ncapByRegion = ncapRegions.map(region => {
          const regionCountryCodes = countries.filter((c: any) => c.region === region).map((c: any) => c.country_code);
          return ncap.filter((n: any) => regionCountryCodes.includes(n.country_code)).length;
        });

        setChart('chart-ncap-regions', {
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '3%', bottom: '15%', top: '8%', containLabel: true },
          xAxis: categoryAxis(ncapRegions),
          yAxis: valueAxis(),
          series: [{ name: 'Countries with NCAP', type: 'bar', data: ncapByRegion, itemStyle: { color: '#5A8FC2' } }]
        });

        const ncapYears = ncap.map((n: any) => n.year).filter((y: any): y is number => y !== null && y !== undefined).sort((a: number, b: number) => a - b);
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
          const sortedNcap = [...ncap].sort((a: any, b: any) => a.country_name.localeCompare(b.country_name));
          listEl.innerHTML = sortedNcap.map((n: any) => `
            <div class="ncap-country-card" style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 8px; padding: 0.75rem; border-left: 3px solid #5A8FC2;">
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

        if (mapType === 'kigali') {
          const kigaliParties = kigali.filter((k: any) => k.kigali_party === 1).length;
          container.innerHTML = `
            <div class="policy-charts-flat">
              <div class="policy-chart-item">
                <h3><i class="fa-solid fa-chart-pie" style="color:#2D7D5A;margin-right:0.5rem;"></i>Kigali Amendment Status</h3>
                <p class="chart-subtitle">${kigaliParties} of ${kigali.length} countries ratified</p>
                <div id="chart-kigali-status" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
              <div class="policy-chart-item">
                <h3><i class="fa-solid fa-earth-americas" style="color:#2D7D5A;margin-right:0.5rem;"></i>Kigali Ratification by Region</h3>
                <p class="chart-subtitle">Regional breakdown of parties</p>
                <div id="chart-kigali-regions" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
              <div class="policy-chart-item">
                <h3><i class="fa-solid fa-users-rectangle" style="color:#2D7D5A;margin-right:0.5rem;"></i>Parties by Group Type</h3>
                <p class="chart-subtitle">Article 5 Group 1, Group 2, Non-Article 5</p>
                <div id="chart-kigali-groups" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
              <div class="policy-chart-item">
                <h3><i class="fa-solid fa-layer-group" style="color:#2D7D5A;margin-right:0.5rem;"></i>Treaty Coverage</h3>
                <p class="chart-subtitle">Montreal Protocol vs Kigali Amendment</p>
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
              <div class="policy-chart-item">
                <h3><i class="fa-solid fa-handshake" style="color:#2D7D5A;margin-right:0.5rem;"></i>GCP Signatories by Region</h3>
                <p class="chart-subtitle">${gcpSignatoryCount} countries have signed the Global Cooling Pledge — breakdown by world region</p>
                <div id="chart-gcp-by-region" class="chart-surface" style="width:100%;height:320px;min-height:320px;"></div>
              </div>
            </div>
          `;
          requestAnimationFrame(() => {
            renderGCPProgressCharts();
            requestAnimationFrame(forceResizePolicyCharts);
          });

        } else if (mapType === 'ndc') {
          container.innerHTML = `
            <div class="policy-charts-flat">
              <div class="policy-chart-item">
                <h3><i class="fa-solid fa-tags" style="color:#2D7D5A;margin-right:0.5rem;"></i>NDC Cooling Mentions by Category</h3>
                <p class="chart-subtitle">Excluding Kigali Amendment</p>
                <div id="chart-ndc-categories" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
              <div class="policy-chart-item">
                <h3><i class="fa-solid fa-earth-americas" style="color:#2D7D5A;margin-right:0.5rem;"></i>NDC Status by Region</h3>
                <p class="chart-subtitle">Countries mentioning cooling</p>
                <div id="chart-ndc-regions" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
              <div class="policy-chart-item">
                <h3><i class="fa-solid fa-code-compare" style="color:#6BADA0;margin-right:0.5rem;"></i>NDC 3.0 vs Previous NDC</h3>
                <p class="chart-subtitle">Comparison of cooling mentions</p>
                <div id="chart-ndc-comparison" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
              <div class="policy-chart-item">
                <h3><i class="fa-solid fa-file-circle-check" style="color:#6BADA0;margin-right:0.5rem;"></i>NDC Submission Status</h3>
                <p class="chart-subtitle">Countries by submission status</p>
                <div id="chart-ndc-submission" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
            </div>
          `;
          requestAnimationFrame(() => {
            updateNDCCharts();
            requestAnimationFrame(forceResizePolicyCharts);
          });

        } else if (mapType === 'NCAP') {
          container.innerHTML = `
            <div class="policy-charts-flat">
              <div class="policy-chart-item">
                <h3><i class="fa-solid fa-chart-bar" style="color:#5A8FC2;margin-right:0.5rem;"></i>NCAPs by Region</h3>
                <p class="chart-subtitle">Countries with National Cooling Action Plans</p>
                <div id="chart-ncap-regions" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
              <div class="policy-chart-item">
                <h3><i class="fa-solid fa-clock-rotate-left" style="color:#5A8FC2;margin-right:0.5rem;"></i>NCAP Development Timeline</h3>
                <p class="chart-subtitle">NCAPs by year of adoption</p>
                <div id="chart-ncap-timeline" class="chart-surface" style="width:100%;height:280px;min-height:280px;"></div>
              </div>
            </div>
            <div class="policy-charts-flat" style="margin-top:0;">
              <div class="policy-chart-item" style="grid-column: 1 / -1;">
                <h3><i class="fa-solid fa-list-check" style="color:#6BADA0;margin-right:0.5rem;"></i>Countries with NCAPs</h3>
                <p class="chart-subtitle">List of countries that have developed National Cooling Action Plans</p>
                <div id="ncap-countries-list" class="ncap-countries-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem;padding:0.5rem 0;"></div>
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
            if (statusTitle) statusTitle.textContent = 'Policy Framework Analysis';
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
              return pledgeRec.signatory === 1 ? '#6BADA0' : '#E07868';
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
    <!-- Pillar Header -->
    <PillarHeader
      pillarId="policy"
      headline={meta.headline}
      subhead={meta.subhead}
      entryStat={policyContent.entryStat ?? ''}
      onInfo={onPillarInfoClick}
    />

    <!-- Story Card -->
    <div class="card-panel policy-story-card" class:revealed>

      <!-- GCP intro — plain language, before data -->
      <div class="policy-gcp-intro">
        <div class="policy-gcp-intro-header">
          <div class="policy-gcp-intro-icon"><i class="fa-solid fa-handshake-angle"></i></div>
          <div>
            <strong>The Global Cooling Pledge</strong> — the most important high-level political signal on cooling to date.
          </div>
        </div>
        <p>Launched at COP28 in Dubai in December 2023, the Global Cooling Pledge is a voluntary commitment by national governments to act on cooling across three areas: energy efficiency of cooling equipment, refrigerant transition, and sustainable cooling access for vulnerable populations. As of 2026, 71 countries have signed.</p>
        <p>The pledge matters because cooling has historically been invisible in climate policy. A signature here is a signal that a country intends to include cooling in its national climate strategy — through NDCs, National Cooling Action Plans, or domestic legislation. The data below tracks how far countries are turning that signal into action.</p>
        <div class="policy-framework-row">
          <div class="policy-framework-item">
            <i class="fa-solid fa-handshake"></i>
            <strong>Global Cooling Pledge</strong>
            <span>High-level political commitment (COP28)</span>
          </div>
          <i class="fa-solid fa-arrow-right policy-framework-arrow"></i>
          <div class="policy-framework-item">
            <i class="fa-solid fa-file-contract"></i>
            <strong>NDCs</strong>
            <span>Legally binding national climate targets</span>
          </div>
          <i class="fa-solid fa-arrow-right policy-framework-arrow"></i>
          <div class="policy-framework-item">
            <i class="fa-solid fa-map"></i>
            <strong>NCAPs</strong>
            <span>National Cooling Action Plans — roadmaps</span>
          </div>
        </div>
      </div>

      <!-- Story hook -->
      <p class="policy-story-hook">{policyContent.storyHook}</p>

      <!-- Animated stat cards -->
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

      <!-- Key narrative -->
      <div class="policy-narrative">
        <h3 class="policy-narrative-title">
          <i class="fa-solid fa-scale-balanced"></i>
          The Policy Puzzle
        </h3>
        <p>{policyContent.keyNarrative}</p>
      </div>

      <!-- Chart highlights -->
      <div class="policy-chart-highlights">
        <h3 class="policy-highlights-title">
          <i class="fa-solid fa-chart-simple"></i>
          What the Data Shows
        </h3>
        <div class="policy-highlights-grid">
          {#each chartHighlights as highlight}
            <div class="policy-highlight-card">
              <div class="policy-highlight-icon" style="color: {highlight.color}">
                <i class="fa-solid {highlight.icon}"></i>
              </div>
              <div class="policy-highlight-text">
                <strong>{highlight.title}</strong>
                <span>{highlight.description}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Cooling Pledge Badge -->
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

      <!-- Partner logos bar -->
      <div class="policy-partner-bar">
        <div class="policy-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="policy-partner-title">Data Partners</span>
        </div>
        <div class="policy-partner-logos">
          {#each policyPartners as partner (partner.id)}
            <a
              href={partner.coolingUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="policy-partner-logo"
              title={partner.fullName}
            >
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>

      <!-- Source attribution -->
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


    <!-- Map Card with Tabs -->
    <div class="card-panel map-card">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-scale-balanced"></i>
          Policy Framework Status by Country
        </div>
        <span class="viewing-pill">Viewing: <strong id="policy-viewing">Global</strong></span>
      </div>
      <!-- TABS: GCP → NDC → NCAP (Kigali is in Kigali pillar) -->
      <div class="policy-tabs">
        <button class="tab-btn policy-map-tab active" data-map="gcp" type="button">Global Cooling Pledge</button>
        <button class="tab-btn policy-map-tab" data-map="ndc" type="button">NDC Cooling Mentions</button>
        <button class="tab-btn policy-map-tab" data-map="NCAP" type="button">NCAP</button>
      </div>
      <div class="filters-help" style="font-size: 0.8rem; color: #2D7D5A; margin: 0.75rem 0; padding: 0.5rem 0.75rem; background: #F5FAFA; border-radius: 8px; border-left: 3px solid #2D7D5A;">
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

    <!-- Country Detail -->
    <div class="country-card-inline" id="policy-country-detail">
      <div class="country-detail">
        <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #2D7D5A; margin-bottom: 0.75rem; display: block;"></i>
          <h4 style="color: #2D7D5A; margin-bottom: 0.5rem;">Select a Country</h4>
          <p style="font-size: 0.85rem;">Click on any country in the map above to view policy framework details including GCP, NDC, and NCAP status.</p>
        </div>
      </div>
    </div>

    <!-- Filter Status Bar (always visible) -->
    <div class="filter-status-bar policy-theme" id="policy-filter-bar">
      <div class="status-title">
        <i class="fa-solid fa-file-signature"></i>
        <span id="policy-status-title">Policy Framework Analysis</span>
      </div>
      <div class="status-filters">
        <span class="filter-tag" id="policy-filter-tab"><i class="fa-solid fa-file-contract"></i> Global Cooling Pledge</span>
        <span class="filter-tag" id="policy-filter-region"><i class="fa-solid fa-earth-americas"></i> All Regions</span>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section" style="background: #ffffff; padding: 1.25rem; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
      <div id="policy-charts-container"></div>
    </div>

    <!-- Source Attribution -->
    <div style="text-align: center; padding: 0.75rem; font-size: 0.7rem; color: #94a3b8;">
      Sources:
      <a href="https://coolcoalition.org/global-cooling-pledge/" target="_blank" rel="noopener noreferrer" style="color: #64748b;">Cool Coalition</a>
      &middot;
      <a href="https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016" target="_blank" rel="noopener noreferrer" style="color: #64748b;">UNEP Ozone Secretariat</a>
      &middot;
      <a href="https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/" target="_blank" rel="noopener noreferrer" style="color: #64748b;">CLASP NDC Toolkit</a>
      &middot;
      <a href="https://www.climatepolicyradar.org/" target="_blank" rel="noopener noreferrer" style="color: #64748b;">Climate Policy Radar</a>
      &middot;
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer" style="color: #64748b;">HEAT GmbH</a>
      &middot;
      <a href="/methodology" style="color: #2D7D5A; font-weight: 600;">Methodology</a>
    </div>
  </div>
</section>

<style>
  /* ===========================
     POLICY STORY CARD
     Green accent (policy/governance identity).
     =========================== */
  .policy-story-card {
    border-left: 4px solid #2D7D5A;
    padding: 1.75rem;
    position: relative;
    overflow: visible;
  }

  .policy-story-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(45, 125, 90, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .policy-story-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .policy-story-text { flex: 1; min-width: 0; }

  .policy-headline {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 0 0 0.4rem;
    letter-spacing: -0.01em;
  }

  .policy-subhead {
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
  }

  /* GCP intro block */
  .policy-gcp-intro {
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    padding: 1rem 1.25rem;
    margin: 0 0 1.25rem;
  }

  .policy-gcp-intro-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .policy-gcp-intro-header i {
    color: #5A8FC2;
    font-size: 1.1rem;
  }

  .policy-gcp-intro-header strong {
    font-size: 0.9rem;
    color: #1e293b;
  }

  .policy-gcp-intro p {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    margin: 0 0 0.6rem;
  }

  .policy-gcp-intro p:last-of-type {
    margin-bottom: 0.75rem;
  }

  .policy-framework-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .policy-framework-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: #fff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 0.35rem 0.65rem;
    font-size: 0.78rem;
    color: #334155;
    font-weight: 500;
  }

  .policy-framework-item i {
    color: #5A8FC2;
    font-size: 0.8rem;
  }

  .policy-framework-arrow {
    color: #94a3b8;
    font-size: 0.75rem;
  }

  .policy-story-hook {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    margin: 0 0 1.25rem;
    padding: 0.75rem 1rem;
    background: #f0f7f0;
    border-radius: 10px;
    border-left: 3px solid #2D7D5A;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
  }

  .revealed .policy-story-hook { opacity: 1; transform: translateY(0); }

  /* Counters */
  .policy-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  .policy-counter-wrapper {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .revealed .policy-counter-wrapper { opacity: 1; transform: translateY(0); }

  .policy-counters :global(.counter-card) {
    background: linear-gradient(135deg, #f0f7f0 0%, #f0f7f0 100%);
    border: 1px solid rgba(45, 125, 90, 0.15);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: 100px;
    padding: 1rem 0.75rem;
  }

  .policy-counters :global(.counter-card:hover) {
    background: linear-gradient(135deg, #C8E8C4 0%, #f0f7f0 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(45, 125, 90, 0.12);
  }

  .policy-counters :global(.counter-display) { font-size: 1.8rem; color: #2D7D5A; }
  .policy-counters :global(.counter-label) { font-size: 0.72rem; color: #2D7D5A; }
  .policy-counters :global(.counter-tooltip) { background: #0f172a !important; color: #ffffff !important; z-index: 99999; box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3); opacity: 1 !important; -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }

  /* Narrative */
  .policy-narrative {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
  }

  .revealed .policy-narrative { opacity: 1; transform: translateY(0); }

  .policy-narrative-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #2D7D5A;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .policy-narrative-title i { color: #2D7D5A; font-size: 0.85rem; }

  .policy-narrative p {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.7;
    margin: 0;
  }

  /* Chart highlights */
  .policy-chart-highlights {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s;
  }

  .revealed .policy-chart-highlights { opacity: 1; transform: translateY(0); }

  .policy-highlights-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #2D7D5A;
    margin: 0 0 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .policy-highlights-title i { color: #2D7D5A; font-size: 0.85rem; }

  .policy-highlights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .policy-highlight-card {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem;
    background: #fafbfc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .policy-highlight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .policy-highlight-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.1rem; }
  .policy-highlight-text { display: flex; flex-direction: column; gap: 0.15rem; }
  .policy-highlight-text strong { font-size: 0.78rem; font-weight: 700; color: #0f172a; }
  .policy-highlight-text span { font-size: 0.72rem; color: #64748b; line-height: 1.4; }

  /* Pledge badge */
  .policy-pledge-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #f0f7f0, #f0f7f0);
    border: 1px solid #6BADA0;
    border-radius: 12px;
    margin: 0 0 1rem;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s;
  }

  .revealed .policy-pledge-badge { opacity: 1; transform: translateY(0); }

  .pledge-icon { font-size: 1.2rem; color: #2D7D5A; flex-shrink: 0; }
  .pledge-content { flex: 1; min-width: 0; }
  .pledge-content strong { display: block; font-size: 0.78rem; color: #2D7D5A; margin-bottom: 0.15rem; }
  .pledge-content span { font-size: 0.72rem; color: #4ade80; }

  .pledge-link {
    font-size: 0.72rem;
    font-weight: 600;
    color: #2D7D5A;
    text-decoration: none;
    white-space: nowrap;
    border-bottom: 1px dashed #6BADA0;
    transition: color 0.2s;
  }

  .pledge-link:hover { color: #2D7D5A; }

  /* Partner bar */
  .policy-partner-bar {
    padding: 0.75rem 0;
    margin: 0 0 0.75rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
  }

  .revealed .policy-partner-bar { opacity: 1; transform: translateY(0); }

  .policy-partner-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.6rem; }
  .policy-partner-header > i { color: #2D7D5A; font-size: 0.8rem; }
  .policy-partner-title { font-size: 0.78rem; font-weight: 700; color: #333; }

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

  /* Source footer */
  .policy-source-footer {
    text-align: center;
    font-size: 0.68rem;
    color: #94a3b8;
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
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

  .policy-source-footer a:hover { color: #2D7D5A; border-bottom-color: #2D7D5A; }
  .policy-source-footer a:last-child { color: #2D7D5A; font-weight: 600; }

  /* KPI panel */
  .kpi-panel { padding: 1rem 1.25rem; }

  /* Flat chart layout */
  .policy-charts-flat {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    padding: 1.25rem;
    background: #ffffff;
  }

  .policy-chart-item {
    padding: 0;
  }

  .policy-chart-item h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #2D7D5A;
    margin-bottom: 0.25rem;
  }

  .policy-chart-item .chart-subtitle {
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  /* Country detail status boxes */
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

  /* Responsive */
  @media (max-width: 1024px) {
    .policy-counters { grid-template-columns: repeat(2, 1fr); }
    .policy-highlights-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .policy-story-card { padding: 1.25rem; }
    .policy-headline { font-size: 1.1rem; }
    .policy-story-header { flex-direction: column; gap: 0.5rem; }
    .policy-counters { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    .policy-counters :global(.counter-display) { font-size: 1.4rem; }
    .policy-partner-logos { gap: 1rem; }
    .policy-partner-logo img { max-width: 60px; max-height: 26px; }
    .policy-pledge-badge { flex-direction: column; text-align: center; gap: 0.5rem; }
  }

  @media (max-width: 600px) {
    .policy-counters { grid-template-columns: 1fr 1fr; }
    .policy-counters :global(.counter-card) { min-height: 85px; padding: 0.75rem 0.5rem; }
    .policy-counters :global(.counter-display) { font-size: 1.2rem; }
    .policy-counters :global(.counter-label) { font-size: 0.65rem; }
  }
</style>

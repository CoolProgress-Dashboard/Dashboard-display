<script lang="ts">
  import { onMount } from 'svelte';
  import PillarHeader from '$lib/components/shared/PillarHeader.svelte';
  import { loadJraiaRegionalData } from '$lib/services/dashboard-data';
  import { SUPABASE_URL, SUPABASE_KEY } from '$lib/components/shared/config';
  import { CAT, SEQ, CHROME } from '$lib/components/shared/colors';
  import type { JraiaRegionalRecord } from '$lib/services/dashboard-types';

  export let active = true;
  export let onPillarInfoClick: (() => void) | null = null;

  // Reference GWP100 values (IPCC AR6) used to derive average GWP from the JRAIA classes
  const GWP_REF = [
    { code: 'R-22', cls: 'HCFC', gwp: 1960 },
    { code: 'R-410A', cls: 'HFC', gwp: 2256 },
    { code: 'R-32', cls: 'A2L', gwp: 771 },
    { code: 'R-290', cls: 'reference only', gwp: 0.02 },
  ];

  // JRAIA regions in alphabetical order (display order is never a ranking)
  const REGIONS: { code: string; label: string; note?: string }[] = [
    { code: 'AFR',          label: 'Africa' },
    { code: 'ASIA_EX_JPCN', label: 'Rest of Asia',
      note: 'JRAIA reports this region as "Asia (excl. Japan/China)": the Asian markets other than Japan and China, combined. JRAIA does not list the countries. Japan and China have their own cards.' },
    { code: 'CHN',          label: 'China',
      note: "Context: China's room AC efficiency standard (MEPS) GB 21455-2019 (SAMR) took effect on 1 July 2020. The timing coincides with the rise; this chart alone does not show that the MEPS caused it. Other public sources (e.g. IIR) report different China figures." },
    { code: 'EUR',          label: 'Europe' },
    { code: 'JPN',          label: 'Japan' },
    { code: 'LAC',          label: 'Latin America' },
    { code: 'MEA',          label: 'Middle East' },
    { code: 'NAM',          label: 'North America' },
    { code: 'OCE',          label: 'Oceania' },
  ];
  const regionLabel = (code: string) => REGIONS.find(r => r.code === code)?.label ?? code;

  // Refrigerant classes as JRAIA reports them; "≈" names follow the average GWP mapping
  const CLASSES = [
    { key: 'hcfc_pct',   name: 'HCFC ≈ R-22 (GWP 1,960)',            color: CAT[3] },
    { key: 'hfc_pct',    name: 'HFC excl. A2L ≈ R-410A (GWP 2,256)', color: CAT[2] },
    { key: 'a2l_pct',    name: 'A2L ≈ R-32 (GWP 771)',               color: CAT[0] },
    { key: 'others_pct', name: 'Others',                            color: CAT[5] },
  ] as const;
  type ClassKey = (typeof CLASSES)[number]['key'];
  type Shares = Record<ClassKey, number>;

  const INVERTER = CAT[0];
  const FIXED = SEQ[2];
  const AVG_GWP = CAT[4];
  const SOURCE = 'JRAIA, Estimates of World Air Conditioner Demand: Inverter rate and Refrigerant use by type (RAC split-type).';

  let rows: JraiaRegionalRecord[] = [];
  let loading = true;
  let revealed = false;

  // 2025 is a JRAIA estimate and lacks North America; held back until the actual values are published.
  const LAST_YEAR = 2024;
  $: inScope = rows.filter(r => r.year <= LAST_YEAR);
  $: published = inScope.filter(r => r.is_published);
  const row = (code: string, year: number) => published.find(r => r.region_code === code && r.year === year);
  const num = (v: number | null | undefined) => (v == null ? null : Number(v));
  const isEst = (r: { units_value_kind: string | null }) => r.units_value_kind === 'estimate';
  const yearLabel = (r: JraiaRegionalRecord) => (isEst(r) ? `${r.year}\n(estimate)` : String(r.year));
  const fmt = (n: number | null | undefined, d = 0) =>
    n == null ? 'n/a' : n.toLocaleString('en-GB', { maximumFractionDigits: d, minimumFractionDigits: d });
  // A blank class share in a published row means 0 (e.g. Japan HFC)
  const sharesOf = (r: JraiaRegionalRecord): Shares =>
    Object.fromEntries(CLASSES.map(c => [c.key, Number(r[c.key] ?? 0)])) as Shares;
  const complete = (r: JraiaRegionalRecord | undefined) =>
    !!r && r.avg_gwp_ar6 != null && r.inverter_pct != null && r.region_ac_demand_thousand_units != null;

  // ── GLOBAL: same regions every year, weighted by JRAIA regional AC demand ─────
  // Objective: a funder sees how the published JRAIA market moved year on year, on a like for like basis.
  // Misread: not world coverage (Africa and Latin America are not published); class to gas mapping is approximate.
  // Proof: JRAIA RAC split-type shares, weights = JRAIA regional AC demand; IPCC AR6 GWP100.
  // Regions = those complete in the first refrigerant year; years = years in which all of them are complete.
  $: gwpYears = [...new Set(published.filter(r => r.avg_gwp_ar6 != null).map(r => r.year))].sort((a, b) => a - b);
  $: gRegions = gwpYears.length ? published.filter(r => r.year === gwpYears[0] && complete(r)).map(r => r.region_code) : [];
  $: gYears = gwpYears.filter(y => gRegions.every(c => complete(row(c, y))));
  $: gDropped = gwpYears.filter(y => !gYears.includes(y));

  function weighted(regions: string[], year: number, key: ClassKey | 'avg_gwp_ar6' | 'inverter_pct'): number {
    const rs = regions.map(c => row(c, year)!);
    const w = rs.reduce((s, r) => s + Number(r.region_ac_demand_thousand_units), 0);
    return rs.reduce((s, r) => s + Number(r[key] ?? 0) * Number(r.region_ac_demand_thousand_units), 0) / w;
  }
  $: global = gYears.map(y => ({
    year: y,
    inverter: weighted(gRegions, y, 'inverter_pct'),
    gwp: weighted(gRegions, y, 'avg_gwp_ar6'),
    shares: Object.fromEntries(CLASSES.map(c => [c.key, weighted(gRegions, y, c.key)])) as Shares,
  }));
  $: gFirst = global[0];
  $: gLast = global[global.length - 1];
  const pctChange = (a: number, b: number) => ((Math.round(b) - Math.round(a)) / Math.round(a)) * 100;
  $: gGwpChange = gFirst && gLast ? pctChange(gFirst.gwp, gLast.gwp) : null;
  // Describe a flat inverter series as a range, not as a rise or fall
  $: gInvPhrase = (() => {
    if (!gFirst || !gLast) return '';
    const v = global.map(g => Math.round(g.inverter));
    const d = v[v.length - 1] - v[0];
    if (Math.abs(d) < 3) return `inverter share stayed between ${Math.min(...v)}% and ${Math.max(...v)}%`;
    return `inverter share ${d > 0 ? 'rose' : 'fell'} from ${v[0]}% to ${v[v.length - 1]}%`;
  })();

  // ── REGION BY REGION: each region on its own, both topics ─────────────────
  // Objective: show how each region moved over time, without comparing regions in one chart.
  // Misread: regions are not ranked (alphabetical); gaps are not zeros; 2025 (JRAIA estimate) is held back.
  // Proof: JRAIA RAC split-type shares for that region only.
  $: regionData = REGIONS.map(r => {
    const inv = published.filter(x => x.region_code === r.code && x.inverter_pct != null).sort((a, b) => a.year - b.year);
    const mix = published.filter(x => x.region_code === r.code && x.a2l_pct != null).sort((a, b) => a.year - b.year);
    const invAct = inv.filter(x => !isEst(x));
    const mixAct = mix.filter(x => !isEst(x) && x.avg_gwp_ar6 != null);
    const missing = inScope.filter(x => x.region_code === r.code && !x.is_published).map(x => x.year).sort((a, b) => a - b);
    const editions = [...new Set([...inv, ...mix].map(x => x.source_edition).filter(Boolean))];
    return {
      ...r, inv, mix, missing, editions,
      invFrom: invAct[0], invTo: invAct[invAct.length - 1],
      gwpFrom: mixAct[0], gwpTo: mixAct[mixAct.length - 1],
    };
  });
  type RegionData = (typeof regionData)[number];
  $: shown = regionData.filter(r => r.inv.length || r.mix.length);
  $: notShown = regionData.filter(r => !r.inv.length && !r.mix.length);

  // ── ECharts: one instance per chart element via a Svelte action ─────────
  let echartsMod: Promise<any> | null = null;
  function chart(node: HTMLElement, option: any) {
    let inst: any = null;
    let latest = option;
    let ro: ResizeObserver | null = null;
    let gone = false;
    echartsMod ??= import('echarts');
    echartsMod.then(echarts => {
      if (gone) return;
      inst = echarts.init(node);
      inst.setOption(latest);
      ro = new ResizeObserver(() => inst?.resize());
      ro.observe(node);
    });
    return {
      update(o: any) { latest = o; inst?.setOption(o, true); },
      destroy() { gone = true; ro?.disconnect(); inst?.dispose(); },
    };
  }

  const tooltipBase = {
    confine: true, backgroundColor: CHROME.TOOLTIP_BG, borderWidth: 0, textStyle: { color: '#fff', fontSize: 12 },
  };
  const axisCat = (data: string[]) => ({
    type: 'category', data,
    axisLine: { lineStyle: { color: CHROME.AXIS_LINE } }, axisTick: { show: false },
    axisLabel: { color: CHROME.AXIS_LABEL, fontSize: 12, fontWeight: 600, interval: 0 },
  });
  const axisPct = {
    type: 'value', min: 0, max: 100,
    splitLine: { lineStyle: { color: CHROME.SPLIT_LINE } },
    axisLabel: { color: CHROME.AXIS_LABEL, fontSize: 12, formatter: (v: number) => v + '%' },
  };
  const segLabel = (prefix = '', color = '#fff') => ({
    show: true, color, fontSize: 11, fontWeight: 700,
    formatter: (p: any) => (p.value >= 7 ? `${prefix ? prefix + ' ' : ''}${Math.round(p.value)}%` : ''),
  });
  const legend = (names: string[]) => ({
    top: 0, left: 0, data: names, icon: 'roundRect', itemWidth: 12, itemHeight: 8,
    textStyle: { color: CHROME.AXIS_LABEL, fontSize: 11 },
  });
  const dashed = { borderColor: '#0f172a', borderWidth: 1.5, borderType: 'dashed', opacity: 0.85 };
  const swatch = (c: string) => `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:6px;background:${c}"></span>`;

  // Inverter vs fixed speed, stacked to 100%; estimates get a dashed outline
  function inverterOption(points: { label: string; inv: number; est: boolean; note?: string }[]) {
    return {
      tooltip: {
        ...tooltipBase, trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (ps: any[]) => {
          const p = points[ps[0].dataIndex];
          return `<b>${p.label.replace('\n', ' ')}</b><br/>${swatch(INVERTER)}Inverter: <b>${fmt(p.inv)}%</b><br/>${swatch(FIXED)}Fixed speed: <b>${fmt(100 - p.inv)}%</b>`
            + (p.note ? `<br/><span style="color:#94a3b8">${p.note}</span>` : '');
        },
      },
      legend: legend(['Inverter', 'Fixed speed']),
      grid: { left: 4, right: 4, top: 32, bottom: 4, containLabel: true },
      xAxis: axisCat(points.map(p => p.label)),
      yAxis: axisPct,
      series: [
        { name: 'Inverter', type: 'bar', stack: 'inv', barMaxWidth: 46, itemStyle: { color: INVERTER }, label: segLabel(),
          data: points.map(p => ({ value: p.inv, itemStyle: p.est ? dashed : undefined })) },
        { name: 'Fixed speed', type: 'bar', stack: 'inv', barMaxWidth: 46, itemStyle: { color: FIXED }, label: segLabel('', '#0f172a'),
          data: points.map(p => ({ value: 100 - p.inv, itemStyle: p.est ? dashed : undefined })) },
      ],
    };
  }

  // Refrigerant class mix, stacked to 100%
  function mixOption(points: { label: string; shares: Shares; est: boolean; gwp?: number | null }[]) {
    return {
      tooltip: {
        ...tooltipBase, trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (ps: any[]) => {
          const p = points[ps[0].dataIndex];
          return `<b>${p.label.replace('\n', ' ')}</b>` + [...CLASSES].reverse().map(c => `<br/>${swatch(c.color)}${c.name}: <b>${fmt(p.shares[c.key])}%</b>`).join('')
            + (p.gwp != null ? `<br/>Average GWP: <b>${fmt(p.gwp)}</b>` : '');
        },
      },
      legend: legend(CLASSES.map(c => c.name)),
      grid: { left: 4, right: 4, top: 56, bottom: 4, containLabel: true },
      xAxis: axisCat(points.map(p => p.label)),
      yAxis: axisPct,
      series: CLASSES.map(c => ({
        name: c.name, type: 'bar', stack: 'mix', barMaxWidth: 46,
        itemStyle: { color: c.color },
        label: segLabel(),
        data: points.map(p => ({ value: p.shares[c.key], itemStyle: p.est ? dashed : undefined })),
      })),
    };
  }

  function gwpOption(points: { year: number; gwp: number }[], change: number | null) {
    const vals = points.map(p => Math.round(p.gwp));
    return {
      tooltip: {
        ...tooltipBase, trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (ps: any[]) => `<b>${points[ps[0].dataIndex].year}</b><br/>Average GWP100 (AR6): <b>${fmt(ps[0].value)}</b>`,
      },
      grid: { left: 4, right: 4, top: 36, bottom: 4, containLabel: true },
      xAxis: axisCat(points.map(p => String(p.year))),
      yAxis: {
        type: 'value', min: 0, name: 'Average GWP100 (AR6)', nameTextStyle: { color: CHROME.TEXT_SECONDARY, fontSize: 11, align: 'left' },
        splitLine: { lineStyle: { color: CHROME.SPLIT_LINE } }, axisLabel: { color: CHROME.AXIS_LABEL, fontSize: 12, formatter: (v: number) => fmt(v) },
      },
      series: [{
        type: 'bar', barMaxWidth: 46, itemStyle: { color: AVG_GWP, borderRadius: [3, 3, 0, 0] },
        label: { show: true, position: 'insideTop', color: '#fff', fontSize: 12, fontWeight: 800, formatter: (p: any) => fmt(p.value) },
        data: vals,
        markLine: change == null ? undefined : {
          silent: true, symbol: ['none', 'arrow'], lineStyle: { type: 'dashed', color: '#0f172a' },
          label: { position: 'middle', formatter: `${change > 0 ? '+' : ''}${fmt(change, 1)}%`, color: '#0f172a', fontWeight: 800, fontSize: 12, backgroundColor: '#fff', padding: [2, 4] },
          data: [[{ coord: [0, vals[0]] }, { coord: [vals.length - 1, vals[vals.length - 1]] }]],
        },
      }],
    };
  }

  $: gInvOpt = inverterOption(global.map(g => ({ label: String(g.year), inv: g.inverter, est: false })));
  $: gMixOpt = mixOption(global.map(g => ({ label: String(g.year), shares: g.shares, est: false, gwp: g.gwp })));
  $: gGwpOpt = gwpOption(global, gGwpChange);

  const regionInvOpt = (r: RegionData) =>
    inverterOption(r.inv.map(x => ({ label: yearLabel(x), inv: Number(x.inverter_pct), est: isEst(x), note: x.source_edition ?? '' })));
  const regionMixOpt = (r: RegionData) =>
    mixOption(r.mix.map(x => ({ label: yearLabel(x), shares: sharesOf(x), est: isEst(x), gwp: num(x.avg_gwp_ar6) })));

  onMount(() => {
    const t = setTimeout(() => (revealed = true), 150);
    loadJraiaRegionalData(SUPABASE_URL, SUPABASE_KEY).then(r => {
      rows = r;
      loading = false;
    });
    return () => clearTimeout(t);
  });
</script>

<section id="view-progress" class="view-section" class:active>
  <div class="pillar-stack">
    <PillarHeader
      pillarId="progress"
      headline="Is the cooling market moving? Two observed signals from new air conditioner sales."
      subhead="Progress is tracked on what is actually sold, not on modelled scenarios: the share of inverter units and the refrigerant in new split room air conditioners, first across the published regions, then region by region."
      entryStat="Draft for internal review. Public JRAIA data only, not yet cleared for publication."
      onInfo={onPillarInfoClick}
    />

    {#if loading}
      <div class="chapter-card" class:revealed style="border-top: none;">
        <p class="pg-body-text pg-muted"><i class="fa-solid fa-spinner fa-spin"></i> Loading progress data…</p>
      </div>
    {:else}
      <!-- ═══ GLOBAL ═══ -->
      <div class="chapter-card" class:revealed style="border-top: none;">
        <span class="pg-eyebrow">Global, year by year</span>
        <h2 class="pg-section-title">
          {#if gFirst && gLast}
            Across the published regions, {gInvPhrase} and average refrigerant GWP {(gGwpChange ?? 0) <= 0 ? 'fell' : 'rose'} {fmt(Math.abs(gGwpChange ?? 0))}% from {gFirst.year} to {gLast.year}
          {:else}
            Across the published regions
          {/if}
        </h2>
        <p class="pg-body-text">
          All three charts use the same {gRegions.length} regions in every year, weighted by each region's air conditioner demand, so the years compare like for like.
          This is not world coverage: Africa and Latin America are not published by JRAIA.
        </p>
        <span class="pg-scope-badge"><i class="fa-solid fa-wind"></i> Room AC (RAC) split-type sales; {gRegions.length} JRAIA regions, weighted by AC demand</span>

        <div class="pg-chart-grid">
          <div class="pg-chart-card">
            <h3 class="pg-chart-title">Inverter share of new room AC sales</h3>
            <div class="pg-chart" use:chart={gInvOpt}></div>
          </div>
          <div class="pg-chart-card">
            <h3 class="pg-chart-title">Demand weighted average refrigerant GWP</h3>
            <div class="pg-chart" use:chart={gGwpOpt}></div>
          </div>
        </div>
        <div class="pg-chart-grid pg-c3">
          <div class="pg-chart-card">
            <h3 class="pg-chart-title">Refrigerant class share of new room AC sales</h3>
            <div class="pg-chart" use:chart={gMixOpt}></div>
          </div>
          <div class="pg-chart-card pg-ref-card">
            <table class="pg-ref">
              <caption>Reference GWP100 (IPCC AR6)</caption>
              <tbody>
                {#each GWP_REF as g}
                  <tr><th scope="row">{g.code} <span>({g.cls})</span></th><td>{fmt(g.gwp, g.gwp < 1 ? 2 : 0)}</td></tr>
                {/each}
              </tbody>
            </table>
            <p class="pg-foot">
              JRAIA publishes refrigerant classes (A2L, HFC, HCFC, others), not named gases. The "≈" names follow the mapping used to derive
              average GWP. R-290 is shown in the reference table only; JRAIA does not publish an R-290 share.
            </p>
          </div>
        </div>
        <p class="pg-source">
          Source: {SOURCE} {gFirst?.year} to {gLast?.year}; weights = JRAIA regional AC demand (thousand units). GWP reference: IPCC AR6.
          Regions: {gRegions.map(regionLabel).sort().join(', ')}.
          {#each gDropped as y}{y} omitted: {gRegions.filter(c => !complete(row(c, y))).map(regionLabel).join(', ')} not published for {y}. {/each}
          2017 is not included because the 2017 edition gives no regional demand to weight by and does not separate A2L from HFC.
        </p>
      </div>

      <!-- ═══ REGION BY REGION ═══ -->
      <div class="chapter-card" class:revealed>
        <span class="pg-eyebrow">Region by region</span>
        <h2 class="pg-section-title">How each region moved, on its own</h2>
        <p class="pg-body-text">
          Each region has its own charts for inverter share and refrigerant mix. Regions are listed alphabetically and are not compared
          in one chart, because years, coverage and market structure differ.
        </p>
        <nav class="pg-region-nav" aria-label="Jump to region">
          {#each shown as r (r.code)}
            <a href="#region-{r.code}" class="pg-chip">{r.label}</a>
          {/each}
        </nav>
      </div>

      {#each shown as r (r.code)}
        <div class="chapter-card pg-region" id="region-{r.code}" class:revealed>
          <div class="pg-region-head">
            <h2 class="pg-region-title">{r.label}</h2>
            <span class="pg-scope-badge"><i class="fa-solid fa-wind"></i> Room AC (RAC) split-type sales share, {r.label}</span>
          </div>
          <ul class="pg-facts">
            {#if r.invFrom && r.invTo}
              <li>Inverter share: <b>{fmt(num(r.invFrom.inverter_pct))}%</b> in {r.invFrom.year}, <b>{fmt(num(r.invTo.inverter_pct))}%</b> in {r.invTo.year}</li>
            {/if}
            {#if r.gwpFrom && r.gwpTo}
              <li>Average refrigerant GWP: <b>{fmt(num(r.gwpFrom.avg_gwp_ar6))}</b> in {r.gwpFrom.year}, <b>{fmt(num(r.gwpTo.avg_gwp_ar6))}</b> in {r.gwpTo.year}</li>
            {/if}
          </ul>
          <div class="pg-chart-grid">
            <div class="pg-chart-card">
              <h3 class="pg-chart-title">Inverter share of new sales</h3>
              <div class="pg-chart pg-chart-region" use:chart={regionInvOpt(r)}></div>
            </div>
            <div class="pg-chart-card">
              <h3 class="pg-chart-title">Refrigerant class share of new sales</h3>
              <div class="pg-chart pg-chart-region" use:chart={regionMixOpt(r)}></div>
              {#if r.mix.some(x => x.avg_gwp_ar6 != null)}
                <dl class="pg-gwp-strip">
                  <dt>Average GWP</dt>
                  {#each r.mix.filter(x => x.avg_gwp_ar6 != null) as x (x.year)}
                    <dd><span>{x.year}{isEst(x) ? '*' : ''}</span><b>{fmt(num(x.avg_gwp_ar6))}</b></dd>
                  {/each}
                </dl>
              {/if}
            </div>
          </div>
          {#if r.note}<p class="pg-context-note"><i class="fa-solid fa-circle-info"></i> {r.note}</p>{/if}
          <p class="pg-source">
            Source: {SOURCE} Editions: {r.editions.join(', ')}.
            No JRAIA data for 2018 to 2020; those years are left out, not interpolated. The 2017 edition does not separate A2L from HFC, so the refrigerant chart starts in 2021.
            {#if r.missing.length}Not published for {r.missing.join(', ')}.{/if}
            {#if r.mix.some(isEst)}* JRAIA estimate.{/if}
          </p>
        </div>
      {/each}

    {/if}

    <!-- ═══ ABOUT THE DATA ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="pg-eyebrow">About the Data</span>
      <h2 class="pg-section-title">How these numbers are built</h2>
      <div class="pg-notes">
        <div class="pg-note">
          <i class="fa-solid fa-database"></i>
          <div>
            <strong>Source.</strong> JRAIA, <em>Estimates of World Air Conditioner Demand: Inverter rate and Refrigerant use by type</em>
            (editions 2017, July 2024 and August 2026), split room AC column. Latest edition used for each year. Values are JRAIA industry estimates, not government statistics.
          </div>
        </div>
        <div class="pg-note">
          <i class="fa-solid fa-calculator"></i>
          <div>
            <strong>Average GWP is derived.</strong> JRAIA reports refrigerant classes, not individual gases. Each class is given a representative
            refrigerant: A2L as R-32 (771), other HFCs as R-410A (2,256), HCFCs as R-22 (1,960), using IPCC AR6 GWP100. "Others" (2% or less) are excluded and the remaining shares rescaled to 100%.
          </div>
        </div>
        <div class="pg-note">
          <i class="fa-solid fa-scale-balanced"></i>
          <div>
            <strong>Global weighting.</strong> The global figures weight each region by JRAIA total air conditioner demand and use the same regions in every year shown.
            Years where one of those regions is missing are left out rather than compared.
          </div>
        </div>
        <div class="pg-note">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div>
            <strong>Gaps.</strong> JRAIA does not publish these shares for Africa or Latin America, and skipped 2018 to 2020. The 2025 values are JRAIA estimates without North America and are held back until actual values are published.
            Gaps are shown as gaps, never as zero or interpolated values. There is no country level data.
          </div>
        </div>
      </div>
      <p class="pg-disclaimer"><i class="fa-solid fa-lock"></i> Internal draft. JRAIA republication terms have not been confirmed; do not publish.</p>
    </div>
  </div>
</section>

<style>
  /* Tighter section spacing for this pillar (same pattern as MEPS) */
  :global(#view-progress .pillar-stack) { gap: 0; }
  :global(#view-progress .chapter-card) { padding-top: 28px; padding-bottom: 28px; }
  :global(#view-progress .chapter-card.pg-region) { padding-top: 24px; padding-bottom: 24px; }
  @media (max-width: 768px) {
    :global(#view-progress .chapter-card) { padding: 20px 20px; }
  }

  .pg-eyebrow {
    display: inline-block;
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #15803d;
    margin-bottom: 16px;
  }

  .pg-scope-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: #475569;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    padding: 0.2rem 0.6rem;
    margin-bottom: 1rem;
  }
  .pg-scope-badge i { font-size: 0.6rem; color: #64748b; }

  .pg-section-title {
    font-size: 1.9rem;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.025em;
    margin: 0 0 16px;
    line-height: 1.2;
  }

  .pg-body-text {
    font-size: 1rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.7;
    margin: 0 0 12px;
    max-width: 900px;
  }
  .pg-muted { color: #64748b; }

  .pg-foot { font-size: 0.8rem; color: #64748b; margin: 0.6rem 0 0; line-height: 1.5; }
  .pg-source {
    font-size: 0.78rem;
    color: #64748b;
    line-height: 1.55;
    margin: 0.9rem 0 0;
    padding-top: 0.6rem;
    border-top: 1px solid #f1f5f9;
  }

  /* ── Charts ─────────────────────────────────── */
  .pg-chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem; }
  .pg-c3 { grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); }
  .pg-chart-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1rem; min-width: 0; }
  .pg-ref-card { align-self: start; }
  .pg-chart-title { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem; }
  .pg-chart { width: 100%; height: 340px; }
  .pg-chart-region { height: 300px; }

  .pg-ref { border-collapse: collapse; font-size: 0.85rem; }
  .pg-ref caption { text-align: left; font-size: 0.78rem; font-weight: 700; color: #475569; margin-bottom: 0.3rem; }
  .pg-ref th { text-align: left; font-weight: 800; color: #0f172a; padding: 0.3rem 1.5rem 0.3rem 0; border-top: 1px solid #f1f5f9; }
  .pg-ref th span { font-weight: 500; color: #64748b; }
  .pg-ref td { padding: 0.3rem 0; border-top: 1px solid #f1f5f9; font-variant-numeric: tabular-nums; }

  /* ── Region cards ───────────────────────────── */
  .pg-region-nav { display: flex; flex-wrap: wrap; gap: 0.45rem; }
  .pg-chip {
    display: inline-flex; align-items: center;
    font-size: 0.8rem; font-weight: 700; color: #0f172a; text-decoration: none;
    background: #fff; border: 1.5px solid #cbd5e1; border-radius: 999px;
    padding: 0.32rem 0.85rem; transition: border-color 0.2s, color 0.2s;
  }
  .pg-chip:hover, .pg-chip:focus-visible { border-color: #15803d; color: #15803d; }

  .pg-region { scroll-margin-top: 80px; }
  .pg-region-head { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
  .pg-region-head .pg-scope-badge { margin-bottom: 0; }
  .pg-region-title { font-size: 1.5rem; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
  .pg-facts { list-style: none; padding: 0; margin: 0 0 1rem; display: flex; flex-wrap: wrap; gap: 0.4rem 1.75rem; font-size: 0.95rem; color: #1e293b; }
  .pg-facts b { font-variant-numeric: tabular-nums; }

  .pg-gwp-strip {
    display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.3rem 1rem;
    margin: 0.5rem 0 0; padding-top: 0.6rem; border-top: 1px solid #f1f5f9; font-size: 0.8rem;
  }
  .pg-gwp-strip dt { font-weight: 800; color: #475569; }
  .pg-gwp-strip dd { margin: 0; display: inline-flex; gap: 0.3rem; }
  .pg-gwp-strip dd span { color: #64748b; }
  .pg-gwp-strip dd b { color: #0f172a; font-variant-numeric: tabular-nums; }

  .pg-context-note {
    font-size: 0.85rem; color: #334155; line-height: 1.55; margin: 0;
    padding: 0.6rem 0.8rem; background: #f8fafc; border-left: 3px solid #15803d; border-radius: 0 4px 4px 0;
  }
  .pg-context-note i { color: #15803d; margin-right: 0.3rem; }

  /* ── Notes ──────────────────────────────────── */
  .pg-notes { display: flex; flex-direction: column; gap: 0.25rem; }
  .pg-note {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    padding: 0.8rem 0;
    font-size: 0.88rem;
    color: #334155;
    line-height: 1.6;
  }
  .pg-note i {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 6px;
    display: grid;
    place-items: center;
    font-size: 0.75rem;
    color: #15803d;
    background: rgba(21, 128, 61, 0.1);
    margin-top: 0.1rem;
  }

  .pg-disclaimer {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: #64748b;
    font-style: italic;
    margin: 0.75rem 0 0;
    padding: 0.5rem 0.75rem;
    background: #f8fafc;
    border-left: 3px solid #cbd5e1;
    border-radius: 0 4px 4px 0;
  }

  @media (max-width: 900px) {
    .pg-chart-grid, .pg-c3 { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .pg-section-title { font-size: 1.25rem; }
    .pg-region-title { font-size: 1.2rem; }
  }
</style>

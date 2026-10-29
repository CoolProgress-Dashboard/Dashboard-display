<script lang="ts">
  import { onMount } from 'svelte';
  import PillarHeader from '$lib/components/shared/PillarHeader.svelte';
  import { loadJraiaRegionalData } from '$lib/services/dashboard-data';
  import { SUPABASE_URL, SUPABASE_KEY } from '$lib/components/shared/config';
  import { CAT, STATUS, CHROME, NO_DATA } from '$lib/components/shared/colors';
  import type { JraiaRegionalRecord } from '$lib/services/dashboard-types';

  export let active = true;
  export let onPillarInfoClick: (() => void) | null = null;

  // GWP reference points (IPCC AR6 GWP100)
  const GWP_R410A = 2256;
  const GWP_R32 = 771;
  const GWP_LOW = 150;

  // Display order and colours for the JRAIA regions
  const REGIONS: { code: string; label: string; color: string }[] = [
    { code: 'CHN',          label: 'China',                      color: CAT[2] },
    { code: 'ASIA_EX_JPCN', label: 'Asia (excl. Japan, China)',  color: CAT[0] },
    { code: 'MEA',          label: 'Middle East',                color: CAT[3] },
    { code: 'EUR',          label: 'Europe',                     color: CAT[4] },
    { code: 'JPN',          label: 'Japan',                      color: CAT[5] },
    { code: 'NAM',          label: 'North America',              color: '#334155' },
    { code: 'OCE',          label: 'Oceania',                    color: CAT[1] },
    { code: 'LAC',          label: 'Latin America',              color: NO_DATA },
    { code: 'AFR',          label: 'Africa',                     color: NO_DATA },
  ];

  let rows: JraiaRegionalRecord[] = [];
  let loading = true;
  let revealed = false;

  // ── Derived series ──────────────────────────────────────────────
  type GlobalPoint = { year: number; inverter: number | null; gwp: number | null; coverage: number };

  function weighted(yr: number, field: 'inverter_pct' | 'avg_gwp_ar6'): number | null {
    const ys = rows.filter(r => r.year === yr && r.region_ac_demand_thousand_units != null);
    const withVal = ys.filter(r => r[field] != null);
    const w = withVal.reduce((s, r) => s + Number(r.region_ac_demand_thousand_units), 0);
    if (!w) return null;
    return withVal.reduce((s, r) => s + Number(r[field]) * Number(r.region_ac_demand_thousand_units), 0) / w;
  }

  function coverage(yr: number): number {
    const ys = rows.filter(r => r.year === yr && r.region_ac_demand_thousand_units != null);
    const total = ys.reduce((s, r) => s + Number(r.region_ac_demand_thousand_units), 0);
    const pub = ys.filter(r => r.inverter_pct != null).reduce((s, r) => s + Number(r.region_ac_demand_thousand_units), 0);
    return total ? Math.round((pub / total) * 100) : 0;
  }

  $: years = [...new Set(rows.map(r => r.year))].sort((a, b) => a - b);
  $: globalSeries = years
    .filter(y => y >= 2021)
    .map<GlobalPoint>(y => ({ year: y, inverter: weighted(y, 'inverter_pct'), gwp: weighted(y, 'avg_gwp_ar6'), coverage: coverage(y) }));
  $: gFirst = globalSeries[0];
  $: gLast = globalSeries[globalSeries.length - 1];

  type RegionSummary = {
    code: string; label: string; color: string; published: boolean;
    invFirst: { year: number; v: number } | null; invLast: { year: number; v: number } | null;
    gwpFirst: { year: number; v: number } | null; gwpLast: { year: number; v: number } | null;
  };

  function firstLast(code: string, field: 'inverter_pct' | 'avg_gwp_ar6') {
    const s = rows.filter(r => r.region_code === code && r[field] != null).sort((a, b) => a.year - b.year);
    if (!s.length) return [null, null] as const;
    return [{ year: s[0].year, v: Number(s[0][field]) }, { year: s[s.length - 1].year, v: Number(s[s.length - 1][field]) }] as const;
  }

  $: regionSummaries = rows.length
    ? REGIONS.map<RegionSummary>(r => {
        const [invFirst, invLast] = firstLast(r.code, 'inverter_pct');
        const [gwpFirst, gwpLast] = firstLast(r.code, 'avg_gwp_ar6');
        return { ...r, published: invLast != null, invFirst, invLast, gwpFirst, gwpLast };
      })
    : [];

  // GWP bar: fill runs from the all R-410A baseline (left) towards zero (right)
  const gwpFill = (g: number) => Math.max(0, Math.min(100, ((GWP_R410A - g) / GWP_R410A) * 100));
  const gwpPos = (g: number) => gwpFill(g);
  const fmt = (n: number | null | undefined, d = 0) =>
    n == null ? 'n/a' : n.toLocaleString('en-GB', { maximumFractionDigits: d, minimumFractionDigits: d });

  // ── Trend charts (ECharts): grouped bars, one bar per year ─────
  let invChartEl: HTMLElement;
  let gwpChartEl: HTMLElement;
  let charts: any[] = [];

  // Region picker: the user chooses which regions appear as bars (Global optional)
  const GLOBAL_COLOR = '#0f172a';
  $: selectable = [
    { code: 'GLOBAL', label: 'Global (weighted)', color: GLOBAL_COLOR },
    ...REGIONS.filter(r => rows.some(x => x.region_code === r.code && x.inverter_pct != null))
  ];
  let selected: string[] = ['CHN', 'EUR', 'MEA'];
  const toggleRegion = (code: string) =>
    (selected = selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code]);
  const selectAll = () => (selected = selectable.map(r => r.code));
  const selectNone = () => (selected = []);

  const regionLabel = (code: string) =>
    code === 'GLOBAL' ? 'Global (weighted)' : REGIONS.find(r => r.code === code)?.label ?? code;
  const regionColor = (code: string) => (code === 'GLOBAL' ? GLOBAL_COLOR : REGIONS.find(r => r.code === code)?.color ?? GLOBAL_COLOR);

  function valueFor(code: string, year: number, field: 'inverter_pct' | 'avg_gwp_ar6'): number | null {
    if (code === 'GLOBAL') {
      const p = globalSeries.find(g => g.year === year);
      const v = p ? (field === 'avg_gwp_ar6' ? p.gwp : p.inverter) : null;
      return v == null ? null : Math.round(v);
    }
    const v = rows.find(x => x.region_code === code && x.year === year)?.[field];
    return v == null ? null : Number(v);
  }

  // X axis = the years JRAIA published; bars = the regions the user selected
  function barOption(field: 'inverter_pct' | 'avg_gwp_ar6', isGwp: boolean) {
    const codes = selectable.map(r => r.code).filter(c => selected.includes(c));
    const ys = years.filter(y => rows.some(r => r.year === y && r[field] != null));
    const unit = (v: number) => (isGwp ? fmt(v) : `${fmt(v)}%`);
    const delta = (code: string, i: number) => {
      const v = valueFor(code, ys[i], field);
      if (v == null || i === 0) return '';
      const prev = valueFor(code, ys[i - 1], field);
      if (prev == null) return '';
      const d = v - prev;
      const good = isGwp ? d < 0 : d > 0;
      const col = d === 0 ? '#cbd5e1' : good ? '#86efac' : '#fca5a5';
      return ` <span style="color:${col}">${d > 0 ? '+' : ''}${isGwp ? fmt(d) : fmt(d) + ' pts'}</span>`;
    };
    const series: any[] = codes.map(c => ({
      name: regionLabel(c),
      type: 'bar',
      barMaxWidth: 22,
      barGap: '15%',
      itemStyle: { color: regionColor(c), borderRadius: [3, 3, 0, 0] },
      data: ys.map(y => valueFor(c, y, field)),
    }));
    if (isGwp && series.length) {
      series[0].markLine = {
        silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: CHROME.DEMARCATION },
        label: { formatter: 'R-32\n771', color: CHROME.TEXT_SECONDARY, fontSize: 10, position: 'end' },
        data: [{ yAxis: GWP_R32 }]
      };
    }
    return {
      tooltip: {
        trigger: 'axis', confine: true, axisPointer: { type: 'shadow' },
        backgroundColor: CHROME.TOOLTIP_BG, borderWidth: 0, textStyle: { color: '#fff', fontSize: 12 },
        formatter: (params: any[]) => {
          const i = params[0]?.dataIndex ?? 0;
          const head = `<b>${ys[i]}</b>${i > 0 ? ` <span style="color:#94a3b8">change vs ${ys[i - 1]}</span>` : ''}`;
          return head + codes.map(c => {
            const v = valueFor(c, ys[i], field);
            const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:6px;background:${regionColor(c)}"></span>`;
            return `<br/>${dot}${regionLabel(c)}: <b>${v == null ? 'not published' : unit(v)}</b>${delta(c, i)}`;
          }).join('');
        }
      },
      legend: { show: false }, // the region buttons above act as the legend
      grid: { left: 8, right: 44, top: 28, bottom: 8, containLabel: true },
      xAxis: {
        type: 'category', data: ys.map(String),
        axisLine: { lineStyle: { color: CHROME.AXIS_LINE } }, axisTick: { show: false },
        axisLabel: { color: CHROME.AXIS_LABEL, fontSize: 12, fontWeight: 700 }
      },
      yAxis: isGwp
        ? { type: 'value', name: 'Average GWP', min: 0, max: 2400, nameTextStyle: { color: CHROME.TEXT_SECONDARY, fontSize: 11 },
            splitLine: { lineStyle: { color: CHROME.SPLIT_LINE } }, axisLabel: { color: CHROME.AXIS_LABEL, formatter: (v: number) => fmt(v) } }
        : { type: 'value', name: 'Inverter share', min: 0, max: 100, nameTextStyle: { color: CHROME.TEXT_SECONDARY, fontSize: 11 },
            splitLine: { lineStyle: { color: CHROME.SPLIT_LINE } }, axisLabel: { color: CHROME.AXIS_LABEL, formatter: (v: number) => v + '%' } },
      series
    };
  }

  // Region by Region: earliest vs latest published value, Global first
  let regInvEl: HTMLElement;
  let regGwpEl: HTMLElement;
  const EARLY = '#cbd5e1';

  function compareOption(isGwp: boolean) {
    const gFirstPt = globalSeries.find(g => (isGwp ? g.gwp : g.inverter) != null);
    const gLastPt = [...globalSeries].reverse().find(g => (isGwp ? g.gwp : g.inverter) != null);
    const items = [
      { label: 'Global (weighted)',
        first: gFirstPt ? { year: gFirstPt.year, v: Math.round((isGwp ? gFirstPt.gwp : gFirstPt.inverter) as number) } : null,
        last: gLastPt ? { year: gLastPt.year, v: Math.round((isGwp ? gLastPt.gwp : gLastPt.inverter) as number) } : null },
      ...regionSummaries.filter(r => r.published).map(r => ({
        label: r.label,
        first: isGwp ? r.gwpFirst : r.invFirst,
        last: isGwp ? r.gwpLast : r.invLast
      }))
    ].filter(i => i.last).reverse(); // reversed so Global sits at the top of a horizontal chart
    const unit = (v: number) => (isGwp ? fmt(v) : `${fmt(v)}%`);
    const latestColor = isGwp ? CAT[4] : STATUS.ADVANCED;
    return {
      tooltip: {
        trigger: 'axis', confine: true, axisPointer: { type: 'shadow' },
        backgroundColor: CHROME.TOOLTIP_BG, borderWidth: 0, textStyle: { color: '#fff', fontSize: 12 },
        formatter: (params: any[]) => {
          const it = items[params[0]?.dataIndex ?? 0];
          if (!it?.first || !it.last) return '';
          const d = it.last.v - it.first.v;
          const good = isGwp ? d < 0 : d > 0;
          const col = d === 0 ? '#cbd5e1' : good ? '#86efac' : '#fca5a5';
          return `<b>${it.label}</b><br/>${it.first.year}: <b>${unit(it.first.v)}</b><br/>${it.last.year}: <b>${unit(it.last.v)}</b>`
            + `<br/><span style="color:${col}">${d > 0 ? '+' : ''}${isGwp ? fmt(d) : fmt(d) + ' pts'}</span>`;
        }
      },
      legend: { bottom: 0, data: ['Earliest published', 'Latest published'], textStyle: { fontSize: 11, color: CHROME.AXIS_LABEL },
        icon: 'roundRect', itemWidth: 12, itemHeight: 8 },
      grid: { left: 8, right: 44, top: 8, bottom: 36, containLabel: true },
      xAxis: isGwp
        ? { type: 'value', min: 0, max: 2400, splitLine: { lineStyle: { color: CHROME.SPLIT_LINE } }, axisLabel: { color: CHROME.AXIS_LABEL, formatter: (v: number) => fmt(v) } }
        : { type: 'value', min: 0, max: 100, splitLine: { lineStyle: { color: CHROME.SPLIT_LINE } }, axisLabel: { color: CHROME.AXIS_LABEL, formatter: (v: number) => v + '%' } },
      yAxis: {
        type: 'category', data: items.map(i => i.label),
        axisLine: { lineStyle: { color: CHROME.AXIS_LINE } }, axisTick: { show: false },
        axisLabel: {
          color: CHROME.AXIS_LABEL, fontSize: 11,
          formatter: (v: string) => (v.startsWith('Global') ? `{g|${v}}` : v),
          rich: { g: { fontWeight: 800, color: '#0f172a', fontSize: 11 } }
        }
      },
      series: [
        { name: 'Earliest published', type: 'bar', barMaxWidth: 11, barGap: '20%',
          itemStyle: { color: EARLY, borderRadius: [0, 3, 3, 0] },
          data: items.map(i => i.first?.v ?? null) },
        { name: 'Latest published', type: 'bar', barMaxWidth: 11,
          itemStyle: { color: latestColor, borderRadius: [0, 3, 3, 0] },
          label: { show: true, position: 'right', fontSize: 11, fontWeight: 800, color: '#0f172a', formatter: (p: any) => unit(p.value) },
          data: items.map(i => i.last?.v ?? null),
          ...(isGwp ? { markLine: {
            silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: CHROME.DEMARCATION },
            label: { formatter: 'R-32 (771)', color: CHROME.TEXT_SECONDARY, fontSize: 10, position: 'end' },
            data: [{ xAxis: GWP_R32 }]
          } } : {}) }
      ]
    };
  }

  function updateCharts() {
    if (charts.length !== 4) return;
    charts[0].setOption(barOption('inverter_pct', false), true);
    charts[1].setOption(barOption('avg_gwp_ar6', true), true);
    charts[2].setOption(compareOption(false), true);
    charts[3].setOption(compareOption(true), true);
  }
  $: selected, updateCharts();

  async function drawCharts() {
    if (!invChartEl || !gwpChartEl || !regInvEl || !regGwpEl || !rows.length) return;
    const echarts = await import('echarts');
    await new Promise<void>(res => requestAnimationFrame(() => requestAnimationFrame(() => res())));
    charts.forEach(c => c.dispose());
    charts = [invChartEl, gwpChartEl, regInvEl, regGwpEl].map(el => echarts.init(el));
    updateCharts();
  }

  onMount(() => {
    const t = setTimeout(() => (revealed = true), 150);
    loadJraiaRegionalData(SUPABASE_URL, SUPABASE_KEY).then(r => {
      rows = r;
      loading = false;
      drawCharts();
    });
    const obs = new ResizeObserver(() => charts.forEach(c => c.resize()));
    [invChartEl, gwpChartEl, regInvEl, regGwpEl].forEach(el => el && obs.observe(el));
    return () => { clearTimeout(t); obs.disconnect(); charts.forEach(c => c.dispose()); };
  });
</script>

<section id="view-progress" class="view-section" class:active>
  <div class="pillar-stack">
    <PillarHeader
      pillarId="progress"
      headline="Is the cooling market moving? Two observed signals from new air conditioner sales."
      subhead="Progress is tracked on what is actually sold, not on modelled scenarios: the share of inverter units and the average climate impact (GWP) of the refrigerant in new split room air conditioners, region by region."
      entryStat="Draft mockup for internal review. Open data from JRAIA, not yet cleared for publication."
      onInfo={onPillarInfoClick}
    />

    <!-- ═══ THE SCOREBOARD ═══ -->
    <div class="chapter-card" class:revealed style="border-top: none;">
      <div class="pg-eyebrow-row">
        <span class="pg-eyebrow">The Scoreboard</span>
        <span class="pg-scope-badge"><i class="fa-solid fa-wind"></i> Split room ACs</span>
        <span class="pg-scope-badge"><i class="fa-solid fa-earth-americas"></i> Global, sales weighted</span>
      </div>
      <h2 class="pg-section-title">Where new air conditioner sales stand today</h2>

      {#if loading}
        <p class="pg-body-text pg-muted"><i class="fa-solid fa-spinner fa-spin"></i> Loading progress data…</p>
      {:else if gLast}
        <div class="pg-score-grid">
          <!-- Inverter share -->
          <article class="pg-score-card">
            <div class="pg-score-head">
              <span class="pg-score-icon" style="--c:{STATUS.ADVANCED}"><i class="fa-solid fa-gauge-high"></i></span>
              <div>
                <h3 class="pg-score-title">Inverter share of new sales</h3>
                <p class="pg-score-sub">Variable speed units use roughly 25% to 30% less energy than fixed speed models</p>
              </div>
            </div>
            <div class="pg-score-value">
              <span class="pg-big">{fmt(gLast.inverter)}<small>%</small></span>
              <span class="pg-score-year">{gLast.year}</span>
            </div>
            <div class="pg-bar" aria-label="Inverter share {fmt(gLast.inverter)} percent">
              <div class="pg-bar-fill" style="width:{gLast.inverter}%; background:{STATUS.ADVANCED}"></div>
              {#if gFirst && gFirst !== gLast && gFirst.inverter != null}
                <span class="pg-bar-ghost" style="left:{gFirst.inverter}%" title="{gFirst.year}: {fmt(gFirst.inverter)}%"></span>
              {/if}
            </div>
            <div class="pg-bar-scale"><span>0%</span><span>100% inverter</span></div>
            <p class="pg-score-note">
              {#if gFirst && gFirst.inverter != null}
                {fmt(gFirst.inverter)}% in {gFirst.year} (marker). Covers {gLast.coverage}% of world AC demand; Africa and Latin America are not published.
              {/if}
            </p>
          </article>

          <!-- Average GWP -->
          <article class="pg-score-card">
            <div class="pg-score-head">
              <span class="pg-score-icon" style="--c:{CAT[4]}"><i class="fa-solid fa-flask"></i></span>
              <div>
                <h3 class="pg-score-title">Average refrigerant GWP of new sales</h3>
                <p class="pg-score-sub">Lower is better. Moving from R-410A (2,256) towards low GWP options</p>
              </div>
            </div>
            <div class="pg-score-value">
              <span class="pg-big">{fmt(gLast.gwp)}<small> GWP</small></span>
              <span class="pg-score-year">{gLast.year}</span>
            </div>
            <div class="pg-bar pg-bar-gwp" aria-label="Average GWP {fmt(gLast.gwp)}">
              <div class="pg-bar-fill" style="width:{gwpFill(gLast.gwp ?? GWP_R410A)}%; background:{CAT[4]}"></div>
              {#if gFirst && gFirst !== gLast && gFirst.gwp != null}
                <span class="pg-bar-ghost" style="left:{gwpPos(gFirst.gwp)}%" title="{gFirst.year}: {fmt(gFirst.gwp)}"></span>
              {/if}
              <span class="pg-bar-tick" style="left:{gwpPos(GWP_R32)}%"><em>R-32 · 771</em></span>
              <span class="pg-bar-zone" style="width:{100 - gwpPos(GWP_LOW)}%"></span>
            </div>
            <div class="pg-bar-scale"><span>2,256 · all R-410A</span><span>&lt;150 · low GWP</span></div>
            <p class="pg-score-note">
              {#if gFirst && gFirst.gwp != null}
                Down from {fmt(gFirst.gwp)} in {gFirst.year} (marker). Mostly a shift to R-32, which still has a GWP of 771.
              {/if}
            </p>
          </article>
        </div>
      {/if}
    </div>

    <!-- ═══ REGION BY REGION ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="pg-eyebrow">Region by Region</span>
      <h2 class="pg-section-title">The transition is uneven: Asia and Europe move, the Middle East stalls</h2>
      <p class="pg-body-text">
        For each region, the grey bar is the earliest year JRAIA published and the coloured bar the latest. Inverter data starts in 2017;
        refrigerant split data, needed to derive GWP, starts in 2021. Hover a region to see the years and the change.
      </p>
      <div class="pg-chart-grid">
        <div class="pg-chart-card">
          <h3 class="pg-chart-title">Inverter share, earliest vs latest</h3>
          <div class="pg-chart pg-chart-reg" bind:this={regInvEl}></div>
        </div>
        <div class="pg-chart-card">
          <h3 class="pg-chart-title">Average refrigerant GWP, earliest vs latest</h3>
          <div class="pg-chart pg-chart-reg" bind:this={regGwpEl}></div>
        </div>
      </div>
      {#if !loading && regionSummaries.some(r => !r.published)}
        <p class="pg-unpub-note">
          <i class="fa-solid fa-circle-minus"></i>
          Not published by JRAIA: {regionSummaries.filter(r => !r.published).map(r => r.label).join(' and ')}.
          Country data would need BSRIA or national registries.
        </p>
      {/if}
    </div>

    <!-- ═══ THE TREND ═══ -->
    <div class="chapter-card" class:revealed>
      <span class="pg-eyebrow">The Trend</span>
      <h2 class="pg-section-title">Year by year, region by region</h2>
      <p class="pg-body-text">
        Each year JRAIA published is shown side by side, so the change from one year to the next reads left to right. Bars are regions.
        Hover a year to see the change against the previous one. JRAIA skipped 2018 to 2020, refrigerant splits start in 2021, and 2025 excludes North America.
      </p>
      <div class="pg-picker" role="group" aria-label="Regions shown">
        <div class="pg-picker-actions">
          <button type="button" class="pg-picker-all" on:click={selectAll}>Select all</button>
          <button type="button" class="pg-picker-all" on:click={selectNone}>Clear</button>
        </div>
        {#each selectable as r (r.code)}
          <button type="button" class="pg-chip" class:active={selected.includes(r.code)} aria-pressed={selected.includes(r.code)}
            style="--chip:{r.color}" on:click={() => toggleRegion(r.code)}>
            <span class="pg-chip-dot"></span>{r.label}
          </button>
        {/each}
      </div>
      {#if !loading && selected.length === 0}
        <p class="pg-unpub-note"><i class="fa-solid fa-hand-pointer"></i> Pick one or more regions above to show the charts.</p>
      {/if}
      <div class="pg-chart-grid">
        <div class="pg-chart-card">
          <h3 class="pg-chart-title">Inverter share of new split AC sales</h3>
          <div class="pg-chart" bind:this={invChartEl}></div>
          <ul class="pg-chart-legend">
            {#each selectable.filter(r => selected.includes(r.code)) as r (r.code)}
              <li><span style="background:{r.color}"></span>{r.label}</li>
            {/each}
          </ul>
        </div>
        <div class="pg-chart-card">
          <h3 class="pg-chart-title">Average refrigerant GWP of new split AC sales</h3>
          <div class="pg-chart" bind:this={gwpChartEl}></div>
          <ul class="pg-chart-legend">
            {#each selectable.filter(r => selected.includes(r.code)) as r (r.code)}
              <li><span style="background:{r.color}"></span>{r.label}</li>
            {/each}
          </ul>
        </div>
      </div>
    </div>

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
            refrigerant: A2L as R-32 (771), other HFCs as R-410A (2,256), HCFCs as R-22 (1,960), using IPCC AR6 GWP100. "Others" (under 2%) are excluded.
          </div>
        </div>
        <div class="pg-note">
          <i class="fa-solid fa-scale-balanced"></i>
          <div>
            <strong>Global weighting.</strong> Regions are weighted by JRAIA total air conditioner demand (all types), as a proxy for split AC sales.
          </div>
        </div>
        <div class="pg-note">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div>
            <strong>Gaps.</strong> JRAIA does not publish these shares for Africa or Latin America, nor for North America in 2025. Country level refrigerant
            data has no public substitute; that is the gap the BSRIA licence would fill.
          </div>
        </div>
      </div>
      <p class="pg-disclaimer"><i class="fa-solid fa-lock"></i> Mockup only. JRAIA republication terms have not been checked; do not publish.</p>
    </div>
  </div>
</section>

<style>
  .pg-eyebrow-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-bottom: 14px;
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
  .pg-eyebrow-row .pg-eyebrow { margin-bottom: 0; }

  .pg-scope-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
    white-space: nowrap;
  }
  .pg-scope-badge i { font-size: 0.6rem; color: #64748b; }

  .pg-section-title {
    font-size: 2.2rem;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.025em;
    margin: 0 0 20px;
    line-height: 1.15;
  }

  .pg-body-text {
    font-size: 1rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.78;
    margin: 0 0 16px;
    max-width: 900px;
  }
  .pg-muted { color: #64748b; }

  /* ── Scoreboard ─────────────────────────────── */
  .pg-score-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }

  .pg-score-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.4rem 1.5rem 1.2rem;
  }

  .pg-score-head {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .pg-score-icon {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border-radius: 8px;
    display: grid;
    place-items: center;
    color: var(--c);
    background: color-mix(in srgb, var(--c) 14%, transparent);
  }

  .pg-score-title { font-size: 1.02rem; font-weight: 800; color: #0f172a; margin: 0 0 0.15rem; }
  .pg-score-sub { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.45; }

  .pg-score-value {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 0.7rem;
  }
  .pg-big {
    font-size: 3rem;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.03em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .pg-big small { font-size: 1.1rem; font-weight: 700; color: #475569; margin-left: 0.15rem; }
  .pg-score-year {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #64748b;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    padding: 0.15rem 0.55rem;
  }

  .pg-bar {
    position: relative;
    height: 16px;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: visible;
  }
  .pg-bar-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 1s ease;
  }
  .pg-bar-ghost {
    position: absolute;
    top: -4px;
    width: 3px;
    height: 24px;
    margin-left: -1.5px;
    background: #0f172a;
    border-radius: 2px;
    opacity: 0.55;
  }
  .pg-bar-tick {
    position: absolute;
    top: 0;
    height: 16px;
    border-left: 2px dashed rgba(15, 23, 42, 0.45);
  }
  .pg-bar-tick em {
    position: absolute;
    top: 20px;
    left: -2.2rem;
    width: 4.4rem;
    text-align: center;
    font-size: 0.66rem;
    font-style: normal;
    font-weight: 700;
    color: #475569;
  }
  .pg-bar-zone {
    position: absolute;
    top: 0;
    right: 0;
    height: 16px;
    border-radius: 0 999px 999px 0;
    background: repeating-linear-gradient(45deg, rgba(21, 128, 61, 0.35) 0 4px, rgba(21, 128, 61, 0.12) 4px 8px);
  }

  .pg-bar-scale {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    font-weight: 600;
    color: #94a3b8;
    margin-top: 0.4rem;
  }
  .pg-bar-gwp + .pg-bar-scale { margin-top: 1.4rem; }

  .pg-score-note { font-size: 0.8rem; color: #475569; line-height: 1.5; margin: 0.75rem 0 0; }

  /* ── Region table ───────────────────────────── */
  .pg-chart-reg { height: 300px; }
  .pg-unpub-note { margin: 0.9rem 0 0; font-size: 0.82rem; color: #64748b; }
  .pg-unpub-note i { margin-right: 0.35rem; color: #94a3b8; }

  /* ── Charts ─────────────────────────────────── */
  .pg-chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }
  .pg-chart-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1rem 1rem 0.5rem; min-width: 0; }
  .pg-chart-title { font-size: 0.92rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem; }
  .pg-chart-legend {
    list-style: none; margin: 0.25rem 0 0.5rem; padding: 0.6rem 0 0; border-top: 1px solid #f1f5f9;
    display: flex; flex-wrap: wrap; gap: 0.35rem 1rem; font-size: 0.75rem; color: #475569;
  }
  .pg-chart-legend li { display: inline-flex; align-items: center; gap: 0.4rem; }
  .pg-chart-legend span { width: 12px; height: 8px; border-radius: 2px; flex-shrink: 0; }
  .pg-chart { width: 100%; height: 340px; }
  .pg-picker { display: flex; flex-wrap: wrap; align-items: center; gap: 0.45rem; margin: 0 0 1rem; }
  .pg-picker-actions { display: inline-flex; gap: 0.25rem; padding: 0.2rem; background: #f1f5f9; border-radius: 999px; margin-right: 0.35rem; }
  .pg-picker-all {
    font: inherit; font-size: 0.75rem; font-weight: 700; color: #475569; background: none; border: none;
    padding: 0.32rem 0.8rem; border-radius: 999px; cursor: pointer; transition: background 0.2s, color 0.2s;
  }
  .pg-picker-all:hover { background: #fff; color: #15803d; }
  .pg-chip {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font: inherit; font-size: 0.78rem; font-weight: 700; color: #64748b;
    background: #fff; border: 1.5px solid #e2e8f0; border-radius: 999px;
    padding: 0.32rem 0.8rem; cursor: pointer; transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .pg-chip:hover { border-color: var(--chip); color: #0f172a; }
  .pg-chip-dot { width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid var(--chip); background: transparent; }
  .pg-chip.active { border-color: var(--chip); color: #0f172a; background: color-mix(in srgb, var(--chip) 10%, #fff); }
  .pg-chip.active .pg-chip-dot { background: var(--chip); }

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
    .pg-score-grid, .pg-chart-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .pg-section-title { font-size: 1.25rem; }
    .pg-big { font-size: 2.3rem; }
  }
</style>

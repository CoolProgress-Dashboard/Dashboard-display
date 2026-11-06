<script lang="ts">
  import { onMount } from 'svelte';
  import { loadJraiaRegionalData } from '$lib/services/dashboard-data';
  import { SUPABASE_URL, SUPABASE_KEY } from '$lib/components/shared/config';
  import { CAT, SEQ, CHROME } from '$lib/components/shared/colors';
  import type { JraiaRegionalRecord } from '$lib/services/dashboard-types';

  // Global inverter share of new split room AC sales, from JRAIA.
  // Same rule as the Progress page so both show the same numbers: the regions complete in the
  // first refrigerant year, kept fixed every year, weighted by JRAIA regional AC demand.

  const INVERTER = CAT[0];
  const FIXED = SEQ[2];
  const REGION_LABELS: Record<string, string> = {
    AFR: 'Africa', ASIA_EX_JPCN: 'Asia excl. Japan/China', CHN: 'China', EUR: 'Europe', JPN: 'Japan',
    LAC: 'Latin America', MEA: 'Middle East', NAM: 'North America', OCE: 'Oceania',
  };

  let rows: JraiaRegionalRecord[] = [];
  let loading = true;
  let failed = false;
  let el: HTMLDivElement;
  let inst: any = null;
  let ro: ResizeObserver | null = null;

  const fmt = (n: number) => Math.round(n).toLocaleString('en-GB');

  $: published = rows.filter(r => r.is_published);
  const row = (code: string, year: number) => published.find(r => r.region_code === code && r.year === year);
  const complete = (r: JraiaRegionalRecord | undefined) =>
    !!r && r.avg_gwp_ar6 != null && r.inverter_pct != null && r.region_ac_demand_thousand_units != null;

  $: gwpYears = [...new Set(published.filter(r => r.avg_gwp_ar6 != null).map(r => r.year))].sort((a, b) => a - b);
  $: regions = gwpYears.length ? published.filter(r => r.year === gwpYears[0] && complete(r)).map(r => r.region_code) : [];
  $: years = gwpYears.filter(y => regions.every(c => complete(row(c, y))));
  $: global = years.map(y => {
    const rs = regions.map(c => row(c, y)!);
    const w = rs.reduce((s, r) => s + Number(r.region_ac_demand_thousand_units), 0);
    return { year: y, inv: rs.reduce((s, r) => s + Number(r.inverter_pct) * Number(r.region_ac_demand_thousand_units), 0) / w };
  });
  $: first = global[0];
  $: last = global[global.length - 1];
  $: regionList = regions.map(c => REGION_LABELS[c] ?? c).sort().join(', ');

  $: option = {
    animation: false,
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' }, confine: true,
      backgroundColor: CHROME.TOOLTIP_BG, borderWidth: 0, textStyle: { color: '#fff', fontSize: 12 },
      formatter: (ps: any[]) => {
        const g = global[ps[0].dataIndex];
        return `<b>${g.year}</b><br/>Inverter: <b>${fmt(g.inv)}%</b><br/>Fixed speed: <b>${fmt(100 - g.inv)}%</b>`;
      },
    },
    legend: {
      top: 0, left: 0, data: ['Inverter', 'Fixed speed'], icon: 'roundRect', itemWidth: 12, itemHeight: 8,
      textStyle: { color: CHROME.AXIS_LABEL, fontSize: 11 },
    },
    grid: { left: 4, right: 4, top: 32, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category', data: global.map(g => String(g.year)),
      axisLine: { lineStyle: { color: CHROME.AXIS_LINE } }, axisTick: { show: false },
      axisLabel: { color: CHROME.AXIS_LABEL, fontSize: 12, fontWeight: 600 },
    },
    yAxis: {
      type: 'value', min: 0, max: 100, splitLine: { lineStyle: { color: CHROME.SPLIT_LINE } },
      axisLabel: { color: CHROME.AXIS_LABEL, fontSize: 12, formatter: (v: number) => v + '%' },
    },
    series: [
      { name: 'Inverter', type: 'bar', stack: 'inv', barMaxWidth: 56, itemStyle: { color: INVERTER },
        label: { show: true, color: '#fff', fontSize: 12, fontWeight: 700, formatter: (p: any) => `${Math.round(p.value)}%` },
        data: global.map(g => g.inv) },
      { name: 'Fixed speed', type: 'bar', stack: 'inv', barMaxWidth: 56, itemStyle: { color: FIXED },
        label: { show: true, color: '#0f172a', fontSize: 12, fontWeight: 700, formatter: (p: any) => `${Math.round(p.value)}%` },
        data: global.map(g => 100 - g.inv) },
    ],
  };

  $: if (inst && global.length) inst.setOption(option, true);

  onMount(() => {
    let gone = false;
    loadJraiaRegionalData(SUPABASE_URL, SUPABASE_KEY)
      .then(r => { rows = r; failed = r.length === 0; })
      .catch(() => { failed = true; })
      .finally(() => { loading = false; });
    import('echarts').then(echarts => {
      if (gone || !el) return;
      inst = echarts.init(el);
      if (global.length) inst.setOption(option, true);
      ro = new ResizeObserver(() => inst?.resize());
      ro.observe(el);
    });
    return () => { gone = true; ro?.disconnect(); inst?.dispose(); };
  });
</script>

<div class="gis-card">
  <h3 class="gis-title">
    {#if first && last}
      {fmt(last.inv)}% of new split room ACs sold in {last.year} were inverter units ({fmt(first.inv)}% in {first.year})
    {:else}
      Inverter share of new split room AC sales
    {/if}
  </h3>
  {#if loading}
    <p class="gis-msg"><i class="fa-solid fa-spinner fa-spin"></i> Loading sales data…</p>
  {:else if failed || !global.length}
    <p class="gis-msg">Sales data could not be loaded.</p>
  {/if}
  <div class="gis-chart" bind:this={el} style:display={global.length ? 'block' : 'none'}></div>
  {#if global.length}
    <p class="gis-source">
      Source: JRAIA, <em>Estimates of World Air Conditioner Demand</em> (RAC split-type), {first.year} to {last.year}.
      Weighted by each region's AC demand, same {regions.length} regions every year ({regionList}).
      Not world coverage: JRAIA does not publish inverter shares for Africa or Latin America.
      <a href="/dashboard/progress">Region by region on the Progress page</a>.
    </p>
  {/if}
</div>

<style>
  .gis-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1rem; margin: 1.5rem 0; }
  .gis-title { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem; }
  .gis-chart { width: 100%; height: 320px; }
  .gis-msg { font-size: 0.9rem; color: #64748b; margin: 1rem 0; }
  .gis-source { font-size: 0.78rem; color: #64748b; line-height: 1.55; margin: 0.9rem 0 0; padding-top: 0.6rem; border-top: 1px solid #f1f5f9; }
  .gis-source a { color: #0369a1; font-weight: 600; }
</style>

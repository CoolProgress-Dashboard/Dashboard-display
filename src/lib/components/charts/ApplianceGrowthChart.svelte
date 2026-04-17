<script lang="ts">
  import { onMount } from 'svelte';
  import { APPLIANCE, SCENARIO, EMISSION, CHROME, areaGradient, rgba } from '$lib/components/shared/colors';
  import {
    applianceMilestones as hardcodedMilestones,
    applianceSummaries,
    APPLIANCE_META,
    METRIC_META
  } from '$lib/data/appliance-timeseries-data';
  import type { ApplianceType, MetricKey, ScenarioType, ApplianceTimeseriesPoint } from '$lib/data/appliance-timeseries-data';
  import type { ApplianceTimeseriesRecord, CoolingMilestoneRecord } from '$lib/services/dashboard-types';

  export let applianceTimeseries: ApplianceTimeseriesRecord[] = [];
  export let coolingMilestones: CoolingMilestoneRecord[] = [];

  // Primary data: built in EmissionsPillar from live Supabase tables by combining:
  //   CLASP Mepsy (stock, energy, indirect emissions) — clasp_energy_consumption
  //   GCI/HEAT    (direct emissions)                  — global_model_subcool
  // See buildApplianceTimeseries() in dashboard-data.ts for full methodology.
  $: isLoading = applianceTimeseries.length === 0;

  $: effectiveData = applianceTimeseries.map((r): ApplianceTimeseriesPoint => ({
    year: r.year,
    appliance: r.appliance_type as ApplianceType,
    stockMillions: r.stock_millions,
    energyTwh: r.energy_twh,
    indirectEmissionMt: r.indirect_emission_mt,
    directEmissionMt: r.direct_emission_mt,
    totalEmissionMt: r.total_emission_mt,
    scenario: r.scenario as ScenarioType,
    isProjected: r.is_projected,
    source: r.source ?? '',
    sourceUrl: r.source_url ?? '',
  }));

  $: applianceMilestones = coolingMilestones.length > 0
    ? coolingMilestones.map(m => ({ year: m.year, label: m.label, description: m.description ?? '' }))
    : hardcodedMilestones;

  function getApplianceData(appliance: ApplianceType | 'All', scenario: ScenarioType): ApplianceTimeseriesPoint[] {
    if (appliance === 'All') {
      return effectiveData.filter(d => d.scenario === scenario);
    }
    return effectiveData.filter(d => d.appliance === appliance && d.scenario === scenario);
  }

  let chartContainer: HTMLElement;
  let chartInstance: any;

  let selectedAppliance: ApplianceType | 'All' = 'AC';
  let selectedMetric: MetricKey = 'stock';

  const applianceOptions: { key: ApplianceType | 'All'; label: string }[] = [
    { key: 'AC', label: 'AC' },
    { key: 'DomRef', label: 'Refrigerators' },
    { key: 'Fans', label: 'Fans' },
    { key: 'All', label: 'All' },
  ];

  const metricOptions: { key: MetricKey; label: string }[] = [
    { key: 'stock', label: 'Stock (Units)' },
    { key: 'energy', label: 'Energy (TWh)' },
    { key: 'emissions', label: 'Emissions (Mt CO\u2082e)' },
  ];

  // Reactive title
  $: applianceLabel = selectedAppliance === 'All'
    ? 'Cooling Appliance'
    : APPLIANCE_META[selectedAppliance].label;
  $: metricLabel = METRIC_META[selectedMetric].label;
  $: titleIcon = selectedAppliance === 'All'
    ? 'fa-solid fa-chart-area'
    : APPLIANCE_META[selectedAppliance].icon;

  // Reactive summary (only for single appliance)
  $: summary = selectedAppliance !== 'All'
    ? applianceSummaries[selectedAppliance][selectedMetric]
    : null;

  // Reactive sources
  $: activeSources = getActiveSources(selectedAppliance);

  function getActiveSources(app: ApplianceType | 'All'): { name: string; url: string }[] {
    const sources: { name: string; url: string }[] = [];
    const seen = new Set<string>();
    const data = getApplianceData(app, 'BAU');
    for (const d of data) {
      const key = d.sourceUrl;
      if (!seen.has(key)) {
        seen.add(key);
        sources.push({ name: d.source.split(':')[0].trim(), url: d.sourceUrl });
      }
    }
    return sources;
  }

  function buildChartOption() {
    // Derive years from live data so the x-axis starts where data actually begins
    // (2005 for CLASP, 1990 for hardcoded fallback). Using getYears() (hardcoded)
    // when live data is present would create empty slots for 1990/1995/2000 that
    // break the historical→projected bridge logic.
    const years = [...new Set(effectiveData.map(d => d.year))]
      .filter(y => y >= 2020 && y <= 2050)
      .sort((a, b) => a - b);
    const field = METRIC_META[selectedMetric].field;
    const yLabel = METRIC_META[selectedMetric].yAxisLabel;
    const demarcationIdx = years.indexOf(2025);

    const series: any[] = [];

    if (selectedAppliance === 'All') {
      // Multi-line: one line per appliance (BAU only, solid throughout)
      const appliances: ApplianceType[] = ['AC', 'DomRef', 'Fans'];
      for (const app of appliances) {
        const data = getApplianceData(app, 'BAU');
        const meta = APPLIANCE_META[app];
        series.push({
          name: meta.label,
          type: 'line',
          data: years.map(y => {
            const pt = data.find(d => d.year === y);
            return pt ? (pt as any)[field] : null;
          }),
          smooth: 0.5,
          lineStyle: { width: 3, color: meta.color },
          itemStyle: { color: meta.color },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: meta.colorRgba + ' 0.15)' },
                { offset: 1, color: meta.colorRgba + ' 0.02)' },
              ]
            }
          },
          symbol: 'circle',
          symbolSize: 4,
          markLine: app === 'AC' && demarcationIdx >= 0 ? {
            silent: true, symbol: 'none',
            data: [{ xAxis: demarcationIdx }],
            lineStyle: { color: CHROME.DEMARCATION, width: 1, type: 'dashed' },
            label: { show: false }
          } : undefined
        });
      }
    } else if (selectedMetric === 'emissions' && selectedAppliance !== 'Fans') {
      // Emissions breakdown: stacked indirect + direct for AC and DomRef
      const bauData = getApplianceData(selectedAppliance, 'BAU');
      const meta = APPLIANCE_META[selectedAppliance];

      // BAU Indirect (bottom stack)
      series.push({
        name: 'BAU Indirect (electricity)',
        type: 'bar',
        stack: 'bau',
        data: years.map(y => {
          const pt = bauData.find(d => d.year === y);
          return pt ? pt.indirectEmissionMt : null;
        }),
        itemStyle: { color: meta.color, opacity: 0.7 },
        barWidth: '60%',
        markLine: demarcationIdx >= 0 ? {
          silent: true, symbol: 'none',
          data: [{ xAxis: demarcationIdx }],
          lineStyle: { color: CHROME.DEMARCATION, width: 1, type: 'dashed' },
          label: { show: false }
        } : undefined
      });

      // BAU Direct (top stack)
      series.push({
        name: 'BAU Direct (refrigerant)',
        type: 'bar',
        stack: 'bau',
        data: years.map(y => {
          const pt = bauData.find(d => d.year === y);
          return pt ? pt.directEmissionMt : null;
        }),
        itemStyle: { color: EMISSION.DIRECT, opacity: 0.7 },
        barWidth: '60%',
      });
    } else {
      // Single appliance: stock, energy, or Fans emissions — historical (solid) + projected (dashed)
      const data = getApplianceData(selectedAppliance, 'BAU');
      const meta = APPLIANCE_META[selectedAppliance];
      const values = years.map(y => {
        const pt = data.find(d => d.year === y);
        return pt ? (pt as any)[field] : null;
      });
      const isProjected = years.map(y => {
        const pt = data.find(d => d.year === y);
        return pt ? pt.isProjected : true;
      });

      const historicalData = values.map((v, i) => isProjected[i] ? null : v);
      const projectedData = values.map((v, i) => isProjected[i] ? v : null);

      // Bridge point
      const lastHistIdx = isProjected.indexOf(true) - 1;
      if (lastHistIdx >= 0 && lastHistIdx < projectedData.length) {
        projectedData[lastHistIdx] = values[lastHistIdx];
      }

      series.push({
        name: 'Historical',
        type: 'line',
        data: historicalData,
        smooth: 0.5,
        connectNulls: false,
        lineStyle: { width: 3, color: meta.color },
        itemStyle: { color: meta.color },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: meta.colorRgba + ' 0.25)' },
              { offset: 1, color: meta.colorRgba + ' 0.02)' },
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 5,
        markLine: demarcationIdx >= 0 ? {
          silent: true, symbol: 'none',
          data: [{ xAxis: demarcationIdx }],
          lineStyle: { color: CHROME.DEMARCATION, width: 1, type: 'dashed' },
          label: { show: false }
        } : undefined
      });

      series.push({
        name: 'Projected (BAU)',
        type: 'line',
        data: projectedData,
        smooth: 0.5,
        connectNulls: false,
        lineStyle: { width: 3, color: SCENARIO.PROJECTED, type: 'dashed' },
        itemStyle: { color: SCENARIO.PROJECTED },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(240, 164, 122, 0.2)' },
              { offset: 1, color: 'rgba(240, 164, 122, 0.02)' },
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 5,
      });
    }

    // Build tooltip
    const tooltip: any = {
      trigger: 'axis',
      formatter: (params: any[]) => {
        const year = Number(params[0].axisValue);
        let html = `<strong>${year}</strong><br/>`;

        for (const p of params) {
          if (p.value == null) continue;
          const colorDot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px;"></span>`;
          const unit = METRIC_META[selectedMetric].unit;
          let val: string;

          if (selectedMetric === 'stock' && typeof p.value === 'number') {
            val = p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}B` : `${p.value.toLocaleString()}M`;
          } else {
            val = `${Number(p.value).toLocaleString()} ${unit}`;
          }

          html += `${colorDot}${p.seriesName}: <strong>${val}</strong><br/>`;
        }

        // Show BAU total for stacked emissions view
        if (selectedMetric === 'emissions' && selectedAppliance !== 'All' && selectedAppliance !== 'Fans') {
          const bauData = getApplianceData(selectedAppliance, 'BAU');
          const entry = bauData.find(d => d.year === year);
          if (entry) {
            html += `<br/><span style="color:#555;font-size:0.85em;font-weight:600">BAU Total: ${entry.totalEmissionMt.toLocaleString()} Mt</span>`;
          }
        } else if (selectedMetric === 'emissions' && selectedAppliance === 'Fans') {
          const bauData = getApplianceData('Fans', 'BAU');
          const entry = bauData.find(d => d.year === year);
          if (entry) {
            html += `<br/><span style="color:#888;font-size:0.85em">Indirect only (no refrigerant)</span>`;
          }
        }

        // Milestones
        const milestone = applianceMilestones.find(m => m.year === year);
        if (milestone) {
          html += `<br/><br/><strong>${milestone.label}</strong><br/><span style="font-size:0.85em">${milestone.description}</span>`;
        }

        // Source
        if (selectedAppliance !== 'All') {
          const bauData = getApplianceData(selectedAppliance, 'BAU');
          const entry = bauData.find(d => d.year === year);
          if (entry) {
            html += `<br/><span style="color:#aaa;font-size:0.8em">Source: ${entry.source}</span>`;
          }
        }

        return html;
      }
    };

    // Y-axis formatter
    const yAxisFormatter = (v: number) => {
      if (selectedMetric === 'stock') {
        return v >= 1000 ? `${(v / 1000).toFixed(1)}B` : `${v}M`;
      }
      return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;
    };

    // Legend items
    const legendData = series.map(s => s.name);

    return {
      tooltip,
      grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        data: years,
        boundaryGap: false,
        axisLabel: { fontSize: 10, color: CHROME.TEXT_SECONDARY },
        axisLine: { lineStyle: { color: CHROME.SPLIT_LINE } }
      },
      yAxis: {
        type: 'value',
        name: METRIC_META[selectedMetric].yAxisLabel,
        nameTextStyle: { fontSize: 10, color: CHROME.TEXT_SECONDARY },
        axisLabel: { fontSize: 10, color: CHROME.TEXT_SECONDARY, formatter: yAxisFormatter },
        splitLine: { lineStyle: { color: CHROME.SPLIT_LINE } },
        axisLine: { show: false }
      },
      series,
      legend: {
        data: legendData,
        bottom: 0,
        textStyle: { fontSize: 11, color: CHROME.TEXT_SECONDARY }
      }
    };
  }

  function updateChart() {
    if (!chartInstance) return;
    chartInstance.setOption(buildChartOption(), true);
  }

  $: selectedAppliance, selectedMetric, effectiveData, updateChart();

  onMount(async () => {
    const echarts = await import('echarts');
    chartInstance = echarts.init(chartContainer);
    chartInstance.setOption(buildChartOption());

    const resizeObserver = new ResizeObserver(() => chartInstance?.resize());
    resizeObserver.observe(chartContainer);

    return () => {
      resizeObserver.disconnect();
      chartInstance?.dispose();
    };
  });
</script>

<div class="appliance-growth-chart card-panel">
  <div class="chart-header">
    <div class="chart-title">
      <i class={titleIcon}></i>
      Global {applianceLabel} {metricLabel} (2020 - 2050)
    </div>
    {#if summary}
      <div class="chart-subtitle-row">
        <span class="chart-subtitle">
          From {summary.today} today to {summary.by2050} by 2050
        </span>
        <span class="chart-highlight">
          <i class={summary.highlightIcon}></i>
          {summary.highlight}
        </span>
      </div>
    {/if}
  </div>

  <!-- Appliance toggle row -->
  <div class="chart-toggle-row">
    {#each applianceOptions as opt}
      <button
        class="chart-pill"
        class:active={selectedAppliance === opt.key}
        on:click={() => { selectedAppliance = opt.key; }}
      >
        {opt.label}
      </button>
    {/each}
  </div>

  <!-- Metric toggle row -->
  <div class="chart-toggle-row">
    {#each metricOptions as opt}
      <button
        class="chart-pill"
        class:active={selectedMetric === opt.key}
        on:click={() => { selectedMetric = opt.key; }}
      >
        {opt.label}
      </button>
    {/each}
  </div>

  <div class="chart-wrap">
    <div class="chart-container" bind:this={chartContainer}></div>
    {#if isLoading}
      <div class="chart-loading-overlay">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Loading data…</span>
      </div>
    {/if}
  </div>

  <div class="chart-source-bar">
    <div class="chart-source-credits">
      <span class="chart-source-label">Data sources:</span>

      <!-- CLASP Mepsy -->
      <a href="https://www.clasp.ngo/tools/mepsy/" target="_blank" rel="noopener noreferrer" class="source-credit-link">
        <img src="/images/clasp-logo.png" alt="CLASP" class="source-credit-logo" />
        <span>Mepsy Tool</span>
        <i class="fa-solid fa-arrow-up-right-from-square source-credit-ext"></i>
      </a>

      <span class="source-credit-sep">·</span>

      <!-- GCI / HEAT / GIZ -->
      <a href="https://www.green-cooling-initiative.org/country-data#!total-emissions/all-sectors/absolute" target="_blank" rel="noopener noreferrer" class="source-credit-link">
        <img src="/images/giz-logo.png" alt="GIZ" class="source-credit-logo" />
        <img src="/images/heat-logo.png" alt="HEAT GmbH" class="source-credit-logo" />
        <span>Green Cooling Initiative</span>
        <i class="fa-solid fa-arrow-up-right-from-square source-credit-ext"></i>
      </a>
    </div>

    <a href="/methodology/appliance-chart" class="chart-meth-link">Methodology</a>
  </div>
</div>

<style>
  .appliance-growth-chart {
    padding: 1rem 1.25rem;
  }

  .chart-header {
    margin-bottom: 0.5rem;
  }

  .chart-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #333;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .chart-title i {
    color: #2D7D5A;
  }

  .chart-subtitle-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.15rem;
    flex-wrap: wrap;
  }

  .chart-subtitle {
    font-size: 0.78rem;
    color: #888;
  }

  .chart-highlight {
    font-size: 0.72rem;
    font-weight: 700;
    color: #C25B33;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: rgba(194, 91, 51, 0.08);
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
  }

  .chart-toggle-row {
    display: flex;
    gap: 0.4rem;
    margin: 0.35rem 0;
    flex-wrap: wrap;
  }

  .chart-pill {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .chart-pill:hover {
    border-color: #2D7D5A;
    color: #2D7D5A;
  }

  .chart-pill.active {
    background: #2D7D5A;
    color: white;
    border-color: #2D7D5A;
  }

  .chart-wrap {
    position: relative;
  }

  .chart-container {
    width: 100%;
    height: 380px;
  }

  .chart-loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.85);
    color: #64748b;
    font-size: 0.85rem;
    gap: 0.5rem;
  }

  .chart-loading-overlay i {
    font-size: 1.4rem;
    color: #2D7D5A;
  }

  .chart-source-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.4rem 0 0;
    border-top: 1px solid #f1f5f9;
    margin-top: 0.4rem;
    flex-wrap: wrap;
  }

  .chart-source-credits {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    flex-wrap: wrap;
  }

  .chart-source-label {
    font-size: 0.68rem;
    color: #94a3b8;
    font-weight: 500;
    white-space: nowrap;
  }

  .source-credit-link {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    text-decoration: none;
    color: #0369a1;
    font-size: 0.68rem;
    font-weight: 500;
    transition: opacity 0.2s;
  }

  .source-credit-link:hover {
    opacity: 0.75;
  }

  .source-credit-logo {
    height: 15px;
    width: auto;
    object-fit: contain;
    opacity: 0.85;
  }

  .source-credit-sep {
    color: #cbd5e1;
    font-size: 0.75rem;
  }

  .source-credit-ext {
    font-size: 0.5rem;
    opacity: 0.6;
  }

  .chart-meth-link {
    font-size: 0.68rem;
    font-weight: 700;
    color: #2D7D5A;
    text-decoration: none;
    white-space: nowrap;
  }

  .chart-meth-link:hover {
    text-decoration: underline;
  }

</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import {
    applianceTimeseriesData,
    applianceMilestones,
    applianceSummaries,
    getApplianceData,
    getYears,
    APPLIANCE_META,
    METRIC_META
  } from '$lib/data/appliance-timeseries-data';
  import type { ApplianceType, MetricKey, ScenarioType } from '$lib/data/appliance-timeseries-data';

  let chartContainer: HTMLElement;
  let chartInstance: any;

  let selectedAppliance: ApplianceType | 'All' = 'AC';
  let selectedMetric: MetricKey = 'stock';
  let showDecarb = false;

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
    const years = getYears();
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
            lineStyle: { color: '#94a3b8', width: 1, type: 'dashed' },
            label: { show: true, formatter: '2025', fontSize: 9, color: '#94a3b8', position: 'start' }
          } : undefined
        });

        // DECARB overlay for All view
        if (showDecarb) {
          const decarbData = getApplianceData(app, 'DECARB');
          series.push({
            name: meta.label + ' (Decarb)',
            type: 'line',
            data: years.map(y => {
              const pt = decarbData.find(d => d.year === y);
              if (!pt || y < 2025) return null;
              return (pt as any)[field];
            }),
            smooth: 0.5,
            lineStyle: { width: 2, color: '#8BC34A', type: 'dashed' },
            itemStyle: { color: '#8BC34A' },
            symbol: 'none',
            connectNulls: false,
          });
        }
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
          lineStyle: { color: '#94a3b8', width: 1, type: 'dashed' },
          label: { show: true, formatter: '2025', fontSize: 9, color: '#94a3b8', position: 'start' }
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
        itemStyle: { color: '#E85A4F', opacity: 0.7 },
        barWidth: '60%',
      });

      // DECARB overlay (stacked bars + total line)
      if (showDecarb) {
        const decarbData = getApplianceData(selectedAppliance, 'DECARB');

        // DECARB Indirect
        series.push({
          name: 'MIT Indirect',
          type: 'bar',
          stack: 'decarb',
          data: years.map(y => {
            const pt = decarbData.find(d => d.year === y);
            if (!pt || y < 2025) return null;
            return pt.indirectEmissionMt;
          }),
          itemStyle: { color: '#8BC34A', opacity: 0.6 },
          barWidth: '30%',
          barGap: '10%',
        });

        // DECARB Direct
        series.push({
          name: 'MIT Direct',
          type: 'bar',
          stack: 'decarb',
          data: years.map(y => {
            const pt = decarbData.find(d => d.year === y);
            if (!pt || y < 2025) return null;
            return pt.directEmissionMt;
          }),
          itemStyle: { color: '#689F38', opacity: 0.6 },
          barWidth: '30%',
        });

        // DECARB total line overlay
        series.push({
          name: 'MIT Total',
          type: 'line',
          data: years.map(y => {
            const pt = decarbData.find(d => d.year === y);
            if (!pt || y < 2025) return null;
            return pt.totalEmissionMt;
          }),
          smooth: 0.5,
          lineStyle: { width: 2.5, color: '#8BC34A', type: 'dashed' },
          itemStyle: { color: '#8BC34A' },
          symbol: 'none',
          connectNulls: false,
        });
      }
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
          lineStyle: { color: '#94a3b8', width: 1, type: 'dashed' },
          label: { show: true, formatter: '2025', fontSize: 9, color: '#94a3b8', position: 'start' }
        } : undefined
      });

      series.push({
        name: 'Projected (BAU)',
        type: 'line',
        data: projectedData,
        smooth: 0.5,
        connectNulls: false,
        lineStyle: { width: 3, color: '#E89B8C', type: 'dashed' },
        itemStyle: { color: '#E89B8C' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(232, 155, 140, 0.2)' },
              { offset: 1, color: 'rgba(232, 155, 140, 0.02)' },
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 5,
      });

      // DECARB overlay
      if (showDecarb) {
        const decarbData = getApplianceData(selectedAppliance, 'DECARB');
        series.push({
          name: 'Decarbonization Pathway',
          type: 'line',
          data: years.map(y => {
            const pt = decarbData.find(d => d.year === y);
            if (!pt || y < 2025) return null;
            return (pt as any)[field];
          }),
          smooth: 0.5,
          lineStyle: { width: 2.5, color: '#8BC34A', type: 'dashed' },
          itemStyle: { color: '#8BC34A' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(139, 195, 74, 0.12)' },
                { offset: 1, color: 'rgba(139, 195, 74, 0.02)' },
              ]
            }
          },
          symbol: 'none',
          connectNulls: false,
        });
      }
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
            if (showDecarb && year >= 2025) {
              const decarbData = getApplianceData(selectedAppliance, 'DECARB');
              const dEntry = decarbData.find(d => d.year === year);
              if (dEntry) {
                const reduction = Math.round((1 - dEntry.totalEmissionMt / entry.totalEmissionMt) * 100);
                html += `<br/><span style="color:#689F38;font-size:0.85em;font-weight:600">MIT Total: ${dEntry.totalEmissionMt.toLocaleString()} Mt (${reduction > 0 ? '-' : '+'}${Math.abs(reduction)}%)</span>`;
              }
            }
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
        axisLabel: { fontSize: 10, color: '#666' },
        axisLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: {
        type: 'value',
        name: METRIC_META[selectedMetric].yAxisLabel,
        nameTextStyle: { fontSize: 10, color: '#888' },
        axisLabel: { fontSize: 10, color: '#888', formatter: yAxisFormatter },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLine: { show: false }
      },
      series,
      legend: {
        data: legendData,
        bottom: 0,
        textStyle: { fontSize: 11, color: '#666' }
      }
    };
  }

  function updateChart() {
    if (!chartInstance) return;
    chartInstance.setOption(buildChartOption(), true);
  }

  $: selectedAppliance, selectedMetric, showDecarb, updateChart();

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
      Global {applianceLabel} {metricLabel} (1990 - 2050)
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

  <!-- Scenario toggle -->
  <label class="decarb-toggle">
    <input type="checkbox" bind:checked={showDecarb} />
    <span class="decarb-label">Show Decarbonization Pathway</span>
  </label>

  <div class="chart-container" bind:this={chartContainer}></div>

  <div class="chart-source">
    Sources:
    {#each activeSources as src, i}
      <a href={src.url} target="_blank" rel="noopener noreferrer">{src.name}</a>{#if i < activeSources.length - 1}; {/if}
    {/each}
    {#if showDecarb}
      ; <a href="/methodology" target="_blank" rel="noopener noreferrer">HEAT GmbH (DECARB methodology)</a>
      ; <a href="https://www.iea.org/reports/world-energy-outlook-2025" target="_blank" rel="noopener noreferrer">IEA STEPS (grid decarb)</a>
    {/if}
    &nbsp;&middot;&nbsp;
    <a href="/methodology" style="font-weight: 700;">Methodology</a>
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
    color: #3D6B6B;
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
    color: #E85A4F;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: rgba(232, 90, 79, 0.08);
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
    border-color: #3D6B6B;
    color: #3D6B6B;
  }

  .chart-pill.active {
    background: #3D6B6B;
    color: white;
    border-color: #3D6B6B;
  }

  .decarb-toggle {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0.35rem 0;
    cursor: pointer;
  }

  .decarb-toggle input {
    accent-color: #8BC34A;
    cursor: pointer;
  }

  .decarb-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: #666;
  }

  .chart-container {
    width: 100%;
    height: 380px;
  }

  .chart-source {
    font-size: 0.65rem;
    color: #aaa;
    text-align: right;
    margin-top: 0.5rem;
    font-style: italic;
  }

  .chart-source a {
    color: #3D6B6B;
    text-decoration: none;
    border-bottom: 1px dotted rgba(61, 107, 107, 0.3);
    transition: color 0.2s ease;
  }

  .chart-source a:hover {
    color: #2D5252;
    border-bottom-color: #2D5252;
  }
</style>

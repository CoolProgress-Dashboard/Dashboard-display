<script lang="ts">
  import { onMount } from 'svelte';
  import waterfall from '$lib/data/gcp_waterfall.json';

  // Reproduction of the Cool Coalition GCP Progress Dashboard waterfall
  // (feedback PO-08). Data: src/lib/data/gcp_waterfall.json, extracted from
  // the origin page and dated there.

  let chartContainer: HTMLElement;
  let chartInstance: any;

  const COLORS: Record<string, string> = {
    Direct: '#8FBBD9',
    Indirect: '#3B6B9E',
    'Growth': '#7B5269',
    'BAU Cooling Measures': '#D4A843',
    'Best Cooling Measures': '#C27050',
    'Best Cooling Measures + Zero-Carbon Electricity': '#2D7D5A',
  };

  type Column =
    | { kind: 'pillar'; label: string; direct: number; indirect: number; total: number }
    | { kind: 'bridge'; group: string; value: number; from: number; to: number };

  // Build the column sequence: pillar, its following bridge steps, next pillar...
  function buildColumns(): Column[] {
    const cols: Column[] = [];
    let running = 0;
    waterfall.scenarios.forEach((s: any, i: number) => {
      const total = Math.round((s.direct + s.indirect) * 10) / 10;
      cols.push({ kind: 'pillar', label: s.name, direct: s.direct, indirect: s.indirect, total });
      running = total;
      const group = waterfall.changes[i];
      if (group) {
        for (const step of group.steps) {
          const next = Math.round((running + step) * 10) / 10;
          cols.push({ kind: 'bridge', group: group.name, value: step, from: running, to: next });
          running = next;
        }
      }
    });
    return cols;
  }

  function buildOption() {
    const cols = buildColumns();
    const categories = cols.map((c) => (c.kind === 'pillar' ? c.label : ''));

    const seriesNames = ['Direct', 'Indirect', ...waterfall.changes.map((g: any) => g.name)];
    const data: Record<string, (number | null)[]> = { __base: [] };
    seriesNames.forEach((n) => (data[n] = []));

    cols.forEach((c) => {
      if (c.kind === 'pillar') {
        data.__base.push(0);
        data.Direct.push(c.direct);
        data.Indirect.push(c.indirect);
        waterfall.changes.forEach((g: any) => data[g.name].push(null));
      } else {
        data.__base.push(Math.min(c.from, c.to));
        data.Direct.push(null);
        data.Indirect.push(null);
        waterfall.changes.forEach((g: any) =>
          data[g.name].push(g.name === c.group ? Math.abs(c.value) : null)
        );
      }
    });

    const series: any[] = [
      {
        name: '__base',
        type: 'bar',
        stack: 'wf',
        itemStyle: { color: 'transparent' },
        emphasis: { itemStyle: { color: 'transparent' } },
        tooltip: { show: false },
        data: data.__base,
        barWidth: '58%',
        silent: true,
      },
      ...seriesNames.map((name) => ({
        name,
        type: 'bar',
        stack: 'wf',
        itemStyle: { color: COLORS[name], borderRadius: 2 },
        data: data[name],
        // Total label on top of each pillar bar (rendered on the Indirect
        // segment, which is the top of the stack; near-zero bar has 0
        // indirect, so the Direct segment carries it there)
        label:
          name === 'Indirect' || name === 'Direct'
            ? {
                show: true,
                position: 'top',
                fontSize: 11,
                fontWeight: 700 as const,
                color: '#334155',
                formatter: (p: any) => {
                  const col = cols[p.dataIndex];
                  if (col.kind !== 'pillar') return '';
                  if (name === 'Indirect' && col.indirect > 0) return col.total.toFixed(1);
                  if (name === 'Direct' && col.indirect === 0) return col.total.toFixed(1);
                  return '';
                },
              }
            : undefined,
      })),
    ];

    return {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (params: any) => {
          const col = cols[params.dataIndex];
          if (!col) return '';
          if (col.kind === 'pillar') {
            return (
              `<strong>${col.label.replace(/\n/g, ' ')}</strong><br/>` +
              `Direct (refrigerants): <strong>${col.direct.toFixed(1)}</strong> Gt CO₂e<br/>` +
              `Indirect (electricity): <strong>${col.indirect.toFixed(1)}</strong> Gt CO₂e<br/>` +
              `Total: <strong>${col.total.toFixed(1)}</strong> Gt CO₂e`
            );
          }
          const sign = col.value > 0 ? '+' : '−';
          return (
            `<strong>${col.group}</strong><br/>` +
            `${sign}${Math.abs(col.value).toFixed(1)} Gt CO₂e ` +
            `<span style="color:#94a3b8">(${col.from.toFixed(1)} → ${col.to.toFixed(1)})</span>`
          );
        },
      },
      legend: {
        show: true,
        bottom: 0,
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        selectedMode: false,
        textStyle: { fontSize: 11, color: '#475569' },
        data: seriesNames,
      },
      grid: { left: '3%', right: '3%', top: '10%', bottom: '22%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: {
          interval: 0,
          fontSize: 11,
          fontWeight: 700,
          color: '#334155',
          lineHeight: 15,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Emissions (Gt CO₂e)',
        nameTextStyle: { fontSize: 12, color: '#334155', fontWeight: 600 },
        max: 10,
        axisLabel: { fontSize: 12, color: '#334155' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      series,
    };
  }

  onMount(async () => {
    const echarts = await import('echarts');
    chartInstance = echarts.init(chartContainer);
    chartInstance.setOption(buildOption());

    const resizeObserver = new ResizeObserver(() => chartInstance?.resize());
    resizeObserver.observe(chartContainer);

    return () => {
      resizeObserver.disconnect();
      chartInstance?.dispose();
    };
  });
</script>

<div class="gcp-waterfall card-panel chart-card">
  <div class="chart-header">
    <div class="chart-title">
      <i class="fa-solid fa-stairs" style="color: #2D7D5A; margin-right: 0.5rem;"></i>
      What the Pledge Is About: Emissions Waterfall, 2022 to 2050
    </div>
    <span class="chart-subtitle">
      Global cooling-related emissions in Gt CO&#8322;e. Without measures, emissions more than double by 2050;
      best cooling measures plus zero-carbon electricity bring them to near zero.
    </span>
  </div>

  <div class="chart-container" bind:this={chartContainer}></div>

  <div class="chart-source">
    Source:
    <a href={waterfall.source_url} target="_blank" rel="noopener noreferrer">Cool Coalition, GCP Progress Dashboard</a>
    &middot; values retrieved {waterfall.retrieved}
  </div>
</div>

<style>
  .gcp-waterfall {
    padding: 1rem 1.25rem;
    margin-top: 1rem;
  }

  .chart-header {
    margin-bottom: 0.5rem;
  }

  .chart-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #333;
    display: flex;
    align-items: center;
  }

  .chart-subtitle {
    font-size: 0.78rem;
    color: #64748b;
    display: block;
    margin-top: 0.15rem;
  }

  .chart-container {
    width: 100%;
    height: 420px;
  }

  .chart-source {
    font-size: 0.68rem;
    color: #94a3b8;
    text-align: right;
    margin-top: 0.4rem;
    font-style: italic;
  }

  .chart-source a {
    color: #2D7D5A;
    text-decoration: none;
    border-bottom: 1px dotted rgba(45, 125, 90, 0.3);
  }

  @media (max-width: 768px) {
    .chart-container {
      height: 340px;
    }
  }
</style>

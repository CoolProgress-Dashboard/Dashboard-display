<script lang="ts">
  import { onMount } from 'svelte';
  import { acStockData, acMilestones, acGrowthSummary } from '$lib/data/ac-growth-data';

  let chartContainer: HTMLElement;
  let chartInstance: any;

  onMount(async () => {
    const echarts = await import('echarts');

    chartInstance = echarts.init(chartContainer);

    const years = acStockData.map(d => d.year);
    const stocks = acStockData.map(d => d.stockMillions);
    const isProjected = acStockData.map(d => d.isProjected);

    // Split into historical and projected for different styling
    const historicalData = stocks.map((v, i) => isProjected[i] ? null : v);
    const projectedData = stocks.map((v, i) => isProjected[i] ? v : null);

    // Bridge: last historical point also appears in projected
    const lastHistIdx = isProjected.indexOf(true) - 1;
    if (lastHistIdx >= 0 && lastHistIdx < projectedData.length) {
      projectedData[lastHistIdx] = stocks[lastHistIdx];
    }

    // Milestone markpoints
    const markPoints = acMilestones
      .filter(m => years.includes(m.year))
      .map(m => ({
        coord: [years.indexOf(m.year), stocks[years.indexOf(m.year)]],
        name: m.label,
        value: m.label,
        symbol: 'pin',
        symbolSize: 40,
        label: {
          show: true,
          formatter: (p: any) => p.name,
          fontSize: 9,
          color: '#fff'
        },
        itemStyle: { color: '#3D6B6B' }
      }));

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          const year = params[0].axisValue;
          const entry = acStockData.find(d => d.year === Number(year));
          if (!entry) return '';
          const billions = (entry.stockMillions / 1000).toFixed(1);
          let html = `<strong>${year}</strong><br/>`;
          html += `AC Stock: <strong>${entry.stockMillions.toLocaleString()}M</strong> (${billions}B)<br/>`;
          html += entry.isProjected
            ? '<span style="color:#E89B8C">Projected (IEA baseline)</span>'
            : '<span style="color:#8BC34A">Historical data</span>';
          const milestone = acMilestones.find(m => m.year === Number(year));
          if (milestone) {
            html += `<br/><br/><strong>${milestone.label}</strong><br/>${milestone.description}`;
          }
          return html;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: years,
        boundaryGap: false,
        axisLabel: { fontSize: 10, color: '#666' },
        axisLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: {
        type: 'value',
        name: 'Millions of units',
        nameTextStyle: { fontSize: 10, color: '#888' },
        axisLabel: {
          fontSize: 10,
          color: '#888',
          formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}B` : `${v}M`
        },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLine: { show: false }
      },
      series: [
        {
          name: 'Historical',
          type: 'line',
          data: historicalData,
          smooth: true,
          connectNulls: false,
          lineStyle: { width: 3, color: '#3D6B6B' },
          itemStyle: { color: '#3D6B6B' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(61, 107, 107, 0.25)' },
                { offset: 1, color: 'rgba(61, 107, 107, 0.02)' }
              ]
            }
          },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: 'Projected (IEA Baseline)',
          type: 'line',
          data: projectedData,
          smooth: true,
          connectNulls: false,
          lineStyle: { width: 3, color: '#E89B8C', type: 'dashed' },
          itemStyle: { color: '#E89B8C' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(232, 155, 140, 0.2)' },
                { offset: 1, color: 'rgba(232, 155, 140, 0.02)' }
              ]
            }
          },
          symbol: 'circle',
          symbolSize: 6,
          markPoint: {
            data: markPoints,
            label: { show: false }
          }
        }
      ],
      legend: {
        data: ['Historical', 'Projected (IEA Baseline)'],
        bottom: 0,
        textStyle: { fontSize: 11, color: '#666' }
      }
    };

    chartInstance.setOption(option);

    const resizeObserver = new ResizeObserver(() => chartInstance?.resize());
    resizeObserver.observe(chartContainer);

    return () => {
      resizeObserver.disconnect();
      chartInstance?.dispose();
    };
  });
</script>

<div class="ac-growth-chart card-panel">
  <div class="chart-header">
    <div class="chart-title">
      <i class="fa-solid fa-chart-area"></i>
      Global AC Stock Growth (1990 - 2050)
    </div>
    <div class="chart-subtitle-row">
      <span class="chart-subtitle">
        From {acGrowthSummary.totalStockToday} today to {acGrowthSummary.totalStock2050} by 2050
      </span>
      <span class="chart-highlight">
        <i class="fa-solid fa-arrow-trend-up"></i>
        {acGrowthSummary.acsSoldPerSecond} ACs sold every second
      </span>
    </div>
  </div>
  <div class="chart-container" bind:this={chartContainer}></div>
  <div class="chart-source">
    Sources: IEA Future of Cooling (2018); CCC Global Cooling Watch (2023)
  </div>
</div>

<style>
  .ac-growth-chart {
    padding: 1rem 1.25rem;
  }

  .chart-header {
    margin-bottom: 0.75rem;
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
</style>

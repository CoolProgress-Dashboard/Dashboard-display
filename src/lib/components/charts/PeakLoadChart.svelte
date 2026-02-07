<script lang="ts">
  import { onMount } from 'svelte';
  import { peakLoadByProjected, globalBaselineAvg } from '$lib/data/peak-load-data';

  let chartContainer: HTMLElement;
  let chartInstance: any;

  onMount(async () => {
    const echarts = await import('echarts');

    chartInstance = echarts.init(chartContainer);

    const countries = peakLoadByProjected.map(d => d.country);
    const baseline = peakLoadByProjected.map(d => d.baselinePercent);
    const projected = peakLoadByProjected.map(d => d.projectedPercent);

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any[]) => {
          const country = params[0].name;
          const entry = peakLoadByProjected.find(d => d.country === country);
          let html = `<strong>${country}</strong><br/>`;
          for (const p of params) {
            html += `${p.marker} ${p.seriesName}: <strong>${p.value}%</strong><br/>`;
          }
          if (entry) {
            const growth = entry.projectedPercent - entry.baselinePercent;
            html += `<span style="color:#8BC34A">Growth: +${growth} pp</span><br/>`;
            html += `<span style="color:#999;font-size:11px">${entry.source}</span>`;
          }
          return html;
        }
      },
      legend: {
        data: ['Baseline (2016-2018)', 'Projected (2050)'],
        bottom: 0,
        textStyle: { fontSize: 11, color: '#666' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: countries,
        axisLabel: {
          fontSize: 10,
          color: '#666',
          rotate: 30,
          interval: 0
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: {
        type: 'value',
        name: '% of peak load',
        nameTextStyle: { fontSize: 10, color: '#888' },
        max: 70,
        axisLabel: {
          fontSize: 10,
          color: '#888',
          formatter: '{value}%'
        },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLine: { show: false }
      },
      series: [
        {
          name: 'Baseline (2016-2018)',
          type: 'bar',
          data: baseline,
          barWidth: '30%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#4A7F7F' },
                { offset: 1, color: '#3D6B6B' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: 'Projected (2050)',
          type: 'bar',
          data: projected,
          barWidth: '30%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#E89B8C' },
                { offset: 1, color: '#E85A4F' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          }
        }
      ],
      markLine: {
        silent: true,
        data: [
          {
            yAxis: globalBaselineAvg.percent,
            label: {
              formatter: `Global avg ${globalBaselineAvg.percent}%`,
              position: 'end',
              fontSize: 10,
              color: '#888'
            },
            lineStyle: { type: 'dashed', color: '#94a3b8' }
          }
        ]
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

<div class="peak-load-chart card-panel">
  <div class="chart-header">
    <div class="chart-title">
      <i class="fa-solid fa-bolt"></i>
      Share of Cooling in Peak Electricity Load
    </div>
    <span class="chart-subtitle">
      Baseline vs. 2050 projections by country (IEA/CCC)
    </span>
  </div>
  <div class="chart-container" bind:this={chartContainer}></div>
  <div class="chart-source">
    Sources: <a href="https://www.iea.org/reports/the-future-of-cooling" target="_blank" rel="noopener noreferrer">IEA Future of Cooling (2018)</a>; <a href="https://www.cleancoolingcollaborative.org/" target="_blank" rel="noopener noreferrer">Clean Cooling Collaborative</a>
  </div>
</div>

<style>
  .peak-load-chart {
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

  .chart-subtitle {
    font-size: 0.78rem;
    color: #888;
    display: block;
    margin-top: 0.15rem;
  }

  .chart-container {
    width: 100%;
    height: 360px;
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

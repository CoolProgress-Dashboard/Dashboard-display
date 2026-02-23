<script lang="ts">
  import { onMount } from 'svelte';

  export let claspEnergy: any[] = [];
  export let appliances: string[] = ['Air Conditioning', 'Ceiling and Portable Fans', 'Refrigerator-Freezers'];

  let container: HTMLElement;
  let chartInstance: any;

  const YEARS = [2025, 2030, 2035, 2040, 2045, 2050];

  function buildOption(data: any[], apps: string[]) {
    const cumulMEPS: number[]  = [];
    const cumulDeepEE: number[] = [];
    const cumulGrid: number[]  = [];

    YEARS.forEach((yr) => {
      const yearData = data.filter((r: any) => r.year === yr && apps.includes(r.appliance));
      let gbCumul = 0, nzhCumul = 0, batCumul = 0, batNzgCumul = 0;
      yearData.forEach((r: any) => {
        gbCumul     += r.gb_cumul_co2_red_mt      || 0;
        nzhCumul    += r.nzh_cumul_co2_red_mt     || 0;
        batCumul    += r.bat_cumul_co2_red_mt      || 0;
        batNzgCumul += r.bat_cumul_co2_red_nzg_mt || 0;
      });
      cumulMEPS.push(+gbCumul.toFixed(0));
      cumulDeepEE.push(+(nzhCumul - gbCumul).toFixed(0));
      // bat_cumul_co2_red_mt = total EE savings; bat_cumul_co2_red_nzg_mt = remaining under NZG
      // Grid contribution = total EE savings − remaining after grid decarb
      cumulGrid.push(+(batCumul - batNzgCumul).toFixed(0));
    });

    return {
      tooltip: {
        trigger: 'axis',
        confine: true,
        formatter: (params: any) => {
          let result = params[0].axisValue + '<br/>';
          let total = 0;
          params.forEach((p: any) => {
            result += `${p.marker} ${p.seriesName}: ${p.value.toLocaleString()} Mt<br/>`;
            total += p.value;
          });
          result += `<strong>Total: ${total.toLocaleString()} Mt CO₂e cumulative</strong>`;
          return result;
        }
      },
      legend: { bottom: 0, textStyle: { fontSize: 10 } },
      grid: { left: '3%', right: '3%', bottom: '22%', top: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        data: YEARS.map(String),
        axisLabel: { fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLabel: {
          fontSize: 9,
          formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : String(v)
        }
      },
      series: [
        {
          name: 'MEPS & Labels',
          type: 'line',
          stack: 'cumulative',
          areaStyle: { opacity: 0.6 },
          data: cumulMEPS,
          smooth: true,
          itemStyle: { color: '#8BC34A' }
        },
        {
          name: 'Deep Efficiency',
          type: 'line',
          stack: 'cumulative',
          areaStyle: { opacity: 0.6 },
          data: cumulDeepEE,
          smooth: true,
          itemStyle: { color: '#66BB6A' }
        },
        {
          name: 'Grid Decarbonization',
          type: 'line',
          stack: 'cumulative',
          areaStyle: { opacity: 0.5 },
          data: cumulGrid,
          smooth: true,
          itemStyle: { color: '#3D6B6B' }
        }
      ]
    };
  }

  onMount(async () => {
    const echarts = await import('echarts');

    // Double rAF ensures both charts in the CSS grid have settled their column widths
    // before ECharts reads container.offsetWidth for canvas sizing.
    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

    chartInstance = echarts.init(container);
    chartInstance.setOption(buildOption(claspEnergy, appliances));

    const obs = new ResizeObserver(() => chartInstance?.resize());
    obs.observe(container);

    return () => {
      obs.disconnect();
      chartInstance?.dispose();
    };
  });

  // Re-render whenever props change
  $: if (chartInstance) {
    chartInstance.setOption(buildOption(claspEnergy, appliances), true);
  }
</script>

<div class="chart-wrap">
  <div class="chart-label">
    <i class="fa-solid fa-chart-area"></i>
    Cumulative Savings (2025–2050)
    <a href="/methodology#cumulative" title="View methodology">
      <i class="fa-solid fa-circle-info"></i>
    </a>
  </div>
  <div class="chart-container" bind:this={container}></div>
</div>

<style>
  .chart-wrap {
    min-width: 0;
    overflow: hidden;
  }

  .chart-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #3D6B6B;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chart-label a {
    font-size: 0.6rem;
    color: #94a3b8;
    text-decoration: none;
    margin-left: 0.2rem;
    flex-shrink: 0;
  }

  .chart-container {
    width: 100%;
    height: 280px;
    overflow: hidden;
  }
</style>

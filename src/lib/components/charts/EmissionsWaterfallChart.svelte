<script lang="ts">
  import { onMount } from 'svelte';

  export let claspEnergy: any[] = [];
  export let year: number = 2030;
  export let appliances: string[] = ['Air Conditioning', 'Ceiling and Portable Fans', 'Refrigerator-Freezers'];

  let container: HTMLElement;
  let chartInstance: any;

  function buildOption(data: any[], yr: number, apps: string[]) {
    const yearData = data.filter((r: any) => r.year === yr && apps.includes(r.appliance));

    let bauTotal = 0, gbTotal = 0, nzhTotal = 0, batTotal = 0, batNzgTotal = 0;
    yearData.forEach((r: any) => {
      bauTotal  += r.bau_co2_mt     || 0;
      gbTotal   += r.gb_co2_mt      || 0;
      nzhTotal  += r.nzh_co2_mt     || 0;
      batTotal  += r.bat_co2_mt     || 0;
      batNzgTotal += r.bat_co2_nzg_mt || 0;
    });

    const mepsSavings   = bauTotal  - gbTotal;
    const deepEeSavings = gbTotal   - nzhTotal;
    const techSavings   = nzhTotal  - batTotal;
    const gridSavings   = batTotal  - batNzgTotal;
    const remaining     = batNzgTotal;

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        confine: true,
        formatter: (params: any) => {
          if (!params?.length) return '';
          const item = params.find((p: any) => p.value !== 0 && p.seriesName !== 'Placeholder');
          if (!item) return '';
          return `${item.name}: ${Math.abs(item.value).toFixed(0)} Mt CO₂`;
        }
      },
      grid: { left: '5%', right: '10%', bottom: '15%', top: '18%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['BAU', 'MEPS &\nLabels', 'Deep\nEfficiency', 'Best\nAvailable', 'Grid\nDecarb', 'Net\nEmissions'],
        axisLabel: { fontSize: 9, interval: 0 }
      },
      yAxis: {
        type: 'value',
        name: 'Mt CO₂',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
        axisLabel: { fontSize: 10 }
      },
      series: [
        {
          name: 'Placeholder',
          type: 'bar',
          stack: 'waterfall',
          itemStyle: { color: 'transparent' },
          emphasis: { itemStyle: { color: 'transparent' } },
          data: [0, gbTotal, nzhTotal, batTotal, batNzgTotal, 0]
        },
        {
          name: 'Values',
          type: 'bar',
          stack: 'waterfall',
          data: [
            { value: bauTotal,       itemStyle: { color: '#E85A4F' } },
            { value: -mepsSavings,   itemStyle: { color: '#8BC34A' } },
            { value: -deepEeSavings, itemStyle: { color: '#66BB6A' } },
            { value: -techSavings,   itemStyle: { color: '#43A047' } },
            { value: -gridSavings,   itemStyle: { color: '#3D6B6B' } },
            { value: remaining,      itemStyle: { color: '#f59e0b' } }
          ],
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              const v = Math.abs(params.value);
              if (v < 0.1) return '';
              return v >= 10 ? `${v.toFixed(0)}` : `${v.toFixed(1)}`;
            },
            fontSize: 10,
            fontWeight: 'bold',
            color: '#333'
          }
        }
      ]
    };
  }

  onMount(async () => {
    const echarts = await import('echarts');

    // Double rAF ensures the CSS grid has settled column widths before ECharts reads offsetWidth
    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

    chartInstance = echarts.init(container);
    chartInstance.setOption(buildOption(claspEnergy, year, appliances));

    const obs = new ResizeObserver(() => chartInstance?.resize());
    obs.observe(container);

    return () => {
      obs.disconnect();
      chartInstance?.dispose();
    };
  });

  // Re-render whenever props change
  $: if (chartInstance) {
    chartInstance.setOption(buildOption(claspEnergy, year, appliances), true);
  }
</script>

<div class="chart-wrap">
  <div class="chart-label">
    <i class="fa-solid fa-chart-column"></i>
    Waterfall: BAU → Net Emissions
    <a href="/methodology#waterfall" title="View methodology">
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
  }

  .chart-label a {
    font-size: 0.6rem;
    color: #94a3b8;
    text-decoration: none;
    margin-left: 0.2rem;
  }

  .chart-container {
    width: 100%;
    height: 280px;
  }
</style>

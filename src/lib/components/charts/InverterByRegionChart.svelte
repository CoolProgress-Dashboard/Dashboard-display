<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';

  export let data: Array<{ name: string; avg: number }> = [];

  let container: HTMLElement;
  let chartInstance: any;

  function buildOption(d: typeof data) {
    const sorted = [...d].sort((a, b) => b.avg - a.avg);
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        confine: true,
        formatter: (params: any) =>
          `<strong>${params[0].axisValue}</strong><br/>Inverter share: <strong>${params[0].value}%</strong>`
      },
      grid: { left: '8%', right: '5%', bottom: '25%', top: '12%', containLabel: true },
      xAxis: {
        type: 'category',
        data: sorted.map(r => r.name),
        axisLabel: { rotate: 45, fontSize: 12, interval: 0 }
      },
      yAxis: {
        type: 'value',
        name: '% Inverter',
        max: 100,
        nameTextStyle: { fontSize: 13 },
        axisLabel: { formatter: (v: number) => v + '%', fontSize: 12 }
      },
      series: [{
        type: 'bar',
        data: sorted.map(r => ({
          value: r.avg,
          itemStyle: {
            color: r.avg >= 75 ? '#3D6B6B' : r.avg >= 50 ? '#8BC34A' : r.avg >= 25 ? '#f59e0b' : '#E85A4F'
          }
        })),
        label: {
          show: true,
          position: 'top',
          fontSize: 13,
          fontWeight: 'bold',
          formatter: (p: any) => p.value + '%'
        }
      }]
    };
  }

  onMount(async () => {
    const echarts = await import('echarts');
    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    chartInstance = echarts.init(container);
    chartInstance.setOption(buildOption(data));
    const obs = new ResizeObserver(() => chartInstance?.resize());
    obs.observe(container);
    return () => { obs.disconnect(); chartInstance?.dispose(); };
  });

  afterUpdate(() => {
    if (chartInstance) chartInstance.setOption(buildOption(data), true);
  });
</script>

<div class="chart-container" bind:this={container}></div>

<style>
  .chart-container {
    width: 100%;
    height: 280px;
    overflow: hidden;
  }
</style>

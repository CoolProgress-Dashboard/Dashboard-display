<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';

  export let data: Array<{ name: string; pct: number }> = [];

  let container: HTMLElement;
  let chartInstance: any;

  function buildOption(d: typeof data) {
    const top15 = [...d].sort((a, b) => b.pct - a.pct).slice(0, 15);
    const names = top15.map(r => r.name).reverse();
    const values = top15.map(r => r.pct).reverse();
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        confine: true,
        formatter: (params: any) =>
          `<strong>${params[0].axisValue}</strong><br/>Inverter share: <strong>${params[0].value}%</strong>`
      },
      grid: { left: '20%', right: '12%', bottom: '8%', top: '8%', containLabel: true },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: (v: number) => v + '%', fontSize: 12 }
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLabel: { fontSize: 12 }
      },
      series: [{
        type: 'bar',
        data: values.map(v => ({
          value: v,
          itemStyle: {
            color: v >= 75 ? '#3D6B6B' : v >= 50 ? '#8BC34A' : '#f59e0b'
          }
        })),
        label: {
          show: true,
          position: 'right',
          fontSize: 12,
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
    height: 320px;
    overflow: hidden;
  }
</style>

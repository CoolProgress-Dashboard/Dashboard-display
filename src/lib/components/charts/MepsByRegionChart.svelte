<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';

  export let regionData: Array<{ name: string; meps: number; labels: number; total: number }> = [];

  let container: HTMLElement;
  let chartInstance: any;

  function buildOption(data: typeof regionData) {
    const names = data.map(r => r.name);
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        confine: true,
        formatter: (params: any) => {
          const region = params[0]?.axisValue;
          const row = data.find(r => r.name === region);
          const total = row?.total || 1;
          let tip = `<strong>${region}</strong> (${total} countries)`;
          params.forEach((p: any) => {
            const count = p.seriesName === 'MEPS' ? row?.meps || 0 : row?.labels || 0;
            tip += `<br>${p.marker} ${p.seriesName}: <strong>${p.value}%</strong> (${count} of ${total})`;
          });
          return tip;
        }
      },
      legend: { data: ['MEPS', 'Labels'], top: 5, textStyle: { fontSize: 13 } },
      grid: { left: '8%', right: '5%', bottom: '25%', top: '18%', containLabel: true },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: { rotate: 45, fontSize: 12, interval: 0 }
      },
      yAxis: {
        type: 'value',
        name: '% of Countries',
        max: 100,
        nameTextStyle: { fontSize: 13 },
        axisLabel: { formatter: (v: number) => v + '%', fontSize: 12 }
      },
      series: [
        {
          name: 'MEPS',
          type: 'bar',
          data: data.map(r => Math.round((r.meps / (r.total || 1)) * 100)),
          color: '#4A7F7F',
          barGap: '10%',
          label: { show: true, position: 'top', fontSize: 13, fontWeight: 'bold', formatter: (p: any) => p.value + '%' }
        },
        {
          name: 'Labels',
          type: 'bar',
          data: data.map(r => Math.round((r.labels / (r.total || 1)) * 100)),
          color: '#f59e0b',
          label: { show: true, position: 'top', fontSize: 13, fontWeight: 'bold', formatter: (p: any) => p.value + '%' }
        }
      ]
    };
  }

  onMount(async () => {
    const echarts = await import('echarts');

    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

    chartInstance = echarts.init(container);
    chartInstance.setOption(buildOption(regionData));

    const obs = new ResizeObserver(() => chartInstance?.resize());
    obs.observe(container);

    return () => {
      obs.disconnect();
      chartInstance?.dispose();
    };
  });

  // afterUpdate fires reliably after every prop change (including async ones from onMount closures)
  afterUpdate(() => {
    if (chartInstance) {
      chartInstance.setOption(buildOption(regionData), true);
    }
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

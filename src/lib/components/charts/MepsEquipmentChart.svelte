<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';

  export let equipment: Array<{ type: string; meps: number; labels: number }> = [];
  export let countryHtml: string = '';

  let container: HTMLElement;
  let chartInstance: any;

  function buildOption(data: typeof equipment) {
    const types = data.map(r => r.type).slice().reverse();
    const mepsData = data.map(r => r.meps).slice().reverse();
    const labelsData = data.map(r => r.labels).slice().reverse();
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        confine: true,
        formatter: (params: any) => {
          let tip = `<strong>${params[0]?.axisValue}</strong>`;
          params.forEach((p: any) => { tip += `<br>${p.marker} ${p.seriesName}: ${p.value} countries`; });
          return tip;
        }
      },
      legend: { data: ['MEPS', 'Labels'], top: 5, textStyle: { fontSize: 11 } },
      grid: { left: '22%', right: '8%', bottom: '8%', top: '15%', containLabel: true },
      xAxis: { type: 'value', axisLabel: { fontSize: 9 } },
      yAxis: {
        type: 'category',
        data: types,
        axisLabel: { fontSize: 10 }
      },
      series: [
        {
          name: 'MEPS',
          type: 'bar',
          data: mepsData,
          color: '#4A7F7F',
          barGap: '10%'
        },
        {
          name: 'Labels',
          type: 'bar',
          data: labelsData,
          color: '#f59e0b'
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
    chartInstance.setOption(buildOption(equipment));

    const obs = new ResizeObserver(() => chartInstance?.resize());
    obs.observe(container);

    return () => {
      obs.disconnect();
      chartInstance?.dispose();
    };
  });

  // afterUpdate fires reliably after every prop change
  afterUpdate(() => {
    if (chartInstance && !countryHtml) {
      chartInstance.setOption(buildOption(equipment), true);
      // Resize in case chart was hidden (country view) and is now shown again
      requestAnimationFrame(() => chartInstance?.resize());
    }
  });
</script>

<!-- Chart div always in DOM; HTML panel overlays when in country view -->
<div class="chart-wrap">
  {#if countryHtml}
    <div class="html-content">
      {@html countryHtml}
    </div>
  {/if}
  <div class="chart-container" class:hidden={!!countryHtml} bind:this={container}></div>
</div>

<style>
  .chart-wrap {
    position: relative;
    min-width: 0;
    overflow: hidden;
  }

  .html-content {
    overflow: auto;
    height: 220px;
    min-height: 220px;
  }

  .chart-container {
    width: 100%;
    height: 220px;
    overflow: hidden;
  }

  .chart-container.hidden {
    display: none;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import mepsTimeline from '$lib/data/meps_timeline.json';
  import mepsLevels from '$lib/data/meps_levels.json';

  let chartContainer: HTMLElement;
  let chartInstance: any;

  type ApplianceTab = 'AC' | 'Refrigerator' | 'Fan';
  let selectedAppliance: ApplianceTab = 'AC';

  // Country config: color, default visibility
  interface CountryConfig {
    code: string;
    name: string;
    color: string;
    defaultOn: boolean;
  }

  const countryConfigs: CountryConfig[] = [
    { code: 'IN', name: 'India', color: '#FF6B35', defaultOn: true },
    { code: 'CN', name: 'China', color: '#DC2626', defaultOn: true },
    { code: 'EU', name: 'EU', color: '#2563EB', defaultOn: true },
    { code: 'US', name: 'USA (South)', color: '#059669', defaultOn: true },
    { code: 'BR', name: 'Brazil', color: '#D97706', defaultOn: true },
    { code: 'JP', name: 'Japan', color: '#7C3AED', defaultOn: false },
    { code: 'KR', name: 'South Korea', color: '#0891B2', defaultOn: false },
    { code: 'SA', name: 'Saudi Arabia', color: '#BE185D', defaultOn: false },
    { code: 'ZA', name: 'South Africa', color: '#4F46E5', defaultOn: false },
    { code: 'AU', name: 'Australia', color: '#0D9488', defaultOn: false },
    { code: 'SG', name: 'Singapore', color: '#EA580C', defaultOn: false },
    { code: 'NG', name: 'Nigeria', color: '#65A30D', defaultOn: false },
    { code: 'SADC', name: 'SADC Region', color: '#9333EA', defaultOn: false },
    { code: 'EAC', name: 'EAC Region', color: '#B45309', defaultOn: false },
    { code: 'ECOWAS', name: 'ECOWAS Region', color: '#059669', defaultOn: false },
    { code: 'ASEAN', name: 'ASEAN Region', color: '#0284C7', defaultOn: false },
  ];

  // Track enabled countries
  let enabledCountries: Set<string> = new Set(
    countryConfigs.filter(c => c.defaultOn).map(c => c.code)
  );

  function toggleCountry(code: string) {
    if (enabledCountries.has(code)) {
      enabledCountries.delete(code);
    } else {
      enabledCountries.add(code);
    }
    enabledCountries = new Set(enabledCountries);
    updateChart();
  }

  // U4E reference levels
  const u4eRef: Record<ApplianceTab, { value: number; label: string } | null> = {
    AC: { value: 5.1, label: 'U4E Recommended (CSPF 5.1)' },
    Refrigerator: { value: 102, label: 'U4E Baseline (EEI 102)' },
    Fan: null,
  };

  // U4E high efficiency target
  const u4eHighEfficiency: Record<ApplianceTab, { value: number; label: string } | null> = {
    AC: { value: 8.75, label: 'Global Cooling Prize (8.75)' },
    Refrigerator: { value: 50, label: 'U4E High Efficiency (EEI 50)' },
    Fan: null,
  };

  // Appliance tab options
  const applianceTabs: { key: ApplianceTab; label: string }[] = [
    { key: 'AC', label: 'Air Conditioners' },
    { key: 'Refrigerator', label: 'Refrigerators' },
    { key: 'Fan', label: 'Fans' },
  ];

  // Show methodology
  let showMethodology = false;

  // Get timeline data for a specific appliance and country
  function getTimelineData(appliance: ApplianceTab, countryCode: string) {
    return mepsTimeline.filter(
      (d: any) => d.appliance_type === appliance && d.country_code === countryCode
    ).sort((a: any, b: any) => a.year - b.year);
  }

  // Get level data for a specific appliance and country
  function getLevelData(appliance: ApplianceTab, countryCode: string) {
    return mepsLevels.filter(
      (d: any) => d.appliance_type === appliance && d.country_code === countryCode
    );
  }

  // Get available countries for the selected appliance from timeline data
  function getAvailableCountries(appliance: ApplianceTab): string[] {
    const codes = new Set<string>();
    for (const d of mepsTimeline) {
      if ((d as any).appliance_type === appliance) {
        codes.add((d as any).country_code);
      }
    }
    return Array.from(codes);
  }

  // Get display name for country code
  function getCountryName(code: string): string {
    // First check countryConfigs
    const cfg = countryConfigs.find(c => c.code === code);
    if (cfg) return cfg.name;
    // Then check timeline data
    const entry = mepsTimeline.find((d: any) => d.country_code === code);
    return entry ? (entry as any).country_name : code;
  }

  // Get color for country
  function getCountryColor(code: string): string {
    const cfg = countryConfigs.find(c => c.code === code);
    return cfg ? cfg.color : '#888888';
  }

  function buildChartOption() {
    const appliance = selectedAppliance;

    if (appliance === 'AC') {
      return buildTimelineChart('AC', 'CSPF Equivalent (W/W)', true);
    }

    if (appliance === 'Refrigerator') {
      return buildTimelineChart('Refrigerator', 'Energy Efficiency Index (EEI)', false);
    }

    // For Fans, show a simpler comparison (no universal metric exists)
    return buildNonAcChart(appliance);
  }

  function buildTimelineChart(appliance: ApplianceTab, yAxisLabel: string, higherIsBetter: boolean) {
    const excludeCodes = appliance === 'AC'
      ? ['U4E', 'GCP']
      : ['U4E_FRIDGE', 'U4E_FRIDGE_HE'];
    const availableCodes = getAvailableCountries(appliance);
    const activeCodes = availableCodes.filter(c =>
      enabledCountries.has(c) && !excludeCodes.includes(c)
    );

    let minYear = appliance === 'AC' ? 2006 : 2001;
    let maxYear = 2035;

    const series: any[] = [];

    for (const code of activeCodes) {
      const data = getTimelineData(appliance, code);
      if (data.length === 0) continue;

      const color = getCountryColor(code);
      const name = getCountryName(code);

      const historicalPoints = data.filter((d: any) => !d.is_projected);
      const projectedPoints = data.filter((d: any) => d.is_projected);

      if (historicalPoints.length > 0) {
        series.push({
          name: name,
          type: 'line',
          data: historicalPoints.map((d: any) => [d.year, d.meps_level_cspf_equiv]),
          lineStyle: { width: 2.5, color },
          itemStyle: { color },
          symbol: 'circle',
          symbolSize: 6,
          connectNulls: false,
          emphasis: { focus: 'series' },
        });
      }

      if (projectedPoints.length > 0) {
        const bridgeData: [number, number][] = [];
        if (historicalPoints.length > 0) {
          const lastHist = historicalPoints[historicalPoints.length - 1];
          bridgeData.push([lastHist.year, lastHist.meps_level_cspf_equiv]);
        }
        for (const d of projectedPoints) {
          bridgeData.push([d.year, d.meps_level_cspf_equiv]);
        }

        series.push({
          name: name + ' (projected)',
          type: 'line',
          data: bridgeData,
          lineStyle: { width: 2, color, type: 'dashed' },
          itemStyle: { color, opacity: 0.7 },
          symbol: 'diamond',
          symbolSize: 5,
          connectNulls: false,
          emphasis: { focus: 'series' },
        });
      }
    }

    // U4E reference line
    const u4e = u4eRef[appliance];
    if (u4e) {
      series.push({
        name: u4e.label,
        type: 'line',
        data: [[minYear, u4e.value], [maxYear, u4e.value]],
        lineStyle: { width: 2, color: '#94a3b8', type: 'dashed' },
        itemStyle: { color: '#94a3b8' },
        symbol: 'none',
      });
    }

    // High efficiency target line
    const heTarget = u4eHighEfficiency[appliance];
    if (heTarget) {
      series.push({
        name: heTarget.label,
        type: 'line',
        data: [[minYear, heTarget.value], [maxYear, heTarget.value]],
        lineStyle: { width: 1.5, color: '#8BC34A', type: 'dotted' },
        itemStyle: { color: '#8BC34A' },
        symbol: 'none',
      });
    }

    const metricLabel = appliance === 'AC' ? 'CSPF Equivalent' : 'EEI';
    const directionNote = higherIsBetter ? '' : ' (lower = more stringent)';

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (!params.data || !Array.isArray(params.data)) return '';
          const [year, val] = params.data;
          const seriesName = params.seriesName.replace(' (projected)', '');
          const isProjected = params.seriesName.includes('projected');

          let html = `<strong>${seriesName}</strong> (${year})${isProjected ? ' <em style="color:#94a3b8">projected</em>' : ''}<br/>`;
          html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${params.color};margin-right:4px;"></span>`;
          html += `${metricLabel}: <strong>${val.toFixed(appliance === 'AC' ? 2 : 0)}</strong><br/>`;

          const code = countryConfigs.find(c => c.name === seriesName)?.code;
          if (code) {
            const entry = mepsTimeline.find(
              (d: any) => d.country_code === code && d.year === year && d.appliance_type === appliance
            );
            if (entry) {
              const e = entry as any;
              if (e.standard_version) {
                html += `<span style="color:#888;font-size:0.85em">${e.standard_version}</span><br/>`;
              }
              html += `<span style="color:#aaa;font-size:0.8em">Source: ${e.source}</span>`;
            }
          }

          return html;
        }
      },
      grid: { left: '3%', right: '12%', bottom: '12%', top: '8%', containLabel: true },
      xAxis: {
        type: 'value',
        name: 'Year',
        min: minYear,
        max: maxYear,
        interval: 5,
        nameTextStyle: { fontSize: 10, color: '#888' },
        axisLabel: { fontSize: 10, color: '#666', formatter: (v: number) => String(v) },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: yAxisLabel + directionNote,
        min: appliance === 'AC' ? 0 : undefined,
        nameTextStyle: { fontSize: 10, color: '#888' },
        axisLabel: { fontSize: 10, color: '#888', formatter: (v: number) => appliance === 'AC' ? v.toFixed(1) : String(Math.round(v)) },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLine: { show: false },
        inverse: !higherIsBetter,
      },
      series,
      legend: { show: false },
    };
  }

  function buildNonAcChart(appliance: ApplianceTab) {
    // For refrigerators/fans, show a bar chart of current MEPS levels by country
    const entries = mepsLevels.filter((d: any) =>
      d.appliance_type === appliance &&
      enabledCountries.has(d.country_code)
    );

    const countries = entries.map((d: any) => d.country_name);
    const values = entries.map((d: any) => d.metric_value || 0);
    const colors = entries.map((d: any) => getCountryColor(d.country_code));
    const metrics = entries.map((d: any) => d.metric_name);
    const notes = entries.map((d: any) => d.notes);
    const standards = entries.map((d: any) => d.standard_name);

    const yAxisName = appliance === 'Refrigerator'
      ? 'National Metric Value'
      : 'National Metric Value';

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any[]) => {
          const idx = params[0].dataIndex;
          const entry = entries[idx] as any;
          let html = `<strong>${entry.country_name}</strong><br/>`;
          html += `Metric: ${entry.metric_name}<br/>`;
          if (entry.metric_value) {
            html += `Value: <strong>${entry.metric_value}</strong><br/>`;
          }
          html += `Standard: ${entry.standard_name}<br/>`;
          html += `Year adopted: ${entry.year_adopted || 'N/A'}<br/>`;
          if (entry.notes) {
            html += `<span style="color:#888;font-size:0.85em;max-width:280px;display:inline-block;word-wrap:break-word;">${entry.notes}</span>`;
          }
          return html;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: countries,
        axisLabel: { fontSize: 10, color: '#666', rotate: 25, interval: 0 },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameTextStyle: { fontSize: 10, color: '#888' },
        axisLabel: { fontSize: 10, color: '#888' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLine: { show: false },
      },
      series: [{
        name: 'MEPS Level',
        type: 'bar',
        data: values.map((v: number, i: number) => ({
          value: v,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: colors[i] + 'CC' },
                { offset: 1, color: colors[i] }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          }
        })),
        barWidth: '50%',
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          color: '#555',
          formatter: (p: any) => {
            const idx = p.dataIndex;
            return metrics[idx];
          }
        }
      }],
      legend: { show: false },
    };
  }

  function updateChart() {
    if (!chartInstance) return;
    chartInstance.setOption(buildChartOption(), true);
  }

  $: selectedAppliance, updateChart();

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

<div class="meps-level-chart card-panel chart-card">
  <div class="chart-header">
    <div class="chart-title">
      <i class="fa-solid fa-chart-line" style="color: #8BC34A; margin-right: 0.5rem;"></i>
      MEPS Stringency Over Time
    </div>
    <span class="chart-subtitle">
      {#if selectedAppliance === 'AC'}
        Harmonized to ISO CSPF (W/W) for cross-country comparison
      {:else if selectedAppliance === 'Refrigerator'}
        Harmonized to EEI (lower = more stringent) for cross-country comparison
      {:else}
        National metrics shown (no universal fan metric exists)
      {/if}
    </span>
  </div>

  <!-- Appliance tabs -->
  <div class="meps-tab-row">
    {#each applianceTabs as tab}
      <button
        class="chart-pill"
        class:active={selectedAppliance === tab.key}
        on:click={() => { selectedAppliance = tab.key; }}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Country toggles -->
  <div class="meps-country-toggles">
    {#each countryConfigs as cfg}
      {#if getAvailableCountries(selectedAppliance).includes(cfg.code) || enabledCountries.has(cfg.code)}
        <label
          class="meps-country-toggle"
          class:disabled={!getAvailableCountries(selectedAppliance).includes(cfg.code)}
        >
          <input
            type="checkbox"
            checked={enabledCountries.has(cfg.code)}
            disabled={!getAvailableCountries(selectedAppliance).includes(cfg.code)}
            on:change={() => toggleCountry(cfg.code)}
          />
          <span class="meps-country-dot" style="background: {cfg.color};"></span>
          <span class="meps-country-name">{cfg.name}</span>
        </label>
      {/if}
    {/each}
  </div>

  <!-- Chart -->
  <div class="chart-container" bind:this={chartContainer}></div>

  <!-- Legend note for timeline charts -->
  {#if selectedAppliance === 'AC' || selectedAppliance === 'Refrigerator'}
    <div class="meps-legend-note">
      <span class="meps-legend-item">
        <span class="meps-legend-line solid"></span> Historical
      </span>
      <span class="meps-legend-item">
        <span class="meps-legend-line dashed"></span> Projected/Planned
      </span>
      {#if selectedAppliance === 'AC'}
        <span class="meps-legend-item">
          <span class="meps-legend-line ref"></span> U4E Recommended (5.1)
        </span>
        <span class="meps-legend-item">
          <span class="meps-legend-line gcp"></span> Global Cooling Prize (8.75)
        </span>
      {:else}
        <span class="meps-legend-item">
          <span class="meps-legend-line ref"></span> U4E Baseline (EEI 102)
        </span>
        <span class="meps-legend-item">
          <span class="meps-legend-line gcp"></span> U4E High Efficiency (EEI 50)
        </span>
      {/if}
    </div>
  {/if}

  <!-- Methodology toggle -->
  <div class="meps-methodology-toggle">
    <button class="meps-info-btn" on:click={() => showMethodology = !showMethodology}>
      <i class="fa-solid fa-circle-info"></i>
      {showMethodology ? 'Hide' : 'Show'} {selectedAppliance === 'Refrigerator' ? 'EEI' : 'CSPF'} Harmonization Methodology
    </button>
  </div>

  {#if showMethodology}
    <div class="meps-methodology-card">
      {#if selectedAppliance === 'AC'}
        <h4><i class="fa-solid fa-flask"></i> CSPF Harmonization Note</h4>
        <p>
          Different countries use different seasonal performance metrics for air conditioners.
          All national MEPS values are converted to an approximate ISO CSPF equivalent (W/W).
        </p>
        <div class="meps-conversion-table">
          <div class="meps-conv-row header"><span>National Metric</span><span>Countries</span><span>Conversion</span></div>
          <div class="meps-conv-row"><span>CSPF (ISO 16358)</span><span>China, Singapore, ASEAN, SADC</span><span>1:1</span></div>
          <div class="meps-conv-row"><span>APF (JIS)</span><span>Japan</span><span>x 0.90</span></div>
          <div class="meps-conv-row"><span>ISEER</span><span>India</span><span>x 0.92</span></div>
          <div class="meps-conv-row"><span>EU SEER</span><span>EU-27</span><span>x 0.95</span></div>
          <div class="meps-conv-row"><span>SEER2</span><span>USA</span><span>x 0.293 x 1.1</span></div>
          <div class="meps-conv-row"><span>EER</span><span>Saudi Arabia, Ghana</span><span>x 1.062 (fixed)</span></div>
          <div class="meps-conv-row"><span>AEER</span><span>Australia, NZ</span><span>x 1.06</span></div>
        </div>
      {:else if selectedAppliance === 'Refrigerator'}
        <h4><i class="fa-solid fa-flask"></i> EEI Harmonization Note</h4>
        <p>
          Countries use different refrigerator efficiency metrics (kWh/yr, TEEI%, EEI, star ratings).
          To compare, all values are normalized to a common Energy Efficiency Index (EEI) using a
          reference 400L frost-free refrigerator-freezer at 24°C (IEC 62552-3:2015).
        </p>
        <p>
          <strong>EEI = (MEPS max AEC / Reference AEC) × 100</strong> — Lower EEI = more stringent MEPS.
          Reference AEC ≈ 274 kWh/yr for a 400L combo (300L fresh + 100L frozen).
        </p>
        <div class="meps-conversion-table">
          <div class="meps-conv-row header"><span>National Metric</span><span>Countries</span><span>To EEI</span></div>
          <div class="meps-conv-row"><span>EEI (direct)</span><span>EU, SADC, EAC, Australia</span><span>1:1</span></div>
          <div class="meps-conv-row"><span>kWh/yr (400L ref)</span><span>USA, India, Japan, Korea</span><span>÷ 2.74</span></div>
          <div class="meps-conv-row"><span>TEEI (%)</span><span>China</span><span>≈ TEEI × 1.0</span></div>
          <div class="meps-conv-row"><span>kWh/month</span><span>Brazil</span><span>× 12 ÷ 2.74</span></div>
        </div>
      {:else}
        <h4><i class="fa-solid fa-flask"></i> Fan Metric Note</h4>
        <p>
          No universal fan efficiency metric exists. India and China use max wattage (W, lower = better),
          while the USA uses CFM/W (higher = better). Values are shown in national metrics.
        </p>
      {/if}
      <p class="meps-caveat">
        All conversions are approximate. Test condition variations, product scope, and
        climate assumptions affect real-world equivalence. See full methodology for details.
      </p>
    </div>
  {/if}

  <div class="chart-source">
    Sources:
    <a href="https://cprc-clasp.ngo/" target="_blank" rel="noopener noreferrer">CLASP CPRC</a>;
    <a href="https://united4efficiency.org" target="_blank" rel="noopener noreferrer">UNEP U4E</a>;
    <a href="https://www.iea.org/policies" target="_blank" rel="noopener noreferrer">IEA Policies DB</a>;
    <a href="https://eta-publications.lbl.gov" target="_blank" rel="noopener noreferrer">LBNL</a>
    &middot;
    <a href="/methodology" style="font-weight: 700;">Methodology</a>
  </div>
</div>

<style>
  .meps-level-chart {
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
  }

  .chart-subtitle {
    font-size: 0.78rem;
    color: #888;
    display: block;
    margin-top: 0.15rem;
  }

  .meps-tab-row {
    display: flex;
    gap: 0.4rem;
    margin: 0.5rem 0;
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

  /* Country toggles */
  .meps-country-toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 0.6rem;
    margin: 0.4rem 0 0.6rem;
    padding: 0.5rem 0.6rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #f1f5f9;
  }

  .meps-country-toggle {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    font-size: 0.7rem;
    color: #555;
    transition: opacity 0.2s ease;
  }

  .meps-country-toggle.disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .meps-country-toggle input {
    width: 12px;
    height: 12px;
    cursor: inherit;
    accent-color: #3D6B6B;
  }

  .meps-country-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .meps-country-name {
    font-weight: 500;
    white-space: nowrap;
  }

  .chart-container {
    width: 100%;
    height: 400px;
  }

  /* Legend note */
  .meps-legend-note {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 0.25rem;
    padding: 0.4rem 0;
  }

  .meps-legend-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.68rem;
    color: #888;
  }

  .meps-legend-line {
    width: 20px;
    height: 0;
    border-top: 2px solid #555;
  }

  .meps-legend-line.solid {
    border-top-style: solid;
  }

  .meps-legend-line.dashed {
    border-top-style: dashed;
  }

  .meps-legend-line.ref {
    border-top: 2px dashed #94a3b8;
  }

  .meps-legend-line.gcp {
    border-top: 2px dotted #8BC34A;
  }

  /* Methodology */
  .meps-methodology-toggle {
    text-align: center;
    margin: 0.5rem 0;
  }

  .meps-info-btn {
    font-size: 0.72rem;
    font-weight: 600;
    color: #3D6B6B;
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    padding: 0.3rem 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .meps-info-btn:hover {
    background: #f0f7f0;
    border-color: #3D6B6B;
  }

  .meps-methodology-card {
    background: linear-gradient(135deg, #f8fafb, #f0f7f0);
    border: 1px solid #e2e8f0;
    border-left: 3px solid #8BC34A;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    margin: 0.5rem 0;
  }

  .meps-methodology-card h4 {
    font-size: 0.82rem;
    font-weight: 700;
    color: #3D6B6B;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .meps-methodology-card h4 i {
    color: #8BC34A;
  }

  .meps-methodology-card p {
    font-size: 0.75rem;
    color: #555;
    line-height: 1.6;
    margin: 0 0 0.5rem;
  }

  .meps-conversion-table {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 0.5rem 0;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .meps-conv-row {
    display: grid;
    grid-template-columns: 1.2fr 1.5fr 0.8fr;
    gap: 0.5rem;
    padding: 0.35rem 0.6rem;
    font-size: 0.68rem;
    color: #555;
    border-bottom: 1px solid #f1f5f9;
  }

  .meps-conv-row:last-child {
    border-bottom: none;
  }

  .meps-conv-row.header {
    background: #f0f4f0;
    font-weight: 700;
    color: #333;
    font-size: 0.68rem;
  }

  .meps-conv-row:not(.header):nth-child(even) {
    background: #fafbfc;
  }

  .meps-caveat {
    font-size: 0.68rem;
    color: #94a3b8;
    font-style: italic;
    margin: 0.4rem 0 0;
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

  @media (max-width: 768px) {
    .meps-country-toggles {
      gap: 0.2rem 0.4rem;
    }

    .chart-container {
      height: 320px;
    }

    .meps-conv-row {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import mepsTimelineJson from '$lib/data/meps_timeline_v2.json';
  import mepsLevelsJson from '$lib/data/meps_levels.json';
  import { COUNTRY_LINES, CHROME } from '$lib/components/shared/colors';
  import type { MepsTimelineRecord, MepsLevelRecord } from '$lib/services/dashboard-types';

  export let mepsTimeline: MepsTimelineRecord[] = [];
  export let mepsLevels: MepsLevelRecord[] = [];

  // Use Supabase data if provided, otherwise fall back to JSON
  $: effectiveTimeline = mepsTimeline.length > 0 ? mepsTimeline : (mepsTimelineJson as any[]);
  $: effectiveLevels = mepsLevels.length > 0 ? mepsLevels : (mepsLevelsJson as any[]);

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
    { code: 'IN', name: 'India', color: COUNTRY_LINES['India'], defaultOn: true },
    { code: 'CN', name: 'China', color: COUNTRY_LINES['China'], defaultOn: true },
    { code: 'EU', name: 'EU', color: COUNTRY_LINES['EU'], defaultOn: true },
    { code: 'UK', name: 'UK', color: COUNTRY_LINES['UK'], defaultOn: false },
    { code: 'TR', name: 'Turkey', color: COUNTRY_LINES['Turkey'], defaultOn: false },
    { code: 'CH', name: 'Switzerland', color: COUNTRY_LINES['Switzerland'], defaultOn: true },
    { code: 'US', name: 'USA (South)', color: COUNTRY_LINES['USA (South)'], defaultOn: true },
    { code: 'US_N', name: 'USA (North)', color: COUNTRY_LINES['USA (North)'], defaultOn: false },
    { code: 'BR', name: 'Brazil', color: COUNTRY_LINES['Brazil'], defaultOn: true },
    { code: 'JP', name: 'Japan', color: COUNTRY_LINES['Japan'], defaultOn: false },
    { code: 'KR', name: 'South Korea', color: COUNTRY_LINES['South Korea'], defaultOn: false },
    { code: 'SA', name: 'Saudi Arabia', color: COUNTRY_LINES['Saudi Arabia'], defaultOn: false },
    { code: 'ZA', name: 'South Africa', color: COUNTRY_LINES['South Africa'], defaultOn: false },
    { code: 'SG', name: 'Singapore', color: COUNTRY_LINES['Singapore'], defaultOn: false },
    { code: 'NG', name: 'Nigeria', color: COUNTRY_LINES['Nigeria'], defaultOn: false },
    { code: 'SADC', name: 'SADC Region', color: COUNTRY_LINES['SADC'], defaultOn: false },
    { code: 'EAC', name: 'EAC Region', color: COUNTRY_LINES['EAC'], defaultOn: false },
    { code: 'ECOWAS', name: 'ECOWAS Region', color: COUNTRY_LINES['ECOWAS'], defaultOn: false },
    { code: 'ASEAN', name: 'ASEAN Region', color: COUNTRY_LINES['ASEAN'], defaultOn: false },
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

  // U4E AC reference tiers by climate group, <=4.5 kW capacity band.
  // MEPS floor: Model Regulation Table 5. Intermediate and High Efficiency:
  // label tier floors from Annex 2 Tables 13 (Group 1), 14 (Group 2), 15 (Group 3).
  // Note: U4E assigns climate groups to developing and emerging economies only
  // (Annex 3 Table 19); industrialized countries are not covered by the model
  // regulation.
  type ClimateGroup = 'G1' | 'G2' | 'G3';
  const U4E_AC_TIERS: Record<ClimateGroup, { meps: number; intermediate: number; high: number; short: string }> = {
    G1: { meps: 6.1, intermediate: 7.1, high: 8.0, short: 'Group 1 (humid/hot)' },
    G2: { meps: 5.0, intermediate: 5.8, high: 6.5, short: 'Group 2 (extremely hot-dry)' },
    G3: { meps: 5.3, intermediate: 6.0, high: 6.7, short: 'Group 3 (mixed/cool)' },
  };
  let u4eClimateGroup: ClimateGroup = 'G1';

  const climateGroupOptions: { key: ClimateGroup; label: string }[] = [
    { key: 'G1', label: 'Group 1 · humid/hot' },
    { key: 'G2', label: 'Group 2 · extremely hot-dry' },
    { key: 'G3', label: 'Group 3 · mixed/cool' },
  ];

  // Refrigerator reference tiers: Index = 100/R (Model Reg Eq. 5 / SADC HT 111),
  // R >= 1.0 / 1.25 / 1.50 (Annex 3 Table 8). No climate dependency.
  const U4E_FRIDGE_TIERS = { meps: 100, intermediate: 80, high: 67 };

  // Appliance tab options.
  // Fans tab removed July 2026: fan MEPS use incomparable national metrics
  // (max W vs CFM/W) and the underlying values were never source-verified.
  // Reinstate only with verified data (feedback ME-15).
  const applianceTabs: { key: ApplianceTab; label: string }[] = [
    { key: 'AC', label: 'Air Conditioners' },
    { key: 'Refrigerator', label: 'Refrigerators' },
  ];

  // Show methodology
  let showMethodology = false;

  // Get timeline data for a specific appliance and country
  function getTimelineData(appliance: ApplianceTab, countryCode: string) {
    return effectiveTimeline.filter(
      (d: any) => d.appliance_type === appliance && d.country_code === countryCode
    ).sort((a: any, b: any) => a.year - b.year);
  }

  // Get level data for a specific appliance and country
  function getLevelData(appliance: ApplianceTab, countryCode: string) {
    return effectiveLevels.filter(
      (d: any) => d.appliance_type === appliance && d.country_code === countryCode
    );
  }

  // Get available countries for the selected appliance from timeline data
  function getAvailableCountries(appliance: ApplianceTab): string[] {
    const codes = new Set<string>();
    for (const d of effectiveTimeline) {
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
    const entry = effectiveTimeline.find((d: any) => d.country_code === code);
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
      return buildTimelineChart('AC', 'ISO CSPF Equivalent (Wh/Wh)', true);
    }

    if (appliance === 'Refrigerator') {
      return buildTimelineChart('Refrigerator', 'Index (100 = reference)', false);
    }

    // For Fans, show a simpler comparison (no universal metric exists)
    return buildNonAcChart(appliance);
  }

  function buildTimelineChart(appliance: ApplianceTab, yAxisLabel: string, higherIsBetter: boolean) {
    const excludeCodes = appliance === 'AC'
      ? ['U4E', 'U4E_HE', 'GCP']
      : ['U4E_FRIDGE', 'U4E_FRIDGE_HE'];
    const availableCodes = getAvailableCountries(appliance);
    const activeCodes = availableCodes.filter(c =>
      enabledCountries.has(c) && !excludeCodes.includes(c)
    );

    let minYear = appliance === 'AC' ? 2006 : 2018;
    let maxYear = appliance === 'AC' ? 2033 : 2029;

    const series: any[] = [];

    for (const code of activeCodes) {
      const data = getTimelineData(appliance, code);
      if (data.length === 0) continue;

      const color = getCountryColor(code);
      const name = getCountryName(code);

      const historicalPoints = data.filter((d: any) => !d.is_projected);
      const projectedPoints = data.filter((d: any) => d.is_projected);

      // Points converted from a full-load metric (fixed-speed EER approximation)
      // or estimated from an unpublished baseline get a hollow marker so they
      // are never mistaken for measured seasonal (CSPF-family) values.
      // (Filled triangles read as directional arrows at line ends, so hollow
      // circles are used instead.)
      const isApproxConversion = (d: any) => {
        const c = String(d.conversion ?? '');
        return c.includes('fixed-speed') || c.includes('approximation') || c.includes('ESTIMATED');
      };
      const toPoint = (d: any, baseSymbol: string, baseSize: number) => ({
        value: [d.year, d.meps_level_cspf_equiv],
        symbol: isApproxConversion(d) ? 'emptyCircle' : baseSymbol,
        symbolSize: isApproxConversion(d) ? baseSize + 1 : baseSize,
      });

      if (historicalPoints.length > 0) {
        series.push({
          name: name,
          type: 'line',
          data: historicalPoints.map((d: any) => toPoint(d, 'circle', 6)),
          lineStyle: { width: 2.5, color },
          itemStyle: { color },
          symbol: 'circle',
          symbolSize: 6,
          connectNulls: false,
          emphasis: { focus: 'series' },
        });
      }

      if (projectedPoints.length > 0) {
        const bridgeData: any[] = [];
        if (historicalPoints.length > 0) {
          const lastHist = historicalPoints[historicalPoints.length - 1];
          bridgeData.push(toPoint(lastHist, 'circle', 5));
        }
        for (const d of projectedPoints) {
          bridgeData.push(toPoint(d, 'diamond', 5));
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

    // U4E reference lines: for AC the tier values follow the selected climate
    // group; for refrigerators they are climate-independent.
    const t = appliance === 'AC' ? U4E_AC_TIERS[u4eClimateGroup] : U4E_FRIDGE_TIERS;
    const groupTag = appliance === 'AC' ? `, ${U4E_AC_TIERS[u4eClimateGroup].short}` : '';
    const fmt = (v: number) => (appliance === 'AC' ? `CSPF ${v.toFixed(2)}` : `Index ${v}`);
    const refLines = [
      {
        value: t.meps,
        label: appliance === 'AC'
          ? `U4E Minimum MEPS${groupTag}, ≤4.5 kW (${fmt(t.meps)})`
          : `U4E/SADC Reference Line, R≥1.0 (${fmt(t.meps)})`,
        color: '#94a3b8', style: 'dashed', width: 2,
      },
      {
        value: t.intermediate,
        label: appliance === 'AC'
          ? `U4E Intermediate Label${groupTag} (${fmt(t.intermediate)})`
          : `U4E Intermediate, R≥1.25 (${fmt(t.intermediate)})`,
        color: '#F59E0B', style: 'dashed', width: 1.5,
      },
      {
        value: t.high,
        label: appliance === 'AC'
          ? `U4E High Efficiency Label${groupTag} (${fmt(t.high)})`
          : `U4E High Efficiency, R≥1.50 (${fmt(t.high)})`,
        color: '#52B788', style: 'dotted', width: 1.5,
      },
    ];
    for (const line of refLines) {
      series.push({
        name: line.label,
        type: 'line',
        data: [[minYear, line.value], [maxYear, line.value]],
        lineStyle: { width: line.width, color: line.color, type: line.style },
        itemStyle: { color: line.color },
        symbol: 'none',
      });
    }

    const metricLabel = appliance === 'AC' ? 'ISO CSPF Equivalent' : 'Index';
    // Direction is explained in the subtitle; keep the axis name short so it
    // does not collide with the plot area.
    const directionNote = higherIsBetter ? '' : ', lower = stricter';

    return {
      tooltip: {
        trigger: 'item',
        // Long standard/conversion strings otherwise blow the tooltip up into
        // an oversized box that escapes the canvas.
        confine: true,
        extraCssText: 'max-width: 340px; white-space: normal; word-break: break-word;',
        formatter: (params: any) => {
          const point = Array.isArray(params.data) ? params.data : params.data?.value;
          if (!point || !Array.isArray(point)) return '';
          const [year, val] = point;
          const seriesName = params.seriesName.replace(' (projected)', '');
          const isProjected = params.seriesName.includes('projected');

          const code = countryConfigs.find(c => c.name === seriesName)?.code;
          const entry = code
            ? effectiveTimeline.find(
                (d: any) => d.country_code === code && d.year === year && d.appliance_type === appliance
              )
            : undefined;
          const e = entry as any;

          const statusTag = e?.status?.includes('endorsed')
            ? 'endorsed regional target, not in-force MEPS'
            : e?.status?.includes('estimated')
              ? 'estimated, thresholds not yet published'
              : 'adopted, future effective date';
          let html = `<strong>${seriesName}</strong> (${year})${isProjected ? ` <em style="color:#94a3b8">${statusTag}</em>` : ''}<br/>`;
          html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${params.color};margin-right:4px;"></span>`;
          html += `${metricLabel}: <strong>${val.toFixed(appliance === 'AC' ? 2 : 0)}</strong>`;
          if (e?.meps_level_national != null && e?.metric_name && e.metric_name !== 'ISO CSPF') {
            html += ` <span style="color:#888;font-size:0.85em">(national: ${e.meps_level_national} ${e.metric_name})</span>`;
          }
          html += `<br/>`;

          if (e) {
            if (e.standard_version) {
              html += `<span style="color:#888;font-size:0.85em">${e.standard_version}</span><br/>`;
            }
            if (e.conversion && !String(e.conversion).startsWith('1:1')) {
              html += `<span style="color:#94a3b8;font-size:0.8em">Conversion: ${e.conversion}</span><br/>`;
            }
            html += `<span style="color:#aaa;font-size:0.8em">Source: ${e.source}</span>`;
          }

          return html;
        }
      },
      grid: { left: '6%', right: '9%', bottom: '12%', top: '8%', containLabel: true },
      xAxis: {
        type: 'value',
        name: 'Year',
        nameLocation: 'end',
        nameGap: 8,
        min: minYear,
        max: maxYear,
        interval: 5,
        nameTextStyle: { fontSize: 13, color: '#334155', fontWeight: 600 },
        axisLabel: { fontSize: 13, color: '#334155', fontWeight: 500, formatter: (v: number) => String(v) },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: yAxisLabel + directionNote,
        // On the inverted refrigerator axis 'end' renders at the bottom and
        // collides with the year labels; 'start' is the top there.
        nameLocation: higherIsBetter ? 'end' : 'start',
        nameGap: 10,
        // Fixed ranges on both charts so the scale never shifts when toggling
        // countries or the U4E climate group; comparisons stay stable.
        // AC: data spans ~2.9-7.4 plus reference lines up to 8.0.
        min: appliance === 'AC' ? 2 : 50,
        max: appliance === 'AC' ? 8.5 : 140,
        nameTextStyle: { fontSize: 13, color: '#334155', fontWeight: 600 },
        axisLabel: { fontSize: 13, color: '#334155', fontWeight: 500, formatter: (v: number) => appliance === 'AC' ? v.toFixed(1) : String(Math.round(v)) },
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
    const entries = effectiveLevels.filter((d: any) =>
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
        axisLabel: { fontSize: 13, color: '#666', rotate: 25, interval: 0 },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameTextStyle: { fontSize: 12, color: '#888' },
        axisLabel: { fontSize: 13, color: '#888' },
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
          fontSize: 12,
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

  $: selectedAppliance, u4eClimateGroup, updateChart();

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
      <i class="fa-solid fa-chart-line" style="color: #52B788; margin-right: 0.5rem;"></i>
      MEPS Stringency Over Time
    </div>
    <span class="chart-subtitle">
      {#if selectedAppliance === 'AC'}
        National metrics converted to ISO 16358-1 CSPF equivalents (Park et al. 2020), source-verified July 2026
      {:else if selectedAppliance === 'Refrigerator'}
        Index relative to the U4E/SADC reference line (lower = more stringent). Only jurisdictions regulating on an index metric are shown
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

  <!-- Country toggles: only countries with data for the selected appliance -->
  <div class="meps-country-toggles">
    {#each countryConfigs as cfg}
      {#if getAvailableCountries(selectedAppliance).includes(cfg.code)}
        <label class="meps-country-toggle">
          <input
            type="checkbox"
            checked={enabledCountries.has(cfg.code)}
            on:change={() => toggleCountry(cfg.code)}
          />
          <span class="meps-country-dot" style="background: {cfg.color};"></span>
          <span class="meps-country-name">{cfg.name}</span>
        </label>
      {/if}
    {/each}
  </div>

  <!-- U4E climate group selector (AC only): the U4E reference tiers depend on climate group -->
  {#if selectedAppliance === 'AC'}
    <div class="meps-climate-row">
      <span class="meps-climate-label">U4E reference tiers for climate:</span>
      {#each climateGroupOptions as opt}
        <button
          class="chart-pill"
          class:active={u4eClimateGroup === opt.key}
          on:click={() => { u4eClimateGroup = opt.key; }}
        >
          {opt.label}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Chart -->
  <div class="chart-container" bind:this={chartContainer}></div>

  <!-- Legend note for timeline charts -->
  {#if selectedAppliance === 'AC' || selectedAppliance === 'Refrigerator'}
    <div class="meps-legend-note">
      <span class="meps-legend-item">
        <span class="meps-legend-line solid"></span> Currently Effective
      </span>
      <span class="meps-legend-item">
        <span class="meps-legend-line dashed"></span> Adopted — future effective date
      </span>
      {#if selectedAppliance === 'AC'}
        <span class="meps-legend-item">
          <span class="meps-legend-line ref"></span> U4E Min. MEPS, {U4E_AC_TIERS[u4eClimateGroup].short} ≤4.5 kW (CSPF {U4E_AC_TIERS[u4eClimateGroup].meps.toFixed(2)})
        </span>
        <span class="meps-legend-item">
          <span class="meps-legend-line intermediate"></span> U4E Intermediate Label (CSPF {U4E_AC_TIERS[u4eClimateGroup].intermediate.toFixed(2)})
        </span>
        <span class="meps-legend-item">
          <span class="meps-legend-line gcp"></span> U4E High Eff. Label (CSPF {U4E_AC_TIERS[u4eClimateGroup].high.toFixed(2)})
        </span>
      {:else}
        <span class="meps-legend-item">
          <span class="meps-legend-line ref"></span> U4E/SADC Reference, R≥1.0 (Index 100)
        </span>
        <span class="meps-legend-item">
          <span class="meps-legend-line intermediate"></span> U4E Intermediate, R≥1.25 (Index 80)
        </span>
        <span class="meps-legend-item">
          <span class="meps-legend-line gcp"></span> U4E High Eff., R≥1.50 (Index 67)
        </span>
      {/if}
    </div>
    <div class="meps-adopted-note">
      <i class="fa-solid fa-circle-info"></i>
      Solid lines: MEPS in force. Dashed lines: adopted with a future effective date, regionally endorsed targets pending national legislation, or estimated phase-in values (see tooltips).
      {#if selectedAppliance === 'AC'}
        Hollow markers: approximate conversion from a full-load metric (EER) or an estimated baseline, not a measured seasonal value.
      {/if}
    </div>
    {#if selectedAppliance === 'AC'}
      <div class="meps-adopted-note">
        <i class="fa-solid fa-earth-africa"></i>
        U4E reference tiers depend on the climate group; use the selector above the chart (values: Model Regulation Table 5 and Annex 2 Tables 13–15, ≤4.5 kW band). U4E assigns climate groups to developing and emerging economies only (Annex 3 Table 19); industrialized countries are not covered by the model regulation. See the methodology for the country table.
      </div>
    {/if}
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
          Countries use different seasonal performance metrics for air conditioners. National MEPS values are
          converted to an approximate ISO 16358-1 CSPF equivalent using the peer-reviewed regression equations of
          Park et al. (2020), Energy for Sustainable Development 55:56-68, Table B1, plus published unit identities.
        </p>
        <div class="meps-conversion-table">
          <div class="meps-conv-row header"><span>National Metric</span><span>Used for</span><span>To ISO CSPF</span></div>
          <div class="meps-conv-row"><span>CSPF / IDRS / NSEER (ISO 16358-1 family)</span><span>ASEAN, SADC, EAC, Brazil (2023+), Nigeria</span><span>1:1</span></div>
          <div class="meps-conv-row"><span>APF (GB 21455)</span><span>China</span><span>1.798 x APF - 2.027</span></div>
          <div class="meps-conv-row"><span>ISEER (IS 1391)</span><span>India</span><span>7.726 x ln(ISEER) - 5.318</span></div>
          <div class="meps-conv-row"><span>APF (JIS C 9612)</span><span>Japan</span><span>1.735 x e^(0.220 x APF)</span></div>
          <div class="meps-conv-row"><span>CSPF (KS C 9306)</span><span>South Korea</span><span>0.970 x X + 0.048</span></div>
          <div class="meps-conv-row"><span>SEER / SEER2 (Btu/Wh)</span><span>USA</span><span>(/0.957 for SEER2) /3.412, then 0.962 x X + 0.087</span></div>
          <div class="meps-conv-row"><span>EU SEER (EN 14825)</span><span>EU</span><span>1.113 x X - 0.639</span></div>
          <div class="meps-conv-row"><span>EER, fixed-speed (W/W)</span><span>Saudi Arabia (/3.412 first), South Africa, Nigeria 2017, ECOWAS, Brazil 2019, China 2010</span><span>x 1.062</span></div>
          <div class="meps-conv-row"><span>Weighted COP</span><span>Singapore</span><span>1.1917 x X + 0.3111 (NEA)</span></div>
        </div>
        <p>
          Australia is not shown: its AEER metric embeds inactive power and no published conversion to ISO CSPF
          exists (IEA 4E, 2020). Nigeria absolute values are estimated from an assumed NSEER 3.0 baseline; only
          the phased improvement percentages are published by U4E. EER-derived and estimated points are drawn
          with hollow markers.
        </p>
      {:else if selectedAppliance === 'Refrigerator'}
        <h4><i class="fa-solid fa-flask"></i> Refrigerator Index Note</h4>
        <p>
          Only jurisdictions that regulate refrigerators on an index metric are plotted: the EU (EEI, Regulation
          2019/2019) and its legal mirrors UK, Turkey and Switzerland (Switzerland reached EEI 100 three years
          ahead of the EU), plus SADC and EAC (R = AECMax / AEC per IEC 62552 at 24°C) and the U4E Model
          Regulation (same R metric). The chart shows <strong>Index = 100 / R</strong>, where 100 marks the
          reference line. Lower = more stringent.
        </p>
        <p>
          EU EEI (new 2021 scale) is a sister metric plotted on the same axis: for a typical 400L combi the EU
          reference line sits roughly 5 to 12% below the U4E/SADC line, so small cross-scheme differences are not
          meaningful. Countries regulating in absolute kWh/yr on their own test methods (USA, China, India, Japan,
          Korea, Brazil, Singapore, Australia) cannot be placed on this axis without unpublished conversions and
          are therefore not shown.
        </p>
      {:else}
        <h4><i class="fa-solid fa-flask"></i> Fan Metric Note</h4>
        <p>
          No universal fan efficiency metric exists. India and China use max wattage (W, lower = better),
          while the USA uses CFM/W (higher = better). Values are shown in national metrics.
        </p>
      {/if}
      <p class="meps-caveat">
        Per Park et al. (2020), these conversions are suitable for initial cross-country comparison but not for
        compliance purposes. Test conditions, product scope, and climate assumptions affect real-world equivalence.
        Full derivations and references: MEPS Review 2026 calculation workbook.
      </p>
    </div>
  {/if}

  <div class="chart-source">
    Sources: national regulations (see tooltips);
    <a href="https://escholarship.org/uc/item/5jh2g8v5" target="_blank" rel="noopener noreferrer">Park et al. 2020 (conversions)</a>;
    <a href="https://united4efficiency.org" target="_blank" rel="noopener noreferrer">UNEP U4E</a>;
    <a href="https://cprc-clasp.ngo/" target="_blank" rel="noopener noreferrer">CLASP CPRC</a>;
    <a href="https://www.iea.org/policies" target="_blank" rel="noopener noreferrer">IEA Policies DB</a>
    &middot;
    <a href="/methodology/meps-stringency" style="font-weight: 700;">Methodology</a>
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
    font-size: 1.1rem;
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

  .meps-country-toggle input {
    width: 12px;
    height: 12px;
    cursor: inherit;
    accent-color: #2D7D5A;
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

  /* U4E climate group selector */
  .meps-climate-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin: 0.2rem 0 0.4rem;
  }

  .meps-climate-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
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
    font-size: 0.78rem;
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

  .meps-legend-line.intermediate {
    border-top: 2px dashed #F59E0B;
  }

  .meps-legend-line.gcp {
    border-top: 2px dotted #52B788;
  }

  .meps-adopted-note {
    text-align: center;
    font-size: 0.65rem;
    color: #94a3b8;
    margin-top: 0.25rem;
    font-style: italic;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
  }

  /* Methodology */
  .meps-methodology-toggle {
    text-align: center;
    margin: 0.5rem 0;
  }

  .meps-info-btn {
    font-size: 0.72rem;
    font-weight: 600;
    color: #2D7D5A;
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
    border-color: #2D7D5A;
  }

  .meps-methodology-card {
    background: linear-gradient(135deg, #f8fafb, #f0f7f0);
    border: 1px solid #e2e8f0;
    border-left: 3px solid #52B788;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    margin: 0.5rem 0;
  }

  .meps-methodology-card h4 {
    font-size: 0.82rem;
    font-weight: 700;
    color: #2D7D5A;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .meps-methodology-card h4 i {
    color: #52B788;
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
    color: #2D7D5A;
    text-decoration: none;
    border-bottom: 1px dotted rgba(45, 125, 90, 0.3);
    transition: color 0.2s ease;
  }

  .chart-source a:hover {
    color: #1A5E40;
    border-bottom-color: #1A5E40;
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

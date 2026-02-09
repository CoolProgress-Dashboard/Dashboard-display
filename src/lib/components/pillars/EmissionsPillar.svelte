<script lang="ts">
  import { onMount } from 'svelte';
  import { VIEW_META } from '$lib/components/shared/config';
  import AnimatedCounter from '$lib/components/hero/AnimatedCounter.svelte';
  import { pillarContent } from '$lib/data/pillar-content';
  import { partners } from '$lib/data/partner-data';
  import { globalCoolingPledge } from '$lib/data/partner-data';

  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;

  const meta = VIEW_META.emissions;
  const emissionsContent = pillarContent.emissions;

  // Animated stat cards data
  const emissionsStats = [
    {
      value: '2,401',
      label: 'Mt CO₂e from cooling today',
      context: 'Total cooling emissions in 2025: AC (1,741 Mt), Refrigeration (440 Mt), Fans (220 Mt). Sources: HEAT Global Cooling Model + CLASP.'
    },
    {
      value: '6,009',
      label: 'Mt CO₂e by 2050 under BAU',
      context: 'Business-as-usual trajectory: emissions triple as cooling demand in South Asia, Africa, and SE Asia surges without efficiency interventions.'
    },
    {
      value: '73%',
      label: 'reduction achievable (DECARB)',
      context: 'Three-layer DECARB pathway: energy efficiency (MEPS) + Kigali refrigerant transition + grid decarbonization = 1,554 Mt by 2050.'
    },
    {
      value: '460',
      label: 'Gt CO₂e cumulative savings potential',
      context: 'IEA Efficient Cooling Scenario: combining all interventions could avoid 460 Gt CO₂e cumulative emissions by 2060.'
    }
  ];

  // Chart highlights
  const chartHighlights = [
    {
      icon: 'fa-chart-area',
      title: 'Emissions Trajectory',
      description: 'BAU vs DECARB pathways with savings decomposition',
      color: '#E85A4F'
    },
    {
      icon: 'fa-layer-group',
      title: 'Savings Decomposition',
      description: 'Split savings into efficiency (MEPS) vs grid decarbonization',
      color: '#8BC34A'
    },
    {
      icon: 'fa-earth-americas',
      title: 'Country Deep-Dive',
      description: 'Click any country to see direct, indirect, and appliance breakdown',
      color: '#3D6B6B'
    }
  ];

  // Partners: CCC first, HEAT last
  const emissionsPartnerIds = ['ccc', 'clasp', 'u4e', 'iea', 'cool-coalition', 'heat'];
  const emissionsPartners = emissionsPartnerIds
    .map(id => partners.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  let revealed = false;

  onMount(() => {
    const timer = setTimeout(() => {
      revealed = true;
    }, 150);
    return () => clearTimeout(timer);
  });
</script>

<section id="view-emissions" class="view-section" class:active>
  <div class="pillar-stack">
    <!-- Story-Driven Card -->
    <div class="card-panel emissions-story-card" class:revealed>
      <!-- Header -->
      <div class="emissions-story-header">
        <div class="emissions-story-text">
          <h1 class="emissions-headline">{meta.headline}</h1>
          <p class="emissions-subhead">{meta.subhead}</p>
        </div>
        <div class="pillar-story-actions">
          <span class="last-updated-label"></span>
          {#if onPillarInfoClick}
            <button class="pillar-info-btn" type="button" on:click={onPillarInfoClick}>
              <i class="fa-solid fa-circle-info"></i> Pillar Information
            </button>
          {/if}
        </div>
      </div>

      <!-- Story hook narrative -->
      <p class="emissions-story-hook">{emissionsContent.storyHook}</p>

      <!-- Animated stat cards -->
      <div class="emissions-counters">
        {#each emissionsStats as stat, i}
          <div class="emissions-counter-wrapper" style="transition-delay: {200 + i * 100}ms">
            <AnimatedCounter
              value={stat.value}
              label={stat.label}
              context={stat.context}
              duration={1800 + i * 150}
            />
          </div>
        {/each}
      </div>

      <!-- Key narrative -->
      <div class="emissions-narrative">
        <h3 class="emissions-narrative-title">
          <i class="fa-solid fa-fire-flame-curved"></i>
          The Vicious Cycle
        </h3>
        <p>{emissionsContent.keyNarrative}</p>
      </div>

      <!-- Chart highlights -->
      <div class="emissions-chart-highlights">
        <h3 class="emissions-highlights-title">
          <i class="fa-solid fa-chart-simple"></i>
          What the Data Shows
        </h3>
        <div class="emissions-highlights-grid">
          {#each chartHighlights as highlight}
            <div class="emissions-highlight-card">
              <div class="emissions-highlight-icon" style="color: {highlight.color}">
                <i class="fa-solid {highlight.icon}"></i>
              </div>
              <div class="emissions-highlight-text">
                <strong>{highlight.title}</strong>
                <span>{highlight.description}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Cooling Pledge Badge -->
      <div class="cooling-pledge-badge">
        <div class="pledge-icon">
          <i class="fa-solid fa-handshake-angle"></i>
        </div>
        <div class="pledge-content">
          <strong>Global Cooling Pledge Alignment</strong>
          <span>Target: {globalCoolingPledge.targetEmissionReduction} from BAU &middot; {globalCoolingPledge.signatoryCountries} signatory nations &middot; {globalCoolingPledge.targetEfficiencyIncrease}</span>
        </div>
        <a href={globalCoolingPledge.progressReportUrl} target="_blank" rel="noopener noreferrer" class="pledge-link">
          Progress Report <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>

      <!-- Partner logos bar -->
      <div class="emissions-partner-bar">
        <div class="emissions-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="emissions-partner-title">Data Partners</span>
        </div>
        <div class="emissions-partner-logos">
          {#each emissionsPartners as partner (partner.id)}
            <a
              href={partner.coolingUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="emissions-partner-logo"
              title={partner.fullName}
            >
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>

      <!-- Source attribution footer -->
      <div class="emissions-source-footer">
        Sources:
        <a href="https://www.clasp.ngo/tools/mepsy/" target="_blank" rel="noopener noreferrer">CLASP Mepsy (indirect)</a>
        &middot;
        <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH (direct)</a>
        &middot;
        <a href="https://www.iea.org/reports/world-energy-outlook-2025" target="_blank" rel="noopener noreferrer">IEA STEPS (grid)</a>
        &middot;
        <a href="/methodology">Methodology</a>
      </div>
    </div>

    <!-- Savings Decomposition -->
    <div class="card-panel">
      <div id="emissions-savings-section" style="margin-top: 1rem; border-top: 1px solid #e2e8f0; padding-top: 1rem;">
        <div style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h4 style="font-size: 0.85rem; color: #3D6B6B; margin: 0; font-weight: 700;">
              <i class="fa-solid fa-layer-group" style="color: #8BC34A; margin-right: 0.5rem;"></i>Savings Decomposition
            </h4>
            <p style="font-size: 0.72rem; color: #94a3b8; margin: 0.25rem 0 0;">How efficiency improvements and grid decarbonization each contribute to emissions reduction</p>
          </div>
          <a href="/methodology" style="font-size: 0.68rem; color: #3D6B6B; text-decoration: none; display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; white-space: nowrap; transition: all 0.2s;">
            <i class="fa-solid fa-book-open" style="font-size: 0.6rem;"></i> Methodology
          </a>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <h5 style="font-size: 0.75rem; color: #3D6B6B; margin: 0 0 0.5rem; font-weight: 600;">
              <i class="fa-solid fa-chart-column" style="margin-right: 0.3rem;"></i>
              Waterfall: BAU → Net Emissions
              <a href="/methodology#waterfall" style="font-size: 0.6rem; color: #94a3b8; margin-left: 0.3rem; text-decoration: none;" title="View methodology"><i class="fa-solid fa-circle-info"></i></a>
            </h5>
            <div id="chart-emissions-waterfall" class="chart-surface" style="width: 100%; height: 280px; min-height: 280px;"></div>
          </div>
          <div>
            <h5 style="font-size: 0.75rem; color: #3D6B6B; margin: 0 0 0.5rem; font-weight: 600;">
              <i class="fa-solid fa-chart-area" style="margin-right: 0.3rem;"></i>
              Cumulative Savings (2025–2050)
              <a href="/methodology#cumulative" style="font-size: 0.6rem; color: #94a3b8; margin-left: 0.3rem; text-decoration: none;" title="View methodology"><i class="fa-solid fa-circle-info"></i></a>
            </h5>
            <div id="chart-emissions-cumulative" class="chart-surface" style="width: 100%; height: 280px; min-height: 280px;"></div>
          </div>
        </div>
        <div style="font-size: 0.7rem; color: #94a3b8; text-align: center; padding: 0.25rem;">
          EE Savings = BAU − Green Buildings (efficiency only) · Grid Savings = BAT − BAT<sub>nzg</sub> (net-zero grid) · Source: CLASP scenarios
        </div>
      </div>

    </div>

    <!-- Map Card with Filters Inside -->
    <div class="card-panel map-card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div class="card-title">
          <i class="fa-solid fa-earth-americas"></i>
          CO2 Emissions by Country
        </div>
        <a href="/methodology#emissions-map" style="font-size: 0.68rem; color: #3D6B6B; text-decoration: none; display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; white-space: nowrap;">
          <i class="fa-solid fa-book-open" style="font-size: 0.6rem;"></i> Methodology
        </a>
      </div>
      <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; padding: 0 0.5rem;">
        Cooling sector emissions in Mt CO2. Click a country for detailed breakdown.
      </div>
      <div id="emissions-map-container" class="map-surface"></div>
      <div class="legend legend-row">
        <span class="legend-label">Emissions (Mt CO2):</span>
        <div id="emissions-legend" class="legend-items"></div>
      </div>
      <div class="progress-bar" id="emissions-progress">
        <span class="progress-segment" id="emissions-progress-low" style="background: #8BC34A;"></span>
        <span class="progress-segment" id="emissions-progress-medium" style="background: #E89B8C;"></span>
        <span class="progress-segment" id="emissions-progress-high" style="background: #E85A4F;"></span>
        <span class="progress-segment" id="emissions-progress-critical" style="background: #D94539;"></span>
      </div>

      <!-- Filters Inside Map Card -->
      <div class="map-filters" id="emissions-filters-panel">
        <div class="filters-help" style="font-size: 0.8rem; color: #4A7F7F; margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: #F5FAFA; border-radius: 8px; border-left: 3px solid #8BC34A;">
          <i class="fa-solid fa-sliders" style="margin-right: 0.5rem;"></i>
          <strong>Customize your view:</strong> These filters control all data displayed on the map, charts, and KPIs above. Adjust the source, year, scenario, and appliances to explore different emission projections.
        </div>
        <div class="filter-row" style="gap: 1rem; flex-wrap: nowrap; align-items: flex-start;">
          <!-- Data Source Toggle -->
          <div class="filter-group">
            <label class="filter-label">Source</label>
            <div class="toggle-group" id="emissions-source-toggles">
              <button class="toggle-btn active" data-source="clasp" type="button" title="Indirect emissions only (energy-related CO2) by appliance">CLASP</button>
              <button class="toggle-btn" data-source="subcool" type="button" title="Direct and indirect emissions with Kigali scenarios (GIZ collaboration)">HEAT</button>
            </div>
          </div>

          <!-- Year Slider -->
          <div class="filter-group" style="flex: 2; min-width: 200px;">
            <label class="filter-label">Year</label>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <input type="range" id="emissions-year-slider" min="2020" max="2050" value="2030" style="flex: 1;" />
              <span id="emissions-year-display" style="font-weight: 700; color: #3D6B6B; font-size: 0.85rem;">2030</span>
            </div>
          </div>

          <!-- Scenario Dropdown -->
          <div class="filter-group">
            <label class="filter-label" for="emissions-scenario-select">Scenario</label>
            <select id="emissions-scenario-select" class="filter-select" style="min-width: 120px;">
              <option value="BAU">Business as Usual</option>
              <option value="GB">Green Buildings</option>
              <option value="NZH">Net Zero Homes</option>
              <option value="BAT">Best Available Tech</option>
            </select>
          </div>

          <!-- Appliance Toggles (for CLASP) -->
          <div class="filter-group" id="emissions-appliance-row">
            <label class="filter-label">Appliances</label>
            <div class="toggle-group" id="emissions-appliance-toggles">
              <button class="toggle-btn active" data-appliance="Air Conditioning" type="button">AC</button>
              <button class="toggle-btn active" data-appliance="Ceiling and Portable Fans" type="button">Fans</button>
              <button class="toggle-btn active" data-appliance="Refrigerator-Freezers" type="button">Refrigerators</button>
            </div>
          </div>

          <!-- Emission Type Toggles (for Subcool) - shown when HEAT selected -->
          <div class="filter-group" id="emissions-type-row" style="display: none;">
            <label class="filter-label">Type</label>
            <div class="toggle-group" id="emissions-type-toggles">
              <button class="toggle-btn active" data-type="total" type="button">Total</button>
              <button class="toggle-btn" data-type="direct" type="button">Direct</button>
              <button class="toggle-btn" data-type="indirect" type="button">Indirect</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Container (existing) -->
    <div id="emissions-charts-container"></div>

    <!-- Country Detail Section -->
    <div class="country-card-inline" id="emissions-country-detail">
      <div class="country-detail">
        <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #8BC34A; margin-bottom: 0.75rem; display: block;"></i>
          <h4 style="color: #3D6B6B; margin-bottom: 0.5rem;">Select a Country</h4>
          <p style="font-size: 0.85rem;">Click on any country in the map above to view detailed emission breakdowns and projections.</p>
        </div>
      </div>
    </div>

    <!-- Source Attribution -->
    <div style="text-align: center; padding: 0.75rem; font-size: 0.7rem; color: #94a3b8;">
      Sources:
      <a href="https://www.cleancoolingcollaborative.org" target="_blank" rel="noopener noreferrer" style="color: #64748b;">Clean Cooling Collaborative</a>
      &middot;
      <a href="https://www.clasp.ngo/tools/mepsy/" target="_blank" rel="noopener noreferrer" style="color: #64748b;">CLASP Mepsy</a>
      &middot;
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer" style="color: #64748b;">HEAT GmbH</a>
      &middot;
      <a href="https://www.iea.org/reports/world-energy-outlook-2025" target="_blank" rel="noopener noreferrer" style="color: #64748b;">IEA STEPS</a>
      &middot;
      <a href="/methodology" style="color: #3D6B6B; font-weight: 600;">Methodology</a>
    </div>
  </div>
</section>

<style>
  /* ===========================
     EMISSIONS STORY CARD
     Rich narrative card with red/orange accent (matching emissions pillar identity).
     =========================== */
  .emissions-story-card {
    border-left: 4px solid #E85A4F;
    padding: 1.75rem;
    position: relative;
    overflow: hidden;
  }

  .emissions-story-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(232, 90, 79, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ===========================
     HEADER
     =========================== */
  .emissions-story-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .emissions-story-text {
    flex: 1;
    min-width: 0;
  }

  .emissions-headline {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 0 0 0.4rem;
    letter-spacing: -0.01em;
  }

  .emissions-subhead {
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
  }

  /* ===========================
     STORY HOOK
     =========================== */
  .emissions-story-hook {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    margin: 0 0 1.25rem;
    padding: 0.75rem 1rem;
    background: #fef8f8;
    border-radius: 10px;
    border-left: 3px solid #E85A4F;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
  }

  .revealed .emissions-story-hook {
    opacity: 1;
    transform: translateY(0);
  }

  /* ===========================
     ANIMATED COUNTERS
     =========================== */
  .emissions-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  .emissions-counter-wrapper {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .revealed .emissions-counter-wrapper {
    opacity: 1;
    transform: translateY(0);
  }

  .emissions-counters :global(.counter-card) {
    background: linear-gradient(135deg, #fef5f4 0%, #fefafa 100%);
    border: 1px solid rgba(232, 90, 79, 0.15);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: 100px;
    padding: 1rem 0.75rem;
  }

  .emissions-counters :global(.counter-card:hover) {
    background: linear-gradient(135deg, #fdeeed 0%, #fef5f4 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(232, 90, 79, 0.12);
  }

  .emissions-counters :global(.counter-display) {
    font-size: 1.8rem;
    color: #D94539;
  }

  .emissions-counters :global(.counter-label) {
    font-size: 0.72rem;
    color: #8B4513;
  }

  .emissions-counters :global(.counter-tooltip) {
    background: rgba(15, 23, 42, 0.95);
  }

  /* ===========================
     KEY NARRATIVE
     =========================== */
  .emissions-narrative {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
  }

  .revealed .emissions-narrative {
    opacity: 1;
    transform: translateY(0);
  }

  .emissions-narrative-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #8B4513;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .emissions-narrative-title i {
    color: #E85A4F;
    font-size: 0.85rem;
  }

  .emissions-narrative p {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.7;
    margin: 0;
  }

  /* ===========================
     CHART HIGHLIGHTS
     =========================== */
  .emissions-chart-highlights {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s;
  }

  .revealed .emissions-chart-highlights {
    opacity: 1;
    transform: translateY(0);
  }

  .emissions-highlights-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #8B4513;
    margin: 0 0 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .emissions-highlights-title i {
    color: #E85A4F;
    font-size: 0.85rem;
  }

  .emissions-highlights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .emissions-highlight-card {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem;
    background: #fafbfc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .emissions-highlight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .emissions-highlight-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .emissions-highlight-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .emissions-highlight-text strong {
    font-size: 0.78rem;
    font-weight: 700;
    color: #0f172a;
  }

  .emissions-highlight-text span {
    font-size: 0.72rem;
    color: #64748b;
    line-height: 1.4;
  }

  /* ===========================
     COOLING PLEDGE BADGE
     =========================== */
  .cooling-pledge-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
    border: 1px solid #bbf7d0;
    border-radius: 10px;
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s;
  }

  .revealed .cooling-pledge-badge {
    opacity: 1;
    transform: translateY(0);
  }

  .pledge-icon {
    font-size: 1.4rem;
    color: #16a34a;
    flex-shrink: 0;
  }

  .pledge-content {
    flex: 1;
    min-width: 0;
  }

  .pledge-content strong {
    display: block;
    font-size: 0.78rem;
    color: #15803d;
    font-weight: 700;
    margin-bottom: 0.15rem;
  }

  .pledge-content span {
    font-size: 0.72rem;
    color: #4d7c0f;
    line-height: 1.4;
  }

  .pledge-link {
    font-size: 0.72rem;
    color: #16a34a;
    text-decoration: none;
    font-weight: 600;
    white-space: nowrap;
    padding: 0.35rem 0.75rem;
    border: 1px solid #86efac;
    border-radius: 6px;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .pledge-link:hover {
    background: #16a34a;
    color: white;
    border-color: #16a34a;
  }

  .pledge-link i {
    margin-left: 0.3rem;
    font-size: 0.65rem;
  }

  /* ===========================
     PARTNER LOGOS BAR
     =========================== */
  .emissions-partner-bar {
    padding: 0.75rem 0;
    margin: 0 0 0.75rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
  }

  .revealed .emissions-partner-bar {
    opacity: 1;
    transform: translateY(0);
  }

  .emissions-partner-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.6rem;
  }

  .emissions-partner-header > i {
    color: #3D6B6B;
    font-size: 0.8rem;
  }

  .emissions-partner-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #333;
  }

  .emissions-partner-logos {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .emissions-partner-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
    transition: opacity 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
  }

  .emissions-partner-logo:hover {
    opacity: 1;
    transform: translateY(-2px);
  }

  .emissions-partner-logo img {
    max-width: 80px;
    max-height: 32px;
    object-fit: contain;
  }

  /* ===========================
     SOURCE ATTRIBUTION FOOTER
     =========================== */
  .emissions-source-footer {
    text-align: center;
    font-size: 0.68rem;
    color: #94a3b8;
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transition: opacity 0.6s ease 1.1s;
  }

  .revealed .emissions-source-footer {
    opacity: 1;
  }

  .emissions-source-footer a {
    color: #64748b;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .emissions-source-footer a:hover {
    color: #3D6B6B;
    border-bottom-color: #3D6B6B;
  }

  .emissions-source-footer a:last-child {
    color: #3D6B6B;
    font-weight: 600;
  }

  /* ===========================
     RESPONSIVE
     =========================== */
  @media (max-width: 1024px) {
    .emissions-counters {
      grid-template-columns: repeat(2, 1fr);
    }

    .emissions-highlights-grid {
      grid-template-columns: 1fr;
    }

    #emissions-savings-section > div:nth-child(2) {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .emissions-story-card {
      padding: 1.25rem;
    }

    .emissions-headline {
      font-size: 1.1rem;
    }

    .emissions-story-header {
      flex-direction: column;
      gap: 0.5rem;
    }

    .emissions-counters {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .emissions-counters :global(.counter-display) {
      font-size: 1.4rem;
    }

    .emissions-partner-logos {
      gap: 1rem;
    }

    .emissions-partner-logo img {
      max-width: 60px;
      max-height: 26px;
    }

    .cooling-pledge-badge {
      flex-direction: column;
      text-align: center;
    }
  }

  @media (max-width: 600px) {
    .emissions-counters {
      grid-template-columns: 1fr 1fr;
    }

    .emissions-counters :global(.counter-card) {
      min-height: 85px;
      padding: 0.75rem 0.5rem;
    }

    .emissions-counters :global(.counter-display) {
      font-size: 1.2rem;
    }

    .emissions-counters :global(.counter-label) {
      font-size: 0.65rem;
    }
  }
</style>

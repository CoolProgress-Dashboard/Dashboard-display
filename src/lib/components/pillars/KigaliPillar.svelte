<script lang="ts">
  import { onMount } from 'svelte';
  import { VIEW_META } from '$lib/components/shared/config';
  import AnimatedCounter from '$lib/components/hero/AnimatedCounter.svelte';
  import { pillarContent } from '$lib/data/pillar-content';
  import { partners, globalCoolingPledge } from '$lib/data/partner-data';

  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;

  const meta = VIEW_META.kigali;
  const kigaliContent = pillarContent.kigali;

  // Animated stat cards
  const kigaliStats = [
    {
      value: '157',
      label: 'Kigali parties ratified',
      context: '157 countries have ratified the Kigali Amendment, covering over 95% of global HFC consumption. Source: UNEP Ozone Secretariat.'
    },
    {
      value: '0.5\u00B0C',
      label: 'warming avoided if fully implemented',
      context: 'Full Kigali implementation can avoid up to 0.5\u00B0C of global warming by 2100 by phasing down HFC production and consumption over 80%.'
    },
    {
      value: '80%',
      label: 'HFC phase-down target',
      context: 'Kigali requires parties to phase down HFC consumption by over 80% from baseline levels, with staggered timelines for developed and developing countries.'
    },
    {
      value: 'GWP 3',
      label: 'R-290 propane (natural refrigerant)',
      context: 'R-290 (propane) has a GWP of just 3, compared to 2,088 for R-410A. China and India already manufacture R-290 split ACs at scale.'
    }
  ];

  // Chart highlights - what each visualization shows
  const chartHighlights = [
    {
      icon: 'fa-temperature-arrow-up',
      title: 'GWP Comparison',
      description: 'See which refrigerants carry the highest climate impact',
      color: '#E85A4F'
    },
    {
      icon: 'fa-chart-area',
      title: 'Transition Timeline',
      description: 'Track the shift from HFCs to natural refrigerants through 2050',
      color: '#3D6B6B'
    },
    {
      icon: 'fa-earth-americas',
      title: 'Country Compliance',
      description: 'Map Kigali ratification and implementation progress worldwide',
      color: '#8BC34A'
    },
    {
      icon: 'fa-chart-line',
      title: 'Direct Emissions Trend',
      description: 'Compare BAU, Kigali, and Mitigation scenarios for refrigerant emissions',
      color: '#4A7F7F'
    }
  ];

  // Kigali pillar partners: CCC (client) → UNEP Ozone → GIZ → HEAT (last)
  const kigaliPartnerIds = ['ccc', 'unep-ozone', 'giz', 'heat'];
  const kigaliPartners = kigaliPartnerIds
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

<section id="view-kigali" class="view-section" class:active>
  <div class="pillar-stack">
    <!-- Story Card -->
    <div class="card-panel kigali-story-card" class:revealed>
      <!-- Header -->
      <div class="kigali-story-header">
        <div class="kigali-story-text">
          <h1 class="kigali-headline">{meta.headline}</h1>
          <p class="kigali-subhead">{meta.subhead}</p>
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
      <p class="kigali-story-hook">{kigaliContent.storyHook}</p>

      <!-- Animated stat cards -->
      <div class="kigali-counters">
        {#each kigaliStats as stat, i}
          <div class="kigali-counter-wrapper" style="transition-delay: {200 + i * 100}ms">
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
      <div class="kigali-narrative">
        <h3 class="kigali-narrative-title">
          <i class="fa-solid fa-flask"></i>
          The Transition Pathway
        </h3>
        <p>{kigaliContent.keyNarrative}</p>
      </div>

      <!-- Chart highlights -->
      <div class="kigali-chart-highlights">
        <h3 class="kigali-highlights-title">
          <i class="fa-solid fa-chart-simple"></i>
          What the Data Shows
        </h3>
        <div class="kigali-highlights-grid">
          {#each chartHighlights as highlight}
            <div class="kigali-highlight-card">
              <div class="kigali-highlight-icon" style="color: {highlight.color}">
                <i class="fa-solid {highlight.icon}"></i>
              </div>
              <div class="kigali-highlight-text">
                <strong>{highlight.title}</strong>
                <span>{highlight.description}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Cooling Pledge Badge -->
      <div class="kigali-pledge-badge">
        <div class="pledge-icon"><i class="fa-solid fa-handshake-angle"></i></div>
        <div class="pledge-content">
          <strong>Global Cooling Pledge Alignment</strong>
          <span>Target: {globalCoolingPledge.targetEmissionReduction} from BAU &middot; {globalCoolingPledge.signatoryCountries} signatory nations</span>
        </div>
        <a href={globalCoolingPledge.progressReportUrl} target="_blank" rel="noopener noreferrer" class="pledge-link">Progress Report</a>
      </div>

      <!-- Partner logos bar -->
      <div class="kigali-partner-bar">
        <div class="kigali-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="kigali-partner-title">Data Partners</span>
        </div>
        <div class="kigali-partner-logos">
          {#each kigaliPartners as partner (partner.id)}
            <a
              href={partner.coolingUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="kigali-partner-logo"
              title={partner.fullName}
            >
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>

      <!-- Source attribution -->
      <div class="kigali-source-footer">
        Sources:
        <a href="https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016" target="_blank" rel="noopener noreferrer">UNEP Ozone Secretariat</a>
        &middot;
        <a href="https://iifiir.org" target="_blank" rel="noopener noreferrer">IIR</a>
        &middot;
        <a href="https://www.green-cooling-initiative.org/" target="_blank" rel="noopener noreferrer">GIZ Proklima</a>
        &middot;
        <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
        &middot;
        <a href="/methodology">Methodology</a>
      </div>
    </div>

    <!-- TREND CHARTS FIRST (before map) -->

    <!-- Market Share Transition Timeline -->
    <div class="card-panel chart-card">
      <div class="chart-card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h3><i class="fa-solid fa-chart-area" style="color: #3D6B6B; margin-right: 0.5rem;"></i>Market Share: Refrigerant Transition (2020–2050)</h3>
          <p class="chart-subtitle">Projected refrigerant market share by appliance type</p>
        </div>
        <a href="/methodology#refrigerant-transition" style="font-size: 0.68rem; color: #3D6B6B; text-decoration: none; display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; white-space: nowrap;">
          <i class="fa-solid fa-book-open" style="font-size: 0.6rem;"></i> Methodology
        </a>
      </div>
      <div style="display: flex; gap: 0.75rem; padding: 0 0.75rem 0.5rem; flex-wrap: wrap; align-items: center;">
        <div style="display: flex; gap: 0.35rem;">
          <button class="toggle-btn kigali-appliance-toggle active" data-appliance="ac" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #3D6B6B; border-radius: 5px; background: #3D6B6B; color: white; cursor: pointer;">AC</button>
          <button class="toggle-btn kigali-appliance-toggle" data-appliance="fridge" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 5px; background: white; color: #475569; cursor: pointer;">Fridges</button>
        </div>
        <span style="color: #cbd5e1;">|</span>
        <div style="display: flex; gap: 0.35rem;" id="kigali-region-toggles">
          <button class="toggle-btn kigali-region-toggle active" data-region="" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #3D6B6B; border-radius: 5px; background: #3D6B6B; color: white; cursor: pointer;">Global</button>
          <button class="toggle-btn kigali-region-toggle" data-region="China" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 5px; background: white; color: #475569; cursor: pointer;">China</button>
          <button class="toggle-btn kigali-region-toggle" data-region="India" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 5px; background: white; color: #475569; cursor: pointer;">India</button>
          <button class="toggle-btn kigali-region-toggle" data-region="Europe" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 5px; background: white; color: #475569; cursor: pointer;">Europe</button>
          <button class="toggle-btn kigali-region-toggle" data-region="Africa" type="button" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 5px; background: white; color: #475569; cursor: pointer;">Africa</button>
        </div>
      </div>
      <div class="chart-card-body">
        <div id="chart-kigali-transition" class="chart-surface" style="width: 100%; height: 340px; min-height: 340px;"></div>
        <div style="font-size: 0.68rem; color: #94a3b8; text-align: center; padding: 0.5rem;">
          Sources: UNEP Ozone Secretariat · IIR · JARN · HEAT GmbH modelling
        </div>
      </div>
    </div>

    <!-- Direct Emissions Trend (Subcool BAU vs KIP vs KIP+ vs MIT) -->
    <div class="card-panel chart-card">
      <div class="chart-card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h3><i class="fa-solid fa-chart-line" style="color: #4A7F7F; margin-right: 0.5rem;"></i>Direct Refrigerant Emissions by Scenario</h3>
          <p class="chart-subtitle">Global direct (refrigerant) emissions: BAU vs Kigali vs Kigali+ vs Mitigation</p>
        </div>
        <a href="/methodology#direct-emissions" style="font-size: 0.68rem; color: #3D6B6B; text-decoration: none; display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; white-space: nowrap;">
          <i class="fa-solid fa-book-open" style="font-size: 0.6rem;"></i> Methodology
        </a>
      </div>
      <div class="chart-card-body">
        <div id="chart-kigali-direct-emissions" class="chart-surface" style="width: 100%; height: 380px; min-height: 380px;"></div>
      </div>
    </div>

    <!-- KPI Cards (separated) -->
    <div class="card-panel kpi-panel">
      <div class="kpi-grid policy-kpis">
        <div class="kpi-card green">
          <div class="kpi-value" id="kigali-kpi-parties">-</div>
          <div class="kpi-label">Kigali Parties</div>
          <div class="kpi-sublabel">Ratified the amendment</div>
        </div>
        <div class="kpi-card blue">
          <div class="kpi-value" id="kigali-kpi-montreal">-</div>
          <div class="kpi-label">Montreal Protocol</div>
          <div class="kpi-sublabel">Protocol parties</div>
        </div>
        <div class="kpi-card amber">
          <div class="kpi-value" id="kigali-kpi-article5">-</div>
          <div class="kpi-label">Article 5 Countries</div>
          <div class="kpi-sublabel">Developing nations</div>
        </div>
        <div class="kpi-card teal">
          <div class="kpi-value" id="kigali-kpi-non-article5">-</div>
          <div class="kpi-label">Non-Article 5</div>
          <div class="kpi-sublabel">Developed nations</div>
        </div>
      </div>
    </div>

    <!-- Filter Panel -->
    <div class="card-panel filter-panel" style="padding: 1rem 1.25rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-end;">
        <!-- Region Filter -->
        <div class="filter-group" style="flex: 1; min-width: 180px;">
          <label class="filter-label">Region</label>
          <select id="kigali-region-filter" class="filter-select">
            <option value="">All Regions</option>
          </select>
        </div>

        <!-- Group Type Toggles -->
        <div class="filter-group" style="flex: 2; min-width: 300px;">
          <label class="filter-label">Group Type
            <button id="kigali-group-all" class="mini-btn" type="button">All</button>
            <button id="kigali-group-none" class="mini-btn" type="button">None</button>
          </label>
          <div class="toggle-group" id="kigali-group-toggles">
            <!-- Will be populated dynamically -->
          </div>
        </div>
      </div>
    </div>

    <!-- Map and Country Detail -->
    <div class="card-panel map-card">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-flask"></i>
          Kigali Amendment Ratification Status
        </div>
        <span class="viewing-pill">Viewing: <strong id="kigali-viewing">Global</strong></span>
      </div>
      <div id="kigali-map-container" class="map-surface"></div>
      <div class="legend legend-row">
        <span class="legend-label">Status:</span>
        <div id="kigali-legend" class="legend-items"></div>
      </div>
      <div class="progress-bar" id="kigali-progress">
        <span class="progress-segment high" id="kigali-progress-high" title="Kigali Party (Non-A5)"></span>
        <span class="progress-segment medium" id="kigali-progress-medium" title="Kigali Party (Article 5)"></span>
        <span class="progress-segment low" id="kigali-progress-low" title="Montreal Only"></span>
        <span class="progress-segment critical" id="kigali-progress-critical" title="Non-Party"></span>
      </div>
      <div id="kigali-country-detail" class="country-card-inline">
        <h3>Selected Country</h3>
        <div class="country-detail">
          <h4>Select a country</h4>
          <p class="side-muted">Click on a country in the map to see Kigali details, refrigerant mix, and saving potential.</p>
        </div>
      </div>
    </div>


    <!-- Source Attribution -->
    <div style="text-align: center; padding: 0.75rem; font-size: 0.7rem; color: #94a3b8;">
      Sources:
      <a href="https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016" target="_blank" rel="noopener noreferrer" style="color: #64748b;">UNEP Ozone Secretariat</a>
      &middot;
      <a href="https://iifiir.org" target="_blank" rel="noopener noreferrer" style="color: #64748b;">IIR</a>
      &middot;
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer" style="color: #64748b;">HEAT GmbH</a>
      &middot;
      <a href="https://www.multilateralfund.org/OurWork/default.aspx" target="_blank" rel="noopener noreferrer" style="color: #64748b;">MLF</a>
      &middot;
      <a href="/methodology" style="color: #3D6B6B; font-weight: 600;">Methodology</a>
    </div>
  </div>
</section>

<style>
  /* ===========================
     KIGALI STORY CARD
     Story-driven card with teal/green accent (Kigali pillar identity).
     =========================== */
  .kigali-story-card {
    border-left: 4px solid #3D6B6B;
    padding: 1.75rem;
    position: relative;
    overflow: visible;
  }

  .kigali-story-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(61, 107, 107, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ===========================
     HEADER
     =========================== */
  .kigali-story-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .kigali-story-text {
    flex: 1;
    min-width: 0;
  }

  .kigali-headline {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 0 0 0.4rem;
    letter-spacing: -0.01em;
  }

  .kigali-subhead {
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
  }

  /* ===========================
     STORY HOOK
     =========================== */
  .kigali-story-hook {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    margin: 0 0 1.25rem;
    padding: 0.75rem 1rem;
    background: #f8fafb;
    border-radius: 10px;
    border-left: 3px solid #3D6B6B;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
  }

  .revealed .kigali-story-hook {
    opacity: 1;
    transform: translateY(0);
  }

  /* ===========================
     ANIMATED COUNTERS
     =========================== */
  .kigali-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  .kigali-counter-wrapper {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .revealed .kigali-counter-wrapper {
    opacity: 1;
    transform: translateY(0);
  }

  .kigali-counters :global(.counter-card) {
    background: linear-gradient(135deg, #f0f7f4 0%, #f5fafa 100%);
    border: 1px solid rgba(61, 107, 107, 0.15);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: 100px;
    padding: 1rem 0.75rem;
  }

  .kigali-counters :global(.counter-card:hover) {
    background: linear-gradient(135deg, #e5f2ec 0%, #edf7f7 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(61, 107, 107, 0.12);
  }

  .kigali-counters :global(.counter-display) {
    font-size: 1.8rem;
    color: #3D6B6B;
  }

  .kigali-counters :global(.counter-label) {
    font-size: 0.72rem;
    color: #4A7F7F;
  }

  .kigali-counters :global(.counter-tooltip) {
    background: #ffffff;
    color: #1e293b;
    border: 1px solid #e2e8f0;
    z-index: 99999;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  }

  /* ===========================
     KEY NARRATIVE
     =========================== */
  .kigali-narrative {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
  }

  .revealed .kigali-narrative {
    opacity: 1;
    transform: translateY(0);
  }

  .kigali-narrative-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #3D6B6B;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .kigali-narrative-title i {
    color: #8BC34A;
    font-size: 0.85rem;
  }

  .kigali-narrative p {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.7;
    margin: 0;
  }

  /* ===========================
     CHART HIGHLIGHTS
     =========================== */
  .kigali-chart-highlights {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s;
  }

  .revealed .kigali-chart-highlights {
    opacity: 1;
    transform: translateY(0);
  }

  .kigali-highlights-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #3D6B6B;
    margin: 0 0 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .kigali-highlights-title i {
    color: #8BC34A;
    font-size: 0.85rem;
  }

  .kigali-highlights-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }

  .kigali-highlight-card {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem;
    background: #fafbfc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .kigali-highlight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .kigali-highlight-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .kigali-highlight-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .kigali-highlight-text strong {
    font-size: 0.78rem;
    font-weight: 700;
    color: #0f172a;
  }

  .kigali-highlight-text span {
    font-size: 0.72rem;
    color: #64748b;
    line-height: 1.4;
  }

  /* ===========================
     COOLING PLEDGE BADGE
     =========================== */
  .kigali-pledge-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #f0fdf4, #f0f7f4);
    border: 1px solid #86efac;
    border-radius: 12px;
    margin: 0 0 1rem;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s;
  }

  .revealed .kigali-pledge-badge {
    opacity: 1;
    transform: translateY(0);
  }

  .pledge-icon {
    font-size: 1.2rem;
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
    margin-bottom: 0.15rem;
  }

  .pledge-content span {
    font-size: 0.72rem;
    color: #4ade80;
  }

  .pledge-link {
    font-size: 0.72rem;
    font-weight: 600;
    color: #15803d;
    text-decoration: none;
    white-space: nowrap;
    border-bottom: 1px dashed #86efac;
    transition: color 0.2s;
  }

  .pledge-link:hover {
    color: #166534;
  }

  /* ===========================
     PARTNER LOGOS BAR
     =========================== */
  .kigali-partner-bar {
    padding: 0.75rem 0;
    margin: 0 0 0.75rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
  }

  .revealed .kigali-partner-bar {
    opacity: 1;
    transform: translateY(0);
  }

  .kigali-partner-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.6rem;
  }

  .kigali-partner-header > i {
    color: #3D6B6B;
    font-size: 0.8rem;
  }

  .kigali-partner-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #333;
  }

  .kigali-partner-logos {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .kigali-partner-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
    transition: opacity 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
  }

  .kigali-partner-logo:hover {
    opacity: 1;
    transform: translateY(-2px);
  }

  .kigali-partner-logo img {
    max-width: 80px;
    max-height: 32px;
    object-fit: contain;
  }

  /* ===========================
     SOURCE FOOTER
     =========================== */
  .kigali-source-footer {
    text-align: center;
    font-size: 0.68rem;
    color: #94a3b8;
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transition: opacity 0.6s ease 1.1s;
  }

  .revealed .kigali-source-footer {
    opacity: 1;
  }

  .kigali-source-footer a {
    color: #64748b;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .kigali-source-footer a:hover {
    color: #3D6B6B;
    border-bottom-color: #3D6B6B;
  }

  .kigali-source-footer a:last-child {
    color: #3D6B6B;
    font-weight: 600;
  }

  /* ===========================
     KPI PANEL (separated)
     =========================== */
  .kpi-panel {
    padding: 1rem 1.25rem;
  }

  /* ===========================
     RESPONSIVE
     =========================== */
  @media (max-width: 1024px) {
    .kigali-counters {
      grid-template-columns: repeat(2, 1fr);
    }

    .kigali-highlights-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .kigali-story-card {
      padding: 1.25rem;
    }

    .kigali-headline {
      font-size: 1.1rem;
    }

    .kigali-story-header {
      flex-direction: column;
      gap: 0.5rem;
    }

    .kigali-counters {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .kigali-counters :global(.counter-display) {
      font-size: 1.4rem;
    }

    .kigali-highlights-grid {
      grid-template-columns: 1fr;
    }

    .kigali-partner-logos {
      gap: 1rem;
    }

    .kigali-partner-logo img {
      max-width: 60px;
      max-height: 26px;
    }

    .kigali-pledge-badge {
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
    }
  }

  @media (max-width: 600px) {
    .kigali-counters {
      grid-template-columns: 1fr 1fr;
    }

    .kigali-counters :global(.counter-card) {
      min-height: 85px;
      padding: 0.75rem 0.5rem;
    }

    .kigali-counters :global(.counter-display) {
      font-size: 1.2rem;
    }

    .kigali-counters :global(.counter-label) {
      font-size: 0.65rem;
    }
  }
</style>

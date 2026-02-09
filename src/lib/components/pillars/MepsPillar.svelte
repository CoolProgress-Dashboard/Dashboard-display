<script lang="ts">
  import { onMount } from 'svelte';
  import { VIEW_META } from '$lib/components/shared/config';
  import AnimatedCounter from '$lib/components/hero/AnimatedCounter.svelte';
  import { pillarContent } from '$lib/data/pillar-content';
  import { partners } from '$lib/data/partner-data';
  import MepsLevelChart from '$lib/components/charts/MepsLevelChart.svelte';

  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;

  const meta = VIEW_META.meps;
  const mepsContent = pillarContent.meps;

  // Animated stat cards data
  const mepsStats = [
    {
      value: '3x',
      label: 'efficiency gap between best and worst',
      context: 'The best split AC on the market today achieves a CSPF above 8.0, while many markets still allow units below 3.0. Source: CLASP.'
    },
    {
      value: '1,300',
      label: 'TWh annual savings potential',
      context: 'If every country adopted MEPS at best-available-technology level, we avoid 1,300 TWh of annual electricity consumption -- roughly India\'s entire output. Source: CLASP.'
    },
    {
      value: '40%',
      label: 'demand reduction achievable',
      context: 'CLASP modelling shows cooling energy consumption drops 40-50% by 2050 with universal adoption of best-available MEPS, without reducing comfort or access.'
    },
    {
      value: '80+',
      label: 'countries with some form of MEPS',
      context: 'Over 80 countries have cooling-related Minimum Energy Performance Standards, but standards vary enormously in stringency, scope, and enforcement.'
    }
  ];

  // Chart highlights
  const chartHighlights = [
    {
      icon: 'fa-chart-bar',
      title: 'MEPS & Labels by Region',
      description: 'See which regions lead in policy adoption',
      color: '#3D6B6B'
    },
    {
      icon: 'fa-clock-rotate-left',
      title: 'MEPS Levels Over Time',
      description: 'Track how efficiency standards have evolved across major economies',
      color: '#8BC34A'
    },
    {
      icon: 'fa-cogs',
      title: 'Equipment Type Coverage',
      description: 'Compare policy coverage across AC, Fridges, and Fans',
      color: '#4A7F7F'
    }
  ];

  // Filter MEPS-relevant partners: CCC first, HEAT last
  const mepsPartnerIds = ['ccc', 'clasp', 'u4e', 'iea', 'giz', 'heat'];
  const mepsPartners = mepsPartnerIds
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

<section id="view-meps" class="view-section" class:active>
  <div class="pillar-stack">
    <!-- Redesigned Story Card -->
    <div class="card-panel meps-story-card" class:revealed>
      <!-- Header area -->
      <div class="meps-story-header">
        <div class="meps-story-text">
          <h1 class="meps-headline">{meta.headline}</h1>
          <p class="meps-subhead">{meta.subhead}</p>
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
      <p class="meps-story-hook">{mepsContent.storyHook}</p>

      <!-- Animated stat cards -->
      <div class="meps-counters">
        {#each mepsStats as stat, i}
          <div class="meps-counter-wrapper" style="transition-delay: {200 + i * 100}ms">
            <AnimatedCounter
              value={stat.value}
              label={stat.label}
              context={stat.context}
              duration={1800 + i * 150}
            />
          </div>
        {/each}
      </div>

      <!-- Key narrative paragraph -->
      <div class="meps-narrative">
        <h3 class="meps-narrative-title">
          <i class="fa-solid fa-lightbulb"></i>
          The Standards Gap
        </h3>
        <p>{mepsContent.keyNarrative}</p>
      </div>

      <!-- Chart highlights -->
      <div class="meps-chart-highlights">
        <h3 class="meps-highlights-title">
          <i class="fa-solid fa-chart-simple"></i>
          What the Data Shows
        </h3>
        <div class="meps-highlights-grid">
          {#each chartHighlights as highlight}
            <div class="meps-highlight-card">
              <div class="meps-highlight-icon" style="color: {highlight.color}">
                <i class="fa-solid {highlight.icon}"></i>
              </div>
              <div class="meps-highlight-text">
                <strong>{highlight.title}</strong>
                <span>{highlight.description}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Partner logos bar -->
      <div class="meps-partner-bar">
        <div class="meps-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="meps-partner-title">Data Partners</span>
        </div>
        <div class="meps-partner-logos">
          {#each mepsPartners as partner (partner.id)}
            <a
              href={partner.coolingUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="meps-partner-logo"
              title={partner.fullName}
            >
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>

      <!-- Source attribution footer -->
      <div class="meps-source-footer">
        Sources:
        <a href="https://cprc-clasp.ngo/" target="_blank" rel="noopener noreferrer">CLASP CPRC</a>
        &middot;
        <a href="https://united4efficiency.org/resources/model-regulation-guidelines/" target="_blank" rel="noopener noreferrer">U4E Model Regulations</a>
        &middot;
        <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
        &middot;
        <a href="/methodology">Methodology</a>
      </div>
    </div>

    <!-- MEPS Stringency Chart (above map) -->
    <div class="card-panel chart-card">
      <MepsLevelChart />
    </div>

    <!-- Map Card with Appliance Toggles -->
    <div class="card-panel map-card">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-bolt"></i>
          MEPS &amp; Labels Coverage
        </div>
        <div class="meps-map-toggles">
          <div class="toggle-group" id="meps-equipment-toggles">
            <!-- Populated dynamically by initMepsFilters -->
          </div>
        </div>
      </div>
      <div id="meps-map-container" class="map-surface"></div>
      <div class="legend legend-row">
        <span class="legend-label">Policy Status:</span>
        <div id="meps-legend" class="legend-items"></div>
      </div>
      <div class="progress-bar" id="meps-progress">
        <span class="progress-segment" id="meps-progress-both" title="MEPS & Labels" style="background:#8BC34A"></span>
        <span class="progress-segment" id="meps-progress-meps" title="MEPS Only" style="background:#3D6B6B"></span>
        <span class="progress-segment" id="meps-progress-labels" title="Labels Only" style="background:#FFB74D"></span>
        <span class="progress-segment" id="meps-progress-critical" title="No Policies" style="background:#ef4444"></span>
      </div>
    </div>

    <!-- Country Detail (populated when clicking a country on the map) -->
    <div class="country-card-inline" id="meps-country-detail" style="display:none;">
      <div class="country-detail"></div>
    </div>

    <!-- Charts Grid -->
    <div class="meps-charts-section charts-section">
      <div class="card-panel chart-card">
        <div class="chart-card-header">
          <h3 id="meps-chart1-title"><i class="fa-solid fa-chart-bar" style="color: #8BC34A; margin-right: 0.5rem;"></i>MEPS & Labels by Region</h3>
          <p class="chart-subtitle" id="meps-chart1-subtitle">Countries with MEPS vs Labels per region</p>
        </div>
        <div class="chart-card-body">
          <div id="chart-meps-by-region" class="chart-surface" style="width: 100%; height: 280px; min-height: 280px;"></div>
        </div>
      </div>

      <div class="card-panel chart-card">
        <div class="chart-card-header">
          <h3 id="meps-chart3-title"><i class="fa-solid fa-cogs" style="color: #8BC34A; margin-right: 0.5rem;"></i>Equipment Type Coverage</h3>
          <p class="chart-subtitle" id="meps-chart3-subtitle">Countries with MEPS vs Labels by appliance</p>
        </div>
        <div class="chart-card-body">
          <div id="chart-meps-equipment" class="chart-surface" style="width: 100%; height: 320px; min-height: 320px;"></div>
        </div>
      </div>
    </div>

    <!-- Source Attribution -->
    <div style="text-align: center; padding: 0.75rem; font-size: 0.7rem; color: #94a3b8;">
      Sources:
      <a href="https://cprc-clasp.ngo/" target="_blank" rel="noopener noreferrer" style="color: #64748b;">CLASP CPRC</a>
      &middot;
      <a href="https://united4efficiency.org/resources/model-regulation-guidelines/" target="_blank" rel="noopener noreferrer" style="color: #64748b;">U4E Model Regulations</a>
      &middot;
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer" style="color: #64748b;">HEAT GmbH</a>
      &middot;
      <a href="/methodology" style="color: #3D6B6B; font-weight: 600;">Methodology</a>
    </div>
  </div>
</section>

<style>
  /* ===========================
     MEPS STORY CARD
     Rich narrative card replacing the basic headline/subhead/KPI format.
     Uses light background with teal accent (matching MEPS pillar identity).
     =========================== */
  .meps-story-card {
    border-left: 4px solid #1a6b5a;
    padding: 1.75rem;
    position: relative;
    overflow: visible;
  }

  .meps-story-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(139, 195, 74, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ===========================
     HEADER
     =========================== */
  .meps-story-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .meps-story-text {
    flex: 1;
    min-width: 0;
  }

  .meps-headline {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 0 0 0.4rem;
    letter-spacing: -0.01em;
  }

  .meps-subhead {
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
  }

  /* ===========================
     STORY HOOK (narrative paragraph below headline)
     =========================== */
  .meps-story-hook {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    margin: 0 0 1.25rem;
    padding: 0.75rem 1rem;
    background: #f8fafb;
    border-radius: 10px;
    border-left: 3px solid #8BC34A;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
  }

  .revealed .meps-story-hook {
    opacity: 1;
    transform: translateY(0);
  }

  /* ===========================
     ANIMATED COUNTER GRID
     Adapts the HeroSection counter pattern for a white/light background.
     =========================== */
  .meps-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  .meps-counter-wrapper {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .revealed .meps-counter-wrapper {
    opacity: 1;
    transform: translateY(0);
  }

  /* Override AnimatedCounter glassmorphic style for light background */
  .meps-counters :global(.counter-card) {
    background: linear-gradient(135deg, #f0f7f0 0%, #f5fafa 100%);
    border: 1px solid rgba(61, 107, 107, 0.15);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: 100px;
    padding: 1rem 0.75rem;
  }

  .meps-counters :global(.counter-card:hover) {
    background: linear-gradient(135deg, #e8f5e8 0%, #edf7f7 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(61, 107, 107, 0.12);
  }

  .meps-counters :global(.counter-display) {
    font-size: 1.8rem;
    color: #1a6b5a;
  }

  .meps-counters :global(.counter-label) {
    font-size: 0.72rem;
    color: #4A7F7F;
  }

  .meps-counters :global(.counter-tooltip) {
    background: #0f172a !important;
    color: #ffffff !important;
    z-index: 99999;
    box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3);
    opacity: 1 !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }

  /* ===========================
     KEY NARRATIVE
     =========================== */
  .meps-narrative {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
  }

  .revealed .meps-narrative {
    opacity: 1;
    transform: translateY(0);
  }

  .meps-narrative-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #3D6B6B;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .meps-narrative-title i {
    color: #8BC34A;
    font-size: 0.85rem;
  }

  .meps-narrative p {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.7;
    margin: 0;
  }

  /* ===========================
     CHART HIGHLIGHTS
     Three callout cards summarizing what each chart shows.
     =========================== */
  .meps-chart-highlights {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s;
  }

  .revealed .meps-chart-highlights {
    opacity: 1;
    transform: translateY(0);
  }

  .meps-highlights-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #3D6B6B;
    margin: 0 0 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .meps-highlights-title i {
    color: #8BC34A;
    font-size: 0.85rem;
  }

  .meps-highlights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .meps-highlight-card {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem;
    background: #fafbfc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .meps-highlight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .meps-highlight-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .meps-highlight-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .meps-highlight-text strong {
    font-size: 0.78rem;
    font-weight: 700;
    color: #0f172a;
  }

  .meps-highlight-text span {
    font-size: 0.72rem;
    color: #64748b;
    line-height: 1.4;
  }

  /* ===========================
     PARTNER LOGOS BAR
     Mirrors OverviewPillar partner-bar pattern.
     =========================== */
  .meps-partner-bar {
    padding: 0.75rem 0;
    margin: 0 0 0.75rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
  }

  .revealed .meps-partner-bar {
    opacity: 1;
    transform: translateY(0);
  }

  .meps-partner-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.6rem;
  }

  .meps-partner-header > i {
    color: #3D6B6B;
    font-size: 0.8rem;
  }

  .meps-partner-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #333;
  }

  .meps-partner-logos {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .meps-partner-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
    transition: opacity 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
  }

  .meps-partner-logo:hover {
    opacity: 1;
    transform: translateY(-2px);
  }

  .meps-partner-logo img {
    max-width: 80px;
    max-height: 32px;
    object-fit: contain;
  }

  /* ===========================
     SOURCE ATTRIBUTION FOOTER
     =========================== */
  .meps-source-footer {
    text-align: center;
    font-size: 0.68rem;
    color: #94a3b8;
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transition: opacity 0.6s ease 1.1s;
  }

  .revealed .meps-source-footer {
    opacity: 1;
  }

  .meps-source-footer a {
    color: #64748b;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .meps-source-footer a:hover {
    color: #3D6B6B;
    border-bottom-color: #3D6B6B;
  }

  .meps-source-footer a:last-child {
    color: #3D6B6B;
    font-weight: 600;
  }

  /* ===========================
     RESPONSIVE
     =========================== */
  @media (max-width: 1024px) {
    .meps-counters {
      grid-template-columns: repeat(2, 1fr);
    }

    .meps-highlights-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .meps-story-card {
      padding: 1.25rem;
    }

    .meps-headline {
      font-size: 1.1rem;
    }

    .meps-story-header {
      flex-direction: column;
      gap: 0.5rem;
    }

    .meps-counters {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .meps-counters :global(.counter-display) {
      font-size: 1.4rem;
    }

    .meps-partner-logos {
      gap: 1rem;
    }

    .meps-partner-logo img {
      max-width: 60px;
      max-height: 26px;
    }
  }

  @media (max-width: 600px) {
    .meps-counters {
      grid-template-columns: 1fr 1fr;
    }

    .meps-counters :global(.counter-card) {
      min-height: 85px;
      padding: 0.75rem 0.5rem;
    }

    .meps-counters :global(.counter-display) {
      font-size: 1.2rem;
    }

    .meps-counters :global(.counter-label) {
      font-size: 0.65rem;
    }
  }

  /* Charts section - constrain width */
  .meps-charts-section {
    background: #fafafa;
    padding: 1.25rem;
    border-radius: 0 0 16px 16px;
    border: 1px solid #e2e8f0;
    border-top: none;
    box-sizing: border-box;
    max-width: 100%;
    overflow: hidden;
  }

  .meps-charts-section :global(.chart-card) {
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .meps-charts-section :global(.chart-card-body) {
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .meps-charts-section :global(.chart-card + .chart-card) {
    margin-top: 1.25rem;
  }
</style>

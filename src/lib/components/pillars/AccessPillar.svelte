<script lang="ts">
  import { onMount } from 'svelte';
  import { VIEW_META } from '$lib/components/shared/config';
  import AnimatedCounter from '$lib/components/hero/AnimatedCounter.svelte';
  import { pillarContent } from '$lib/data/pillar-content';
  import { partners, globalCoolingPledge } from '$lib/data/partner-data';

  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;

  const meta = VIEW_META.access;
  const accessContent = pillarContent.access;

  // Animated stat cards
  const accessStats = [
    {
      value: '1.2B',
      label: 'people lack adequate cooling',
      context: 'Over 1.2 billion people in low- and middle-income countries face dangerous heat without access to cooling. Source: SEforALL Chilling Prospects 2025.'
    },
    {
      value: '420K',
      label: 'deaths/year from food spoilage',
      context: 'An estimated 420,000 people die annually from unsafe food, much of it due to broken cold chains in developing countries. Source: WHO/SEforALL.'
    },
    {
      value: '80M',
      label: 'jobs lost to heat stress by 2030',
      context: 'Heat stress could reduce total working hours by 2.2% globally by 2030, equivalent to 80 million full-time jobs. Losses concentrate in cooling-poor regions. Source: ILO.'
    },
    {
      value: '40%',
      label: 'African food lost post-harvest',
      context: 'Up to 40% of food production in Africa is lost post-harvest due to lack of cold chain infrastructure. Cold chain access could prevent millions of tonnes of food waste.'
    }
  ];

  // Chart highlights - matches current functionality (map + filters + country detail)
  const chartHighlights = [
    {
      icon: 'fa-earth-americas',
      title: 'Cooling Access Map',
      description: 'Explore which countries face the largest cooling access gaps by population at risk',
      color: '#E85A4F'
    },
    {
      icon: 'fa-chart-area',
      title: '2013\u20132050 Timeline',
      description: 'Unified historical and projected view of population at risk, stacked by income group',
      color: '#f59e0b'
    },
    {
      icon: 'fa-map-location-dot',
      title: 'Country Deep-Dive',
      description: 'Click any country for detailed cooling gap breakdown by income group and risk level',
      color: '#3D6B6B'
    }
  ];

  // Access pillar partners: CCC (client) → SE4ALL → Cool Coalition → Kigali Pledge → HEAT (last)
  const accessPartnerIds = ['ccc', 'se4all', 'cool-coalition', 'heat'];
  const accessPartners = accessPartnerIds
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

<section id="view-access" class="view-section" class:active>
  <div class="pillar-stack">
    <!-- Story Card -->
    <div class="card-panel access-story-card" class:revealed>
      <!-- Header -->
      <div class="access-story-header">
        <div class="access-story-text">
          <h1 class="access-headline">{meta.headline}</h1>
          <p class="access-subhead">{meta.subhead}</p>
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
      <p class="access-story-hook">{accessContent.storyHook}</p>

      <!-- Animated stat cards -->
      <div class="access-counters">
        {#each accessStats as stat, i}
          <div class="access-counter-wrapper" style="transition-delay: {200 + i * 100}ms">
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
      <div class="access-narrative">
        <h3 class="access-narrative-title">
          <i class="fa-solid fa-heart-pulse"></i>
          The Human Cost
        </h3>
        <p>{accessContent.keyNarrative}</p>
      </div>

      <!-- Chart highlights -->
      <div class="access-chart-highlights">
        <h3 class="access-highlights-title">
          <i class="fa-solid fa-chart-simple"></i>
          What the Data Shows
        </h3>
        <div class="access-highlights-grid">
          {#each chartHighlights as highlight}
            <div class="access-highlight-card">
              <div class="access-highlight-icon" style="color: {highlight.color}">
                <i class="fa-solid {highlight.icon}"></i>
              </div>
              <div class="access-highlight-text">
                <strong>{highlight.title}</strong>
                <span>{highlight.description}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Cooling Pledge Badge -->
      <div class="access-pledge-badge">
        <div class="pledge-icon"><i class="fa-solid fa-handshake-angle"></i></div>
        <div class="pledge-content">
          <strong>Global Cooling Pledge Alignment</strong>
          <span>Target: {globalCoolingPledge.targetEmissionReduction} from BAU &middot; {globalCoolingPledge.signatoryCountries} signatory nations &middot; Expand sustainable cooling access</span>
        </div>
        <a href={globalCoolingPledge.progressReportUrl} target="_blank" rel="noopener noreferrer" class="pledge-link">Progress Report</a>
      </div>

      <!-- Cool Coalition reference -->
      <div class="access-cool-coalition">
        <i class="fa-solid fa-people-group" style="color: #3D6B6B; margin-right: 0.5rem;"></i>
        <span>
          <strong>UNEP Cool Coalition</strong> unites 100+ governments, cities, and businesses for clean, efficient, accessible cooling.
          <a href="https://coolcoalition.org/" target="_blank" rel="noopener noreferrer">Learn more</a>
        </span>
      </div>

      <!-- Partner logos bar -->
      <div class="access-partner-bar">
        <div class="access-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="access-partner-title">Data Partners</span>
        </div>
        <div class="access-partner-logos">
          {#each accessPartners as partner (partner.id)}
            <a
              href={partner.coolingUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="access-partner-logo"
              title={partner.fullName}
            >
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>

      <!-- Source attribution -->
      <div class="access-source-footer">
        Sources:
        <a href="https://www.seforall.org/data-stories/chilling-prospects-2025" target="_blank" rel="noopener noreferrer">SEforALL Chilling Prospects</a>
        &middot;
        <a href="https://coolcoalition.org/" target="_blank" rel="noopener noreferrer">UNEP Cool Coalition</a>
        &middot;
        <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
        &middot;
        <a href="/methodology">Methodology</a>
      </div>
    </div>


    <!-- Map Card with Filters Inside -->
    <div class="card-panel map-card">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-earth-americas"></i>
          Cooling Access Gap by Country
        </div>
        <span class="viewing-pill">Viewing: <strong id="access-viewing">Global</strong></span>
      </div>
      <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; padding: 0 0.5rem;">
        Population lacking sustainable cooling access (millions). Click a country for details.
      </div>
      <div id="access-map-container" class="map-surface"></div>
      <div class="legend legend-row">
        <span class="legend-label">Population at Risk:</span>
        <div id="access-legend" class="legend-items"></div>
      </div>
      <div class="progress-bar access-progress">
        <span class="progress-segment access-low" id="access-progress-low"></span>
        <span class="progress-segment access-medium" id="access-progress-medium"></span>
        <span class="progress-segment access-high" id="access-progress-high"></span>
        <span class="progress-segment access-critical" id="access-progress-critical"></span>
      </div>

      <!-- Tick-box filters -->
      <div class="access-checkboxes" id="access-filters-panel">
        <div class="checkbox-group">
          <span class="checkbox-label"><i class="fa-solid fa-earth-americas"></i> Region</span>
          <div class="checkbox-items" id="access-region-checks">
            <label class="tick-box"><input type="checkbox" value="Africa" checked /><span class="tick-mark"></span>Africa</label>
            <label class="tick-box"><input type="checkbox" value="Asia and the Middle East" checked /><span class="tick-mark"></span>Asia & Middle East</label>
            <label class="tick-box"><input type="checkbox" value="Latin America and the Caribbean" checked /><span class="tick-mark"></span>Latin America</label>
            <label class="tick-box"><input type="checkbox" value="Oceania" checked /><span class="tick-mark"></span>Oceania</label>
          </div>
        </div>
        <div class="checkbox-group">
          <span class="checkbox-label"><i class="fa-solid fa-users"></i> Income Group</span>
          <div class="checkbox-items" id="access-pop-checks">
            <label class="tick-box"><input type="checkbox" value="Rural Poor" checked /><span class="tick-mark"></span>Rural Poor</label>
            <label class="tick-box"><input type="checkbox" value="Urban Poor" checked /><span class="tick-mark"></span>Urban Poor</label>
            <label class="tick-box"><input type="checkbox" value="Lower-Middle Income" checked /><span class="tick-mark"></span>Lower-Mid</label>
            <label class="tick-box"><input type="checkbox" value="Middle-Income" checked /><span class="tick-mark"></span>Middle</label>
          </div>
        </div>
        <div class="checkbox-group">
          <span class="checkbox-label"><i class="fa-solid fa-triangle-exclamation"></i> Risk Level</span>
          <div class="checkbox-items" id="access-impact-checks">
            <label class="tick-box"><input type="checkbox" value="High" checked /><span class="tick-mark risk-high"></span>High</label>
            <label class="tick-box"><input type="checkbox" value="Medium" checked /><span class="tick-mark risk-medium"></span>Medium</label>
            <label class="tick-box"><input type="checkbox" value="Low" checked /><span class="tick-mark risk-low"></span>Low</label>
          </div>
        </div>
      </div>

      <!-- Global Timeline Chart (2013-2050) -->
      <div class="card-panel" style="margin-top: 0.75rem;">
        <div class="chart-card-header" style="padding: 0.75rem 1rem;">
          <h3 style="font-size: 0.88rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 0.4rem; margin: 0;">
            <i class="fa-solid fa-chart-area" style="color: #d97706;"></i>
            Population at Risk: 2013&ndash;2050
          </h3>
          <p style="font-size: 0.72rem; color: #94a3b8; margin: 0.2rem 0 0;">
            Historical (SEforALL) &middot; Projected (HEAT methodology) &middot; Stacked by income group
          </p>
        </div>
        <div class="chart-card-body">
          <div id="chart-access-timeline" class="chart-surface" style="width: 100%; height: 400px; min-height: 400px;"></div>
        </div>
      </div>
    </div>

    <!-- Country Detail -->
    <div class="country-card-inline" id="access-country-detail">
      <div class="country-detail">
        <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #f59e0b; margin-bottom: 0.75rem; display: block;"></i>
          <h4 style="color: #92400e; margin-bottom: 0.5rem;">Select a Country</h4>
          <p style="font-size: 0.85rem;">Click on any country in the map above to view cooling access gap details and population breakdown.</p>
        </div>
      </div>
    </div>



    <!-- Source Attribution -->
    <div class="access-source" style="text-align: center; padding: 0.75rem; font-size: 0.7rem; color: #94a3b8;">
      Sources:
      <a href="https://www.seforall.org/data-stories/chilling-prospects-2025" target="_blank" rel="noopener noreferrer" style="color: #64748b;">SEforALL Chilling Prospects</a>
      &middot;
      <a href="https://coolcoalition.org/" target="_blank" rel="noopener noreferrer" style="color: #64748b;">UNEP Cool Coalition</a>
      &middot;
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer" style="color: #64748b;">HEAT GmbH</a>
      &middot;
      <a href="/methodology" style="color: #3D6B6B; font-weight: 600;">Methodology</a>
    </div>
  </div>
</section>

<style>
  /* ===========================
     ACCESS STORY CARD
     Warm/amber accent (access & vulnerability identity).
     =========================== */
  .access-story-card {
    border-left: 4px solid #d97706;
    padding: 1.75rem;
    position: relative;
    overflow: hidden;
  }

  .access-story-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(217, 119, 6, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .access-story-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .access-story-text { flex: 1; min-width: 0; }

  .access-headline {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 0 0 0.4rem;
    letter-spacing: -0.01em;
  }

  .access-subhead {
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
  }

  .access-story-hook {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    margin: 0 0 1.25rem;
    padding: 0.75rem 1rem;
    background: #fffbf0;
    border-radius: 10px;
    border-left: 3px solid #d97706;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
  }

  .revealed .access-story-hook { opacity: 1; transform: translateY(0); }

  /* Animated counters */
  .access-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  .access-counter-wrapper {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .revealed .access-counter-wrapper { opacity: 1; transform: translateY(0); }

  .access-counters :global(.counter-card) {
    background: linear-gradient(135deg, #fffbf0 0%, #fef3e0 100%);
    border: 1px solid rgba(217, 119, 6, 0.15);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: 100px;
    padding: 1rem 0.75rem;
  }

  .access-counters :global(.counter-card:hover) {
    background: linear-gradient(135deg, #fef3e0 0%, #fde68a40 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(217, 119, 6, 0.12);
  }

  .access-counters :global(.counter-display) { font-size: 1.8rem; color: #92400e; }
  .access-counters :global(.counter-label) { font-size: 0.72rem; color: #b45309; }
  .access-counters :global(.counter-tooltip) { background: rgba(15, 23, 42, 0.95); }

  /* Narrative */
  .access-narrative {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
  }

  .revealed .access-narrative { opacity: 1; transform: translateY(0); }

  .access-narrative-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #92400e;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .access-narrative-title i { color: #d97706; font-size: 0.85rem; }

  .access-narrative p {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.7;
    margin: 0;
  }

  /* Chart highlights */
  .access-chart-highlights {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s;
  }

  .revealed .access-chart-highlights { opacity: 1; transform: translateY(0); }

  .access-highlights-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #92400e;
    margin: 0 0 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .access-highlights-title i { color: #d97706; font-size: 0.85rem; }

  .access-highlights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .access-highlight-card {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem;
    background: #fafbfc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .access-highlight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .access-highlight-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.1rem; }

  .access-highlight-text { display: flex; flex-direction: column; gap: 0.15rem; }
  .access-highlight-text strong { font-size: 0.78rem; font-weight: 700; color: #0f172a; }
  .access-highlight-text span { font-size: 0.72rem; color: #64748b; line-height: 1.4; }

  /* Cooling Pledge badge */
  .access-pledge-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #f0fdf4, #f0f7f4);
    border: 1px solid #86efac;
    border-radius: 12px;
    margin: 0 0 0.75rem;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s;
  }

  .revealed .access-pledge-badge { opacity: 1; transform: translateY(0); }

  .pledge-icon { font-size: 1.2rem; color: #16a34a; flex-shrink: 0; }
  .pledge-content { flex: 1; min-width: 0; }
  .pledge-content strong { display: block; font-size: 0.78rem; color: #15803d; margin-bottom: 0.15rem; }
  .pledge-content span { font-size: 0.72rem; color: #4ade80; }

  .pledge-link {
    font-size: 0.72rem;
    font-weight: 600;
    color: #15803d;
    text-decoration: none;
    white-space: nowrap;
    border-bottom: 1px dashed #86efac;
    transition: color 0.2s;
  }

  .pledge-link:hover { color: #166534; }

  /* Cool Coalition reference */
  .access-cool-coalition {
    display: flex;
    align-items: center;
    padding: 0.6rem 0.75rem;
    background: #f8fafb;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    margin: 0 0 1rem;
    font-size: 0.75rem;
    color: #475569;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.85s, transform 0.6s ease 0.85s;
  }

  .revealed .access-cool-coalition { opacity: 1; transform: translateY(0); }

  .access-cool-coalition strong { color: #3D6B6B; }

  .access-cool-coalition a {
    color: #3D6B6B;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px dashed #3D6B6B;
  }

  .access-cool-coalition a:hover { color: #2D5252; }

  /* Partner bar */
  .access-partner-bar {
    padding: 0.75rem 0;
    margin: 0 0 0.75rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
  }

  .revealed .access-partner-bar { opacity: 1; transform: translateY(0); }

  .access-partner-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.6rem; }
  .access-partner-header > i { color: #92400e; font-size: 0.8rem; }
  .access-partner-title { font-size: 0.78rem; font-weight: 700; color: #333; }

  .access-partner-logos { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }

  .access-partner-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
    transition: opacity 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
  }

  .access-partner-logo:hover { opacity: 1; transform: translateY(-2px); }
  .access-partner-logo img { max-width: 80px; max-height: 32px; object-fit: contain; }

  /* Source footer */
  .access-source-footer {
    text-align: center;
    font-size: 0.68rem;
    color: #94a3b8;
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transition: opacity 0.6s ease 1.1s;
  }

  .revealed .access-source-footer { opacity: 1; }

  .access-source-footer a {
    color: #64748b;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .access-source-footer a:hover { color: #92400e; border-bottom-color: #92400e; }
  .access-source-footer a:last-child { color: #92400e; font-weight: 600; }

  /* KPI panel */
  .kpi-panel { padding: 1rem 1.25rem; }

  /* Tick-box filters */
  .access-checkboxes {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    padding: 0.75rem 0.5rem 0.5rem;
    border-top: 1px solid #f1f5f9;
    margin-top: 0.5rem;
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .checkbox-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    white-space: nowrap;
  }

  .checkbox-label i { font-size: 0.65rem; opacity: 0.6; }

  .checkbox-items {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .tick-box {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.72rem;
    color: #475569;
    cursor: pointer;
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
    border: 1px solid #e2e8f0;
    background: #fafbfc;
    transition: all 0.15s ease;
    user-select: none;
    white-space: nowrap;
  }

  .tick-box:hover { border-color: #d97706; background: #fffbf0; }

  .tick-box:has(input:checked) {
    background: #fffbf0;
    border-color: #d97706;
    color: #92400e;
    font-weight: 600;
  }

  .tick-box input { display: none; }

  .tick-mark {
    width: 12px;
    height: 12px;
    border: 1.5px solid #cbd5e1;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .tick-box:has(input:checked) .tick-mark {
    background: #d97706;
    border-color: #d97706;
  }

  .tick-box:has(input:checked) .tick-mark::after {
    content: '\2713';
    color: white;
    font-size: 0.55rem;
    font-weight: 900;
    line-height: 1;
  }

  .tick-mark.risk-high { border-color: #fca5a5; }
  .tick-box:has(input:checked) .tick-mark.risk-high { background: #ef4444; border-color: #ef4444; }
  .tick-mark.risk-medium { border-color: #fcd34d; }
  .tick-box:has(input:checked) .tick-mark.risk-medium { background: #f59e0b; border-color: #f59e0b; }
  .tick-mark.risk-low { border-color: #86efac; }
  .tick-box:has(input:checked) .tick-mark.risk-low { background: #22c55e; border-color: #22c55e; }

  :global(.risk-dot) {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.2rem;
    vertical-align: middle;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .access-counters { grid-template-columns: repeat(2, 1fr); }
    .access-highlights-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .access-story-card { padding: 1.25rem; }
    .access-headline { font-size: 1.1rem; }
    .access-story-header { flex-direction: column; gap: 0.5rem; }
    .access-counters { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    .access-counters :global(.counter-display) { font-size: 1.4rem; }
    .access-partner-logos { gap: 1rem; }
    .access-partner-logo img { max-width: 60px; max-height: 26px; }
    .access-pledge-badge { flex-direction: column; text-align: center; gap: 0.5rem; }
  }

  @media (max-width: 600px) {
    .access-counters { grid-template-columns: 1fr 1fr; }
    .access-counters :global(.counter-card) { min-height: 85px; padding: 0.75rem 0.5rem; }
    .access-counters :global(.counter-display) { font-size: 1.2rem; }
    .access-counters :global(.counter-label) { font-size: 0.65rem; }
  }
</style>

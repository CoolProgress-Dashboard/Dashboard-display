<script lang="ts">
  import { onMount } from 'svelte';
  import { VIEW_META } from '$lib/components/shared/config';
  import AnimatedCounter from '$lib/components/hero/AnimatedCounter.svelte';
  import { pillarContent } from '$lib/data/pillar-content';
  import { partners, globalCoolingPledge } from '$lib/data/partner-data';

  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;

  const meta = VIEW_META.policy;
  const policyContent = pillarContent.policy;

  // Animated stat cards
  const policyStats = [
    {
      value: '157',
      label: 'Kigali Amendment parties',
      context: '157 countries have ratified the Kigali Amendment to the Montreal Protocol, creating a legally binding framework to phase down HFCs by over 80%.'
    },
    {
      value: '71',
      label: 'Global Cooling Pledge nations',
      context: '71 countries signed the Global Cooling Pledge at COP28 in Dubai, December 2023. 49 have MEPS, 37 include cooling in their NDCs.'
    },
    {
      value: '<30%',
      label: 'NDCs mention cooling',
      context: 'Fewer than 30% of all NDCs explicitly mention cooling, refrigerants, or the Kigali Amendment. The policy gap between awareness and integration remains significant.'
    },
    {
      value: '~20',
      label: 'NCAPs completed or in development',
      context: 'Roughly 20 countries have completed or are developing National Cooling Action Plans. These dedicated roadmaps link efficiency, refrigerant transition, and access goals.'
    }
  ];

  // Chart highlights
  const chartHighlights = [
    {
      icon: 'fa-file-contract',
      title: 'Kigali & GCP Status',
      description: 'Track ratification and pledge commitments by country',
      color: '#22c55e'
    },
    {
      icon: 'fa-clipboard-list',
      title: 'NDC Cooling Mentions',
      description: 'Which countries integrate cooling into climate targets',
      color: '#3b82f6'
    },
    {
      icon: 'fa-file-shield',
      title: 'NCAPs & Building Codes',
      description: 'National action plans and sector-specific regulations',
      color: '#8b5cf6'
    }
  ];

  // Policy pillar partners: CCC → UNFCCC → CLASP NDC → Climate Policy Radar → HEAT (last)
  const policyPartnerIds = ['ccc', 'cool-coalition', 'clasp', 'climate-policy-radar', 'heat'];
  const policyPartners = policyPartnerIds
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

<section id="view-policy" class="view-section" class:active>
  <div class="pillar-stack">
    <!-- Story Card -->
    <div class="card-panel policy-story-card" class:revealed>
      <!-- Header -->
      <div class="policy-story-header">
        <div class="policy-story-text">
          <h1 class="policy-headline">{meta.headline}</h1>
          <p class="policy-subhead">{meta.subhead}</p>
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

      <!-- Story hook -->
      <p class="policy-story-hook">{policyContent.storyHook}</p>

      <!-- Animated stat cards -->
      <div class="policy-counters">
        {#each policyStats as stat, i}
          <div class="policy-counter-wrapper" style="transition-delay: {200 + i * 100}ms">
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
      <div class="policy-narrative">
        <h3 class="policy-narrative-title">
          <i class="fa-solid fa-scale-balanced"></i>
          The Policy Puzzle
        </h3>
        <p>{policyContent.keyNarrative}</p>
      </div>

      <!-- Chart highlights -->
      <div class="policy-chart-highlights">
        <h3 class="policy-highlights-title">
          <i class="fa-solid fa-chart-simple"></i>
          What the Data Shows
        </h3>
        <div class="policy-highlights-grid">
          {#each chartHighlights as highlight}
            <div class="policy-highlight-card">
              <div class="policy-highlight-icon" style="color: {highlight.color}">
                <i class="fa-solid {highlight.icon}"></i>
              </div>
              <div class="policy-highlight-text">
                <strong>{highlight.title}</strong>
                <span>{highlight.description}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Cooling Pledge Badge -->
      <div class="policy-pledge-badge">
        <div class="pledge-icon"><i class="fa-solid fa-handshake-angle"></i></div>
        <div class="pledge-content">
          <strong>Global Cooling Pledge Alignment</strong>
          <span>
            {globalCoolingPledge.signatoryCountries} nations &middot;
            {globalCoolingPledge.countriesIncludingCoolingInNDCs} include cooling in NDCs &middot;
            {globalCoolingPledge.countriesWithMEPS} have MEPS &middot;
            {globalCoolingPledge.countriesWithBuildingCodes} have building codes
          </span>
        </div>
        <a href={globalCoolingPledge.progressReportUrl} target="_blank" rel="noopener noreferrer" class="pledge-link">Progress Report</a>
      </div>

      <!-- Partner logos bar -->
      <div class="policy-partner-bar">
        <div class="policy-partner-header">
          <i class="fa-solid fa-handshake"></i>
          <span class="policy-partner-title">Data Partners</span>
        </div>
        <div class="policy-partner-logos">
          {#each policyPartners as partner (partner.id)}
            <a
              href={partner.coolingUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="policy-partner-logo"
              title={partner.fullName}
            >
              <img src={partner.logoPath} alt={partner.name} />
            </a>
          {/each}
        </div>
      </div>

      <!-- Source attribution -->
      <div class="policy-source-footer">
        Sources:
        <a href="https://coolcoalition.org/global-cooling-pledge/" target="_blank" rel="noopener noreferrer">Cool Coalition</a>
        &middot;
        <a href="https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016" target="_blank" rel="noopener noreferrer">UNEP Ozone Secretariat</a>
        &middot;
        <a href="https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/" target="_blank" rel="noopener noreferrer">CLASP NDC Toolkit</a>
        &middot;
        <a href="https://www.climatepolicyradar.org/" target="_blank" rel="noopener noreferrer">Climate Policy Radar</a>
        &middot;
        <a href="/methodology">Methodology</a>
      </div>
    </div>


    <!-- Map Card with Tabs -->
    <div class="card-panel map-card">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-scale-balanced"></i>
          Policy Framework Status by Country
        </div>
        <span class="viewing-pill">Viewing: <strong id="policy-viewing">Global</strong></span>
      </div>
      <!-- REORDERED TABS: Kigali → GCP → NDC → NCAP -->
      <div class="policy-tabs">
        <button class="tab-btn policy-map-tab" data-map="kigali" type="button">Kigali Amendment</button>
        <button class="tab-btn policy-map-tab active" data-map="gcp" type="button">Global Cooling Pledge</button>
        <button class="tab-btn policy-map-tab" data-map="ndc" type="button">NDC Cooling Mentions</button>
        <button class="tab-btn policy-map-tab" data-map="NCAP" type="button">NCAP</button>
      </div>
      <div class="filters-help" style="font-size: 0.8rem; color: #3D6B6B; margin: 0.75rem 0; padding: 0.5rem 0.75rem; background: #F5FAFA; border-radius: 8px; border-left: 3px solid #22c55e;">
        <i class="fa-solid fa-sliders" style="margin-right: 0.5rem;"></i>
        <strong>Switch tabs</strong> to explore different policy frameworks: Kigali ratification, GCP signatories, NDC cooling mentions, or National Cooling Action Plans.
      </div>
      <!-- NDC Filters -->
      <div class="policy-filters" id="policy-ndc-filters">
        <div class="filter-row" style="gap: 1rem;">
          <div class="filter-group">
            <label class="filter-label" for="policy-ndc-type">NDC Version</label>
            <select id="policy-ndc-type" class="filter-select">
              <!-- Options populated dynamically -->
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label" for="policy-ndc-category">Category</label>
            <select id="policy-ndc-category" class="filter-select">
              <!-- Options populated dynamically -->
            </select>
          </div>
        </div>
      </div>
      <div id="ndc-map-container" class="map-surface"></div>
      <div class="legend legend-row">
        <span class="legend-label">Status:</span>
        <div id="ndc-legend" class="legend-items"></div>
      </div>
      <div class="progress-bar ndc-progress">
        <span class="progress-segment ndc-mentioned" id="ndc-progress-mentioned"></span>
        <span class="progress-segment ndc-not" id="ndc-progress-not"></span>
        <span class="progress-segment ndc-no-ndc" id="ndc-progress-no-ndc"></span>
        <span class="progress-segment ndc-no-data" id="ndc-progress-no-data"></span>
      </div>
    </div>

    <!-- Country Detail -->
    <div class="country-card-inline" id="policy-country-detail">
      <div class="country-detail">
        <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #22c55e; margin-bottom: 0.75rem; display: block;"></i>
          <h4 style="color: #166534; margin-bottom: 0.5rem;">Select a Country</h4>
          <p style="font-size: 0.85rem;">Click on any country in the map above to view policy framework details including Kigali, GCP, NDC, and NCAP status.</p>
        </div>
      </div>
    </div>

    <!-- Filter Status Bar -->
    <div class="filter-status-bar policy-theme" id="policy-filter-bar">
      <div class="status-title">
        <i class="fa-solid fa-file-signature"></i>
        <span id="policy-status-title">Policy Framework Analysis</span>
      </div>
      <div class="status-filters">
        <span class="filter-tag" id="policy-filter-tab"><i class="fa-solid fa-file-contract"></i> Global Cooling Pledge</span>
        <span class="filter-tag" id="policy-filter-region"><i class="fa-solid fa-earth-americas"></i> All Regions</span>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section" style="background: #fafafa; padding: 1.25rem; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
      <div id="policy-charts-container"></div>
    </div>

    <!-- Source Attribution -->
    <div style="text-align: center; padding: 0.75rem; font-size: 0.7rem; color: #94a3b8;">
      Sources:
      <a href="https://coolcoalition.org/global-cooling-pledge/" target="_blank" rel="noopener noreferrer" style="color: #64748b;">Cool Coalition</a>
      &middot;
      <a href="https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016" target="_blank" rel="noopener noreferrer" style="color: #64748b;">UNEP Ozone Secretariat</a>
      &middot;
      <a href="https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/" target="_blank" rel="noopener noreferrer" style="color: #64748b;">CLASP NDC Toolkit</a>
      &middot;
      <a href="https://www.climatepolicyradar.org/" target="_blank" rel="noopener noreferrer" style="color: #64748b;">Climate Policy Radar</a>
      &middot;
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer" style="color: #64748b;">HEAT GmbH</a>
      &middot;
      <a href="/methodology" style="color: #3D6B6B; font-weight: 600;">Methodology</a>
    </div>
  </div>
</section>

<style>
  /* ===========================
     POLICY STORY CARD
     Green accent (policy/governance identity).
     =========================== */
  .policy-story-card {
    border-left: 4px solid #16a34a;
    padding: 1.75rem;
    position: relative;
    overflow: visible;
  }

  .policy-story-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(22, 163, 74, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .policy-story-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .policy-story-text { flex: 1; min-width: 0; }

  .policy-headline {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 0 0 0.4rem;
    letter-spacing: -0.01em;
  }

  .policy-subhead {
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
  }

  .policy-story-hook {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    margin: 0 0 1.25rem;
    padding: 0.75rem 1rem;
    background: #f0fdf4;
    border-radius: 10px;
    border-left: 3px solid #16a34a;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
  }

  .revealed .policy-story-hook { opacity: 1; transform: translateY(0); }

  /* Counters */
  .policy-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  .policy-counter-wrapper {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .revealed .policy-counter-wrapper { opacity: 1; transform: translateY(0); }

  .policy-counters :global(.counter-card) {
    background: linear-gradient(135deg, #f0fdf4 0%, #f0fdf4 100%);
    border: 1px solid rgba(22, 163, 74, 0.15);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: 100px;
    padding: 1rem 0.75rem;
  }

  .policy-counters :global(.counter-card:hover) {
    background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(22, 163, 74, 0.12);
  }

  .policy-counters :global(.counter-display) { font-size: 1.8rem; color: #166534; }
  .policy-counters :global(.counter-label) { font-size: 0.72rem; color: #15803d; }
  .policy-counters :global(.counter-tooltip) { background: #ffffff; color: #1e293b; border: 1px solid #e2e8f0; z-index: 99999; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25); }

  /* Narrative */
  .policy-narrative {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
  }

  .revealed .policy-narrative { opacity: 1; transform: translateY(0); }

  .policy-narrative-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #166534;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .policy-narrative-title i { color: #22c55e; font-size: 0.85rem; }

  .policy-narrative p {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.7;
    margin: 0;
  }

  /* Chart highlights */
  .policy-chart-highlights {
    margin: 0 0 1.25rem;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s;
  }

  .revealed .policy-chart-highlights { opacity: 1; transform: translateY(0); }

  .policy-highlights-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #166534;
    margin: 0 0 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .policy-highlights-title i { color: #22c55e; font-size: 0.85rem; }

  .policy-highlights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .policy-highlight-card {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem;
    background: #fafbfc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .policy-highlight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .policy-highlight-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.1rem; }
  .policy-highlight-text { display: flex; flex-direction: column; gap: 0.15rem; }
  .policy-highlight-text strong { font-size: 0.78rem; font-weight: 700; color: #0f172a; }
  .policy-highlight-text span { font-size: 0.72rem; color: #64748b; line-height: 1.4; }

  /* Pledge badge */
  .policy-pledge-badge {
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

  .revealed .policy-pledge-badge { opacity: 1; transform: translateY(0); }

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

  /* Partner bar */
  .policy-partner-bar {
    padding: 0.75rem 0;
    margin: 0 0 0.75rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
  }

  .revealed .policy-partner-bar { opacity: 1; transform: translateY(0); }

  .policy-partner-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.6rem; }
  .policy-partner-header > i { color: #166534; font-size: 0.8rem; }
  .policy-partner-title { font-size: 0.78rem; font-weight: 700; color: #333; }

  .policy-partner-logos { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }

  .policy-partner-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
    transition: opacity 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
  }

  .policy-partner-logo:hover { opacity: 1; transform: translateY(-2px); }
  .policy-partner-logo img { max-width: 80px; max-height: 32px; object-fit: contain; }

  /* Source footer */
  .policy-source-footer {
    text-align: center;
    font-size: 0.68rem;
    color: #94a3b8;
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
    opacity: 0;
    transition: opacity 0.6s ease 1.1s;
  }

  .revealed .policy-source-footer { opacity: 1; }

  .policy-source-footer a {
    color: #64748b;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .policy-source-footer a:hover { color: #166534; border-bottom-color: #166534; }
  .policy-source-footer a:last-child { color: #166534; font-weight: 600; }

  /* KPI panel */
  .kpi-panel { padding: 1rem 1.25rem; }

  /* Responsive */
  @media (max-width: 1024px) {
    .policy-counters { grid-template-columns: repeat(2, 1fr); }
    .policy-highlights-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .policy-story-card { padding: 1.25rem; }
    .policy-headline { font-size: 1.1rem; }
    .policy-story-header { flex-direction: column; gap: 0.5rem; }
    .policy-counters { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    .policy-counters :global(.counter-display) { font-size: 1.4rem; }
    .policy-partner-logos { gap: 1rem; }
    .policy-partner-logo img { max-width: 60px; max-height: 26px; }
    .policy-pledge-badge { flex-direction: column; text-align: center; gap: 0.5rem; }
  }

  @media (max-width: 600px) {
    .policy-counters { grid-template-columns: 1fr 1fr; }
    .policy-counters :global(.counter-card) { min-height: 85px; padding: 0.75rem 0.5rem; }
    .policy-counters :global(.counter-display) { font-size: 1.2rem; }
    .policy-counters :global(.counter-label) { font-size: 0.65rem; }
  }
</style>

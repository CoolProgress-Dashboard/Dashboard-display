<script lang="ts">
  import { VIEW_META } from '$lib/components/shared/config';
  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;
  const meta = VIEW_META.access;
</script>

<section id="view-access" class="view-section" class:active>
  <div class="pillar-stack">
    <!-- Unified Story + KPI Card -->
    <div class="card-panel pillar-story-card">
      <div class="pillar-story-header">
        <div class="pillar-story-text">
          <h1 class="pillar-headline">{meta.headline}</h1>
          <p class="pillar-subhead">{meta.subhead}</p>
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

      <div class="kpi-box-header">
        <h3 id="access-kpi-title"><i class="fa-solid fa-globe"></i> Global View</h3>
        <div class="kpi-box-meta">
          <span class="meta-pill" id="access-meta-source"><i class="fa-solid fa-database"></i> Historical</span>
          <span class="meta-pill" id="access-meta-year"><i class="fa-solid fa-calendar"></i> 2024</span>
          <span class="meta-pill" id="access-meta-region"><i class="fa-solid fa-earth-americas"></i> All Regions</span>
        </div>
      </div>
      <div class="kpi-grid policy-kpis" style="margin-top: 0.75rem;">
        <div class="kpi-card red">
          <div class="kpi-value" id="access-kpi-total">-</div>
          <div class="kpi-label">People at Risk</div>
          <div class="kpi-sublabel">Without adequate cooling access</div>
        </div>
        <div class="kpi-card amber">
          <div class="kpi-value" id="access-kpi-high-impact">-</div>
          <div class="kpi-label">High-Risk Countries</div>
          <div class="kpi-sublabel">Facing severe cooling gaps</div>
        </div>
        <div class="kpi-card blue">
          <div class="kpi-value" id="access-kpi-countries">-</div>
          <div class="kpi-label">Countries Analyzed</div>
          <div class="kpi-sublabel">In current selection</div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-value" id="access-kpi-regions">-</div>
          <div class="kpi-label">Regions Covered</div>
          <div class="kpi-sublabel">Geographic scope</div>
        </div>
      </div>

      {#if meta.methodology}
        <div class="story-methodology">
          <i class="fa-solid fa-circle-info"></i>
          <span>{meta.methodology}</span>
          {#if meta.sources.length > 0}
            <span class="story-sources">
              &mdash;
              {#each meta.sources as src, i}
                <a href={src.url} target="_blank" rel="noopener noreferrer">{src.name}</a>{#if i < meta.sources.length - 1},{/if}
              {/each}
            </span>
          {/if}
        </div>
      {/if}
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

      <!-- Filters Inside Map Card -->
      <div class="map-filters" id="access-filters-panel">
        <div class="filters-help" style="font-size: 0.8rem; color: #92400e; margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: #fef3c7; border-radius: 8px; border-left: 3px solid #f59e0b;">
          <i class="fa-solid fa-sliders" style="margin-right: 0.5rem;"></i>
          <strong>Customize your view:</strong> Choose a data source and year to explore cooling access gaps. Use the advanced filters below to focus on specific populations.
        </div>

        <!-- Primary Filters (always visible) -->
        <div class="filter-row" style="gap: 1rem; flex-wrap: wrap; align-items: flex-start; margin-bottom: 0.75rem;">
          <!-- Data Source Toggle -->
          <div class="filter-group">
            <label class="filter-label"><i class="fa-solid fa-database" style="margin-right: 0.3rem; opacity: 0.6;"></i>Data Source</label>
            <div class="toggle-group" id="access-source-toggles">
              <button class="toggle-btn active" data-source="historical" type="button" title="SEforALL Chilling Prospects data (2013-2024)">
                <i class="fa-solid fa-clock-rotate-left" style="margin-right: 0.25rem; font-size: 0.65rem;"></i>Historical
              </button>
              <button class="toggle-btn" data-source="forecast" type="button" title="Population forecast at risk (2025-2030)">
                <i class="fa-solid fa-chart-line" style="margin-right: 0.25rem; font-size: 0.65rem;"></i>Forecast
              </button>
            </div>
          </div>

          <!-- Year Slider -->
          <div class="filter-group" style="flex: 2; min-width: 180px;">
            <label class="filter-label"><i class="fa-solid fa-calendar" style="margin-right: 0.3rem; opacity: 0.6;"></i>Year</label>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <input type="range" id="access-year-slider" min="2013" max="2024" value="2024" style="flex: 1;" />
              <span id="access-year-display" style="font-weight: 700; color: #3D6B6B; font-size: 0.85rem;">2024</span>
            </div>
          </div>

          <!-- Region Dropdown -->
          <div class="filter-group">
            <label class="filter-label"><i class="fa-solid fa-earth-americas" style="margin-right: 0.3rem; opacity: 0.6;"></i>Region</label>
            <select id="access-region-filter" class="filter-select">
              <option value="">All Regions</option>
            </select>
          </div>
        </div>

        <!-- Advanced Filters (collapsible) -->
        <details class="access-advanced-filters">
          <summary class="advanced-toggle">
            <i class="fa-solid fa-filter" style="margin-right: 0.3rem;"></i>
            Advanced Filters
            <span style="font-weight: 400; color: #94a3b8; margin-left: 0.25rem;">(risk level, income group)</span>
          </summary>
          <div class="filter-row" style="gap: 1rem; flex-wrap: wrap; align-items: flex-start; padding-top: 0.75rem;">
            <!-- Risk Level Toggle -->
            <div class="filter-group">
              <label class="filter-label"><i class="fa-solid fa-triangle-exclamation" style="margin-right: 0.3rem; opacity: 0.6;"></i>Risk Level</label>
              <div class="toggle-group" id="access-impact-toggles">
                <button class="toggle-btn active" data-impact="High" type="button" title="1+ billion people lacking crucial cooling access">
                  <span class="risk-dot" style="background: #ef4444;"></span>High
                </button>
                <button class="toggle-btn active" data-impact="Medium" type="button" title="Limited access to sustainable cooling options">
                  <span class="risk-dot" style="background: #f59e0b;"></span>Medium
                </button>
                <button class="toggle-btn active" data-impact="Low" type="button" title="Better access but still below adequate">
                  <span class="risk-dot" style="background: #22c55e;"></span>Low
                </button>
              </div>
            </div>

            <!-- Income Group Toggle -->
            <div class="filter-group" style="flex: 2; min-width: 250px;">
              <label class="filter-label"><i class="fa-solid fa-users" style="margin-right: 0.3rem; opacity: 0.6;"></i>Income Group</label>
              <div class="toggle-group" id="access-pop-toggles">
                <button class="toggle-btn active" data-category="Rural Poor" type="button" title="309 million at high risk globally">
                  <i class="fa-solid fa-tree" style="font-size: 0.6rem; margin-right: 0.2rem;"></i>Rural
                </button>
                <button class="toggle-btn active" data-category="Urban Poor" type="button" title="695 million at high risk globally">
                  <i class="fa-solid fa-city" style="font-size: 0.6rem; margin-right: 0.2rem;"></i>Urban
                </button>
                <button class="toggle-btn active" data-category="Lower-Middle Income" type="button" title="Limited affordable cooling options">Lower-Mid</button>
                <button class="toggle-btn active" data-category="Middle-Income" type="button" title="Better access but gaps remain">Middle</button>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>

    <!-- Country Detail Section -->
    <div class="country-card-inline" id="access-country-detail">
      <div class="country-detail">
        <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #f59e0b; margin-bottom: 0.75rem; display: block;"></i>
          <h4 style="color: #92400e; margin-bottom: 0.5rem;">Select a Country</h4>
          <p style="font-size: 0.85rem;">Click on any country in the map above to view cooling access gap details and population breakdown.</p>
        </div>
      </div>
    </div>

    <!-- Filter Status Bar -->
    <div class="filter-status-bar access-theme" id="access-filter-bar">
      <div class="status-title">
        <i class="fa-solid fa-temperature-high"></i>
        <span id="access-status-title">Cooling Access Gap Analysis</span>
      </div>
      <div class="status-filters">
        <span class="filter-tag" id="access-filter-year"><i class="fa-solid fa-calendar"></i> 2023</span>
        <span class="filter-tag" id="access-filter-region"><i class="fa-solid fa-earth-americas"></i> All Regions</span>
        <span class="filter-tag" id="access-filter-risk"><i class="fa-solid fa-exclamation-triangle"></i> All Risk Levels</span>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section" style="background: #fafafa; padding: 1.25rem; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
      <div id="access-charts-container"></div>
    </div>

    <!-- Source Attribution -->
    <div class="access-source" style="text-align: center; padding: 0.75rem; font-size: 0.7rem; color: #94a3b8;">
      Sources:
      <a href="https://www.seforall.org/data-stories/chilling-prospects-2025" target="_blank" rel="noopener noreferrer" style="color: #64748b;">SEforALL Chilling Prospects</a>
      &middot;
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer" style="color: #64748b;">HEAT GmbH</a>
      &middot;
      <a href="/methodology" style="color: #3D6B6B; font-weight: 600;">Methodology</a>
    </div>
  </div>
</section>

<style>
  .access-advanced-filters {
    border-top: 1px solid #e2e8f0;
    padding-top: 0.5rem;
  }

  .advanced-toggle {
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: 600;
    color: #64748b;
    padding: 0.4rem 0;
    user-select: none;
    list-style: none;
    display: flex;
    align-items: center;
  }

  .advanced-toggle::-webkit-details-marker {
    display: none;
  }

  .advanced-toggle::before {
    content: '\f078';
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    font-size: 0.55rem;
    margin-right: 0.4rem;
    transition: transform 0.2s ease;
    color: #94a3b8;
  }

  .access-advanced-filters[open] > .advanced-toggle::before {
    transform: rotate(180deg);
  }

  .advanced-toggle:hover {
    color: #3D6B6B;
  }

  :global(.risk-dot) {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.2rem;
    vertical-align: middle;
  }
</style>

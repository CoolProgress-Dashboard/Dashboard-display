<script lang="ts">
  import { VIEW_META } from '$lib/components/shared/config';
  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;
  const meta = VIEW_META.kigali;
</script>

<section id="view-kigali" class="view-section" class:active>
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

      <div class="kpi-grid policy-kpis" style="margin-top: 0.75rem;">
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
        <span class="progress-segment high" id="kigali-progress-high" title="Kigali Party"></span>
        <span class="progress-segment medium" id="kigali-progress-medium" title="Article 5"></span>
        <span class="progress-segment low" id="kigali-progress-low" title="Montreal Only"></span>
        <span class="progress-segment critical" id="kigali-progress-critical" title="Non-Party"></span>
      </div>
      <div id="kigali-country-detail" class="country-card-inline">
        <h3>Selected Country</h3>
        <div class="country-detail">
          <h4>Select a country</h4>
          <p class="side-muted">Click on a country in the map to see Kigali details.</p>
        </div>
      </div>
    </div>

    <!-- Filter Status Bar -->
    <div class="filter-status-bar kigali-theme" id="kigali-filter-bar">
      <div class="status-title">
        <i class="fa-solid fa-snowflake"></i>
        <span id="kigali-status-title">Refrigerant Transition Analysis</span>
      </div>
      <div class="status-filters">
        <span class="filter-tag" id="kigali-filter-region"><i class="fa-solid fa-earth-americas"></i> All Regions</span>
        <span class="filter-tag" id="kigali-filter-groups"><i class="fa-solid fa-users"></i> All Groups</span>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section" style="background: #fafafa; padding: 1.25rem; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <div class="card-panel chart-card">
          <div class="chart-card-header">
            <h3><i class="fa-solid fa-chart-pie" style="color: #8BC34A; margin-right: 0.5rem;"></i>Kigali Status by Region</h3>
            <p class="chart-subtitle">Party vs Non-Party breakdown</p>
          </div>
          <div class="chart-card-body">
            <div id="chart-kigali-region" class="chart-surface" style="height: 280px;"></div>
          </div>
        </div>
        <div class="card-panel chart-card">
          <div class="chart-card-header">
            <h3><i class="fa-solid fa-users-rectangle" style="color: #8BC34A; margin-right: 0.5rem;"></i>Group Type Distribution</h3>
            <p class="chart-subtitle">Article 5 and Non-Article 5 countries</p>
          </div>
          <div class="chart-card-body">
            <div id="chart-kigali-groups" class="chart-surface" style="height: 280px;"></div>
          </div>
        </div>
      </div>

      <!-- Refrigerant GWP Chart -->
      <div class="card-panel chart-card" style="margin-bottom: 1.5rem;">
        <div class="chart-card-header">
          <h3><i class="fa-solid fa-temperature-arrow-up" style="color: #E85A4F; margin-right: 0.5rem;"></i>Refrigerant Global Warming Potential (GWP)</h3>
          <p class="chart-subtitle">100-year GWP values by refrigerant type (AR6)</p>
        </div>
        <div class="chart-card-body">
          <div id="chart-refrigerant-gwp" class="chart-surface" style="height: 350px;"></div>
          <div style="display: flex; gap: 1.5rem; margin-top: 0.75rem; flex-wrap: wrap; justify-content: center;">
            <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;">
              <span style="width: 12px; height: 12px; background: #ef4444; border-radius: 2px;"></span>
              HFC (High GWP)
            </span>
            <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;">
              <span style="width: 12px; height: 12px; background: #f59e0b; border-radius: 2px;"></span>
              HCFC (Medium GWP)
            </span>
            <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;">
              <span style="width: 12px; height: 12px; background: #8BC34A; border-radius: 2px;"></span>
              HFO (Low GWP)
            </span>
            <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;">
              <span style="width: 12px; height: 12px; background: #22c55e; border-radius: 2px;"></span>
              Natural (Low GWP)
            </span>
          </div>
        </div>
      </div>

      <div class="card-panel chart-card">
        <div class="chart-card-header">
          <h3><i class="fa-solid fa-chart-area" style="color: #3D6B6B; margin-right: 0.5rem;"></i>Market Share: Refrigerant Transition (2020-2050)</h3>
          <p class="chart-subtitle">AC - Global</p>
        </div>
        <div class="chart-card-body">
          <div class="chart-container" style="height: 320px;">
            <div id="chart-kigali-transition" class="chart-surface"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Source Attribution -->
    <div style="text-align: center; padding: 0.75rem; font-size: 0.7rem; color: #94a3b8;">
      Sources:
      <a href="https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016" target="_blank" rel="noopener noreferrer" style="color: #64748b;">UNEP Ozone Secretariat</a>
      &middot;
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer" style="color: #64748b;">HEAT GmbH</a>
      &middot;
      <a href="https://www.multilateralfund.org/OurWork/default.aspx" target="_blank" rel="noopener noreferrer" style="color: #64748b;">MLF</a>
      &middot;
      <a href="/methodology" style="color: #3D6B6B; font-weight: 600;">Methodology</a>
    </div>
  </div>
</section>

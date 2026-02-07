<script lang="ts">
  import { VIEW_META } from '$lib/components/shared/config';
  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;
  const meta = VIEW_META.emissions;
</script>

<section id="view-emissions" class="view-section" class:active>
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
        <h3 id="emissions-kpi-title"><i class="fa-solid fa-globe"></i> Global View</h3>
        <div class="kpi-box-meta">
          <span class="meta-pill" id="emissions-meta-source"><i class="fa-solid fa-database"></i> CLASP</span>
          <span class="meta-pill" id="emissions-meta-year"><i class="fa-solid fa-calendar"></i> 2030</span>
          <span class="meta-pill" id="emissions-meta-scenario"><i class="fa-solid fa-chart-line"></i> BAU</span>
        </div>
      </div>
      <div class="kpi-grid policy-kpis" style="margin-top: 0.75rem;">
        <div class="kpi-card red">
          <div class="kpi-value" id="emissions-kpi-total">-</div>
          <div class="kpi-label">Total CO2 Emissions</div>
          <div class="kpi-sublabel">Mt CO2 equivalent</div>
        </div>
        <div class="kpi-card blue">
          <div class="kpi-value" id="emissions-kpi-ac">-</div>
          <div class="kpi-label">Air Conditioning</div>
          <div class="kpi-sublabel">Mt CO2</div>
        </div>
        <div class="kpi-card amber">
          <div class="kpi-value" id="emissions-kpi-fridge">-</div>
          <div class="kpi-label">Refrigeration</div>
          <div class="kpi-sublabel">Mt CO2</div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-value" id="emissions-kpi-fans">-</div>
          <div class="kpi-label">Fans</div>
          <div class="kpi-sublabel">Mt CO2</div>
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
          CO2 Emissions by Country
        </div>
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
              <input type="range" id="emissions-year-slider" min="2020" max="2045" value="2030" style="flex: 1;" />
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

    <!-- Charts Container -->
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
  </div>
</section>

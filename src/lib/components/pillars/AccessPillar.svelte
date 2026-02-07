<script lang="ts">
  export let active: boolean = false;
</script>

<section id="view-access" class="view-section" class:active>
  <div class="pillar-stack">
    <!-- KPI Cards Box with Title -->
    <div class="card-panel kpi-box">
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
          <strong>Customize your view:</strong> Filter by data source, year, risk levels, income groups, and regions to explore cooling access gaps across different populations.
        </div>
        <div class="filter-row" style="gap: 1rem; flex-wrap: wrap; align-items: flex-start;">
          <!-- Data Source Toggle -->
          <div class="filter-group">
            <label class="filter-label">Source</label>
            <div class="toggle-group" id="access-source-toggles">
              <button class="toggle-btn active" data-source="historical" type="button" title="SEforALL data (2013-2024)">Historical</button>
              <button class="toggle-btn" data-source="forecast" type="button" title="Forecast data (2025-2030)">Forecast</button>
            </div>
          </div>

          <!-- Year Slider -->
          <div class="filter-group" style="flex: 2; min-width: 180px;">
            <label class="filter-label">Year</label>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <input type="range" id="access-year-slider" min="2013" max="2024" value="2024" style="flex: 1;" />
              <span id="access-year-display" style="font-weight: 700; color: #3D6B6B; font-size: 0.85rem;">2024</span>
            </div>
          </div>

          <!-- Risk Level Toggle -->
          <div class="filter-group">
            <label class="filter-label">Risk Level</label>
            <div class="toggle-group" id="access-impact-toggles">
              <button class="toggle-btn active" data-impact="High" type="button" title="1+ billion lacking crucial cooling">High</button>
              <button class="toggle-btn active" data-impact="Medium" type="button" title="Limited sustainable options">Medium</button>
              <button class="toggle-btn active" data-impact="Low" type="button" title="Better access to cooling">Low</button>
            </div>
          </div>

          <!-- Income Group Toggle -->
          <div class="filter-group" style="flex: 2; min-width: 250px;">
            <label class="filter-label">Income Group</label>
            <div class="toggle-group" id="access-pop-toggles">
              <button class="toggle-btn active" data-category="Rural Poor" type="button" title="309M at high risk globally">Rural</button>
              <button class="toggle-btn active" data-category="Urban Poor" type="button" title="695M at high risk globally">Urban</button>
              <button class="toggle-btn active" data-category="Lower-Middle Income" type="button" title="Limited affordable options">Lower-Mid</button>
              <button class="toggle-btn active" data-category="Middle-Income" type="button" title="Better access to solutions">Middle</button>
            </div>
          </div>

          <!-- Region Dropdown -->
          <div class="filter-group">
            <label class="filter-label">Region</label>
            <select id="access-region-filter" class="filter-select">
              <option value="">All Regions</option>
            </select>
          </div>
        </div>
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

    <!-- Info Panel -->
    <div class="card-panel info-panel-bottom" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 1rem 1.25rem;">
      <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
        <i class="fa-solid fa-circle-info" style="color: #d97706; font-size: 1.1rem; margin-top: 2px;"></i>
        <div>
          <div style="font-weight: 600; color: #92400e; margin-bottom: 0.25rem;">About This Data</div>
          <div style="font-size: 0.85rem; color: #78350f; line-height: 1.5;">
            This analysis tracks cooling access gaps across <strong>77 countries</strong> in the Global South.
            "At risk" populations lack adequate cooling for <strong>thermal comfort</strong>, <strong>food preservation</strong>, and <strong>medical storage</strong>.
            Risk levels are based on income, infrastructure access, and climate vulnerability.
            <em>Source: SEforALL Chilling Prospects Report</em>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

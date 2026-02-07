<script lang="ts">
  export let active: boolean = false;
</script>

<section id="view-meps" class="view-section" class:active>
  <div class="pillar-stack">
    <!-- KPI Cards Box with Title -->
    <div class="card-panel kpi-box">
      <div class="kpi-box-header">
        <h3 id="meps-kpi-title"><i class="fa-solid fa-globe"></i> Global View</h3>
        <div class="kpi-box-meta">
          <span class="meta-pill" id="meps-meta-region"><i class="fa-solid fa-earth-americas"></i> All Regions</span>
          <span class="meta-pill" id="meps-meta-equipment"><i class="fa-solid fa-cogs"></i> All Equipment</span>
        </div>
      </div>
      <div class="kpi-grid policy-kpis" style="margin-top: 0.75rem;">
        <div class="kpi-card blue">
          <div class="kpi-value" id="meps-kpi-countries">-</div>
          <div class="kpi-label">Countries</div>
          <div class="kpi-sublabel">With MEPS or Labels</div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-value" id="meps-kpi-policies">-</div>
          <div class="kpi-label">Total Policies</div>
          <div class="kpi-sublabel">MEPS &amp; Labels tracked</div>
        </div>
        <div class="kpi-card" style="border-left: 4px solid #4A7F7F;">
          <div class="kpi-value" id="meps-kpi-equipment" style="color:#4A7F7F">-</div>
          <div class="kpi-label">MEPS</div>
          <div class="kpi-sublabel">Performance standards</div>
        </div>
        <div class="kpi-card" style="border-left: 4px solid #f59e0b;">
          <div class="kpi-value" id="meps-kpi-regions" style="color:#f59e0b">-</div>
          <div class="kpi-label">Labels</div>
          <div class="kpi-sublabel">Energy labels</div>
        </div>
      </div>
    </div>

    <!-- Map Card with Filters Inside -->
    <div class="card-panel map-card">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-bolt"></i>
          MEPS &amp; Labels Coverage
        </div>
        <span class="viewing-pill">Viewing: <strong id="meps-viewing">Global</strong></span>
      </div>
      <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; padding: 0 0.5rem;">
        Policy adoption status for cooling appliances. Click a country for detailed breakdown.
      </div>
      <div id="meps-map-container" class="map-surface"></div>
      <div class="legend legend-row">
        <span class="legend-label">Policy Status:</span>
        <div id="meps-legend" class="legend-items"></div>
      </div>
      <div class="progress-bar" id="meps-progress">
        <span class="progress-segment" id="meps-progress-both" title="MEPS & Labels" style="background:#166534"></span>
        <span class="progress-segment" id="meps-progress-meps" title="MEPS Only" style="background:#4A7F7F"></span>
        <span class="progress-segment" id="meps-progress-labels" title="Labels Only" style="background:#f59e0b"></span>
        <span class="progress-segment" id="meps-progress-critical" title="No Policies" style="background:#ef4444"></span>
      </div>

      <!-- Filters Inside Map Card -->
      <div class="map-filters" id="meps-filters-panel">
        <div class="filters-help" style="font-size: 0.8rem; color: #4A7F7F; margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: #F5FAFA; border-radius: 8px; border-left: 3px solid #8BC34A;">
          <i class="fa-solid fa-sliders" style="margin-right: 0.5rem;"></i>
          <strong>Customize your view:</strong> Filter by region and equipment type to explore MEPS and labeling policies for specific appliances across different regions.
        </div>
        <div class="filter-row" style="gap: 1rem; flex-wrap: wrap; align-items: flex-start;">
          <!-- Region Filter -->
          <div class="filter-group" style="flex: 1; min-width: 180px;">
            <label class="filter-label">Region</label>
            <select id="meps-region-filter" class="filter-select">
              <option value="">All Regions</option>
            </select>
          </div>

          <!-- Equipment Type Toggles -->
          <div class="filter-group" style="flex: 2; min-width: 300px;">
            <label class="filter-label">Equipment Type</label>
            <div class="toggle-group" id="meps-equipment-toggles">
              <!-- Will be populated dynamically -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Country Detail Section -->
    <div class="country-card-inline" id="meps-country-detail">
      <div class="country-detail">
        <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #8BC34A; margin-bottom: 0.75rem; display: block;"></i>
          <h4 style="color: #3D6B6B; margin-bottom: 0.5rem;">Select a Country</h4>
          <p style="font-size: 0.85rem;">Click on any country in the map above to view MEPS and labeling policy details.</p>
        </div>
      </div>
    </div>

    <!-- Filter Status Bar -->
    <div class="filter-status-bar" id="meps-filter-bar">
      <div class="status-title">
        <i class="fa-solid fa-chart-simple"></i>
        <span id="meps-status-title">Product Efficiency Analysis</span>
      </div>
      <div class="status-filters">
        <span class="filter-tag" id="meps-filter-region"><i class="fa-solid fa-earth-americas"></i> All Regions</span>
        <span class="filter-tag" id="meps-filter-equipment"><i class="fa-solid fa-cogs"></i> All Equipment</span>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-section" style="background: #fafafa; padding: 1.25rem; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <div class="card-panel chart-card">
          <div class="chart-card-header">
            <h3 id="meps-chart1-title"><i class="fa-solid fa-chart-bar" style="color: #8BC34A; margin-right: 0.5rem;"></i>MEPS & Labels by Region</h3>
            <p class="chart-subtitle" id="meps-chart1-subtitle">Countries with MEPS vs Labels per region</p>
          </div>
          <div class="chart-card-body">
            <div id="chart-meps-by-region" class="chart-surface" style="height: 280px;"></div>
          </div>
        </div>
        <div class="card-panel chart-card">
          <div class="chart-card-header">
            <h3 id="meps-chart2-title"><i class="fa-solid fa-clock-rotate-left" style="color: #8BC34A; margin-right: 0.5rem;"></i>Policy Adoption Timeline</h3>
            <p class="chart-subtitle" id="meps-chart2-subtitle">Cumulative MEPS & Labels adoption over time</p>
          </div>
          <div class="chart-card-body">
            <div id="chart-meps-timeline" class="chart-surface" style="height: 280px;"></div>
          </div>
        </div>
      </div>

      <div class="card-panel chart-card">
        <div class="chart-card-header">
          <h3 id="meps-chart3-title"><i class="fa-solid fa-cogs" style="color: #8BC34A; margin-right: 0.5rem;"></i>Equipment Type Coverage</h3>
          <p class="chart-subtitle" id="meps-chart3-subtitle">Countries with MEPS vs Labels by appliance</p>
        </div>
        <div class="chart-card-body">
          <div id="chart-meps-equipment" class="chart-surface" style="height: 320px;"></div>
        </div>
      </div>
    </div>

    <!-- Info Panel -->
    <div class="card-panel info-panel-bottom" style="background: linear-gradient(135deg, #EBF4F4 0%, #D5E5E5 100%); border-left: 4px solid #3D6B6B; padding: 1rem 1.25rem;">
      <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
        <i class="fa-solid fa-circle-info" style="color: #3D6B6B; font-size: 1.1rem; margin-top: 2px;"></i>
        <div>
          <div style="font-weight: 600; color: #2D5252; margin-bottom: 0.25rem;">About This Data</div>
          <div style="font-size: 0.85rem; color: #3D6B6B; line-height: 1.5;">
            <strong>Minimum Energy Performance Standards (MEPS) &amp; Labels</strong> set efficiency requirements for cooling appliances.
            This data tracks MEPS and labeling policy adoption across countries for Air Conditioners, Domestic Refrigerators, and Fans.
            <em>Source: CLASP Global Policy &amp; Regulatory Compliance Platform (cprc-clasp.ngo)</em>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

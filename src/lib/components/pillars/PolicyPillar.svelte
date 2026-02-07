<script lang="ts">
  import { VIEW_META } from '$lib/components/shared/config';
  export let active: boolean = false;
  export let onPillarInfoClick: (() => void) | null = null;
  const meta = VIEW_META.policy;
</script>

<section id="view-policy" class="view-section" class:active>
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
        <h3 id="policy-kpi-title"><i class="fa-solid fa-globe"></i> Global View</h3>
        <div class="kpi-box-meta">
          <span class="meta-pill" id="policy-meta-tab"><i class="fa-solid fa-file-contract"></i> Global Cooling Pledge</span>
        </div>
      </div>
      <div class="kpi-grid policy-kpis" style="margin-top: 0.75rem;">
        <div class="kpi-card green">
          <div class="kpi-value" id="policy-kpi-gcp">-</div>
          <div class="kpi-label">GCP Signatories</div>
          <div class="kpi-sublabel">Global Cooling Pledge</div>
        </div>
        <div class="kpi-card blue">
          <div class="kpi-value" id="policy-kpi-ndc">-</div>
          <div class="kpi-label">NDC 3.0 Submitted</div>
          <div class="kpi-sublabel">Countries with new NDCs</div>
        </div>
        <div class="kpi-card amber">
          <div class="kpi-value" id="policy-kpi-cooling">-</div>
          <div class="kpi-label">Cooling Mentioned</div>
          <div class="kpi-sublabel">In NDCs (Energy Efficiency)</div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-value" id="policy-kpi-NCAP">-</div>
          <div class="kpi-label">NCAPs Developed</div>
          <div class="kpi-sublabel">National Cooling Action Plans</div>
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

    <!-- Map Card with Tabs Inside -->
    <div class="card-panel map-card">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-scale-balanced"></i>
          Policy Framework Status by Country
        </div>
        <span class="viewing-pill">Viewing: <strong id="policy-viewing">Global</strong></span>
      </div>
      <div class="policy-tabs">
        <button class="tab-btn policy-map-tab active" data-map="gcp" type="button">Global Cooling Pledge</button>
        <button class="tab-btn policy-map-tab" data-map="ndc" type="button">NDC Cooling Mentions</button>
        <button class="tab-btn policy-map-tab" data-map="NCAP" type="button">NCAP</button>
      </div>
      <div class="filters-help" style="font-size: 0.8rem; color: #3D6B6B; margin: 0.75rem 0; padding: 0.5rem 0.75rem; background: #F5FAFA; border-radius: 8px; border-left: 3px solid #22c55e;">
        <i class="fa-solid fa-sliders" style="margin-right: 0.5rem;"></i>
        <strong>Switch tabs</strong> to explore different policy frameworks: GCP signatories, NDC cooling mentions, or National Cooling Action Plans.
      </div>
      <!-- NDC Filters (shown when NDC tab is active) -->
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

    <!-- Country Detail Section -->
    <div class="country-card-inline" id="policy-country-detail">
      <div class="country-detail">
        <div class="country-placeholder" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #22c55e; margin-bottom: 0.75rem; display: block;"></i>
          <h4 style="color: #166534; margin-bottom: 0.5rem;">Select a Country</h4>
          <p style="font-size: 0.85rem;">Click on any country in the map above to view policy framework details including GCP, NDC, and NCAP status.</p>
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
  </div>
</section>

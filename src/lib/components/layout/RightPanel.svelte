<script lang="ts">
  export let insightText: string = '';
</script>

<aside class="sidebar-right">
  <div class="side-card insight-card">
    <h3>
      <i class="fa-solid fa-lightbulb"></i>
      Strategic Insight
    </h3>
    <p id="insight-text" class="insight-text">{insightText}</p>
    <div class="summary-stats">
      <div class="stat-item">
        <span class="label" id="stat-label-1">Total Countries</span>
        <span id="stat-val-1">-</span>
      </div>
      <div class="stat-item">
        <span class="label" id="stat-label-2">GCP Coverage</span>
        <span id="stat-val-2">-</span>
      </div>
      <div class="stat-item">
        <span class="label" id="stat-label-3">Kigali Coverage</span>
        <span id="stat-val-3">-</span>
      </div>
      <div class="stat-item">
        <span class="label" id="stat-label-4">MEPS Coverage</span>
        <span id="stat-val-4">-</span>
      </div>
      <div class="stat-item">
        <span class="label">Data Updated</span>
        <span id="stat-updated">-</span>
      </div>
    </div>
  </div>

  <div class="side-card" id="data-sources">
    <h3>Authoritative Data Sources</h3>
    <p class="side-muted">Access original datasets and policy trackers.</p>
    <div class="source-list" id="source-list"></div>
  </div>

  <!-- Partner Logos Rotating Box -->
  <div class="side-card partner-logos-card" style="margin-top: auto;">
    <h3>Supported by</h3>
    <div class="partner-logos-carousel">
      <div class="partner-logos-track">
        <img src="/images/ccc-logo.png" alt="Clean Cooling Collaborative" class="partner-logo" />
        <img src="/images/cool-coalition.png" alt="Cool Coalition" class="partner-logo" />
        <img src="/images/heat-logo.png" alt="HEAT" class="partner-logo" />
        <img src="/images/giz-logo.png" alt="GIZ" class="partner-logo" />
        <!-- Duplicate for seamless loop -->
        <img src="/images/ccc-logo.png" alt="Clean Cooling Collaborative" class="partner-logo" />
        <img src="/images/cool-coalition.png" alt="Cool Coalition" class="partner-logo" />
        <img src="/images/heat-logo.png" alt="HEAT" class="partner-logo" />
        <img src="/images/giz-logo.png" alt="GIZ" class="partner-logo" />
      </div>
    </div>
  </div>
</aside>

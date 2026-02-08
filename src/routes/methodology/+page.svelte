<script lang="ts">
  // Methodology page - publicly accessible (outside auth-protected route group)
</script>

<svelte:head>
  <title>Methodology | CoolProgress Dashboard</title>
  <meta name="description" content="Transparent methodology documentation for the CoolProgress Global Cooling Intelligence Platform. Three-layer DECARB pathway, data sources, and known limitations." />
</svelte:head>

<div class="methodology-page">
  <header class="meth-header">
    <a href="/login" class="back-link"><i class="fa-solid fa-arrow-left"></i> Back to Dashboard</a>
    <h1>Methodology & Data Sources</h1>
    <p class="meth-subtitle">
      Transparent documentation of how CoolProgress tracks global cooling emissions,
      efficiency standards, refrigerant transitions, and access gaps.
    </p>
    <div class="meth-badge">
      <i class="fa-solid fa-shield-check"></i> Last updated: February 2026
    </div>
  </header>

  <!-- Table of Contents -->
  <nav class="toc-card">
    <h2><i class="fa-solid fa-list"></i> Contents</h2>
    <ol>
      <li><a href="#decarb">Three-Layer DECARB Methodology</a></li>
      <li><a href="#data-sources">Data Sources & Attribution</a></li>
      <li><a href="#emissions">Emissions Methodology</a></li>
      <li><a href="#meps">MEPS & Labels Methodology</a></li>
      <li><a href="#kigali">Kigali Tracking Methodology</a></li>
      <li><a href="#access">Access & Vulnerability Methodology</a></li>
      <li><a href="#limitations">Known Limitations</a></li>
    </ol>
  </nav>

  <!-- Section 1: DECARB -->
  <section class="meth-section" id="decarb">
    <h2><i class="fa-solid fa-layer-group"></i> Three-Layer DECARB Methodology</h2>
    <p>
      The CoolProgress DECARB pathway models the combined emission reduction achievable through
      three independent intervention layers. This approach corrects a critical gap: neither the
      HEAT global model nor the CLASP efficiency model accounts for grid decarbonization.
    </p>

    <div class="formula-card">
      <div class="formula">
        DECARB<sub>indirect</sub> = BAU<sub>indirect</sub> &times; CLASP<sub>efficiency</sub> &times; IEA<sub>grid</sub>
      </div>
      <p class="formula-note">Where each factor is a ratio (0&ndash;1) representing the fraction of BAU emissions remaining after each intervention.</p>
    </div>

    <div class="layers-grid">
      <div class="layer-card">
        <div class="layer-badge" style="background: #E85A4F;">Layer 1</div>
        <h3>Direct Emissions (Kigali)</h3>
        <p><strong>Source:</strong> HEAT Global Model, MIT scenario</p>
        <p><strong>Mechanism:</strong> HFC phase-down per Kigali Amendment schedules</p>
        <ul>
          <li>Non-Article 5: &minus;85% by 2047</li>
          <li>Article 5 Group 1: &minus;80% by 2045</li>
          <li>Article 5 Group 2: &minus;80% by 2047</li>
        </ul>
        <p><strong>Coverage:</strong> AC and Refrigerators (Fans have zero direct emissions)</p>
      </div>

      <div class="layer-card">
        <div class="layer-badge" style="background: #8BC34A;">Layer 2</div>
        <h3>Energy Efficiency (CLASP GB)</h3>
        <p><strong>Source:</strong> CLASP Mepsy model, Global Best scenario</p>
        <p><strong>Mechanism:</strong> Best-practice MEPS + labels across all countries</p>
        <div class="ratio-table">
          <table>
            <thead><tr><th>Appliance</th><th>2030</th><th>2040</th><th>2050</th></tr></thead>
            <tbody>
              <tr><td>AC</td><td>0.835</td><td>0.743</td><td>0.735</td></tr>
              <tr><td>Refrigerators</td><td>0.911</td><td>0.789</td><td>0.723</td></tr>
              <tr><td>Fans</td><td>0.893</td><td>0.819</td><td>0.809</td></tr>
            </tbody>
          </table>
          <p class="table-note">Ratios = GB/BAU energy consumption. Lower = more savings.</p>
        </div>
      </div>

      <div class="layer-card">
        <div class="layer-badge" style="background: #0693e3;">Layer 3</div>
        <h3>Grid Decarbonization (IEA STEPS)</h3>
        <p><strong>Source:</strong> IEA World Energy Outlook 2025, Stated Policies Scenario</p>
        <p><strong>Mechanism:</strong> Renewable energy displacing fossil fuels in electricity generation</p>
        <div class="ratio-table">
          <table>
            <thead><tr><th>Year</th><th>2025</th><th>2030</th><th>2035</th><th>2040</th><th>2045</th><th>2050</th></tr></thead>
            <tbody>
              <tr><td>Grid ratio</td><td>0.95</td><td>0.80</td><td>0.65</td><td>0.55</td><td>0.47</td><td>0.40</td></tr>
            </tbody>
          </table>
          <p class="table-note">Ratios vs frozen/BAU grid assumption. Based on renewables 33% (2024) &rarr; 67% (2050).</p>
        </div>
        <p>IEA Electricity 2025: Global grid intensity 445 gCO<sub>2</sub>/kWh (2024) &rarr; 400 (2027), declining &sim;3.6%/yr.</p>
      </div>
    </div>

    <div class="critical-finding">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <div>
        <strong>Critical Finding:</strong> Neither HEAT nor CLASP model grid decarbonization.
        HEAT uses near-static grid emission factors (India: 976 &rarr; 948 gCO<sub>2</sub>/kWh 2020&ndash;2050, only &minus;3%;
        China: 857 &rarr; 896, actually <em>increases</em>). Layer 3 corrects this fundamental gap using
        IEA STEPS trajectories.
      </div>
    </div>
  </section>

  <!-- Section 2: Data Sources -->
  <section class="meth-section" id="data-sources">
    <h2><i class="fa-solid fa-database"></i> Data Sources & Attribution</h2>
    <p>CoolProgress integrates data from multiple authoritative sources. Attribution is shown on every chart and KPI card.</p>

    <div class="source-grid">
      <div class="source-card">
        <img src="/images/heat-logo.png" alt="HEAT" class="source-logo" />
        <h3>HEAT GmbH</h3>
        <p class="source-role">Global Cooling Model &amp; Dashboard Development</p>
        <ul>
          <li>global_model_subcool: BAU/KIP/MIT emission scenarios by country</li>
          <li>Direct emissions: HFC refrigerant leakage modeling</li>
          <li>Indirect emissions: Country-level grid emission factors</li>
          <li>Dashboard architecture, data integration, and methodology design</li>
        </ul>
        <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">heat-gmbh.de</a>
      </div>

      <div class="source-card">
        <img src="/images/clasp-logo.png" alt="CLASP" class="source-logo" />
        <h3>CLASP</h3>
        <p class="source-role">Appliance Efficiency &amp; Energy Data</p>
        <ul>
          <li>Mepsy model: BAU/GB/NZH/BAT energy consumption scenarios</li>
          <li>Country-level appliance stock and energy projections</li>
          <li>MEPS and Labels database (via CPRC)</li>
          <li>World's Best MEPS benchmarking</li>
        </ul>
        <a href="https://www.clasp.ngo/tools/mepsy/" target="_blank" rel="noopener noreferrer">clasp.ngo/tools/mepsy</a>
      </div>

      <div class="source-card">
        <img src="/images/iea-logo.png" alt="IEA" class="source-logo" />
        <h3>IEA</h3>
        <p class="source-role">Energy Projections &amp; Grid Decarbonization</p>
        <ul>
          <li>Future of Cooling (2018): AC stock projections</li>
          <li>WEO 2025 STEPS: Grid decarbonization trajectory</li>
          <li>Electricity 2025: Global grid intensity data</li>
          <li>Space Cooling Tracker: Energy demand validation</li>
        </ul>
        <a href="https://www.iea.org/reports/the-future-of-cooling" target="_blank" rel="noopener noreferrer">iea.org/reports/the-future-of-cooling</a>
      </div>

      <div class="source-card">
        <img src="/images/seforall-logo.jpg" alt="SEforALL" class="source-logo" />
        <h3>SEforALL</h3>
        <p class="source-role">Cooling Access &amp; Vulnerability Data</p>
        <ul>
          <li>Chilling Prospects 2025: Population at risk</li>
          <li>Historical access data (2013&ndash;2024)</li>
          <li>Risk levels by income group and region</li>
        </ul>
        <a href="https://www.seforall.org/data-stories/chilling-prospects-2025" target="_blank" rel="noopener noreferrer">seforall.org/chilling-prospects</a>
      </div>

      <div class="source-card">
        <img src="/images/unep.png" alt="UNEP" class="source-logo" />
        <h3>UNEP Ozone Secretariat</h3>
        <p class="source-role">Kigali Amendment &amp; Refrigerant Data</p>
        <ul>
          <li>Kigali Implementation Plan (KIP) ratification status</li>
          <li>Country-level HFC baseline and allowable emissions</li>
          <li>Montreal Protocol compliance tracking</li>
        </ul>
        <a href="https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment" target="_blank" rel="noopener noreferrer">ozone.unep.org</a>
      </div>

      <div class="source-card">
        <img src="/images/giz-logo.png" alt="GIZ" class="source-logo" />
        <h3>GIZ Proklima</h3>
        <p class="source-role">Green Cooling Initiative &amp; Direct Emissions</p>
        <ul>
          <li>Green Cooling Initiative: Country emissions data</li>
          <li>HEAT model collaboration on BAU/KIP scenarios</li>
          <li>Technician training and technology transfer data</li>
        </ul>
        <a href="https://www.green-cooling-initiative.org/" target="_blank" rel="noopener noreferrer">green-cooling-initiative.org</a>
      </div>
    </div>
  </section>

  <!-- Section 3: Emissions -->
  <section class="meth-section" id="emissions">
    <h2><i class="fa-solid fa-smog"></i> Emissions Methodology</h2>
    <p>
      Cooling emissions split into two streams. <strong>Indirect emissions</strong> come from electricity
      powering compressors, fans, and chillers &mdash; currently ~70% of the sector's climate impact.
      <strong>Direct emissions</strong> come from refrigerant gas leaks during manufacturing, operation, and disposal.
    </p>

    <h3>BAU Scenario</h3>
    <ul>
      <li><strong>Indirect:</strong> HEAT global_model_subcool (BAU scenario) + CLASP BAU energy</li>
      <li><strong>Direct:</strong> HEAT model based on installed base HFC charge, annual leak rates, and end-of-life emissions</li>
      <li><strong>Validation:</strong> Cross-checked against IEA/OWID 2022 benchmark (~1,750 Mt CO<sub>2</sub>e for AC)</li>
    </ul>

    <h3>DECARB Scenario</h3>
    <ul>
      <li><strong>Indirect:</strong> BAU indirect &times; CLASP efficiency ratio &times; IEA grid ratio (three-layer)</li>
      <li><strong>Direct:</strong> HEAT MIT scenario (Kigali-compliant refrigerant phase-down)</li>
      <li><strong>Fans:</strong> CLASP GB scenario &times; IEA grid ratio only (no refrigerant, no direct emissions)</li>
    </ul>

    <h3>Appliance Coverage</h3>
    <table class="data-table">
      <thead><tr><th>Appliance</th><th>Direct Emissions</th><th>Indirect Emissions</th><th>DECARB Source</th></tr></thead>
      <tbody>
        <tr><td>Air Conditioners</td><td>Yes (HFC leaks)</td><td>Yes (electricity)</td><td>HEAT MIT + CLASP GB + IEA STEPS</td></tr>
        <tr><td>Refrigerators</td><td>Yes (minimal)</td><td>Yes (electricity)</td><td>HEAT MIT + CLASP GB + IEA STEPS</td></tr>
        <tr><td>Fans</td><td>None (no refrigerant)</td><td>Yes (electricity)</td><td>CLASP GB + IEA STEPS</td></tr>
      </tbody>
    </table>
  </section>

  <!-- Section 4: MEPS -->
  <section class="meth-section" id="meps">
    <h2><i class="fa-solid fa-bolt"></i> MEPS & Labels Methodology</h2>
    <p>
      Minimum Energy Performance Standards (MEPS) set the efficiency floor for appliances sold in a market.
      Energy labels inform consumers. CoolProgress tracks both instruments across all major economies.
    </p>
    <ul>
      <li><strong>Primary source:</strong> CLASP Policy Resource Center (CPRC)</li>
      <li><strong>Metrics:</strong> Cooling Seasonal Performance Factor (CSPF), Energy Efficiency Ratio (EER), Annual Energy Consumption (AEC)</li>
      <li><strong>Coverage:</strong> AC, Refrigerators, and Fans across 80+ countries</li>
      <li><strong>Update frequency:</strong> Aligned with CLASP data releases (annual)</li>
    </ul>
  </section>

  <!-- Section 5: Kigali -->
  <section class="meth-section" id="kigali">
    <h2><i class="fa-solid fa-snowflake"></i> Kigali Tracking Methodology</h2>
    <p>
      The Kigali Amendment to the Montreal Protocol provides the legal framework for phasing down
      HFC production and consumption. CoolProgress tracks ratification status, implementation stage,
      and baseline emissions for all 198 parties.
    </p>
    <ul>
      <li><strong>Primary source:</strong> UNEP Ozone Secretariat</li>
      <li><strong>Data:</strong> Ratification date, country group (Non-A5 / A5-I / A5-II), baseline CO<sub>2</sub>eq, KIP Stage 1 approval status</li>
      <li><strong>Refrigerant GWP values:</strong> IPCC AR6 (2023) for consistency</li>
    </ul>
  </section>

  <!-- Section 6: Access -->
  <section class="meth-section" id="access">
    <h2><i class="fa-solid fa-people-group"></i> Access & Vulnerability Methodology</h2>
    <p>
      The cooling access pillar draws on SEforALL's Chilling Prospects framework, which identifies
      populations at risk from inadequate cooling across three dimensions: health (thermal safety),
      food (cold chains), and livelihoods (labor productivity).
    </p>
    <ul>
      <li><strong>Historical data (2013&ndash;2024):</strong> SEforALL access_to_cooling_seeforall table</li>
      <li><strong>Forecast data (2025&ndash;2030):</strong> access_to_cooling_forecast projections</li>
      <li><strong>Population categories:</strong> Rural Poor, Urban Poor, Lower-Middle Income, Middle-Income</li>
      <li><strong>Risk levels:</strong> High, Medium, Low &mdash; based on income, infrastructure, and climate vulnerability</li>
    </ul>
  </section>

  <!-- Section 7: Limitations -->
  <section class="meth-section" id="limitations">
    <h2><i class="fa-solid fa-circle-exclamation"></i> Known Limitations</h2>
    <div class="limitations-list">
      <div class="limitation">
        <strong>Grid emission factors (HEAT model):</strong>
        HEAT uses near-static country-level grid emission factors (e.g., India: 976 &rarr; 948 gCO<sub>2</sub>/kWh,
        China: 857 &rarr; 896). The IEA STEPS Layer 3 correction addresses this at the global level but does not
        capture country-specific grid decarbonization trajectories.
      </div>
      <div class="limitation">
        <strong>MEPS data currency:</strong>
        The MEPS database contains entries primarily from 2016&ndash;2019. Recent MEPS updates (2024&ndash;2025)
        for key markets (India, EU Ecodesign 2025, China) are being incorporated.
      </div>
      <div class="limitation">
        <strong>Fan emissions:</strong>
        No HEAT model exists for fans. Fan DECARB relies on CLASP GB efficiency ratios and IEA grid decarbonization only.
      </div>
      <div class="limitation">
        <strong>NCAP coverage:</strong>
        Only ~30 National Cooling Action Plans are tracked. Many countries have NCAPs in development
        that are not yet reflected in the database.
      </div>
      <div class="limitation">
        <strong>Aggregations table:</strong>
        The global aggregation of country-level data points is under development. Current global views
        use pre-computed timeseries rather than real-time aggregation.
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="meth-footer">
    <p>
      <strong>CoolProgress</strong> is developed by
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
      in partnership with CLASP, IEA, SEforALL, UNEP, GIZ Proklima, Cool Coalition, and the Clean Cooling Collaborative.
    </p>
    <p class="meth-version">Methodology version 2.0 &middot; February 2026</p>
  </footer>
</div>

<style>
  .methodology-page {
    max-width: 860px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #333;
    line-height: 1.6;
  }

  /* Header */
  .meth-header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #3D6B6B;
    text-decoration: none;
    margin-bottom: 1rem;
    transition: color 0.2s;
  }

  .back-link:hover { color: #2D5252; }

  .meth-header h1 {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0 0 0.5rem;
    color: #1a1a1a;
  }

  .meth-subtitle {
    font-size: 1rem;
    color: #555;
    max-width: 600px;
    margin: 0;
  }

  .meth-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.75rem;
    padding: 0.3rem 0.7rem;
    background: rgba(61, 107, 107, 0.08);
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    color: #3D6B6B;
  }

  /* Table of Contents */
  .toc-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 2rem;
  }

  .toc-card h2 {
    font-size: 0.85rem;
    font-weight: 700;
    color: #555;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .toc-card ol {
    margin: 0;
    padding-left: 1.5rem;
  }

  .toc-card li {
    margin-bottom: 0.3rem;
  }

  .toc-card a {
    color: #3D6B6B;
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 500;
  }

  .toc-card a:hover { text-decoration: underline; }

  /* Sections */
  .meth-section {
    margin-bottom: 2.5rem;
    scroll-margin-top: 2rem;
  }

  .meth-section h2 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .meth-section h2 i {
    color: #3D6B6B;
    font-size: 1.1rem;
  }

  .meth-section h3 {
    font-size: 1.05rem;
    font-weight: 700;
    color: #333;
    margin: 1.25rem 0 0.5rem;
  }

  .meth-section p {
    margin: 0 0 0.75rem;
    font-size: 0.9rem;
  }

  .meth-section ul {
    padding-left: 1.5rem;
    margin: 0 0 0.75rem;
  }

  .meth-section li {
    font-size: 0.88rem;
    margin-bottom: 0.35rem;
  }

  /* Formula Card */
  .formula-card {
    background: linear-gradient(135deg, #0d3b4f, #1a6b5a);
    color: #fff;
    padding: 1.25rem 1.5rem;
    border-radius: 12px;
    margin: 1rem 0 1.25rem;
  }

  .formula {
    font-size: 1.2rem;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .formula sub { font-size: 0.7em; }

  .formula-note {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.7);
    text-align: center;
    margin: 0;
  }

  /* Layers Grid */
  .layers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1.25rem 0;
  }

  .layer-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1rem;
  }

  .layer-badge {
    display: inline-block;
    color: #fff;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    margin-bottom: 0.5rem;
  }

  .layer-card h3 {
    font-size: 0.95rem;
    margin: 0 0 0.5rem;
  }

  .layer-card p, .layer-card li {
    font-size: 0.8rem;
  }

  .layer-card ul {
    padding-left: 1.2rem;
    margin: 0.25rem 0;
  }

  /* Ratio Tables */
  .ratio-table {
    margin: 0.5rem 0;
  }

  .ratio-table table, .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
    margin: 0.5rem 0;
  }

  .ratio-table th, .data-table th {
    background: #f1f5f9;
    padding: 0.4rem 0.6rem;
    text-align: left;
    font-weight: 700;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #555;
    border-bottom: 1px solid #e2e8f0;
  }

  .ratio-table td, .data-table td {
    padding: 0.4rem 0.6rem;
    border-bottom: 1px solid #f1f5f9;
    font-variant-numeric: tabular-nums;
  }

  .table-note {
    font-size: 0.7rem;
    color: #888;
    font-style: italic;
    margin: 0.25rem 0 0;
  }

  /* Critical Finding */
  .critical-finding {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-left: 4px solid #f59e0b;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin: 1.5rem 0;
  }

  .critical-finding i {
    color: #f59e0b;
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 0.15rem;
  }

  .critical-finding p, .critical-finding div {
    font-size: 0.85rem;
    margin: 0;
    line-height: 1.5;
  }

  /* Source Grid */
  .source-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin: 1rem 0;
  }

  .source-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .source-card:hover {
    border-color: #3D6B6B;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }

  .source-logo {
    max-width: 80px;
    max-height: 32px;
    object-fit: contain;
    margin-bottom: 0.5rem;
    opacity: 0.85;
  }

  .source-card h3 {
    font-size: 0.95rem;
    margin: 0 0 0.15rem;
  }

  .source-role {
    font-size: 0.75rem;
    color: #888;
    font-weight: 600;
    margin: 0 0 0.5rem;
  }

  .source-card ul {
    padding-left: 1.2rem;
    margin: 0 0 0.5rem;
  }

  .source-card li {
    font-size: 0.78rem;
    margin-bottom: 0.2rem;
  }

  .source-card a {
    font-size: 0.78rem;
    color: #3D6B6B;
    text-decoration: none;
    font-weight: 600;
  }

  .source-card a:hover { text-decoration: underline; }

  /* Limitations */
  .limitations-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .limitation {
    background: #fafafa;
    border: 1px solid #e2e8f0;
    border-left: 3px solid #94a3b8;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }

  .limitation strong {
    color: #333;
  }

  /* Footer */
  .meth-footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 2px solid #e2e8f0;
    text-align: center;
  }

  .meth-footer p {
    font-size: 0.85rem;
    color: #555;
    margin: 0 0 0.5rem;
  }

  .meth-footer a {
    color: #3D6B6B;
    text-decoration: none;
    font-weight: 600;
  }

  .meth-footer a:hover { text-decoration: underline; }

  .meth-version {
    font-size: 0.72rem;
    color: #aaa;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .layers-grid { grid-template-columns: 1fr; }
    .source-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 600px) {
    .methodology-page { padding: 1rem; }
    .meth-header h1 { font-size: 1.5rem; }
  }
</style>

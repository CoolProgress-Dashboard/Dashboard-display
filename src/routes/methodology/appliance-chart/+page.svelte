<script lang="ts">
  // Appliance Growth Chart methodology — publicly accessible
</script>

<svelte:head>
  <title>Appliance Growth Chart — Data Methodology | CoolProgress</title>
  <meta name="description" content="Data sources and methodology for the Global Appliance Growth Chart: how CLASP Mepsy and GCI/HEAT data are combined to show stock, energy, and emissions." />
</svelte:head>

<div class="methodology-page">
  <header class="meth-header">
    <div class="nav-row">
      <a href="/dashboard/emissions" class="back-link"><i class="fa-solid fa-arrow-left"></i> Back to Emissions Pillar</a>
    </div>
    <h1>Appliance Growth Chart — Data Methodology</h1>
    <p class="meth-subtitle">
      How the Global Appliance Stock, Energy, and Emissions chart is built from
      two primary data sources: CLASP Mepsy and the Green Cooling Initiative (GCI/HEAT).
    </p>
    <div class="meth-badge">
      <i class="fa-solid fa-shield-check"></i> Last updated: April 2026
    </div>
  </header>

  <!-- Overview -->
  <section class="meth-section" id="overview">
    <h2><i class="fa-solid fa-chart-line"></i> What the Chart Shows</h2>
    <p>
      The chart tracks three metrics for three cooling appliance types (Air Conditioners,
      Refrigerators, Fans) from 2020 to 2050 under a Business-as-Usual (BAU) scenario:
    </p>
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-icon"><i class="fa-solid fa-boxes-stacked"></i></div>
        <h3>Stock (Units)</h3>
        <p>Total number of appliances in use globally, in millions of units.</p>
      </div>
      <div class="metric-card">
        <div class="metric-icon"><i class="fa-solid fa-bolt"></i></div>
        <h3>Energy (TWh)</h3>
        <p>Total electricity consumed by the appliance fleet globally, in terawatt-hours per year.</p>
      </div>
      <div class="metric-card">
        <div class="metric-icon"><i class="fa-solid fa-smog"></i></div>
        <h3>Emissions (Mt CO₂e)</h3>
        <p>Total greenhouse gas emissions — direct (refrigerant leaks) plus indirect (electricity grid) — in megatonnes of CO₂-equivalent per year.</p>
      </div>
    </div>
  </section>

  <!-- Data Sources -->
  <section class="meth-section" id="sources">
    <h2><i class="fa-solid fa-database"></i> Data Sources</h2>
    <p>All chart data is aggregated live from two Supabase tables at page load. No data is hardcoded.</p>

    <div class="source-block">
      <div class="source-header clasp-header">
        <img src="/images/clasp-logo.png" alt="CLASP" class="source-logo" />
        <div>
          <h3>CLASP Mepsy</h3>
          <a href="https://www.clasp.ngo/tools/mepsy/" target="_blank" rel="noopener noreferrer">
            clasp.ngo/tools/mepsy <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
      <p><strong>Supabase table:</strong> <code>clasp_energy_consumption</code></p>
      <p><strong>Coverage:</strong> 2020–2050 · 5-year intervals · 3 appliance types · country-level rows summed globally</p>
      <table class="col-table">
        <thead>
          <tr><th>Column</th><th>Used for</th><th>Scenario</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>appliance_units_in_use</code></td>
            <td>Stock (Units) — divided by 1,000,000 to convert to millions</td>
            <td>BAU only (stock does not vary by efficiency scenario)</td>
          </tr>
          <tr>
            <td><code>bau_final_energy_twh</code></td>
            <td>Energy (TWh)</td>
            <td>BAU</td>
          </tr>
          <tr>
            <td><code>bau_co2_mt</code></td>
            <td>Indirect Emissions (Mt CO₂e)</td>
            <td>BAU</td>
          </tr>
        </tbody>
      </table>
      <p class="note">
        <i class="fa-solid fa-circle-info"></i>
        CLASP models <strong>indirect emissions only</strong> (electricity grid carbon). It does not cover direct refrigerant emissions.
        Appliance names are mapped: "Air Conditioning" → AC · "Refrigerator-Freezers" → DomRef · "Ceiling and Portable Fans" → Fans.
      </p>
    </div>

    <div class="source-block">
      <div class="source-header gci-header">
        <img src="/images/giz-logo.png" alt="GIZ" class="source-logo" />
        <img src="/images/heat-logo.png" alt="HEAT GmbH" class="source-logo" />
        <div>
          <h3>Green Cooling Initiative (GCI / HEAT GmbH)</h3>
          <a href="https://www.green-cooling-initiative.org/country-data#!total-emissions/all-sectors/absolute" target="_blank" rel="noopener noreferrer">
            green-cooling-initiative.org <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
      <p><strong>Supabase table:</strong> <code>global_model_subcool</code></p>
      <p><strong>Coverage:</strong> 2020–2050 · 5-year intervals · 2 subsectors · country-level rows summed globally</p>
      <table class="col-table">
        <thead>
          <tr><th>Column</th><th>Used for</th><th>Filter</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>direct_emission_mt</code></td>
            <td>Direct Emissions (Mt CO₂e) — refrigerant leaks</td>
            <td><code>scenario_name = 'BAU'</code></td>
          </tr>
        </tbody>
      </table>
      <p class="note">
        <i class="fa-solid fa-circle-info"></i>
        GCI/HEAT models <strong>direct emissions only</strong> (refrigerant leaks from cooling equipment).
        Subsectors are mapped: "Split residential air conditioners" → AC · "Domestic refrigeration" → DomRef.
        <strong>Fans carry zero direct emissions</strong> — they use no refrigerant and are not modelled by GCI/HEAT.
      </p>
    </div>
  </section>

  <!-- Combination -->
  <section class="meth-section" id="combination">
    <h2><i class="fa-solid fa-code-merge"></i> How the Two Sources Are Combined</h2>
    <p>
      Aggregation runs client-side in <code>buildApplianceTimeseries()</code> inside
      <code>src/lib/services/dashboard-data.ts</code>. The join key is
      <strong>(appliance_type, year)</strong> — no country-level detail is retained in the chart.
    </p>

    <div class="formula-card">
      <div class="formula">
        Total Emissions = Indirect (CLASP) + Direct (GCI/HEAT)
      </div>
    </div>

    <table class="col-table full">
      <thead>
        <tr>
          <th>Chart metric</th>
          <th>Source table</th>
          <th>Column(s) aggregated</th>
          <th>Operation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Stock (M units)</td>
          <td>CLASP <code>clasp_energy_consumption</code></td>
          <td><code>appliance_units_in_use</code></td>
          <td>SUM all countries ÷ 1,000,000</td>
        </tr>
        <tr>
          <td>Energy (TWh)</td>
          <td>CLASP <code>clasp_energy_consumption</code></td>
          <td><code>bau_final_energy_twh</code></td>
          <td>SUM all countries</td>
        </tr>
        <tr>
          <td>Indirect emissions (Mt)</td>
          <td>CLASP <code>clasp_energy_consumption</code></td>
          <td><code>bau_co2_mt</code></td>
          <td>SUM all countries</td>
        </tr>
        <tr>
          <td>Direct emissions (Mt)</td>
          <td>GCI/HEAT <code>global_model_subcool</code></td>
          <td><code>direct_emission_mt</code> where <code>scenario_name='BAU'</code></td>
          <td>SUM all countries, map subsectors → appliance</td>
        </tr>
        <tr class="total-row">
          <td><strong>Total emissions (Mt)</strong></td>
          <td colspan="2"><em>Computed</em></td>
          <td>Indirect + Direct</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- Coverage & Limitations -->
  <section class="meth-section" id="limitations">
    <h2><i class="fa-solid fa-triangle-exclamation"></i> Coverage & Known Limitations</h2>
    <ul class="limit-list">
      <li>
        <strong>Time range:</strong> Data shown from 2020 to 2050 in 5-year intervals.
        CLASP and GCI/HEAT both provide 5-year projections; ECharts interpolates visually between points.
      </li>
      <li>
        <strong>Appliance coverage:</strong> AC, Domestic Refrigerators, and Fans.
        Commercial refrigeration and commercial cooling equipment are not included.
      </li>
      <li>
        <strong>Direct emissions for Fans:</strong> Set to zero — fans use no refrigerant
        and are not modelled by GCI/HEAT.
      </li>
      <li>
        <strong>Stock units:</strong> <code>appliance_units_in_use</code> in the CLASP table
        is stored in individual units (not millions). The chart divides by 1,000,000 before display.
      </li>
      <li>
        <strong>Grid emission factors:</strong> CLASP uses country-specific static grid emission
        factors. Future grid decarbonisation is not reflected in the BAU energy or indirect
        emissions figures.
      </li>
      <li>
        <strong>Country coverage:</strong> Aggregation sums all countries present in each table.
        Countries not covered by CLASP or GCI/HEAT are excluded from the global total.
      </li>
    </ul>
  </section>
</div>

<style>
  .methodology-page {
    max-width: 860px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
    font-family: inherit;
    color: #1e293b;
  }

  .meth-header {
    margin-bottom: 2.5rem;
  }

  .nav-row {
    margin-bottom: 1.2rem;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: #3D6B6B;
    text-decoration: none;
    padding: 0.4rem 0.9rem;
    border: 1.5px solid #3D6B6B;
    border-radius: 999px;
    transition: background 0.2s, color 0.2s;
  }

  .back-link:hover {
    background: #3D6B6B;
    color: #fff;
  }

  .meth-header h1 {
    font-size: 1.6rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: #0f172a;
  }

  .meth-subtitle {
    font-size: 0.95rem;
    color: #475569;
    margin: 0 0 0.75rem;
    line-height: 1.6;
  }

  .meth-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.25rem 0.6rem;
    border-radius: 99px;
  }

  .meth-section {
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .meth-section:last-child {
    border-bottom: none;
  }

  .meth-section h2 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .meth-section h2 i {
    color: #2D7D5A;
    font-size: 0.95rem;
  }

  .meth-section p {
    font-size: 0.9rem;
    line-height: 1.7;
    color: #334155;
    margin: 0 0 0.75rem;
  }

  /* Metric cards */
  .metric-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 1rem;
  }

  .metric-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1rem;
  }

  .metric-icon {
    font-size: 1.2rem;
    color: #2D7D5A;
    margin-bottom: 0.4rem;
  }

  .metric-card h3 {
    font-size: 0.88rem;
    font-weight: 700;
    margin: 0 0 0.3rem;
    color: #0f172a;
  }

  .metric-card p {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }

  /* Source blocks */
  .source-block {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .source-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .source-logo {
    height: 22px;
    width: auto;
    object-fit: contain;
    opacity: 0.9;
  }

  .source-header h3 {
    font-size: 0.92rem;
    font-weight: 700;
    margin: 0 0 0.15rem;
    color: #0f172a;
  }

  .source-header a {
    font-size: 0.75rem;
    color: #0369a1;
    text-decoration: none;
  }

  .source-block p {
    font-size: 0.85rem;
    margin: 0 0 0.5rem;
    color: #334155;
    line-height: 1.6;
  }

  code {
    font-family: 'Fira Code', monospace;
    font-size: 0.78rem;
    background: #e2e8f0;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    color: #0f172a;
  }

  .note {
    font-size: 0.78rem !important;
    color: #64748b !important;
    background: #fff;
    border-left: 3px solid #2D7D5A;
    padding: 0.5rem 0.75rem;
    border-radius: 0 6px 6px 0;
    margin-top: 0.75rem !important;
  }

  .note i {
    color: #2D7D5A;
    margin-right: 0.3rem;
  }

  /* Tables */
  .col-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
    margin: 0.75rem 0;
  }

  .col-table.full {
    margin-top: 1rem;
  }

  .col-table th {
    background: #e2e8f0;
    padding: 0.45rem 0.65rem;
    text-align: left;
    font-weight: 600;
    color: #334155;
  }

  .col-table td {
    padding: 0.45rem 0.65rem;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    vertical-align: top;
  }

  .col-table tr.total-row td {
    background: #f0fdf4;
    font-weight: 600;
  }

  /* Formula */
  .formula-card {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin: 1rem 0;
    text-align: center;
  }

  .formula {
    font-size: 1rem;
    font-weight: 700;
    color: #166534;
    letter-spacing: 0.01em;
  }

  /* Limitations */
  .limit-list {
    padding-left: 1.25rem;
    margin: 0;
  }

  .limit-list li {
    font-size: 0.87rem;
    color: #334155;
    line-height: 1.7;
    margin-bottom: 0.6rem;
  }

  @media (max-width: 640px) {
    .metric-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

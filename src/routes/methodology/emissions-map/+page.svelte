<script lang="ts">
  // Emissions map methodology, publicly accessible
</script>

<svelte:head>
  <title>Emissions Map: Data Methodology | CoolProgress</title>
  <meta name="description" content="How the CoolProgress emissions map estimates direct (refrigerant) and indirect (electricity) cooling emissions per country, the data sources used, and how reliable the figures are." />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</svelte:head>

<div class="methodology-page">
  <header class="meth-header">
    <div class="nav-row">
      <a href="/dashboard/emissions" class="back-link" on:click|preventDefault={() => { if (window.history.length > 1) { window.history.back(); } else { window.location.href = '/dashboard/emissions'; } }}><i class="fa-solid fa-arrow-left"></i> Back to Emissions Pillar</a>
    </div>
    <h1>Emissions Map: Data Methodology</h1>
    <p class="meth-subtitle">
      How the "CO2 Emissions by Country" map estimates annual cooling emissions for each country,
      where the refrigerant (HFC) figures come from, and how far they can be relied on.
    </p>
    <div class="meth-badge">
      <i class="fa-solid fa-shield-check"></i> Last updated: October 2026
    </div>
  </header>

  <!-- Overview -->
  <section class="meth-section" id="overview">
    <h2><i class="fa-solid fa-earth-americas"></i> What the Map Shows</h2>
    <p>
      Each country is shaded by its estimated <strong>annual</strong> cooling emissions in the selected year,
      in megatonnes of CO₂-equivalent per year (Mt CO₂/yr). The map can show direct emissions, indirect
      emissions, or their total.
    </p>
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-icon"><i class="fa-solid fa-wind"></i></div>
        <h3>Direct emissions</h3>
        <p>Refrigerant that leaks from cooling equipment during operation and servicing, or escapes at end of life. Mostly HFCs, converted to CO₂-equivalent using their global warming potential (GWP).</p>
      </div>
      <div class="metric-card">
        <div class="metric-icon"><i class="fa-solid fa-bolt"></i></div>
        <h3>Indirect emissions</h3>
        <p>The CO₂ released at power plants generating the electricity that runs the equipment.</p>
      </div>
      <div class="metric-card">
        <div class="metric-icon"><i class="fa-solid fa-plus"></i></div>
        <h3>Total</h3>
        <p>Direct plus indirect, summed per country.</p>
      </div>
    </div>
  </section>

  <!-- Sources -->
  <section class="meth-section" id="sources">
    <h2><i class="fa-solid fa-database"></i> Data Sources</h2>

    <div class="source-block">
      <div class="source-header">
        <img src="/images/giz-logo.png" alt="GIZ" class="source-logo" />
        <img src="/images/heat-logo.png" alt="HEAT GmbH" class="source-logo" />
        <div>
          <h3>Green Cooling Initiative (GCI / HEAT GmbH), default view</h3>
          <a href="https://www.green-cooling-initiative.org/country-data#!total-emissions/all-sectors/absolute" target="_blank" rel="noopener noreferrer">
            green-cooling-initiative.org <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
      <p><strong>Supabase table:</strong> <code>global_model_subcool</code></p>
      <p><strong>Coverage:</strong> 176 countries · annual values, shown on the map for 2020 to 2050 · two subsectors (split residential air conditioners, domestic refrigeration) · scenarios Business as Usual (BAU), Kigali Implementation (KIP) and Kigali+ (KIP_PLUS)</p>
      <table class="col-table">
        <thead>
          <tr><th>Column</th><th>Used for</th></tr>
        </thead>
        <tbody>
          <tr><td><code>direct_emission_mt</code></td><td>Direct emissions (refrigerant), Mt CO₂e/yr</td></tr>
          <tr><td><code>indirect_emission_mt</code></td><td>Indirect emissions (electricity), Mt CO₂/yr</td></tr>
        </tbody>
      </table>
    </div>

    <div class="source-block">
      <div class="source-header">
        <img src="/images/clasp-logo.png" alt="CLASP" class="source-logo" />
        <div>
          <h3>CLASP Mepsy, alternative view</h3>
          <a href="https://www.clasp.ngo/tools/mepsy/" target="_blank" rel="noopener noreferrer">
            clasp.ngo/tools/mepsy <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
      <p><strong>Supabase table:</strong> <code>clasp_energy_consumption</code></p>
      <p class="note">
        <i class="fa-solid fa-circle-info"></i>
        The CLASP view shows <strong>indirect emissions only</strong>. CLASP does not model refrigerant leaks,
        so all HFC (direct) figures on the map come from GCI/HEAT. The EU regional aggregate is excluded to avoid
        double-counting its member states.
      </p>
    </div>
  </section>

  <!-- HFC integration -->
  <section class="meth-section" id="hfc">
    <h2><i class="fa-solid fa-snowflake"></i> How Refrigerant (HFC) Emissions Are Estimated Per Country</h2>
    <p>
      Direct emissions are not measured. They are modelled bottom-up for each country by the
      HEAT Global Cooling Model, which also underlies the Green Cooling Initiative country data.
    </p>
    <ol class="limit-list">
      <li><strong>Equipment stock.</strong> The installed fleet in each subsector is estimated from sales and equipment lifetimes.</li>
      <li><strong>Refrigerant bank.</strong> Each unit carries a refrigerant charge. The refrigerant mix (for example R-22, R-410A, R-32, R-600a) shifts over time as markets transition.</li>
      <li><strong>Leakage.</strong> Annual leak rates during operation and servicing, plus losses at end of life, give the quantity of refrigerant released each year.</li>
      <li><strong>Climate impact.</strong> Released refrigerant is converted to CO₂-equivalent using the GWP of each refrigerant.</li>
      <li><strong>Scenarios.</strong> BAU continues current market trends. KIP follows each country's Kigali Amendment HFC phase-down schedule. KIP_PLUS assumes an accelerated transition.</li>
    </ol>
    <p>
      The dashboard sums the two subsectors per country for the selected year and scenario.
      No further adjustment is applied on the dashboard side.
    </p>

    <div class="formula-card">
      <div class="formula">
        Country total = Σ subsectors (direct_emission_mt + indirect_emission_mt)
      </div>
    </div>
  </section>

  <!-- Reliability -->
  <section class="meth-section" id="limitations">
    <h2><i class="fa-solid fa-triangle-exclamation"></i> Reliability & Known Limitations</h2>
    <ul class="limit-list">
      <li>
        <strong>Modelled, not reported:</strong> figures are model estimates, not official national inventories
        reported to the UNFCCC or the Ozone Secretariat, and can differ from a country's own reporting.
      </li>
      <li>
        <strong>Input quality varies by country:</strong> sales, charge and leak-rate data are richer for large
        markets. Where country data is thin, regional assumptions fill the gap, so smaller markets carry wider uncertainty.
      </li>
      <li>
        <strong>Two subsectors only:</strong> commercial refrigeration, chillers, mobile air conditioning and
        other equipment are not included, so national cooling emissions are understated.
      </li>
      <li>
        <strong>Absolute values:</strong> shading is not adjusted for population or climate. Large, hot or
        populous countries naturally show higher emissions, so the map is not a ranking of country performance.
      </li>
      <li>
        <strong>Annual, not cumulative:</strong> every value is the emissions of a single year.
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

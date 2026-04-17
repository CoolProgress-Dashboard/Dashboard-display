<script lang="ts">
  // Methodology: MEPS Stringency Over Time — publicly accessible
</script>

<svelte:head>
  <title>Methodology: MEPS Stringency Over Time | CoolProgress</title>
  <meta name="description" content="Methodology and data sources for the MEPS Stringency Over Time chart: CSPF and EEI harmonization, U4E reference levels, and country coverage." />
</svelte:head>

<div class="methodology-page">

  <header class="meth-header">
    <div class="nav-row">
      <a href="/dashboard/meps" class="back-link"><i class="fa-solid fa-arrow-left"></i> Back to Product Efficiency</a>
    </div>
    <div class="meth-eyebrow">Product Efficiency Pillar · MEPS Stringency</div>
    <h1>MEPS Stringency Over Time</h1>
    <p class="meth-subtitle">
      Methodology and source documentation for the chart tracking how minimum energy performance
      standards for cooling appliances have evolved across countries, harmonized to a common metric
      for cross-country comparison.
    </p>
    <div class="meth-badge">
      <i class="fa-solid fa-shield-check"></i> Data vintage: CLASP CPRC 2025 · Last reviewed: April 2026
    </div>
  </header>

  <!-- TOC -->
  <nav class="toc-card">
    <h2><i class="fa-solid fa-list"></i> Contents</h2>
    <ol>
      <li><a href="#what">What the Chart Shows</a></li>
      <li><a href="#ac-harmonization">AC: CSPF Harmonization</a></li>
      <li><a href="#fridge-harmonization">Refrigerator: EEI Harmonization</a></li>
      <li><a href="#u4e-references">U4E Reference Lines</a></li>
      <li><a href="#timeline">Adopted vs. Effective</a></li>
      <li><a href="#sources">Data Sources</a></li>
      <li><a href="#limitations">Limitations</a></li>
    </ol>
  </nav>

  <!-- Section 1: What the chart shows -->
  <section class="meth-section" id="what">
    <h2><i class="fa-solid fa-chart-line"></i> What the Chart Shows</h2>
    <p>
      The chart tracks how MEPS stringency has changed over time (2006–2035) for three appliance types:
      Air Conditioners, Refrigerators, and Fans. Each country line shows the efficiency floor required
      by law, plotted in a harmonized metric so that countries using different national standards can
      be compared directly.
    </p>
    <div class="concept-grid">
      <div class="concept-card">
        <div class="concept-icon"><i class="fa-solid fa-wind"></i></div>
        <h3>Air Conditioners</h3>
        <p>Harmonized to <strong>ISO CSPF equivalent (W/W)</strong>. Higher = more efficient. Covers residential split ACs, the dominant appliance type.</p>
      </div>
      <div class="concept-card">
        <div class="concept-icon"><i class="fa-solid fa-snowflake"></i></div>
        <h3>Refrigerators</h3>
        <p>Harmonized to <strong>EEI (Energy Efficiency Index)</strong>. Lower = more stringent. Reference: 400L frost-free combo at 24°C ambient.</p>
      </div>
      <div class="concept-card">
        <div class="concept-icon"><i class="fa-solid fa-fan"></i></div>
        <h3>Fans</h3>
        <p>No universal metric exists. National values are shown as-is (W or CFM/W). Cross-country comparison is not valid for fans.</p>
      </div>
    </div>
    <p>
      Solid lines show regulations currently in force. Dashed lines show officially adopted standards
      with a future effective date or staged compliance schedule. Purely aspirational targets not yet
      legislated are excluded.
    </p>
  </section>

  <!-- Section 2: AC CSPF Harmonization -->
  <section class="meth-section" id="ac-harmonization">
    <h2><i class="fa-solid fa-wind"></i> AC: CSPF Harmonization</h2>
    <p>
      Countries regulate AC efficiency using different seasonal performance metrics, different test
      standards, and different capacity class definitions. To enable cross-country comparison, all
      national MEPS values are converted to an approximate <strong>ISO 16358 CSPF equivalent (W/W)</strong>.
    </p>

    <div class="formula-card">
      <div class="formula">CSPF<sub>equiv</sub> = National Metric × Conversion Factor</div>
      <p class="formula-note">
        Conversions are approximate — test condition and climate-zone differences are not fully
        eliminable. See limitations section.
      </p>
    </div>

    <table class="data-table">
      <thead>
        <tr><th>National Metric</th><th>Countries</th><th>Conversion to CSPF</th><th>Basis</th></tr>
      </thead>
      <tbody>
        <tr><td>CSPF (ISO 16358)</td><td>China, Singapore, ASEAN, SADC</td><td>× 1.0 (direct)</td><td>Same standard</td></tr>
        <tr><td>APF (JIS C 9612)</td><td>Japan</td><td>× 0.90</td><td>CLASP conversion</td></tr>
        <tr><td>ISEER (BEE)</td><td>India</td><td>× 0.92</td><td>CLASP conversion</td></tr>
        <tr><td>EU SEER (EN 14825)</td><td>EU-27</td><td>× 0.95</td><td>CLASP conversion</td></tr>
        <tr><td>SEER2 (DOE)</td><td>USA (South)</td><td>× 0.293 × 1.1</td><td>BTU/W·h → W/W, climate adj.</td></tr>
        <tr><td>EER (fixed point)</td><td>Saudi Arabia, Ghana</td><td>× 1.062</td><td>CLASP conversion (fixed)</td></tr>
        <tr><td>AEER</td><td>Australia, New Zealand</td><td>× 1.06</td><td>CLASP conversion</td></tr>
      </tbody>
    </table>

    <div class="callout-info">
      <i class="fa-solid fa-circle-info"></i>
      <div>
        <strong>Capacity class:</strong> All country values shown are for the dominant residential
        split AC range (approximately 2.5–5 kW cooling capacity). Some countries define MEPS
        differently by capacity class — the value shown reflects the most common residential tier.
      </div>
    </div>
  </section>

  <!-- Section 3: Refrigerator EEI -->
  <section class="meth-section" id="fridge-harmonization">
    <h2><i class="fa-solid fa-snowflake"></i> Refrigerator: EEI Harmonization</h2>
    <p>
      Refrigerator MEPS are set in heterogeneous units across countries — annual energy consumption
      (kWh/yr), percentage indices (TEEI%), monthly consumption (kWh/month), or direct EEI values.
      To compare, all are normalized to a common <strong>Energy Efficiency Index (EEI)</strong>.
    </p>

    <div class="formula-card">
      <div class="formula">EEI = (MEPS max AEC / Reference AEC) × 100</div>
      <p class="formula-note">
        Reference AEC ≈ 274 kWh/yr for a 400L frost-free refrigerator-freezer at 24°C ambient
        (IEC 62552-3:2015, 300L fresh + 100L frozen compartment).
        <strong>Lower EEI = more stringent MEPS.</strong>
      </p>
    </div>

    <table class="data-table">
      <thead>
        <tr><th>National Metric</th><th>Countries</th><th>Conversion to EEI</th></tr>
      </thead>
      <tbody>
        <tr><td>EEI (direct)</td><td>EU, SADC, EAC, Australia</td><td>× 1.0 (direct)</td></tr>
        <tr><td>kWh/yr (400L ref.)</td><td>USA, India, Japan, South Korea</td><td>÷ 2.74</td></tr>
        <tr><td>TEEI (%)</td><td>China</td><td>≈ TEEI × 1.0 (approximately equivalent)</td></tr>
        <tr><td>kWh/month</td><td>Brazil</td><td>× 12 ÷ 2.74</td></tr>
      </tbody>
    </table>
  </section>

  <!-- Section 4: U4E Reference Lines -->
  <section class="meth-section" id="u4e-references">
    <h2><i class="fa-solid fa-ruler-horizontal"></i> U4E Reference Lines</h2>
    <p>
      Three horizontal reference lines are shown on both the AC and Refrigerator charts, derived from
      the <strong>UNEP United for Efficiency (U4E) Model Regulations</strong>. These benchmarks
      represent globally applicable efficiency tiers that countries can adopt as a starting point
      for their own MEPS.
    </p>

    <h3>Air Conditioners — U4E Model Regulation for Room Air Conditioners</h3>
    <p>Source: <em>U4E Model Regulation Guidelines for Super-Efficient Room Air Conditioners</em>, Table 5 + Annex 2 Table 14.</p>
    <table class="data-table">
      <thead>
        <tr><th>Tier</th><th>CSPF Value</th><th>Line Style</th><th>U4E Basis</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Minimum MEPS</td>
          <td><strong>CSPF 5.1</strong></td>
          <td><span class="line-preview ref"></span> Grey dashed</td>
          <td>Group 1 (hot/humid), 4.5–9.5 kW capacity, Table 5</td>
        </tr>
        <tr>
          <td>High Efficiency Label</td>
          <td><strong>CSPF 6.5</strong></td>
          <td><span class="line-preview intermediate"></span> Amber dashed</td>
          <td>Group 2 (extremely hot-dry), Annex 2 Table 14</td>
        </tr>
        <tr>
          <td>Global Cooling Prize</td>
          <td><strong>CSPF 8.75</strong></td>
          <td><span class="line-preview gcp"></span> Green dotted</td>
          <td>GCP target; beyond current U4E tiers</td>
        </tr>
      </tbody>
    </table>

    <h3>Refrigerators — U4E Model Regulation for Refrigerating Appliances</h3>
    <p>
      Source: <em>U4E Model Regulation for Refrigerating Appliances</em>, Table 2 + Table 8.
      The U4E formula for frost-free refrigerator-freezers at 24°C is:
    </p>
    <div class="formula-card">
      <div class="formula">AEC<sub>max</sub> = 0.222 × AV + 161 &nbsp;&nbsp;[kWh/yr]</div>
      <p class="formula-note">
        AV = adjusted volume (L). Reference 400L combo: AV = 531 L →
        AEC<sub>max</sub> = 0.222 × 531 + 161 = 279 kWh/yr → EEI = 279 ÷ 274 × 100 = <strong>102</strong>.
      </p>
    </div>
    <table class="data-table">
      <thead>
        <tr><th>Tier</th><th>R-factor</th><th>AEC (400L ref.)</th><th>EEI</th><th>Line Style</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Minimum MEPS (R≥1.0)</td>
          <td>R ≥ 1.0</td>
          <td>279 kWh/yr</td>
          <td><strong>EEI 102</strong></td>
          <td><span class="line-preview ref"></span> Grey dashed</td>
        </tr>
        <tr>
          <td>Intermediate (R≥1.25)</td>
          <td>R ≥ 1.25</td>
          <td>223 kWh/yr</td>
          <td><strong>EEI 81</strong></td>
          <td><span class="line-preview intermediate"></span> Amber dashed</td>
        </tr>
        <tr>
          <td>High Efficiency (R≥1.50)</td>
          <td>R ≥ 1.50</td>
          <td>186 kWh/yr</td>
          <td><strong>EEI 68</strong></td>
          <td><span class="line-preview gcp"></span> Green dotted</td>
        </tr>
      </tbody>
    </table>
    <div class="callout-info">
      <i class="fa-solid fa-calculator"></i>
      <div>
        <strong>How EEI tiers are derived:</strong>
        Each tier corresponds to a minimum performance ratio R = AEC<sub>max</sub> / AEC<sub>actual</sub>.
        A higher R means the appliance must beat the formula threshold by a larger margin.
        EEI = (AEC<sub>max for that tier</sub> ÷ 274) × 100, where AEC<sub>max for tier</sub> = AEC<sub>max(R≥1.0)</sub> ÷ R.
      </div>
    </div>

    <!-- U4E Country Savings Assessments box -->
    <a href="https://united4efficiency.org/countries/country-assessments/" target="_blank" rel="noopener noreferrer" class="u4e-cta">
      <div class="u4e-cta-logo">
        <img src="https://united4efficiency.org/wp-content/themes/u4e/images/logo.svg" alt="United for Efficiency (U4E)" />
      </div>
      <div class="u4e-cta-body">
        <div class="u4e-cta-label">Go further with U4E</div>
        <h3>Country Savings Assessments</h3>
        <p>
          U4E has quantified the financial, energy, and emissions savings that 156 developing countries
          and emerging economies could achieve by adopting MEPS for key appliances — including
          <strong>room air conditioners</strong> and <strong>refrigerators</strong>.
          Each country report shows projected reductions in electricity consumption, CO₂ emissions,
          and consumer bills under a MEPS implementation scenario.
          Regional assessments are also available for ASEAN, East Africa, SADC, West Africa, and more.
        </p>
        <span class="u4e-cta-link">
          Explore country reports <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </span>
      </div>
    </a>
  </section>

  <!-- Section 5: Adopted vs Effective -->
  <section class="meth-section" id="timeline">
    <h2><i class="fa-solid fa-calendar-check"></i> Adopted vs. Effective</h2>
    <p>
      The chart distinguishes two types of data points:
    </p>
    <div class="timeline-legend">
      <div class="legend-item">
        <span class="line-demo solid"></span>
        <div>
          <strong>Currently Effective</strong> — the MEPS value applies to products sold today.
          Solid line.
        </div>
      </div>
      <div class="legend-item">
        <span class="line-demo dashed"></span>
        <div>
          <strong>Adopted — future effective date</strong> — a formal regulatory decision exists
          but the requirement has not yet come into force, or applies to a future compliance
          schedule. Dashed line.
        </div>
      </div>
    </div>
    <p>
      Only officially adopted or effective standards are included. Aspirational targets, roadmaps,
      and policy proposals that have not been legislated are excluded.
    </p>
  </section>

  <!-- Section 6: Data Sources -->
  <section class="meth-section" id="sources">
    <h2><i class="fa-solid fa-database"></i> Data Sources</h2>

    <div class="source-block">
      <div class="source-header">
        <img src="/images/clasp-logo.png" alt="CLASP" class="source-logo" />
        <div>
          <h3>CLASP Policy Resource Center (CPRC)</h3>
          <a href="https://cprc-clasp.ngo/" target="_blank" rel="noopener noreferrer">
            cprc-clasp.ngo <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
      <p>Primary source for national MEPS values, effective dates, and standard version names across all countries and appliance types. Data updated annually.</p>
    </div>

    <div class="source-block">
      <div class="source-header">
        <div>
          <h3>UNEP United for Efficiency (U4E)</h3>
          <a href="https://united4efficiency.org" target="_blank" rel="noopener noreferrer">
            united4efficiency.org <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
      <p>Model Regulation Guidelines for Room Air Conditioners and Refrigerating Appliances. Source for all three U4E reference tier values (minimum MEPS, intermediate, high efficiency).</p>
    </div>

    <div class="source-block">
      <div class="source-header">
        <img src="/images/iea-logo.png" alt="IEA" class="source-logo" />
        <div>
          <h3>IEA Policies and Measures Database</h3>
          <a href="https://www.iea.org/policies" target="_blank" rel="noopener noreferrer">
            iea.org/policies <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
      <p>Used for cross-validation of adoption dates and standard versions for key markets.</p>
    </div>

    <div class="source-block">
      <div class="source-header">
        <div>
          <h3>Lawrence Berkeley National Laboratory (LBNL)</h3>
          <a href="https://eta-publications.lbl.gov" target="_blank" rel="noopener noreferrer">
            eta-publications.lbl.gov <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
      <p>Metric conversion factors and efficiency harmonization methodology. Cross-country stringency comparison approach developed in collaboration with CLASP and LBNL.</p>
    </div>
  </section>

  <!-- Section 7: Limitations -->
  <section class="meth-section" id="limitations">
    <h2><i class="fa-solid fa-triangle-exclamation"></i> Limitations</h2>
    <ul class="limit-list">
      <li>
        <strong>Conversion approximations:</strong> CSPF and EEI conversions are approximate.
        National test standards use different climate profiles, operating conditions, and capacity
        definitions. Residual differences of ±5–10% are possible after conversion.
      </li>
      <li>
        <strong>Capacity class:</strong> MEPS often vary by capacity class within a country.
        The chart shows a single representative value (dominant residential class). Some country
        lines may not reflect the full regulatory picture.
      </li>
      <li>
        <strong>U4E reference tiers:</strong> U4E tiers are based on a 400L frost-free
        refrigerator-freezer at 24°C ambient and Group 1 (hot/humid) AC conditions.
        Performance at other product sizes or climate groups will differ.
      </li>
      <li>
        <strong>Projected lines:</strong> Dashed lines for future-dated regulations reflect
        officially adopted standards. Projected values are not forecasts — they show what
        governments have already committed to, not what may happen.
      </li>
      <li>
        <strong>Fan comparability:</strong> No universal fan metric exists. Fan data is shown
        in national units and is not comparable across countries.
      </li>
      <li>
        <strong>Country coverage:</strong> Not all countries have adopted explicit MEPS. Countries
        without adopted standards are excluded from the chart.
      </li>
    </ul>
  </section>

  <footer class="meth-footer">
    <p>
      <strong>CoolProgress</strong> is developed by
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
      in partnership with CLASP, IEA, UNEP U4E, and LBNL.
    </p>
    <p class="meth-version">Chart methodology v1.0 · April 2026</p>
  </footer>

</div>

<style>
  .methodology-page {
    max-width: 860px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    font-family: inherit;
    color: #1e293b;
    line-height: 1.6;
  }

  /* Header */
  .nav-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .meth-header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .meth-eyebrow {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #3D6B6B;
    margin-bottom: 0.4rem;
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
    font-size: 1.8rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 0.5rem;
    color: #0f172a;
  }

  .meth-subtitle {
    font-size: 0.95rem;
    color: #475569;
    max-width: 620px;
    margin: 0;
    line-height: 1.6;
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

  /* TOC */
  .toc-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 2rem;
  }

  .toc-card h2 {
    font-size: 0.8rem;
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

  .toc-card li { margin-bottom: 0.3rem; }

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
    padding-bottom: 2rem;
    border-bottom: 1px solid #e2e8f0;
    scroll-margin-top: 2rem;
  }

  .meth-section:last-of-type { border-bottom: none; }

  .meth-section h2 {
    font-size: 1.2rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .meth-section h2 i { color: #3D6B6B; }

  .meth-section h3 {
    font-size: 0.95rem;
    font-weight: 700;
    color: #334155;
    margin: 1.25rem 0 0.5rem;
  }

  .meth-section p {
    font-size: 0.9rem;
    color: #334155;
    margin: 0 0 0.75rem;
  }

  /* Concept grid */
  .concept-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1rem 0;
  }

  .concept-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1rem;
  }

  .concept-icon {
    font-size: 1.2rem;
    color: #3D6B6B;
    margin-bottom: 0.4rem;
  }

  .concept-card h3 {
    font-size: 0.88rem;
    font-weight: 700;
    margin: 0 0 0.3rem;
    color: #0f172a;
  }

  .concept-card p {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }

  /* Formula */
  .formula-card {
    background: linear-gradient(135deg, #0d3b4f, #1a6b5a);
    color: #fff;
    padding: 1.1rem 1.4rem;
    border-radius: 10px;
    margin: 1rem 0;
    text-align: center;
  }

  .formula {
    font-size: 1.05rem;
    font-weight: 700;
    font-family: 'Fira Code', 'Courier New', monospace;
    margin-bottom: 0.4rem;
  }

  .formula sub { font-size: 0.7em; }

  .formula-note {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.75);
    margin: 0;
  }

  /* Data table */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
    margin: 0.75rem 0;
  }

  .data-table th {
    background: #f1f5f9;
    padding: 0.45rem 0.7rem;
    text-align: left;
    font-weight: 700;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }

  .data-table td {
    padding: 0.45rem 0.7rem;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    vertical-align: middle;
  }

  .data-table tr:last-child td { border-bottom: none; }

  /* Callout */
  .callout-info {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-left: 4px solid #0ea5e9;
    border-radius: 8px;
    padding: 0.8rem 1rem;
    margin: 0.75rem 0;
    font-size: 0.83rem;
    color: #0c4a6e;
    line-height: 1.5;
  }

  .callout-info i {
    color: #0ea5e9;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .callout-info div { margin: 0; }

  /* Line preview chips */
  .line-preview {
    display: inline-block;
    width: 28px;
    height: 0;
    vertical-align: middle;
    margin-right: 2px;
  }

  .line-preview.ref { border-top: 2px dashed #94a3b8; }
  .line-preview.intermediate { border-top: 2px dashed #F59E0B; }
  .line-preview.gcp { border-top: 2px dotted #52B788; }

  /* Timeline legend */
  .timeline-legend {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 1rem 0;
  }

  .legend-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.88rem;
    color: #334155;
  }

  .line-demo {
    flex-shrink: 0;
    display: inline-block;
    width: 32px;
    height: 0;
    margin-top: 0.55rem;
  }

  .line-demo.solid { border-top: 2.5px solid #334155; }
  .line-demo.dashed { border-top: 2px dashed #94a3b8; }

  /* U4E CTA box */
  .u4e-cta {
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
    margin-top: 1.5rem;
    padding: 1.25rem 1.4rem;
    background: linear-gradient(135deg, #f0fdf9, #e8f4ff);
    border: 1.5px solid #a7f3d0;
    border-left: 4px solid #0d9488;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: box-shadow 0.2s, transform 0.15s;
  }

  .u4e-cta:hover {
    box-shadow: 0 6px 18px rgba(13, 148, 136, 0.12);
    transform: translateY(-1px);
  }

  .u4e-cta-logo {
    flex-shrink: 0;
    width: 72px;
    display: flex;
    align-items: flex-start;
    padding-top: 0.2rem;
  }

  .u4e-cta-logo img {
    width: 100%;
    height: auto;
    object-fit: contain;
    filter: saturate(0.9);
  }

  .u4e-cta-body {
    min-width: 0;
  }

  .u4e-cta-label {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #0d9488;
    margin-bottom: 0.2rem;
  }

  .u4e-cta h3 {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 0.4rem;
  }

  .u4e-cta p {
    font-size: 0.84rem;
    color: #334155;
    margin: 0 0 0.6rem;
    line-height: 1.6;
  }

  .u4e-cta-link {
    font-size: 0.8rem;
    font-weight: 700;
    color: #0d9488;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  /* Source blocks */
  .source-block {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1.1rem 1.25rem;
    margin-bottom: 1rem;
  }

  .source-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.6rem;
    padding-bottom: 0.6rem;
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
    margin: 0 0 0.1rem;
    color: #0f172a;
  }

  .source-header a {
    font-size: 0.75rem;
    color: #0369a1;
    text-decoration: none;
  }

  .source-block p {
    font-size: 0.85rem;
    color: #475569;
    margin: 0;
    line-height: 1.6;
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
    margin: 0 0 0.4rem;
  }

  .meth-footer a {
    color: #3D6B6B;
    text-decoration: none;
    font-weight: 600;
  }

  .meth-version {
    font-size: 0.72rem;
    color: #aaa;
  }

  @media (max-width: 640px) {
    .concept-grid { grid-template-columns: 1fr; }
    .meth-header h1 { font-size: 1.4rem; }
  }
</style>

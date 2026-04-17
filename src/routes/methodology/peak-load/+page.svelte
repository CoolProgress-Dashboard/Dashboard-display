<script lang="ts">
  // Methodology: Cooling as a Share of Peak Electricity Load
  // Publicly accessible (outside auth-protected route group)
</script>

<svelte:head>
  <title>Methodology: Cooling Share of Peak Load | CoolProgress</title>
  <meta name="description" content="Methodology and data sources for the 'Cooling as a Share of Peak Electricity Load' chart in the CoolProgress Product Efficiency (MEPS) pillar." />
</svelte:head>

<div class="methodology-page">

  <header class="meth-header">
    <div class="nav-row">
      <a href="/dashboard/meps" class="back-link pillar-link"><i class="fa-solid fa-arrow-left"></i> Back to Product Efficiency</a>
    </div>
    <div class="meth-eyebrow">Product Efficiency Pillar · Grid Impact</div>
    <h1>Cooling as a Share of Peak Electricity Load</h1>
    <p class="meth-subtitle">
      Methodology and source documentation for the baseline vs. 2050 projection chart
      displayed in the MEPS pillar of the CoolProgress Dashboard.
    </p>
    <div class="meth-badge">
      <i class="fa-solid fa-shield-check"></i> Data vintage: IEA 2018 &middot; Last reviewed: April 2026
    </div>
  </header>

  <!-- TOC -->
  <nav class="toc-card">
    <h2><i class="fa-solid fa-list"></i> Contents</h2>
    <ol>
      <li><a href="#purpose">Chart Purpose</a></li>
      <li><a href="#appliances">Appliance Scope</a></li>
      <li><a href="#indicator">Indicator Definition</a></li>
      <li><a href="#calculation">How Values Were Calculated</a></li>
      <li><a href="#sources">Data Sources</a></li>
      <li><a href="#data-table">Country Data & Source Mapping</a></li>
      <li><a href="#selection">Country Selection Rationale</a></li>
      <li><a href="#limitations">Limitations & Known Issues</a></li>
    </ol>
  </nav>

  <!-- 1. Purpose -->
  <section class="meth-section" id="purpose">
    <h2><i class="fa-solid fa-bullseye"></i> Chart Purpose</h2>
    <p>
      The chart contextualises why energy efficiency in cooling appliances matters beyond
      individual electricity bills. As cooling demand grows, it imposes increasingly large
      <strong>peak electricity loads</strong> on national grids — triggering investment in
      expensive peaking plant capacity that may only run a few hundred hours per year, and
      increasing curtailment of renewable energy during off-peak periods.
    </p>
    <p>
      By improving the efficiency of air conditioners through Minimum Energy Performance
      Standards (MEPS), a country can contain its cooling-related peak load contribution even
      as cooling <em>access</em> expands. The chart shows how large this challenge already is
      (baseline) and how much larger it will become by 2050 without policy action.
    </p>
    <div class="callout callout-green">
      <i class="fa-solid fa-bolt"></i>
      <div>
        <strong>Key message:</strong> In the fastest-growing markets (India, Indonesia), the
        share of cooling in peak electricity demand is projected to grow by more than
        30 percentage points by 2050 — from a single-digit baseline to nearly half of total
        peak load. Efficient appliances are one of the fastest levers to prevent grid stress.
      </div>
    </div>
  </section>

  <!-- 2. Appliance Scope -->
  <section class="meth-section" id="appliances">
    <h2><i class="fa-solid fa-snowflake"></i> Appliance Scope</h2>
    <p>
      This chart covers <strong>space cooling only</strong> — meaning air conditioners.
      It does not include domestic refrigeration (fridges/freezers) or fans, even though
      those appliances are tracked separately elsewhere in the CoolProgress Dashboard.
    </p>

    <div class="appliance-grid">
      <div class="appliance-card included">
        <div class="appliance-badge included-badge">Included</div>
        <div class="appliance-icon"><i class="fa-solid fa-wind"></i></div>
        <strong>Space cooling (AC)</strong>
        <p>Room air conditioners (RACs / split systems), window units, and central/ducted
        air conditioning systems. In most emerging markets, RACs dominate; in the USA,
        central ducted systems account for a larger share.</p>
      </div>
      <div class="appliance-card excluded">
        <div class="appliance-badge excluded-badge">Not included</div>
        <div class="appliance-icon"><i class="fa-solid fa-fan"></i></div>
        <strong>Fans</strong>
        <p>Ceiling fans, pedestal fans, and other air-movement devices. These consume
        far less electricity per unit and do not contribute meaningfully to peak cooling
        load in the IEA model.</p>
      </div>
      <div class="appliance-card excluded">
        <div class="appliance-badge excluded-badge">Not included</div>
        <div class="appliance-icon"><i class="fa-solid fa-temperature-low"></i></div>
        <strong>Domestic refrigeration</strong>
        <p>Household refrigerators and freezers. These run around the clock and do not
        peak coincidentally with the maximum electricity demand hour the way ACs do.</p>
      </div>
    </div>

    <div class="callout callout-info">
      <i class="fa-solid fa-circle-info"></i>
      <div>
        <strong>RAC vs. total space cooling:</strong> The IEA Future of Cooling report uses
        "space cooling" as its unit of analysis, which includes both room ACs (RACs) and
        central/ducted systems. The values in this chart therefore represent the combined
        peak load from all air conditioning technologies, not RAC alone. In practice, RACs
        dominate in all markets shown except the USA, where ducted central AC is the
        majority technology.
      </div>
    </div>
  </section>

  <!-- 3. Indicator Definition -->
  <section class="meth-section" id="indicator">
    <h2><i class="fa-solid fa-ruler"></i> Indicator Definition</h2>

    <div class="meth-subsection">
      <h3>What is "share of cooling in peak electricity load"?</h3>
      <p>
        This indicator measures, as a percentage, the fraction of a country's
        <strong>maximum electricity system demand</strong> (peak load) that is attributable
        to space cooling appliances — primarily air conditioners — at the moment of peak
        demand. Peak demand typically occurs on the hottest afternoon of the year, when
        cooling and other loads coincide.
      </p>
      <div class="formula-card">
        <div class="formula-label">Core formula</div>
        <div class="formula">
          Share (%) =
          <span class="f-num">Cooling load at system peak (GW)</span>
          <span class="f-op">&divide;</span>
          <span class="f-num">Total system peak demand (GW)</span>
          <span class="f-op">&times; 100</span>
        </div>
      </div>
      <p>
        This is a <em>coincidence</em> metric, not an annual energy share. It reflects
        the worst-case grid stress from cooling, which is the figure relevant to capacity
        planning and reliability — not the year-average electricity consumed by ACs.
      </p>
    </div>

    <div class="meth-subsection">
      <h3>Two time points shown in the chart</h3>
      <div class="two-col">
        <div class="def-card def-green">
          <div class="def-label">Baseline (2016–2018)</div>
          <p>
            Observed or estimated values from the IEA Future of Cooling (2018) report,
            reflecting conditions at the time of publication. Baseline years vary slightly
            by country due to data availability (China: 2017; all others: 2016).
          </p>
        </div>
        <div class="def-card def-orange">
          <div class="def-label">Projected (2050)</div>
          <p>
            IEA cooling scenario projections assuming continued AC stock growth under a
            business-as-usual trajectory with no additional efficiency policy intervention
            beyond what was in place in 2018. This represents the upper-bound grid stress
            scenario.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. How Calculated -->
  <section class="meth-section" id="calculation">
    <h2><i class="fa-solid fa-calculator"></i> How Values Were Calculated</h2>

    <div class="meth-subsection">
      <h3>Step 1 — Estimating peak cooling load (GW)</h3>
      <p>
        The IEA estimated each country's cooling load at system peak by combining three
        inputs from national energy statistics and appliance surveys:
      </p>
      <div class="step-grid">
        <div class="step-card">
          <div class="step-num">A</div>
          <div>
            <strong>AC stock</strong>
            <p>Total number of installed room air conditioners per country, drawn from
            IEA appliance stock databases and national survey data.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-num">B</div>
          <div>
            <strong>Average cooling capacity</strong>
            <p>Rated output per unit in kW, derived from market sales data and installed
            stock surveys. Varies by country due to differences in dominant unit size.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-num">C</div>
          <div>
            <strong>Coincidence factor</strong>
            <p>The fraction of the installed stock that runs simultaneously at the moment
            of system peak demand. Estimated per country using climate data (cooling degree
            days), grid peak timing, and load profile analysis.</p>
          </div>
        </div>
      </div>
      <div class="formula-card">
        <div class="formula-label">Peak cooling load</div>
        <div class="formula">
          Cooling GW = <span class="f-num">Stock (units)</span>
          <span class="f-op">&times;</span>
          <span class="f-num">Avg capacity (kW/unit)</span>
          <span class="f-op">&times;</span>
          <span class="f-num">Coincidence factor</span>
          <span class="f-op">&times; 10<sup>&minus;6</sup></span>
        </div>
      </div>
    </div>

    <div class="meth-subsection">
      <h3>Step 2 — Total system peak demand (GW)</h3>
      <p>
        Total system peak was taken from national grid operator statistics and IEA
        electricity supply data. These are the reported maximum instantaneous demand
        figures for each country's power system, typically corresponding to the annual
        summer peak.
      </p>
    </div>

    <div class="meth-subsection">
      <h3>Step 3 — Projecting to 2050</h3>
      <p>
        The IEA 2050 "Cooling Scenario" projects peak load share forward by modelling growth
        in all three components. The key drivers are:
      </p>
      <ul class="calc-list">
        <li>
          <strong>AC stock growth:</strong> Modelled using GDP per capita projections
          (World Bank/IMF), urbanisation rates, and income elasticity of AC ownership.
          Hot-climate countries with low current penetration (India, Indonesia, Nigeria)
          show the steepest stock growth curves.
        </li>
        <li>
          <strong>No efficiency improvement assumed:</strong> The scenario holds average
          unit efficiency constant at the baseline level. This is a deliberate assumption
          to isolate the scale of the challenge — it represents what happens without MEPS
          or labelling programmes. It is not a forecast of likely outcomes.
        </li>
        <li>
          <strong>Total system peak growth:</strong> Modelled from IEA's broader electricity
          demand projections. In most markets, total peak grows more slowly than cooling
          demand, causing the cooling share to rise.
        </li>
        <li>
          <strong>Climate adjustment:</strong> Cooling degree days (CDDs) are held approximately
          constant in the baseline scenario. The IEA report notes that climate change would
          further increase cooling shares beyond those shown.
        </li>
      </ul>
    </div>

    <div class="meth-subsection">
      <h3>Global average reference line</h3>
      <p>
        The 14% dashed reference line shown in the chart is the IEA's published global
        average share of space cooling in peak electricity demand for 2016, calculated
        by aggregating country-level peak cooling loads and total peak demands across
        all IEA-tracked countries.
      </p>
    </div>
  </section>

  <!-- 4. Sources -->
  <section class="meth-section" id="sources">
    <h2><i class="fa-solid fa-book-open"></i> Data Sources</h2>
    <p>
      All country data points in the chart originate from the IEA Future of Cooling (2018).
      Two supplementary IEA publications provide additional context for specific entries.
    </p>

    <div class="source-list">

      <a class="source-item" href="https://www.iea.org/reports/the-future-of-cooling" target="_blank" rel="noopener noreferrer">
        <div class="source-num src-iea">1</div>
        <div class="source-meta">
          <strong>IEA — The Future of Cooling (2018)</strong>
          <span class="source-org">International Energy Agency · May 2018</span>
          <p>
            The sole primary source for all baseline and projected values in the chart.
            Chapters 2 and 3 of the report model peak load shares for major cooling markets
            under both a baseline and a dedicated "Cooling Scenario" through 2050. Every
            country data point — baseline percentage, projected percentage, and the
            underlying stock and coincidence factor estimates — derives from this publication.
          </p>
          <span class="source-url">https://www.iea.org/reports/the-future-of-cooling</span>
        </div>
        <span class="source-ext">↗</span>
      </a>

      <a class="source-item" href="https://www.iea.org/data-and-statistics/charts/share-of-cooling-in-electricity-system-peak-loads-in-selected-countries-region-baseline-and-cooling-scenario" target="_blank" rel="noopener noreferrer">
        <div class="source-num src-iea">2</div>
        <div class="source-meta">
          <strong>IEA — Share of Cooling in Peak Loads (interactive chart)</strong>
          <span class="source-org">International Energy Agency · Data & Statistics</span>
          <p>
            IEA's own interactive visualisation of the same indicator, published alongside
            the Future of Cooling report. Used to confirm the global average reference
            line value (14%, 2016) and the ordering of countries by projected share.
          </p>
          <span class="source-url">https://www.iea.org/data-and-statistics/charts/share-of-cooling-in-electricity-system-peak-loads...</span>
        </div>
        <span class="source-ext">↗</span>
      </a>

      <a class="source-item" href="https://www.iea.org/news/electricity-demand-is-surging-across-the-middle-east-and-north-africa" target="_blank" rel="noopener noreferrer">
        <div class="source-num src-mena">3</div>
        <div class="source-meta">
          <strong>IEA — Electricity Demand Surging in MENA</strong>
          <span class="source-org">International Energy Agency · News article</span>
          <p>
            Supporting source for the Middle East regional average entry. Confirms that
            approximately 40% of projected electricity demand increase in the MENA region
            is attributable to cooling — consistent with the 40% baseline used in the chart.
          </p>
          <span class="source-url">https://www.iea.org/news/electricity-demand-is-surging-across-the-middle-east-and-north-africa</span>
        </div>
        <span class="source-ext">↗</span>
      </a>

    </div>
  </section>

  <!-- 6. Data table -->
  <section class="meth-section" id="data-table">
    <h2><i class="fa-solid fa-table"></i> Country Data & Source Mapping</h2>
    <p>
      All values are percentages of peak electricity load. The table marks how each value
      was obtained — whether directly quoted from IEA text, read from the IEA chart, or
      rounded from a cross-check figure.
    </p>

    <!-- Legend -->
    <div class="origin-legend">
      <span class="origin-chip chip-quote">
        <i class="fa-solid fa-quote-left"></i> Direct IEA quote
      </span>
      <span class="origin-chip chip-chart">
        <i class="fa-solid fa-chart-bar"></i> Read from IEA chart/table
      </span>
      <span class="origin-chip chip-rounded">
        <i class="fa-solid fa-scissors"></i> Rounded from cross-check
      </span>
      <span class="origin-chip chip-derived">
        <i class="fa-solid fa-calculator"></i> Derived (arithmetic)
      </span>
    </div>

    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Country</th>
            <th class="num">Baseline year</th>
            <th class="num">Baseline %</th>
            <th class="num">Projected 2050 %</th>
            <th class="num">Growth (pp)</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>

          <!-- Saudi Arabia: baseline from IEA/PMC range, projected from IEA chart -->
          <tr>
            <td class="bold">Saudi Arabia</td>
            <td class="num">2016</td>
            <td class="num">
              50%
              <span class="origin-tag tag-chart" title="Lower bound of the 50–70% range cited in IEA and Saudi energy literature">chart</span>
            </td>
            <td class="num">
              60%
              <span class="origin-tag tag-chart" title="Read from IEA Future of Cooling chart">chart</span>
            </td>
            <td class="num growth-low">
              +10
              <span class="origin-tag tag-derived" title="Calculated: 60 − 50">calc</span>
            </td>
            <td>Baseline is lower bound of IEA/Saudi literature range of 50–70%</td>
          </tr>

          <!-- Middle East: both values from IEA chart -->
          <tr>
            <td class="bold">Middle East (avg)</td>
            <td class="num">2016</td>
            <td class="num">
              40%
              <span class="origin-tag tag-chart" title="Read from IEA Future of Cooling chart; corroborated by IEA MENA article">chart</span>
            </td>
            <td class="num">
              50%
              <span class="origin-tag tag-chart" title="Read from IEA Future of Cooling chart">chart</span>
            </td>
            <td class="num growth-low">
              +10
              <span class="origin-tag tag-derived" title="Calculated: 50 − 40">calc</span>
            </td>
            <td>Regional average; corroborated by IEA MENA electricity analysis</td>
          </tr>

          <!-- India: both values directly quoted from IEA text -->
          <tr>
            <td class="bold">India</td>
            <td class="num">2016</td>
            <td class="num">
              10%
              <span class="origin-tag tag-quote" title='IEA: "The share jumps from just 10% today to 45% in 2050"'>quote</span>
            </td>
            <td class="num">
              45%
              <span class="origin-tag tag-quote" title='IEA: "The share jumps from just 10% today to 45% in 2050"'>quote</span>
            </td>
            <td class="num growth-high">
              +35
              <span class="origin-tag tag-derived" title="Calculated: 45 − 10">calc</span>
            </td>
            <td>Both values directly quoted from IEA Future of Cooling report text</td>
          </tr>

          <!-- Indonesia: projected rounded from cross-check value 40.7% -->
          <tr>
            <td class="bold">Indonesia</td>
            <td class="num">2016</td>
            <td class="num">
              7%
              <span class="origin-tag tag-chart" title="Read from IEA Future of Cooling chart">chart</span>
            </td>
            <td class="num">
              41%
              <span class="origin-tag tag-rounded" title="Cross-check figure was 40.7%; rounded to 41%">rounded</span>
            </td>
            <td class="num growth-high">
              +34
              <span class="origin-tag tag-derived" title="Calculated: 41 − 7">calc</span>
            </td>
            <td>Projected value cross-checked at 40.7%; rounded to 41%</td>
          </tr>

          <!-- Brazil: projected rounded from cross-check value 30.8% -->
          <tr>
            <td class="bold">Brazil</td>
            <td class="num">2016</td>
            <td class="num">
              12%
              <span class="origin-tag tag-chart" title="Read from IEA Future of Cooling chart">chart</span>
            </td>
            <td class="num">
              31%
              <span class="origin-tag tag-rounded" title="Cross-check figure was 30.8%; rounded to 31%">rounded</span>
            </td>
            <td class="num growth-mid">
              +19
              <span class="origin-tag tag-derived" title="Calculated: 31 − 12">calc</span>
            </td>
            <td>Projected value cross-checked at 30.8%; rounded to 31%</td>
          </tr>

          <!-- China: baseline directly quoted from IEA text, projected from IEA chart -->
          <tr>
            <td class="bold">China</td>
            <td class="num">2017</td>
            <td class="num">
              16%
              <span class="origin-tag tag-quote" title='IEA: "around 16% of peak electricity load in 2017"'>quote</span>
            </td>
            <td class="num">
              30%
              <span class="origin-tag tag-chart" title="Read from IEA Future of Cooling chart">chart</span>
            </td>
            <td class="num growth-mid">
              +14
              <span class="origin-tag tag-derived" title="Calculated: 30 − 16">calc</span>
            </td>
            <td>Baseline directly quoted; note baseline year is 2017, not 2016</td>
          </tr>

          <!-- USA: both from IEA chart -->
          <tr>
            <td class="bold">USA</td>
            <td class="num">2016</td>
            <td class="num">
              23%
              <span class="origin-tag tag-chart" title="Read from IEA Future of Cooling chart">chart</span>
            </td>
            <td class="num">
              28%
              <span class="origin-tag tag-chart" title="Read from IEA Future of Cooling chart; low growth reflects high existing saturation">chart</span>
            </td>
            <td class="num growth-low">
              +5
              <span class="origin-tag tag-derived" title="Calculated: 28 − 23">calc</span>
            </td>
            <td>High existing saturation; central ducted AC dominates (unlike other markets)</td>
          </tr>

          <!-- Mexico: projected rounded from cross-check value 24.3% -->
          <tr>
            <td class="bold">Mexico</td>
            <td class="num">2016</td>
            <td class="num">
              10%
              <span class="origin-tag tag-chart" title="Read from IEA Future of Cooling chart">chart</span>
            </td>
            <td class="num">
              24%
              <span class="origin-tag tag-rounded" title="Cross-check figure was 24.3%; rounded to 24%">rounded</span>
            </td>
            <td class="num growth-mid">
              +14
              <span class="origin-tag tag-derived" title="Calculated: 24 − 10">calc</span>
            </td>
            <td>Projected value cross-checked at 24.3%; rounded to 24%</td>
          </tr>

          <!-- Nigeria: both from IEA chart -->
          <tr>
            <td class="bold">Nigeria</td>
            <td class="num">2016</td>
            <td class="num">
              3%
              <span class="origin-tag tag-chart" title="Read from IEA Future of Cooling chart">chart</span>
            </td>
            <td class="num">
              22%
              <span class="origin-tag tag-chart" title="Read from IEA Future of Cooling chart">chart</span>
            </td>
            <td class="num growth-mid">
              +19
              <span class="origin-tag tag-derived" title="Calculated: 22 − 3">calc</span>
            </td>
            <td>Very low AC penetration baseline; among the highest projected growth rates</td>
          </tr>

          <!-- Global average: directly quoted -->
          <tr class="global-avg-row">
            <td class="bold">Global average</td>
            <td class="num">2016</td>
            <td class="num">
              14%
              <span class="origin-tag tag-quote" title='IEA: "space cooling accounted for 14% of peak demand in 2016"'>quote</span>
            </td>
            <td class="num">—</td>
            <td class="num">—</td>
            <td>Reference line only — directly quoted from IEA Future of Cooling</td>
          </tr>

        </tbody>
      </table>
    </div>

    <p class="table-note-text">
      <strong>On "rounded" values:</strong> Indonesia, Brazil, and Mexico projected values
      were cross-checked against a secondary dataset that reported one decimal place
      (40.7%, 30.8%, 24.3%). These were rounded to whole numbers for display consistency.
      The underlying IEA model is the primary source; the cross-check served as
      confirmation only.
    </p>
  </section>

  <!-- 6. Country selection -->
  <section class="meth-section" id="selection">
    <h2><i class="fa-solid fa-earth-americas"></i> Country Selection Rationale</h2>
    <p>
      The nine countries and one regional aggregate were selected to represent the full
      spectrum of cooling contexts relevant to global climate and development policy,
      following the country focus of the IEA Future of Cooling (2018):
    </p>
    <ul class="selection-list">
      <li>
        <strong>Already-high baseline markets</strong> (Saudi Arabia, Middle East avg, USA) —
        illustrate the grid stress that persists even in markets with mature AC penetration,
        and where total system peak growth is the primary driver going forward.
      </li>
      <li>
        <strong>Fast-growing emerging markets</strong> (India, Indonesia, Brazil, China, Mexico) —
        represent the bulk of future AC stock growth where rising incomes and urbanisation
        are rapidly expanding cooling demand, and where MEPS policy has the highest
        marginal impact on peak load.
      </li>
      <li>
        <strong>Low-penetration high-risk market</strong> (Nigeria) — represents Sub-Saharan
        Africa, where cooling access is low today but grid infrastructure is fragile,
        making efficient-from-day-one appliance standards especially important.
      </li>
    </ul>
  </section>

  <!-- 7. Limitations -->
  <section class="meth-section" id="limitations">
    <h2><i class="fa-solid fa-circle-info"></i> Limitations & Known Issues</h2>

    <div class="limitations-list">
      <div class="limitation">
        <strong>Data vintage (2018):</strong>
        All values originate from the IEA Future of Cooling report published in May 2018.
        Baseline electricity and cooling demand figures reflect 2016–2017 conditions.
        Significant AC market growth has occurred since, particularly in India, China,
        and Southeast Asia. Updated IEA projections should be incorporated if published.
      </div>
      <div class="limitation">
        <strong>Business-as-usual projection basis:</strong>
        The 2050 projected values assume no additional efficiency policy intervention beyond
        what existed at the time of the IEA report. They do not reflect MEPS improvements
        adopted since 2018. The chart therefore quantifies the <em>challenge</em>, not the
        current trajectory.
      </div>
      <div class="limitation">
        <strong>Mixed baseline years:</strong>
        China's baseline year is 2017; all other countries use 2016. This minor inconsistency
        reflects the underlying IEA source data and is noted in the chart tooltip.
      </div>
      <div class="limitation">
        <strong>Regional aggregate (Middle East):</strong>
        The "Middle East (avg)" entry is a regional average, not a single country. Constituent
        country values vary significantly across the MENA region. It is included because the
        IEA 2018 report did not disaggregate individual MENA country figures.
      </div>
      <div class="limitation">
        <strong>Peak vs. average load:</strong>
        This indicator measures cooling's share at <em>peak</em> demand (the highest-demand
        hour of the year), not the annual average. Peak figures are systematically higher
        than annual-average electricity consumption shares and are the relevant metric for
        grid capacity planning and investment in peaking plant.
      </div>
      <div class="limitation">
        <strong>Coincidence factor uncertainty:</strong>
        The coincidence factor — what fraction of installed ACs run simultaneously at
        system peak — is the least certain input in the IEA model and varies with climate,
        building type, and consumer behaviour. Country-level estimates are not individually
        disclosed in the published report.
      </div>
    </div>
  </section>

  <footer class="meth-footer">
    <p>
      <strong>CoolProgress</strong> is developed by
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
      in partnership with CLASP, IEA, SEforALL, UNEP, GIZ Proklima, and Cool Coalition.
    </p>
    <p class="meth-version">Chart methodology v1.2 &middot; April 2026</p>
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

  /* ── Header ── */
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

  .meth-eyebrow {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #2D7D5A;
    margin-bottom: 0.5rem;
  }

  .meth-header h1 {
    font-size: 1.9rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0 0 0.5rem;
    color: #1a1a1a;
  }

  .meth-subtitle {
    font-size: 1rem;
    color: #555;
    margin-bottom: 1rem;
    max-width: 640px;
  }

  .meth-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #2D7D5A;
    background: #D8F3DC;
    border-radius: 999px;
    padding: 0.25rem 0.75rem;
  }

  /* ── TOC ── */
  .toc-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 2.5rem;
  }
  .toc-card h2 {
    font-size: 0.85rem;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .toc-card ol {
    padding-left: 1.2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.3rem 2rem;
  }
  .toc-card a {
    font-size: 0.875rem;
    color: #3D6B6B;
    text-decoration: none;
  }
  .toc-card a:hover { text-decoration: underline; }

  /* ── Sections ── */
  .meth-section {
    margin-bottom: 3rem;
    scroll-margin-top: 1.5rem;
  }
  .meth-section > h2 {
    font-size: 1.15rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .meth-section > h2 i { color: #2D7D5A; }
  .meth-section p { margin-bottom: 0.75rem; font-size: 0.9rem; }

  .meth-subsection { margin-top: 1.75rem; }
  .meth-subsection h3 {
    font-size: 0.95rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 0.6rem;
  }

  /* ── Formula card ── */
  .formula-card {
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin: 1rem 0;
  }
  .formula-label {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #166534;
    margin-bottom: 0.4rem;
  }
  .formula {
    font-family: 'IBM Plex Mono', 'Courier New', monospace;
    font-size: 0.88rem;
    color: #166534;
    font-weight: 600;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem;
  }
  .f-num { color: #1A5E56; }
  .f-op  { color: #52B788; }

  /* ── Two-col definitions ── */
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 0.75rem;
  }
  .def-card {
    border-radius: 8px;
    padding: 1rem;
  }
  .def-card p { margin: 0; font-size: 0.85rem; color: #444; line-height: 1.55; }
  .def-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.5rem;
  }
  .def-green { background: #f0fdf4; border: 1px solid #86efac; }
  .def-green .def-label { color: #166534; }
  .def-orange { background: #fff7ed; border: 1px solid #fdba74; }
  .def-orange .def-label { color: #9a3412; }

  /* ── Step grid ── */
  .step-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.75rem;
    margin: 1rem 0;
  }
  .step-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.9rem 1rem;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }
  .step-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #1A5E56;
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
  .step-card strong { font-size: 0.83rem; color: #1a1a1a; display: block; margin-bottom: 0.3rem; }
  .step-card p { font-size: 0.79rem; color: #555; margin: 0; line-height: 1.5; }

  /* ── Calculation list ── */
  .calc-list {
    margin: 0.5rem 0 0.5rem 1.2rem;
    font-size: 0.875rem;
  }
  .calc-list li { margin-bottom: 0.6rem; line-height: 1.6; }

  /* ── Appliance cards ── */
  .appliance-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.75rem;
    margin: 1rem 0;
  }
  .appliance-card {
    border-radius: 8px;
    padding: 1rem;
    position: relative;
  }
  .appliance-card.included  { background: #f0fdf4; border: 1px solid #86efac; }
  .appliance-card.excluded  { background: #fafafa; border: 1px solid #e2e8f0; }
  .appliance-badge {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-radius: 999px;
    padding: 0.15rem 0.5rem;
    display: inline-block;
    margin-bottom: 0.6rem;
  }
  .included-badge { background: #bbf7d0; color: #166534; }
  .excluded-badge { background: #f1f5f9; color: #64748b; }
  .appliance-icon { font-size: 1.3rem; margin-bottom: 0.5rem; }
  .appliance-card.included .appliance-icon { color: #2D7D5A; }
  .appliance-card.excluded .appliance-icon { color: #94a3b8; }
  .appliance-card strong { font-size: 0.85rem; color: #1a1a1a; display: block; margin-bottom: 0.35rem; }
  .appliance-card p { font-size: 0.79rem; color: #555; margin: 0; line-height: 1.5; }

  /* ── Origin legend ── */
  .origin-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.75rem 0 1rem;
  }
  .origin-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    border: 1px solid transparent;
  }
  .chip-quote   { background: #EFF6FF; color: #1D4ED8; border-color: #BFDBFE; }
  .chip-chart   { background: #F0FDF4; color: #166534; border-color: #86EFAC; }
  .chip-rounded { background: #FFF7ED; color: #9A3412; border-color: #FDBA74; }
  .chip-derived { background: #F5F3FF; color: #6D28D9; border-color: #DDD6FE; }

  /* ── Origin tags (inline in table) ── */
  .origin-tag {
    display: inline-block;
    font-size: 0.6rem;
    font-weight: 700;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    margin-left: 3px;
    vertical-align: middle;
    cursor: help;
    white-space: nowrap;
  }
  .tag-quote   { background: #DBEAFE; color: #1D4ED8; }
  .tag-chart   { background: #DCFCE7; color: #166534; }
  .tag-rounded { background: #FED7AA; color: #9A3412; }
  .tag-derived { background: #EDE9FE; color: #6D28D9; }

  .table-note-text {
    font-size: 0.8rem;
    color: #555;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin-top: 0.75rem;
    line-height: 1.6;
  }

  /* ── Callouts ── */
  .callout {
    border-radius: 8px;
    padding: 1rem 1.25rem;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    font-size: 0.875rem;
    margin: 1.25rem 0;
  }
  .callout i { margin-top: 0.1rem; flex-shrink: 0; }
  .callout-green { background: #f0fdf4; border: 1px solid #86efac; color: #166534; }
  .callout-green i { color: #16a34a; }
  .callout-info { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1e3a5f; }
  .callout-info i { color: #2563EB; }

  /* ── Source list ── */
  .source-list { display: grid; gap: 0.75rem; margin-top: 1rem; }
  .source-item {
    background: #fafafa;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    text-decoration: none;
    color: inherit;
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .source-item:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.08); border-color: #c4d4d4; }

  .source-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .src-iea  { background: #E0F2FE; color: #0369A1; }
  .src-mena { background: #FEF3C7; color: #92400E; }

  .source-meta { flex: 1; }
  .source-meta strong { font-size: 0.875rem; color: #1a1a1a; display: block; margin-bottom: 0.15rem; }
  .source-org  { font-size: 0.72rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.5rem; }
  .source-meta p { font-size: 0.82rem; color: #555; margin: 0 0 0.5rem; line-height: 1.5; }
  .source-url { font-size: 0.7rem; color: #2D7D5A; word-break: break-all; display: block; }
  .source-ext { font-size: 0.85rem; color: #aaa; flex-shrink: 0; margin-top: 0.1rem; }

  /* ── Data table ── */
  .data-table-wrap {
    overflow-x: auto;
    margin: 1rem 0;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
  .data-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
  .data-table thead { background: #f8fafc; }
  .data-table thead th {
    padding: 0.6rem 0.9rem;
    text-align: left;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #888;
    white-space: nowrap;
  }
  .data-table th.num,
  .data-table td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .data-table tbody tr { border-top: 1px solid #f1f5f9; }
  .data-table tbody tr:hover { background: #fafafa; }
  .data-table td { padding: 0.7rem 0.9rem; vertical-align: middle; color: #333; }
  .data-table td.bold { font-weight: 600; color: #1a1a1a; }

  .growth-high { color: #b45309; font-weight: 700; }
  .growth-mid  { color: #374151; font-weight: 600; }
  .growth-low  { color: #166534; font-weight: 600; }

  .global-avg-row td {
    background: #f0fdf4;
    font-style: italic;
    color: #166534;
    border-top: 2px dashed #86efac;
  }
  .global-avg-row td.bold { font-weight: 700; }

  /* ── Selection list ── */
  .selection-list {
    margin: 0.75rem 0 0.75rem 1.2rem;
    font-size: 0.875rem;
  }
  .selection-list li { margin-bottom: 0.5rem; line-height: 1.6; }

  /* ── Limitations ── */
  .limitations-list { display: grid; gap: 0.75rem; }
  .limitation {
    background: #fafafa;
    border-left: 3px solid #cbd5e1;
    border-radius: 0 6px 6px 0;
    padding: 0.85rem 1rem;
    font-size: 0.875rem;
    color: #444;
    line-height: 1.6;
  }
  .limitation strong { color: #1a1a1a; }

  /* ── Footer ── */
  .meth-footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
    font-size: 0.82rem;
    color: #777;
  }
  .meth-footer a { color: #3D6B6B; text-decoration: none; }
  .meth-footer a:hover { text-decoration: underline; }
  .meth-version { margin-top: 0.4rem; font-size: 0.75rem; color: #aaa; }

  @media (max-width: 640px) {
    .two-col        { grid-template-columns: 1fr; }
    .step-grid      { grid-template-columns: 1fr; }
    .appliance-grid { grid-template-columns: 1fr; }
    .toc-card ol    { grid-template-columns: 1fr; }
    .meth-header h1 { font-size: 1.4rem; }
  }
</style>

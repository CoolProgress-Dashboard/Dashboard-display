<script lang="ts">
  // Methodology: MEPS Stringency Over Time — publicly accessible
</script>

<svelte:head>
  <title>Methodology: MEPS Stringency Over Time | CoolProgress</title>
  <meta name="description" content="Methodology and data sources for the MEPS Stringency Over Time chart: CSPF and EEI harmonization, U4E reference levels, and country coverage." />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</svelte:head>

<div class="methodology-page">

  <header class="meth-header">
    <div class="nav-row">
      <a href="/dashboard/meps" class="back-link" on:click|preventDefault={() => { if (window.history.length > 1) { window.history.back(); } else { window.location.href = '/dashboard/meps'; } }}><i class="fa-solid fa-arrow-left"></i> Back to Product Efficiency</a>
    </div>
    <div class="meth-eyebrow">Product Efficiency Pillar · MEPS Stringency</div>
    <h1>MEPS Stringency Over Time</h1>
    <p class="meth-subtitle">
      Methodology and source documentation for the chart tracking how minimum energy performance
      standards for cooling appliances have evolved across countries, harmonized to a common metric
      for cross-country comparison.
    </p>
    <div class="meth-badge">
      <i class="fa-solid fa-circle-check"></i> Source-verified July 2026 — every value traced to its legal instrument
    </div>
  </header>

  <!-- TOC -->
  <nav class="toc-card">
    <h2><i class="fa-solid fa-list"></i> Contents</h2>
    <ol>
      <li><a href="#what">What the Chart Shows</a></li>
      <li><a href="#ac-harmonization">AC: CSPF Harmonization</a></li>
      <li><a href="#fridge-harmonization">Refrigerator: Index Metric</a></li>
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
      The chart tracks how MEPS stringency has changed over time (2006–2033) for Air Conditioners and
      Refrigerators. Each country line shows the efficiency floor required by law, plotted in a
      harmonized metric so that countries using different national standards can be compared. All
      values were re-verified against their legal instruments in July 2026; every data point carries
      its standard citation, source link, and conversion method in the chart tooltip.
    </p>
    <div class="concept-grid">
      <div class="concept-card">
        <div class="concept-icon"><i class="fa-solid fa-wind"></i></div>
        <h3>Air Conditioners</h3>
        <p>Converted to an <strong>ISO 16358-1 CSPF equivalent (Wh/Wh)</strong> using peer-reviewed regression equations (Park et al. 2020). Higher = more efficient. Covers residential split ACs, typically the ≤4.5 kW class.</p>
      </div>
      <div class="concept-card">
        <div class="concept-icon"><i class="fa-solid fa-snowflake"></i></div>
        <h3>Refrigerators</h3>
        <p>Plotted as an <strong>index against a reference consumption line</strong> (100 = reference, lower = more stringent). Only jurisdictions that genuinely regulate on an index metric are shown.</p>
      </div>
      <div class="concept-card">
        <div class="concept-icon"><i class="fa-solid fa-fan"></i></div>
        <h3>Fans</h3>
        <p>Not currently shown. Fan MEPS use incomparable national metrics (maximum watts vs airflow efficiency) and no verified comparison basis exists yet.</p>
      </div>
    </div>
    <p>
      Solid lines show regulations currently in force. Dashed lines show officially adopted standards
      with a future effective date, regionally endorsed targets pending national legislation (marked in
      tooltips), or estimated phase-in values. Analyst scenarios and unlegislated proposals are excluded.
    </p>
  </section>

  <!-- Section 2: AC CSPF Harmonization -->
  <section class="meth-section" id="ac-harmonization">
    <h2><i class="fa-solid fa-wind"></i> AC: CSPF Harmonization</h2>
    <p>
      Countries regulate AC efficiency using different seasonal performance metrics, different test
      standards, and different capacity class definitions. To enable cross-country comparison, all
      national MEPS values are converted to an approximate <strong>ISO 16358-1 CSPF equivalent (Wh/Wh)</strong>
      using the peer-reviewed regression equations of
      <a href="https://escholarship.org/uc/item/5jh2g8v5" target="_blank" rel="noopener noreferrer">Park, Shah, Choi, Kang, Kim and Phadke (2020)</a>,
      <em>Energy for Sustainable Development</em> 55:56–68, Appendix B Table B1, plus published unit
      identities. A key finding of the July 2026 review: seasonal metrics like ISEER and Japanese APF
      relate to ISO CSPF <strong>nonlinearly</strong>, so single constant factors are structurally wrong.
    </p>

    <table class="data-table">
      <thead>
        <tr><th>National Metric</th><th>Used For</th><th>To ISO CSPF</th><th>Fit (R²)</th></tr>
      </thead>
      <tbody>
        <tr><td>CSPF / IDRS / NSEER (ISO 16358-1 family)</td><td>ASEAN, SADC, EAC, Brazil (2023+), Nigeria (new MEPS)</td><td>1:1 (native)</td><td>—</td></tr>
        <tr><td>APF, GB 21455</td><td>China</td><td>1.798 × APF − 2.027</td><td>0.970</td></tr>
        <tr><td>ISEER, IS 1391</td><td>India</td><td>7.726 × ln(ISEER) − 5.318</td><td>0.996</td></tr>
        <tr><td>APF, JIS C 9612</td><td>Japan</td><td>1.735 × e^(0.220 × APF)</td><td>0.976</td></tr>
        <tr><td>CSPF, KS C 9306</td><td>South Korea</td><td>0.970 × X + 0.048</td><td>0.991</td></tr>
        <tr><td>SEER / SEER2, Btu/Wh</td><td>USA</td><td>(÷0.957 for SEER2) ÷3.412, then 0.962 × X + 0.087</td><td>0.999</td></tr>
        <tr><td>EU SEER, EN 14825</td><td>EU</td><td>1.113 × X − 0.639</td><td>0.999</td></tr>
        <tr><td>EER fixed-speed, W/W</td><td>Saudi Arabia (÷3.412 first), South Africa, Nigeria 2017, ECOWAS, Brazil 2019, China 2010</td><td>× 1.062</td><td>exact under ISO bins</td></tr>
        <tr><td>Weighted COP</td><td>Singapore</td><td>1.1917 × X + 0.3111 (NEA/LBNL)</td><td>—</td></tr>
      </tbody>
    </table>

    <div class="callout-info">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <div>
        <strong>EER is not CSPF.</strong> EER is a full-load rating at a single test condition; CSPF is a
        seasonal, part-load weighted metric. The ×1.062 relationship holds only for fixed-speed units
        under the ISO 16358-1 temperature-bin method (LBNL/U4E 2021, p.19); for inverter units CSPF
        exceeds EER by 36–65% and no constant factor is valid. Points derived from EER are drawn with
        hollow markers on the chart and labelled as approximations in the tooltip.
      </div>
    </div>

    <div class="callout-info">
      <i class="fa-solid fa-circle-info"></i>
      <div>
        <strong>Exclusions:</strong> Australia is not plotted: its AEER metric embeds inactive (standby)
        power and the IEA 4E test-standards review (2020) lists no published conversion to ISO CSPF.
        US SEER2 has no published direct conversion either; the chart chains the DOE SEER2→SEER crosswalk
        (×1/0.957) with the SEER equation and labels the result approximate. Per Park et al. (2020), all
        conversions are suitable for initial policy comparison, <strong>not for compliance purposes</strong>.
      </div>
    </div>
  </section>

  <!-- Section 3: Refrigerator index metric -->
  <section class="meth-section" id="fridge-harmonization">
    <h2><i class="fa-solid fa-snowflake"></i> Refrigerator: Index Metric</h2>
    <p>
      Refrigerator MEPS are set in heterogeneous units across countries: annual consumption ceilings
      (kWh/yr) as a function of volume (USA, Japan, Korea, India, Brazil, Singapore, Australia),
      percentage indices against national baselines (China TEEI), or ratios against a reference
      consumption line (EU, SADC, EAC, U4E). The July 2026 source review found that cross-converting
      the kWh-based schemes onto one index axis is <strong>not defensible</strong>: the schemes use
      different test methods (US DOE 90°F test vs IEC 62552 at 24°C/32°C), different volume
      adjustments, and different reference configurations. The chart therefore shows only the four
      jurisdictions that genuinely regulate on an index metric.
    </p>
    <div class="formula-card">
      <div class="formula">R = AEC<sub>max</sub> / AEC &nbsp;&nbsp;→&nbsp;&nbsp; Index = 100 / R</div>
      <p class="formula-note">
        U4E/SADC/EAC: AEC<sub>max</sub> = 0.222 × AV + 161 kWh/yr for refrigerator-freezers
        (IEC 62552 at 24°C), AV = adjusted volume. Index 100 = exactly on the reference line;
        Index 80 = must beat it by 25% (R ≥ 1.25); lower = more stringent.
      </p>
    </div>
    <p>
      The EU's EEI (Regulation (EU) 2019/2019, in force floors: EEI ≤ 125 from March 2021, ≤ 100 from
      March 2024) is a sister metric on the same axis: EEI = AE/SAE × 100 against the EU's own standard
      annual energy formula. For a typical 400L frost-free combi the EU reference line sits roughly
      5–12% below the U4E/SADC line, so small cross-scheme differences on this chart are not meaningful.
      Pre-2021 EU EEI values (Regulation 643/2009) are on a different scale and are excluded.
    </p>
    <p>
      Three further jurisdictions apply the same EU reference line through their own legislation and are
      plotted directly: the <strong>UK</strong> (SI 2021/745, EEI 125 from July 2021, 100 from March
      2024), <strong>Turkey</strong> (Communiqué SGM:2021/7, same tiers and dates as the EU), and
      <strong>Switzerland</strong> (Energy Efficiency Ordinance SR 730.02, EEI ≤ 100 already from March
      2021, three years ahead of the EU). Norway (via the EEA), Ukraine, and Israel also mirror the EU
      requirements but add no distinct values and are not drawn separately.
    </p>
    <div class="callout-info">
      <i class="fa-solid fa-circle-info"></i>
      <div>
        <strong>Why China is not shown:</strong> China's TEEI is a percentage of a national baseline that
        was redefined roughly 40% tighter in GB 12021.2-2025 (mandatory June 2026). A "TEEI 90" under the
        old and new baselines are different stringency levels, so no consistent time series exists on an
        index axis.
      </div>
    </div>
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
    <p>
      Source: <em>U4E Model Regulation Guidelines for Energy-Efficient and Climate-Friendly Air
      Conditioners</em> (September 2019), Table 5 (MEPS floors), Annex 2 Tables 13–15 (label tiers by
      climate group), Annex 3 Table 19 (countries by climate group). The U4E reference values depend on
      <strong>climate group</strong> and <strong>capacity band</strong>. The chart offers a selector for
      the three primary climate groups; all values shown are for the ≤4.5 kW band (typical residential
      split ACs are 2.5–3.5 kW). Group 1 is the default: it covers the humid and hot climates where most
      cooling demand growth occurs, and all charted developing and emerging economies except Saudi
      Arabia are Group 1 countries.
    </p>
    <table class="data-table">
      <thead>
        <tr><th>Tier (≤4.5 kW)</th><th>Group 1 (humid/hot)</th><th>Group 2 (extremely hot-dry)</th><th>Group 3 (mixed/cool)</th><th>Line Style</th><th>U4E Basis</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Minimum MEPS</td>
          <td><strong>6.10</strong></td><td>5.00</td><td>5.30</td>
          <td><span class="line-preview ref"></span> Grey dashed</td>
          <td>Table 5</td>
        </tr>
        <tr>
          <td>Intermediate Label floor</td>
          <td><strong>7.10</strong></td><td>5.80</td><td>6.00</td>
          <td><span class="line-preview intermediate"></span> Amber dashed</td>
          <td>Annex 2 Tables 13 / 14 / 15</td>
        </tr>
        <tr>
          <td>High Efficiency Label</td>
          <td><strong>8.00</strong></td><td>6.50</td><td>6.70</td>
          <td><span class="line-preview gcp"></span> Green dotted</td>
          <td>Annex 2 Tables 13 / 14 / 15</td>
        </tr>
      </tbody>
    </table>

    <h3>U4E MEPS by climate group and capacity band (Table 5, full matrix)</h3>
    <table class="data-table">
      <thead>
        <tr><th>Capacity Band</th><th>Group 1 (humid/hot)</th><th>Group 2 (extremely hot-dry)</th><th>Group 3 (mixed/cool)</th></tr>
      </thead>
      <tbody>
        <tr><td>≤ 4.5 kW</td><td><strong>6.10</strong></td><td>5.00</td><td>5.30</td></tr>
        <tr><td>4.5 – 9.5 kW</td><td>5.10</td><td>4.30</td><td>4.60</td></tr>
        <tr><td>9.5 – 16 kW</td><td>4.50</td><td>3.80</td><td>4.10</td></tr>
      </tbody>
    </table>

    <h3>Charted jurisdictions by U4E climate group (Annex 3 Table 19)</h3>
    <p>
      Climate groups are defined by thermal and moisture criteria on ASHRAE climate zones: Group 1
      spans extremely hot to warm climates (mostly humid or marine, including some warm-dry zones),
      Group 2 the extremely hot-dry and very hot-dry zones (0B, 1B), and Group 3 mixed to arctic
      climates. Where a country spans several groups, U4E marks the group of its largest-population
      region (shown with * below).
    </p>
    <table class="data-table">
      <thead>
        <tr><th>Jurisdiction on the chart</th><th>U4E primary climate group</th><th>Secondary zones (Table 19)</th></tr>
      </thead>
      <tbody>
        <tr><td>Brazil</td><td>Group 1</td><td>0A, 1A, 2A*, 3A</td></tr>
        <tr><td>China</td><td>Group 1* (also 3)</td><td>0A–8, largest-population region 2A*</td></tr>
        <tr><td>India</td><td>Group 1* (also 2)</td><td>0A*, 0B, 1A, 1B, 2A, 2B</td></tr>
        <tr><td>Singapore</td><td>Group 1</td><td>0A</td></tr>
        <tr><td>ASEAN members</td><td>Group 1</td><td>0A/1A (Indonesia 0A*, Thailand 0A*, Vietnam 0A*, Philippines 0A*)</td></tr>
        <tr><td>Nigeria / ECOWAS</td><td>Group 1</td><td>0A</td></tr>
        <tr><td>EAC members</td><td>Group 1</td><td>Kenya 2A*, Tanzania 1A*, Rwanda 2A, Uganda 2A</td></tr>
        <tr><td>SADC members</td><td>Group 1 (mostly)</td><td>Mauritius 1A*, Zambia 3A, Zimbabwe 3A*; South Africa 1* (3C*, spans 1B–6A)</td></tr>
        <tr><td>Saudi Arabia</td><td><strong>Group 2*</strong> (also 1)</td><td>0B*, 1B, 2B, 3B</td></tr>
        <tr><td>Turkey (refrigerator chart)</td><td>Group 3* (also 1)</td><td>4A*, 2A–6A</td></tr>
      </tbody>
    </table>
    <div class="callout-info">
      <i class="fa-solid fa-circle-info"></i>
      <div>
        <strong>Industrialized countries have no U4E climate group.</strong> The Model Regulation is
        voluntary guidance for developing and emerging economies, and Annex 3 Table 19 lists only
        those countries. USA, EU, UK, Switzerland, Japan, South Korea and Australia are therefore not
        assigned a group, and reading them against a U4E reference line is indicative only (their
        climates broadly correspond to Group 3-type zones, but no official assignment exists).
      </div>
    </div>
    <div class="callout-info">
      <i class="fa-solid fa-circle-info"></i>
      <div>
        <strong>Why most national MEPS sit below the U4E Group 1 line:</strong> this is a real finding,
        not a chart artifact. The U4E Model Regulation is an ambition benchmark set near best-practice
        levels. As of 2026 only Japan's Top Runner fleet target (6.22) and Singapore's 2025 MEPS (6.10)
        reach the Group 1 floor; SADC and EAC Phase 2 (CSPF 6.10 from 2027) adopt it directly.
      </div>
    </div>

    <h3>Refrigerators — U4E Model Regulation for Refrigerating Appliances</h3>
    <p>
      Source: <em>U4E Model Regulation Guidelines for Energy-Efficient and Climate-Friendly Refrigerating
      Appliances</em> (2019), Table 2 (AEC<sub>max</sub> formulas) and Annex 3 Table 8 (tiers via the
      performance ratio R). The U4E document contains <strong>no EEI</strong>; the chart's index is
      100 / R.
    </p>
    <table class="data-table">
      <thead>
        <tr><th>Tier</th><th>R threshold</th><th>Index (100/R)</th><th>Line Style</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Minimum MEPS</td>
          <td>R ≥ 1.00</td>
          <td><strong>100</strong></td>
          <td><span class="line-preview ref"></span> Grey dashed</td>
        </tr>
        <tr>
          <td>Intermediate</td>
          <td>R ≥ 1.25</td>
          <td><strong>80</strong></td>
          <td><span class="line-preview intermediate"></span> Amber dashed</td>
        </tr>
        <tr>
          <td>High Efficiency</td>
          <td>R ≥ 1.50</td>
          <td><strong>67</strong></td>
          <td><span class="line-preview gcp"></span> Green dotted</td>
        </tr>
      </tbody>
    </table>
    <div class="callout-info">
      <i class="fa-solid fa-calculator"></i>
      <div>
        <strong>How the index works:</strong> R = AEC<sub>max</sub> / AEC<sub>actual</sub> (U4E Eq. 5), so
        R ≥ 1.25 means the appliance must consume at most 1/1.25 = 80% of the reference line.
        SADC HT 111:2023 and EAS 1214:2025 adopt the same structure: R ≥ 1.00 in phase 1, R ≥ 1.25 from
        2027. Note for readers of earlier chart versions: the former "EEI 102" was the intercept constant
        of the U4E refrigerator formula (0.163 × AV + 102), not an EEI, and "EEI 50" matched no U4E value;
        both were removed in the July 2026 review.
      </div>
    </div>

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
          <strong>Adopted, future effective date</strong> — a formal regulatory decision exists
          but the requirement has not yet come into force, or applies to a future compliance
          schedule. Dashed line. Two special cases are also dashed and flagged in the tooltip:
          <em>regionally endorsed targets</em> (ASEAN roadmap steps, endorsed by energy ministers but
          legislated country by country) and <em>estimated values</em> (Nigeria's phased MEPS, where
          the improvement percentages are official but absolute thresholds are unpublished).
        </div>
      </div>
    </div>
    <p>
      Unlegislated proposals and analyst scenarios are excluded. Examples removed in the July 2026
      review: India's ISEER 5.0/6.3/7.4 trajectory (a research proposal, not notified by BEE),
      China's "CSPF 7.64 by 2025" (an LBNL scenario, no GB revision adopted), and the EU's draft
      SEER 6.0 tier (not adopted as of July 2026). Regional standards carry a transposition caveat:
      SADC HT 110:2023 is enforced nationally only by Mauritius so far.
    </p>
  </section>

  <!-- Section 6: Data Sources -->
  <section class="meth-section" id="sources">
    <h2><i class="fa-solid fa-database"></i> Data Sources</h2>

    <div class="source-block">
      <div class="source-header">
        <div>
          <h3>National and regional legal instruments (primary sources)</h3>
        </div>
      </div>
      <p>Every data point cites its legal instrument in the chart tooltip: GB standards (China, SAMR), BEE star tables (India), US Federal Register rules (10 CFR 430), Regulation (EU) 206/2012 and 2019/2019 (EUR-Lex), METI Top Runner targets (Japan), MOTIE notices (Korea), INMETRO Portarias (Brazil), SASO 2663 (Saudi Arabia), VC 9008/SANS 941 (South Africa), SADC HT 110/111:2023, EAS 1213/1214:2025, ECOSTAND 071-2:2017 (ECOWAS), NEA regulations (Singapore).</p>
    </div>

    <div class="source-block">
      <div class="source-header">
        <div>
          <h3>Park et al. (2020) — conversion equations</h3>
          <a href="https://escholarship.org/uc/item/5jh2g8v5" target="_blank" rel="noopener noreferrer">
            escholarship.org (open access) <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
      <p>"Lost in translation: Overcoming divergent seasonal performance metrics to strengthen air conditioner energy-efficiency policies", Energy for Sustainable Development 55:56–68. Peer-reviewed regression equations converting national seasonal metrics to ISO 16358 CSPF (Table B1).</p>
    </div>

    <div class="source-block">
      <div class="source-header">
        <div>
          <h3>LBNL / U4E (2021) — fixed-speed EER relationship, Singapore WCOP</h3>
          <a href="https://united4efficiency.org/wp-content/uploads/2022/07/ASEAN-AC-EE-Harmonization_Final_Feb-2021.pdf" target="_blank" rel="noopener noreferrer">
            ASEAN AC Harmonization report <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
      <p>"Harmonizing Energy-Efficiency Standards for Room Air Conditioners in Southeast Asia": CSPF = 1.062 × EER for fixed-speed units under ISO temperature bins (p.19); inverter WCOP regression (Annex D).</p>
    </div>

    <div class="source-block">
      <div class="source-header">
        <div>
          <h3>UNEP United for Efficiency (U4E)</h3>
          <a href="https://united4efficiency.org/resources/model-regulation-guidelines/" target="_blank" rel="noopener noreferrer">
            Model Regulation Guidelines <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
      <p>Model Regulation Guidelines for Air Conditioners (Table 5, Annex 2 Table 13) and Refrigerating Appliances (Table 2, Annex 3 Table 8). Source for all reference tier lines.</p>
    </div>

    <div class="source-block">
      <div class="source-header">
        <div>
          <h3>Institutional databases</h3>
        </div>
      </div>
      <p><a href="https://www.iea.org/policies" target="_blank" rel="noopener noreferrer">IEA Policies Database</a>, <a href="https://cprc-clasp.ngo/" target="_blank" rel="noopener noreferrer">CLASP Policy Resource Center</a>, and the <a href="https://www.iea-4e.org/wp-content/uploads/2020/12/AC_Test_Methods_Report_Final_V2_incl_JP_KO.pdf" target="_blank" rel="noopener noreferrer">IEA 4E test-standards review (2020)</a>, used for corroboration and for determining where no valid conversion exists (Australia AEER, US SEER2).</p>
    </div>

    <div class="callout-info">
      <i class="fa-solid fa-file-excel"></i>
      <div>
        <strong>Full audit trail:</strong> a calculation workbook with every value, its live conversion
        formula, source link, and a changelog against the previous chart is maintained by the HEAT team
        (MEPS Review 2026). Contact the team for access.
      </div>
    </div>
  </section>

  <!-- Section 7: Limitations -->
  <section class="meth-section" id="limitations">
    <h2><i class="fa-solid fa-triangle-exclamation"></i> Limitations</h2>
    <ul class="limit-list">
      <li>
        <strong>Conversions are indicative, not for compliance:</strong> per Park et al. (2020), the
        regression equations are suitable for initially assessing relative stringency. National test
        standards use different climate profiles, load assumptions, and operating conditions; residual
        differences of ±5–10% are possible after conversion.
      </li>
      <li>
        <strong>EER-derived points are approximations:</strong> values converted from full-load EER
        (Saudi Arabia, South Africa, Nigeria 2017, ECOWAS, Brazil 2019, China 2010) assume fixed-speed
        behaviour and are drawn with hollow markers on the chart.
      </li>
      <li>
        <strong>Capacity class:</strong> MEPS vary by capacity band within a country. The chart shows
        the typical residential class (≤4.5 kW splits, or the closest national equivalent); larger
        classes have lower floors.
      </li>
      <li>
        <strong>Climate groups:</strong> the U4E reference tiers depend on climate group; the chart
        defaults to Group 1 and offers a selector for Groups 2 and 3. Saudi Arabia should be read
        against the Group 2 tiers. Industrialized countries (USA, EU, UK, Switzerland, Japan, South
        Korea, Australia) are not assigned a U4E climate group at all, see the country table above.
      </li>
      <li>
        <strong>Regional standards vs national enforcement:</strong> SADC and EAC values are regionally
        approved harmonised standards; national transposition is ongoing (only Mauritius enforces
        SADC HT 110 as of mid 2026). ASEAN values are ministerially endorsed targets, not in-force MEPS.
      </li>
      <li>
        <strong>Japan is a fleet average:</strong> Top Runner targets are shipment-weighted corporate
        fleet averages, not per-unit MEPS; individual units below the target may be sold.
      </li>
      <li>
        <strong>Nigeria absolute values are estimates:</strong> only the phased improvement percentages
        (6% by 2026, 36% by 2029, 48% by 2031) are published; the plotted values assume an NSEER 3.0
        baseline pending publication of the SON standard text.
      </li>
      <li>
        <strong>Excluded jurisdictions:</strong> Australia (no valid AEER→CSPF conversion) and, on the
        refrigerator chart, all kWh-based schemes (USA, China, India, Japan, Korea, Brazil, Singapore,
        Australia) that cannot join the index axis without unpublished conversions. Fans are not shown
        pending a verified comparison basis.
      </li>
    </ul>
  </section>

  <footer class="meth-footer">
    <p>
      <strong>CoolProgress</strong> is developed by
      <a href="https://www.heat-international.de/" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
      in partnership with IEA, UNEP U4E, and GIZ Proklima.
    </p>
    <p class="meth-version">Chart methodology v2.0 · July 2026 · full source review, all values re-verified against legal instruments</p>
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

  /* Needs the parent in the selector: the generic `.meth-section p` color rule
     (class + element) otherwise outranks a lone class and renders this dark on
     the dark gradient. */
  .formula-card .formula-note {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.85);
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

  .callout-wip {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-left: 4px solid #f59e0b;
    border-radius: 8px;
    padding: 0.8rem 1rem;
    margin: 0.75rem 0;
    font-size: 0.83rem;
    color: #78350f;
    line-height: 1.5;
  }

  .callout-wip i {
    color: #f59e0b;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .meth-badge.wip {
    background: rgba(245, 158, 11, 0.12);
    color: #92400e;
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

<script lang="ts">
  // Methodology index — publicly accessible
</script>

<svelte:head>
  <title>Methodology | CoolProgress Dashboard</title>
  <meta name="description" content="Chart methodology documentation for the CoolProgress Dashboard — MEPS Stringency, Appliance Growth, and Peak Electricity Load." />
</svelte:head>

<div class="methodology-index">
  <header class="idx-header">
    <h1>Chart Methodology</h1>
    <p class="idx-subtitle">
      Transparent source documentation for CoolProgress charts.
      Each chart has its own dedicated methodology page.
    </p>
  </header>

  <div class="chart-cards">

    <a href="/methodology/meps-stringency" class="chart-card">
      <div class="card-icon" style="background: rgba(61,107,107,0.1); color: #3D6B6B;">
        <i class="fa-solid fa-chart-line"></i>
      </div>
      <div class="card-body">
        <div class="card-eyebrow">Product Efficiency</div>
        <h2>MEPS Stringency Over Time</h2>
        <p>CSPF and EEI harmonization, U4E reference tiers, adopted vs. effective timelines, and country coverage.</p>
        <span class="card-link">Read methodology <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </a>

    <a href="/methodology/appliance-chart" class="chart-card">
      <div class="card-icon" style="background: rgba(45,125,90,0.1); color: #2D7D5A;">
        <i class="fa-solid fa-boxes-stacked"></i>
      </div>
      <div class="card-body">
        <div class="card-eyebrow">Emissions Pillar</div>
        <h2>Global Appliance Growth</h2>
        <p>How CLASP Mepsy and GCI/HEAT data are combined to show stock, energy, and emissions from 2020 to 2050.</p>
        <span class="card-link">Read methodology <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </a>

    <a href="/methodology/peak-load" class="chart-card">
      <div class="card-icon" style="background: rgba(217,117,64,0.1); color: #D97540;">
        <i class="fa-solid fa-bolt"></i>
      </div>
      <div class="card-body">
        <div class="card-eyebrow">Product Efficiency</div>
        <h2>Cooling Share of Peak Electricity Load</h2>
        <p>IEA baseline data, 2050 projections, appliance scope, and how country values were calculated.</p>
        <span class="card-link">Read methodology <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </a>

  </div>

  <footer class="idx-footer">
    <p>
      <strong>CoolProgress</strong> is developed by
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noopener noreferrer">HEAT GmbH</a>
      in partnership with CLASP, IEA, UNEP U4E, and GIZ Proklima.
    </p>
  </footer>
</div>

<style>
  .methodology-index {
    max-width: 760px;
    margin: 0 auto;
    padding: 3rem 1.5rem 4rem;
    font-family: inherit;
    color: #1e293b;
  }

  .idx-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .idx-header h1 {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0 0 0.5rem;
    color: #0f172a;
  }

  .idx-subtitle {
    font-size: 0.95rem;
    color: #64748b;
    margin: 0;
    line-height: 1.6;
  }

  .chart-cards {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .chart-card {
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.5rem;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  }

  .chart-card:hover {
    border-color: #3D6B6B;
    box-shadow: 0 6px 20px rgba(0,0,0,0.07);
    transform: translateY(-1px);
  }

  .card-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
  }

  .card-body {
    min-width: 0;
  }

  .card-eyebrow {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
    margin-bottom: 0.25rem;
  }

  .card-body h2 {
    font-size: 1.05rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 0.35rem;
  }

  .card-body p {
    font-size: 0.85rem;
    color: #475569;
    margin: 0 0 0.6rem;
    line-height: 1.55;
  }

  .card-link {
    font-size: 0.8rem;
    font-weight: 600;
    color: #3D6B6B;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .idx-footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
    text-align: center;
  }

  .idx-footer p {
    font-size: 0.82rem;
    color: #94a3b8;
    margin: 0;
  }

  .idx-footer a {
    color: #3D6B6B;
    text-decoration: none;
    font-weight: 600;
  }

  @media (max-width: 600px) {
    .chart-card { flex-direction: column; gap: 0.75rem; }
    .idx-header h1 { font-size: 1.5rem; }
  }
</style>

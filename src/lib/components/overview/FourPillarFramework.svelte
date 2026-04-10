<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ navigate: string }>();

  const pillars = [
    {
      id: 'access',
      icon: 'fa-people-group',
      color: '#2D7D5A',
      label: 'Access to Cooling',
      description: 'Ensuring cooling for all as a fundamental human right and a life-saving necessity.',
      route: 'access',
      comingSoon: false
    },
    {
      id: 'meps',
      icon: 'fa-bolt',
      color: '#D4A843',
      label: 'Energy Efficient Products',
      description: 'Shielding global energy grids by ensuring every unit sold is a high-efficiency model.',
      route: 'meps',
      comingSoon: false
    },
    {
      id: 'kigali',
      icon: 'fa-snowflake',
      color: '#5A8FC2',
      label: 'Climate Friendly Refrigerants',
      description: 'Moving to climate and environmentally friendly refrigerants under the Kigali Amendment — a strategic shift that can avert 0.5°C of global warming this century.',
      route: 'kigali',
      comingSoon: false
    },
    {
      id: 'buildings',
      icon: 'fa-building',
      color: '#64748b',
      label: 'Building & Passive Cooling',
      description: 'Better building design — including insulation, shading, ventilation, and cool roofs — addresses cooling demand at the source. These passive measures can cut indoor temperatures by 5–8°C at near-zero operating cost.',
      route: null,
      comingSoon: false
    }
  ];
</script>

<div class="way-forward-section">
  <div class="way-forward-header">
    <span class="way-forward-eyebrow">The Way Forward</span>
    <h2 class="way-forward-title">Four Priority Areas for Sustainable Cooling</h2>
    <p class="way-forward-subtitle">Every priority area matters. Progress on all four is needed to stay on the sustainable pathway.</p>
  </div>

  <div class="way-forward-grid">
    {#each pillars as pillar, i}
      <div class="way-item" style="--way-color: {pillar.color}">
        <div class="way-item-top">
          <div class="way-icon">
            <i class="fa-solid {pillar.icon}"></i>
          </div>
          <span class="way-number">0{i + 1}</span>
        </div>
        <h3 class="way-title">{pillar.label}</h3>
        <p class="way-desc">{pillar.description}</p>
      </div>
    {/each}
  </div>
</div>

<style>
  .way-forward-section {
    background: transparent;
    border-radius: 0;
    padding: 56px 64px;
  }

  .way-forward-header {
    margin-bottom: 40px;
  }

  .way-forward-eyebrow {
    display: inline-block;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #0369a1;
    margin-bottom: 12px;
  }

  .way-forward-title {
    font-size: 1.5rem;
    font-weight: 900;
    color: #0f172a;
    margin: 0 0 8px 0;
    letter-spacing: -0.02em;
  }

  .way-forward-subtitle {
    font-size: 0.9rem;
    font-weight: 500;
    color: #334155;
    margin: 0;
    line-height: 1.6;
  }

  .way-forward-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255,255,255,0.55);
  }

  .way-item {
    padding: 40px 32px;
    border-right: 1px solid rgba(0,0,0,0.07);
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: background 0.2s ease;
  }

  .way-item:last-child { border-right: none; }

  .way-item:hover {
    background: #f8fafc;
  }

  .way-item-top {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  .way-icon {
    width: 72px; height: 72px;
    border-radius: 14px;
    background: color-mix(in srgb, var(--way-color) 14%, transparent);
    color: var(--way-color);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.85rem;
    flex-shrink: 0;
  }

  .way-number {
    font-size: 3.2rem;
    font-weight: 900;
    color: var(--way-color);
    opacity: 0.55;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .way-title {
    font-size: 1.15rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    line-height: 1.3;
  }

  .way-desc {
    font-size: 0.92rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.7;
    margin: 0;
    flex: 1;
  }

  @media (max-width: 900px) {
    .way-forward-grid { grid-template-columns: repeat(2, 1fr); }
    .way-item { border-right: 1px solid rgba(0,0,0,0.07); border-bottom: 1px solid rgba(0,0,0,0.07); }
    .way-item:nth-child(even) { border-right: none; }
  }

  @media (max-width: 540px) {
    .way-forward-section { padding: 32px 24px; }
    .way-forward-grid { grid-template-columns: 1fr; }
    .way-item { border-right: none; }
  }
</style>

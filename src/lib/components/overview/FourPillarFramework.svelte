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
      bullets: [
        'More than 1 billion people face life-threatening heat without adequate cooling',
        'Leapfrogging to efficient, affordable technology bridges the equity gap',
        'Cold chains for food and medicine are as critical as residential cooling'
      ],
      route: 'access',
      comingSoon: false
    },
    {
      id: 'buildings',
      icon: 'fa-building',
      color: '#64748b',
      label: 'Building & Passive Cooling',
      description: 'Better building design — insulation, shading, ventilation, and cool roofs — addresses cooling demand at the source.',
      bullets: [
        'Can cut indoor temperatures by 5–8°C at near-zero operating cost',
        'Essential for new construction in fast-urbanising hot-climate regions',
        'First and most cost-effective step in the cooling hierarchy'
      ],
      route: null,
      comingSoon: false
    },
    {
      id: 'kigali',
      icon: 'fa-snowflake',
      color: '#5A8FC2',
      label: 'Climate Friendly Refrigerants',
      description: 'Moving to low-GWP refrigerants under the Kigali Amendment — a strategic shift that can avert 0.5°C of warming this century.',
      bullets: [
        'HFCs are up to 12,000× more warming than CO₂ per molecule',
        '175+ countries have ratified the Kigali Amendment',
        'Full phase-down avoids ~105 billion tonnes CO₂e by 2100'
      ],
      route: 'kigali',
      comingSoon: false
    },
    {
      id: 'meps',
      icon: 'fa-bolt',
      color: '#D4A843',
      label: 'Energy Efficient Products',
      description: 'Shielding global energy grids by ensuring every unit sold meets a high-efficiency standard.',
      bullets: [
        'Best-in-class ACs are 3× more efficient than the least efficient on sale today',
        'MEPS and energy labels close the efficiency gap across markets',
        'Prevents 15–20 year lock-in of inefficient stock in growing markets'
      ],
      route: 'meps',
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
    {#each pillars as pillar}
      <div class="way-item" style="--way-color: {pillar.color}">
        <div class="way-accent-bar"></div>
        <div class="way-item-top">
          <div class="way-icon">
            <i class="fa-solid {pillar.icon}"></i>
          </div>
        </div>
        <h3 class="way-title">{pillar.label}</h3>
        <p class="way-desc">{pillar.description}</p>
        <ul class="way-bullets">
          {#each pillar.bullets as bullet}
            <li>{bullet}</li>
          {/each}
        </ul>
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
    padding: 0 32px 40px;
    border-right: 1px solid rgba(0,0,0,0.07);
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: background 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .way-item:last-child { border-right: none; }

  .way-item:hover {
    background: #f8fafc;
  }

  .way-accent-bar {
    height: 4px;
    background: var(--way-color);
    margin: 0 -32px 28px;
    opacity: 0.75;
    transition: opacity 0.2s ease;
  }

  .way-item:hover .way-accent-bar {
    opacity: 1;
  }

  .way-item-top {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 4px;
  }

  .way-icon {
    width: 64px; height: 64px;
    border-radius: 14px;
    background: color-mix(in srgb, var(--way-color) 14%, transparent);
    color: var(--way-color);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.65rem;
    flex-shrink: 0;
  }

  .way-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--way-color);
    margin: 0;
    line-height: 1.3;
  }

  .way-desc {
    font-size: 0.92rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.7;
    margin: 0;
  }

  .way-bullets {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }

  .way-bullets li {
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.5;
    padding-left: 1.1em;
    position: relative;
  }

  .way-bullets li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.55em;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--way-color);
    opacity: 0.75;
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

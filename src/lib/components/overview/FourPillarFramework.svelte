<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ navigate: string }>();

  const pillars = [
    {
      id: 'access',
      icon: 'fa-people-group',
      color: '#2D7D5A',
      label: 'Access to Cooling',
      description: 'Over 1.2 billion people face dangerous heat without adequate cooling. Closing the access gap is a matter of climate equity and public health.',
      route: 'access',
      comingSoon: false
    },
    {
      id: 'meps',
      icon: 'fa-bolt',
      color: '#D4A843',
      label: 'Energy-Efficient Products',
      description: 'Minimum energy performance standards (MEPS) and labels raise the efficiency floor, cut electricity bills, and prevent the dumping of inefficient equipment in growing markets.',
      route: 'meps',
      comingSoon: false
    },
    {
      id: 'kigali',
      icon: 'fa-snowflake',
      color: '#5A8FC2',
      label: 'Climate-Friendly Refrigerants',
      description: 'The Kigali Amendment commits 172 countries to phasing down high-GWP refrigerants. Full implementation can prevent up to 0.5°C of global warming by 2100.',
      route: 'kigali',
      comingSoon: false
    },
    {
      id: 'buildings',
      icon: 'fa-building',
      color: '#94a3b8',
      label: 'Buildings & Passive Cooling',
      description: 'Better building design — insulation, shading, ventilation, cool roofs — reduces cooling demand at source. This can cut indoor temperatures by 5–8°C at near-zero operating cost.',
      route: null,
      comingSoon: true
    }
  ];
</script>

<div class="four-pillar-wrapper card-panel">
  <div class="four-pillar-header">
    <h2 class="four-pillar-title">Four Pathways to Sustainable Cooling</h2>
    <p class="four-pillar-subtitle">Every lever matters. Progress on all four is needed to stay on the sustainable pathway.</p>
  </div>

  <div class="four-pillar-grid">
    {#each pillars as pillar}
      <div
        class="pillar-card"
        class:coming-soon={pillar.comingSoon}
        role={pillar.comingSoon ? 'article' : 'button'}
        tabindex={pillar.comingSoon ? -1 : 0}
        on:click={() => !pillar.comingSoon && pillar.route && dispatch('navigate', pillar.route)}
        on:keydown={(e) => e.key === 'Enter' && !pillar.comingSoon && pillar.route && dispatch('navigate', pillar.route)}
        style="--pillar-color: {pillar.color}"
      >
        <div class="pillar-card-top">
          <div class="pillar-icon">
            <i class="fa-solid {pillar.icon}"></i>
          </div>
          {#if pillar.comingSoon}
            <span class="coming-soon-badge">Coming soon</span>
          {/if}
        </div>
        <h3 class="pillar-card-label">{pillar.label}</h3>
        <p class="pillar-card-desc">{pillar.description}</p>
        {#if !pillar.comingSoon}
          <span class="pillar-card-cta">
            Explore <i class="fa-solid fa-arrow-right"></i>
          </span>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .four-pillar-wrapper {
    padding: 1.75rem;
  }

  .four-pillar-header {
    margin-bottom: 1.25rem;
  }

  .four-pillar-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 0.35rem;
    letter-spacing: -0.01em;
  }

  .four-pillar-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }

  .four-pillar-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.85rem;
  }

  .pillar-card {
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    border-top: 3px solid var(--pillar-color);
    outline: none;
  }

  .pillar-card:not(.coming-soon):hover {
    border-color: var(--pillar-color);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  .pillar-card:not(.coming-soon):focus-visible {
    box-shadow: 0 0 0 3px rgba(45, 125, 90, 0.3);
  }

  .pillar-card.coming-soon {
    opacity: 0.5;
    cursor: default;
    filter: grayscale(0.4);
  }

  .pillar-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .pillar-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--pillar-color) 12%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: var(--pillar-color);
    flex-shrink: 0;
  }

  .coming-soon-badge {
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #94a3b8;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    padding: 0.2rem 0.5rem;
    white-space: nowrap;
  }

  .pillar-card-label {
    font-size: 0.88rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    line-height: 1.3;
  }

  .pillar-card-desc {
    font-size: 0.78rem;
    color: #64748b;
    line-height: 1.55;
    margin: 0;
    flex: 1;
  }

  .pillar-card-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--pillar-color);
    margin-top: 0.25rem;
    transition: gap 0.15s ease;
  }

  .pillar-card:hover .pillar-card-cta {
    gap: 0.5rem;
  }

  .pillar-card-cta i {
    font-size: 0.6rem;
  }

  @media (max-width: 900px) {
    .four-pillar-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 540px) {
    .four-pillar-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

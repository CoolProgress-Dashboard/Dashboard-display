<!--
  PillarHeader.svelte
  Shared top-of-pillar header component.
  Renders a colored accent banner with the entry stat, headline, and subhead.
  Replaces the per-pillar *-story-header div inside each story card.

  Props:
    pillarId  — 'emissions' | 'meps' | 'kigali' | 'access' | 'policy'
    headline  — from VIEW_META[pillarId].headline
    subhead   — from VIEW_META[pillarId].subhead
    entryStat — from pillarContent[pillarId].entryStat  (optional)
    onInfo    — callback for the Methodology button (optional)
-->
<script lang="ts">
  export let pillarId: string;
  export let headline: string;
  export let subhead: string;
  export let entryStat: string = '';
  export let onInfo: (() => void) | null = null;

  const PILLAR_CONFIG: Record<string, { color: string; dimColor: string; icon: string; label: string }> = {
    emissions: { color: '#C25B33', dimColor: 'rgba(194,91,51,0.10)', icon: 'fa-smog',         label: 'Emissions & Climate'    },
    meps:      { color: '#D4A843', dimColor: 'rgba(212,168,67,0.10)', icon: 'fa-bolt',         label: 'Product Efficiency'     },
    kigali:    { color: '#5A8FC2', dimColor: 'rgba(90,143,194,0.10)', icon: 'fa-snowflake',    label: 'Refrigerant Transition' },
    access:    { color: '#2D7D5A', dimColor: 'rgba(45,125,90,0.10)',  icon: 'fa-people-group', label: 'Access & Vulnerability' },
    policy:    { color: '#3D6B6B', dimColor: 'rgba(61,107,107,0.10)', icon: 'fa-landmark',     label: 'Policy Framework'       },
  };

  $: cfg = PILLAR_CONFIG[pillarId] ?? { color: '#3D6B6B', dimColor: 'rgba(61,107,107,0.10)', icon: 'fa-circle', label: pillarId };
</script>

<div class="pillar-header" style="--pillar-color: {cfg.color}; --pillar-dim: {cfg.dimColor}">
  <!-- Top row: pillar badge + methodology button -->
  <div class="pillar-header-row">
    <div class="pillar-badge">
      <i class="fa-solid {cfg.icon}"></i>
      <span>{cfg.label}</span>
    </div>
    {#if onInfo}
      <button class="pillar-header-info-btn" type="button" on:click={onInfo}>
        <i class="fa-solid fa-circle-info"></i> Methodology
      </button>
    {/if}
  </div>

  <!-- Entry stat — pull-quote highlight -->
  {#if entryStat}
    <div class="pillar-entry-stat">
      <span class="pillar-entry-stat-bar"></span>
      <span class="pillar-entry-stat-text">{entryStat}</span>
    </div>
  {/if}

  <!-- Headline + subhead -->
  <h1 class="pillar-header-headline">{headline}</h1>
  <p class="pillar-header-subhead">{subhead}</p>
</div>

<style>
  .pillar-header {
    background: var(--pillar-dim);
    border-left: 4px solid var(--pillar-color);
    border-radius: 0 12px 12px 0;
    padding: 1.25rem 1.5rem 1.1rem;
    margin-bottom: 0.85rem;
    position: relative;
    overflow: hidden;
  }

  /* Subtle top-right orb decoration */
  .pillar-header::after {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: var(--pillar-color);
    opacity: 0.06;
    pointer-events: none;
  }

  /* Top row */
  .pillar-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.85rem;
    gap: 0.75rem;
  }

  /* Pillar badge pill */
  .pillar-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--pillar-color);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
  }

  .pillar-badge i {
    font-size: 0.65rem;
    opacity: 0.9;
  }

  /* Methodology button */
  .pillar-header-info-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--pillar-color);
    background: none;
    border: 1px solid color-mix(in srgb, var(--pillar-color) 30%, transparent);
    border-radius: 999px;
    padding: 0.3rem 0.75rem;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    font-family: inherit;
    white-space: nowrap;
  }

  .pillar-header-info-btn:hover {
    background: color-mix(in srgb, var(--pillar-color) 8%, transparent);
    border-color: var(--pillar-color);
  }

  /* Entry stat pull-quote */
  .pillar-entry-stat {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    margin-bottom: 0.85rem;
  }

  .pillar-entry-stat-bar {
    display: inline-block;
    width: 3px;
    min-height: 1.6em;
    background: var(--pillar-color);
    border-radius: 2px;
    flex-shrink: 0;
    margin-top: 0.15em;
    opacity: 0.6;
  }

  .pillar-entry-stat-text {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--pillar-color);
    line-height: 1.4;
    letter-spacing: -0.01em;
  }

  /* Headline */
  .pillar-header-headline {
    font-size: 1.45rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
    margin: 0 0 0.5rem;
    letter-spacing: -0.02em;
  }

  /* Subhead */
  .pillar-header-subhead {
    font-size: 0.88rem;
    color: #475569;
    line-height: 1.55;
    margin: 0;
    max-width: 680px;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .pillar-header {
      padding: 1rem 1.1rem 0.9rem;
    }

    .pillar-header-headline {
      font-size: 1.2rem;
    }

    .pillar-header-row {
      flex-wrap: wrap;
    }
  }
</style>

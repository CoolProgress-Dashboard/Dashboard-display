<script lang="ts">
  import { countrySpotlights, type CountrySpotlight } from '$lib/data/country-spotlights';

  let expandedId: string | null = null;

  function toggle(id: string) {
    expandedId = expandedId === id ? null : id;
  }

  function getMepsColor(status: CountrySpotlight['mepsStatus']): string {
    switch (status) {
      case 'advanced': return '#8BC34A';
      case 'developing': return '#f59e0b';
      case 'minimal': return '#E89B8C';
      case 'none': return '#E85A4F';
    }
  }

  function getMepsLabel(status: CountrySpotlight['mepsStatus']): string {
    switch (status) {
      case 'advanced': return 'Advanced';
      case 'developing': return 'Developing';
      case 'minimal': return 'Minimal';
      case 'none': return 'None';
    }
  }

  function getRegionIcon(id: string): string {
    switch (id) {
      case 'china': return 'fa-dragon';
      case 'india': return 'fa-om';
      case 'southeast-asia': return 'fa-water';
      case 'africa': return 'fa-sun';
      case 'latin-america': return 'fa-mountain-sun';
      default: return 'fa-earth-americas';
    }
  }
</script>

<section class="country-spotlights">
  <div class="cs-header">
    <div class="cs-icon-badge">
      <i class="fa-solid fa-map-location-dot"></i>
    </div>
    <div>
      <h2 class="cs-title">Key Cooling Markets</h2>
      <p class="cs-subtitle">Regional snapshots of the world's most consequential cooling markets</p>
    </div>
  </div>

  <div class="cs-grid">
    {#each countrySpotlights as spot (spot.id)}
      <button
        class="cs-card"
        class:expanded={expandedId === spot.id}
        type="button"
        on:click={() => toggle(spot.id)}
      >
        <div class="cs-card-top">
          <div class="cs-region-icon">
            <i class="fa-solid {getRegionIcon(spot.id)}"></i>
          </div>
          <div class="cs-card-header">
            <h3 class="cs-name">{spot.name}</h3>
            <span class="cs-region-label">{spot.region}</span>
          </div>
          <span
            class="cs-meps-badge"
            style="background: {getMepsColor(spot.mepsStatus)}15; color: {getMepsColor(spot.mepsStatus)}"
          >
            MEPS: {getMepsLabel(spot.mepsStatus)}
          </span>
        </div>

        <!-- Key stats strip -->
        <div class="cs-stats-strip">
          {#each spot.stats.slice(0, 3) as stat}
            <div class="cs-stat">
              <span class="cs-stat-value">{stat.value}</span>
              <span class="cs-stat-label">{stat.label}</span>
            </div>
          {/each}
        </div>

        <!-- Expand section -->
        {#if expandedId === spot.id}
          <div class="cs-expanded">
            <p class="cs-narrative">{spot.narrative}</p>

            {#if spot.stats.length > 3}
              <div class="cs-extra-stats">
                {#each spot.stats.slice(3) as stat}
                  <div class="cs-extra-stat">
                    <span class="cs-extra-value">{stat.value}</span>
                    <span class="cs-extra-label">{stat.label}</span>
                    {#if stat.detail}
                      <span class="cs-extra-detail">{stat.detail}</span>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}

            <div class="cs-meta-row">
              <span class="cs-meta-item">
                <i class="fa-solid fa-flask"></i>
                {spot.dominantRefrigerant}
              </span>
              <span class="cs-meta-item challenge">
                <i class="fa-solid fa-triangle-exclamation"></i>
                {spot.keyChallenge}
              </span>
            </div>

            <div class="cs-source">
              Sources: {spot.source}
            </div>
          </div>
        {/if}

        <div class="cs-expand-hint">
          <i class="fa-solid {expandedId === spot.id ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
        </div>
      </button>
    {/each}
  </div>
</section>

<style>
  .country-spotlights {
    padding: 1rem 0;
  }

  .cs-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .cs-icon-badge {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #3D6B6B, #8BC34A);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .cs-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #333;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .cs-subtitle {
    font-size: 0.82rem;
    color: #666;
    margin: 0.1rem 0 0;
  }

  .cs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 0.75rem;
  }

  .cs-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    width: 100%;
    font-family: inherit;
    font-size: inherit;
  }

  .cs-card:hover {
    border-color: #3D6B6B;
    box-shadow: 0 4px 16px rgba(61, 107, 107, 0.1);
    transform: translateY(-2px);
  }

  .cs-card.expanded {
    border-color: #3D6B6B;
    box-shadow: 0 8px 24px rgba(61, 107, 107, 0.12);
  }

  .cs-card-top {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .cs-region-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, rgba(61, 107, 107, 0.08), rgba(139, 195, 74, 0.08));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3D6B6B;
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  .cs-card-header {
    flex: 1;
    min-width: 0;
  }

  .cs-name {
    font-size: 1rem;
    font-weight: 700;
    color: #333;
    margin: 0;
    line-height: 1.2;
  }

  .cs-region-label {
    font-size: 0.7rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 600;
  }

  .cs-meps-badge {
    font-size: 0.6rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cs-stats-strip {
    display: flex;
    gap: 0.5rem;
  }

  .cs-stat {
    flex: 1;
    background: #f8fafc;
    border-radius: 8px;
    padding: 0.5rem 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .cs-stat-value {
    font-size: 1rem;
    font-weight: 800;
    color: #3D6B6B;
    line-height: 1.1;
  }

  .cs-stat-label {
    font-size: 0.6rem;
    color: #888;
    line-height: 1.3;
    font-weight: 500;
  }

  .cs-expanded {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    padding-top: 0.25rem;
    border-top: 1px solid #f1f5f9;
  }

  .cs-narrative {
    font-size: 0.8rem;
    color: #555;
    line-height: 1.55;
    margin: 0;
  }

  .cs-extra-stats {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .cs-extra-stat {
    flex: 1;
    min-width: 100px;
    background: #f8fafc;
    border-radius: 8px;
    padding: 0.45rem 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
  }

  .cs-extra-value {
    font-size: 0.85rem;
    font-weight: 700;
    color: #3D6B6B;
  }

  .cs-extra-label {
    font-size: 0.6rem;
    color: #888;
    font-weight: 500;
  }

  .cs-extra-detail {
    font-size: 0.58rem;
    color: #aaa;
    font-style: italic;
  }

  .cs-meta-row {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .cs-meta-item {
    font-size: 0.72rem;
    color: #666;
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
  }

  .cs-meta-item i {
    color: #3D6B6B;
    font-size: 0.65rem;
    margin-top: 0.15rem;
  }

  .cs-meta-item.challenge i {
    color: #f59e0b;
  }

  .cs-source {
    font-size: 0.6rem;
    color: #aaa;
    font-style: italic;
  }

  .cs-expand-hint {
    text-align: center;
    color: #ccc;
    font-size: 0.65rem;
    transition: color 0.2s ease;
  }

  .cs-card:hover .cs-expand-hint {
    color: #3D6B6B;
  }

  @media (max-width: 768px) {
    .cs-grid {
      grid-template-columns: 1fr;
    }

    .cs-stats-strip {
      flex-wrap: wrap;
    }

    .cs-stat {
      min-width: 80px;
    }
  }
</style>

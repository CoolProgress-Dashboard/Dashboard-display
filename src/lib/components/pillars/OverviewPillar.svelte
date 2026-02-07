<script lang="ts">
  export let active: boolean = false;
  export let onNavigate: (pillar: string) => void = () => {};

  import HeroSection from '$lib/components/hero/HeroSection.svelte';
  import CountrySpotlight from '$lib/components/charts/CountrySpotlight.svelte';
  import PeakLoadChart from '$lib/components/charts/PeakLoadChart.svelte';
  import AcGrowthChart from '$lib/components/charts/AcGrowthChart.svelte';
  import { partners } from '$lib/data/partner-data';
</script>

<section id="view-overview" class="view-section" class:active>
  <div class="overview-single-col">
    <!-- Animated Hero Banner -->
    <HeroSection on:navigate={(e) => onNavigate(e.detail)} />

    <!-- AC Growth Chart -->
    <AcGrowthChart />

    <!-- Peak Electricity Load Chart -->
    <PeakLoadChart />

    <!-- Country Spotlight Cards -->
    <CountrySpotlight />

    <!-- Compact Partner Bar -->
    <div class="partner-bar card-panel">
      <div class="partner-bar-header">
        <i class="fa-solid fa-handshake"></i>
        <span class="partner-bar-title">Powered by Our Partners</span>
        <button
          class="partner-bar-cta"
          type="button"
          on:click={() => onNavigate('partners')}
        >
          View All <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
      <div class="partner-bar-logos">
        {#each partners as partner (partner.id)}
          <a
            href={partner.coolingUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="partner-bar-logo"
            title={partner.fullName}
          >
            <img src={partner.logoPath} alt={partner.name} />
          </a>
        {/each}
      </div>
    </div>

    <!-- CTA -->
    <div class="overview-cta compact-cta">
      <div class="cta-content">
        <h2>Explore the Pillars of Transition</h2>
        <p>Track global progress on emissions, efficiency, refrigerants, access, and policy frameworks.</p>
        <div class="cta-pointer">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Use the navigation pane to explore each section</span>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .overview-single-col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .partner-bar {
    padding: 1rem 1.5rem;
  }

  .partner-bar-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .partner-bar-header > i {
    color: #3D6B6B;
    font-size: 0.9rem;
  }

  .partner-bar-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #333;
    flex: 1;
  }

  .partner-bar-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.72rem;
    font-weight: 700;
    color: #3D6B6B;
    background: rgba(61, 107, 107, 0.06);
    border: 1px solid rgba(61, 107, 107, 0.15);
    border-radius: 999px;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .partner-bar-cta:hover {
    background: #3D6B6B;
    color: #fff;
    border-color: #3D6B6B;
  }

  .partner-bar-cta i {
    font-size: 0.6rem;
    transition: transform 0.2s ease;
  }

  .partner-bar-cta:hover i {
    transform: translateX(2px);
  }

  .partner-bar-logos {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .partner-bar-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
  }

  .partner-bar-logo:hover {
    opacity: 1;
    transform: translateY(-2px);
  }

  .partner-bar-logo img {
    max-width: 90px;
    max-height: 36px;
    object-fit: contain;
  }
</style>

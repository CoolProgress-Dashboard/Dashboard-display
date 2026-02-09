<script lang="ts">
  import { onMount } from 'svelte';
  export let active: boolean = false;
  export let onNavigate: (pillar: string) => void = () => {};

  import HeroSection from '$lib/components/hero/HeroSection.svelte';
  import CountrySpotlight from '$lib/components/charts/CountrySpotlight.svelte';
  import PeakLoadChart from '$lib/components/charts/PeakLoadChart.svelte';
  import ApplianceGrowthChart from '$lib/components/charts/ApplianceGrowthChart.svelte';
  import { partners } from '$lib/data/partner-data';
  import { partnerNews, NEWS_LAST_UPDATED, CATEGORY_META, type NewsItem } from '$lib/data/partner-news';

  let activeFilter: NewsItem['category'] | 'all' = 'all';
  const categoryKeys = Object.keys(CATEGORY_META) as NewsItem['category'][];

  $: filteredNews = activeFilter === 'all'
    ? partnerNews
    : partnerNews.filter(n => n.category === activeFilter);

  let newsRevealed = false;
  onMount(() => {
    const t = setTimeout(() => { newsRevealed = true; }, 200);
    return () => clearTimeout(t);
  });
</script>

<section id="view-overview" class="view-section" class:active>
  <div class="overview-single-col">
    <!-- Animated Hero Banner -->
    <HeroSection on:navigate={(e) => onNavigate(e.detail)} />

    <!-- Appliance Growth Chart (multi-toggle: AC, DomRef, Fans) -->
    <ApplianceGrowthChart />

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

    <!-- Latest News Card (pillar-style) -->
    <div class="card-panel news-story-card" class:revealed={newsRevealed}>
      <!-- Header -->
      <div class="news-story-header">
        <div class="news-story-text">
          <h2 class="news-headline">
            <i class="fa-solid fa-newspaper"></i>
            Latest News
            <span class="news-badge">{partnerNews.length}</span>
          </h2>
          <p class="news-subhead">Key developments from across the global cooling ecosystem</p>
        </div>
        <div class="news-updated">Updated {NEWS_LAST_UPDATED}</div>
      </div>

      <!-- Category filter pills -->
      <div class="news-filter-row">
        <button
          class="news-pill"
          class:active={activeFilter === 'all'}
          type="button"
          on:click={() => activeFilter = 'all'}
        >All</button>
        {#each categoryKeys as cat}
          <button
            class="news-pill"
            class:active={activeFilter === cat}
            type="button"
            on:click={() => activeFilter = cat}
          >
            <i class="fa-solid {CATEGORY_META[cat].icon}"></i>
            {CATEGORY_META[cat].label}
          </button>
        {/each}
      </div>

      <!-- News items grid -->
      <div class="news-grid">
        {#each filteredNews as item (item.id)}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="news-card"
          >
            <div class="news-card-icon" style="background: {item.color}14; color: {item.color}">
              <i class="fa-solid {item.icon}"></i>
            </div>
            <div class="news-card-body">
              <div class="news-card-meta">
                <span class="news-card-cat" style="color: {item.color}">{item.category}</span>
                <span class="news-card-date">{item.date}</span>
                <span class="news-card-source">&middot; {item.source}</span>
              </div>
              <p class="news-card-headline">{item.headline}</p>
              <p class="news-card-summary">{item.summary}</p>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square news-card-ext"></i>
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

  /* ===========================
     LATEST NEWS - Pillar-style card
     =========================== */
  .news-story-card {
    border-left: 4px solid #3D6B6B;
    padding: 1.75rem;
    position: relative;
    overflow: visible;
  }

  .news-story-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(61, 107, 107, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .news-story-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .news-story-text {
    flex: 1;
    min-width: 0;
  }

  .news-headline {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 0 0 0.4rem;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .news-headline i {
    color: #3D6B6B;
    font-size: 1rem;
  }

  .news-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    background: #3D6B6B;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    border-radius: 11px;
    padding: 0 6px;
  }

  .news-subhead {
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
  }

  .news-updated {
    font-size: 0.65rem;
    color: #94a3b8;
    font-weight: 500;
    white-space: nowrap;
    margin-top: 0.25rem;
  }

  /* Filter pills */
  .news-filter-row {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
    margin-bottom: 1.25rem;
  }

  .news-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem 0.7rem;
    font-size: 0.72rem;
    font-weight: 600;
    font-family: inherit;
    color: #64748b;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .news-pill i {
    font-size: 0.55rem;
  }

  .news-pill:hover {
    border-color: #94a3b8;
    color: #334155;
  }

  .news-pill.active {
    background: #3D6B6B;
    border-color: #3D6B6B;
    color: #fff;
  }

  /* News grid */
  .news-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .news-card {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem;
    border-radius: 12px;
    background: #fafbfc;
    border: 1px solid #f1f5f9;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .news-card:hover {
    border-color: #3D6B6B;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }

  .news-card-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .news-card-body {
    flex: 1;
    min-width: 0;
  }

  .news-card-meta {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.25rem;
  }

  .news-card-cat {
    font-size: 0.58rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .news-card-date {
    font-size: 0.58rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .news-card-source {
    font-size: 0.58rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .news-card-headline {
    font-size: 0.8rem;
    font-weight: 600;
    color: #334155;
    line-height: 1.35;
    margin: 0 0 0.3rem;
  }

  .news-card:hover .news-card-headline {
    color: #3D6B6B;
  }

  .news-card-summary {
    font-size: 0.7rem;
    color: #64748b;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .news-card-ext {
    font-size: 0.5rem;
    color: #cbd5e1;
    flex-shrink: 0;
    margin-top: 0.3rem;
    transition: color 0.15s ease;
  }

  .news-card:hover .news-card-ext {
    color: #3D6B6B;
  }

  /* Reveal animation */
  .news-story-card {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .news-story-card.revealed {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    .news-story-card {
      padding: 1.25rem;
    }

    .news-grid {
      grid-template-columns: 1fr;
    }

    .news-story-header {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>

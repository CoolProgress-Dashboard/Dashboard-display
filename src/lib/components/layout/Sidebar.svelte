<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { partnerNews, NEWS_LAST_UPDATED, CATEGORY_META, type NewsItem } from '$lib/data/partner-news';
  import type { Country } from '$lib/services/dashboard-types';

  export let currentView: string = 'overview'; // kept for legacy compatibility
  export let countries: Country[] = [];

  let newsExpanded = false;
  let activeFilter: NewsItem['category'] | 'all' = 'all';

  const categoryKeys = Object.keys(CATEGORY_META) as NewsItem['category'][];

  $: filteredNews = activeFilter === 'all'
    ? partnerNews
    : partnerNews.filter(n => n.category === activeFilter);

  // Active view comes from the URL
  $: activeView = $page.url.pathname.split('/').at(-1) ?? 'overview';
  $: selectedCountry = $page.url.searchParams.get('country') ?? '';

  function handleCountryChange(e: Event) {
    const value = (e.currentTarget as HTMLSelectElement).value;
    const url = new URL($page.url);
    if (value) {
      url.searchParams.set('country', value);
    } else {
      url.searchParams.delete('country');
    }
    goto(url.toString(), { replaceState: true, noScroll: true });
  }

  const navLinks = [
    { view: 'overview',  label: 'Strategic Summary',       icon: 'fa-house',          color: '#0369a1' },
    { view: 'emissions', label: '1. Emissions',             icon: 'fa-smog',           color: '#dc2626' },
    { view: 'meps',      label: '2. Product Efficiency',    icon: 'fa-bolt',           color: '#d97706' },
    { view: 'kigali',    label: '3. Refrigerant Transition',icon: 'fa-flask',          color: '#0891b2' },
    { view: 'access',    label: '4. Access & Vulnerability',icon: 'fa-people-roof',    color: '#2D7D5A' },
    { view: 'policy',    label: '5. Policy Framework',      icon: 'fa-scale-balanced', color: '#7c3aed' },
  ];
</script>

<aside class="sidebar-left">
  <div class="sidebar-logo">
    <div class="logo-mark">
      <i class="fa-solid fa-temperature-arrow-down"></i>
    </div>
    <div class="logo-text">COOL<span>PROGRESS</span></div>
  </div>

  <div class="sidebar-filters">
    <label class="filter-label" for="country-filter">Country Selected</label>
    <select
      id="country-filter"
      class="filter-select"
      value={selectedCountry}
      on:change={handleCountryChange}
    >
      <option value="">All Countries</option>
      {#each countries.sort((a, b) => (a.country_name ?? '').localeCompare(b.country_name ?? '')) as country (country.country_code)}
        <option value={country.country_code}>{country.country_name}</option>
      {/each}
    </select>
  </div>

  <div class="nav-section">
    <h3>Navigation Pillars</h3>
    {#each navLinks as link}
      <a
        href="/dashboard/{link.view}"
        class="nav-btn nav-item"
        class:active={activeView === link.view}
        data-view={link.view}
        style="--nav-color: {link.color}; --nav-bg: {link.color}12"
      >
        <span class="nav-icon"><i class="fa-solid {link.icon}"></i></span>
        <span>{link.label}</span>
      </a>
    {/each}
  </div>

  <div class="nav-section nav-section-partners">
    <a
      href="/dashboard/partners"
      class="nav-btn nav-item nav-item-partners"
      class:active={activeView === 'partners'}
      data-view="partners"
    >
      <span class="nav-icon"><i class="fa-solid fa-handshake"></i></span>
      <span>Partner Ecosystem</span>
    </a>
  </div>

  <!-- Latest News Section -->
  <div class="sidebar-news">
    <button
      class="news-toggle"
      type="button"
      on:click={() => newsExpanded = !newsExpanded}
      aria-expanded={newsExpanded}
    >
      <span class="news-toggle-left">
        <i class="fa-solid fa-newspaper"></i>
        <span>Latest News</span>
        <span class="news-count">{partnerNews.length}</span>
      </span>
      <i class="fa-solid fa-chevron-down news-chevron" class:rotated={newsExpanded}></i>
    </button>

    {#if newsExpanded}
      <div class="news-panel">
        <!-- Category filter pills -->
        <div class="news-filters">
          <button
            class="news-filter-pill"
            class:active={activeFilter === 'all'}
            type="button"
            on:click={() => activeFilter = 'all'}
          >All</button>
          {#each categoryKeys as cat}
            <button
              class="news-filter-pill"
              class:active={activeFilter === cat}
              type="button"
              on:click={() => activeFilter = cat}
              style="--pill-color: {CATEGORY_META[cat].color}"
            >
              <i class="fa-solid {CATEGORY_META[cat].icon}"></i>
              {CATEGORY_META[cat].label}
            </button>
          {/each}
        </div>

        <!-- News items list -->
        <div class="news-list">
          {#each filteredNews as item (item.id)}
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="news-item"
            >
              <div class="news-item-icon" style="background: {item.color}18; color: {item.color}">
                <i class="fa-solid {item.icon}"></i>
              </div>
              <div class="news-item-body">
                <div class="news-item-meta">
                  <span class="news-cat-tag" style="color: {item.color}">{item.category}</span>
                  <span class="news-item-date">{item.date}</span>
                </div>
                <p class="news-item-headline">{item.headline}</p>
                <p class="news-item-source">{item.source}</p>
              </div>
              <i class="fa-solid fa-arrow-up-right-from-square news-ext-icon"></i>
            </a>
          {/each}
        </div>

        <div class="news-footer">
          <span>Updated {NEWS_LAST_UPDATED}</span>
        </div>
      </div>
    {/if}
  </div>
</aside>

<style>
  /* Anchor nav links styled like the old nav buttons */
  .nav-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: inherit;
  }

  /* Per-pillar active state using CSS variable set via inline style */
  .nav-btn.active {
    background: var(--nav-bg, rgba(6, 147, 227, 0.08)) !important;
    color: var(--nav-color, #0369a1) !important;
  }

  .nav-btn.active .nav-icon {
    color: var(--nav-color, #0369a1);
  }

  /* Override the global ::before bar color */
  .nav-btn.active::before {
    background: var(--nav-color, #0369a1) !important;
  }

  /* Latest News - Sidebar Section */
  .sidebar-news {
    margin-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
  }

  .news-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.4rem 1.25rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #475569;
    font-size: 0.7rem;
    font-weight: 600;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .news-toggle:hover {
    background: #f8fafc;
    color: #1a6b5a;
  }

  .news-toggle-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .news-toggle-left > i {
    font-size: 0.7rem;
    color: #1a6b5a;
  }

  .news-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 0.3rem;
    background: #1a6b5a;
    color: #fff;
    font-size: 0.55rem;
    font-weight: 700;
    border-radius: 9px;
  }

  .news-chevron {
    font-size: 0.55rem;
    transition: transform 0.25s ease;
    color: #94a3b8;
  }

  .news-chevron.rotated {
    transform: rotate(180deg);
  }

  /* News Panel */
  .news-panel {
    padding: 0 0.75rem 0.75rem;
    max-height: 420px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }

  .news-panel::-webkit-scrollbar {
    width: 4px;
  }

  .news-panel::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }

  /* Filter pills */
  .news-filters {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    padding: 0.25rem 0 0.5rem;
  }

  .news-filter-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 99px;
    background: #fff;
    color: #64748b;
    font-size: 0.6rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
  }

  .news-filter-pill i {
    font-size: 0.5rem;
  }

  .news-filter-pill:hover {
    border-color: #94a3b8;
    color: #334155;
  }

  .news-filter-pill.active {
    background: #1a6b5a;
    border-color: #1a6b5a;
    color: #fff;
  }

  /* News list */
  .news-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .news-item {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.55rem 0.5rem;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.15s ease;
    border: 1px solid transparent;
  }

  .news-item:hover {
    background: #f8fafc;
    border-color: #e2e8f0;
  }

  .news-item-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .news-item-body {
    flex: 1;
    min-width: 0;
  }

  .news-item-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.15rem;
  }

  .news-cat-tag {
    font-size: 0.52rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .news-item-date {
    font-size: 0.52rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .news-item-headline {
    font-size: 0.72rem;
    font-weight: 600;
    color: #334155;
    line-height: 1.35;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .news-item:hover .news-item-headline {
    color: #1a6b5a;
  }

  .news-item-source {
    font-size: 0.58rem;
    color: #94a3b8;
    margin: 0.1rem 0 0;
    font-weight: 500;
  }

  .news-ext-icon {
    font-size: 0.45rem;
    color: #cbd5e1;
    flex-shrink: 0;
    margin-top: 0.35rem;
    transition: color 0.15s ease;
  }

  .news-item:hover .news-ext-icon {
    color: #1a6b5a;
  }

  /* Footer */
  .news-footer {
    padding: 0.4rem 0.5rem 0;
    border-top: 1px solid #f1f5f9;
    margin-top: 0.5rem;
    text-align: center;
  }

  .news-footer span {
    font-size: 0.55rem;
    color: #94a3b8;
    font-weight: 500;
    font-style: italic;
  }
</style>

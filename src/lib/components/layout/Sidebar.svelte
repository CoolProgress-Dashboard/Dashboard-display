<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { FEATURED_NEWS, NEWS_COUNT } from '$lib/data/partner-news';
  import type { Country } from '$lib/services/dashboard-types';

  export let currentView: string = 'overview'; // kept for legacy compatibility
  export let countries: Country[] = [];

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
    { view: 'policy',    label: '5. National Plans & Commitments',  icon: 'fa-scale-balanced', color: '#7c3aed' },
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
      href="/dashboard/feedback"
      class="nav-btn nav-item nav-item-feedback"
      class:active={activeView === 'feedback'}
      data-view="feedback"
    >
      <span class="nav-icon"><i class="fa-solid fa-comment-dots"></i></span>
      <span>Give Feedback</span>
    </a>
  </div>

  <!-- Cool News — fixed widget pinned to the bottom of the left pane; hidden on the news page itself -->
  {#if activeView !== 'news'}
    <a
      href="/dashboard/news"
      class="cool-news-widget"
      data-view="news"
      style="--fc: {FEATURED_NEWS.color}"
    >
      <div class="cnw-head">
        <span class="cnw-eyebrow"><i class="fa-solid fa-newspaper"></i> Cool News</span>
        <span class="cnw-count">{NEWS_COUNT}</span>
      </div>
      <div class="cnw-feature">
        <p class="cnw-feature-text">{FEATURED_NEWS.headline}</p>
      </div>
      <span class="cnw-all">Read all cooling news <i class="fa-solid fa-arrow-right"></i></span>
    </a>
  {/if}
</aside>

<style>
  /* Anchor nav links styled like the old nav buttons */
  .nav-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: var(--nav-color, #334155);
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

  /* Feedback nav item */
  .nav-item-feedback {
    --nav-color: #1a6b5a;
    --nav-bg: #1a6b5a12;
  }

  /* Cool News — fixed light widget pinned to the bottom of the left pane */
  .cool-news-widget {
    margin: auto 0.75rem 0.9rem;
    display: block;
    text-decoration: none;
    background: #f8fafc;
    border: 2px solid #2D7D5A;
    border-radius: 14px;
    padding: 0.9rem 1rem 0.85rem;
    transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  }
  .cool-news-widget:hover {
    border-color: #24664a;
    box-shadow: 0 8px 22px rgba(15, 42, 71, 0.12);
    transform: translateY(-2px);
  }

  .cnw-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.6rem;
  }
  .cnw-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #0d9488;
  }
  .cnw-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 0.3rem;
    font-size: 0.6rem;
    font-weight: 700;
    color: #ffffff;
    background: #0d9488;
    border-radius: 9px;
  }

  .cnw-feature {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    margin-bottom: 0.7rem;
  }
  .cnw-feature-text {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.4;
    color: #1e293b;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .cnw-all {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.72rem;
    font-weight: 700;
    color: #0f2a47;
  }
  .cnw-all i { transition: transform 0.15s ease; }
  .cool-news-widget:hover .cnw-all i { transform: translateX(3px); }
</style>

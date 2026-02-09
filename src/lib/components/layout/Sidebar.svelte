<script lang="ts">
  import { partnerNews, NEWS_LAST_UPDATED, CATEGORY_META, type NewsItem } from '$lib/data/partner-news';

  export let currentView: string = 'overview';
  export let onViewChange: (view: string) => void = () => {};
  export let onScopeChange: (scope: string) => void = () => {};
  export let scopeDisabled: boolean = false;
  export let activeScope: string = 'ac';

  let newsExpanded = false;
  let activeFilter: NewsItem['category'] | 'all' = 'all';

  const categoryKeys = Object.keys(CATEGORY_META) as NewsItem['category'][];

  $: filteredNews = activeFilter === 'all'
    ? partnerNews
    : partnerNews.filter(n => n.category === activeFilter);
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
    <select id="country-filter" class="filter-select">
      <option value="">All Countries</option>
    </select>

    <label class="filter-label scope-label" class:disabled={scopeDisabled}>Appliance Scope</label>
    <div class="scope-toggle" class:disabled={scopeDisabled}>
      <button
        class="scope-btn"
        class:active={activeScope === 'ac'}
        data-scope="ac"
        type="button"
        disabled={scopeDisabled}
        on:click={() => onScopeChange('ac')}
      >ACs</button>
      <button
        class="scope-btn"
        class:active={activeScope === 'fridge'}
        data-scope="fridge"
        type="button"
        disabled={scopeDisabled}
        on:click={() => onScopeChange('fridge')}
      >Fridges</button>
      <button
        class="scope-btn"
        class:active={activeScope === 'fan'}
        data-scope="fan"
        type="button"
        disabled={scopeDisabled}
        on:click={() => onScopeChange('fan')}
      >Fans</button>
    </div>
  </div>

  <div class="nav-section">
    <h3>Navigation Pillars</h3>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'overview'}
      data-view="overview"
      type="button"
      on:click={() => onViewChange('overview')}
    >
      <span class="nav-icon"><i class="fa-solid fa-house"></i></span>
      <span>Strategic Summary</span>
    </button>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'emissions'}
      data-view="emissions"
      type="button"
      on:click={() => onViewChange('emissions')}
    >
      <span class="nav-icon"><i class="fa-solid fa-smog"></i></span>
      <span>1. Emissions</span>
    </button>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'meps'}
      data-view="meps"
      type="button"
      on:click={() => onViewChange('meps')}
    >
      <span class="nav-icon"><i class="fa-solid fa-bolt"></i></span>
      <span>2. Product Efficiency</span>
    </button>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'kigali'}
      data-view="kigali"
      type="button"
      on:click={() => onViewChange('kigali')}
    >
      <span class="nav-icon"><i class="fa-solid fa-flask"></i></span>
      <span>3. Refrigerant Transition</span>
    </button>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'access'}
      data-view="access"
      type="button"
      on:click={() => onViewChange('access')}
    >
      <span class="nav-icon"><i class="fa-solid fa-people-roof"></i></span>
      <span>4. Access &amp; Vulnerability</span>
    </button>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'policy'}
      data-view="policy"
      type="button"
      on:click={() => onViewChange('policy')}
    >
      <span class="nav-icon"><i class="fa-solid fa-scale-balanced"></i></span>
      <span>5. Policy Framework</span>
    </button>
  </div>

  <div class="nav-section nav-section-partners">
    <button
      class="nav-btn nav-item nav-item-partners"
      class:active={currentView === 'partners'}
      data-view="partners"
      type="button"
      on:click={() => onViewChange('partners')}
    >
      <span class="nav-icon"><i class="fa-solid fa-handshake"></i></span>
      <span>Partner Ecosystem</span>
    </button>
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
  /* Latest News - Sidebar Section */
  .sidebar-news {
    border-top: 1px solid #f1f5f9;
    margin-top: auto;
  }

  .news-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #475569;
    font-size: 0.8rem;
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
    font-size: 0.75rem;
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

<script lang="ts">
  import { partnerNews, NEWS_LAST_UPDATED, CATEGORY_META, type NewsItem } from '$lib/data/partner-news';

  let activeFilter: NewsItem['category'] | 'all' = 'all';
  const categoryKeys = Object.keys(CATEGORY_META) as NewsItem['category'][];

  $: filteredNews = activeFilter === 'all'
    ? partnerNews
    : partnerNews.filter((n) => n.category === activeFilter);
</script>

<section class="news-page">
  <div class="news-page-inner">
    <a class="news-back" href="/dashboard/overview"><i class="fa-solid fa-arrow-left"></i> Back to dashboard</a>

    <header class="news-page-head">
      <span class="news-page-eyebrow"><i class="fa-solid fa-newspaper"></i> Cool News</span>
      <h1 class="news-page-title">The latest in cooling</h1>
      <p class="news-page-sub">Curated developments from across the global cooling ecosystem. Last updated {NEWS_LAST_UPDATED}.</p>
    </header>

    <div class="news-page-filters">
      <button class="np-pill" class:active={activeFilter === 'all'} type="button" on:click={() => (activeFilter = 'all')}>All</button>
      {#each categoryKeys as cat}
        <button
          class="np-pill"
          class:active={activeFilter === cat}
          type="button"
          on:click={() => (activeFilter = cat)}
          style="--pill-color: {CATEGORY_META[cat].color}"
        >
          <i class="fa-solid {CATEGORY_META[cat].icon}"></i>
          {CATEGORY_META[cat].label}
        </button>
      {/each}
    </div>

    <div class="news-page-grid">
      {#each filteredNews as item (item.id)}
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" class="np-card">
          <div class="np-card-icon" style="background: {item.color}14; color: {item.color}">
            <i class="fa-solid {item.icon}"></i>
          </div>
          <div class="np-card-body">
            <div class="np-card-meta">
              <span class="np-card-cat" style="color: {item.color}">{item.category}</span>
              <span class="np-card-date">{item.date}</span>
              <span class="np-card-source">&middot; {item.source}</span>
            </div>
            <p class="np-card-headline">{item.headline}</p>
            <p class="np-card-summary">{item.summary}</p>
          </div>
          <i class="fa-solid fa-arrow-up-right-from-square np-card-ext"></i>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  .news-page {
    padding: 2rem clamp(1rem, 3vw, 2.5rem) 4rem;
    max-width: 1100px;
    margin: 0 auto;
  }
  .news-back {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: #64748b;
    text-decoration: none;
    margin-bottom: 1.4rem;
  }
  .news-back:hover { color: #0f2a47; }

  .news-page-head { margin-bottom: 1.6rem; }
  .news-page-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #0d9488;
    margin-bottom: 0.6rem;
  }
  .news-page-title {
    font-size: clamp(1.6rem, 3vw, 2.3rem);
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #0f2a47;
    margin: 0 0 0.5rem;
  }
  .news-page-sub { font-size: 0.95rem; color: #475569; margin: 0; max-width: 640px; }

  .news-page-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1.4rem 0 1.8rem;
  }
  .np-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: #475569;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 0.4rem 0.9rem;
    cursor: pointer;
    transition: all 0.15s;
  }
  .np-pill:hover { border-color: #cbd5e1; }
  .np-pill.active {
    color: #fff;
    background: var(--pill-color, #0f2a47);
    border-color: var(--pill-color, #0f2a47);
  }

  .news-page-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
  }
  .np-card {
    display: flex;
    gap: 0.9rem;
    align-items: flex-start;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.1rem 1.2rem;
    text-decoration: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;
  }
  .np-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
    transform: translateY(-2px);
  }
  .np-card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }
  .np-card-body { flex: 1; min-width: 0; }
  .np-card-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    margin-bottom: 0.4rem;
  }
  .np-card-cat { font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
  .np-card-date { color: #64748b; }
  .np-card-source { color: #94a3b8; }
  .np-card-headline { font-size: 0.95rem; font-weight: 700; color: #0f2a47; line-height: 1.3; margin: 0 0 0.35rem; }
  .np-card-summary { font-size: 0.83rem; color: #475569; line-height: 1.55; margin: 0; }
  .np-card-ext { color: #cbd5e1; font-size: 0.8rem; flex-shrink: 0; margin-top: 0.2rem; }
  .np-card:hover .np-card-ext { color: #0d9488; }
</style>

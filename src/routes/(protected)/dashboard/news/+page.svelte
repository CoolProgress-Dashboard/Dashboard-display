<script lang="ts">
  import { partnerNews, NEWS_LAST_UPDATED } from '$lib/data/partner-news';

  // Format an ISO date (YYYY-MM-DD) as e.g. "6 Sep 2026"
  function formatNewsDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<section class="news-page">
  <div class="news-page-inner">
    <a class="news-back" href="/dashboard/overview"><i class="fa-solid fa-arrow-left"></i> Back to dashboard</a>

    <header class="news-page-head">
      <h1 class="news-page-title">Cool News</h1>
      <p class="news-page-sub">Interesting stories from around the world of cooling</p>
      <p class="news-page-updated">Last updated {formatNewsDate(NEWS_LAST_UPDATED)}</p>
    </header>

    <div class="news-list">
      {#each partnerNews as item (item.id)}
        <article class="news-item" style="--c: {item.color}">
          <span class="news-ico"><i class="fa-solid {item.icon}"></i></span>
          <div class="news-body">
            {#if item.dateLabel || item.date}
              <span class="news-date">{item.dateLabel ?? formatNewsDate(item.date)}</span>
            {/if}
            {#if item.links.length === 1}
              <a class="news-headline" href={item.links[0].url} target="_blank" rel="noopener noreferrer"
                >{item.headline} <span class="news-src">| {item.links[0].label}</span></a>
            {:else}
              <h3 class="news-headline news-headline-static">
                {item.headline}
                <span class="news-src">| {#each item.links as link, i}<a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer">{link.label}</a>{#if i < item.links.length - 1} · {/if}{/each}</span>
              </h3>
            {/if}
            {#if item.summary}
              <p class="news-summary">{item.summary}</p>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .news-page {
    padding: 2rem clamp(1.5rem, 4vw, 4rem) 4rem;
    max-width: 1400px;
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

  .news-page-head {
    margin-bottom: 1.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid #cbd5e1;
  }
  .news-page-title {
    font-size: clamp(1.9rem, 3.4vw, 2.7rem);
    font-weight: 800;
    letter-spacing: -0.6px;
    color: #0f2a47;
    margin: 0 0 0.4rem;
  }
  .news-page-sub { font-size: 1.05rem; color: #475569; margin: 0 0 0.35rem; }
  .news-page-updated {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    color: #94a3b8;
    margin: 0;
  }

  /* Editorial single feed: hairline between items, no boxes, no color bars */
  .news-list { display: flex; flex-direction: column; }
  .news-item {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 1.5rem 0;
    border-bottom: 1px solid #e9edf2;
  }
  .news-item:last-child { border-bottom: none; }

  /* Icons carry the only colour on the page */
  .news-ico {
    flex-shrink: 0;
    width: 2.6rem;
    text-align: center;
    font-size: 1.45rem;
    color: var(--c, #1e3a5f);
    padding-top: 0.15rem;
  }

  .news-body { flex: 1 1 auto; min-width: 0; }
  .news-date {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 0.3rem;
  }
  .news-headline {
    display: block;
    font-size: 1.3rem;
    font-weight: 800;
    color: #0f2a47;
    line-height: 1.32;
    letter-spacing: -0.2px;
    margin: 0 0 0.45rem;
    text-decoration: none;
  }
  a.news-headline:hover { text-decoration: underline; text-underline-offset: 3px; }
  .news-headline-static { cursor: default; }

  /* Source outlet appended to the headline, e.g. "… | Carbon Brief" */
  .news-src {
    font-weight: 600;
    color: #64748b;
  }
  .news-headline-static .news-src a {
    color: #64748b;
    text-decoration: none;
  }
  .news-headline-static .news-src a:hover {
    color: #0f2a47;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .news-summary {
    font-size: 0.98rem;
    color: #52606d;
    line-height: 1.62;
    margin: 0;
  }

  @media (max-width: 600px) {
    .news-ico { display: none; }
  }
</style>

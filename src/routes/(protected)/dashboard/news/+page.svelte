<script lang="ts">
  import {
    partnerNews,
    NEWS_LAST_UPDATED,
    NEWS_SOURCE,
    SECTION_META,
    SECTION_ORDER,
    type NewsSection
  } from '$lib/data/partner-news';

  // Format an ISO date (YYYY-MM-DD) as e.g. "6 Sep 2026"
  function formatNewsDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Group the digest items by section, preserving the digest order
  const grouped = SECTION_ORDER
    .map((section) => ({
      section: section as NewsSection,
      meta: SECTION_META[section],
      items: partnerNews.filter((n) => n.section === section)
    }))
    .filter((g) => g.items.length > 0);
</script>

<section class="news-page">
  <div class="news-page-inner">
    <a class="news-back" href="/dashboard/overview"><i class="fa-solid fa-arrow-left"></i> Back to dashboard</a>

    <header class="news-page-head">
      <span class="news-page-eyebrow"><i class="fa-solid fa-newspaper"></i> Cool News</span>
      <h1 class="news-page-title">The latest in cooling</h1>
      <p class="news-page-sub">{NEWS_SOURCE}. Updated {NEWS_LAST_UPDATED}.</p>
    </header>

    {#each grouped as group (group.section)}
      <section class="news-section">
        <div class="news-section-head">
          <span class="nsh-label"><i class="fa-solid {group.meta.icon}"></i> {group.meta.label}</span>
          <span class="nsh-count">{group.items.length}</span>
        </div>

        <div class="news-list">
          {#each group.items as item (item.id)}
            <article class="news-item" style="--c: {item.color}">
              <span class="news-ico"><i class="fa-solid {item.icon}"></i></span>
              <div class="news-body">
                {#if item.dateLabel || item.date}
                  <span class="news-date">{item.dateLabel ?? formatNewsDate(item.date)}</span>
                {/if}
                {#if item.links.length === 1}
                  <a class="news-headline" href={item.links[0].url} target="_blank" rel="noopener noreferrer">{item.headline}</a>
                {:else}
                  <h3 class="news-headline news-headline-static">{item.headline}</h3>
                {/if}
                {#if item.summary}
                  <p class="news-summary">{item.summary}</p>
                {/if}
              </div>
              <div class="news-sources">
                {#each item.links as link}
                  <a class="news-source" href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}<i class="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                {/each}
              </div>
            </article>
          {/each}
        </div>
      </section>
    {/each}
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

  .news-page-head { margin-bottom: 0.5rem; }
  .news-page-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #0d9488;
    margin-bottom: 0.6rem;
  }
  .news-page-title {
    font-size: clamp(1.9rem, 3.4vw, 2.7rem);
    font-weight: 800;
    letter-spacing: -0.6px;
    color: #0f2a47;
    margin: 0 0 0.5rem;
  }
  .news-page-sub { font-size: 1rem; color: #64748b; margin: 0; }

  /* Sections divided by small lines */
  .news-section { margin-top: 2.75rem; }
  .news-section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid #cbd5e1;
    margin-bottom: 0.25rem;
  }
  .nsh-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #475569;
  }
  .nsh-label i { color: #94a3b8; font-size: 0.8rem; }
  .nsh-count { font-size: 0.8rem; font-weight: 700; color: #94a3b8; }

  /* Editorial list: hairline between items, no boxes, no color bars */
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
  .news-summary {
    font-size: 0.98rem;
    color: #52606d;
    line-height: 1.62;
    margin: 0;
  }

  /* Sources on the right so items use the full width */
  .news-sources {
    flex-shrink: 0;
    width: 210px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.45rem;
    padding-top: 0.2rem;
  }
  .news-source {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: #334155;
    text-decoration: none;
  }
  .news-source i { font-size: 0.66rem; color: #94a3b8; }
  .news-source:hover { color: #0f2a47; text-decoration: underline; text-underline-offset: 2px; }

  @media (max-width: 820px) {
    .news-item { flex-wrap: wrap; gap: 0.75rem 1.25rem; }
    .news-sources {
      width: auto;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.35rem 1.1rem;
      padding-left: 3.85rem;
    }
  }
  @media (max-width: 600px) {
    .news-ico { display: none; }
    .news-sources { padding-left: 0; }
  }
</style>

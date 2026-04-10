<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  export let active: boolean = false;
  export let onNavigate: (pillar: string) => void = (pillar) => goto(`/dashboard/${pillar}`);

  import FourPillarFramework from '$lib/components/overview/FourPillarFramework.svelte';
  import CountrySpotlight from '$lib/components/charts/CountrySpotlight.svelte';
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

    <!-- ═══ UNIFIED FLOWING NARRATIVE ═══ -->
    <div class="overview-flow">

      <!-- 1 · HERO — dark navy -->
      <div class="flow-hero">
        <div class="flow-hero-inner">
          <span class="flow-eyebrow">The Cooling Crisis</span>
          <h1 class="flow-hero-headline">Cooling is one of the most significant yet overlooked drivers of climate change.</h1>
          <p class="flow-hero-body">It currently accounts for over 10% of global greenhouse gas emissions, a figure which could triple by 2050 as heatwaves become more frequent and populations grow.</p>
          <p class="flow-hero-body">This trajectory is fueled by a massive surge in demand: an additional 3 billion room air conditioners are expected to come online globally by mid-century. This creates a double-edged impact where indirect emissions from high energy consumption and direct emissions from high GWP refrigerant leaks fuel a vicious cycle of increased emissions and further warming that leaves 1.2 billion people vulnerable to life-threatening heat.</p>
          <div class="flow-stats">
            <div class="flow-stat">
              <span class="flow-stat-num">10%+</span>
              <span class="flow-stat-label">of global greenhouse gas emissions come from cooling today — a figure that could triple by 2050</span>
            </div>
            <div class="flow-stat-rule"></div>
            <div class="flow-stat">
              <span class="flow-stat-num">3 billion</span>
              <span class="flow-stat-label">additional room air conditioners expected globally by mid-century</span>
            </div>
            <div class="flow-stat-rule"></div>
            <div class="flow-stat">
              <span class="flow-stat-num">1.2 billion</span>
              <span class="flow-stat-label">people vulnerable to life-threatening heat without adequate cooling</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2 · EMISSION SOURCES — white, borderless -->
      <div class="flow-section">
        <span class="flow-eyebrow">Understanding the Problem</span>
        <h2 class="flow-title">Where Do Cooling Emissions Come From?</h2>
        <p class="flow-sub">Addressing this crisis requires a two-pronged approach to eliminate cooling-related emissions.</p>
        <div class="flow-emission-cols">
          <div class="flow-emission-col" style="--ec:#d97706; --ecbg:rgba(217,119,6,0.08)">
            <div class="flow-ec-icon"><i class="fa-solid fa-plug-circle-bolt"></i></div>
            <div>
              <h3 class="flow-ec-name">Indirect Emissions</h3>
              <p class="flow-ec-desc">Power plants generating electricity to run air conditioners and refrigeration equipment worldwide.</p>
            </div>
          </div>
          <div class="flow-emission-plus">+</div>
          <div class="flow-emission-col" style="--ec:#0d9488; --ecbg:rgba(13,148,136,0.08)">
            <div class="flow-ec-icon"><i class="fa-solid fa-wind"></i></div>
            <div>
              <h3 class="flow-ec-name">Direct Emissions</h3>
              <p class="flow-ec-desc">Leakage of F-Gas refrigerants — such as HFCs — contained within cooling appliances, which can be up to 1,000× more warming than CO₂.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 3 · OPPORTUNITY — dark green, full bleed -->
      <div class="flow-opportunity">
        <div class="flow-opp-inner">
          <div class="flow-opp-left">
            <span class="flow-eyebrow" style="color:#0e4f7a; font-size:0.9rem">The Opportunity</span>
            <h2 class="flow-opp-title">By achieving sustainable cooling, we can prevent up to <em>100 gigatons</em> of emissions by 2050.</h2>
            <p class="flow-opp-body">By transitioning to energy-efficient technology and climate-friendly refrigerants, we can significantly alleviate stress on the electrical grid, reducing the frequency of power outages and avoiding the costly need to build additional power generation infrastructure. Ultimately, these shifts directly improve quality of life, safeguarding public health by drastically reducing heat-related illnesses and deaths.</p>
          </div>
          <div class="flow-opp-right">
            <div class="flow-opp-stat">
              <span class="flow-opp-num">100 GT</span>
              <span class="flow-opp-numlab">emissions prevented by 2050</span>
            </div>
            <div class="flow-opp-benefits">
              <div class="flow-opp-benefit"><i class="fa-solid fa-bolt-lightning"></i><span>Grid stress relief &amp; fewer power outages</span></div>
              <div class="flow-opp-benefit"><i class="fa-solid fa-heart-pulse"></i><span>Reduced heat-related illnesses and deaths</span></div>
              <div class="flow-opp-benefit"><i class="fa-solid fa-leaf"></i><span>Avoided need for new power generation infrastructure</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 · FOUR PRIORITY AREAS — light grey, borderless wrapper -->
      <div class="flow-four">
        <FourPillarFramework on:navigate={(e) => onNavigate(e.detail)} />
      </div>

      <!-- 5 · BRIDGE — full-width two-col -->
      <div class="flow-bridge">
        <div class="flow-bridge-left">
          <i class="fa-solid fa-chart-line flow-bridge-icon"></i>
          <strong class="flow-bridge-heading">Explore the data behind each priority area</strong>
        </div>
        <p class="flow-bridge-body">The CoolProgress Dashboard tracks real-world progress across five dedicated pillars. Select any pillar below to dive in.</p>
      </div>

      <!-- 6 · FIVE PILLARS — white, borderless, interactive strip -->
      <div class="flow-pillars">
        <div class="flow-pillars-header">
          <div class="flow-pillars-header-left">
            <span class="flow-eyebrow">The CoolProgress Dashboard</span>
            <h2 class="flow-pillars-title">Track Progress Across Five Pillars</h2>
          </div>
          <p class="flow-pillars-sub">Explore real-world data on where the world stands on emissions, efficiency, refrigerant transitions, access to cooling, and policy frameworks — and what needs to happen next.</p>
        </div>
        <div class="dp-strip">
          <button class="dp-item" type="button" on:click={() => onNavigate('emissions')} style="--dp-color:#dc2626;--dp-bg:#fff5f5">
            <div class="dp-item-top">
              <div class="dp-item-icon"><i class="fa-solid fa-smog"></i></div>
              <div class="dp-item-num">01</div>
            </div>
            <h3 class="dp-item-label">Emissions</h3>
            <p class="dp-item-desc">Track indirect and direct GHG emissions from cooling appliances across scenarios, regions, and appliance types through 2050.</p>
            <span class="dp-item-cta">Explore <i class="fa-solid fa-arrow-right"></i></span>
          </button>
          <div class="dp-divider"></div>
          <button class="dp-item" type="button" on:click={() => onNavigate('meps')} style="--dp-color:#d97706;--dp-bg:#fffbeb">
            <div class="dp-item-top">
              <div class="dp-item-icon"><i class="fa-solid fa-bolt"></i></div>
              <div class="dp-item-num">02</div>
            </div>
            <h3 class="dp-item-label">Product Efficiency</h3>
            <p class="dp-item-desc">Monitor MEPS adoption globally for room ACs, refrigerators, and fans — who has standards, when updated, and the inverter transition.</p>
            <span class="dp-item-cta">Explore <i class="fa-solid fa-arrow-right"></i></span>
          </button>
          <div class="dp-divider"></div>
          <button class="dp-item" type="button" on:click={() => onNavigate('kigali')} style="--dp-color:#0891b2;--dp-bg:#f0f9ff">
            <div class="dp-item-top">
              <div class="dp-item-icon"><i class="fa-solid fa-flask"></i></div>
              <div class="dp-item-num">03</div>
            </div>
            <h3 class="dp-item-label">Refrigerant Transition</h3>
            <p class="dp-item-desc">Follow the Kigali Amendment phase-down schedule, ratification status, and the global shift to lower-GWP refrigerants.</p>
            <span class="dp-item-cta">Explore <i class="fa-solid fa-arrow-right"></i></span>
          </button>
          <div class="dp-divider"></div>
          <button class="dp-item" type="button" on:click={() => onNavigate('access')} style="--dp-color:#2D7D5A;--dp-bg:#f0fdf4">
            <div class="dp-item-top">
              <div class="dp-item-icon"><i class="fa-solid fa-people-roof"></i></div>
              <div class="dp-item-num">04</div>
            </div>
            <h3 class="dp-item-label">Access &amp; Vulnerability</h3>
            <p class="dp-item-desc">Map the 1.2 billion people at risk from life-threatening heat, broken down by region, income group, and risk level.</p>
            <span class="dp-item-cta">Explore <i class="fa-solid fa-arrow-right"></i></span>
          </button>
          <div class="dp-divider"></div>
          <button class="dp-item" type="button" on:click={() => onNavigate('policy')} style="--dp-color:#7c3aed;--dp-bg:#faf5ff">
            <div class="dp-item-top">
              <div class="dp-item-icon"><i class="fa-solid fa-scale-balanced"></i></div>
              <div class="dp-item-num">05</div>
            </div>
            <h3 class="dp-item-label">Policy Framework</h3>
            <p class="dp-item-desc">Track the Global Cooling Pledge, NDC cooling mentions, Kigali Implementation Plans, and National Cooling Action Plans.</p>
            <span class="dp-item-cta">Explore <i class="fa-solid fa-arrow-right"></i></span>
          </button>
        </div>
      </div>

    </div><!-- /overview-flow -->

    <!-- CountrySpotlight removed temporarily, to be used later -->
    <!-- <CountrySpotlight /> -->

    <!-- Compact Partner Bar -->
    <div class="partner-bar card-panel">
      <div class="partner-bar-header">
        <i class="fa-solid fa-handshake"></i>
        <span class="partner-bar-title">Powered by Our Partners</span>
        <button
          class="partner-bar-cta"
          type="button"
          on:click={() => { onNavigate('partners'); setTimeout(() => { document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'instant' }); }, 50); }}
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
    <div class="news-story-card" class:revealed={newsRevealed}>
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

  </div>
</section>

<style>
  /* ─── outer layout ─────────────────────── */
  .overview-single-col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* ─── unified flow container ────────────── */
  .overview-flow {
    background: linear-gradient(160deg, #bfdbfe 0%, #dbeafe 30%, #e0f2fe 65%, #cffafe 100%);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.06);
  }

  /* ─── shared typography ─────────────────── */
  .flow-eyebrow {
    display: inline-block;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #0369a1;
    margin-bottom: 12px;
  }
  .flow-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 10px;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .flow-sub {
    font-size: 0.92rem;
    font-weight: 500;
    color: #334155;
    margin: 0;
    line-height: 1.65;
  }

  /* ─── 1 · HERO ──────────────────────────── */
  .flow-hero {
    background: transparent;
    padding: 60px 64px 52px;
    position: relative;
  }
  .flow-hero .flow-eyebrow { color: #0369a1; }
  .flow-hero-inner { position: relative; }
  .flow-hero-headline {
    font-size: 2.4rem;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.15;
    margin: 0 0 28px;
    letter-spacing: -0.02em;
  }
  .flow-hero-body {
    font-size: 1rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.8;
    margin: 0 0 14px;
  }
  .flow-hero-body:last-of-type { margin-bottom: 0; }

  /* stats bar inside hero */
  .flow-stats {
    display: flex;
    align-items: flex-start;
    margin-top: 44px;
    padding-top: 36px;
    border-top: 1px solid rgba(0,0,0,0.12);
  }
  .flow-stat { flex: 1; padding: 0 32px; }
  .flow-stat:first-child { padding-left: 0; }
  .flow-stat:last-child  { padding-right: 0; }
  .flow-stat-rule {
    width: 1px;
    align-self: stretch;
    background: rgba(0,0,0,0.12);
    flex-shrink: 0;
  }
  .flow-stat-num {
    display: block;
    font-size: 2.8rem;
    font-weight: 900;
    color: #0c2d5e;
    line-height: 1;
    margin-bottom: 10px;
    letter-spacing: -0.02em;
  }
  .flow-stat-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: #334155;
    line-height: 1.55;
  }

  /* ─── 2 · EMISSION SOURCES ──────────────── */
  .flow-section {
    padding: 56px 64px;
    border-top: 1px solid rgba(0,0,0,0.06);
    background: transparent;
  }
  .flow-emission-cols {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 48px;
    align-items: start;
    margin-top: 40px;
  }
  .flow-emission-col {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: flex-start;
  }
  .flow-ec-icon {
    width: 68px; height: 68px;
    border-radius: 16px;
    background: var(--ecbg);
    color: var(--ec);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.7rem;
    flex-shrink: 0;
  }
  .flow-ec-name {
    font-size: 1.15rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 10px;
  }
  .flow-ec-desc {
    font-size: 0.92rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.7;
    margin: 0;
  }
  .flow-emission-plus {
    font-size: 2.2rem;
    font-weight: 900;
    color: #94a3b8;
    align-self: center;
    padding-top: 0;
    line-height: 1;
  }

  /* ─── 3 · OPPORTUNITY ───────────────────── */
  .flow-opportunity {
    background: transparent;
    padding: 60px 64px;
    border-top: 1px solid rgba(0,0,0,0.06);
  }
  .flow-opp-inner {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 64px;
    align-items: start;
  }
  .flow-opp-title {
    font-size: 1.6rem;
    font-weight: 900;
    color: #0c2d5e;
    line-height: 1.3;
    margin: 0 0 20px;
    letter-spacing: -0.02em;
  }
  .flow-opp-title em { font-style: normal; color: #1d4ed8; }
  .flow-opp-body {
    font-size: 0.95rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.78;
    margin: 0;
  }
  .flow-opp-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 28px;
    padding-bottom: 28px;
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }
  .flow-opp-num {
    font-size: 3.6rem;
    font-weight: 900;
    color: #1d4ed8;
    line-height: 1;
    letter-spacing: -0.03em;
  }
  .flow-opp-numlab {
    font-size: 0.82rem;
    font-weight: 600;
    color: #334155;
    margin-top: 4px;
  }
  .flow-opp-benefits { display: flex; flex-direction: column; gap: 18px; }
  .flow-opp-benefit {
    display: flex; align-items: flex-start; gap: 12px;
    font-size: 0.92rem; font-weight: 500; color: #1e293b; line-height: 1.6;
  }
  .flow-opp-benefit i { color: #1d4ed8; font-size: 0.95rem; margin-top: 3px; flex-shrink: 0; }

  /* ─── 4 · FOUR PRIORITY AREAS ───────────── */
  .flow-four {
    border-top: 1px solid rgba(0,0,0,0.06);
    background: transparent;
  }

  /* ─── 5 · BRIDGE ────────────────────────── */
  .flow-bridge {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: center;
    padding: 40px 64px;
    background: transparent;
    border-top: 1px solid rgba(0,0,0,0.06);
  }
  .flow-bridge-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .flow-bridge-icon {
    font-size: 1.6rem;
    color: #0369a1;
    flex-shrink: 0;
  }
  .flow-bridge-heading {
    font-size: 1.25rem;
    font-weight: 900;
    color: #0c2d5e;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  .flow-bridge-body {
    font-size: 0.98rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.7;
    margin: 0;
  }

  /* ─── 6 · FIVE PILLARS ──────────────────── */
  .flow-pillars {
    padding: 44px 64px 52px;
    background: transparent;
    border-top: 1px solid rgba(0,0,0,0.06);
  }
  .flow-pillars-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: center;
    margin-bottom: 32px;
  }
  .flow-pillars-header-left { display: flex; flex-direction: column; }
  .flow-pillars-title {
    font-size: 1.75rem;
    font-weight: 900;
    color: #0f172a;
    margin: 6px 0 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  .flow-pillars-sub {
    font-size: 1rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.7;
    margin: 0;
  }

  .dp-strip {
    display: flex;
    align-items: stretch;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255,255,255,0.55);
  }
  .dp-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 28px 22px 24px;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: background 0.2s ease;
    position: relative;
    outline: none;
  }
  .dp-item::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--dp-color);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .dp-item:hover { background: var(--dp-bg); }
  .dp-item:hover::before { opacity: 1; }
  .dp-divider {
    width: 1px;
    background: rgba(0,0,0,0.07);
    flex-shrink: 0;
    align-self: stretch;
  }
  .dp-item-icon {
    width: 52px; height: 52px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--dp-color) 10%, #fff);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
    color: var(--dp-color);
    flex-shrink: 0;
    transition: background 0.2s ease;
  }
  .dp-item:hover .dp-item-icon {
    background: color-mix(in srgb, var(--dp-color) 18%, #fff);
  }
  .dp-item-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
  }
  .dp-item-num {
    font-size: 2.6rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: var(--dp-color);
    opacity: 0.55;
    line-height: 1;
  }
  .dp-item-label {
    font-size: 1.1rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    line-height: 1.3;
  }
  .dp-item-desc {
    font-size: 0.9rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.65;
    margin: 0;
    flex: 1;
  }
  .dp-item-cta {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--dp-color);
    margin-top: 6px;
    transition: gap 0.15s ease;
  }
  .dp-item:hover .dp-item-cta { gap: 8px; }
  .dp-item-cta i { font-size: 0.65rem; }

  .partner-bar {
    padding: 1.5rem 2rem;
    background: rgba(255,255,255,0.5);
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.06);
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
     LATEST NEWS
     =========================== */
  .news-story-card {
    background: linear-gradient(160deg, #bfdbfe 0%, #dbeafe 30%, #e0f2fe 65%, #cffafe 100%);
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.06);
    padding: 2.25rem 2.5rem;
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .news-story-card.revealed {
    opacity: 1;
    transform: translateY(0);
  }

  .news-story-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .news-story-text { flex: 1; min-width: 0; }

  .news-headline {
    font-size: 1.5rem;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.2;
    margin: 0 0 0.4rem;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .news-headline i {
    color: #0369a1;
    font-size: 1.1rem;
  }

  .news-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    background: #0369a1;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 12px;
    padding: 0 7px;
  }

  .news-subhead {
    color: #334155;
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.5;
    margin: 0;
  }

  .news-updated {
    font-size: 0.72rem;
    color: #64748b;
    font-weight: 500;
    white-space: nowrap;
    margin-top: 0.25rem;
  }

  /* Filter pills */
  .news-filter-row {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  .news-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.4rem 0.85rem;
    font-size: 0.78rem;
    font-weight: 600;
    font-family: inherit;
    color: #334155;
    background: rgba(255,255,255,0.55);
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .news-pill i { font-size: 0.6rem; }

  .news-pill:hover {
    background: rgba(255,255,255,0.8);
    color: #0f172a;
  }

  .news-pill.active {
    background: #0369a1;
    border-color: #0369a1;
    color: #fff;
  }

  /* News grid */
  .news-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
  }

  .news-card {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    padding: 1rem 1.1rem;
    border-radius: 12px;
    background: rgba(255,255,255,0.55);
    border: 1px solid rgba(0,0,0,0.07);
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .news-card:hover {
    background: rgba(255,255,255,0.85);
    box-shadow: 0 4px 16px rgba(0,0,0,0.07);
    transform: translateY(-2px);
  }

  .news-card-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.95rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .news-card-body { flex: 1; min-width: 0; }

  .news-card-meta {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.3rem;
  }

  .news-card-cat {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .news-card-date {
    font-size: 0.72rem;
    color: #475569;
    font-weight: 600;
  }

  .news-card-source {
    font-size: 0.65rem;
    color: #64748b;
    font-weight: 500;
  }

  .news-card-headline {
    font-size: 0.97rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.4;
    margin: 0 0 0.35rem;
  }

  .news-card:hover .news-card-headline { color: #0369a1; }

  .news-card-summary {
    font-size: 0.84rem;
    color: #334155;
    line-height: 1.55;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .news-card-ext {
    font-size: 0.55rem;
    color: #94a3b8;
    flex-shrink: 0;
    margin-top: 0.3rem;
    transition: color 0.15s ease;
  }

  .news-card:hover .news-card-ext { color: #0369a1; }

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

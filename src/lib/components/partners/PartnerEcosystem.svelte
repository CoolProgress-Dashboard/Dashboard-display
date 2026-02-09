<script lang="ts">
  import { partners, globalCoolingPledge, type Partner } from '$lib/data/partner-data';

  let activeCategory: Partner['category'] | 'all' = 'all';

  const categories: { value: Partner['category'] | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Partners', icon: 'fa-globe' },
    { value: 'data', label: 'Data & Tracking', icon: 'fa-chart-bar' },
    { value: 'policy', label: 'Policy & Standards', icon: 'fa-landmark' },
    { value: 'implementation', label: 'Implementation', icon: 'fa-gears' },
    { value: 'funding', label: 'Funding & Coordination', icon: 'fa-hand-holding-dollar' },
    { value: 'research', label: 'Research & Analysis', icon: 'fa-magnifying-glass-chart' },
  ];

  // Separate HEAT (dashboard author) from data partners
  $: dataPartners = partners.filter(p => p.id !== 'heat');
  $: heatPartner = partners.find(p => p.id === 'heat');
  $: filteredPartners =
    activeCategory === 'all'
      ? dataPartners
      : dataPartners.filter((p) => p.category === activeCategory);

  // Recent partner ecosystem news (curated)
  const partnerNews = [
    {
      date: '2025',
      source: 'Clean Cooling Collaborative',
      title: 'CCC receives $30M from MacKenzie Scott to expand clean cooling access',
      url: 'https://www.cleancoolingcollaborative.org/blog/clean-cooling-collaborative-receives-30-million-gift-to-expand-access-to-efficient-climate-friendly-cooling/',
      icon: 'fa-hand-holding-dollar',
      color: '#E85A4F'
    },
    {
      date: '2025',
      source: 'Cool Coalition',
      title: 'Steering Committee shifts from commitments to action for 2025-2026',
      url: 'https://coolcoalition.org/news/commitments-action-cool-coalition-steering-committee-sets-path-2025-2026',
      icon: 'fa-gears',
      color: '#3D6B6B'
    },
    {
      date: '2025',
      source: 'UNEP',
      title: 'New guide helps governments integrate sustainable cooling into NDCs',
      url: 'https://www.coolingpost.com/world-news/unep-support-for-governments-ndcs/',
      icon: 'fa-file-contract',
      color: '#8BC34A'
    },
    {
      date: '2025',
      source: 'CLASP',
      title: 'World\'s Best MEPS framework benchmarks efficiency across 10 major economies',
      url: 'https://www.clasp.ngo/tools/worlds-best-meps/',
      icon: 'fa-bolt',
      color: '#4A7F7F'
    },
    {
      date: '2025',
      source: 'CCC & ASEAN',
      title: 'Cooling commitments reinforced at ASEAN 2nd Regional Workshop in Manila',
      url: 'https://united4efficiency.org/cooling-commitments-reinforced-at-aseans-2nd-regional-workshop-in-manila/',
      icon: 'fa-earth-asia',
      color: '#f59e0b'
    },
    {
      date: '2024',
      source: 'CCC',
      title: 'Mid-program impact report shows gigaton-scale savings on track',
      url: 'https://heathealth.info/resources/ccc-mid-program-impact-report/',
      icon: 'fa-chart-line',
      color: '#22c55e'
    }
  ];

  function getCategoryColor(cat: Partner['category']): string {
    switch (cat) {
      case 'data': return '#3D6B6B';
      case 'policy': return '#8BC34A';
      case 'implementation': return '#E89B8C';
      case 'funding': return '#E85A4F';
      case 'research': return '#4A7F7F';
      default: return '#3D6B6B';
    }
  }

  function getCategoryLabel(cat: Partner['category']): string {
    return categories.find((c) => c.value === cat)?.label ?? cat;
  }
</script>

<section class="partner-ecosystem">
  <!-- Section Header -->
  <div class="pe-header">
    <div class="pe-header-content">
      <div class="pe-icon-badge">
        <i class="fa-solid fa-handshake"></i>
      </div>
      <div>
        <h2 class="pe-title">Partner Ecosystem</h2>
        <p class="pe-subtitle">
          Organizations driving the global transition to clean, efficient, and accessible cooling
        </p>
      </div>
    </div>
  </div>

  <!-- Global Cooling Pledge Highlight Banner -->
  <div class="pe-pledge-banner">
    <div class="pledge-left">
      <div class="pledge-badge">
        <i class="fa-solid fa-earth-americas"></i>
      </div>
      <div class="pledge-content">
        <h3 class="pledge-title">Global Cooling Pledge</h3>
        <p class="pledge-desc">
          Launched at COP28 Dubai, uniting {globalCoolingPledge.signatoryCountries} nations to cut cooling emissions {globalCoolingPledge.targetEmissionReduction} and raise AC efficiency by {globalCoolingPledge.targetEfficiencyIncrease}.
        </p>
      </div>
    </div>
    <div class="pledge-stats">
      <div class="pledge-stat">
        <span class="pledge-stat-value">{globalCoolingPledge.signatoryCountries}</span>
        <span class="pledge-stat-label">Countries</span>
      </div>
      <div class="pledge-stat-divider"></div>
      <div class="pledge-stat">
        <span class="pledge-stat-value">{globalCoolingPledge.countriesWithMEPS}</span>
        <span class="pledge-stat-label">With MEPS</span>
      </div>
      <div class="pledge-stat-divider"></div>
      <div class="pledge-stat">
        <span class="pledge-stat-value">{globalCoolingPledge.countriesIncludingCoolingInNDCs}</span>
        <span class="pledge-stat-label">In NDCs</span>
      </div>
      <div class="pledge-stat-divider"></div>
      <div class="pledge-stat">
        <span class="pledge-stat-value">{globalCoolingPledge.countriesWithBuildingCodes}</span>
        <span class="pledge-stat-label">Building Codes</span>
      </div>
    </div>
    <a
      href={globalCoolingPledge.progressReportUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="pledge-report-btn"
    >
      <i class="fa-solid fa-file-lines"></i> 2024 Progress Report
    </a>
  </div>

  <!-- Category Filter Tabs -->
  <div class="pe-filter-tabs">
    {#each categories as cat}
      <button
        class="pe-tab"
        class:active={activeCategory === cat.value}
        on:click={() => (activeCategory = cat.value)}
        type="button"
      >
        <i class="fa-solid {cat.icon}"></i>
        <span>{cat.label}</span>
      </button>
    {/each}
  </div>

  <!-- Partner Cards - Responsive Grid -->
  <div class="partner-grid">
    {#each filteredPartners as partner (partner.id)}
      <div
        class="partner-card"
        style="--cat-color: {getCategoryColor(partner.category)}"
      >
        <!-- Logo Area -->
        <div class="partner-logo">
          <img src={partner.logoPath} alt={partner.fullName} />
        </div>

        <!-- Category Badge -->
        <span class="partner-category-badge" style="background: {getCategoryColor(partner.category)}15; color: {getCategoryColor(partner.category)}">
          {getCategoryLabel(partner.category)}
        </span>

        <!-- Partner Info -->
        <h3 class="partner-name">{partner.name}</h3>
        <p class="partner-tagline">{partner.tagline}</p>

        <!-- Key Contribution (1-line) -->
        <div class="partner-contribution">
          <i class="fa-solid fa-star"></i>
          <p>{partner.keyContribution}</p>
        </div>

        <!-- Resource Links -->
        {#if partner.resources && partner.resources.length > 0}
          <div class="partner-resources">
            <span class="resources-label">Tools & Resources</span>
            {#each partner.resources as resource}
              <a
                href={resource.url}
                target={resource.url.startsWith('/') ? '_self' : '_blank'}
                rel={resource.url.startsWith('/') ? undefined : 'noopener noreferrer'}
                class="partner-resource-link"
                title={resource.description}
              >
                <i class="fa-solid {resource.icon}"></i>
                <span>{resource.label}</span>
                <i class="fa-solid fa-arrow-up-right-from-square resource-external"></i>
              </a>
            {/each}
          </div>
        {:else if partner.keyReport}
          <a
            href={partner.keyReportUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="partner-report-link"
          >
            <i class="fa-solid fa-file-lines"></i>
            {partner.keyReport}
          </a>
        {/if}

        <!-- Learn More Link -->
        <a
          href={partner.coolingUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="partner-learn-more"
        >
          Learn more <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    {/each}
  </div>

  <!-- Partner Ecosystem News -->
  <div class="pe-news-section">
    <div class="pe-news-header">
      <i class="fa-solid fa-newspaper"></i>
      <h3>Partner Ecosystem News</h3>
    </div>
    <div class="pe-news-grid">
      {#each partnerNews as item}
        <a href={item.url} target="_blank" rel="noopener noreferrer" class="pe-news-card">
          <div class="news-icon" style="background: {item.color}15; color: {item.color}">
            <i class="fa-solid {item.icon}"></i>
          </div>
          <div class="news-content">
            <span class="news-source">{item.source} &middot; {item.date}</span>
            <p class="news-title">{item.title}</p>
          </div>
          <i class="fa-solid fa-arrow-up-right-from-square news-external"></i>
        </a>
      {/each}
    </div>
  </div>

  <!-- Built by HEAT (subtle credit) -->
  {#if heatPartner}
    <div class="pe-built-by">
      <div class="built-by-inner">
        <img src={heatPartner.logoPath} alt="HEAT GmbH" class="built-by-logo" />
        <div class="built-by-text">
          <span class="built-by-label">Built & maintained by</span>
          <a href={heatPartner.website} target="_blank" rel="noopener noreferrer" class="built-by-name">
            HEAT GmbH
          </a>
          <span class="built-by-desc">&middot; Climate Intelligence & Green Cooling</span>
        </div>
        <a href="/methodology" class="built-by-link">Methodology <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </div>
  {/if}

  <!-- Footer -->
  <div class="pe-footer">
    <p>Working together to transform the cooling sector for people and the planet.</p>
  </div>
</section>

<style>
  /* ================================
     Partner Ecosystem - Scoped Styles
     CCC Design System Integration
     ================================ */
  .partner-ecosystem {
    padding: 1.5rem;
  }

  /* --- Header --- */
  .pe-header {
    margin-bottom: 1.25rem;
  }

  .pe-header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .pe-icon-badge {
    width: 44px;
    height: 44px;
    background: var(--gradient-ccc, linear-gradient(135deg, #3D6B6B, #8BC34A));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 1.1rem;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(61, 107, 107, 0.25);
  }

  .pe-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary, #333);
    letter-spacing: -0.02em;
    margin: 0;
  }

  .pe-subtitle {
    font-size: 0.9rem;
    color: var(--color-text-secondary, #555);
    margin: 0.15rem 0 0;
  }

  /* --- Global Cooling Pledge Banner --- */
  .pe-pledge-banner {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg, rgba(61, 107, 107, 0.06), rgba(139, 195, 74, 0.06));
    border: 1px solid rgba(61, 107, 107, 0.15);
    border-left: 4px solid var(--ccc-teal, #3D6B6B);
    border-radius: var(--radius-md, 12px);
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }

  .pledge-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 200px;
  }

  .pledge-badge {
    width: 40px;
    height: 40px;
    background: var(--gradient-ccc, linear-gradient(135deg, #3D6B6B, #8BC34A));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .pledge-content {
    min-width: 0;
  }

  .pledge-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--ccc-teal, #3D6B6B);
    margin: 0;
  }

  .pledge-desc {
    font-size: 0.78rem;
    color: var(--color-text-secondary, #555);
    margin: 0.15rem 0 0;
    line-height: 1.45;
  }

  .pledge-stats {
    display: flex;
    gap: 0;
    flex-shrink: 0;
  }

  .pledge-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0.85rem;
  }

  .pledge-stat-divider {
    width: 1px;
    height: 32px;
    background: rgba(61, 107, 107, 0.15);
    align-self: center;
  }

  .pledge-stat-value {
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--ccc-teal, #3D6B6B);
    line-height: 1.1;
  }

  .pledge-stat-label {
    font-size: 0.58rem;
    color: var(--color-text-muted, #888);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 600;
    margin-top: 0.1rem;
  }

  .pledge-report-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #fff;
    background: var(--ccc-teal, #3D6B6B);
    text-decoration: none;
    white-space: nowrap;
    padding: 0.5rem 0.9rem;
    border-radius: var(--radius-sm, 8px);
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .pledge-report-btn:hover {
    background: var(--ccc-teal-dark, #2D5252);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(61, 107, 107, 0.3);
  }

  /* --- Category Filter Tabs --- */
  .pe-filter-tabs {
    display: flex;
    gap: 0.35rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    margin-bottom: 1.25rem;
    scrollbar-width: none;
  }

  .pe-filter-tabs::-webkit-scrollbar {
    display: none;
  }

  .pe-tab {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.85rem;
    border: 1px solid var(--color-border, #E2E8F0);
    border-radius: var(--radius-full, 9999px);
    background: #fff;
    color: var(--color-text-secondary, #555);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .pe-tab:hover {
    border-color: var(--ccc-teal, #3D6B6B);
    color: var(--ccc-teal, #3D6B6B);
    background: rgba(61, 107, 107, 0.04);
  }

  .pe-tab.active {
    background: var(--ccc-teal, #3D6B6B);
    color: #fff;
    border-color: var(--ccc-teal, #3D6B6B);
  }

  .pe-tab i {
    font-size: 0.7rem;
  }

  /* --- Partner Grid (responsive 3 / 2 / 1 columns) --- */
  .partner-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  /* --- Partner Card --- */
  .partner-card {
    background: #fff;
    border: 1px solid var(--color-border, #E2E8F0);
    border-radius: var(--radius-lg, 16px);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.3s ease;
    position: relative;
  }

  .partner-card:hover {
    transform: translateY(-4px);
    border-color: var(--cat-color);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.08),
      0 0 0 1px var(--cat-color),
      0 0 20px color-mix(in srgb, var(--cat-color) 15%, transparent);
  }

  /* Logo */
  .partner-logo {
    width: 100%;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 0.25rem;
  }

  .partner-logo img {
    max-width: 100px;
    max-height: 40px;
    object-fit: contain;
    opacity: 0.85;
    transition: opacity 0.25s ease;
  }

  .partner-card:hover .partner-logo img {
    opacity: 1;
  }

  /* Category Badge */
  .partner-category-badge {
    display: inline-block;
    width: fit-content;
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-full, 9999px);
  }

  /* Name & Tagline */
  .partner-name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary, #333);
    margin: 0;
    line-height: 1.2;
  }

  .partner-tagline {
    font-size: 0.78rem;
    color: var(--color-text-muted, #888);
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Key Contribution */
  .partner-contribution {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    background: var(--color-bg-secondary, #F8FAFC);
    border-radius: var(--radius-sm, 8px);
    padding: 0.65rem 0.75rem;
    margin-top: auto;
  }

  .partner-contribution i {
    color: var(--ccc-green, #8BC34A);
    font-size: 0.65rem;
    margin-top: 0.2rem;
    flex-shrink: 0;
  }

  .partner-contribution p {
    font-size: 0.75rem;
    color: var(--color-text-secondary, #555);
    line-height: 1.45;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Resource Links */
  .partner-resources {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }

  .resources-label {
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted, #888);
    margin-bottom: 0.15rem;
  }

  .partner-resource-link {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    color: var(--ccc-teal, #3D6B6B);
    text-decoration: none;
    padding: 0.3rem 0.5rem;
    border-radius: var(--radius-sm, 6px);
    transition: all 0.15s ease;
    background: transparent;
  }

  .partner-resource-link:hover {
    background: rgba(61, 107, 107, 0.06);
    color: var(--ccc-teal-dark, #2D5252);
  }

  .partner-resource-link i:first-child {
    font-size: 0.65rem;
    opacity: 0.7;
    width: 14px;
    text-align: center;
    flex-shrink: 0;
  }

  .partner-resource-link span {
    flex: 1;
    font-weight: 500;
  }

  .resource-external {
    font-size: 0.5rem !important;
    opacity: 0.3;
    transition: opacity 0.15s ease;
  }

  .partner-resource-link:hover .resource-external {
    opacity: 0.7;
  }

  /* Key Report Link */
  .partner-report-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.72rem;
    color: var(--ccc-teal, #3D6B6B);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
  }

  .partner-report-link i {
    font-size: 0.7rem;
  }

  .partner-report-link:hover {
    color: var(--ccc-teal-dark, #2D5252);
    text-decoration: underline;
  }

  /* Learn More Link */
  .partner-learn-more {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--ccc-teal, #3D6B6B);
    text-decoration: none;
    padding-top: 0.35rem;
    border-top: 1px solid var(--color-border-light, #F1F5F9);
    transition: all 0.2s ease;
  }

  .partner-learn-more i {
    font-size: 0.65rem;
    transition: transform 0.2s ease;
  }

  .partner-learn-more:hover {
    color: var(--ccc-teal-dark, #2D5252);
  }

  .partner-learn-more:hover i {
    transform: translateX(3px);
  }

  /* --- News Section --- */
  .pe-news-section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border-light, #F1F5F9);
  }

  .pe-news-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1rem;
  }

  .pe-news-header i {
    color: var(--ccc-teal, #3D6B6B);
    font-size: 1rem;
  }

  .pe-news-header h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text-primary, #333);
    margin: 0;
  }

  .pe-news-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .pe-news-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    background: #fff;
    border: 1px solid var(--color-border, #E2E8F0);
    border-radius: var(--radius-md, 12px);
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .pe-news-card:hover {
    border-color: var(--ccc-teal, #3D6B6B);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .news-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .news-content {
    flex: 1;
    min-width: 0;
  }

  .news-source {
    font-size: 0.6rem;
    font-weight: 600;
    color: var(--color-text-muted, #888);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .news-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text-primary, #333);
    margin: 0.15rem 0 0;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .news-external {
    font-size: 0.55rem;
    color: var(--color-text-muted, #888);
    opacity: 0.4;
    flex-shrink: 0;
  }

  .pe-news-card:hover .news-external {
    opacity: 0.8;
    color: var(--ccc-teal, #3D6B6B);
  }

  /* --- Built By (subtle HEAT credit) --- */
  .pe-built-by {
    margin-top: 1.5rem;
    padding: 1rem 1.25rem;
    background: var(--color-bg-secondary, #F8FAFC);
    border-radius: var(--radius-md, 12px);
    border: 1px solid var(--color-border-light, #F1F5F9);
  }

  .built-by-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .built-by-logo {
    height: 22px;
    opacity: 0.6;
    flex-shrink: 0;
  }

  .built-by-text {
    flex: 1;
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .built-by-label {
    font-size: 0.68rem;
    color: var(--color-text-muted, #888);
    font-weight: 500;
  }

  .built-by-name {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--color-text-secondary, #555);
    text-decoration: none;
  }

  .built-by-name:hover {
    color: var(--ccc-teal, #3D6B6B);
  }

  .built-by-desc {
    font-size: 0.65rem;
    color: var(--color-text-muted, #888);
  }

  .built-by-link {
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--ccc-teal, #3D6B6B);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-shrink: 0;
  }

  .built-by-link:hover {
    color: var(--ccc-teal-dark, #2D5252);
  }

  .built-by-link i {
    font-size: 0.55rem;
    transition: transform 0.2s ease;
  }

  .built-by-link:hover i {
    transform: translateX(2px);
  }

  /* --- Footer --- */
  .pe-footer {
    margin-top: 1.5rem;
    text-align: center;
    padding: 0.75rem;
    border-top: 1px solid var(--color-border-light, #F1F5F9);
  }

  .pe-footer p {
    font-size: 0.75rem;
    color: var(--color-text-muted, #888);
    font-style: italic;
    margin: 0;
  }

  /* --- Responsive --- */
  @media (max-width: 1100px) {
    .partner-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .partner-ecosystem {
      padding: 1rem;
    }

    .pe-pledge-banner {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .pledge-stats {
      width: 100%;
      justify-content: space-around;
    }

    .pledge-report-btn {
      width: 100%;
      justify-content: center;
    }

    .pe-filter-tabs {
      gap: 0.25rem;
    }

    .pe-tab span {
      display: none;
    }

    .partner-grid {
      grid-template-columns: 1fr;
    }

    .pe-news-grid {
      grid-template-columns: 1fr;
    }

    .built-by-inner {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .partner-card:hover {
      transform: translateY(-2px);
    }
  }
</style>

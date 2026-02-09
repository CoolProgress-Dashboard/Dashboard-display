<!--
  HeroSection.svelte
  Full-width gradient hero banner with animated text reveal, impact counters,
  pillar navigation CTA, and story hook text.

  Imports:
  - pillarContent from pillar-content.ts (headline, heroStats, storyHook)
  - heroStats from hero-stats.ts (extended stat descriptions for tooltips)

  Features:
  - Purple-to-cyan gradient background (inline fallback + CSS class)
  - Three animated floating orbs with blur
  - Staggered text reveal animation on mount
  - Four animated counter cards (string-based values with suffix parsing)
  - "Explore the 5 Pillars" CTA with icon buttons
  - Story hook narrative text

  Usage:
    <HeroSection />
    <HeroSection on:navigate={(e) => switchView(e.detail)} />
-->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import AnimatedCounter from './AnimatedCounter.svelte';
  import { pillarContent } from '$lib/data/pillar-content';
  import { getStatById } from '$lib/data/hero-stats';

  const dispatch = createEventDispatcher<{ navigate: string }>();

  const overview = pillarContent.overview;

  // Map heroStats from pillar-content to counter data, enriching with
  // extended descriptions from hero-stats.ts where available
  const statIdMap: Record<string, string> = {
    'Mt CO\u2082e today (2025)': 'ghg-share',
    'reduction achievable by 2050': 'co2-savings',
    'people lack adequate cooling': 'people-at-risk',
    'Global Cooling Pledge nations': 'co2-savings'
  };

  const counterData = overview.heroStats.map((hs) => {
    const extendedId = statIdMap[hs.label];
    const extended = extendedId ? getStatById(extendedId) : undefined;
    return {
      value: hs.value,
      label: hs.label,
      context: extended?.description ?? hs.context
    };
  });

  // Pillar navigation buttons
  const pillars = [
    { id: 'emissions', icon: 'fa-smog', label: 'Emissions' },
    { id: 'meps', icon: 'fa-bolt', label: 'Efficiency' },
    { id: 'kigali', icon: 'fa-snowflake', label: 'Refrigerants' },
    { id: 'access', icon: 'fa-people-group', label: 'Access' },
    { id: 'policy', icon: 'fa-landmark', label: 'Policy' }
  ];

  let revealed = false;

  onMount(() => {
    const timer = setTimeout(() => {
      revealed = true;
    }, 150);
    return () => clearTimeout(timer);
  });

  function navigateToPillar(pillarId: string) {
    dispatch('navigate', pillarId);
  }
</script>

<section
  class="hero-section"
  class:revealed
  style="background: linear-gradient(135deg, #0d3b4f 0%, #1a6b5a 50%, #0693e3 100%)"
  aria-label="Dashboard hero"
>
  <!-- Animated background effects -->
  <div class="hero-bg" aria-hidden="true">
    <div class="hero-orb hero-orb--1"></div>
    <div class="hero-orb hero-orb--2"></div>
    <div class="hero-orb hero-orb--3"></div>
    <div class="hero-grid-pattern"></div>
  </div>

  <!-- Content -->
  <div class="hero-content">
    <!-- Headline with staggered reveal -->
    <h1 class="hero-headline">
      <span class="headline-line headline-line--1">{overview.headline}</span>
    </h1>

    <p class="hero-subtitle">{overview.subhead}</p>

    <!-- Animated counter cards -->
    <div class="hero-counters">
      {#each counterData as stat, i}
        <div class="counter-wrapper" style="transition-delay: {300 + i * 120}ms">
          <AnimatedCounter
            value={stat.value}
            label={stat.label}
            context={stat.context}
            duration={2000 + i * 200}
          />
        </div>
      {/each}
    </div>

    <!-- Story hook -->
    <p class="hero-story-hook">{overview.storyHook}</p>

    <!-- Explore the 5 Pillars CTA -->
    <div class="hero-cta">
      <p class="cta-label">Explore the 5 Pillars</p>
      <div class="cta-buttons">
        {#each pillars as pillar}
          <button
            class="cta-pillar-btn"
            on:click={() => navigateToPillar(pillar.id)}
            aria-label="Go to {pillar.label} pillar"
          >
            <i class="fa-solid {pillar.icon}"></i>
            <span>{pillar.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Attribution -->
    <p class="hero-attribution">
      Data:
      <a href="https://www.heat-gmbh.de" target="_blank" rel="noreferrer">HEAT</a>
      &middot;
      <a href="https://www.clasp.ngo/" target="_blank" rel="noreferrer">CLASP</a>
      &middot;
      <a href="https://www.iea.org/reports/the-future-of-cooling" target="_blank" rel="noreferrer">IEA</a>
      &middot;
      <a href="https://cleancoolingcollaborative.org" target="_blank" rel="noreferrer">CCC</a>
      &middot;
      <a href="https://www.seforall.org/data-stories/chilling-prospects-2025" target="_blank" rel="noreferrer">SE4ALL</a>
      &middot;
      <a href="/methodology" style="font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.3);">Methodology</a>
    </p>
  </div>
</section>

<style>
  /* ===========================
     HERO SECTION - Full-width
     Uses .hero-section class from design system if available,
     inline gradient fallback applied via style attribute.
     =========================== */
  .hero-section {
    position: relative;
    width: 100%;
    border-radius: 16px;
    overflow: visible;
    padding: 2.5rem 2rem 2rem;
    margin-bottom: 1rem;
  }

  /* ===========================
     ANIMATED BACKGROUND
     =========================== */
  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .hero-grid-pattern {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  }

  .hero-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0;
    transition: opacity 1.2s ease;
  }

  .revealed .hero-orb {
    opacity: 1;
  }

  .hero-orb--1 {
    width: 300px;
    height: 300px;
    background: rgba(6, 147, 227, 0.3);
    top: -120px;
    right: -60px;
    animation: orb-drift 18s ease-in-out infinite;
  }

  .hero-orb--2 {
    width: 220px;
    height: 220px;
    background: rgba(26, 107, 90, 0.3);
    bottom: -80px;
    left: 10%;
    animation: orb-drift 22s ease-in-out infinite reverse;
  }

  .hero-orb--3 {
    width: 180px;
    height: 180px;
    background: rgba(139, 195, 74, 0.18);
    top: 40%;
    right: 25%;
    animation: orb-drift 25s ease-in-out infinite;
    animation-delay: -8s;
  }

  @keyframes orb-drift {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    25% {
      transform: translate(25px, -20px) scale(1.08);
    }
    50% {
      transform: translate(-18px, 18px) scale(0.94);
    }
    75% {
      transform: translate(18px, 22px) scale(1.04);
    }
  }

  /* ===========================
     CONTENT LAYER
     =========================== */
  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
  }

  /* ===========================
     HEADLINE - Staggered reveal
     =========================== */
  .hero-headline {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.2;
    color: #ffffff;
    margin: 0 0 0.75rem;
    letter-spacing: -0.03em;
  }

  .headline-line {
    display: block;
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity 0.7s ease,
      transform 0.7s ease;
  }

  .revealed .headline-line--1 {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.1s;
  }

  /* ===========================
     SUBTITLE
     =========================== */
  .hero-subtitle {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.7);
    max-width: 520px;
    margin: 0 auto 1.5rem;
    line-height: 1.5;
    opacity: 0;
    transform: translateY(12px);
    transition:
      opacity 0.7s ease 0.35s,
      transform 0.7s ease 0.35s;
  }

  .revealed .hero-subtitle {
    opacity: 1;
    transform: translateY(0);
  }

  /* ===========================
     COUNTER GRID
     =========================== */
  .hero-counters {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin: 0 auto 1.25rem;
    max-width: 800px;
    position: relative;
    z-index: 2;
  }

  .counter-wrapper {
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }

  .revealed .counter-wrapper {
    opacity: 1;
    transform: translateY(0);
  }

  /* ===========================
     STORY HOOK
     =========================== */
  .hero-story-hook {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    max-width: 680px;
    margin: 0 auto 1.5rem;
    line-height: 1.6;
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity 0.7s ease 0.9s,
      transform 0.7s ease 0.9s;
  }

  .revealed .hero-story-hook {
    opacity: 1;
    transform: translateY(0);
  }

  /* ===========================
     EXPLORE CTA
     =========================== */
  .hero-cta {
    margin: 0 auto 1rem;
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity 0.6s ease 1.1s,
      transform 0.6s ease 1.1s;
  }

  .revealed .hero-cta {
    opacity: 1;
    transform: translateY(0);
  }

  .cta-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0.6rem;
  }

  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .cta-pillar-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.2s ease,
      transform 0.2s ease,
      color 0.2s ease;
    font-family: inherit;
  }

  .cta-pillar-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    transform: translateY(-1px);
  }

  .cta-pillar-btn i {
    font-size: 0.7rem;
    opacity: 0.8;
  }

  /* ===========================
     ATTRIBUTION
     =========================== */
  .hero-attribution {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.35);
    margin: 0;
    opacity: 0;
    transition: opacity 0.8s ease 1.4s;
  }

  .revealed .hero-attribution {
    opacity: 1;
  }

  .hero-attribution a {
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    transition: color 0.2s ease;
  }

  .hero-attribution a:hover {
    color: rgba(255, 255, 255, 0.85);
  }

  /* ===========================
     RESPONSIVE
     =========================== */
  @media (max-width: 900px) {
    .hero-section {
      padding: 2rem 1.5rem 1.5rem;
    }

    .hero-headline {
      font-size: 1.6rem;
    }

    .hero-counters {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.6rem;
    }
  }

  @media (max-width: 600px) {
    .hero-section {
      padding: 1.5rem 1rem 1.25rem;
      border-radius: 12px;
    }

    .hero-headline {
      font-size: 1.3rem;
    }

    .hero-subtitle {
      font-size: 0.85rem;
    }

    .hero-story-hook {
      font-size: 0.78rem;
    }

    .cta-pillar-btn {
      padding: 0.35rem 0.6rem;
      font-size: 0.7rem;
    }
  }
</style>

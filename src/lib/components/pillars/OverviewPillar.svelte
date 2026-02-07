<script lang="ts">
  export let active: boolean = false;
  export let onNavigate: (pillar: string) => void = () => {};

  import HeroSection from '$lib/components/hero/HeroSection.svelte';
  import CountrySpotlight from '$lib/components/charts/CountrySpotlight.svelte';
  import PeakLoadChart from '$lib/components/charts/PeakLoadChart.svelte';
  import AcGrowthChart from '$lib/components/charts/AcGrowthChart.svelte';
  import PartnerEcosystem from '$lib/components/partners/PartnerEcosystem.svelte';
</script>

<section id="view-overview" class="view-section" class:active>
  <div class="overview-layout">
    <div class="overview-main">
      <!-- New: Animated Hero Banner -->
      <HeroSection on:navigate={(e) => onNavigate(e.detail)} />

      <!-- Original: Message Carousel - Primary Focus (IDs preserved for monolithic script) -->
      <div class="overview-carousel-v2">
        <!-- Clickable Tab Navigation -->
        <div class="carousel-tabs">
          <button class="carousel-tab active" data-slide="0" type="button">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>The Challenge</span>
          </button>
          <button class="carousel-tab" data-slide="1" type="button">
            <i class="fa-solid fa-smog"></i>
            <span>Emissions Crisis</span>
          </button>
          <button class="carousel-tab" data-slide="2" type="button">
            <i class="fa-solid fa-heart-pulse"></i>
            <span>Vulnerability Gap</span>
          </button>
          <button class="carousel-tab" data-slide="3" type="button">
            <i class="fa-solid fa-lightbulb"></i>
            <span>Path Forward</span>
          </button>
        </div>

        <!-- Slide Content -->
        <div class="carousel-content-area">
          <button class="carousel-arrow carousel-prev" type="button" id="carousel-prev">
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <div class="carousel-viewport">
            <!-- Slide 1: The Challenge -->
            <div class="carousel-slide active" data-slide="0">
              <div class="slide-inner-v2 challenge-slide">
                <div class="slide-header">
                  <div class="slide-icon-badge challenge-badge">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <h3>The Challenge</h3>
                </div>
                <div class="slide-message">
                  <p>Cooling is one of the most significant yet overlooked drivers of climate change. It currently accounts for over <strong>10% of global greenhouse gas emissions</strong>, a figure expected to <strong>double by 2050</strong> as heatwaves become more frequent and populations grow.</p>
                  <p>This creates a double-edged impact where indirect emissions from high energy consumption and direct emissions from high-GWP refrigerant leaks fuel a vicious cycle of increased emissions and further warming that leaves <strong>1.2 billion people</strong> vulnerable to life-threatening heat.</p>
                  <p>According to the <a href="https://wedocs.unep.org/items/507e8c47-db6c-424a-9b76-7805a6e1d669" target="_blank" rel="noopener noreferrer"><strong>Global Cooling Watch 2025 report</strong></a> (released at COP30), global cooling demand is expected to more than <strong>triple by mid-century</strong>. A sustainable cooling transition is urgently required to decouple rising demand from escalating emissions.</p>
                </div>
              </div>
            </div>

            <!-- Slide 2: Emissions Crisis -->
            <div class="carousel-slide" data-slide="1">
              <div class="slide-inner-v2 emissions-slide">
                <div class="slide-header">
                  <div class="slide-icon-badge emissions-badge">
                    <i class="fa-solid fa-smog"></i>
                  </div>
                  <h3>Emissions Crisis</h3>
                </div>
                <div class="slide-message">
                  <p>Currently responsible for <strong>10% of global power demand</strong>, cooling emissions are accelerating on two fronts:</p>
                  <div class="slide-two-col">
                    <div class="slide-col">
                      <div class="col-label">Indirect Emissions</div>
                      <p>From inefficient appliances consuming massive amounts of electricity, driving up energy demand and carbon footprints worldwide.</p>
                    </div>
                    <div class="slide-col">
                      <div class="col-label">Direct Emissions</div>
                      <p>From "super-pollutant" refrigerants with global warming potentials thousands of times greater than CO<sub>2</sub>, leaking into the atmosphere.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Slide 3: Vulnerability Gap -->
            <div class="carousel-slide" data-slide="2">
              <div class="slide-inner-v2 vulnerability-slide">
                <div class="slide-header">
                  <div class="slide-icon-badge vulnerability-badge">
                    <i class="fa-solid fa-heart-pulse"></i>
                  </div>
                  <h3>Vulnerability Gap</h3>
                </div>
                <div class="slide-message">
                  <p>Rising temperatures are driving a surge in heat-related deaths, yet access to cooling remains a luxury of the few. In the world's most heat-stressed regions, over <strong>1.2 billion people</strong> live on the front lines of the climate crisis without the basic cooling infrastructure needed to survive intensifying heatwaves.</p>
                  <div class="slide-stat-highlight">
                    <span class="stat-number">1.2B</span>
                    <span class="stat-text">people live without basic cooling infrastructure in heat-stressed regions, facing life-threatening conditions as temperatures rise.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Slide 4: The Path Forward -->
            <div class="carousel-slide" data-slide="3">
              <div class="slide-inner-v2 solution-slide">
                <div class="slide-header">
                  <div class="slide-icon-badge solution-badge">
                    <i class="fa-solid fa-lightbulb"></i>
                  </div>
                  <h3>The Path Forward</h3>
                </div>
                <div class="slide-message">
                  <p>A comprehensive transition could cut cooling-related emissions by up to <strong>80%</strong> through a unified strategy across three key pillars:</p>
                  <div class="slide-pillars-v2">
                    <div class="pillar-card tech">
                      <div class="pillar-icon"><i class="fa-solid fa-microchip"></i></div>
                      <div class="pillar-title">Technology</div>
                      <div class="pillar-desc">Rapid deployment of super-efficient appliances and low-GWP refrigerants in alignment with the Kigali Amendment.</div>
                    </div>
                    <div class="pillar-card equity">
                      <div class="pillar-icon"><i class="fa-solid fa-hand-holding-heart"></i></div>
                      <div class="pillar-title">Equity</div>
                      <div class="pillar-desc">Universal expanded access for heat-vulnerable populations to ensure health and productivity.</div>
                    </div>
                    <div class="pillar-card governance">
                      <div class="pillar-icon"><i class="fa-solid fa-landmark"></i></div>
                      <div class="pillar-title">Governance</div>
                      <div class="pillar-desc">Binding policy frameworks, such as NCAPs and enhanced NDC commitments that turn international pledges into enforceable domestic law.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="carousel-arrow carousel-next" type="button" id="carousel-next">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Compact KPI Strip - Populated by Supabase data via onMount -->
      <div class="kpi-strip">
        <div class="kpi-strip-item">
          <i class="fa-solid fa-smog"></i>
          <div class="kpi-strip-data">
            <span class="kpi-strip-value" id="kpi-climate">&gt;10%</span>
            <span class="kpi-strip-label">of Global GHG Emissions</span>
          </div>
        </div>
        <div class="kpi-strip-divider"></div>
        <div class="kpi-strip-item">
          <i class="fa-solid fa-bolt"></i>
          <div class="kpi-strip-data">
            <span class="kpi-strip-value" id="kpi-capacity">3x</span>
            <span class="kpi-strip-label">Demand Increase by 2050</span>
          </div>
        </div>
        <div class="kpi-strip-divider"></div>
        <div class="kpi-strip-item">
          <i class="fa-solid fa-users"></i>
          <div class="kpi-strip-data">
            <span class="kpi-strip-value" id="kpi-access">1.2B</span>
            <span class="kpi-strip-label">People Without Cooling Access</span>
          </div>
        </div>
      </div>

      <!-- New: AC Growth Chart -->
      <AcGrowthChart />

      <!-- New: Peak Electricity Load Chart -->
      <PeakLoadChart />

      <!-- New: Country Spotlight Cards -->
      <CountrySpotlight />

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
    </div><!-- end overview-main -->

    <!-- New: Dedicated Partner Ecosystem (replaces compact sidebar) -->
    <aside class="partner-sidebar-modern">
      <PartnerEcosystem />
    </aside>
  </div><!-- end overview-layout -->
</section>

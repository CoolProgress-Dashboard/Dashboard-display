<script lang="ts">
  const partnerLogos = [
    { src: '/images/ccc-logo.png', alt: 'Clean Cooling Collaborative', url: 'https://www.cleancoolingcollaborative.org' },
    { src: '/images/cool-coalition.png', alt: 'Cool Coalition', url: 'https://coolcoalition.org' },
    { src: '/images/heat-logo.png', alt: 'HEAT GmbH', url: 'https://www.heat-gmbh.de' },
    { src: '/images/clasp-logo.png', alt: 'CLASP', url: 'https://www.clasp.ngo' },
    { src: '/images/u4e-logo.png', alt: 'United for Efficiency', url: 'https://united4efficiency.org' },
    { src: '/images/iea-logo.png', alt: 'IEA', url: 'https://www.iea.org' },
    { src: '/images/giz-logo.png', alt: 'GIZ Proklima', url: 'https://www.green-cooling-initiative.org' },
    { src: '/images/seforall-logo.jpg', alt: 'Sustainable Energy for All', url: 'https://www.seforall.org' },
    { src: '/images/climate-policy-radar-logo.png', alt: 'Climate Policy Radar', url: 'https://www.climatepolicyradar.org' },
  ];
</script>

<aside class="sidebar-right">
  <!-- Partner Logos Grid -->
  <div class="side-card partner-logos-card" style="margin-top: auto;">
    <h3>Data & Knowledge Partners</h3>
    <div class="partner-logos-grid">
      {#each partnerLogos as partner}
        <a href={partner.url} target="_blank" rel="noopener noreferrer" class="partner-logo-link" title={partner.alt}>
          <img src={partner.src} alt={partner.alt} class="partner-logo" />
        </a>
      {/each}
    </div>
  </div>
</aside>

<style>
  .partner-logos-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    padding: 0.5rem 0;
  }

  .partner-logo-link {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
  }

  .partner-logo-link:hover {
    background: rgba(255, 255, 255, 1);
    border-color: rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .partner-logo {
    max-height: 28px;
    max-width: 80px;
    object-fit: contain;
    opacity: 0.85;
    transition: opacity 0.2s ease;
  }

  .partner-logo-link:hover .partner-logo {
    opacity: 1;
  }
</style>

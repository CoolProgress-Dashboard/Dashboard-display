<script lang="ts">
  /**
   * SourceAttribution - Shows data source credits below charts and KPI cards.
   * Usage:
   *   <SourceAttribution sources={['HEAT', 'CLASP', 'IEA STEPS']} />
   *   <SourceAttribution sources={['SEforALL']} methodologyLink={true} />
   */
  export let sources: string[] = [];
  export let methodologyLink: boolean = false;
  export let compact: boolean = false;

  const sourceLinks: Record<string, string> = {
    'HEAT': 'https://www.heat-gmbh.de',
    'HEAT GmbH': 'https://www.heat-gmbh.de',
    'CLASP': 'https://www.clasp.ngo/tools/mepsy/',
    'CLASP Mepsy': 'https://www.clasp.ngo/tools/mepsy/',
    'CLASP CPRC': 'https://cprc-clasp.ngo/',
    'IEA': 'https://www.iea.org/reports/the-future-of-cooling',
    'IEA STEPS': 'https://www.iea.org/reports/world-energy-outlook-2025',
    'IEA Electricity 2025': 'https://www.iea.org/reports/electricity-2025',
    'SEforALL': 'https://www.seforall.org/data-stories/chilling-prospects-2025',
    'UNEP': 'https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment',
    'GIZ Proklima': 'https://www.green-cooling-initiative.org/',
    'Cool Coalition': 'https://coolcoalition.org/global-cooling-pledge/',
    'CCC': 'https://www.cleancoolingcollaborative.org/',
  };
</script>

{#if sources.length > 0}
  <div class="source-attribution" class:compact>
    <i class="fa-solid fa-circle-info"></i>
    <span class="source-text">
      {compact ? 'Source' : 'Data source'}{sources.length > 1 ? 's' : ''}:
      {#each sources as src, i}
        {#if sourceLinks[src]}
          <a href={sourceLinks[src]} target="_blank" rel="noopener noreferrer">{src}</a>
        {:else}
          <span class="source-name">{src}</span>
        {/if}
        {#if i < sources.length - 1}
          <span class="source-sep">&middot;</span>
        {/if}
      {/each}
    </span>
    {#if methodologyLink}
      <a href="/methodology" class="meth-link" title="View full methodology">
        <i class="fa-solid fa-book-open"></i> Methodology
      </a>
    {/if}
  </div>
{/if}

<style>
  .source-attribution {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    color: #94a3b8;
    padding: 0.4rem 0.6rem;
    margin-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
  }

  .source-attribution.compact {
    padding: 0.25rem 0;
    margin-top: 0.25rem;
    border-top: none;
  }

  .source-attribution i {
    font-size: 0.6rem;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .source-text {
    flex: 1;
  }

  .source-attribution a {
    color: #3D6B6B;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }

  .source-attribution a:hover {
    color: #2D5252;
    text-decoration: underline;
  }

  .source-sep {
    margin: 0 0.15rem;
    color: #cbd5e1;
  }

  .source-name {
    font-weight: 500;
  }

  .meth-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.65rem;
    font-weight: 700;
    color: #3D6B6B;
    background: rgba(61, 107, 107, 0.06);
    border: 1px solid rgba(61, 107, 107, 0.12);
    border-radius: 999px;
    padding: 0.2rem 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .meth-link:hover {
    background: #3D6B6B;
    color: #fff;
    border-color: #3D6B6B;
  }
</style>

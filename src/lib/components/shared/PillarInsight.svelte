<!--
  PillarInsight.svelte
  Narrative bridge card shown between the story card and the first chart.
  Surfaces the meta.insight text from VIEW_META — a compelling, concrete
  paragraph that anchors the reader before they engage with the data.

  Props:
    insight  — string (from VIEW_META[pillarId].insight)
    color    — pillar accent hex (optional, defaults to teal)
-->
<script lang="ts">
  export let insight: string;
  export let color: string = '#3D6B6B';
</script>

<div class="pillar-insight" style="--insight-color: {color}">
  <div class="pillar-insight-icon">
    <i class="fa-solid fa-quote-left"></i>
  </div>
  <div class="pillar-insight-body">
    <p class="pillar-insight-text">{insight}</p>
    <a href="/methodology" class="pillar-insight-link">
      Full methodology <i class="fa-solid fa-arrow-right"></i>
    </a>
  </div>
</div>

<style>
  .pillar-insight {
    display: flex;
    gap: 1rem;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-left: 4px solid var(--insight-color);
    border-radius: 0 12px 12px 0;
    padding: 1.1rem 1.25rem;
    margin-bottom: 0.85rem;
    align-items: flex-start;
  }

  .pillar-insight-icon {
    color: var(--insight-color);
    font-size: 1.4rem;
    opacity: 0.25;
    flex-shrink: 0;
    margin-top: 0.15rem;
    line-height: 1;
  }

  .pillar-insight-body {
    flex: 1;
  }

  .pillar-insight-text {
    font-size: 0.88rem;
    color: #334155;
    line-height: 1.65;
    margin: 0 0 0.6rem;
    font-style: italic;
  }

  .pillar-insight-link {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--insight-color);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  .pillar-insight-link:hover {
    opacity: 1;
  }

  .pillar-insight-link i {
    font-size: 0.65rem;
  }
</style>

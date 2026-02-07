<script lang="ts">
  export let headline: string = 'Why Cooling Matters';
  export let subhead: string = 'The Transition is Urgent. The Opportunity is Now.';
  export let showPillarInfo: boolean = false;
  export let onPillarInfoClick: () => void = () => {};
</script>

<header class="main-header">
  <div>
    <h1 id="page-headline">{headline}</h1>
    <p id="page-subhead">{subhead}</p>
  </div>
  <div class="header-actions">
    <div id="last-updated">Loading...</div>
    {#if showPillarInfo}
      <button class="pillar-info-btn" type="button" id="pillar-info-btn" on:click={onPillarInfoClick}>
        <i class="fa-solid fa-circle-info"></i>
        Pillar Information
      </button>
    {/if}
  </div>
</header>

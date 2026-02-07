<script lang="ts">
  export let headline: string = 'Why Cooling Matters';
  export let subhead: string = 'The Transition is Urgent. The Opportunity is Now.';
  export let methodology: string = '';
  export let sources: { name: string; url: string }[] = [];
  export let showPillarInfo: boolean = false;
  export let visible: boolean = true;
  export let onPillarInfoClick: () => void = () => {};
</script>

<div class="story-box" style:display={visible ? 'flex' : 'none'}>
  <div class="story-content">
    <h1 id="page-headline">{headline}</h1>
    <p id="page-subhead">{subhead}</p>
    {#if methodology}
      <div class="story-methodology">
        <i class="fa-solid fa-circle-info"></i>
        <span>{methodology}</span>
        {#if sources.length > 0}
          <span class="story-sources">
            &mdash;
            {#each sources as src, i}
              <a href={src.url} target="_blank" rel="noopener noreferrer">{src.name}</a>{#if i < sources.length - 1},{/if}
            {/each}
          </span>
        {/if}
      </div>
    {/if}
  </div>
  <div class="story-meta">
    <div id="last-updated" class="story-updated">Loading...</div>
    {#if showPillarInfo}
      <button class="pillar-info-btn" type="button" id="pillar-info-btn" on:click={onPillarInfoClick}>
        <i class="fa-solid fa-circle-info"></i>
        Pillar Information
      </button>
    {/if}
  </div>
</div>

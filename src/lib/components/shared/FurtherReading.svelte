<!--
  FurtherReading.svelte
  "Go Deeper" strip shown at the bottom of each pillar.
  Renders partner logos as clickable links to key external reports/resources.

  Props:
    sources — array of { name, url, logo?, logoLarge? } from VIEW_META[pillarId].sources
    color   — pillar accent hex (optional)
-->
<script lang="ts">
  export let sources: Array<{ name: string; url: string; logo?: string; logoLarge?: boolean }> = [];
  export let color: string = '#3D6B6B';
</script>

{#if sources.length > 0}
  <div class="further-reading" style="--fr-color: {color}">
    <div class="further-reading-label">
      <i class="fa-solid fa-book-open"></i>
      Go deeper
    </div>
    <div class="further-reading-links">
      {#each sources as src}
        <a
          href={src.url}
          target="_blank"
          rel="noopener noreferrer"
          class="further-reading-item"
          title={src.name}
        >
          {#if src.logo}
            <img
              src={src.logo}
              alt={src.name}
              class="further-reading-logo"
              class:large={src.logoLarge}
            />
          {:else}
            <span class="further-reading-text-link">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              {src.name}
            </span>
          {/if}
        </a>
      {/each}
    </div>
  </div>
{/if}

<style>
  .further-reading {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1.1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    margin-bottom: 0.85rem;
    flex-wrap: wrap;
  }

  .further-reading-label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fr-color);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .further-reading-links {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .further-reading-item {
    display: flex;
    align-items: center;
    opacity: 0.75;
    transition: opacity 0.2s, transform 0.2s;
    text-decoration: none;
  }

  .further-reading-item:hover {
    opacity: 1;
    transform: translateY(-1px);
  }

  .further-reading-logo {
    height: 22px;
    width: auto;
    max-width: 80px;
    object-fit: contain;
    filter: grayscale(20%);
  }

  .further-reading-logo.large {
    height: 28px;
    max-width: 110px;
  }

  .further-reading-text-link {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--fr-color);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .further-reading-text-link i {
    font-size: 0.6rem;
  }

  @media (max-width: 600px) {
    .further-reading {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.6rem;
    }
  }
</style>

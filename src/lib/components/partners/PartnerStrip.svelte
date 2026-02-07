<script lang="ts">
  import { partners } from '$lib/data/partner-data';

  export let compact: boolean = false;
</script>

<div class="partner-strip" class:compact>
  <div class="strip-label">
    <i class="fa-solid fa-handshake"></i>
    <span>Partners</span>
  </div>
  <div class="strip-logos">
    {#each partners as partner (partner.id)}
      <a
        href={partner.coolingUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="strip-logo-link"
        title="{partner.fullName} - {partner.tagline}"
      >
        <img src={partner.logoPath} alt={partner.name} />
      </a>
    {/each}
  </div>
</div>

<style>
  .partner-strip {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: #fff;
    border: 1px solid var(--color-border, #E2E8F0);
    border-radius: var(--radius-md, 12px);
  }

  .partner-strip.compact {
    padding: 0.5rem 0.75rem;
    gap: 0.75rem;
  }

  .strip-label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;
    color: var(--color-text-muted, #888);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .strip-label i {
    color: var(--ccc-teal, #3D6B6B);
    font-size: 0.75rem;
  }

  .strip-logos {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .strip-logos::-webkit-scrollbar {
    display: none;
  }

  .strip-logo-link {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .strip-logo-link:hover {
    background: rgba(61, 107, 107, 0.06);
    transform: scale(1.05);
  }

  .strip-logo-link img {
    max-width: 64px;
    height: 22px;
    object-fit: contain;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  .strip-logo-link:hover img {
    opacity: 1;
  }

  .compact .strip-logo-link img {
    max-width: 48px;
    height: 18px;
  }

  .compact .strip-logos {
    gap: 0.5rem;
  }
</style>

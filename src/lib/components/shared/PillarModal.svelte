<script lang="ts">
  import { PILLAR_INFO } from './config';

  export let currentView: string = 'overview';
  export let visible: boolean = false;
  export let onClose: () => void = () => {};

  $: info = PILLAR_INFO[currentView] ?? null;

  function handleOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('pillar-modal-overlay')) {
      onClose();
    }
  }
</script>

<div
  class="pillar-modal-overlay"
  id="pillar-modal-overlay"
  class:active={visible}
  on:click={handleOverlayClick}
>
  <div class="pillar-modal">
    <button class="pillar-modal-close" type="button" id="pillar-modal-close" on:click={onClose}>
      <i class="fa-solid fa-xmark"></i>
    </button>
    {#if info}
      <h2 id="pillar-modal-title">{info.title}</h2>
      <p class="pillar-modal-subtitle" id="pillar-modal-subtitle">{info.subtitle}</p>
      <div class="pillar-modal-body" id="pillar-modal-body">{@html info.body}</div>
    {/if}
  </div>
</div>

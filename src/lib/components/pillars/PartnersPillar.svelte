<script lang="ts">
  export let active: boolean = false;

  import PartnerEcosystem from '$lib/components/partners/PartnerEcosystem.svelte';
</script>

<section id="view-partners" class="view-section" class:active>
  <div class="partners-view">
    <PartnerEcosystem />
  </div>
</section>

<style>
  .partners-view {
    max-width: 1100px;
    margin: 0 auto;
  }
</style>

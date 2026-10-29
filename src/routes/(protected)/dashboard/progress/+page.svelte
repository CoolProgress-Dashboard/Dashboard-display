<script lang="ts">
  import ProgressPillar from '$lib/components/pillars/ProgressPillar.svelte';
  import { pillarModalOpen } from '$lib/stores/ui';
</script>

<ProgressPillar
  active={true}
  onPillarInfoClick={() => pillarModalOpen.set(true)}
/>

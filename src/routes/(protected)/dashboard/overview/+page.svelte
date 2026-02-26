<script lang="ts">
  import { goto } from '$app/navigation';
  import OverviewPillar from '$lib/components/pillars/OverviewPillar.svelte';
</script>

<OverviewPillar
  active={true}
  onNavigate={(pillar) => goto(`/dashboard/${pillar}`)}
/>

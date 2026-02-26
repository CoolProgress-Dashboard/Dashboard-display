<script lang="ts">
  import PolicyPillar from '$lib/components/pillars/PolicyPillar.svelte';
  import { pillarModalOpen } from '$lib/stores/ui';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<PolicyPillar
  active={true}
  pledge={data.pledge ?? []}
  ndcTracker={data.ndcTracker ?? []}
  ncap={data.ncap ?? []}
  countries={data.countries ?? []}
  onPillarInfoClick={() => pillarModalOpen.set(true)}
/>

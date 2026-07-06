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
  kigali={data.kigali ?? []}
  meps={data.meps ?? []}
  onPillarInfoClick={() => pillarModalOpen.set(true)}
/>

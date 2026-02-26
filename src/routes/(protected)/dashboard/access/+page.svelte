<script lang="ts">
  import AccessPillar from '$lib/components/pillars/AccessPillar.svelte';
  import { pillarModalOpen } from '$lib/stores/ui';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<AccessPillar
  active={true}
  accessData={data.access ?? []}
  accessForecast={data.accessForecast ?? []}
  countries={data.countries ?? []}
  onPillarInfoClick={() => pillarModalOpen.set(true)}
/>

<script lang="ts">
  import KigaliPillar from '$lib/components/pillars/KigaliPillar.svelte';
  import { pillarModalOpen } from '$lib/stores/ui';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<KigaliPillar
  active={true}
  kigaliData={data.kigali ?? []}
  countries={data.countries ?? []}
  refrigerants={data.refrigerants ?? []}
  onPillarInfoClick={() => pillarModalOpen.set(true)}
/>

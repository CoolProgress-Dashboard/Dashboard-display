<script lang="ts">
  import EmissionsPillar from '$lib/components/pillars/EmissionsPillar.svelte';
  import { pillarModalOpen } from '$lib/stores/ui';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<EmissionsPillar
  active={true}
  claspEnergy={data.claspEnergy ?? []}
  subcool={data.subcool ?? []}
  countries={data.countries ?? []}
  emissions={data.emissions ?? []}
  regions={data.regions ?? []}
  emissionsYear={2030}
  emissionsAppliances={['Air Conditioning', 'Ceiling and Portable Fans', 'Refrigerator-Freezers']}
  onPillarInfoClick={() => pillarModalOpen.set(true)}
/>

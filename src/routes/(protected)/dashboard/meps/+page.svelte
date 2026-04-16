<script lang="ts">
  import MepsPillar from '$lib/components/pillars/MepsPillar.svelte';
  import { pillarModalOpen } from '$lib/stores/ui';
  import type { PageData } from './$types';

  export let data: PageData;

  // Compute region/equipment summaries from MEPS records
  $: mepsRegionData = (() => {
    const regionMap = new Map<string, { meps: number; labels: number; total: number }>();
    (data.meps ?? []).forEach((r) => {
      if (!r.region) return;
      if (!regionMap.has(r.region)) regionMap.set(r.region, { meps: 0, labels: 0, total: 0 });
      const entry = regionMap.get(r.region)!;
      entry.total++;
      if (r.requirement_type === 'MEPS') entry.meps++;
      if (r.requirement_type === 'Label') entry.labels++;
    });
    return Array.from(regionMap.entries()).map(([name, v]) => ({ name, ...v }));
  })();

  $: mepsEquipmentData = (() => {
    const typeMap = new Map<string, { meps: number; labels: number }>();
    (data.meps ?? []).forEach((r) => {
      if (!r.equipment_type) return;
      if (!typeMap.has(r.equipment_type)) typeMap.set(r.equipment_type, { meps: 0, labels: 0 });
      const entry = typeMap.get(r.equipment_type)!;
      if (r.requirement_type === 'MEPS') entry.meps++;
      if (r.requirement_type === 'Label') entry.labels++;
    });
    return Array.from(typeMap.entries()).map(([type, v]) => ({ type, ...v }));
  })();
</script>

<MepsPillar
  active={true}
  mepsData={data.meps ?? []}
  countries={data.countries ?? []}
  {mepsRegionData}
  {mepsEquipmentData}
  mepsShowRegionCard={true}
  mepsEquipmentCountryHtml=""
  acInverterShare={data.acInverterShare ?? []}
  peakLoadData={data.peakLoadData ?? []}
  mepsTimeline={data.mepsTimeline ?? []}
  mepsLevels={data.mepsLevels ?? []}
  onPillarInfoClick={() => pillarModalOpen.set(true)}
/>

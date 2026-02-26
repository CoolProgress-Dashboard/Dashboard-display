<script lang="ts">
  import { page } from '$app/stores';
  import '$lib/styles/dashboard.css';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import { PillarModal } from '$lib/components/shared';
  import { pillarModalOpen } from '$lib/stores/ui';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  // Derive active pillar from URL: /dashboard/emissions → 'emissions'
  $: currentView = $page.url.pathname.split('/').at(-1) ?? 'overview';
  $: isOverview = currentView === 'overview';
</script>

<svelte:head>
  <title>CoolProgress: Global Cooling Dashboard</title>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  />
</svelte:head>

<div class="dashboard-body">
  <div id="status" style="display:none"></div>

  <div class="main-container" class:overview-only={isOverview}>
    <Sidebar {currentView} countries={data?.countries ?? []} />

    <main class="main-content">
      <slot />
    </main>
  </div>

  <PillarModal
    {currentView}
    visible={$pillarModalOpen}
    onClose={() => pillarModalOpen.set(false)}
  />
</div>

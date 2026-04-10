<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import '$lib/styles/dashboard.css';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import { PillarModal } from '$lib/components/shared';
  import { VIEW_META } from '$lib/components/shared/config';
  import { pillarModalOpen } from '$lib/stores/ui';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  // Derive active pillar from URL: /dashboard/emissions → 'emissions'
  $: currentView = $page.url.pathname.split('/').at(-1) ?? 'overview';

  // Header is hidden for pillar views — each pillar has its own story card
  const PILLAR_VIEWS = ['emissions', 'meps', 'kigali', 'access', 'policy', 'overview'];
  $: headerVisible = !PILLAR_VIEWS.includes(currentView);

  $: viewMeta = VIEW_META[currentView] ?? VIEW_META['overview'];

  onMount(() => {
    (window as any).__dashboardSetCountry = (code: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set('country', code);
      goto(url.pathname + url.search, { replaceState: true, noScroll: true });
    };

    (window as any).__dashboardClearCountry = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete('country');
      goto(url.pathname + url.search, { replaceState: true, noScroll: true });
    };

    return () => {
      delete (window as any).__dashboardSetCountry;
      delete (window as any).__dashboardClearCountry;
    };
  });
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

  <div class="main-container">
    <Sidebar {currentView} countries={data?.countries ?? []} />

    <main class="main-content">
      <Header
        headline={viewMeta.headline}
        subhead={viewMeta.subhead}
        methodology={viewMeta.methodology ?? ''}
        sources={viewMeta.sources}
        visible={headerVisible}
        showPillarInfo={false}
        onPillarInfoClick={() => pillarModalOpen.set(true)}
      />
      <slot />
    </main>
  </div>

  <div class="tooltip" id="tooltip"></div>

  <PillarModal
    {currentView}
    visible={$pillarModalOpen}
    onClose={() => pillarModalOpen.set(false)}
  />
</div>

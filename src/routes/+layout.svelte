<script lang="ts">
  import '../app.css';

  // SvelteKit may pass params in some builds; declare to avoid warnings.
  export let params: Record<string, string> | undefined;
</script>

<svelte:head>
  <title>Global Cooling Intelligence Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<slot />

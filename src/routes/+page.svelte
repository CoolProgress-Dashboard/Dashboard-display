<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    // Redirect to dashboard after a brief moment
    goto('/dashboard');
  });
</script>

<div class="loading-screen">
  <div class="loader-content">
    <div class="loader-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
    <div class="loader-text">
      <span class="gradient-text">Loading Platform</span>
    </div>
  </div>
</div>

<style>
  .loading-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
  }

  .loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .loader-orbs {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    animation: orbit 2s ease-in-out infinite;
  }

  .orb-1 {
    width: 20px;
    height: 20px;
    background: #0693E3;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    animation-delay: 0s;
  }

  .orb-2 {
    width: 16px;
    height: 16px;
    background: #9B51E0;
    bottom: 10px;
    left: 10px;
    animation-delay: 0.2s;
  }

  .orb-3 {
    width: 14px;
    height: 14px;
    background: #00D084;
    bottom: 10px;
    right: 10px;
    animation-delay: 0.4s;
  }

  @keyframes orbit {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.6;
    }
  }

  .loader-text {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .gradient-text {
    background: linear-gradient(135deg, #0693E3 0%, #9B51E0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
</style>

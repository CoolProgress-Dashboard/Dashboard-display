<!--
  AnimatedCounter.svelte
  Reusable animated number counter with suffix parsing.
  Uses requestAnimationFrame for smooth 60fps animation with easeOutExpo easing.

  Props:
    value    - Display string like "7%", "1.2B", "3x", "66+"
    label    - Short description below the number
    context  - Longer explanatory text shown on hover
    duration - Animation duration in ms (default 2000)

  The component parses the numeric part and suffix from `value`,
  animates from 0 to the number, then appends the suffix.

  Usage:
    <AnimatedCounter value="7%" label="of global GHG emissions" context="Cooling accounts for..." />
-->
<script lang="ts">
  import { onMount } from 'svelte';

  export let value: string | number;
  export let unit: string = '';
  export let label: string = '';
  export let context: string = '';
  export let description: string = '';
  export let source: string = '';
  export let sourceUrl: string = '';
  export let duration: number = 2000;

  // Use description as tooltip if context not provided
  $: tooltipText = context || description;

  // Parse numeric part and suffix from value string
  // e.g. "7%" -> { num: 7, suffix: "%" }
  // "1.2B" -> { num: 1.2, suffix: "B" }
  // "66+" -> { num: 66, suffix: "+" }
  // "3x" -> { num: 3, suffix: "x" }
  function parseValue(raw: string): { num: number; suffix: string; prefix: string } {
    const trimmed = raw.trim();
    // Check for leading non-numeric characters (like currency symbols)
    const prefixMatch = trimmed.match(/^([^0-9.-]*)/);
    const prefix = prefixMatch ? prefixMatch[1] : '';
    const rest = trimmed.slice(prefix.length);
    const match = rest.match(/^([0-9]*\.?[0-9]+)(.*)/);
    if (match) {
      return { num: parseFloat(match[1]), suffix: match[2], prefix };
    }
    return { num: 0, suffix: trimmed, prefix: '' };
  }

  // If value is a number, use unit prop as suffix; otherwise parse string
  const rawStr = typeof value === 'number' ? `${value}${unit}` : String(value);
  const parsed = parseValue(rawStr);
  const targetNum = parsed.num;
  const suffix = parsed.suffix;
  const prefix = parsed.prefix;

  // Auto-detect decimals
  const decimals = targetNum % 1 !== 0 ? 1 : 0;

  let displayValue = `${prefix}0${suffix}`;
  let visible = false;
  let containerEl: HTMLElement;

  function easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function formatNumber(n: number): string {
    if (n >= 1000) {
      return n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }
    return n.toFixed(decimals);
  }

  function animate() {
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = eased * targetNum;
      displayValue = `${prefix}${formatNumber(current)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !visible) {
            visible = true;
            animate();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );

    if (containerEl) {
      observer.observe(containerEl);
    }

    return () => observer.disconnect();
  });

  let showTooltip = false;
</script>

<div
  class="counter-card"
  class:visible
  bind:this={containerEl}
  on:mouseenter={() => (showTooltip = true)}
  on:mouseleave={() => (showTooltip = false)}
  role="group"
  aria-label="{label}: {value}"
>
  <div class="counter-display">{displayValue}</div>
  <div class="counter-label">{label}</div>

  {#if showTooltip && tooltipText}
    <div class="counter-tooltip" role="tooltip">
      <p>{tooltipText}</p>
      {#if source}
        <p class="tooltip-source">Source: {#if sourceUrl}<a href={sourceUrl} target="_blank" rel="noreferrer">{source}</a>{:else}{source}{/if}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .counter-card {
    position: relative;
    text-align: center;
    padding: 1.25rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    cursor: default;
    transition:
      transform 0.3s ease,
      background 0.3s ease,
      opacity 0.6s ease,
      translate 0.6s ease;
    opacity: 0;
    translate: 0 20px;
  }

  .counter-card.visible {
    opacity: 1;
    translate: 0 0;
  }

  .counter-card:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  .counter-display {
    font-size: 2.2rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.03em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    margin-bottom: 0.35rem;
  }

  .counter-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.3;
    max-width: 180px;
    margin: 0 auto;
  }

  .counter-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.95);
    color: #e2e8f0;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    line-height: 1.5;
    width: 240px;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    pointer-events: auto;
  }

  .counter-tooltip p {
    margin: 0;
  }

  .tooltip-source {
    margin-top: 0.4rem !important;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .tooltip-source a {
    color: rgba(139, 195, 74, 0.8);
    text-decoration: none;
  }

  @media (max-width: 768px) {
    .counter-display {
      font-size: 1.6rem;
    }

    .counter-label {
      font-size: 0.7rem;
    }

    .counter-tooltip {
      width: 200px;
    }
  }
</style>

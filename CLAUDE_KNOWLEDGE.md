# CoolProgress Dashboard — Claude Code Knowledge Base

> Written for future Claude Code sessions working on this project.
> Last updated: February 2025

---

## 1. Project Overview

**CoolProgress Dashboard** is a data-visualization platform tracking global cooling-related climate indicators across five thematic pillars. It is built for HEAT GmbH / CoolProgress and deployed at Cloudflare Pages.

**Live repo:** `https://github.com/CoolProgress-Dashboard/Dashboard-display.git`
**Local path:** `/mnt/c/Users/PrietoGarciaManuel/Dashboard_Main/Dashboard-display`
**Local dev server:** `npm run dev -- --host` → http://localhost:5173

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2.6 + Svelte 4, TypeScript |
| Styling | Tailwind CSS + custom `dashboard.css` |
| Charts | **ECharts 5.5** (primary), D3.js v7 (maps) |
| Database | Supabase PostgreSQL (~185k+ records, 13 tables) |
| Deployment | Cloudflare Pages via `@sveltejs/adapter-cloudflare` |
| Dev server | Vite 5.4 |

---

## 3. Project Structure

```
src/
├── routes/
│   └── (protected)/dashboard/+page.svelte   ← MAIN FILE (7000+ lines)
├── lib/
│   ├── components/
│   │   ├── charts/          ← Self-contained ECharts components (WORKING PATTERN)
│   │   │   ├── AcGrowthChart.svelte
│   │   │   ├── MepsLevelChart.svelte
│   │   │   ├── PeakLoadChart.svelte
│   │   │   └── ApplianceGrowthChart.svelte
│   │   ├── pillars/         ← View-specific HTML structure
│   │   │   ├── KigaliPillar.svelte
│   │   │   ├── AccessPillar.svelte
│   │   │   ├── EmissionsPillar.svelte
│   │   │   ├── MepsPillar.svelte
│   │   │   └── PolicyPillar.svelte
│   │   ├── layout/
│   │   │   └── Sidebar.svelte
│   │   └── shared/
│   │       ├── config.ts    ← ALL constants and config
│   │       └── PillarModal.svelte
│   ├── services/
│   │   ├── dashboard-data.ts    ← All Supabase fetching
│   │   └── dashboard-types.ts  ← All TypeScript types
│   └── styles/
│       ├── dashboard.css    ← Main stylesheet (4100+ lines)
│       └── animations.css
```

---

## 4. Five Dashboard Views (Pillars)

| View key | Section ID | Pillar component |
|---|---|---|
| `overview` | `#view-overview` | inline in +page.svelte |
| `kigali` | `#view-kigali` | `KigaliPillar.svelte` |
| `emissions` | `#view-emissions` | `EmissionsPillar.svelte` |
| `access` | `#view-access` | `AccessPillar.svelte` |
| `meps` | `#view-meps` | `MepsPillar.svelte` |
| `policy` | `#view-policy` | `PolicyPillar.svelte` |

Views are shown/hidden via `.view-section` / `.view-section.active` CSS classes (`display: none` / `display: block`).

---

## 5. CSS Layout Architecture

### Main grid
```css
.main-container { display: grid; grid-template-columns: 260px 1fr; }
.main-content   { min-width: 0; overflow-x: hidden; }
```

### Card/chart hierarchy (inside each view)
```
.view-section.active
  └── .pillar-stack          (flex column, max-width: 1400px)
        └── .card-panel      (background card)
              ├── .chart-card-header
              └── .chart-card-body   (overflow: hidden)
                    └── .chart-surface  (width: 100% !important; overflow: hidden)
                          └── [ECharts canvas]
```

### CRITICAL CSS rules for responsive charts (added Feb 2025)
```css
/* Allows flex children to shrink below content min-width */
.pillar-stack { width: 100%; min-width: 0; overflow-x: hidden; }
.pillar-stack > * { min-width: 0; }

/* Card panel can shrink */
.card-panel { min-width: 0; width: 100%; }

/* Chart body can shrink */
.chart-card-body { min-width: 0; box-sizing: border-box; }
```

**Why these are needed:** Without `min-width: 0` on flex children, a card containing wide toggle-button rows sets an intrinsic minimum width that prevents the card from shrinking below the button content width. ECharts then reads the inflated `el.clientWidth` and redraws at the wrong (too-large) size.

---

## 6. ECharts Resize — The Critical Problem & Solution

### Background: two types of chart components

**Type A — Self-contained Svelte components** (`AcGrowthChart.svelte`, `MepsLevelChart.svelte`, etc.)
These live in `src/lib/components/charts/` and handle their own data + resize.
They work correctly and should be the pattern for NEW charts.

```svelte
<script>
  import { onMount } from 'svelte';
  let chartContainer: HTMLDivElement;

  onMount(async () => {
    const echarts = await import('echarts');
    const instance = echarts.init(chartContainer); // NO explicit {width, height}
    instance.setOption(option);

    const observer = new ResizeObserver(() => instance?.resize());
    observer.observe(chartContainer);

    return () => { observer.disconnect(); instance?.dispose(); };
  });
</script>

<div class="chart-container" bind:this={chartContainer}></div>

<style>
  .chart-container { width: 100%; height: 380px; }
</style>
```

**Type B — `setChart()` managed charts** (charts in KigaliPillar, AccessPillar, etc.)
These are initialized from `+page.svelte`'s `setChart(id, option)` function using DOM IDs.

---

### The ECharts resize problem (deep explanation)

When `echarts.init(el, null, { width: W, height: H })` is called:
- zrender (ECharts' renderer) stores `opts.width = W` internally
- It creates a `domRoot` div inside `el` with `style.width = 'Wpx'`
- Calling `chart.resize()` with **no args** later returns the **stored W** — it does NOT re-read the DOM
- This is why charts appeared to freeze at their initial width on window resize

When `echarts.init(el)` is called **without explicit dims**:
- `opts.width = undefined`
- `chart.resize()` with no args reads `el.clientWidth` from the DOM each time
- This is the working pattern used by Type A components

### The complete fix (confirmed working, Feb 2025)

**Step 1 — CSS (must come first):**
Ensure `el.clientWidth` actually changes when the viewport shrinks. Without `min-width: 0` on flex containers, `el.clientWidth` is stuck at the content's intrinsic width.

```css
.pillar-stack > * { min-width: 0; }
.card-panel { min-width: 0; width: 100%; }
```

**Step 2 — JS (in `setChart`, active-view branch):**
Initialize without explicit dims so ECharts doesn't store a fixed width:

```javascript
if (sectionActive) {
    el.style.width = '';   // clear inline width, let CSS width:100% govern
    charts[id] = echarts.init(el);  // reads el.clientWidth, stores opts.width=undefined
}
```

**Step 3 — JS (ResizeObserver callback):**
Pass `el.clientWidth` explicitly to bypass any stored `opts.width`:

```javascript
const obs = new ResizeObserver(() => {
    if (!charts[id]) return;
    const w = el.clientWidth;
    const h = el.clientHeight || parseInt(el.style.minHeight) || 280;
    if (w > 10 && h > 10) charts[id].resize({ width: w, height: h });
});
obs.observe(el);
```

### How to debug chart resize issues

Open DevTools Console on the affected view and run:

```javascript
const el = document.getElementById('chart-kigali-transition'); // or other ID
const canvas = el?.querySelector('canvas');
console.log('el.clientWidth:', el?.clientWidth);       // should change when window resizes
console.log('canvas width:', canvas?.width);           // should match el.clientWidth after fix
console.log('card-panel width:', el?.closest('.card-panel')?.clientWidth);
```

**Diagnostic table:**

| Symptom | Meaning | Fix |
|---|---|---|
| `el.clientWidth` stays fixed when window shrinks | Container stuck — CSS `min-width` issue | Add `min-width: 0` to flex ancestors |
| `el.clientWidth` changes but canvas doesn't | `opts.width` stored — JS resize issue | Use `resize({ width: el.clientWidth })` |
| `canvas width` matches `el.clientWidth` | Fix is working ✅ | — |

---

## 7. View Switching Mechanism

```javascript
// switchView(view) flow:
// T+0ms (synchronous):
viewSection.classList.add('active');   // sets CSS display:block
currentViewState = view;               // Svelte reactive (batched)

// T+~16ms (next rAF):
setTimeout(reinitViewCharts, 100);     // schedules chart reinit

// T+~116ms:
forceReinitCharts = true;
updateKigaliCharts();   // → setChart() → chart is disposed+reinited
forceReinitCharts = false;
forceResizeViewCharts(view);

// T+~416ms, T+~816ms: additional resize passes
```

**Key point:** When `setChart` runs inside `reinitViewCharts`, the view IS already active (`classList.contains('active') === true`), so `sectionActive = true` and the correct init path runs.

---

## 8. `setChart(id, option)` — Centralized Chart Init

Located in `+page.svelte` around line 1574. Manages all Type B charts.

Key behaviors:
- `needsInit = !charts[id]` — true on first visit
- `forceReinitCharts = true` → disposes + recreates chart on view switch
- `chartObservers` Map tracks one ResizeObserver per chart ID
- Observer is disconnected when chart is disposed
- Active-view path: `echarts.init(el)` without explicit dims + ResizeObserver
- Hidden-view path (fallback): `echarts.init(el, null, {width, height})` — gets re-created by `forceReinitCharts` when view becomes active

---

## 9. Adding a New Chart — Recommended Pattern

**Prefer Type A (self-contained component) for all new charts:**

1. Create `src/lib/components/charts/MyNewChart.svelte` using the pattern from `AcGrowthChart.svelte`
2. Import and use in the relevant pillar: `<MyNewChart data={...} />`
3. Add any new data types to `dashboard-types.ts`
4. Add data fetching to `dashboard-data.ts` if a new Supabase table is needed
5. Pass data down from `+page.svelte` to the pillar component via props

**Only use `setChart()` (Type B)** if the chart needs complex shared state from `+page.svelte` that can't easily be passed as props.

---

## 10. Dev Server Workflow

```bash
# Start dev server (run from project root)
nohup npm run dev -- --host > /tmp/vite-dev.log 2>&1 &

# Check if running
pgrep -a node | grep vite

# Kill all Vite processes
pkill -f "vite dev"
# or by PID: kill -9 <PID>

# View logs
tail -20 /tmp/vite-dev.log
```

**Browser not showing new changes?**
1. Open DevTools (F12) → Network tab → check **"Disable cache"** → press F5
2. Or open an **Incognito window** and go to http://localhost:5173
3. Or: DevTools → Application → Storage → Clear site data

**Verify new code is loaded (Step 1 check):**
```javascript
fetch('/src/lib/styles/dashboard.css')
  .then(r => r.text())
  .then(t => console.log('CSS loaded:', t.includes('pillar-stack > *')));
```

---

## 11. Deployment

```bash
# Push to GitHub (triggers Cloudflare Pages auto-deploy)
git add .
git commit -m "your message"
git push origin main
```

The Cloudflare Pages deployment is separate from localhost. Changes pushed to GitHub appear on the live site after a build (~2 min). Local changes never affect the deployed site.

---

## 12. Known Issues & History

| Date | Issue | Fix applied |
|---|---|---|
| Jan 2025 | Kigali 2050 label cut off | Changed chart init dimensions |
| Feb 2025 | Kigali + Access charts clip on small screens | CSS `min-width:0` on flex containers + explicit `resize({width: el.clientWidth})` in ResizeObserver |
| Jan 2025 | Emissions map not showing countries | Fixed D3 selector from `path.country` to `.emissions-path` |
| Jan 2025 | Map SVG duplicates on hot reload | Added `d3.select('#container').selectAll('svg').remove()` before init |
| Jan 2025 | Access chart country detail doesn't resize | Added to `accessCountryStackedChart` + `accessCountryPieChart` variables in resize handler |

---

## 13. Supabase Tables Reference

| Table | View | ~Records |
|---|---|---|
| `global_model_subcool` | Emissions (HEAT) | ~100,000 |
| `clasp_energy_consumption` | Emissions (CLASP) | ~50,000 |
| `access_to_cooling_seeforall` | Access | ~3,700 |
| `kigali_hfc_data` | Kigali | varies |
| `policy_database` | Policy | varies |

Supabase URL: `https://hcpmdkkavtadgugrqohl.supabase.co`
Config: `src/lib/components/shared/config.ts`

---

## 14. CSS Classes Quick Reference

| Class | Purpose |
|---|---|
| `.pillar-stack` | Flex column container for all cards in a view |
| `.card-panel` | White rounded card (generic) |
| `.chart-card` | Card specifically for charts |
| `.chart-card-body` | Inner padding area of chart card |
| `.chart-surface` | Direct parent of ECharts instance (width:100%!important) |
| `.chart-container` | Used by Type A self-contained components |
| `.view-section` | Hidden view wrapper (display:none) |
| `.view-section.active` | Visible view (display:block) |
| `.main-container` | Root grid (260px sidebar + 1fr content) |
| `.main-content` | Scrollable content area (min-width:0) |

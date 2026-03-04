/**
 * Terra Nova — CoolProgress Dashboard Color System
 *
 * Single source of truth for all chart, map, and visualization colors.
 * Import from here; never hardcode hex values in chart components.
 *
 * Semantic:
 *   Green family  → good / advanced / savings / historical
 *   Terracotta    → bad / BAU / critical / high emissions
 *   Amber         → developing / moderate / warning
 *   Dusty blue    → neutral categorical (3rd series)
 *   Mauve         → neutral categorical (6th series)
 */

// ---------------------------------------------------------------------------
// Sequential scale — 7 steps, lightest → heaviest (for choropleth maps)
// Greens for "lower / better", terracotta for "higher / worse"
// ---------------------------------------------------------------------------
export const SEQ = [
  '#F0F7F0', // step 1 — very low
  '#C8E8C4', // step 2 — low
  '#A8D5A2', // step 3 — medium-low
  '#52B788', // step 4 — medium
  '#2D7D5A', // step 5 — medium-high
  '#C25B33', // step 6 — high
  '#8B2500', // step 7 — very high
] as const;

// Convenience aliases for 4-bucket maps
export const SEQ_4 = [SEQ[0], SEQ[2], SEQ[5], SEQ[6]] as const;

// ---------------------------------------------------------------------------
// Diverging scale — BAU (warm) ← neutral → savings (cool-green)
// ---------------------------------------------------------------------------
export const DIV = {
  WARM_DARK:  '#8B2500',  // worst / very high BAU
  WARM_MID:   '#C25B33',  // high BAU
  WARM_LIGHT: '#F0A47A',  // moderate BAU
  NEUTRAL:    '#F5F0E8',  // baseline reference
  COOL_LIGHT: '#A8D5A2',  // some savings
  COOL_MID:   '#52B788',  // good savings
  COOL_DARK:  '#2D7D5A',  // deep savings / advanced
} as const;

// ---------------------------------------------------------------------------
// Categorical series — 6 distinct colors for multi-series charts
// Order: use in this order for line / bar series
// ---------------------------------------------------------------------------
export const CAT = [
  '#2D7D5A', // 1 — forest green
  '#52B788', // 2 — mint
  '#C25B33', // 3 — terracotta
  '#D4A843', // 4 — amber
  '#5A8FC2', // 5 — dusty blue
  '#A0788A', // 6 — mauve
] as const;

// ECharts top-level `color:` array (default series palette)
export const ECHARTS_PALETTE = [...CAT] as string[];

// ---------------------------------------------------------------------------
// Appliance-specific (3 appliances, consistent everywhere)
// ---------------------------------------------------------------------------
export const APPLIANCE = {
  AC:     '#2D7D5A', // forest green
  FANS:   '#D4A843', // amber
  FRIDGES:'#5A8FC2', // dusty blue
} as const;

// Emission-appliance colors — warm palette (no green/blue) for donut/bar charts
export const EMISSION_APPLIANCE = {
  AC:     '#C25B33', // terracotta
  FANS:   '#F0A47A', // light orange
  FRIDGES:'#F5E0A0', // cream / light yellow
} as const;

// ---------------------------------------------------------------------------
// Access risk warm scale — 7 steps: very light → deep red (high = more at risk)
// ---------------------------------------------------------------------------
export const ACCESS_RISK = [
  '#FFF9E6', // <1M  — very light cream
  '#F5E4A0', // 1-5M — light yellow
  '#F5C44A', // 5-20M — gold
  '#F0A47A', // 20-50M — light orange
  '#E07850', // 50-200M — mid orange
  '#C25B33', // 200-500M — terracotta
  '#8B2500', // >500M — deep red
] as const;

// ---------------------------------------------------------------------------
// Scenario colors (CLASP + HEAT)
// ---------------------------------------------------------------------------
export const SCENARIO = {
  BAU:        '#C25B33', // Business as Usual — terracotta
  KIP:        '#D4A843', // Kigali Implementation — amber
  KIP_PLUS:   '#2D7D5A', // Kigali+ — forest green
  GB:         '#A8D5A2', // Green Buildings — sage
  NZH:        '#52B788', // Net Zero Homes — mint
  BAT:        '#2D7D5A', // Best Available Technology — forest
  HISTORICAL: '#2D7D5A', // historical line — forest green
  PROJECTED:  '#F0A47A', // projected / BAU projected — light terracotta
  DECARB:     '#52B788', // DECARB pathway — mint
} as const;

// ---------------------------------------------------------------------------
// Emission type
// ---------------------------------------------------------------------------
export const EMISSION = {
  DIRECT:   '#C25B33', // refrigerant leakage — terracotta
  INDIRECT: '#5A8FC2', // energy-related — dusty blue
  TOTAL:    '#2D7D5A', // combined — forest green
} as const;

// ---------------------------------------------------------------------------
// Status / policy coverage (5-level scale: worst → best)
// ---------------------------------------------------------------------------
export const STATUS = {
  NONE:       '#E07868', // no policy / critical     — warm salmon
  MINIMAL:    '#EEA080', // minimal / limited         — peach
  DEVELOPING: '#D4A843', // developing / partial      — amber (unchanged)
  GOOD:       '#6BADA0', // good coverage             — muted teal
  ADVANCED:   '#4A9088', // advanced / full           — dark teal
} as const;

// Binary yes/no — muted teal / warm salmon (Terra Nova screenshot palette)
export const YES = '#6BADA0';
export const NO  = '#E07868';

// No data / missing
export const NO_DATA = '#E5E1D8';

// ---------------------------------------------------------------------------
// Waterfall / savings decomposition layers
// ---------------------------------------------------------------------------
export const SAVINGS = {
  BAU:      '#C25B33', // starting baseline — terracotta
  MEPS:     '#C8E8C4', // MEPS & Labels savings — very light green
  HIGH_EFF: '#A8D5A2', // High Efficiency savings — sage
  BAT:      '#52B788', // Best Available Tech savings — mint
  GRID:     '#D4A843', // Grid Decarbonisation savings — amber
  NET:      '#F0A47A', // Net remaining emissions — light terracotta
} as const;

// ---------------------------------------------------------------------------
// MEPS Level Chart — 16 country/region lines (distinct but Terra Nova-toned)
// ---------------------------------------------------------------------------
export const COUNTRY_LINES: Record<string, string> = {
  'India':          '#C25B33',
  'China':          '#8B2500',
  'EU':             '#5A8FC2',
  'USA (South)':    '#2D7D5A',
  'Brazil':         '#D4A843',
  'Japan':          '#A0788A',
  'South Korea':    '#52B788',
  'Saudi Arabia':   '#F0A47A',
  'South Africa':   '#3B6B9E',
  'Australia':      '#7AABC0',
  'Singapore':      '#B8820A',
  'Nigeria':        '#A8D5A2',
  'SADC':           '#7B5269',
  'EAC':            '#C27050',
  'ECOWAS':         '#1A5E56',
  'ASEAN':          '#6B9EC0',
};

// ---------------------------------------------------------------------------
// Chart chrome — axes, tooltips, grid lines (neutral, unchanged)
// ---------------------------------------------------------------------------
export const CHROME = {
  AXIS_LABEL:    '#475569',
  AXIS_LINE:     '#cbd5e1',
  SPLIT_LINE:    '#e2e8f0',
  DEMARCATION:   '#94a3b8',
  TOOLTIP_BG:    '#1e293b',
  TEXT_MUTED:    '#94a3b8',
  TEXT_SECONDARY:'#64748b',
} as const;

// ---------------------------------------------------------------------------
// Helper: convert hex → rgba string
// ---------------------------------------------------------------------------
export const rgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ---------------------------------------------------------------------------
// Helper: build ECharts linear gradient for area fills
// ---------------------------------------------------------------------------
export const areaGradient = (hex: string, topAlpha = 0.30, bottomAlpha = 0.02) => ({
  type: 'linear' as const,
  x: 0, y: 0, x2: 0, y2: 1,
  colorStops: [
    { offset: 0, color: rgba(hex, topAlpha) },
    { offset: 1, color: rgba(hex, bottomAlpha) },
  ],
});

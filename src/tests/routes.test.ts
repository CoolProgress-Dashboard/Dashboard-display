/**
 * Tests for sub-route file existence and required prop wiring.
 *
 * After the monolith split, each pillar must have its own +page.svelte and
 * must pass the correct data props to its pillar component.  These tests act
 * as a structural smoke-test so accidental deletions or renames are caught
 * immediately.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const DASHBOARD = resolve('./src/routes/(protected)/dashboard');
const route = (path: string) => readFileSync(resolve(DASHBOARD, path), 'utf-8');

// ─── File existence ────────────────────────────────────────────────────────────
describe('Dashboard route files exist', () => {
  const PILLAR_ROUTES = ['overview', 'emissions', 'meps', 'kigali', 'access', 'policy', 'partners'];

  it.each(PILLAR_ROUTES)('%s/+page.svelte exists', (pillar) => {
    expect(existsSync(resolve(DASHBOARD, pillar, '+page.svelte'))).toBe(true);
  });

  it('+layout.svelte exists', () => {
    expect(existsSync(resolve(DASHBOARD, '+layout.svelte'))).toBe(true);
  });

  it('+layout.ts data loader exists', () => {
    expect(existsSync(resolve(DASHBOARD, '+layout.ts'))).toBe(true);
  });

  it('/dashboard root redirects via +page.ts (no +page.svelte)', () => {
    expect(existsSync(resolve(DASHBOARD, '+page.ts'))).toBe(true);
    // A +page.svelte here would fight with the redirect
    expect(existsSync(resolve(DASHBOARD, '+page.svelte'))).toBe(false);
  });
});

// ─── Route contents ────────────────────────────────────────────────────────────
describe('Pillar route prop wiring', () => {
  it('overview renders OverviewPillar with active={true}', () => {
    const c = route('overview/+page.svelte');
    expect(c).toContain('OverviewPillar');
    expect(c).toContain('active={true}');
  });

  it('emissions passes claspEnergy, subcool, countries, emissions, regions', () => {
    const c = route('emissions/+page.svelte');
    expect(c).toContain('EmissionsPillar');
    expect(c).toContain('claspEnergy');
    expect(c).toContain('subcool');
    expect(c).toContain('countries');
    expect(c).toContain('emissions');
    expect(c).toContain('regions');
  });

  it('meps passes mepsData, countries, acInverterShare', () => {
    const c = route('meps/+page.svelte');
    expect(c).toContain('MepsPillar');
    expect(c).toContain('mepsData');
    expect(c).toContain('countries');
    expect(c).toContain('acInverterShare');
  });

  it('kigali passes kigaliData, countries, refrigerants', () => {
    const c = route('kigali/+page.svelte');
    expect(c).toContain('KigaliPillar');
    expect(c).toContain('kigaliData');
    expect(c).toContain('countries');
    expect(c).toContain('refrigerants');
  });

  it('access passes accessData, accessForecast, countries', () => {
    const c = route('access/+page.svelte');
    expect(c).toContain('AccessPillar');
    expect(c).toContain('accessData');
    expect(c).toContain('accessForecast');
    expect(c).toContain('countries');
  });

  it('policy passes pledge, ndcTracker, ncap, countries', () => {
    const c = route('policy/+page.svelte');
    expect(c).toContain('PolicyPillar');
    expect(c).toContain('pledge');
    expect(c).toContain('ndcTracker');
    expect(c).toContain('ncap');
    expect(c).toContain('countries');
  });

  it('partners renders PartnersPillar with active={true}', () => {
    const c = route('partners/+page.svelte');
    expect(c).toContain('PartnersPillar');
    expect(c).toContain('active={true}');
  });
});

// ─── Layout data loader ────────────────────────────────────────────────────────
describe('+layout.ts data loader', () => {
  it('loads all datasets needed by pillar components', () => {
    const c = readFileSync(resolve(DASHBOARD, '+layout.ts'), 'utf-8');
    const required = [
      'countries', 'pledge', 'kigali', 'meps', 'access',
      'accessForecast', 'emissions', 'ndcTracker', 'ncap',
      'claspEnergy', 'subcool', 'regions', 'refrigerants', 'acInverterShare'
    ];
    for (const key of required) {
      expect(c, `layout.ts missing dataset: "${key}"`).toContain(key);
    }
  });

  it('redirects to /dashboard/overview from root', () => {
    const c = readFileSync(resolve(DASHBOARD, '+page.ts'), 'utf-8');
    expect(c).toContain('/dashboard/overview');
    expect(c).toContain('redirect');
  });
});

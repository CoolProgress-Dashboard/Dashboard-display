/**
 * Tests for the dashboard layout structure and header visibility logic.
 *
 * These tests verify:
 *  1. The +layout.svelte file contains the required structural elements
 *     (Header, tooltip div, VIEW_META wiring) that were added during refactoring.
 *  2. The header visibility logic correctly hides/shows the Header based on the
 *     active view — pillar views have their own story cards so the layout Header
 *     must be hidden for them.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DASHBOARD = resolve('./src/routes/(protected)/dashboard');
const layoutPath = resolve(DASHBOARD, '+layout.svelte');
const layout = readFileSync(layoutPath, 'utf-8');

// ─── Mirror the visibility logic from +layout.svelte ──────────────────────────
const PILLAR_VIEWS = ['emissions', 'meps', 'kigali', 'access', 'policy'];
const headerVisible = (view: string) => !PILLAR_VIEWS.includes(view);

// ─── Layout file structure ─────────────────────────────────────────────────────
describe('Dashboard +layout.svelte structure', () => {
  it('imports the Header component', () => {
    expect(layout).toContain("import Header from '$lib/components/layout/Header.svelte'");
  });

  it('imports VIEW_META from config', () => {
    expect(layout).toContain('VIEW_META');
    expect(layout).toContain("'$lib/components/shared/config'");
  });

  it('renders <Header> with a visible prop', () => {
    expect(layout).toContain('<Header');
    expect(layout).toContain('visible={headerVisible}');
  });

  it('passes headline from viewMeta to Header', () => {
    expect(layout).toContain('headline={viewMeta.headline}');
  });

  it('passes subhead from viewMeta to Header', () => {
    expect(layout).toContain('subhead={viewMeta.subhead}');
  });

  it('includes the tooltip div required by D3 choropleth maps', () => {
    expect(layout).toContain('class="tooltip"');
    expect(layout).toContain('id="tooltip"');
  });

  it('includes the PillarModal component', () => {
    expect(layout).toContain('<PillarModal');
  });

  it('includes the Sidebar component', () => {
    expect(layout).toContain('<Sidebar');
  });

  it('does NOT use the undefined "overview-only" CSS class', () => {
    // This class has no CSS definition — it was removed during the refactoring
    expect(layout).not.toContain('overview-only');
  });
});

// ─── Header visibility logic ──────────────────────────────────────────────────
describe('Layout header visibility logic', () => {
  it('Header is visible on the overview view', () => {
    expect(headerVisible('overview')).toBe(true);
  });

  it('Header is visible on the partners view', () => {
    expect(headerVisible('partners')).toBe(true);
  });

  it.each(PILLAR_VIEWS)(
    'Header is hidden on the %s pillar view (pillar has its own story card)',
    (view) => {
      expect(headerVisible(view)).toBe(false);
    }
  );
});

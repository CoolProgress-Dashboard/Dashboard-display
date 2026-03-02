/**
 * Tests for VIEW_META configuration completeness.
 * Ensures every dashboard view has the required metadata fields
 * so the Header component never renders empty/undefined content.
 */
import { describe, it, expect } from 'vitest';
import { VIEW_META } from '$lib/components/shared/config';

const ALL_VIEWS = ['overview', 'emissions', 'meps', 'kigali', 'access', 'policy', 'partners'];
const PILLAR_VIEWS = ['emissions', 'meps', 'kigali', 'access', 'policy'];

describe('VIEW_META config', () => {
  it('has an entry for every dashboard view', () => {
    for (const view of ALL_VIEWS) {
      expect(VIEW_META, `VIEW_META is missing an entry for "${view}"`).toHaveProperty(view);
    }
  });

  it('every entry has a non-empty headline', () => {
    for (const view of ALL_VIEWS) {
      expect(VIEW_META[view].headline, `headline missing for "${view}"`).toBeTruthy();
    }
  });

  it('every entry has a non-empty subhead', () => {
    for (const view of ALL_VIEWS) {
      expect(VIEW_META[view].subhead, `subhead missing for "${view}"`).toBeTruthy();
    }
  });

  it('every entry has at least one source', () => {
    for (const view of ALL_VIEWS) {
      expect(
        VIEW_META[view].sources.length,
        `no sources defined for "${view}"`
      ).toBeGreaterThan(0);
    }
  });

  it('every source has a name and url', () => {
    for (const view of ALL_VIEWS) {
      for (const src of VIEW_META[view].sources) {
        expect(src.name, `source name missing in "${view}"`).toBeTruthy();
        expect(src.url, `source url missing in "${view}"`).toBeTruthy();
      }
    }
  });

  it('pillar views have methodology text (shown in Header story-box)', () => {
    for (const view of PILLAR_VIEWS) {
      expect(
        VIEW_META[view].methodology,
        `methodology missing for pillar view "${view}"`
      ).toBeTruthy();
    }
  });

  it('overview and partners are NOT in pillar views', () => {
    expect(PILLAR_VIEWS).not.toContain('overview');
    expect(PILLAR_VIEWS).not.toContain('partners');
  });
});

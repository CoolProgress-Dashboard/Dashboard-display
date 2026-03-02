/**
 * Tests for EmissionsPillar bug fixes:
 *
 *  1. Two extra charts (EmissionsWaterfallChart + EmissionsCumulativeChart) were
 *     added by the refactoring agent — they were never in the original. Verify they
 *     are no longer rendered in the template.
 *
 *  2. HEAT data map / country-click bug: initEmissions() only assigned localClaspEnergy
 *     from the claspEnergy prop, leaving subcoolData, regionsData, and countriesData
 *     as empty arrays even when the props were available.  Verify the fix is in place.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PILLAR = resolve('./src/lib/components/pillars/EmissionsPillar.svelte');
const source = readFileSync(PILLAR, 'utf-8');

describe('EmissionsPillar — removed extra charts', () => {
  it('does NOT import EmissionsWaterfallChart', () => {
    expect(source).not.toContain("import EmissionsWaterfallChart");
  });

  it('does NOT import EmissionsCumulativeChart', () => {
    expect(source).not.toContain("import EmissionsCumulativeChart");
  });

  it('does NOT render <EmissionsWaterfallChart> in the template', () => {
    expect(source).not.toContain('<EmissionsWaterfallChart');
  });

  it('does NOT render <EmissionsCumulativeChart> in the template', () => {
    expect(source).not.toContain('<EmissionsCumulativeChart');
  });

  it('does NOT have the Savings Decomposition card panel in the template', () => {
    // Extract only the template part (after </script>)
    const templateStart = source.indexOf('</script>');
    const template = templateStart >= 0 ? source.slice(templateStart) : source;
    expect(template).not.toContain('Savings Decomposition');
    expect(template).not.toContain('savings-chart-col">');
  });
});

describe('EmissionsPillar — data loading fix (HEAT map + country click)', () => {
  it('assigns subcoolData from the subcool prop when claspEnergy is provided', () => {
    // The fix: subcoolData = subcool; must be inside the claspEnergy.length > 0 branch
    expect(source).toContain('subcoolData      = subcool');
  });

  it('assigns regionsData from the regions prop when claspEnergy is provided', () => {
    expect(source).toContain('regionsData      = regions');
  });

  it('assigns countriesData from the countries prop when claspEnergy is provided', () => {
    expect(source).toContain('countriesData    = countries');
  });

  it('all four data assignments are inside the claspEnergy.length > 0 branch', () => {
    // Find the branch block
    const branchStart = source.indexOf('if (claspEnergy.length > 0)');
    const branchEnd   = source.indexOf('} else {', branchStart);
    expect(branchStart).toBeGreaterThan(-1);
    expect(branchEnd).toBeGreaterThan(branchStart);
    const branch = source.slice(branchStart, branchEnd);
    expect(branch).toContain('localClaspEnergy = claspEnergy');
    expect(branch).toContain('subcoolData');
    expect(branch).toContain('regionsData');
    expect(branch).toContain('countriesData');
  });

  it('also assigns data in the API fallback branch', () => {
    // The else branch should still set all four from dashData
    const elseStart = source.indexOf('} else {', source.indexOf('if (claspEnergy.length > 0)'));
    const elseEnd   = source.indexOf('} catch (err)', elseStart);
    const elseBranch = source.slice(elseStart, elseEnd);
    expect(elseBranch).toContain('dashData.claspEnergy');
    expect(elseBranch).toContain('dashData.subcool');
    expect(elseBranch).toContain('dashData.regions');
    expect(elseBranch).toContain('dashData.countries');
  });
});

describe('EmissionsPillar — data props declared', () => {
  it('declares subcool as an export prop', () => {
    expect(source).toContain("export let subcool: any[] = []");
  });

  it('declares regions as an export prop', () => {
    expect(source).toContain("export let regions: any[] = []");
  });

  it('declares countries as an export prop', () => {
    expect(source).toContain("export let countries: any[] = []");
  });

  it('declares claspEnergy as an export prop', () => {
    expect(source).toContain("export let claspEnergy: any[] = []");
  });
});

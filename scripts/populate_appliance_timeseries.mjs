/**
 * Populate Supabase appliance_timeseries table
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=eyJ... node scripts/populate_appliance_timeseries.mjs
 *
 * Prerequisites:
 *   - Table created via: sql/create_appliance_timeseries.sql
 *   - Service role key (anon key is read-only)
 *
 * Data: 78 rows (3 appliances × 2 scenarios × 13 years)
 * Sources: IEA, CLASP, HEAT model
 */

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: Set SUPABASE_SERVICE_KEY environment variable');
  process.exit(1);
}

async function insertBatch(table, rows, batchSize = 50) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Insert failed (batch ${i / batchSize + 1}): ${res.status} ${err}`);
    }
    inserted += batch.length;
    console.log(`  ${table}: ${inserted}/${rows.length}`);
  }
  return inserted;
}

// ── AC BAU ────────────────────────────────────────────────────────────────────
const AC_BAU = [
  { year: 1990, stock_millions: 573,  energy_twh: 230,  indirect_emission_mt: 200,  direct_emission_mt: 180, total_emission_mt: 380,  is_projected: false, source: 'IEA + IPCC SROC',                                         source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 1995, stock_millions: 700,  energy_twh: 290,  indirect_emission_mt: 280,  direct_emission_mt: 200, total_emission_mt: 480,  is_projected: false, source: 'IEA + IPCC SROC',                                         source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2000, stock_millions: 850,  energy_twh: 350,  indirect_emission_mt: 350,  direct_emission_mt: 220, total_emission_mt: 570,  is_projected: false, source: 'IEA + IPCC SROC',                                         source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2005, stock_millions: 1050, energy_twh: 429,  indirect_emission_mt: 446,  direct_emission_mt: 240, total_emission_mt: 686,  is_projected: false, source: 'IEA stock / CLASP energy+indirect / Velders direct',       source_url: 'https://www.clasp.ngo/' },
  { year: 2010, stock_millions: 1200, energy_twh: 645,  indirect_emission_mt: 617,  direct_emission_mt: 270, total_emission_mt: 887,  is_projected: false, source: 'IEA stock / CLASP energy+indirect / Purohit direct',       source_url: 'https://www.clasp.ngo/' },
  { year: 2015, stock_millions: 1500, energy_twh: 990,  indirect_emission_mt: 880,  direct_emission_mt: 290, total_emission_mt: 1170, is_projected: false, source: 'IEA stock / CLASP energy+indirect / HEAT direct',          source_url: 'https://www.clasp.ngo/' },
  { year: 2020, stock_millions: 2000, energy_twh: 1422, indirect_emission_mt: 972,  direct_emission_mt: 314, total_emission_mt: 1286, is_projected: false, source: 'IEA stock / HEAT model BAU (indirect 972 + direct 314)',    source_url: 'https://ourworldindata.org/air-conditioning-causes-around-greenhouse-gas-emissions-will-change-future' },
  { year: 2025, stock_millions: 3100, energy_twh: 1972, indirect_emission_mt: 1338, direct_emission_mt: 403, total_emission_mt: 1741, is_projected: false, source: 'CLASP / HEAT model BAU',                                   source_url: 'https://www.clasp.ngo/' },
  { year: 2030, stock_millions: 4000, energy_twh: 2629, indirect_emission_mt: 2156, direct_emission_mt: 538, total_emission_mt: 2694, is_projected: true,  source: 'IEA stock / CLASP energy / HEAT model BAU',                source_url: 'https://www.clasp.ngo/' },
  { year: 2035, stock_millions: 4500, energy_twh: 3339, indirect_emission_mt: 3299, direct_emission_mt: 664, total_emission_mt: 3963, is_projected: true,  source: 'IEA stock / CLASP energy / HEAT model BAU',                source_url: 'https://www.clasp.ngo/' },
  { year: 2040, stock_millions: 5000, energy_twh: 4402, indirect_emission_mt: 3686, direct_emission_mt: 634, total_emission_mt: 4320, is_projected: true,  source: 'IEA stock / CLASP energy / HEAT model BAU',                source_url: 'https://www.clasp.ngo/' },
  { year: 2045, stock_millions: 5800, energy_twh: 5188, indirect_emission_mt: 4045, direct_emission_mt: 551, total_emission_mt: 4596, is_projected: true,  source: 'IEA stock / CLASP energy / HEAT model BAU',                source_url: 'https://www.clasp.ngo/' },
  { year: 2050, stock_millions: 6542, energy_twh: 6095, indirect_emission_mt: 4359, direct_emission_mt: 581, total_emission_mt: 4940, is_projected: true,  source: 'CLASP / HEAT model BAU',                                   source_url: 'https://www.clasp.ngo/' },
].map(r => ({ ...r, appliance_type: 'AC', scenario: 'BAU' }));

// ── AC DECARB ─────────────────────────────────────────────────────────────────
const AC_DECARB = [
  { year: 1990, stock_millions: 573,  energy_twh: 230,  indirect_emission_mt: 200,  direct_emission_mt: 180, total_emission_mt: 380,  is_projected: false, source: 'IEA + IPCC SROC',              source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 1995, stock_millions: 700,  energy_twh: 290,  indirect_emission_mt: 280,  direct_emission_mt: 200, total_emission_mt: 480,  is_projected: false, source: 'IEA + IPCC SROC',              source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2000, stock_millions: 850,  energy_twh: 350,  indirect_emission_mt: 350,  direct_emission_mt: 220, total_emission_mt: 570,  is_projected: false, source: 'IEA + IPCC SROC',              source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2005, stock_millions: 1050, energy_twh: 429,  indirect_emission_mt: 446,  direct_emission_mt: 240, total_emission_mt: 686,  is_projected: false, source: 'IEA stock / CLASP energy+indirect / Velders direct', source_url: 'https://www.clasp.ngo/' },
  { year: 2010, stock_millions: 1200, energy_twh: 645,  indirect_emission_mt: 617,  direct_emission_mt: 270, total_emission_mt: 887,  is_projected: false, source: 'IEA stock / CLASP energy+indirect / Purohit direct', source_url: 'https://www.clasp.ngo/' },
  { year: 2015, stock_millions: 1500, energy_twh: 990,  indirect_emission_mt: 880,  direct_emission_mt: 290, total_emission_mt: 1170, is_projected: false, source: 'IEA stock / CLASP energy+indirect / HEAT direct',   source_url: 'https://www.clasp.ngo/' },
  { year: 2020, stock_millions: 2000, energy_twh: 1422, indirect_emission_mt: 972,  direct_emission_mt: 314, total_emission_mt: 1286, is_projected: false, source: 'IEA stock / HEAT model BAU',    source_url: 'https://ourworldindata.org/air-conditioning-causes-around-greenhouse-gas-emissions-will-change-future' },
  { year: 2025, stock_millions: 3100, energy_twh: 1972, indirect_emission_mt: 1271, direct_emission_mt: 323, total_emission_mt: 1594, is_projected: false, source: 'CLASP / HEAT model DECARB',     source_url: 'https://www.clasp.ngo/' },
  { year: 2030, stock_millions: 4000, energy_twh: 2222, indirect_emission_mt: 1440, direct_emission_mt: 341, total_emission_mt: 1781, is_projected: true,  source: 'CLASP / HEAT model DECARB',     source_url: 'https://www.clasp.ngo/' },
  { year: 2035, stock_millions: 4500, energy_twh: 2584, indirect_emission_mt: 1640, direct_emission_mt: 368, total_emission_mt: 2008, is_projected: true,  source: 'CLASP / HEAT model DECARB',     source_url: 'https://www.clasp.ngo/' },
  { year: 2040, stock_millions: 5000, energy_twh: 3297, indirect_emission_mt: 1507, direct_emission_mt: 60,  total_emission_mt: 1567, is_projected: true,  source: 'CLASP / HEAT model DECARB',     source_url: 'https://www.clasp.ngo/' },
  { year: 2045, stock_millions: 5800, energy_twh: 3849, indirect_emission_mt: 1401, direct_emission_mt: 43,  total_emission_mt: 1444, is_projected: true,  source: 'CLASP / HEAT model DECARB',     source_url: 'https://www.clasp.ngo/' },
  { year: 2050, stock_millions: 6542, energy_twh: 4498, indirect_emission_mt: 1282, direct_emission_mt: 30,  total_emission_mt: 1312, is_projected: true,  source: 'CLASP / HEAT model DECARB',     source_url: 'https://www.clasp.ngo/' },
].map(r => ({ ...r, appliance_type: 'AC', scenario: 'DECARB' }));

// ── DomRef BAU ────────────────────────────────────────────────────────────────
const DOMREF_BAU = [
  { year: 1990, stock_millions: 650,  energy_twh: 360,  indirect_emission_mt: 250, direct_emission_mt: 25, total_emission_mt: 275, is_projected: false, source: 'IEA/LBNL + IPCC SROC',             source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 1995, stock_millions: 800,  energy_twh: 380,  indirect_emission_mt: 280, direct_emission_mt: 20, total_emission_mt: 300, is_projected: false, source: 'IEA/LBNL + IPCC SROC',             source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2000, stock_millions: 950,  energy_twh: 400,  indirect_emission_mt: 310, direct_emission_mt: 18, total_emission_mt: 328, is_projected: false, source: 'IEA/LBNL + IPCC SROC',             source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2005, stock_millions: 1065, energy_twh: 437,  indirect_emission_mt: 330, direct_emission_mt: 16, total_emission_mt: 346, is_projected: false, source: 'CLASP + IPCC/IEA',                 source_url: 'https://www.clasp.ngo/' },
  { year: 2010, stock_millions: 1403, energy_twh: 561,  indirect_emission_mt: 350, direct_emission_mt: 15, total_emission_mt: 365, is_projected: false, source: 'CLASP + IEA/HEAT',                 source_url: 'https://www.clasp.ngo/' },
  { year: 2015, stock_millions: 1855, energy_twh: 718,  indirect_emission_mt: 365, direct_emission_mt: 15, total_emission_mt: 380, is_projected: false, source: 'CLASP + HEAT model',               source_url: 'https://www.clasp.ngo/' },
  { year: 2020, stock_millions: 2284, energy_twh: 868,  indirect_emission_mt: 381, direct_emission_mt: 17, total_emission_mt: 397, is_projected: false, source: 'CLASP + HEAT Global Model BAU',     source_url: 'https://www.clasp.ngo/' },
  { year: 2025, stock_millions: 2684, energy_twh: 1012, indirect_emission_mt: 421, direct_emission_mt: 19, total_emission_mt: 440, is_projected: false, source: 'CLASP + HEAT model BAU',            source_url: 'https://www.clasp.ngo/' },
  { year: 2030, stock_millions: 3059, energy_twh: 1151, indirect_emission_mt: 477, direct_emission_mt: 23, total_emission_mt: 500, is_projected: true,  source: 'CLASP + HEAT model BAU',            source_url: 'https://www.clasp.ngo/' },
  { year: 2035, stock_millions: 3287, energy_twh: 1236, indirect_emission_mt: 501, direct_emission_mt: 23, total_emission_mt: 524, is_projected: true,  source: 'CLASP + HEAT model BAU',            source_url: 'https://www.clasp.ngo/' },
  { year: 2040, stock_millions: 3470, energy_twh: 1305, indirect_emission_mt: 530, direct_emission_mt: 21, total_emission_mt: 551, is_projected: true,  source: 'CLASP + HEAT model BAU',            source_url: 'https://www.clasp.ngo/' },
  { year: 2045, stock_millions: 3667, energy_twh: 1379, indirect_emission_mt: 578, direct_emission_mt: 21, total_emission_mt: 599, is_projected: true,  source: 'CLASP + HEAT model BAU',            source_url: 'https://www.clasp.ngo/' },
  { year: 2050, stock_millions: 3876, energy_twh: 1458, indirect_emission_mt: 629, direct_emission_mt: 20, total_emission_mt: 649, is_projected: true,  source: 'CLASP + HEAT model BAU',            source_url: 'https://www.clasp.ngo/' },
].map(r => ({ ...r, appliance_type: 'DomRef', scenario: 'BAU' }));

// ── DomRef DECARB ─────────────────────────────────────────────────────────────
const DOMREF_DECARB = [
  { year: 1990, stock_millions: 650,  energy_twh: 360,  indirect_emission_mt: 250, direct_emission_mt: 25, total_emission_mt: 275, is_projected: false, source: 'IEA/LBNL + IPCC SROC',      source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 1995, stock_millions: 800,  energy_twh: 380,  indirect_emission_mt: 280, direct_emission_mt: 20, total_emission_mt: 300, is_projected: false, source: 'IEA/LBNL + IPCC SROC',      source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2000, stock_millions: 950,  energy_twh: 400,  indirect_emission_mt: 310, direct_emission_mt: 18, total_emission_mt: 328, is_projected: false, source: 'IEA/LBNL + IPCC SROC',      source_url: 'https://www.iea.org/reports/the-future-of-cooling' },
  { year: 2005, stock_millions: 1065, energy_twh: 437,  indirect_emission_mt: 330, direct_emission_mt: 16, total_emission_mt: 346, is_projected: false, source: 'CLASP + IPCC/IEA',          source_url: 'https://www.clasp.ngo/' },
  { year: 2010, stock_millions: 1403, energy_twh: 561,  indirect_emission_mt: 350, direct_emission_mt: 15, total_emission_mt: 365, is_projected: false, source: 'CLASP + IEA/HEAT',          source_url: 'https://www.clasp.ngo/' },
  { year: 2015, stock_millions: 1855, energy_twh: 718,  indirect_emission_mt: 365, direct_emission_mt: 15, total_emission_mt: 380, is_projected: false, source: 'CLASP + HEAT model',        source_url: 'https://www.clasp.ngo/' },
  { year: 2020, stock_millions: 2284, energy_twh: 868,  indirect_emission_mt: 381, direct_emission_mt: 17, total_emission_mt: 397, is_projected: false, source: 'CLASP + HEAT Global Model BAU', source_url: 'https://www.clasp.ngo/' },
  { year: 2025, stock_millions: 2684, energy_twh: 1012, indirect_emission_mt: 400, direct_emission_mt: 19, total_emission_mt: 419, is_projected: false, source: 'CLASP / HEAT model DECARB',  source_url: 'https://www.clasp.ngo/' },
  { year: 2030, stock_millions: 3059, energy_twh: 1046, indirect_emission_mt: 347, direct_emission_mt: 21, total_emission_mt: 368, is_projected: true,  source: 'CLASP / HEAT model DECARB',  source_url: 'https://www.clasp.ngo/' },
  { year: 2035, stock_millions: 3287, energy_twh: 1036, indirect_emission_mt: 274, direct_emission_mt: 20, total_emission_mt: 294, is_projected: true,  source: 'CLASP / HEAT model DECARB',  source_url: 'https://www.clasp.ngo/' },
  { year: 2040, stock_millions: 3470, energy_twh: 1021, indirect_emission_mt: 230, direct_emission_mt: 17, total_emission_mt: 247, is_projected: true,  source: 'CLASP / HEAT model DECARB',  source_url: 'https://www.clasp.ngo/' },
  { year: 2045, stock_millions: 3667, energy_twh: 1020, indirect_emission_mt: 203, direct_emission_mt: 2,  total_emission_mt: 205, is_projected: true,  source: 'CLASP / HEAT model DECARB',  source_url: 'https://www.clasp.ngo/' },
  { year: 2050, stock_millions: 3876, energy_twh: 1037, indirect_emission_mt: 182, direct_emission_mt: 1,  total_emission_mt: 183, is_projected: true,  source: 'CLASP / HEAT model DECARB',  source_url: 'https://www.clasp.ngo/' },
].map(r => ({ ...r, appliance_type: 'DomRef', scenario: 'DECARB' }));

// ── Fans BAU ──────────────────────────────────────────────────────────────────
const FANS_BAU = [
  { year: 1990, stock_millions: 1600, energy_twh: 150, indirect_emission_mt: 80,  direct_emission_mt: 0, total_emission_mt: 80,  is_projected: false, source: 'LBNL/DOE estimate',              source_url: 'https://www.osti.gov/biblio/1172246' },
  { year: 1995, stock_millions: 1900, energy_twh: 175, indirect_emission_mt: 95,  direct_emission_mt: 0, total_emission_mt: 95,  is_projected: false, source: 'LBNL/DOE estimate',              source_url: 'https://www.osti.gov/biblio/1172246' },
  { year: 2000, stock_millions: 2150, energy_twh: 200, indirect_emission_mt: 110, direct_emission_mt: 0, total_emission_mt: 110, is_projected: false, source: 'LBNL/DOE estimate',              source_url: 'https://www.osti.gov/biblio/1172246' },
  { year: 2005, stock_millions: 2434, energy_twh: 232, indirect_emission_mt: 130, direct_emission_mt: 0, total_emission_mt: 130, is_projected: false, source: 'CLASP + LBNL/DOE',               source_url: 'https://www.clasp.ngo/' },
  { year: 2010, stock_millions: 2720, energy_twh: 261, indirect_emission_mt: 150, direct_emission_mt: 0, total_emission_mt: 150, is_projected: false, source: 'CLASP + LBNL/DOE',               source_url: 'https://www.clasp.ngo/' },
  { year: 2015, stock_millions: 3044, energy_twh: 298, indirect_emission_mt: 175, direct_emission_mt: 0, total_emission_mt: 175, is_projected: false, source: 'CLASP + IEA/LBNL',               source_url: 'https://www.clasp.ngo/' },
  { year: 2020, stock_millions: 3415, energy_twh: 344, indirect_emission_mt: 190, direct_emission_mt: 0, total_emission_mt: 190, is_projected: false, source: 'CLASP + IEA/LBNL',               source_url: 'https://www.iea.org/energy-system/buildings/space-cooling' },
  { year: 2025, stock_millions: 3819, energy_twh: 396, indirect_emission_mt: 220, direct_emission_mt: 0, total_emission_mt: 220, is_projected: false, source: 'CLASP + IEA/LBNL projection',    source_url: 'https://www.clasp.ngo/' },
  { year: 2030, stock_millions: 4146, energy_twh: 439, indirect_emission_mt: 260, direct_emission_mt: 0, total_emission_mt: 260, is_projected: true,  source: 'CLASP + IEA/LBNL projection',    source_url: 'https://www.clasp.ngo/' },
  { year: 2035, stock_millions: 4378, energy_twh: 469, indirect_emission_mt: 300, direct_emission_mt: 0, total_emission_mt: 300, is_projected: true,  source: 'CLASP + IEA/LBNL projection',    source_url: 'https://www.clasp.ngo/' },
  { year: 2040, stock_millions: 4545, energy_twh: 489, indirect_emission_mt: 340, direct_emission_mt: 0, total_emission_mt: 340, is_projected: true,  source: 'CLASP + IEA/LBNL projection',    source_url: 'https://www.clasp.ngo/' },
  { year: 2045, stock_millions: 4708, energy_twh: 509, indirect_emission_mt: 380, direct_emission_mt: 0, total_emission_mt: 380, is_projected: true,  source: 'CLASP + IEA/LBNL projection',    source_url: 'https://www.clasp.ngo/' },
  { year: 2050, stock_millions: 4871, energy_twh: 529, indirect_emission_mt: 420, direct_emission_mt: 0, total_emission_mt: 420, is_projected: true,  source: 'CLASP + IEA/LBNL projection',    source_url: 'https://www.clasp.ngo/' },
].map(r => ({ ...r, appliance_type: 'Fans', scenario: 'BAU' }));

// ── Fans DECARB ───────────────────────────────────────────────────────────────
const FANS_DECARB = [
  { year: 1990, stock_millions: 1600, energy_twh: 150, indirect_emission_mt: 80,  direct_emission_mt: 0, total_emission_mt: 80,  is_projected: false, source: 'LBNL/DOE estimate',           source_url: 'https://www.osti.gov/biblio/1172246' },
  { year: 1995, stock_millions: 1900, energy_twh: 175, indirect_emission_mt: 95,  direct_emission_mt: 0, total_emission_mt: 95,  is_projected: false, source: 'LBNL/DOE estimate',           source_url: 'https://www.osti.gov/biblio/1172246' },
  { year: 2000, stock_millions: 2150, energy_twh: 200, indirect_emission_mt: 110, direct_emission_mt: 0, total_emission_mt: 110, is_projected: false, source: 'LBNL/DOE estimate',           source_url: 'https://www.osti.gov/biblio/1172246' },
  { year: 2005, stock_millions: 2434, energy_twh: 232, indirect_emission_mt: 103, direct_emission_mt: 0, total_emission_mt: 103, is_projected: false, source: 'CLASP + LBNL/DOE',            source_url: 'https://www.clasp.ngo/' },
  { year: 2010, stock_millions: 2720, energy_twh: 261, indirect_emission_mt: 112, direct_emission_mt: 0, total_emission_mt: 112, is_projected: false, source: 'CLASP + LBNL/DOE',            source_url: 'https://www.clasp.ngo/' },
  { year: 2015, stock_millions: 3044, energy_twh: 298, indirect_emission_mt: 126, direct_emission_mt: 0, total_emission_mt: 126, is_projected: false, source: 'CLASP + IEA/LBNL',            source_url: 'https://www.clasp.ngo/' },
  { year: 2020, stock_millions: 3415, energy_twh: 344, indirect_emission_mt: 147, direct_emission_mt: 0, total_emission_mt: 147, is_projected: false, source: 'CLASP + IEA/LBNL',            source_url: 'https://www.iea.org/energy-system/buildings/space-cooling' },
  { year: 2025, stock_millions: 3819, energy_twh: 396, indirect_emission_mt: 164, direct_emission_mt: 0, total_emission_mt: 164, is_projected: false, source: 'CLASP / HEAT model DECARB',   source_url: 'https://www.clasp.ngo/' },
  { year: 2030, stock_millions: 4146, energy_twh: 392, indirect_emission_mt: 134, direct_emission_mt: 0, total_emission_mt: 134, is_projected: true,  source: 'CLASP / HEAT model DECARB',   source_url: 'https://www.clasp.ngo/' },
  { year: 2035, stock_millions: 4378, energy_twh: 395, indirect_emission_mt: 107, direct_emission_mt: 0, total_emission_mt: 107, is_projected: true,  source: 'CLASP / HEAT model DECARB',   source_url: 'https://www.clasp.ngo/' },
  { year: 2040, stock_millions: 4545, energy_twh: 400, indirect_emission_mt: 87,  direct_emission_mt: 0, total_emission_mt: 87,  is_projected: true,  source: 'CLASP / HEAT model DECARB',   source_url: 'https://www.clasp.ngo/' },
  { year: 2045, stock_millions: 4708, energy_twh: 413, indirect_emission_mt: 72,  direct_emission_mt: 0, total_emission_mt: 72,  is_projected: true,  source: 'CLASP / HEAT model DECARB',   source_url: 'https://www.clasp.ngo/' },
  { year: 2050, stock_millions: 4871, energy_twh: 428, indirect_emission_mt: 59,  direct_emission_mt: 0, total_emission_mt: 59,  is_projected: true,  source: 'CLASP / HEAT model DECARB',   source_url: 'https://www.clasp.ngo/' },
].map(r => ({ ...r, appliance_type: 'Fans', scenario: 'DECARB' }));

const ALL_ROWS = [...AC_BAU, ...AC_DECARB, ...DOMREF_BAU, ...DOMREF_DECARB, ...FANS_BAU, ...FANS_DECARB];

async function main() {
  console.log(`Populating appliance_timeseries (${ALL_ROWS.length} rows)...`);
  const count = await insertBatch('appliance_timeseries', ALL_ROWS);
  console.log(`Done: ${count} rows inserted into appliance_timeseries`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

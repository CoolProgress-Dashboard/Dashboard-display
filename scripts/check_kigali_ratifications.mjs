/**
 * Check (and optionally sync) Kigali Amendment ratification status against
 * the UNEP Ozone Secretariat.
 *
 * Compares https://ozone.unep.org/all-ratifications with the Supabase `kip`
 * table (kigali_party flag) and reports any differences.
 *
 * Usage:
 *   node scripts/check_kigali_ratifications.mjs           # report only (anon key from .env)
 *   SUPABASE_SERVICE_KEY=eyJ... node scripts/check_kigali_ratifications.mjs --fix
 *                                                         # also set kigali_party=1 for
 *                                                         # countries UNEP lists as ratified
 *
 * Run this periodically (e.g. monthly) or when UNEP announces a new
 * ratification. The dashboard stat derives its count live from the kip table,
 * so updating the table updates the dashboard. Remember to also bump the
 * hardcoded fallback in KigaliPillar.svelte (used only before data loads).
 *
 * Feedback item: KI-11.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const UNEP_URL = 'https://ozone.unep.org/all-ratifications';
const FIX = process.argv.includes('--fix');

function anonKeyFromEnvFile() {
  try {
    const env = readFileSync(join(__dirname, '..', '.env'), 'utf-8');
    const m = env.match(/^PUBLIC_SUPABASE_ANON_KEY=(.+)$/m);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || null;
const READ_KEY = SERVICE_KEY || anonKeyFromEnvFile();
if (!READ_KEY) {
  console.error('Error: no Supabase key (set SUPABASE_SERVICE_KEY or keep PUBLIC_SUPABASE_ANON_KEY in .env)');
  process.exit(1);
}
if (FIX && !SERVICE_KEY) {
  console.error('Error: --fix requires SUPABASE_SERVICE_KEY (anon key cannot write)');
  process.exit(1);
}

const sbHeaders = (key) => ({ apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' });

// UNEP country names that do not fuzzy-match the dashboard `countries` table.
// Extend this map if the report lists unmatched names.
const NAME_ALIASES = {
  'bolivia (plurinational state of)': 'BOL',
  'iran (islamic republic of)': 'IRN',
  'micronesia (federated states of)': 'FSM',
  'venezuela (bolivarian republic of)': 'VEN',
  'democratic people’s republic of korea': 'PRK',
  "democratic people's republic of korea": 'PRK',
  'republic of korea': 'KOR',
  'lao people’s democratic republic': 'LAO',
  "lao people's democratic republic": 'LAO',
  'republic of moldova': 'MDA',
  'russian federation': 'RUS',
  'syrian arab republic': 'SYR',
  'united republic of tanzania': 'TZA',
  'united states of america': 'USA',
  'united kingdom of great britain and northern ireland': 'GBR',
  'viet nam': 'VNM',
  'brunei darussalam': 'BRN',
  'cabo verde': 'CPV',
  'côte d’ivoire': 'CIV',
  "côte d'ivoire": 'CIV',
  'czechia': 'CZE',
  'türkiye': 'TUR',
  'turkiye': 'TUR',
  'european union': 'EUN',
  'netherlands (kingdom of the)': 'NLD',
  'state of palestine': 'PSE',
  'holy see': 'VAT',
  'eswatini': 'SWZ',
  'north macedonia': 'MKD',
  'the former yugoslav republic of macedonia': 'MKD',
};

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

async function fetchUnepRatifications() {
  const res = await fetch(UNEP_URL, { headers: { 'User-Agent': 'CoolProgress-Dashboard ratification check' } });
  if (!res.ok) throw new Error(`UNEP fetch failed: ${res.status}`);
  const html = await res.text();

  // Rows: first <td> = country, 10th <td> = Kigali Amendment cell.
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
  const parties = [];
  let totalsRowCount = null;
  for (const row of rows) {
    const cells = [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) =>
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    );
    if (cells.length < 10) continue;
    const name = cells[0].replace(/\d+$/, '').trim(); // strip footnote digits
    const kigaliCell = cells[9];
    if (name === 'Totals') {
      const n = parseInt(kigaliCell, 10);
      if (!Number.isNaN(n)) totalsRowCount = n;
      continue;
    }
    const ratified = /\d{4}-\d{2}-\d{2}/.test(kigaliCell);
    parties.push({ name, ratified, date: ratified ? kigaliCell.match(/\d{4}-\d{2}-\d{2}/)[0] : null });
  }
  if (parties.length < 150) throw new Error(`UNEP page parse suspicious: only ${parties.length} rows found (layout changed?)`);
  return { parties, totalsRowCount };
}

async function fetchSupabase(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders(READ_KEY) });
  if (!res.ok) throw new Error(`Supabase fetch ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  console.log('Fetching UNEP Ozone Secretariat ratification table...');
  const { parties, totalsRowCount } = await fetchUnepRatifications();
  const unepRatified = parties.filter((p) => p.ratified);
  console.log(`UNEP: ${unepRatified.length} Kigali parties (page totals row: ${totalsRowCount ?? 'n/a'})`);

  console.log('Fetching Supabase kip + countries tables...');
  const kip = await fetchSupabase('kip?select=country_code,kigali_party&limit=1000');
  const countries = await fetchSupabase('countries?select=country_code,country_name&limit=1000');
  const dbCount = kip.filter((k) => k.kigali_party === 1).length;
  console.log(`Supabase kip: ${dbCount} rows with kigali_party=1 (of ${kip.length})`);

  // Duplicate rows inflate the dashboard count silently (found once: KOR twice).
  const codeCounts = new Map();
  for (const k of kip) codeCounts.set(k.country_code, (codeCounts.get(k.country_code) ?? 0) + 1);
  const dupes = [...codeCounts.entries()].filter(([, n]) => n > 1);
  if (dupes.length) {
    console.log(`\nDUPLICATE country_code rows in kip (fix manually): ${dupes.map(([c, n]) => `${c} x${n}`).join(', ')}`);
  }

  // Map UNEP names to ISO3 via aliases first, then the countries table.
  const byName = new Map(countries.map((c) => [normalize(c.country_name), c.country_code]));
  const kipByCode = new Map(kip.map((k) => [k.country_code, k.kigali_party]));

  const unmatched = [];
  const missingInDb = []; // UNEP ratified, kip says 0 or absent
  const extraInDb = new Set(kip.filter((k) => k.kigali_party === 1).map((k) => k.country_code));

  for (const p of unepRatified) {
    const code = NAME_ALIASES[p.name.toLowerCase()] || byName.get(normalize(p.name));
    if (!code) {
      unmatched.push(p.name);
      continue;
    }
    extraInDb.delete(code);
    if (kipByCode.get(code) !== 1) missingInDb.push({ code, name: p.name, date: p.date });
  }

  if (unmatched.length) {
    console.log(`\nUnmatched UNEP names (extend NAME_ALIASES): ${unmatched.join('; ')}`);
  }
  if (missingInDb.length) {
    console.log('\nRatified per UNEP but NOT flagged in kip table:');
    for (const m of missingInDb) console.log(`  ${m.code}  ${m.name}  (ratified ${m.date})`);
  }
  if (extraInDb.size) {
    console.log(`\nFlagged kigali_party=1 in kip but not matched to a UNEP ratification: ${[...extraInDb].join(', ')}`);
    console.log('(Check aliases before assuming these are wrong.)');
  }
  if (!missingInDb.length && !extraInDb.size && !unmatched.length) {
    console.log('\nIn sync: kip table matches UNEP.');
  }

  if (FIX && missingInDb.length) {
    console.log('\nApplying fixes (kigali_party=1)...');
    for (const m of missingInDb) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/kip?country_code=eq.${m.code}`, {
        method: 'PATCH',
        headers: { ...sbHeaders(SERVICE_KEY), Prefer: 'return=minimal' },
        body: JSON.stringify({ kigali_party: 1 }),
      });
      console.log(`  ${m.code}: ${res.ok ? 'updated' : `FAILED ${res.status}`}`);
    }
    console.log('Done. Also update the fallback count in KigaliPillar.svelte if it changed.');
  } else if (missingInDb.length) {
    console.log('\nRun with --fix and SUPABASE_SERVICE_KEY to apply.');
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

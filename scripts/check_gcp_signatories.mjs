/**
 * Check (and optionally sync) Global Cooling Pledge signatories against the
 * Cool Coalition website.
 *
 * Sources parsed:
 *   1. https://coolcoalition.org/members — the Country facet of the members
 *      directory lists the national-government signatories (city-only
 *      countries do not appear in it).
 *   2. https://coolcoalition.org/global-cooling-pledge/ — the "NN countries"
 *      banner, used as a count cross-check.
 *
 * Compares with the Supabase `global_cooling_pledge` table (signatory flag).
 * The dashboard derives all displayed counts from that table, never from the
 * website at runtime (feedback PO-13).
 *
 * Usage:
 *   node scripts/check_gcp_signatories.mjs           # report only
 *   SUPABASE_SERVICE_KEY=eyJ... node scripts/check_gcp_signatories.mjs --fix
 *
 * Run periodically or when new signatories are announced.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const MEMBERS_URL = 'https://coolcoalition.org/members';
const PLEDGE_URL = 'https://coolcoalition.org/global-cooling-pledge/';
const UA = 'CoolProgress-Dashboard signatory check';
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
  console.error('Error: no Supabase key available');
  process.exit(1);
}
if (FIX && !SERVICE_KEY) {
  console.error('Error: --fix requires SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const sbHeaders = (key) => ({ apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' });

// Cool Coalition names that do not fuzzy-match the dashboard countries table.
const NAME_ALIASES = {
  'micronesia': 'FSM',
  'czech republic': 'CZE',
  'czechia': 'CZE',
  'vietnam': 'VNM',
  'viet nam': 'VNM',
  "côte d'ivoire": 'CIV',
  'côte d’ivoire': 'CIV',
  'cote divoire': 'CIV',
  'united states of america': 'USA',
  'united states': 'USA',
  'united kingdom': 'GBR',
  'syrian arab republic': 'SYR',
  'cabo verde': 'CPV',
  'north macedonia': 'MKD',
  'brunei darussalam': 'BRN',
  'kyrgyzstan': 'KGZ',
  'bahamas': 'BHS',
  'the bahamas': 'BHS',
  'eswatini': 'SWZ',
  'türkiye': 'TUR',
  // Site typo in the members facet, kept verbatim
  'antigua and barbudas': 'ATG',
};

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

async function fetchSignatoryNames() {
  const res = await fetch(MEMBERS_URL, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`members page fetch failed: ${res.status}`);
  const html = await res.text();
  // The Country facet select of the members directory
  const selectMatch = html.match(/<select[^>]*name="country\[\]"[^>]*>([\s\S]*?)<\/select>/);
  if (!selectMatch) throw new Error('country facet select not found (page layout changed?)');
  const decode = (s) =>
    s
      .replace(/&#0?39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));
  const names = [...selectMatch[1].matchAll(/<option[^>]*>([^<]+)<\/option>/g)]
    .map((m) => decode(m[1].trim()))
    .filter((n) => n && n !== '- Any -');
  if (names.length < 50) throw new Error(`suspiciously few countries parsed (${names.length})`);
  return names;
}

async function fetchBannerCount() {
  try {
    const res = await fetch(PLEDGE_URL, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.replace(/<[^>]+>/g, ' ').match(/(\d{2,3})\s*countries/i);
    return m ? parseInt(m[1], 10) : null;
  } catch {
    return null;
  }
}

async function fetchSupabase(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders(READ_KEY) });
  if (!res.ok) throw new Error(`Supabase fetch ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  console.log('Fetching Cool Coalition members directory...');
  const names = await fetchSignatoryNames();
  const bannerCount = await fetchBannerCount();
  console.log(`Cool Coalition: ${names.length} national signatories in members directory` +
    (bannerCount ? ` (pledge page banner: ${bannerCount} countries)` : ''));

  console.log('Fetching Supabase global_cooling_pledge + countries...');
  const pledge = await fetchSupabase('global_cooling_pledge?select=country_code,country_name,signatory&limit=1000');
  const countries = await fetchSupabase('countries?select=country_code,country_name&limit=1000');
  const dbCount = pledge.filter((p) => p.signatory === 1).length;
  console.log(`Supabase: ${dbCount} rows with signatory=1 (of ${pledge.length})`);

  const byName = new Map(countries.map((c) => [normalize(c.country_name), c.country_code]));
  // Also match against the pledge table's own names as a fallback
  pledge.forEach((p) => {
    if (p.country_name && !byName.has(normalize(p.country_name))) {
      byName.set(normalize(p.country_name), p.country_code);
    }
  });
  const pledgeByCode = new Map(pledge.map((p) => [p.country_code, p.signatory]));

  const unmatched = [];
  const missingInDb = [];
  const extraInDb = new Set(pledge.filter((p) => p.signatory === 1).map((p) => p.country_code));

  for (const name of names) {
    const code = NAME_ALIASES[name.toLowerCase()] || byName.get(normalize(name));
    if (!code) {
      unmatched.push(name);
      continue;
    }
    extraInDb.delete(code);
    if (pledgeByCode.get(code) !== 1) {
      missingInDb.push({ code, name, exists: pledgeByCode.has(code) });
    }
  }

  if (unmatched.length) console.log(`\nUnmatched names (extend NAME_ALIASES): ${unmatched.join('; ')}`);
  if (missingInDb.length) {
    console.log('\nSignatory on the Cool Coalition site but NOT flagged in the table:');
    for (const m of missingInDb) console.log(`  ${m.code}  ${m.name}${m.exists ? '' : '  (row missing entirely)'}`);
  }
  if (extraInDb.size) {
    console.log(`\nFlagged signatory=1 in the table but not on the site: ${[...extraInDb].join(', ')}`);
    console.log('(Check aliases before assuming these are wrong.)');
  }
  if (!missingInDb.length && !extraInDb.size && !unmatched.length) console.log('\nIn sync.');

  if (FIX && missingInDb.length) {
    console.log('\nApplying fixes (signatory=1)...');
    for (const m of missingInDb.filter((x) => x.exists)) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/global_cooling_pledge?country_code=eq.${m.code}`, {
        method: 'PATCH',
        headers: { ...sbHeaders(SERVICE_KEY), Prefer: 'return=minimal' },
        body: JSON.stringify({ signatory: 1 }),
      });
      console.log(`  ${m.code}: ${res.ok ? 'updated' : `FAILED ${res.status}`}`);
    }
    const inserts = missingInDb.filter((x) => !x.exists);
    if (inserts.length) console.log(`Rows missing entirely, insert manually with correct names: ${inserts.map((x) => x.code).join(', ')}`);
  } else if (missingInDb.length) {
    console.log('\nRun with --fix and SUPABASE_SERVICE_KEY to apply.');
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

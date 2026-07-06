/**
 * Populate Supabase meps_level_timeline_v2 via REST API
 *
 * Usage: node sql/populate_meps_v2.mjs
 *
 * Prerequisites:
 *   - Table created via sql/create_meps_timeline_v2.sql (Supabase SQL editor)
 *   - Supabase service role key set as SUPABASE_SERVICE_KEY env var
 *     (anon key only allows reads; inserts require service role)
 *
 * Idempotent: deletes all existing rows in meps_level_timeline_v2 first,
 * then inserts the current content of src/lib/data/meps_timeline_v2.json.
 * The v1 table (meps_level_timeline) is never touched.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const TABLE = 'meps_level_timeline_v2';

if (!SUPABASE_KEY) {
  console.error('Error: Set SUPABASE_SERVICE_KEY or SUPABASE_KEY environment variable');
  console.error('  Get it from: Supabase dashboard, Project Settings, API, service_role key');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`
};

async function clearTable() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=gte.0`, {
    method: 'DELETE',
    headers: { ...headers, Prefer: 'return=minimal' }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to clear ${TABLE}: ${response.status} ${errorText}`);
  }
  console.log(`Cleared existing rows in ${TABLE}`);
}

async function insertBatch(rows) {
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}`;
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify(batch)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to insert into ${TABLE} (batch ${i / batchSize + 1}): ${response.status} ${errorText}`);
    }
    inserted += batch.length;
    console.log(`  ${TABLE}: inserted ${inserted}/${rows.length}`);
  }

  return inserted;
}

async function main() {
  const jsonPath = join(__dirname, '..', 'src', 'lib', 'data', 'meps_timeline_v2.json');
  const timeline = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${timeline.length} timeline records from meps_timeline_v2.json`);

  const rows = timeline.map((row) => ({
    country_code: row.country_code,
    country_name: row.country_name,
    appliance_type: row.appliance_type,
    year: row.year,
    meps_level_national: row.meps_level_national,
    metric_name: row.metric_name,
    meps_level_cspf_equiv: row.meps_level_cspf_equiv,
    standard_version: row.standard_version,
    is_projected: row.is_projected,
    source: row.source,
    status: row.status,
    conversion: row.conversion,
    conversion_source: row.conversion_source,
    source_url: row.source_url,
    notes: row.notes
  }));

  await clearTable();
  const inserted = await insertBatch(rows);

  // Verification read-back
  const check = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=appliance_type&limit=1000`, { headers });
  const all = await check.json();
  const ac = all.filter((r) => r.appliance_type === 'AC').length;
  const fr = all.filter((r) => r.appliance_type === 'Refrigerator').length;
  console.log(`\nDone. Inserted ${inserted} records. Read-back: ${all.length} total (${ac} AC, ${fr} Refrigerator).`);
  if (all.length !== timeline.length) {
    console.error('WARNING: read-back count does not match source JSON');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

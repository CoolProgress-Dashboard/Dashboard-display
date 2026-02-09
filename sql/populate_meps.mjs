/**
 * Populate Supabase MEPS tables via REST API
 *
 * Usage: node populate_meps.mjs
 *
 * Prerequisites:
 *   - Tables created via SQL scripts (create_meps_levels.sql, create_meps_timeline.sql)
 *   - Supabase service role key set as SUPABASE_SERVICE_KEY env var
 *     (anon key only allows reads; inserts require service role)
 *
 * Example:
 *   SUPABASE_SERVICE_KEY=eyJ... node populate_meps.mjs
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: Set SUPABASE_SERVICE_KEY or SUPABASE_KEY environment variable');
  process.exit(1);
}

async function insertBatch(table, rows) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(batch)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to insert into ${table} (batch ${i / batchSize + 1}): ${response.status} ${errorText}`);
    }
    inserted += batch.length;
    console.log(`  ${table}: inserted ${inserted}/${rows.length}`);
  }

  return inserted;
}

async function main() {
  console.log('Reading JSON data files...');

  const levelsPath = join(__dirname, '..', 'data', 'meps_levels.json');
  const timelinePath = join(__dirname, '..', 'data', 'meps_timeline.json');

  const levels = JSON.parse(readFileSync(levelsPath, 'utf-8'));
  const timeline = JSON.parse(readFileSync(timelinePath, 'utf-8'));

  console.log(`Loaded ${levels.length} MEPS level records`);
  console.log(`Loaded ${timeline.length} timeline records`);

  // Transform levels: map JSON keys to DB column names (they match)
  const levelRows = levels.map(row => ({
    country_code: row.country_code,
    country_name: row.country_name,
    appliance_type: row.appliance_type,
    metric_name: row.metric_name,
    metric_value: row.metric_value,
    cspf_equivalent: row.cspf_equivalent,
    year_adopted: row.year_adopted,
    year_revised: row.year_revised,
    year_planned_update: row.year_planned_update,
    is_mandatory: row.is_mandatory,
    standard_name: row.standard_name,
    requirement_level: row.requirement_level,
    notes: row.notes,
    u4e_recommended: row.u4e_recommended
  }));

  // Transform timeline
  const timelineRows = timeline.map(row => ({
    country_code: row.country_code,
    country_name: row.country_name,
    appliance_type: row.appliance_type,
    year: row.year,
    meps_level_national: row.meps_level_national,
    metric_name: row.metric_name,
    meps_level_cspf_equiv: row.meps_level_cspf_equiv,
    standard_version: row.standard_version,
    is_projected: row.is_projected,
    source: row.source
  }));

  console.log('\nInserting MEPS levels...');
  const levelsInserted = await insertBatch('meps_levels', levelRows);

  console.log('\nInserting MEPS timeline...');
  const timelineInserted = await insertBatch('meps_level_timeline', timelineRows);

  console.log(`\nDone. Inserted ${levelsInserted} level records and ${timelineInserted} timeline records.`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

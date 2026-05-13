/**
 * Populate Supabase cooling_milestones table
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=eyJ... node scripts/populate_cooling_milestones.mjs
 *
 * Prerequisites:
 *   - Table created via: sql/create_cooling_milestones.sql
 *   - Service role key (anon key is read-only)
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

const ROWS = [
  {
    year: 1987,
    label: 'Montreal Protocol',
    description: 'International treaty to phase out ozone-depleting substances (CFCs, HCFCs) used as refrigerants. Ratified by 198 parties.',
    appliance_type: null,
  },
  {
    year: 2016,
    label: 'Kigali Amendment',
    description: 'Amendment to the Montreal Protocol to phase down hydrofluorocarbons (HFCs) by 80-85% by 2047. Could avoid 0.5 degrees C warming by 2100.',
    appliance_type: null,
  },
  {
    year: 2018,
    label: 'IEA Future of Cooling',
    description: 'Landmark IEA report projecting global AC stock to reach 5.6 billion by 2050, warning cooling energy demand could triple without action.',
    appliance_type: 'AC',
  },
  {
    year: 2023,
    label: 'COP28 Global Cooling Pledge',
    description: '66 nations signed the Global Cooling Pledge at COP28 Dubai, committing to reduce cooling-related emissions 68% by 2050 and raise AC efficiency 50%.',
    appliance_type: null,
  },
  {
    year: 2025,
    label: '3 Billion ACs',
    description: 'Global AC stock surpassed 3 billion units — 3,099 million units installed worldwide.',
    appliance_type: 'AC',
  },
];

async function main() {
  console.log('Populating cooling_milestones...');
  const count = await insertBatch('cooling_milestones', ROWS);
  console.log(`Done: ${count} rows inserted into cooling_milestones`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

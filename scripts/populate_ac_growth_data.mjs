/**
 * Populate Supabase ac_growth_data table
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=eyJ... node scripts/populate_ac_growth_data.mjs
 *
 * Prerequisites:
 *   - Table created via: sql/create_ac_growth_data.sql
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
  { year: 1990, stock_millions: 573,  is_projected: false, source: 'CCC / IEA: 573.49M units in 1990' },
  { year: 1995, stock_millions: 700,  is_projected: false, source: 'IEA Future of Cooling, interpolated' },
  { year: 2000, stock_millions: 850,  is_projected: false, source: 'IEA Future of Cooling' },
  { year: 2005, stock_millions: 1050, is_projected: false, source: 'IEA Future of Cooling, interpolated' },
  { year: 2010, stock_millions: 1200, is_projected: false, source: 'IEA Future of Cooling' },
  { year: 2015, stock_millions: 1500, is_projected: false, source: 'IEA Future of Cooling' },
  { year: 2020, stock_millions: 2000, is_projected: false, source: 'IEA: "1.6 billion" circa 2018, ~2B by 2020' },
  { year: 2025, stock_millions: 3100, is_projected: false, source: 'CCC: ~3.1B units (2024/25 boundary)' },
  { year: 2030, stock_millions: 4000, is_projected: true,  source: 'IEA baseline scenario' },
  { year: 2035, stock_millions: 4500, is_projected: true,  source: 'IEA baseline scenario, interpolated' },
  { year: 2040, stock_millions: 5000, is_projected: true,  source: 'IEA baseline scenario' },
  { year: 2045, stock_millions: 5800, is_projected: true,  source: 'IEA baseline scenario, interpolated' },
  { year: 2050, stock_millions: 6542, is_projected: true,  source: 'CCC: 6,542.38M units projected for 2050' },
];

async function main() {
  console.log('Populating ac_growth_data...');
  const count = await insertBatch('ac_growth_data', ROWS);
  console.log(`Done: ${count} rows inserted into ac_growth_data`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

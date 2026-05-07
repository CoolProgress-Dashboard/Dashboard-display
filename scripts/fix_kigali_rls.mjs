/**
 * fix_kigali_rls.mjs
 *
 * Adds the missing Row Level Security policies to the two Kigali schedule tables
 * so the browser (anon key) can read them.
 *
 * Run with:
 *   node scripts/fix_kigali_rls.mjs
 */

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: Set SUPABASE_SERVICE_KEY environment variable.');
  console.error('Usage: SUPABASE_SERVICE_KEY=eyJ... node scripts/fix_kigali_rls.mjs');
  process.exit(1);
}

const SQL = `
  -- Enable RLS and add anon-read policy on both Kigali schedule tables
  ALTER TABLE kigali_group_schedules ENABLE ROW LEVEL SECURITY;
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename='kigali_group_schedules' AND policyname='Allow anon reads'
    ) THEN
      CREATE POLICY "Allow anon reads" ON kigali_group_schedules FOR SELECT USING (true);
    END IF;
  END $$;

  ALTER TABLE kigali_country_schedule_overrides ENABLE ROW LEVEL SECURITY;
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename='kigali_country_schedule_overrides' AND policyname='Allow anon reads'
    ) THEN
      CREATE POLICY "Allow anon reads" ON kigali_country_schedule_overrides FOR SELECT USING (true);
    END IF;
  END $$;
`;

async function runSQL() {
  console.log('Applying RLS policies to Kigali schedule tables...');

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql: SQL })
  });

  if (res.ok) {
    console.log('✓ RLS policies applied via rpc/exec_sql');
    return true;
  }

  // Fallback: try the pg endpoint
  const res2 = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: SQL })
  });

  if (res2.ok) {
    console.log('✓ RLS policies applied via pg/query');
    return true;
  }

  const err = await res2.text().catch(() => '');
  console.error('✗ Both endpoints failed.');
  console.error('  Manual fix: run the following in Supabase SQL Editor:\n');
  console.error(`  ALTER TABLE kigali_group_schedules ENABLE ROW LEVEL SECURITY;`);
  console.error(`  CREATE POLICY "Allow anon reads" ON kigali_group_schedules FOR SELECT USING (true);`);
  console.error(`  ALTER TABLE kigali_country_schedule_overrides ENABLE ROW LEVEL SECURITY;`);
  console.error(`  CREATE POLICY "Allow anon reads" ON kigali_country_schedule_overrides FOR SELECT USING (true);`);
  return false;
}

async function verifyRead(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
    headers: {
      // Use anon key to simulate browser read — extract from service key if same, else test as-is
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  if (res.ok) {
    const rows = await res.json();
    console.log(`  ${table}: readable, ${rows.length} row(s) returned`);
    return true;
  }
  console.log(`  ${table}: NOT readable (${res.status})`);
  return false;
}

async function main() {
  const ok = await runSQL();
  console.log('\nVerifying reads...');
  await verifyRead('kigali_group_schedules');
  await verifyRead('kigali_country_schedule_overrides');
  if (!ok) process.exit(1);
}

main();
